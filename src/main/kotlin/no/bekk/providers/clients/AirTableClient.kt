package no.bekk.providers.clients

import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.auth.*
import io.ktor.client.plugins.auth.providers.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import no.bekk.domain.AirtableResponse
import no.bekk.domain.MetadataResponse
import no.bekk.domain.Record

@Serializable
data class AirTableBasesResponse(
    val bases: List<AirTableBase>,
    val offset: String? = null,
)

@Serializable
data class AirTableBase(
    val id: String,
    val name: String,
    val permissionLevel: String,
)

class AirTableClient(private val accessToken: String, private val baseUrl: String) {

    private val json = Json { ignoreUnknownKeys = true }

    private val client = HttpClient(CIO) {
        install(Auth) {
            bearer {
                loadTokens {
                    BearerTokens(accessToken, "")
                }
            }
        }
    }

    suspend fun getBases(): AirTableBasesResponse {
        val response = client.get(baseUrl + "/v0/meta/bases")
        val responseBody = response.bodyAsText()
        return json.decodeFromString<AirTableBasesResponse>(responseBody)
    }

    suspend fun getBaseSchema(baseId: String): MetadataResponse {
        val response = client.get(baseUrl + "/v0/meta/bases/$baseId/tables")
        val responseBody = response.bodyAsText()
        return json.decodeFromString<MetadataResponse>(responseBody)
    }

    suspend fun getRecords(baseId: String, tableId: String, viewId: String? = null, offset: String? = null): AirtableResponse {
        val url = buildString {
            append(baseUrl)
            append("/v0/$baseId/$tableId")
            if (viewId != null) {
                append("?view=$viewId")
                if (offset != null) {
                    append("&offset=$offset")
                }
            } else if (offset != null) {
                append("?offset=$offset")
            }
        }
        val response =
            client.get(url)
        val responseBody = response.bodyAsText()
        return json.decodeFromString<AirtableResponse>(responseBody)
    }

    suspend fun getRecord(baseId: String, tableId: String, recordId: String): Record {
        val response = client.get(baseUrl + "/v0/$baseId/$tableId/$recordId")
        val responseBody = response.bodyAsText()
        return json.decodeFromString<Record>(responseBody)
    }

    suspend fun refreshWebhook(baseId: String, webhookId: String): Int {
        val url = "$baseUrl/v0/bases/$baseId/webhooks/$webhookId/refresh"
        val response: HttpResponse = client.post(url) {
            header("Authorization", "Bearer $accessToken")
        }
        return response.status.value
    }
}
