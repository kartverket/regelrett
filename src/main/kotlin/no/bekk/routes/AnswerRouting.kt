package no.bekk.routes

import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.json.Json
import no.bekk.database.AnswerRepository
import no.bekk.database.DatabaseAnswer
import no.bekk.database.DatabaseAnswerRequest
import no.bekk.authentication.AuthService
import no.bekk.util.logger

fun Route.answerRouting(authService: AuthService, answerRepository: AnswerRepository) {

    post("/answer") {
        try {
            val answerRequestJson = call.receiveText()
            logger.info("Received POST /answer request with body: $answerRequestJson")
            val answerRequest = Json.decodeFromString<DatabaseAnswerRequest>(answerRequestJson)

            if (answerRequest.contextId == null) {
                logger.warn("POST /answer request missing contextId")
                call.respond(HttpStatusCode.BadRequest, "ContextId is required")
                return@post
            }

            if (!authService.hasContextAccess(call, answerRequest.contextId)) {
                logger.warn("POST /answer request denied access to contextId: {}", answerRequest.contextId)
                call.respond(HttpStatusCode.Forbidden, "Access denied to context")
                return@post
            }

            val insertedAnswer = answerRepository.insertAnswerOnContext(answerRequest)
            logger.debug("Successfully inserted answer for contextId: {}", answerRequest.contextId)
            call.respond(HttpStatusCode.OK, Json.encodeToString(insertedAnswer))
        } catch (e: Exception) {
            logger.error("Error processing POST /answer request", e)
            call.respond(HttpStatusCode.InternalServerError, "An error occurred while processing the request")
        }
    }

    get("/answers") {
        try {
            val recordId = call.request.queryParameters["recordId"]
            val contextId = call.request.queryParameters["contextId"]
            logger.info("Received GET /answers with contextId: $contextId and recordId: $recordId")

            if (contextId == null) {
                logger.warn("GET /answers request missing contextId")
                call.respond(HttpStatusCode.BadRequest, "ContextId is required")
                return@get
            }

            if (!authService.hasContextAccess(call, contextId)) {
                logger.warn("GET /answers request denied access to contextId: {}", contextId)
                call.respond(HttpStatusCode.Forbidden, "Access denied to context")
                return@get
            }

            val answers: List<DatabaseAnswer>
            if (recordId != null) {
                logger.debug("Fetching answers for contextId: {} and recordId: {}", contextId, recordId)
                answers = answerRepository.getAnswersByContextAndRecordIdFromDatabase(contextId, recordId)
            } else {
                logger.debug("Fetching latest answers for contextId: {}", contextId)
                answers = answerRepository.getLatestAnswersByContextIdFromDatabase(contextId)
            }

            val answersJson = Json.encodeToString(answers)
            logger.debug("Successfully retrieved {} answers for contextId: {}", answers.size, contextId)
            call.respondText(answersJson, contentType = ContentType.Application.Json)
        } catch (e: Exception) {
            logger.error("Error processing GET /answers request", e)
            call.respond(HttpStatusCode.InternalServerError, "An error occurred while processing the request")
        }
    }

}
