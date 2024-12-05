package no.bekk

import no.bekk.plugins.*
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.config.*
import io.ktor.server.plugins.defaultheaders.*
import no.bekk.authentication.initializeAuthentication
import no.bekk.configuration.*
import no.bekk.util.configureBackgroundTasks

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

private fun loadAppConfig(config: ApplicationConfig) {

    AppConfig.tables = TableConfig.apply {
        airTable = AirTableConfig.apply {
            baseUrl = config.propertyOrNull("airTable.baseUrl")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"airTable.baseUrl\"")
        }
        sikkerhetskontroller = AirTableInstanceConfig(
            accessToken = config.propertyOrNull("airTable.sikkerhetskontroller.accessToken")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"airTable.sikkerhetskontroller.accessToken\""),
            baseId = config.propertyOrNull("airTable.sikkerhetskontroller.baseId")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"airTable.sikkerhetskontroller.baseId\""),
            tableId = config.propertyOrNull("airTable.sikkerhetskontroller.tableId")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"airTable.sikkerhetskontroller.tableId\""),
            viewId = config.propertyOrNull("airTable.sikkerhetskontroller.viewId")?.getString(),
            webhookId = config.propertyOrNull("airTable.sikkerhetskontroller.webhookId")?.getString(),
            webhookSecret = config.propertyOrNull("airTable.sikkerhetskontroller.webhookSecret")?.getString(),

        )
        driftskontinuitet = AirTableInstanceConfig(
            accessToken = config.propertyOrNull("airTable.driftskontinuitet.accessToken")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"airTable.driftskontinuitet.accessToken\""),
            baseId = config.propertyOrNull("airTable.driftskontinuitet.baseId")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"airTable.driftskontinuitet.baseId\""),
            tableId = config.propertyOrNull("airTable.driftskontinuitet.tableId")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"airTable.driftskontinuitet.tableId\""),
            viewId = config.propertyOrNull("airTable.driftskontinuitet.viewId")?.getString(),
            webhookId = config.propertyOrNull("airTable.driftskontinuitet.webhookId")?.getString(),
            webhookSecret = config.propertyOrNull("airTable.driftskontinuitet.webhookSecret")?.getString(),
        )
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

    environment.monitor.subscribe(ApplicationStopped) {
        Database.closePool()
    }
}
