package no.bekk.util

import io.ktor.server.application.*
import org.slf4j.LoggerFactory
import kotlin.system.measureTimeMillis

/**
 * Utility for timing external service calls and calculating their percentage of total request time
 */
object ExternalServiceTimer {
    private val logger = LoggerFactory.getLogger(ExternalServiceTimer::class.java)
    
    /**
     * Execute a block of code and measure its execution time, then log the timing information
     */
    suspend fun <T> time(
        serviceName: String,
        operation: String,
        correlationId: String? = null,
        requestStartTime: Long? = null,
        block: suspend () -> T
    ): T {
        val startTime = System.currentTimeMillis()
        var result: T
        
        val duration = measureTimeMillis {
            result = block()
        }
        
        val percentage = if (requestStartTime != null) {
            val totalRequestTime = System.currentTimeMillis() - requestStartTime
            if (totalRequestTime > 0) {
                String.format("%.1f", (duration.toDouble() / totalRequestTime) * 100)
            } else {
                "N/A"
            }
        } else {
            "N/A"
        }
        
        val correlationInfo = correlationId?.let { " [correlationId: $it]" } ?: ""
        logger.debug("External service call: $serviceName.$operation took ${duration}ms (${percentage}% of request)$correlationInfo")
        
        return result
    }
    
    /**
     * Execute a block of code with timing for Ktor ApplicationCall context
     */
    suspend fun <T> ApplicationCall.timeExternalCall(
        serviceName: String,
        operation: String,
        block: suspend () -> T
    ): T {
        val correlationId = RequestContext.run { getCorrelationId() }
        val requestStartTime = RequestContext.run { getRequestStartTime() }
        
        return time(serviceName, operation, correlationId, requestStartTime, block)
    }
}