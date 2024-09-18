package no.bekk.routes

import com.auth0.jwk.JwkProviderBuilder
import com.auth0.jwt.JWT
import com.auth0.jwt.JWTVerifier
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.interfaces.DecodedJWT
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.sessions.*
import io.ktor.util.debug.*
import no.bekk.authentication.UserSession
import no.bekk.configuration.AppConfig
import no.bekk.configuration.getIssuer
import no.bekk.configuration.getJwksUrl
import no.bekk.util.logger
import java.net.URL
import java.security.interfaces.RSAPublicKey
import java.util.*
import java.util.concurrent.TimeUnit


fun Route.authenticationRouting() {

    get("/auth-status") {
        val userSession: UserSession? = call.sessions.get<UserSession>()
        if (userSession == null) {
            logger.debug("User is not authenticated, UserSession is missing or invalid")
            call.respond(HttpStatusCode.Unauthorized, mapOf("authenticated" to false))
        }
        val token = userSession?.token
        if (token.isNullOrEmpty()) {
            logger.debug("User is not authenticated, token is missing or invalid")
            call.respond(HttpStatusCode.Unauthorized, mapOf("authenticated" to false))
        }

        try {
            val jwt = JWT.decode(token)
            val expires = jwt.expiresAt
            if(expires == null || expires.before(Date())) {
                logger.debug("User is not authenticated, token is expired")
                call.respond(HttpStatusCode.Unauthorized, mapOf("authenticated" to false))
            }
            call.respond(HttpStatusCode.OK, mapOf("authenticated" to true))
            }
        catch (ex: Exception) {
            // Handle verification failure
            logger.error("Failed to check authentication status with error message: ${ex.message}")
            call.respond(HttpStatusCode.Unauthorized, mapOf("authenticated" to false))
        }
    }

    authenticate("auth-oauth-azure") {
        get("/login") {
            call.respondText("Login endpoint")
        }
        get("/callback") {
            val currentPrincipal: OAuthAccessTokenResponse.OAuth2? = call.principal()

            // redirects home if the url is not found before authorization
            currentPrincipal?.let { principal ->
                logger.debug("Received OAuth2 principal: {}", principal)
                principal.state?.let { state ->
<<<<<<< HEAD
                    logger.debug("Session set for user: {}", state)
=======
>>>>>>> 0e07cc6f (testing nginx api url)
                    call.sessions.set(UserSession(state, principal.accessToken))
                    val redirects = mutableMapOf<String, String>()
                    redirects[state]?.let { redirect ->
                        call.respondRedirect(redirect)
                        return@get
                    }
                }
            }
            val providerUrl = if (AppConfig.frontend.host.startsWith("localhost")) {
                "http://${AppConfig.frontend.host}"
            } else {
                "https://${AppConfig.frontend.host}"
            }
            logger.debug("Redirecting to provider URL: $providerUrl")
            call.respondRedirect(providerUrl)
        }
    }

    get("/logout") {
        call.sessions.clear<UserSession>()
        call.respondRedirect("/")
    }
}