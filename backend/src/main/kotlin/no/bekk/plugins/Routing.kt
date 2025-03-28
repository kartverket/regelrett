package no.bekk.plugins

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import no.bekk.di.Dependencies
import no.bekk.routes.*

fun Application.configureRouting(
    dependencies: Dependencies
) {
    routing {
        get("/") {
            call.respondText("Velkommen til Kartverket regelrett!")
        }

        get("/health") {
            call.respondText("Health OK", ContentType.Text.Plain)
        }

        get("/schemas") {
            val schemas = dependencies.formService.getFormProviders().map {
                it.getSchema()
            }
            call.respond(schemas)
        }

        authenticate("auth-jwt") {
            answerRouting(dependencies.authService, dependencies.answerRepository)
            commentRouting(dependencies.authService, dependencies.commentRepository)
            contextRouting(dependencies.authService, dependencies.answerRepository, dependencies.contextRepository, dependencies.commentRepository)
            formRouting(dependencies.formService)
            userInfoRouting(dependencies.authService)
            uploadCSVRouting(dependencies.authService, dependencies.database)
        }

        airTableWebhookRouting(dependencies.formService)
    }
}
