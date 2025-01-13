package no.bekk.configuration

import io.ktor.client.*

object AppConfig {
    lateinit var tables: TableConfig
    lateinit var microsoftGraph: MicrosoftGraphConfig
    lateinit var oAuth: OAuthConfig
    lateinit var frontend: FrontendConfig
    lateinit var backend: BackendConfig
    lateinit var db: DbConfig
}

object TableConfig {
    lateinit var airTable: AirTableConfig
    lateinit var tables: List<TableInstance>
}

object AirTableConfig {
    lateinit var baseUrl: String
}

interface TableInstance {
    val id: String
}

data class AirTableInstanceConfig (
    override val id: String,
    val accessToken: String,
    val baseId: String,
    val tableId: String,
    var viewId: String? = null,
    var webhookId: String? = null,
    var webhookSecret: String? = null,
) : TableInstance

data class YAMLInstanceConfig (
    override val id: String,
    val endpoint: String? = null,
    val resourcePath: String? = null
) : TableInstance



object MicrosoftGraphConfig {
    lateinit var baseUrl: String
    lateinit var memberOfPath: String
}

object OAuthConfig {
    lateinit var baseUrl: String
    lateinit var tenantId: String
    lateinit var issuerPath: String
    lateinit var authPath: String
    lateinit var tokenPath: String
    lateinit var jwksPath: String
    lateinit var clientId: String
    lateinit var clientSecret: String
    lateinit var providerUrl: String
    lateinit var superUserMail: String
}

fun OAuthConfig.getIssuer() = AppConfig.oAuth.baseUrl + "/" + AppConfig.oAuth.tenantId + AppConfig.oAuth.issuerPath
fun OAuthConfig.getAuthUrl() = AppConfig.oAuth.baseUrl + "/" + AppConfig.oAuth.tenantId + AppConfig.oAuth.authPath
fun OAuthConfig.getTokenUrl() = AppConfig.oAuth.baseUrl + "/" + AppConfig.oAuth.tenantId + AppConfig.oAuth.tokenPath
fun OAuthConfig.getJwksUrl() = AppConfig.oAuth.baseUrl + "/" + AppConfig.oAuth.tenantId + AppConfig.oAuth.jwksPath

object FrontendConfig {
    lateinit var host: String
}

object BackendConfig {
    lateinit var host: String
}

object DbConfig {
    lateinit var url: String
    lateinit var username: String
    lateinit var password: String
}
