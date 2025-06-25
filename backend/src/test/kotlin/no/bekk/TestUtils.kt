package no.bekk

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.plugins.contentnegotiation.*
import net.mamoe.yamlkt.Yaml
import no.bekk.authentication.AuthService
import no.bekk.configuration.*
import no.bekk.configuration.Database
import no.bekk.configuration.ServerConfig
import no.bekk.database.*
import no.bekk.di.Dependencies
import no.bekk.plugins.configureRouting
import no.bekk.services.FormService
import no.bekk.services.provisioning.ProvisioningService

object TestUtils {
    fun Application.testModule(
        testDatabase: Database = object : MockDatabase {},
        formService: FormService = object : MockFormService {},
        authService: AuthService = object : MockAuthService {},
        provisioningService: ProvisioningService = object : MockProvisioningService {},
        answerRepository: AnswerRepository = AnswerRepositoryImpl(testDatabase),
        commentRepository: CommentRepository = CommentRepositoryImpl(testDatabase),
        contextRepository: ContextRepository = ContextRepositoryImpl(testDatabase),
    ) {
        val exampleConfig = Config(
            homePath = "",
            mode = "development",
            paths = PathsConfig(""),
            microsoftGraph = MicrosoftGraphConfig("", ""),
            oAuth = OAuthConfig("https://test.com", "test", "", "", "", "", "", "", ""),
            server = ServerConfig("", "", 0, false, emptyList()),
            database = DatabaseConfig("", "", ""),
            answerHistoryCleanup = AnswerHistoryCleanupConfig(""),
            frontendDevServer = FrontendDevServerConfig("", 0, "", ""),
            raw = YamlConfig(Yaml.decodeYamlMapFromString("value: null")),
        )

        install(Authentication) {
            jwt("auth-jwt") {
                realm = "test"
                verifier(
                    JWT
                        .require(Algorithm.HMAC256("test-secret"))
                        .withAudience("test-audience")
                        .withIssuer("test-issuer")
                        .build(),
                )
                validate { credentials -> JWTPrincipal(credentials.payload) }
            }
        }

        install(ContentNegotiation) {
            json()
        }

        configureRouting(
            exampleConfig,
            Dependencies(
                testDatabase,
                formService,
                answerRepository,
                provisioningService,
                commentRepository,
                contextRepository,
                authService,
            ),
        )
    }

    fun generateTestToken(): String = JWT.create()
        .withAudience("test-audience")
        .withIssuer("test-issuer")
        .withClaim("oid", "test-user-id")
        .sign(Algorithm.HMAC256("test-secret"))
}
