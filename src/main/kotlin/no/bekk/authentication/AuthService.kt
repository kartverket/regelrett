package no.bekk.authentication

import io.ktor.http.*
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
        val jwtToken =
            call.request.headers["Authorization"]?.removePrefix("Bearer ")
                ?: throw IllegalStateException("Authorization header missing")
        val oboToken = microsoftService.requestTokenOnBehalfOf(jwtToken)

        return microsoftService.fetchGroups(oboToken)
    }

    override suspend fun getCurrentUser(call: ApplicationCall): MicrosoftGraphUser {
        val jwtToken =
            call.request.headers["Authorization"]?.removePrefix("Bearer ")
                ?: throw IllegalStateException("Authorization header missing")

        val oboToken = microsoftService.requestTokenOnBehalfOf(jwtToken)

        return microsoftService.fetchCurrentUser(oboToken)
    }

    override suspend fun getUserByUserId(call: ApplicationCall, userId: String): MicrosoftGraphUser {
        val jwtToken =
            call.request.headers["Authorization"]?.removePrefix("Bearer ")
                ?: throw IllegalStateException("Authorization header missing")

        val oboToken = microsoftService.requestTokenOnBehalfOf(jwtToken)

        return microsoftService.fetchUserByUserId(oboToken, userId)
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
}
