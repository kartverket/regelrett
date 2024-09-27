package no.bekk.configuration

object AppConfig {
    lateinit var airTable: AirTableConfig
    lateinit var data: DataConfig
    lateinit var microsoftGraph: MicrosoftGraphConfig
    lateinit var oAuth: OAuthConfig
    lateinit var frontend: FrontendConfig
    lateinit var db: DbConfig
}

object AirTableConfig {
    lateinit var accessToken: String
    lateinit var metadataPath: String
    lateinit var metodeVerkPath: String
    lateinit var allePath: String
    lateinit var tableId: String
    lateinit var tableReference: String
}

object DataConfig {
    lateinit var url: String
    lateinit var source: String
}

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
}

fun OAuthConfig.getIssuer() = AppConfig.oAuth.baseUrl + "/" + AppConfig.oAuth.tenantId + AppConfig.oAuth.issuerPath
fun OAuthConfig.getAuthUrl() = AppConfig.oAuth.baseUrl + "/" + AppConfig.oAuth.tenantId + AppConfig.oAuth.authPath
fun OAuthConfig.getTokenUrl() = AppConfig.oAuth.baseUrl + "/" + AppConfig.oAuth.tenantId + AppConfig.oAuth.tokenPath
fun OAuthConfig.getJwksUrl() = AppConfig.oAuth.baseUrl + "/" + AppConfig.oAuth.tenantId + AppConfig.oAuth.jwksPath

object FrontendConfig {
    lateinit var host: String
}

object DbConfig {
    lateinit var url: String
    lateinit var username: String
    lateinit var password: String
}
