package no.bekk.util

import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.util.*
import java.util.*

/**
 * Key for storing correlation ID in call attributes
 */
val CorrelationIdKey = AttributeKey<String>("correlationId")

/**
 * Gets or generates a correlation ID for the current request
 */
fun ApplicationCall.getCorrelationId(): String {
    return attributes.getOrNull(CorrelationIdKey) ?: run {
        val correlationId = request.headers["X-Correlation-ID"] 
            ?: request.headers["X-Request-ID"] 
            ?: UUID.randomUUID().toString()
        attributes.put(CorrelationIdKey, correlationId)
        correlationId
    }
}

/**
 * Logs a message with correlation ID context
 */
fun logWithCorrelation(call: ApplicationCall, message: String, vararg args: Any?) {
    val correlationId = call.getCorrelationId()
    logger.info("[{}] $message", correlationId, *args)
}

/**
 * Logs an error with correlation ID context
 */
fun logErrorWithCorrelation(call: ApplicationCall, message: String, throwable: Throwable? = null, vararg args: Any?) {
    val correlationId = call.getCorrelationId()
    if (throwable != null) {
        logger.error("[{}] $message", correlationId, *args, throwable)
    } else {
        logger.error("[{}] $message", correlationId, *args)
    }
}

/**
 * Logs a debug message with correlation ID context
 */
fun logDebugWithCorrelation(call: ApplicationCall, message: String, vararg args: Any?) {
    val correlationId = call.getCorrelationId()
    logger.debug("[{}] $message", correlationId, *args)
}