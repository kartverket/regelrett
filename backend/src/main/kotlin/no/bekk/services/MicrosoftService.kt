package no.bekk.services

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.request.forms.*
import io.ktor.client.statement.*
import io.ktor.http.*
import kotlinx.serialization.json.Json
import no.bekk.configuration.Config
import no.bekk.configuration.getTokenUrl
import no.bekk.domain.MicrosoftGraphGroup
import no.bekk.domain.MicrosoftGraphGroupsResponse
import no.bekk.domain.MicrosoftGraphUser
import no.bekk.domain.MicrosoftOnBehalfOfTokenResponse
import org.slf4j.LoggerFactory

interface MicrosoftService {
    suspend fun requestTokenOnBehalfOf(jwtToken: String?): String
    suspend fun fetchGroups(bearerToken: String): List<MicrosoftGraphGroup>
    suspend fun fetchCurrentUser(bearerToken: String): MicrosoftGraphUser
    suspend fun fetchUserByUserId(bearerToken: String, userId: String): MicrosoftGraphUser
}

class MicrosoftServiceImpl(private val config: Config, private val client: HttpClient = HttpClient(CIO)) : MicrosoftService {
    private val logger = LoggerFactory.getLogger(MicrosoftService::class.java)
    val json = Json { ignoreUnknownKeys = true }

    override suspend fun requestTokenOnBehalfOf(jwtToken: String?): String {
        val response: HttpResponse = jwtToken?.let {
            client.post(getTokenUrl(config.oAuth)) {
                contentType(ContentType.Application.FormUrlEncoded)
                setBody(
                    FormDataContent(
                        Parameters.build {
                            append("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer")
                            append("client_id", config.oAuth.clientId)
                            append("client_secret", config.oAuth.clientSecret)
                            append("assertion", it)
                            append("scope", "GroupMember.Read.All")
                            append("requested_token_use", "on_behalf_of")
                        },
                    ),
                )
            }
        } ?: throw IllegalStateException("No stored UserSession")

        val responseBody = response.body<String>()
        val microsoftOnBehalfOfTokenResponse: MicrosoftOnBehalfOfTokenResponse = json.decodeFromString(responseBody)
        return microsoftOnBehalfOfTokenResponse.accessToken
    }

    override suspend fun fetchGroups(bearerToken: String): List<MicrosoftGraphGroup> {
        // The relevant groups from Entra ID have a known prefix.
        val url =
            "${config.microsoftGraph.baseUrl + config.microsoftGraph.memberOfPath}?\$count=true&\$select=id,displayName"

        val response: HttpResponse = client.get(url) {
            bearerAuth(bearerToken)
            header("ConsistencyLevel", "eventual")
        }
        val responseBody = response.body<String>()

        if (response.status != HttpStatusCode.OK) {
            logger.warn("Failed to get groups: $responseBody")
            throw IllegalStateException()
        }

        val microsoftGraphGroupsResponse: MicrosoftGraphGroupsResponse =
            json.decodeFromString(responseBody)
        return microsoftGraphGroupsResponse.value.map {
            MicrosoftGraphGroup(
                id = it.id,
                displayName = it.displayName,
            )
        }
    }

    override suspend fun fetchCurrentUser(bearerToken: String): MicrosoftGraphUser {
        val url = "${config.microsoftGraph.baseUrl}/v1.0/me?\$select=id,displayName,mail"

        val response: HttpResponse = client.get(url) {
            bearerAuth(bearerToken)
            header("ConsistencyLevel", "eventual")
        }

        val responseBody = response.body<String>()
        return json.decodeFromString<MicrosoftGraphUser>(responseBody)
    }

    override suspend fun fetchUserByUserId(bearerToken: String, userId: String): MicrosoftGraphUser {
        val url = "${config.microsoftGraph.baseUrl}/v1.0/users/$userId"

        val response: HttpResponse = client.get(url) {
            bearerAuth(bearerToken)
            header("ConsistencyLevel", "eventual")
        }

        val responseBody = response.body<String>()

        if (response.status != HttpStatusCode.OK) {
            logger.error("Error fetching user. Status: {}, Response: {}", response.status, responseBody)
            throw IllegalStateException("Failed to fetch user with ID $userId. Status: ${response.status}")
        }

        return json.decodeFromString<MicrosoftGraphUser>(responseBody)
    }
}
