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
        val answerRequestJson = call.receiveText()
        logger.info("Received POST /answer request with body: $answerRequestJson")
        val answerRequest = Json.decodeFromString<DatabaseAnswerRequest>(answerRequestJson)

        if (answerRequest.contextId == null) {
            call.respond(HttpStatusCode.BadRequest)
            return@post
        }

        if (!authService.hasContextAccess(call, answerRequest.contextId)) {
            call.respond(HttpStatusCode.Forbidden)
            return@post
        }

        val insertedAnswer = answerRepository.insertAnswerOnContext(answerRequest)
        call.respond(HttpStatusCode.OK, Json.encodeToString(insertedAnswer))
    }

    get("/answers") {
        val recordId = call.request.queryParameters["recordId"]
        val contextId = call.request.queryParameters["contextId"]
        logger.info("Received GET /answers with contextId: $contextId and recordId: $recordId")

        if (contextId == null) {
            call.respond(HttpStatusCode.BadRequest)
            return@get
        }

        if (!authService.hasContextAccess(call, contextId)) {
            call.respond(HttpStatusCode.Forbidden)
            return@get
        }

        val answers: List<DatabaseAnswer>
        if (recordId != null) {
            answers = answerRepository.getAnswersByContextAndRecordIdFromDatabase(contextId, recordId)
        } else {
            answers = answerRepository.getLatestAnswersByContextIdFromDatabase(contextId)
        }

        val answersJson = Json.encodeToString(answers)
        call.respondText(answersJson, contentType = ContentType.Application.Json)
    }

}
