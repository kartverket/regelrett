package no.bekk.routes

import io.ktor.http.*
import io.ktor.server.plugins.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.json.Json
import no.bekk.authentication.AuthService
import no.bekk.database.CommentRepository
import no.bekk.database.DatabaseComment
import no.bekk.database.DatabaseCommentRequest
import no.bekk.util.logger

fun Route.commentRouting(authService: AuthService, commentRepository: CommentRepository) {

    post("/comments") {
        val commentRequestJson = call.receiveText()
        logger.info("Received POST /comments with request body: $commentRequestJson")

        val databaseCommentRequest = Json.decodeFromString<DatabaseCommentRequest>(commentRequestJson)

        if (databaseCommentRequest.contextId == null) {
            call.respond(HttpStatusCode.BadRequest)
            return@post
        }

        if (!authService.hasContextAccess(call, databaseCommentRequest.contextId)) {
            call.respond(HttpStatusCode.Forbidden)
            return@post
        }

        val insertedComment = commentRepository.insertCommentOnContext(databaseCommentRequest)
        call.respond(HttpStatusCode.OK, Json.encodeToString(insertedComment))
    }

    get("/comments") {
        val recordId = call.request.queryParameters["recordId"]
        val contextId = call.request.queryParameters["contextId"]
        logger.info("Received GET /comments with id: $contextId")

        if (contextId == null) {
            call.respond(HttpStatusCode.BadRequest)
            return@get
        }

        if (!authService.hasContextAccess(call, contextId)) {
            call.respond(HttpStatusCode.Forbidden)
            return@get
        }

        val databaseComments: List<DatabaseComment>
        if (recordId != null) {
            databaseComments =
                commentRepository.getCommentsByContextAndRecordIdFromDatabase(contextId, recordId)
        } else {
            databaseComments = commentRepository.getCommentsByContextIdFromDatabase(contextId)
        }

        val commentsJson = Json.encodeToString(databaseComments)
        call.respondText(commentsJson, contentType = ContentType.Application.Json)
    }

    delete("/comments") {
        logger.info("Received DELETE /comments with recordId: ${call.request.queryParameters["recordId"]} and contextId: ${call.request.queryParameters["contextId"]}")
        val contextId = call.request.queryParameters["contextId"] ?: throw BadRequestException("Missing contextId")
        val recordId = call.request.queryParameters["recordId"] ?: throw BadRequestException("Missing recordId")

        if (!authService.hasContextAccess(call, contextId)) {
            call.respond(HttpStatusCode.Forbidden)
            return@delete
        }
        commentRepository.deleteCommentFromDatabase(contextId, recordId)
        call.respondText("Comment was successfully deleted.")
    }
}
