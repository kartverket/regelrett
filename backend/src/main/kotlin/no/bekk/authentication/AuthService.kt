package no.bekk.authentication

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.uri
import io.ktor.server.response.*
import io.ktor.server.sessions.*
import io.ktor.server.util.url
import no.bekk.configuration.OAuthConfig
import no.bekk.database.ContextRepository
import no.bekk.domain.MicrosoftGraphGroup
import no.bekk.domain.MicrosoftGraphUser
import no.bekk.services.MicrosoftService

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

        return microsoftService.fetchUserByUserId(session.token, userId)
    }

    override suspend fun hasTeamAccess(call: ApplicationCall, teamId: String?): Boolean {
        if (teamId == null || teamId == "") return false

        val groups = getGroupsOrEmptyList(call)
        if (groups.isEmpty()) return false
        for (group in groups) {
            if (group.id == teamId) return true
        }
        return false
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
}
suspend fun getSession(call: ApplicationCall): UserSession? {
    val session: UserSession? = call.sessions.get()

    if (session == null) {
        if (call.request.local.uri.startsWith("/api")) {
            call.respond(HttpStatusCode.Forbidden)
        } else {
            val redirectUrl = call.url {
                path("/login")
                parameters.append("redirectUrl", call.request.uri)
                build()
            }
            call.respondRedirect(redirectUrl)
        }
        return null
    }
    return session
}
