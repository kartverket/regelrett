package no.bekk.routes

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.sessions.*
import no.bekk.authentication.UserSession

fun Route.authenticationRouting() {
    get("/auth-status"){
        val userSession: UserSession? = call.sessions.get<UserSession>()
        if (userSession != null){
            call.respond(HttpStatusCode.OK, mapOf("authenticated" to true))
        } else {
            call.respond(HttpStatusCode.Unauthorized, mapOf("authenticated" to false))
        }
    }

    authenticate ( "auth-oauth-azure" ) {
        get("/login") {
            call.respondText("Login endpoint")
        }

        get("/callback") {
            val currentPrincipal: OAuthAccessTokenResponse.OAuth2? = call.principal()

            // redirects home if the url is not found before authorization
            currentPrincipal?.let { principal ->
                principal.state?.let { state ->
                    call.sessions.set(UserSession(state, principal.accessToken))
                    val redirects = mutableMapOf<String, String>()
                    redirects[state]?.let { redirect ->
                        call.respondRedirect(redirect)
                        return@get
                    }
                }
            }
            call.respondRedirect(System.getenv("FRONTEND_BASE_URL"))
        }
    }
}