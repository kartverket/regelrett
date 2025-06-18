package no.bekk.routes

import io.ktor.client.*
import io.ktor.client.request.get
import io.ktor.client.request.request
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.html.*
import io.ktor.server.http.content.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.html.*
import no.bekk.configuration.FrontendDevServerConfig
import no.bekk.routes.*
import no.bekk.util.logger

fun Route.webRouting(cfg: FrontendDevServerConfig) {
    if (application.developmentMode) {
        get("/{...}") {
            logger.info("GETTING GETTET: ${call.request.local.uri}")
            call.respondHtmlTemplate(DevTemplate(cfg)) {}
        }

        // Proxy static asset requests to dev server
        get("/src/{...}") {
            call.respondRedirect("${cfg.host}:${cfg.httpPort}${call.request.local.uri}")
        }
    }
}

class DevTemplate(val cfg: FrontendDevServerConfig) : Template<HTML> {
    override fun HTML.apply() {
        head {
            meta(charset = "UTF-8")
            link {
                rel = "preconnect"
                href = "https://fonts.googleapis.com"
            }
            link {
                rel = "preconnect"
                href = "https://fonts.gstatic.com"
            }
            link {
                rel = "stylesheet"
                href = "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
            }
            title {
                +"Regelrett"
            }
            script(
                type = "module",
            ) {
                unsafe {
                    +"""import RefreshRuntime from '${cfg.devUrl}/@react-refresh'
                    RefreshRuntime.injectIntoGlobalHook(window)
                    window.${'$'}RefreshReg$ = function () {}
                    window.${'$'}RefreshSig$ = function () { return function (type) { return type } }
                    window.__vite_plugin_react_preamble_installed__ = true
                    """
                }
            }

            script(type = "module", src = "${cfg.devUrl}/@vite/client") {}
            script(type = "module", src = "${cfg.devUrl}/src/main.tsx") {}
        }
        body(classes = "kartverket") {
            div { id = "root" }
        }
    }
}
