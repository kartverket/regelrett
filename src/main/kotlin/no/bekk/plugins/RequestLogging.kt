package no.bekk.plugins

import io.ktor.server.application.createApplicationPlugin
import io.ktor.server.plugins.origin
import io.ktor.server.response.*
import no.bekk.util.getCorrelationId
import no.bekk.util.logger

val RequestLoggingPlugin =
    createApplicationPlugin(name = "RequestLoggingPlugin") {
      onCall { call ->
        val correlationId = call.getCorrelationId()
        
        call.request.origin.apply {
          logger.debug("[{}] Request URL: $scheme://$localHost:$localPort$uri", correlationId)
        }
        
        // Add correlation ID to response headers
        call.response.header("X-Correlation-ID", correlationId)
      }
    }
