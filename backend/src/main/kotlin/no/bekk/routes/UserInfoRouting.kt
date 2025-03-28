package no.bekk.routes

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import no.bekk.domain.UserInfoResponse
import no.bekk.authentication.AuthService
import no.bekk.util.logger

fun Route.userInfoRouting(authService: AuthService) {
    route("/userinfo") {
        get {
            logger.debug("Received GET /userinfo")
            val groups = authService.getGroupsOrEmptyList(call)
            val user = authService.getCurrentUser(call)
            val superuser = authService.hasSuperUserAccess(call)
            call.respond(UserInfoResponse(groups, user, superuser))
        }

        get("/{userId}/username") {
            val userId = call.parameters["userId"]
            logger.debug("Received GET /userinfo/userId/username with id $userId")
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