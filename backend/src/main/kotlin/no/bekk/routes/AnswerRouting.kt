package no.bekk.routes

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import no.bekk.authentication.hasContextAccess
import no.bekk.database.AnswerRepository
import no.bekk.database.DatabaseAnswer
import no.bekk.database.DatabaseAnswerRequest
import no.bekk.util.logger

fun Route.answerRouting() {

    post("/answer") {
        val answerRequestJson = call.receiveText()
        logger.debug("Received POST /answer request with body: $answerRequestJson")
        val answerRequest = Json.decodeFromString<DatabaseAnswerRequest>(answerRequestJson)

        if (answerRequest.contextId == null) {
            call.respond(HttpStatusCode.BadRequest)
            return@post
        }

        if (!hasContextAccess(call, answerRequest.contextId)) {
            call.respond(HttpStatusCode.Forbidden)
            return@post
        }

        val insertedAnswer = AnswerRepository.insertAnswerOnContext(answerRequest)
        call.respond(HttpStatusCode.OK, Json.encodeToString(insertedAnswer))
    }

    get("/answers") {
        val recordId = call.request.queryParameters["recordId"]
        val contextId = call.request.queryParameters["contextId"]
        logger.debug("Received GET /answers with contextId: $contextId and recordId: $recordId")

        if (contextId == null) {
            call.respond(HttpStatusCode.BadRequest)
            return@get
        }

        if (!hasContextAccess(call, contextId)) {
            call.respond(HttpStatusCode.Forbidden)
            return@get
        }

        val answers: MutableList<DatabaseAnswer>
        if (recordId != null) {
            answers = AnswerRepository.getAnswersByContextAndRecordIdFromDatabase(contextId, recordId)
        } else {
            answers = AnswerRepository.getAnswersByContextIdFromDatabase(contextId)
        }

        val answersJson = Json.encodeToString(answers)
        call.respondText(answersJson, contentType = ContentType.Application.Json)
    }

}