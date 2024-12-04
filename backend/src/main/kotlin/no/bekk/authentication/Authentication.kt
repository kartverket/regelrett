package no.bekk.authentication

import com.auth0.jwk.JwkProviderBuilder
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.response.*
import no.bekk.configuration.*
import no.bekk.database.ContextRepository
import no.bekk.domain.MicrosoftGraphGroup
import no.bekk.domain.MicrosoftGraphUser
import no.bekk.services.MicrosoftService
import java.net.URI
import java.util.concurrent.TimeUnit

fun Application.initializeAuthentication() {
    val issuer = AppConfig.oAuth.getIssuer()
    val clientId = AppConfig.oAuth.clientId
    val jwksUri = AppConfig.oAuth.getJwksUrl()

    val jwkProvider = JwkProviderBuilder(URI(jwksUri).toURL())
        .cached(10, 24, TimeUnit.HOURS)
        .rateLimited(10, 1, TimeUnit.MINUTES)
        .build()

    install(Authentication) {
        jwt("auth-jwt") {
            verifier(jwkProvider, issuer) {
                withIssuer(issuer)
                acceptLeeway(3)
                withAudience(clientId)
            }
            validate { jwtCredential ->
                if (jwtCredential.audience.contains(clientId)) JWTPrincipal(jwtCredential.payload) else null
            }
            challenge { _, _ ->
                call.respond(HttpStatusCode.Unauthorized, "You are unauthenticated")
            }
        }
    }
}

suspend fun getGroupsOrEmptyList(call: ApplicationCall): List<MicrosoftGraphGroup> {
    val jwtToken = call.request.headers["Authorization"]?.removePrefix("Bearer ")
        ?: throw IllegalStateException("Authorization header missing")
    val oboToken = MicrosoftService.requestTokenOnBehalfOf(jwtToken)

    return MicrosoftService.fetchGroups(oboToken)
}

suspend fun getCurrentUser(call: ApplicationCall): MicrosoftGraphUser {
    val jwtToken = call.request.headers["Authorization"]?.removePrefix("Bearer ")
        ?: throw IllegalStateException("Authorization header missing")

    val oboToken = MicrosoftService.requestTokenOnBehalfOf(jwtToken)

    return MicrosoftService.fetchCurrentUser(oboToken)
}

suspend fun hasTeamAccess(call: ApplicationCall, teamId: String?): Boolean {
    if (teamId == null || teamId == "") return false

    val groups = getGroupsOrEmptyList(call)
    if (groups.isEmpty()) return false

    return teamId in groups.map { it.id }
}

suspend fun hasContextAccess(call: ApplicationCall, contextId: String,): Boolean {
    val context = ContextRepository.getContext(contextId)
    return hasTeamAccess(call, context.teamId)
}

suspend fun hasSuperUserAccess(call: ApplicationCall): Boolean {
    val user = getCurrentUser(call)
    return user.mail == AppConfig.oAuth.superUserMail
}
