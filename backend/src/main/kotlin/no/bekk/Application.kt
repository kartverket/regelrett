package no.bekk

import no.bekk.plugins.*
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.config.*
import io.ktor.server.plugins.defaultheaders.*
import kotlinx.coroutines.*
import no.bekk.authentication.initializeAuthentication
import no.bekk.configuration.*
import no.bekk.util.configureBackgroundTasks
import no.bekk.util.logger
import kotlin.time.Duration
import kotlin.time.Duration.Companion.days

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

private fun loadAppConfig(config: ApplicationConfig) {

    AppConfig.formConfig = FormConfig.apply {
        airTable = AirTableConfig.apply {
            baseUrl = config.propertyOrNull("airTable.baseUrl")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"airTable.baseUrl\"")
        }

        forms = config.configList("forms").map { table ->

            when (table.propertyOrNull("type")?.getString()) {
                "AIRTABLE" -> AirTableInstanceConfig(
                id = table.propertyOrNull("id")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"id\""),
                accessToken = table.propertyOrNull("accessToken")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"accessToken\""),
                baseId = table.propertyOrNull("baseId")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"baseId\""),
                tableId = table.propertyOrNull("tableId")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"tableId\""),
                viewId = table.propertyOrNull("viewId")?.getString(),
                webhookId = table.propertyOrNull("webhookId")?.getString(),
                webhookSecret = table.propertyOrNull("webhookSecret")?.getString(),
            )
                "YAML" -> YAMLInstanceConfig(
                    id = table.propertyOrNull("id")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"id\""),
                    endpoint = table.propertyOrNull("endpoint")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"baseId\""),
                    resourcePath = table.propertyOrNull("resourcePath")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"tableId\""),
                )
                else -> throw IllegalStateException("Illegal type \"type\"")

            }

        }
    }

    // MicrosoftGraph config
    AppConfig.microsoftGraph = MicrosoftGraphConfig.apply {
        baseUrl = config.propertyOrNull("microsoftGraph.baseUrl")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"microsoftGraph.baseUrl\"")
        memberOfPath = config.propertyOrNull("microsoftGraph.memberOfPath")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"microsoftGraph.memberOfPath\"")
    }

    // OAuth config
    AppConfig.oAuth = OAuthConfig.apply {
        baseUrl = config.propertyOrNull("oAuth.baseUrl")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"oAuth.baseurl\"")
        tenantId = config.propertyOrNull("oAuth.tenantId")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"oAuth.tenantId\"")
        issuerPath = config.propertyOrNull("oAuth.issuerPath")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"oAuth.issuerPath\"")
        authPath = config.propertyOrNull("oAuth.authPath")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"oAuth.authPath\"")
        tokenPath = config.propertyOrNull("oAuth.tokenPath")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"oAuth.tokenPath\"")
        jwksPath = config.propertyOrNull("oAuth.jwksPath")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"oAuth.jwksPath\"")
        clientId = config.propertyOrNull("oAuth.clientId")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"oAuth.clientId\"")
        clientSecret = config.propertyOrNull("oAuth.clientSecret")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"oAuth.clientSecret\"")
        providerUrl = config.propertyOrNull("oAuth.providerUrl")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"oAuth.providerUrl\"")
        superUserMail = config.propertyOrNull("oAuth.superUserMail")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"oAuth.superUserMail\"")
    }

    // Frontend config
    AppConfig.frontend = FrontendConfig.apply {
        host = config.propertyOrNull("frontend.host")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"frontend.host\"")
    }

    AppConfig.backend = BackendConfig.apply {
        host = config.propertyOrNull("backend.host")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"backend.host\"")
    }

    // Db config
    AppConfig.db = DbConfig.apply {
        url = config.propertyOrNull("db.url")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"db.url\"")
        username = config.propertyOrNull("db.username")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"db.username\"")
        password = config.propertyOrNull("db.password")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"db.password\"")
    }

    // Answer history cleanup config
    AppConfig.answerHistoryCleanup = AnswerHistoryCleanupConfig.apply {
        cleanupIntervalWeeks = config.propertyOrNull("answerHistoryCleanup.cleanupIntervalWeeks")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"answerHistoryCleanup.cleanupIntervalWeeks\"")
    }
}

fun CoroutineScope.launchCleanupJob(): Job {
    val cleanupIntervalWeeks = AppConfig.answerHistoryCleanup.cleanupIntervalWeeks.toInt()
    val cleanupInterval: Duration = (cleanupIntervalWeeks * 7).days

    return launch(Dispatchers.IO) {
        while (isActive) {
            try {
                logger.info("Running scheduled cleanup every $cleanupIntervalWeeks weeks.")
                cleanupAnswersHistory()
            } catch (e: Exception) {
                logger.error("Error during answers history cleanup: ${e.message}")
            }
            delay(cleanupInterval.inWholeMilliseconds)
        }
    }
}

fun cleanupAnswersHistory() {
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

    Database.getConnection().use { conn ->
        conn.prepareStatement(query).use { stmt ->
            val deletedRows = stmt.executeUpdate()
            logger.info("Answer cleanup completed. Deleted $deletedRows rows.")
        }
    }
}

fun Application.module() {
    loadAppConfig(environment.config)

    install(DefaultHeaders) {
        header("Content-Security-Policy",
              "default-src 'self' '${AppConfig.backend.host}'; "
        )
    }
    install(ContentNegotiation) {
        json()
    }
    configureCors()
    Database.initDatabase()
    runFlywayMigration()
    initializeAuthentication()
    configureRouting()
    configureBackgroundTasks()

    launchCleanupJob()

    environment.monitor.subscribe(ApplicationStopped) {
        Database.closePool()
    }
}
