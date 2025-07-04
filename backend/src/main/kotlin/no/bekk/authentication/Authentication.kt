package no.bekk.authentication

import com.auth0.jwk.JwkProviderBuilder
import io.ktor.client.HttpClient
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.uri
import io.ktor.server.response.*
import io.ktor.server.util.url
import kotlinx.serialization.Serializable
import no.bekk.configuration.Config
import no.bekk.configuration.getIssuer
import no.bekk.configuration.getJwksUrl
import no.bekk.di.Redirects
import java.net.URI
import java.util.concurrent.TimeUnit

@Serializable
data class UserSession(val state: String, val token: String)

fun Application.initializeAuthentication(config: Config, httpClient: HttpClient, redirects: Redirects) {
    val issuer = getIssuer(config.oAuth)
    val clientId = config.oAuth.clientId
    val jwksUri = getJwksUrl(config.oAuth)

    val jwkProvider = JwkProviderBuilder(URI(jwksUri).toURL())
        .cached(10, 24, TimeUnit.HOURS)
        .rateLimited(10, 1, TimeUnit.MINUTES)
        .build()

    install(Authentication) {
        oauth("auth-oauth-azure") {
            urlProvider = {
                "${config.server.appUrl}/callback"
            }
            providerLookup = {
                OAuthServerSettings.OAuth2ServerSettings(
                    name = "azure",
                    authorizeUrl = "${config.oAuth.baseUrl}/${config.oAuth.tenantId}${config.oAuth.authPath}",
                    accessTokenUrl = "${config.oAuth.baseUrl}/${config.oAuth.tenantId}/${config.oAuth.tokenPath}",
                    requestMethod = HttpMethod.Post,
                    clientId = clientId,
                    clientSecret = config.oAuth.clientSecret,
                    defaultScopes = listOf("$clientId/.default"),
                    onStateCreated = { call, state ->
                        call.request.queryParameters["redirectUrl"]?.let {
                            redirects.r[state] = it
                        }
                    },

                )
            }
            client = httpClient
        }

        session<UserSession>("auth-session") {
            validate { session ->
                if (session.state != "" && session.token != "") {
                    session
                } else {
                    null
                }
            }
            challenge {
                val redirectUrl = call.url {
                    path("/login")
                    parameters.append("redirectUrl", call.request.uri)
                    build()
                }
                call.respondRedirect(redirectUrl)
            }
        }

        jwt("auth-jwt") {
            verifier(jwkProvider, issuer) {
                withIssuer(issuer)
                acceptLeeway(3)
                withAudience(clientId)
            }
            validate { jwtCredential ->
                JWTPrincipal(jwtCredential.payload)
            }
            challenge { _, _ ->
                if (call.request.local.uri.startsWith("/api")) {
                    call.respond(HttpStatusCode.Unauthorized, "You are unauthenticated")
                }
            }
        }
    }
}
