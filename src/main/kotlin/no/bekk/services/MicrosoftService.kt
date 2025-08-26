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
import no.bekk.util.logger
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
        logger.debug("Requesting on-behalf-of token from Microsoft")
        
        val response: HttpResponse = jwtToken?.let {
            logger.debug("Making token request to: ${getTokenUrl(config.oAuth)}")
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
        } ?: run {
            logger.error("No JWT token provided for on-behalf-of request")
            throw IllegalStateException("No stored UserSession")
        }

        if (response.status != HttpStatusCode.OK) {
            logger.error("Failed to get on-behalf-of token. Status: ${response.status}")
            throw IllegalStateException("Failed to get on-behalf-of token. Status: ${response.status}")
        }

        val responseBody = response.body<String>()
        val microsoftOnBehalfOfTokenResponse: MicrosoftOnBehalfOfTokenResponse = json.decodeFromString(responseBody)
        logger.debug("Successfully obtained on-behalf-of token")
        return microsoftOnBehalfOfTokenResponse.accessToken
    }

    override suspend fun fetchGroups(bearerToken: String): List<MicrosoftGraphGroup> {
        logger.debug("Fetching user groups from Microsoft Graph")
        
        // The relevant groups from Entra ID have a known prefix.
        val url =
            "${config.microsoftGraph.baseUrl + config.microsoftGraph.memberOfPath}?\$count=true&\$select=id,displayName"

        logger.debug("Making request to Microsoft Graph: $url")
        val response: HttpResponse = client.get(url) {
            bearerAuth(bearerToken)
            header("ConsistencyLevel", "eventual")
        }
        val responseBody = response.body<String>()

        if (response.status != HttpStatusCode.OK) {
            logger.error("Failed to get groups from Microsoft Graph. Status: ${response.status}, Response: $responseBody")
            throw IllegalStateException("Failed to get groups. Status: ${response.status}")
        }

        val microsoftGraphGroupsResponse: MicrosoftGraphGroupsResponse =
            json.decodeFromString(responseBody)
        val groups = microsoftGraphGroupsResponse.value.map {
            MicrosoftGraphGroup(
                id = it.id,
                displayName = it.displayName,
            )
        }
        
        logger.debug("Successfully fetched ${groups.size} groups from Microsoft Graph")
        return groups
    }

    override suspend fun fetchCurrentUser(bearerToken: String): MicrosoftGraphUser {
        logger.debug("Fetching current user from Microsoft Graph")
        
        val url = "${config.microsoftGraph.baseUrl}/v1.0/me?\$select=id,displayName,mail"

        logger.debug("Making request to Microsoft Graph: $url")
        val response: HttpResponse = client.get(url) {
            bearerAuth(bearerToken)
            header("ConsistencyLevel", "eventual")
        }

        val responseBody = response.body<String>()
        
        if (response.status != HttpStatusCode.OK) {
            logger.error("Failed to fetch current user. Status: ${response.status}, Response: $responseBody")
            throw IllegalStateException("Failed to fetch current user. Status: ${response.status}")
        }

        val user = json.decodeFromString<MicrosoftGraphUser>(responseBody)
        logger.debug("Successfully fetched current user: ${user.displayName}")
        return user
    }

    override suspend fun fetchUserByUserId(bearerToken: String, userId: String): MicrosoftGraphUser {
        logger.debug("Fetching user by ID from Microsoft Graph: $userId")
        
        val url = "${config.microsoftGraph.baseUrl}/v1.0/users/$userId"

        logger.debug("Making request to Microsoft Graph: $url")
        val response: HttpResponse = client.get(url) {
            bearerAuth(bearerToken)
            header("ConsistencyLevel", "eventual")
        }

        val responseBody = response.body<String>()

        if (response.status != HttpStatusCode.OK) {
            logger.error("Error fetching user by ID: $userId. Status: ${response.status}, Response: $responseBody")
            throw IllegalStateException("Failed to fetch user with ID $userId. Status: ${response.status}")
        }

        val user = json.decodeFromString<MicrosoftGraphUser>(responseBody)
        logger.debug("Successfully fetched user by ID: ${user.displayName}")
        return user
    }
}
