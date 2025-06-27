package no.bekk.authentication

import io.ktor.http.*
import io.ktor.http.URLBuilder
import io.ktor.server.application.*
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.response.*
import io.ktor.server.sessions.*
import no.bekk.configuration.OAuthConfig
import no.bekk.database.ContextRepository
import no.bekk.domain.MicrosoftGraphGroup
import no.bekk.domain.MicrosoftGraphUser
import no.bekk.services.MicrosoftService
import no.bekk.util.logger

interface AuthService {
    suspend fun getGroupsOrEmptyList(call: ApplicationCall): List<MicrosoftGraphGroup>

    suspend fun getCurrentUser(call: ApplicationCall): MicrosoftGraphUser

    suspend fun getUserByUserId(call: ApplicationCall, userId: String): MicrosoftGraphUser

    suspend fun hasTeamAccess(call: ApplicationCall, teamId: String?): Boolean

    suspend fun hasContextAccess(call: ApplicationCall, contextId: String): Boolean

    suspend fun hasSuperUserAccess(call: ApplicationCall): Boolean

    suspend fun getTeamIdFromName(call: ApplicationCall, teamName: String): String?
}

class AuthServiceImpl(
    private val microsoftService: MicrosoftService,
    private val contextRepository: ContextRepository,
    private val oAuthConfig: OAuthConfig,
) : AuthService {
    override suspend fun getGroupsOrEmptyList(call: ApplicationCall): List<MicrosoftGraphGroup> {
        val session = getSession(call) ?: return emptyList()
        return microsoftService.fetchGroups(session.token)
    }

    override suspend fun getCurrentUser(call: ApplicationCall): MicrosoftGraphUser {
        val session = getSession(call)
            ?: throw IllegalStateException("Authorization cookie missing")

        return microsoftService.fetchCurrentUser(session.token)
    }

    override suspend fun getUserByUserId(call: ApplicationCall, userId: String): MicrosoftGraphUser {
        val session = getSession(call)
            ?: throw IllegalStateException("Authorization cookie missing")

        // val oboToken = microsoftService.requestTokenOnBehalfOf(session.token)

        return microsoftService.fetchUserByUserId(session.token, userId)
    }

    override suspend fun hasTeamAccess(call: ApplicationCall, teamId: String?): Boolean {
        if (teamId == null || teamId == "") return false

        val groupsClaim = call.principal<JWTPrincipal>()?.payload?.getClaim("groups")
        val groups = groupsClaim?.asArray(String::class.java) ?: return false

        if (groups.isEmpty()) return false

        return teamId in groups
    }

    override suspend fun hasContextAccess(
        call: ApplicationCall,
        contextId: String,
    ): Boolean {
        val context = contextRepository.getContext(contextId)
        return hasTeamAccess(call, context.teamId)
    }

    override suspend fun hasSuperUserAccess(
        call: ApplicationCall,
    ): Boolean = hasTeamAccess(call, oAuthConfig.superUserGroup)

    override suspend fun getTeamIdFromName(call: ApplicationCall, teamName: String): String? {
        val microsoftGroups = getGroupsOrEmptyList(call)

        return microsoftGroups.find { it.displayName == teamName }?.id
    }

    private suspend fun getSession(call: ApplicationCall): UserSession? {
        val session: UserSession? = call.sessions.get()
        logger.info("User session: ${session?.token}")

        if (session == null) {
            val redirectUrl = URLBuilder("/login").run {
                parameters.append("redirectUrl", call.request.local.uri)
                build()
            }
            call.respondRedirect(redirectUrl)
            return null
        }
        return session
    }
}
