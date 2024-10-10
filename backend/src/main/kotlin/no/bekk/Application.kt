package no.bekk

import no.bekk.plugins.*
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.config.*
import io.ktor.server.plugins.defaultheaders.*
import kotlinx.coroutines.launch
import no.bekk.authentication.initializeAuthentication
import no.bekk.authentication.installSessions
import no.bekk.configuration.*
import no.bekk.util.RecordIDMapper
import no.bekk.util.TeamNameToTeamIdMapper

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

private fun loadAppConfig(config: ApplicationConfig) {
    // AirTable config
    AppConfig.airTable = AirTableConfig.apply {
        accessToken = config.propertyOrNull("airTable.accessToken")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"airTable.accessToken\"")
        baseUrl = config.propertyOrNull("airTable.baseUrl")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"airTable.baseUrl\"")
        metadataPath = config.propertyOrNull("airTable.metadataPath")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"airTable.metadataPath\"")
        metodeVerkPath = config.propertyOrNull("airTable.metodeVerkPath")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"airTable.metodeVerkPath\"")
        allePath = config.propertyOrNull("airTable.allePath")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"airTable.allePath\"")
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

    AppConfig.backend = BackendConfig.apply {
        host = config.propertyOrNull("backend.host")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"backend.host\"")
    }

    // Db config
    AppConfig.db = DbConfig.apply {
        url = config.propertyOrNull("db.url")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"db.url\"")
        username = config.propertyOrNull("db.username")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"db.username\"")
        password = config.propertyOrNull("db.password")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"db.password\"")
    }

    AppConfig.FRISK = FRISKConfig.apply {
        apiUrl = config.propertyOrNull("frisk.apiUrl")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"apiUrl\"")
        tenantId = config.propertyOrNull("frisk.tenantId")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"frisk.tenantId\"")
        clientId = config.propertyOrNull("frisk.clientId")?.getString() ?: throw IllegalStateException("Unable to initialize app config \"frisk.clientId\"")
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
    runFlywayMigration()
    installSessions()
    initializeAuthentication()
    configureRouting()
    launch {
        RecordIDMapper().updateRecordIdsInDatabase(RecordIDMapper().getIdMapFromAirTable())
        TeamNameToTeamIdMapper().changeFromTeamNameToTeamId()
    }
}
