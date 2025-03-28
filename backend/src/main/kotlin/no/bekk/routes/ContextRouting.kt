package no.bekk.routes

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import no.bekk.database.*
import no.bekk.authentication.AuthService
import no.bekk.util.logger

fun Route.contextRouting(
    authService: AuthService,
    answerRepository: AnswerRepository,
    contextRepository: ContextRepository,
    commentRepository: CommentRepository
) {
    route("/contexts") {
        post {
            try {
                val contextRequestJson = call.receiveText()
                logger.debug("Received POST /context request with body: $contextRequestJson")
                lateinit var contextRequest: DatabaseContextRequest
                try {
                    contextRequest = Json.decodeFromString<DatabaseContextRequest>(contextRequestJson)
                }
                catch (e: Exception) { // skal slettes når all bruk av endepunktet har gått over til å bruke formId
                    val contextRequestOLD = Json.decodeFromString<OldDatabaseContextRequest>(contextRequestJson)
                    contextRequest = DatabaseContextRequest(
                        teamId = contextRequestOLD.teamId,
                        formId = contextRequestOLD.tableId,
                        name = contextRequestOLD.name,
                        copyContext = contextRequestOLD.copyContext,
                    )
                }
                if (!authService.hasTeamAccess(call, contextRequest.teamId)) {
                    call.respond(HttpStatusCode.Forbidden)
                    return@post
                }


                val insertedContext = contextRepository.insertContext(contextRequest)

                val copyContext = contextRequest.copyContext
                if (copyContext != null) {
                    if (!authService.hasContextAccess(call, copyContext)) {
                        call.respond(HttpStatusCode.Forbidden)
                        return@post
                    }
                    answerRepository.copyAnswersFromOtherContext(insertedContext.id,copyContext)
                }
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
            val formId = call.request.queryParameters["formId"]
            logger.debug("Received GET /contexts with teamId $teamId with formId $formId")
            if (!authService.hasTeamAccess(call, teamId)) {
                call.respond(HttpStatusCode.Forbidden)
                return@get
            }

            if (formId != null) {
                val context = contextRepository.getContextByTeamIdAndFormId(teamId, formId)
                call.respond(HttpStatusCode.OK, Json.encodeToString(context))
                return@get
            } else {
                val contexts = contextRepository.getContextsByTeamId(teamId)
                call.respond(HttpStatusCode.OK, Json.encodeToString(contexts))
                return@get
            }

        }

        route("/{contextId}") {
            get {
                logger.debug("Received GET /context with id: ${call.parameters["contextId"]}")
                val contextId = call.parameters["contextId"] ?: throw BadRequestException("Missing contextId")

                if (!authService.hasContextAccess(call, contextId)) {
                    call.respond(HttpStatusCode.Unauthorized)
                    return@get
                }
                val context = contextRepository.getContext(contextId)
                call.respond(HttpStatusCode.OK, Json.encodeToString(context))
                return@get
            }

            delete {
                logger.debug("Received DELETE /context with id: ${call.parameters["contextId"]}")
                val contextId = call.parameters["contextId"] ?: throw BadRequestException("Missing contextId")
                if (!authService.hasContextAccess(call, contextId)) {
                    call.respond(HttpStatusCode.Forbidden)
                    return@delete
                }
                contextRepository.deleteContext(contextId)
                call.respondText("Context and its answers and comments were successfully deleted.")
            }

            patch("/team"){
                try {
                    logger.debug("Received PATCH /contexts with id: ${call.parameters["contextId"]}")
                    val contextId = call.parameters["contextId"] ?: throw BadRequestException("Missing contextId")

                    val payload = call.receive<TeamUpdateRequest>()
                    val newTeam = payload.teamName ?: throw BadRequestException("Missing teamName in request body")


                    if (!authService.hasContextAccess(call, contextId)) {
                        call.respond(HttpStatusCode.Forbidden)
                        return@patch
                    }

                    val teamId = authService.getTeamIdFromName(call, newTeam) ?: throw BadRequestException("TeamName not valid")

                    val success = contextRepository.changeTeam(contextId, teamId)
                    if (success) {
                        call.respond(HttpStatusCode.OK)
                        return@patch
                    } else {
                        call.respond(HttpStatusCode.InternalServerError)
                        return@patch
                    }
                } catch (e: BadRequestException) {
                    logger.error("Bad request: ${e.message}", e)
                    call.respond(HttpStatusCode.BadRequest, e.message ?: "Bad request")
                } catch (e: Exception) {
                    logger.error("Unexpected error when processing PATCH /contexts", e)
                    call.respond(HttpStatusCode.InternalServerError, "An unexpected error occurred.")
                }

            }
            patch("/answers") {
                try {
                    logger.debug("Received PATCH /{contextId}/answers with id: ${call.parameters["contextId"]}")
                    val contextId = call.parameters["contextId"] ?: throw BadRequestException("Missing contextId")

                    val payload = call.receive<CopyContextRequest>()
                    val copyContextId = payload.copyContextId ?: throw BadRequestException("Missing copy contextId in request body")

                    if (!authService.hasContextAccess(call, contextId)) {
                        call.respond(HttpStatusCode.Forbidden)
                        return@patch
                    }
                    answerRepository.copyAnswersFromOtherContext(contextId, copyContextId)
                    call.respond(HttpStatusCode.OK)
                    return@patch
                } catch (e: BadRequestException) {
                    logger.error("Bad request: ${e.message}", e)
                    call.respond(HttpStatusCode.BadRequest, e.message ?: "Bad request")
                } catch (e: Exception) {
                    logger.error("Unexpected error when processing PATCH /contexts", e)
                    call.respond(HttpStatusCode.InternalServerError, "An unexpected error occurred.")
                }
            }

            patch("/comments") {
                try {
                    logger.debug("Received PATCH /{contextId}/comments with id: ${call.parameters["contextId"]}")
                    val contextId = call.parameters["contextId"] ?: throw BadRequestException("Missing contextId")

                    val payload = call.receive<CopyContextRequest>()
                    val copyContextId = payload.copyContextId ?: throw BadRequestException("Missing copy contextId in request body")

                    if (!authService.hasContextAccess(call, contextId)) {
                        call.respond(HttpStatusCode.Forbidden)
                        return@patch
                    }
                    commentRepository.copyCommentsFromOtherContext(contextId, copyContextId)
                    call.respond(HttpStatusCode.OK)
                    return@patch
                } catch (e: BadRequestException) {
                    logger.error("Bad request: ${e.message}", e)
                    call.respond(HttpStatusCode.BadRequest, e.message ?: "Bad request")
                } catch (e: Exception) {
                    logger.error("Unexpected error when processing PATCH /contexts", e)
                    call.respond(HttpStatusCode.InternalServerError, "An unexpected error occurred.")
                }
            }
        }
    }
}

@Serializable
data class TeamUpdateRequest(val teamName: String?)

@Serializable
data class CopyContextRequest(val copyContextId: String?)
