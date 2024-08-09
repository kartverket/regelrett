package no.bekk.routes

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.userInfoRouting() {
    get("/userinfo"){
        val principal = call.principal<JWTPrincipal>()
        val groupsClaim = principal?.payload?.getClaim("az-groups")

        if(groupsClaim == null || groupsClaim.isMissing || groupsClaim.isNull){
            call.respondText("Error could not fetch user info. User is missing required groups.", status = HttpStatusCode.InternalServerError)
        }

        val groups = groupsClaim?.asList(String::class.java)
        if (groups.isNullOrEmpty()) call.respondText("Error could not fetch user info. User is missing required groups.", status = HttpStatusCode.InternalServerError)

        call.respond(mapOf("groups" to groups))
    }
}