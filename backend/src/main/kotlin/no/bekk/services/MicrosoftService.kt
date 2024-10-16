package no.bekk.services

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.request.forms.*
import io.ktor.client.statement.*
import io.ktor.http.*
import kotlinx.serialization.json.Json
import no.bekk.authentication.UserSession
import no.bekk.configuration.AppConfig
import no.bekk.configuration.getTokenUrl
import no.bekk.domain.MicrosoftGraphGroup
import no.bekk.domain.MicrosoftGraphGroupsResponse
import no.bekk.domain.MicrosoftGraphUser
import no.bekk.domain.MicrosoftOnBehalfOfTokenResponse

class MicrosoftService {

    val json = Json { ignoreUnknownKeys = true }

    val client = HttpClient(CIO)

    suspend fun requestTokenOnBehalfOf(userSession: UserSession?): String {
        val response: HttpResponse = userSession?.let {
            client.post(AppConfig.oAuth.getTokenUrl()) {
                contentType(ContentType.Application.FormUrlEncoded)
                setBody(
                    FormDataContent(
                        Parameters.build {
                            append("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer")
                            append("client_id", AppConfig.oAuth.clientId)
                            append("client_secret", AppConfig.oAuth.clientSecret)
                            append("assertion", it.token)
                            append("scope", "GroupMember.Read.All")
                            append("requested_token_use", "on_behalf_of")
                        }
                    )
                )
            }
        } ?: throw IllegalStateException("No stored UserSession")

        val responseBody = response.body<String>()
        val microsoftOnBehalfOfTokenResponse: MicrosoftOnBehalfOfTokenResponse = json.decodeFromString(responseBody)
        return microsoftOnBehalfOfTokenResponse.accessToken
    }

    suspend fun fetchGroups(bearerToken: String): List<MicrosoftGraphGroup> {
        // The relevant groups from Entra ID have a known prefix.
        val urlEncodedKnownGroupPrefix = "AAD - TF - TEAM - ".encodeURLPath()
        val url =
            "${AppConfig.microsoftGraph.baseUrl + AppConfig.microsoftGraph.memberOfPath}?\$count=true&\$select=id,displayName&\$filter=startswith(displayName,'$urlEncodedKnownGroupPrefix')"

        val response: HttpResponse = client.get(url) {
            bearerAuth(bearerToken)
            header("ConsistencyLevel", "eventual")
        }
        val responseBody = response.body<String>()
        val microsoftGraphGroupsResponse: MicrosoftGraphGroupsResponse =
            json.decodeFromString(responseBody)
        return microsoftGraphGroupsResponse.value.map {
            MicrosoftGraphGroup(
                id = it.id,
                displayName = it.displayName.split("TEAM - ").last()
            )
        }
    }

    suspend fun fetchCurrentUser(bearerToken: String): MicrosoftGraphUser {
        val url = "${AppConfig.microsoftGraph.baseUrl}/v1.0/me?\$select=id,displayName"

        val response: HttpResponse = client.get(url) {
            bearerAuth(bearerToken)
            header("ConsistencyLevel", "eventual")
        }

        val responseBody = response.body<String>()
        return json.decodeFromString<MicrosoftGraphUser>(responseBody)
    }
}
