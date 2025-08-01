package no.bekk.plugins

import io.ktor.server.application.createApplicationPlugin
import io.ktor.server.plugins.origin
import no.bekk.util.logger

val RequestLoggingPlugin =
    createApplicationPlugin(name = "RequestLoggingPlugin") {
      onCall { call ->
        call.request.origin.apply {
          logger.debug("Request URL: $scheme://$localHost:$localPort$uri")
        }
      }
    }
