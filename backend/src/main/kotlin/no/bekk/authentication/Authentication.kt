package no.bekk.authentication

import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.sessions.*

val applicationHttpClient = HttpClient(CIO) {
    install(ContentNegotiation) {
        json()
    }
}

fun Application.installSessions() {
    install(Sessions) {
        cookie<UserSession>("user_session") {
            cookie.path = "/"
            cookie.maxAgeInSeconds = 360
            cookie.secure
            cookie.httpOnly = true
        }
    }
}

fun Application.initializeAuthentication(httpClient: HttpClient = applicationHttpClient) {
    val redirects = mutableMapOf<String, String>()
    install(Authentication) {
            oauth("auth-oauth-azure") {
                urlProvider = { System.getenv("AUTH_PROVIDER_URL") }
                providerLookup = {
                    OAuthServerSettings.OAuth2ServerSettings(
                        name = "azure",
                        authorizeUrl = "https://login.microsoftonline.com/${System.getenv("TENANT_ID")}/oauth2/v2.0/authorize",
                        accessTokenUrl = "https://login.microsoftonline.com/${System.getenv("TENANT_ID")}/oauth2/v2.0/token",
                        requestMethod = HttpMethod.Post,
                        clientId = System.getenv("AUTH_CLIENT_ID"),
                        clientSecret = System.getenv("AUTH_CLIENT_SECRET"),
                        defaultScopes = listOf("openid"),
                        onStateCreated = { call, state ->
                            call.request.queryParameters["redirectUrl"]?.let {
                                redirects[state] = it
                            }
                        }
                    )
                }
            client = httpClient
        }
    }
}

data class UserSession(val state: String, val token: String)
