package no.bekk.routes

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import no.bekk.authentication.hasTeamAccess
import no.bekk.database.DatabaseAnswer
import no.bekk.database.DatabaseRepository
import no.bekk.util.logger
import java.sql.SQLException

fun Route.answerRouting() {
    val databaseRepository = DatabaseRepository()

    post("/answer") {
        val answerRequestJson = call.receiveText()
        logger.debug("Received POST /answer request with body: $answerRequestJson")
        val answerRequest = Json.decodeFromString<DatabaseAnswer>(answerRequestJson)

        if(!hasTeamAccess(call, answerRequest.team)){
            call.respond(HttpStatusCode.Unauthorized)
        }

        val answer = DatabaseAnswer(
            question = answerRequest.question,
            questionId = answerRequest.questionId,
            answer = answerRequest.answer,
            actor = answerRequest.actor,
            updated = "",
            team = answerRequest.team,
        )
        val insertedAnswer = databaseRepository.insertAnswer(answer)
        call.respond(HttpStatusCode.OK, Json.encodeToString(insertedAnswer))
    }

    get("/answers") {
        logger.debug("Received GET /answers request")

        try {
            val answers = databaseRepository.getAnswersFromDatabase()
            val answersJson = Json.encodeToString(answers)
            call.respondText(answersJson, contentType = ContentType.Application.Json)
        } catch (e: SQLException) {
            logger.error("Error fetching answers ", e)
            call.respond(HttpStatusCode.InternalServerError, "Error fetching answers")
        }
    }

    get("/answers/{teamId}") {
        val teamId = call.parameters["teamId"]
        logger.debug("Received GET /answers/$teamId request")


        if(!hasTeamAccess(call, teamId)){
            logger.warn("Unauthorized access attempt for team: $teamId")
            call.respond(HttpStatusCode.Unauthorized)
        }

        if (teamId != null) {
            val answers = databaseRepository.getAnswersByTeamIdFromDatabase(teamId)
            val answersJson = Json.encodeToString(answers)
            call.respondText(answersJson, contentType = ContentType.Application.Json)
        } else {
            logger.error("Team id not found")
            call.respond(HttpStatusCode.BadRequest, "Team id not found")
        }
    }
}