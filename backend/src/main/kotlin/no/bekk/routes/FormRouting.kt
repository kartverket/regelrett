package no.bekk.routes

import io.ktor.http.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import no.bekk.services.FormService
import no.bekk.services.FormsMetadataDto
import no.bekk.util.logger

fun Route.formRouting(formService: FormService) {
    route("/forms") {
        get {
            logger.info("Received GET /forms")
            val forms =
                formService.getFormProviders().map {
                    it.getForm().let { FormsMetadataDto(it.id, it.name) }
                }
            call.respond(forms)
        }
        get("/{formId}") {
            val formId = call.parameters["formId"]
            logger.info("Received GET /forms with id $formId")
            if (formId == null) {
                logger.warn("Request missing tableId")
                call.respond(HttpStatusCode.BadRequest, "FormId is missing")
                return@get
            }

            try {
                val table = formService.getFormProvider(formId).getForm()
                call.respond(table)
            } catch (e: IllegalArgumentException) {
                logger.error("Error occurred while retrieving table for formId: $formId", e)
                call.respond(HttpStatusCode.InternalServerError, "An error occured: ${e.message}")
            }
        }
        get("/{formId}/{recordId}") {
            val formId = call.parameters["formId"]
            val recordId = call.parameters["recordId"]
            logger.info("Received GET /forms with id $formId and recordId $recordId")
            if (formId == null || recordId == null) {
                logger.warn("Request missing tableId or recordId")
                call.respond(HttpStatusCode.BadRequest, "FormId is missing")
                return@get
            }
            try {
                val question = formService.getFormProvider(formId).getQuestion(recordId)
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
        get("/{formId}/columns") {
            val formId = call.parameters["formId"]
            logger.info("Received GET /forms/formId/columns with id $formId")
            if (formId == null) {
                logger.warn("Request missing FormId")
                call.respond(HttpStatusCode.BadRequest, "FormId is missing")
                return@get
            }
            try {
                val columns = formService.getFormProvider(formId).getColumns()
                logger.info("Successfully retrieved columns: $columns")
                call.respond(columns)
            } catch (e: Exception) {
                logger.error("Error occurred while retrieving columns from form: $formId", e)
                call.respond(HttpStatusCode.InternalServerError, "An error occured: ${e.message}")
            }
        }
    }
}
