package no.bekk.util

import org.slf4j.Logger
import org.slf4j.LoggerFactory

val logger: Logger = LoggerFactory.getLogger("no.bekk.logger")

/**
 * Creates a logger for the calling class
 */
inline fun <reified T> T.logger(): Logger = LoggerFactory.getLogger(T::class.java)

/**
 * Creates a logger with the specified name
 */
fun getLogger(name: String): Logger = LoggerFactory.getLogger(name)

