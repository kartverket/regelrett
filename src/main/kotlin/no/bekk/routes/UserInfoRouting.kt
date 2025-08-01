package no.bekk.routes

import io.ktor.http.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.withContext
import no.bekk.authentication.AuthService
import no.bekk.domain.UserInfoResponse
import no.bekk.util.logger

fun Route.userInfoRouting(authService: AuthService) {
    route("/userinfo") {
        get {
            withContext(Dispatchers.Default) {
                logger.debug("Received GET /userinfo")

                val groups = async { authService.getGroupsOrEmptyList(call) }
                val user = async { authService.getCurrentUser(call) }
                val superuser = async { authService.hasSuperUserAccess(call) }

                call.respond(UserInfoResponse(groups.await(), user.await(), superuser.await()))
            }
        }

        get("/{userId}/username") {
            val userId = call.parameters["userId"]
            logger.info("Received GET /userinfo/userId/username with id $userId")
            if (userId == null) {
                logger.warn("Request missing userId")
                call.respond(HttpStatusCode.BadRequest, "UserId is missing")
                return@get
            }
            try {
                val username = authService.getUserByUserId(call, userId).displayName
                logger.info("Successfully retrieved username for userId: $userId")
                call.respond(HttpStatusCode.OK, username)
            } catch (e: Exception) {
                logger.error("Error occurred while retrieving username for userId: $userId", e)
                call.respond(HttpStatusCode.InternalServerError, "An error occurred: ${e.message}")
            }
        }
    }
}
