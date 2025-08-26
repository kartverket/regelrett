package no.bekk.util

import ch.qos.logback.classic.Level
import ch.qos.logback.classic.LoggerContext
import org.slf4j.LoggerFactory

/**
 * Utility object for configuring logging levels at runtime
 */
object LoggingConfig {
    private val loggerContext = LoggerFactory.getILoggerFactory() as LoggerContext
    
    /**
     * Sets the log level for a specific package or class
     */
    fun setLogLevel(packageName: String, level: String) {
        val logger = loggerContext.getLogger(packageName)
        logger.level = Level.valueOf(level.uppercase())
    }
    
    /**
     * Sets the root log level
     */
    fun setRootLogLevel(level: String) {
        val rootLogger = loggerContext.getLogger(ch.qos.logback.classic.Logger.ROOT_LOGGER_NAME)
        rootLogger.level = Level.valueOf(level.uppercase())
    }
    
    /**
     * Enables debug logging for all application packages
     */
    fun enableDebugLogging() {
        setLogLevel("no.bekk", "DEBUG")
    }
    
    /**
     * Enables trace logging for specific debugging scenarios
     */
    fun enableTraceLogging() {
        setLogLevel("no.bekk", "TRACE")
    }
    
    /**
     * Gets current log level for a package
     */
    fun getLogLevel(packageName: String): String? {
        val logger = loggerContext.getLogger(packageName)
        return logger.level?.toString()
    }
}