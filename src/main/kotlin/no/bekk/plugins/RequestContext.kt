package no.bekk.plugins

import io.ktor.server.application.*
import no.bekk.util.RequestContext
import no.bekk.util.RequestContext.getOrCreateCorrelationId
import no.bekk.util.RequestContext.setRequestStartTime

/**
 * Plugin that sets up request context (correlation ID and timing) for all requests.
 * This is always installed regardless of logging configuration.
 */
val RequestContextPlugin =
    createApplicationPlugin(name = "RequestContextPlugin") {
        onCall { call ->
            // Store current call in ThreadLocal for external service timing
            RequestContext.setCurrentCall(call)
            
            // Set request start time for external service timing calculations
            call.setRequestStartTime(System.currentTimeMillis())
            
            // Generate correlation ID for request tracking
            val correlationId = call.getOrCreateCorrelationId()
            
            // Add correlation ID to response headers for easier tracing
            call.response.headers.append("X-Correlation-ID", correlationId)
        }
        
        onCallRespond { call ->
            // Clear ThreadLocal to prevent memory leaks
            RequestContext.clearCurrentCall()
        }
    }