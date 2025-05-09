package no.bekk

import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationStopped
import io.ktor.server.application.install
import io.ktor.server.engine.EngineConnectorBuilder
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.defaultheaders.*
import io.ktor.server.plugins.forwardedheaders.*
import kotlinx.coroutines.*
import no.bekk.authentication.initializeAuthentication
import no.bekk.configuration.CommandLineArgs
import no.bekk.configuration.Config
import no.bekk.configuration.Database
import no.bekk.configuration.JDBCDatabase
import no.bekk.configuration.newConfigFromArgs
import no.bekk.di.Dependencies
import no.bekk.di.rootComposer
import no.bekk.plugins.RequestLoggingPlugin
import no.bekk.plugins.configureCors
import no.bekk.plugins.configureRouting
import no.bekk.util.configureBackgroundTasks
import no.bekk.util.logger
import kotlin.time.Duration
import kotlin.time.Duration.Companion.days

fun main(args: Array<String>) {
    val cfg = newConfigFromArgs(CommandLineArgs(args))
    val server = embeddedServer(
        Netty,
        configure = {
            connectors.add(
                EngineConnectorBuilder().apply {
                    port = cfg.server.httpPort
                    host = cfg.server.httpAddr
                },
            )
        },
    ) {
        module(cfg)
    }
    server.start(wait = true)
}

fun CoroutineScope.launchCleanupJob(cleanupIntervalWeeks: String, database: Database): Job {
    val cleanupInterval: Duration = (cleanupIntervalWeeks.toInt() * 7).days

    return launch(Dispatchers.IO) {
        while (isActive) {
            try {
                logger.info("Running scheduled cleanup every $cleanupIntervalWeeks weeks.")
                cleanupAnswersHistory(database)
            } catch (e: Exception) {
                logger.error("Error during answers history cleanup: ${e.message}")
            }
            delay(cleanupInterval.inWholeMilliseconds)
        }
    }
}

fun cleanupAnswersHistory(database: Database) {
    logger.info("Running scheduled cleanup for answers table")
    val query =
        """
            WITH ranked_answers AS
            (SELECT
                id,
                record_id,
                context_id,
                created,
                ROW_NUMBER() OVER (PARTITION BY record_id, context_id ORDER BY created DESC) AS rn
            FROM answers)
            DELETE FROM answers
            USING ranked_answers
            WHERE answers.id = ranked_answers.id AND ranked_answers.rn > 3;
        """.trimIndent()

    database.getConnection().use { conn ->
        conn.prepareStatement(query).use { stmt ->
            val deletedRows = stmt.executeUpdate()
            logger.info("Answer cleanup completed. Deleted $deletedRows rows.")
        }
    }
}

fun Application.module(config: Config) {
    val dependencies = rootComposer(config)

    configureAPILayer(config, dependencies)
    configureBackgroundTasks(dependencies.formService)
    launchCleanupJob(config.answerHistoryCleanup.cleanupIntervalWeeks, dependencies.database)

    monitor.subscribe(ApplicationStopped) {
        (dependencies.database as JDBCDatabase).closePool()
    }
}

fun Application.configureAPILayer(
    config: Config,
    dependencies: Dependencies,
) {
    install(DefaultHeaders) {
        header(
            "Content-Security-Policy",
            "default-src 'self' '${config.server.host}'; ",
        )
    }
    install(ContentNegotiation) {
        json()
    }

    install(XForwardedHeaders)
    if (config.server.routerLogging) {
        install(RequestLoggingPlugin)
    }

    configureCors(config)
    initializeAuthentication(config.oAuth)
    configureRouting(dependencies)
}
