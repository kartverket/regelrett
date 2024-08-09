package no.bekk.authentication

import com.auth0.jwk.JwkProviderBuilder
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.http.*
import io.ktor.http.auth.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.response.*
import io.ktor.server.sessions.*
import java.util.concurrent.TimeUnit

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
    val issuer = System.getenv("AUTH_ISSUER")
    val audience = System.getenv("AUTH_AUDIENCE")

    val jwkProvider = JwkProviderBuilder(issuer)
        .cached(10, 24, TimeUnit.HOURS)
        .rateLimited(10, 1, TimeUnit.MINUTES)
        .build()

    install(Authentication) {
        jwt("auth-jwt") {
            verifier(jwkProvider, issuer){
                acceptLeeway(3)
                withAudience(audience)
            }
            validate { jwtCredential ->
                if (jwtCredential.audience.contains(audience)) JWTPrincipal(jwtCredential.payload) else null
            }

            challenge{_,_ ->
            call.respond(HttpStatusCode.Unauthorized, "You are unauthenticated")
            }
            authHeader { call ->
                val userSession: UserSession? = call.sessions.get<UserSession>()
                val token = userSession?.token
                if (token.isNullOrEmpty()) return@authHeader null
                try {
                    parseAuthorizationHeader("Bearer $token")
                } catch (e: IllegalArgumentException) {
                    throw IllegalArgumentException("Error decoding authentication token", e)
                }
            }
        }

        oauth("auth-oauth-azure") {
            urlProvider = { System.getenv("AUTH_PROVIDER_URL") }
            providerLookup = {
                OAuthServerSettings.OAuth2ServerSettings(
                    name = "auth0",
                    authorizeUrl = System.getenv("AUTH_AUTHORIZE_URL"),
                    accessTokenUrl = System.getenv("AUTH_ACCESS_TOKEN_URL"),
                    requestMethod = HttpMethod.Post,
                    clientId = System.getenv("AUTH_CLIENT_ID"),
                    clientSecret = System.getenv("AUTH_CLIENT_SECRET"),
                    defaultScopes = listOf("openid", "profile"),
                    extraAuthParameters = listOf("audience" to System.getenv("AUTH_AUDIENCE")),
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
