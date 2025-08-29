package no.bekk.util

import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.util.*
import java.util.*

/**
 * Request context utilities for correlation tracking and structured logging
 */
object RequestContext {
    private val CORRELATION_ID_KEY = AttributeKey<String>("correlationId")
    private val REQUEST_START_TIME_KEY = AttributeKey<Long>("requestStartTime")
    
    /**
     * Generate or retrieve correlation ID for the current request
     */
    fun ApplicationCall.getOrCreateCorrelationId(): String {
        return attributes.getOrNull(CORRELATION_ID_KEY)
            ?: generateCorrelationId().also { 
                attributes.put(CORRELATION_ID_KEY, it)
            }
    }
    
    /**
     * Get existing correlation ID for the current request
     */
    fun ApplicationCall.getCorrelationId(): String? {
        return attributes.getOrNull(CORRELATION_ID_KEY)
    }
    
    /**
     * Set the request start time for tracking total request duration
     */
    fun ApplicationCall.setRequestStartTime(startTime: Long) {
        attributes.put(REQUEST_START_TIME_KEY, startTime)
    }
    
    /**
     * Get the request start time
     */
    fun ApplicationCall.getRequestStartTime(): Long? {
        return attributes.getOrNull(REQUEST_START_TIME_KEY)
    }
    
    /**
     * Generate a new correlation ID
     */
    private fun generateCorrelationId(): String {
        return UUID.randomUUID().toString().take(8)
    }
    
    /**
     * Get request info for logging
     */
    fun ApplicationCall.getRequestInfo(): String {
        val correlationId = getCorrelationId() ?: "unknown"
        return "[${request.httpMethod.value} ${request.uri}] [correlationId: $correlationId]"
    }
}