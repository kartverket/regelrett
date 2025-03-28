package no.bekk

import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.defaultheaders.*
import io.ktor.server.plugins.forwardedheaders.*
import kotlinx.coroutines.*
import no.bekk.authentication.initializeAuthentication
import no.bekk.configuration.AppConfig
import no.bekk.configuration.Database
import no.bekk.configuration.JDBCDatabase
import no.bekk.di.Dependencies
import no.bekk.di.rootComposer
import no.bekk.plugins.configureCors
import no.bekk.plugins.configureRouting
import no.bekk.plugins.RequestLoggingPlugin
import no.bekk.util.configureBackgroundTasks
import no.bekk.util.logger
import kotlin.time.Duration
import kotlin.time.Duration.Companion.days

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
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

fun Application.module() {
    val config = AppConfig.load(environment.config)
    val dependencies = rootComposer(config)

    configureAPILayer(config, dependencies)
    configureBackgroundTasks(dependencies.formService)
    launchCleanupJob(config.answerHistoryCleanup.cleanupIntervalWeeks, dependencies.database)

    environment.monitor.subscribe(ApplicationStopped) {
        (dependencies.database as JDBCDatabase).closePool()
    }
}

fun Application.configureAPILayer(
    config: AppConfig,
    dependencies: Dependencies
) {
    install(DefaultHeaders) {
        header(
            "Content-Security-Policy",
            "default-src 'self' '${config.backend.host}'; "
        )
    }
    install(ContentNegotiation) {
        json()
    }

    install(XForwardedHeaders)
    install(RequestLoggingPlugin)

    configureCors(config)
    initializeAuthentication(config.oAuth)
    configureRouting(dependencies)
}
