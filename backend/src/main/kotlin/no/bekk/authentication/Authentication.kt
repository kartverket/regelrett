package no.bekk.authentication

import com.auth0.jwk.JwkProviderBuilder
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.http.*
import io.ktor.http.auth.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.application.ApplicationCallPipeline.ApplicationPhase.Plugins
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.response.*
import io.ktor.server.sessions.*
import no.bekk.configuration.*
import no.bekk.domain.MicrosoftGraphGroup
import no.bekk.services.FriskService
import no.bekk.services.MicrosoftService
import no.bekk.util.logger
import java.net.URL
import java.util.concurrent.TimeUnit
import java.util.logging.Logger

val applicationHttpClient = HttpClient(CIO) {
    install(ContentNegotiation) {
        json()
    }
}

fun Application.installSessions() {
    install(Sessions) {
        cookie<UserSession>("user_session") {
            cookie.path = "/"
            cookie.maxAgeInSeconds = 180 * 60
            cookie.secure = true
            cookie.httpOnly = true
            cookie.extensions["SameSite"] = "None"  // Allow cross-origin cookies
            cookie.domain = "regelrett-frontend-1024826672490.europe-north1.run.app"
        }
    }

    // Intercept every request to refresh the session cookie
    intercept(Plugins) {
        val session: UserSession? = call.sessions.get<UserSession>()
        if (session != null) {
            logger.debug("Session exists. UserSession: {}", session)
            call.sessions.set("user_session", session)
            logger.debug("Session updated.")
        }
    }
}

fun Application.initializeAuthentication(httpClient: HttpClient = applicationHttpClient) {
    val redirects = mutableMapOf<String, String>()
    val issuer = AppConfig.oAuth.getIssuer()
    val clientId = AppConfig.oAuth.clientId
    val jwksUri = AppConfig.oAuth.getJwksUrl()

    val jwkProvider = JwkProviderBuilder(URL(jwksUri))
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
            authHeader { call ->
                val userSession: UserSession? = call.sessions.get<UserSession>()
                val token = userSession?.token
                if (token.isNullOrEmpty()) return@authHeader null
                try {
                    parseAuthorizationHeader("Bearer $token")
                } catch (e: IllegalArgumentException) {
                    throw IllegalArgumentException("Error decoding authentication token", e)
                }
            }
        }

        oauth("auth-oauth-azure") {
            urlProvider = { AppConfig.oAuth.providerUrl }
            providerLookup = {
                OAuthServerSettings.OAuth2ServerSettings(
                    name = "azure",
                    authorizeUrl = AppConfig.oAuth.getAuthUrl(),
                    accessTokenUrl = AppConfig.oAuth.getTokenUrl(),
                    requestMethod = HttpMethod.Post,
                    clientId = clientId,
                    clientSecret = AppConfig.oAuth.clientSecret,
                    defaultScopes = listOf("$clientId/.default"),
                    onStateCreated = { call, state ->
                        call.request.queryParameters["redirectUrl"]?.let {
                            redirects[state] = it
                        }
                    }
                )
            }
            client = httpClient
        }
    }
}

suspend fun getGroupsOrEmptyList(call: ApplicationCall): List<MicrosoftGraphGroup> {
    val microsoftService = MicrosoftService()

    val graphApiToken = call.sessions.get<UserSession>()?.let {
        microsoftService.requestTokenOnBehalfOf(it)
    } ?: throw IllegalStateException("Unable to retrieve on-behalf-of token")

    return microsoftService.fetchGroups(graphApiToken)
}

suspend fun hasTeamAccess(call: ApplicationCall, teamId: String?): Boolean {
    if (teamId == null || teamId == "") return false

    val groups = getGroupsOrEmptyList(call)
    if (groups.isEmpty()) return false

    return teamId in groups.map { it.id }
}

suspend fun hasFunctionAccess(call: ApplicationCall, friskService: FriskService, functionId: Int): Boolean {
    val userSession = call.sessions.get<UserSession>() ?: return false
    val functionMetadata = friskService.fetchMetadataByFunctionId(userSession, functionId)
    val functionTeams = functionMetadata.mapNotNull {
        if (it.key == "team") it.value
        else null
    }
    return functionTeams.any { hasTeamAccess(call, it) }
}

data class UserSession(val state: String, val token: String)
