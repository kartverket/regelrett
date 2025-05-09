package no.bekk.configuration

import io.ktor.server.config.*

data class Config(
    val environment: String,
    val forms: FormConfig,
    val microsoftGraph: MicrosoftGraphConfig,
    val oAuth: OAuthConfig,
    val server: ServerConfig,
    val database: DatabaseConfig,
    val answerHistoryCleanup: AnswerHistoryCleanupConfig,
    val raw: YamlConfig,
)

data class CommandLineArgs(
    val args: Array<String>,
) {
    var configFile: String = ""
    var homePath: String = ""
}

class FormConfig(
    val airTable: AirTableConfig,
    val forms: List<FormInstances>,
)

data class AirTableConfig(
    val baseUrl: String,
)

interface FormInstances {
    val id: String
}

data class AirTableInstanceConfig(
    override val id: String,
    val accessToken: String,
    val baseId: String,
    val tableId: String,
    var viewId: String? = null,
    var webhookId: String? = null,
    var webhookSecret: String? = null,
) : FormInstances

data class YAMLInstanceConfig(
    override val id: String,
    val endpoint: String? = null,
    val resourcePath: String? = null,
) : FormInstances

class MicrosoftGraphConfig(
    val baseUrl: String,
    val memberOfPath: String,
)

data class OAuthConfig(
    val baseUrl: String,
    val tenantId: String,
    val issuerPath: String,
    val authPath: String,
    val tokenPath: String,
    val jwksPath: String,
    val clientId: String,
    val clientSecret: String,
    val superUserGroup: String,
)

fun getIssuer(oAuthConfig: OAuthConfig) = oAuthConfig.baseUrl + "/" + oAuthConfig.tenantId + oAuthConfig.issuerPath
fun getTokenUrl(oAuthConfig: OAuthConfig) = oAuthConfig.baseUrl + "/" + oAuthConfig.tenantId + oAuthConfig.tokenPath
fun getJwksUrl(oAuthConfig: OAuthConfig) = oAuthConfig.baseUrl + "/" + oAuthConfig.tenantId + oAuthConfig.jwksPath

data class ServerConfig(
    val host: String,
    val httpAddr: String,
    val httpPort: Int,
    val routerLogging: Boolean,
    val allowedOrigins: List<String>,

)

class DatabaseConfig(
    val url: String,
    val username: String,
    val password: String,
)

class AnswerHistoryCleanupConfig(
    val cleanupIntervalWeeks: String,
)

fun ApplicationConfig.requireProperty(key: String): String = this.propertyOrNull(key)?.getString()
    ?: throw IllegalStateException("Unable to initialize app config \"$key\"")
