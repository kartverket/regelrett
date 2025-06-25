package no.bekk.plugins

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.html.*
import io.ktor.server.http.content.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.html.*
import no.bekk.configuration.Config
import no.bekk.di.Dependencies
import no.bekk.routes.*
import java.io.*

fun Application.configureRouting(
    config: Config,
    dependencies: Dependencies,
): RoutingRoot = routing {
    get("/health") {
        call.respondText("Health OK", ContentType.Text.Plain)
    }

    get("/schemas") {
        val schemas = dependencies.formService.getFormProviders().map {
            it.getSchema()
        }
        call.respond(schemas)
    }

    webRouting(config.frontendDevServer, config.homePath)

    authenticate("auth-jwt") {
        route("/api") {
            answerRouting(dependencies.authService, dependencies.answerRepository)
            commentRouting(dependencies.authService, dependencies.commentRepository)
            contextRouting(dependencies.authService, dependencies.answerRepository, dependencies.contextRepository, dependencies.commentRepository)
            formRouting(dependencies.formService)
            userInfoRouting(dependencies.authService)
            uploadCSVRouting(dependencies.authService, dependencies.database)
        }
    }

    airTableWebhookRouting(dependencies.formService)
}
