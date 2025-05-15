package no.bekk.configuration

import io.ktor.server.config.*


data class AppConfig(
    val formConfig: FormConfig,
    val microsoftGraph: MicrosoftGraphConfig,
    val oAuth: OAuthConfig,
    val frontend: FrontendConfig,
    val backend: BackendConfig,
    val db: DbConfig,
    val answerHistoryCleanup: AnswerHistoryCleanupConfig,
    val allowedCORSHosts: List<String>
) {
    companion object {
        fun load(config: ApplicationConfig): AppConfig {
            val allowedCORSHosts = System.getenv("ALLOWED_CORS_HOSTS").split(",")

            return AppConfig(
                formConfig = FormConfig.load(config),
                microsoftGraph = MicrosoftGraphConfig.load(config),
                oAuth = OAuthConfig.load(config),
                frontend = FrontendConfig.load(config),
                backend = BackendConfig.load(config),
                db = DbConfig.load(config),
                answerHistoryCleanup = AnswerHistoryCleanupConfig.load(config),
                allowedCORSHosts = allowedCORSHosts
            )
        }
    }
}

class FormConfig(
    val airTable: AirTableConfig,
    val forms: List<FormInstances>
) {
    companion object {
        fun load(config: ApplicationConfig): FormConfig = FormConfig(
            airTable = AirTableConfig(
                baseUrl = config.requireProperty("airTable.baseUrl")
            ),
            forms = config.configList("forms").map { table ->
                when (table.propertyOrNull("type")?.getString()) {
                    "AIRTABLE" -> AirTableInstanceConfig(
                        id = table.requireProperty("id"),
                        accessToken = table.requireProperty("accessToken"),
                        baseId = table.requireProperty("baseId"),
                        tableId = table.requireProperty("tableId"),
                        viewId = table.propertyOrNull("viewId")?.getString(),
                        webhookId = table.propertyOrNull("webhookId")?.getString(),
                        webhookSecret = table.propertyOrNull("webhookSecret")?.getString(),
                    )

                    "YAML" -> YAMLInstanceConfig(
                        id = table.requireProperty("id"),
                        resourcePath = table.requireProperty("resourcePath"),
                    )

                    else -> throw IllegalStateException("Illegal type \"type\"")
                }
            }
        )
    }
}

data class AirTableConfig(
    val baseUrl: String
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
    val resourcePath: String? = null
) : FormInstances

class MicrosoftGraphConfig(
    val baseUrl: String,
    val memberOfPath: String
) {
    companion object {
        fun load(config: ApplicationConfig): MicrosoftGraphConfig = MicrosoftGraphConfig(
            baseUrl = config.requireProperty("microsoftGraph.baseUrl"),
            memberOfPath = config.requireProperty("microsoftGraph.memberOfPath")
        )
    }
}

class OAuthConfig(
    val baseUrl: String,
    val tenantId: String,
    val issuerPath: String,
    val authPath: String,
    val tokenPath: String,
    val jwksPath: String,
    val clientId: String,
    val clientSecret: String,
    val providerUrl: String,
    val superUserGroup: String
) {
    companion object {
        fun load(config: ApplicationConfig): OAuthConfig = OAuthConfig(
            baseUrl = config.requireProperty("oAuth.baseUrl"),
            tenantId = config.requireProperty("oAuth.tenantId"),
            issuerPath = config.requireProperty("oAuth.issuerPath"),
            authPath = config.requireProperty("oAuth.authPath"),
            tokenPath = config.requireProperty("oAuth.tokenPath"),
            jwksPath = config.requireProperty("oAuth.jwksPath"),
            clientId = config.requireProperty("oAuth.clientId"),
            clientSecret = config.requireProperty("oAuth.clientSecret"),
            providerUrl = config.requireProperty("oAuth.providerUrl"),
            superUserGroup = config.requireProperty("oAuth.superUserGroup")
        )
    }
}

fun getIssuer(oAuthConfig: OAuthConfig) = oAuthConfig.baseUrl + "/" + oAuthConfig.tenantId + oAuthConfig.issuerPath
fun getTokenUrl(oAuthConfig: OAuthConfig) = oAuthConfig.baseUrl + "/" + oAuthConfig.tenantId + oAuthConfig.tokenPath
fun getJwksUrl(oAuthConfig: OAuthConfig) = oAuthConfig.baseUrl + "/" + oAuthConfig.tenantId + oAuthConfig.jwksPath

class FrontendConfig(
    val host: String
) {
    companion object {
        fun load(config: ApplicationConfig): FrontendConfig = FrontendConfig(
            host = config.requireProperty("frontend.host")
        )
    }
}

class BackendConfig(
    val host: String
) {
    companion object {
        fun load(config: ApplicationConfig): BackendConfig = BackendConfig(
            host = config.requireProperty("backend.host")
        )
    }
}

class DbConfig(
    val url: String,
    val username: String,
    val password: String
) {
    companion object {
        fun load(config: ApplicationConfig): DbConfig = DbConfig(
            url = config.requireProperty("db.url"),
            username = config.requireProperty("db.username"),
            password = config.requireProperty("db.password")
        )
    }
}

class AnswerHistoryCleanupConfig(
    val cleanupIntervalWeeks: String
) {
    companion object {
        fun load(config: ApplicationConfig): AnswerHistoryCleanupConfig = AnswerHistoryCleanupConfig(
            cleanupIntervalWeeks = config.requireProperty("answerHistoryCleanup.cleanupIntervalWeeks")
        )
    }
}

fun ApplicationConfig.requireProperty(key: String): String {
    return this.propertyOrNull(key)?.getString()
        ?: throw IllegalStateException("Unable to initialize app config \"$key\"")
}