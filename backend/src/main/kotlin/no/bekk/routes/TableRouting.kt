package no.bekk.routes

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import no.bekk.services.AirTableService
import no.bekk.services.TableService
import no.bekk.util.logger

fun Route.tableRouting() {
    val tableService = TableService()
    route("/table") {
        get("/{tableId}") {
            val tableId = call.parameters["tableId"]
            if (tableId == null) {
                logger.warn("Request missing tableId")
                call.respond(HttpStatusCode.BadRequest,"TableId is missing")
                return@get
            }
            val team = call.request.queryParameters["team"]

            try {
                val table = tableService.getTable(team)
                logger.info("Successfully retrieved table for tableId: $tableId")
                call.respond(table)
            } catch (e: IllegalArgumentException) {
                logger.error("Error occurred while retrieving table for tableId: $tableId", e)
                call.respond(HttpStatusCode.InternalServerError, "An error occured: ${e.message}")
            }
        }
        get("/{tableId}/{recordId}") {
            val tableId = call.parameters["tableId"]
            val recordId = call.parameters["recordId"]
            if (tableId == null || recordId == null) {
                logger.warn("Request missing tableId or recordId")
                call.respond(HttpStatusCode.BadRequest,"TableId is missing")
                return@get
            }
            try {
                val question = tableService.getQuestion(tableId, recordId)
                logger.info("Successfully retrieved question: $question")
                call.respond(question)
            } catch (e: NotFoundException) {
                logger.error("Question with recordId: $recordId was not found", e)
                call.respond(HttpStatusCode.NotFound, "An error occured: ${e.message}")
            } catch (e: Exception) {
                logger.error("Error occurred while retrieving question for recordId: $recordId", e)
                call.respond(HttpStatusCode.InternalServerError, "An error occured: ${e.message}")
            }
        }
    }
}