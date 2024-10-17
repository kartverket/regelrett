package no.bekk.routes

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import no.bekk.authentication.hasContextAccess
import no.bekk.authentication.hasTeamAccess
import no.bekk.database.ContextRepository
import no.bekk.database.DatabaseContextRequest
import no.bekk.database.UniqueConstraintViolationException
import no.bekk.util.logger

fun Route.contextRouting() {
    val contextRepository = ContextRepository()
    route("/contexts") {
        post {
            try {

                val contextRequestJson = call.receiveText()
                logger.debug("Received POST /context request with body: $contextRequestJson")
                val contextRequest = Json.decodeFromString<DatabaseContextRequest>(contextRequestJson)
                if (!hasTeamAccess(call, contextRequest.teamId)) {
                    call.respond(HttpStatusCode.Forbidden)
                    return@post
                }
                val insertedContext = contextRepository.insertContext(contextRequest)
                call.respond(HttpStatusCode.Created, Json.encodeToString(insertedContext))
                return@post
            } catch (e: UniqueConstraintViolationException) {
                logger.warn("Unique constraint violation: ${e.message}")
                call.respond(
                    HttpStatusCode.Conflict,
                    mapOf("error" to e.message)
                )
                return@post
            } catch (e: Exception) {
                logger.error("Unexpected error: ${e.message}")
                call.respond(
                    HttpStatusCode.InternalServerError,
                    mapOf("error" to "An unexpected error occurred.")
                )
                return@post
            }
        }

        get {
            val teamId = call.request.queryParameters["teamId"] ?: throw BadRequestException("Missing teamId parameter")
            val tableId = call.request.queryParameters["tableId"] ?: throw BadRequestException("Missing tableId parameter")
            if (!hasTeamAccess(call, teamId)) {
                call.respond(HttpStatusCode.Forbidden)
                return@get
            }
            val contexts = contextRepository.getContextsByTeamId(teamId, tableId)
            call.respond(HttpStatusCode.OK, Json.encodeToString(contexts))
            return@get
        }

        get("/{contextId}") {
            logger.info("Received GET /context with id: ${call.parameters["contextId"]}")
            val contextId = call.parameters["contextId"] ?: throw BadRequestException("Missing contextId")

            if (!hasContextAccess(call, contextId)) {
                call.respond(HttpStatusCode.Forbidden)
                return@get
            }
            val context = contextRepository.getContext(contextId)
            call.respond(HttpStatusCode.OK, Json.encodeToString(context))
            return@get
        }
    }
}