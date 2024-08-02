package no.bekk.plugins

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.cors.routing.*
import no.bekk.configuration.getEnvVariableOrConfig

fun Application.configureCors() {
    install(CORS) {
        allowHost(getEnvVariableOrConfig("FRONTEND_URL_HOST", "ktor.deployment.frontendUrlHost"))
        allowCredentials = true
        allowSameOrigin = true
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Authorization)
        allowHeader(HttpHeaders.AccessControlAllowOrigin)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Patch)
    }
}