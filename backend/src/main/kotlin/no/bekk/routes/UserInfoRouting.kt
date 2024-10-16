package no.bekk.routes

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import no.bekk.authentication.getGroupsOrEmptyList
import no.bekk.authentication.getCurrentUser
import no.bekk.services.MicrosoftGraphService
import no.bekk.util.logger

fun Route.userInfoRouting() {
    val microsoftGraphService = MicrosoftGraphService()
    route("/userinfo") {
        get {
            val groups = getGroupsOrEmptyList(call)
            call.respond(mapOf("groups" to groups))
        }

        get("/currenUser") {
            val user = getCurrentUser(call)
            call.respond(HttpStatusCode.OK, user)
        }

        get("/{userId}/username") {
            val userId = call.parameters["userId"]
            if (userId == null) {
                logger.warn("Request missing userId")
                call.respond(HttpStatusCode.BadRequest, "UserId is missing")
                return@get
            }
            try {
                val username = microsoftGraphService.getUser(userId).displayName
                logger.info("Successfully retrieved username for userId: $userId")
                call.respond(HttpStatusCode.OK, username)
            } catch (e: Exception) {
                logger.error("Error occurred while retrieving username for userId: $userId", e)
                call.respond(HttpStatusCode.InternalServerError, "An error occurred: ${e.message}")
            }
        }

    }
}