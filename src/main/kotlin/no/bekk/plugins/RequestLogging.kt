package no.bekk.plugins

import io.ktor.server.application.*
import io.ktor.server.plugins.origin
import io.ktor.server.request.*
import no.bekk.util.RequestContext.getRequestInfo
import org.slf4j.LoggerFactory

val RequestLoggingPlugin =
    createApplicationPlugin(name = "RequestLoggingPlugin") {
      val logger = LoggerFactory.getLogger("no.bekk.plugins.RequestLogging")
      onCall { call ->
        call.request.origin.apply {
          logger.info("[${call.request.httpMethod.value} $uri] Request started")
        }
      }
      
      onCallRespond { call ->
        logger.info("${call.getRequestInfo()} Response: ${call.response.status()}")
      }
    }
