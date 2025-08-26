package no.bekk.plugins

import io.ktor.server.application.*
import io.ktor.server.plugins.origin
import io.ktor.server.request.*
import no.bekk.util.RequestContext.getOrCreateCorrelationId
import no.bekk.util.logger

val RequestLoggingPlugin =
    createApplicationPlugin(name = "RequestLoggingPlugin") {
      onCall { call ->
        // Generate correlation ID for request tracking
        val correlationId = call.getOrCreateCorrelationId()
        
        // Add correlation ID to response headers for easier tracing
        call.response.headers.append("X-Correlation-ID", correlationId)
        
        call.request.origin.apply {
          logger.info("[${call.request.httpMethod.value} $uri] [correlationId: $correlationId] Request started")
        }
      }
      
      onCallRespond { call ->
        val correlationId = call.getOrCreateCorrelationId()
        logger.info("[${call.request.httpMethod.value} ${call.request.uri}] [correlationId: $correlationId] Response: ${call.response.status()}")
      }
    }
