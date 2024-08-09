package no.bekk.plugins

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import no.bekk.routes.authenticationRouting
import no.bekk.routes.questionRouting
import no.bekk.routes.tableRouting

import no.bekk.routes.*

fun Application.configureRouting() {

    routing {
        get("/") {
            call.respondText("Velkommen til Kartverket Kontrollere!")
        }

        get("/health") {
            call.respondText("Health OK", ContentType.Text.Plain)
        }

        authenticationRouting()

        authenticate("auth-jwt"){
            alleRouting()
            answerRouting()
            commentRouting()
            kontrollereRouting()
            metodeverkRouting()
            questionRouting()
            tableRouting()
            userInfoRouting()
        }
    }
}
