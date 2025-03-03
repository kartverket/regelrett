package no.bekk.routes

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import no.bekk.authentication.hasContextAccess
import no.bekk.database.DatabaseComment
import no.bekk.database.CommentRepository
import no.bekk.database.DatabaseCommentRequest
import no.bekk.util.logger

fun Route.commentRouting() {

    post("/comments") {
        val commentRequestJson = call.receiveText()
        logger.debug("Received POST /comments with request body: $commentRequestJson")

        val databaseCommentRequest = Json.decodeFromString<DatabaseCommentRequest>(commentRequestJson)

        if (databaseCommentRequest.contextId == null) {
            call.respond(HttpStatusCode.BadRequest)
            return@post
        }

        if (!hasContextAccess(call, databaseCommentRequest.contextId)) {
            call.respond(HttpStatusCode.Forbidden)
            return@post
        }

        val insertedComment = CommentRepository.insertCommentOnContext(databaseCommentRequest)
        call.respond(HttpStatusCode.OK, Json.encodeToString(insertedComment))
    }

    get("/comments") {
        val recordId = call.request.queryParameters["recordId"]
        val contextId = call.request.queryParameters["contextId"]
        logger.debug("Received GET /comments with id: $contextId")

        if (contextId == null) {
            call.respond(HttpStatusCode.BadRequest)
            return@get
        }

        if (!hasContextAccess(call, contextId)) {
            call.respond(HttpStatusCode.Forbidden)
            return@get
        }

        val databaseComments: MutableList<DatabaseComment>
        if (recordId != null) {
            databaseComments =
                CommentRepository.getCommentsByContextAndRecordIdFromDatabase(contextId, recordId)
        } else {
            databaseComments = CommentRepository.getCommentsByContextIdFromDatabase(contextId)
        }

        val commentsJson = Json.encodeToString(databaseComments)
        call.respondText(commentsJson, contentType = ContentType.Application.Json)
    }

    delete("/comments") {
        val commentRequestJson = call.receiveText()
        logger.debug("Received DELETE /comments with request body: $commentRequestJson")
        val databaseCommentRequest = Json.decodeFromString<DatabaseComment>(commentRequestJson)
        if (databaseCommentRequest.contextId == null) {
            call.respond(HttpStatusCode.BadRequest)
            return@delete
        }
        if (!hasContextAccess(call, databaseCommentRequest.contextId)) {
            call.respond(HttpStatusCode.Forbidden)
            return@delete
        }
        CommentRepository.deleteCommentFromDatabase(databaseCommentRequest)
        call.respondText("Comment was successfully deleted.")
    }
}
