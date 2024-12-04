package no.bekk.plugins

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import no.bekk.routes.*

fun Application.configureRouting() {

    routing {
        get("/") {
            call.respondText("Velkommen til Kartverket regelrett!")
        }

        get("/health") {
            call.respondText("Health OK", ContentType.Text.Plain)
        }

        authenticate("auth-jwt") {
            answerRouting()
            commentRouting()
            contextRouting()
            questionRouting()
            tableRouting()
            userInfoRouting()
            uploadCSVRouting()
        }

        airTableWebhookRouting()
    }
}
