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
    private val logger = logger()
    
    override suspend fun getGroupsOrEmptyList(call: ApplicationCall): List<MicrosoftGraphGroup> {
        logger.debug("Getting groups for user")
        
        val jwtToken =
            call.request.headers["Authorization"]?.removePrefix("Bearer ") ?: run {
                logger.error("Authorization header missing in request")
                throw IllegalStateException("Authorization header missing")
            }
        
        try {
            val oboToken = microsoftService.requestTokenOnBehalfOf(jwtToken)
            val groups = microsoftService.fetchGroups(oboToken)
            logger.debug("Successfully retrieved {} groups for user", groups.size)
            return groups
        } catch (e: Exception) {
            logger.error("Failed to get groups for user", e)
            throw e
        }
    }

    override suspend fun getCurrentUser(call: ApplicationCall): MicrosoftGraphUser {
        logger.debug("Getting current user information")
        
        val jwtToken =
            call.request.headers["Authorization"]?.removePrefix("Bearer ") ?: run {
                logger.error("Authorization header missing in request")
                throw IllegalStateException("Authorization header missing")
            }

        try {
            val oboToken = microsoftService.requestTokenOnBehalfOf(jwtToken)
            val user = microsoftService.fetchCurrentUser(oboToken)
            logger.debug("Successfully retrieved current user: {}", user.displayName)
            return user
        } catch (e: Exception) {
            logger.error("Failed to get current user", e)
            throw e
        }
    }

    override suspend fun getUserByUserId(call: ApplicationCall, userId: String): MicrosoftGraphUser {
        logger.debug("Getting user by ID: {}", userId)
        
        val jwtToken =
            call.request.headers["Authorization"]?.removePrefix("Bearer ") ?: run {
                logger.error("Authorization header missing in request")
                throw IllegalStateException("Authorization header missing")
            }

        try {
            val oboToken = microsoftService.requestTokenOnBehalfOf(jwtToken)
            val user = microsoftService.fetchUserByUserId(oboToken, userId)
            logger.debug("Successfully retrieved user by ID: {} - {}", userId, user.displayName)
            return user
        } catch (e: Exception) {
            logger.error("Failed to get user by ID: {}", userId, e)
            throw e
        }
    }

    override suspend fun hasTeamAccess(call: ApplicationCall, teamId: String?): Boolean {
        logger.debug("Checking team access for teamId: {}", teamId)
        
        if (teamId == null || teamId == "") {
            logger.debug("Team access denied: teamId is null or empty")
            return false
        }

        val groupsClaim = call.principal<JWTPrincipal>()?.payload?.getClaim("groups")
        val groups = groupsClaim?.asArray(String::class.java) ?: run {
            logger.debug("Team access denied: no groups claim found in JWT")
            return false
        }

        if (groups.isEmpty()) {
            logger.debug("Team access denied: groups array is empty")
            return false
        }

        val hasAccess = teamId in groups
        logger.debug("Team access check result for teamId {}: {}", teamId, hasAccess)
        
        return hasAccess
    }

    override suspend fun hasContextAccess(
        call: ApplicationCall,
        contextId: String,
    ): Boolean {
        logger.debug("Checking context access for contextId: {}", contextId)
        
        try {
            val context = contextRepository.getContext(contextId)
            val hasAccess = hasTeamAccess(call, context.teamId)
            logger.debug("Context access check result for contextId {}: {}", contextId, hasAccess)
            return hasAccess
        } catch (e: Exception) {
            logger.error("Failed to check context access for contextId: {}", contextId, e)
            throw e
        }
    }

    override suspend fun hasSuperUserAccess(
        call: ApplicationCall,
    ): Boolean {
        logger.debug("Checking super user access")
        val hasAccess = hasTeamAccess(call, oAuthConfig.superUserGroup)
        logger.debug("Super user access check result: {}", hasAccess)
        return hasAccess
    }

    override suspend fun getTeamIdFromName(call: ApplicationCall, teamName: String): String? {
        logger.debug("Getting team ID from name: {}", teamName)
        
        try {
            val microsoftGroups = getGroupsOrEmptyList(call)
            val matchingGroup = microsoftGroups.find { it.displayName == teamName }
            
            val teamId = matchingGroup?.id
            logger.debug("Team ID lookup result for name '{}': {}", teamName, teamId ?: "not found")
            
            return teamId
        } catch (e: Exception) {
            logger.error("Failed to get team ID from name: {}", teamName, e)
            throw e
        }
    }
}
