package no.bekk

import no.bekk.plugins.*
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.config.*
import no.bekk.authentication.initializeAuthentication
import no.bekk.authentication.installSessions
import no.bekk.configuration.*

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

private fun loadAppConfig(config: ApplicationConfig) {
    // AirTable config
    AppConfig.airTable = AirTableConfig.apply {
        accessToken = config.propertyOrNull("airTable.accessToken")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"airTable.accessToken\"")
        metadataPath = config.propertyOrNull("airTable.metadataPath")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"airTable.metadataPath\"")
        metodeVerkPath = config.propertyOrNull("airTable.metodeVerkPath")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"airTable.metodeVerkPath\"")
        allePath = config.propertyOrNull("airTable.allePath")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"airTable.allePath\"")
        tableId = config.propertyOrNull("airTable.tableId")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"airTable.tableId\"")
        tableReference = config.propertyOrNull("airTable.tableReference")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"airTable.tableReference\"")

    }

    // Data source config
    AppConfig.data = DataConfig.apply {
        url = config.propertyOrNull("data.url")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"data.url\"")
        source = config.propertyOrNull("data.source")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"data.source\"")
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
    }

    // Frontend config
    AppConfig.frontend = FrontendConfig.apply {
        host = config.propertyOrNull("frontend.host")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"frontend.host\"")
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
    install(ContentNegotiation) {
        json()
    }
    configureCors()
    runFlywayMigration()
    installSessions()
    initializeAuthentication()
    configureRouting()
}
