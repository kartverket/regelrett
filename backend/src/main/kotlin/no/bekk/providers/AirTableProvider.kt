package no.bekk.providers

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.auth.*
import io.ktor.client.plugins.auth.providers.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import kotlinx.serialization.json.*
import no.bekk.configuration.AppConfig
import no.bekk.domain.AirtableResponse
import no.bekk.domain.MetadataResponse
import no.bekk.domain.Record
import no.bekk.domain.mapToQuestion
import no.bekk.model.airtable.AirTableFieldType
import no.bekk.model.airtable.mapAirTableFieldTypeToAnswerType
import no.bekk.model.airtable.mapAirTableFieldTypeToOptionalFieldType
import no.bekk.model.internal.Column
import no.bekk.model.internal.Option
import no.bekk.model.internal.Table


class AirTableProvider: Provider {

    val json = Json { ignoreUnknownKeys = true }

    val client = HttpClient(CIO) {
        install(Auth) {
            bearer {
                loadTokens {
                    BearerTokens(AppConfig.airTable.accessToken, "")
                }
            }
        }
    }

    override suspend fun getTable(team: String?): Table {
        val metodeverkData = fetchDataFromMetodeverk()
        val airTableMetadata = fetchDataFromMetadata()
        val tableReferenceId = AppConfig.airTable.tableReference
        val tableId = AppConfig.airTable.tableId

        val tableMetadata = airTableMetadata.tables.first { it.id == tableReferenceId }
        if (tableMetadata.fields == null) {
            throw IllegalArgumentException("Table $tableReferenceId has no fields")
        }

        val questions = metodeverkData.records.map { record ->
            record.mapToQuestion(
                metaDataFields = tableMetadata.fields,
                answerType = mapAirTableFieldTypeToAnswerType(AirTableFieldType.fromString(record.fields.jsonObject["Svartype"]?.jsonPrimitive?.content ?: "unknown")),
                answerOptions = record.fields.jsonObject["Svaralternativ"]?.jsonArray?.map { it.jsonPrimitive.content }
            )
        }

        val columns = tableMetadata.fields.map { field ->
            Column(
                type = mapAirTableFieldTypeToOptionalFieldType(AirTableFieldType.fromString(field.type)),
                name = field.name,
                options = field.options?.choices?.map { choice ->
                    Option(name = choice.name, color = choice.color)
                }
            )
        }

        return Table(
            id = tableId,
            name = tableMetadata.name,
            columns = columns,
            records = questions
        )
    }

    private suspend fun fetchDataFromMetadata(): MetadataResponse {
        val response: HttpResponse = client.get(AppConfig.data.url + AppConfig.airTable.metadataPath)
        val responseBody = response.body<String>()
        val metadataResponse: MetadataResponse = json.decodeFromString(responseBody)
        val filteredMetaData = filterDataOnStop(metadataResponse = metadataResponse)
        return filteredMetaData

    }

    private fun filterDataOnStop(metadataResponse: MetadataResponse): MetadataResponse {
        val newTables = metadataResponse.tables.map { table ->
            val fields = table.fields
            if (!fields.isNullOrEmpty()) {
                val stopIndex = fields.indexOfFirst { it.name == "STOP" }
                if (stopIndex != -1) {
                    val newFields = fields.slice(0..< stopIndex)
                    table.copy(fields = newFields)
                } else {
                    table
                }
            } else {
                table
            }
        }

        return metadataResponse.copy(tables = newTables)
    }

    private suspend fun fetchDataFromMetodeverk(): AirtableResponse {
        var offset: String? = null
        val allRecords = mutableListOf<Record>()
        do {
            val response = fetchMetodeverkPage(offset)
            val records = response.records
            allRecords.addAll(records)
            offset = response.offset
        } while (offset != null)

        return AirtableResponse(allRecords)
    }

    private suspend fun fetchMetodeverkPage(offset: String? = null): AirtableResponse {
        val url = buildString {
            append(AppConfig.data.url + AppConfig.airTable.metodeVerkPath)
            if (offset != null) {
                append("&offset=$offset")
            }
        }
        val response: HttpResponse = client.get(url) {
            headers {
                append("Authorization", "Bearer ${AppConfig.airTable.accessToken}")
            }
        }

        val responseBody = response.bodyAsText()
        return json.decodeFromString(responseBody)
    }

    suspend fun fetchRecord(recordId: String): Record {
            val response: HttpResponse = client.get(AppConfig.airTable.baseUrl + AppConfig.airTable.allePath + '/' + recordId)
            val responseBody = response.body<String>()
            val recordResponse: Record = json.decodeFromString(responseBody)
            return recordResponse

    }
}