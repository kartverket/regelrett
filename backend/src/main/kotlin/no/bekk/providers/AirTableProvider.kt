package no.bekk.providers

import io.ktor.util.date.*
import kotlinx.serialization.json.*
import no.bekk.domain.AirtableResponse
import no.bekk.domain.MetadataResponse
import no.bekk.domain.Record
import no.bekk.domain.mapToQuestion
import no.bekk.model.airtable.AirTableFieldType
import no.bekk.model.airtable.mapAirTableFieldTypeToAnswerType
import no.bekk.model.airtable.mapAirTableFieldTypeToOptionalFieldType
import no.bekk.model.internal.Column
import no.bekk.model.internal.Option
import no.bekk.model.internal.Question
import no.bekk.model.internal.Table
import no.bekk.providers.clients.AirTableClient
import no.bekk.util.logger

class AirTableProvider(
    override val id: String,
    private val airtableClient: AirTableClient,
    private val baseId: String,
    private val tableId: String,
    private val viewId: String? = null
) : TableProvider {

    private val staleTime = 5 * 60 * 1000   // 5 minutes
    val tableCache = mutableMapOf<String, Pair<Table, Long>>()
    val questionCache = mutableMapOf<String, Pair<Question, Long>>()
    val columnCache = mutableMapOf<String, Pair<List<Column>, Long>>()

    val json = Json { ignoreUnknownKeys = true }

    override suspend fun getTable(): Table {
        val now = getTimeMillis()
        val cachedTablePair = tableCache[id]
        if (cachedTablePair != null) {
            val (cachedTable, timestamp) = cachedTablePair
            if (now - timestamp < staleTime) {
                return cachedTable
            }
        }
        val freshTable =  getTableFromAirTable()
        tableCache[id] = Pair(freshTable, now)
        freshTable.records.forEach { record ->
            record.recordId?.let {
                questionCache[it] = Pair(record, now)
            }
        }
        columnCache[id] = Pair(freshTable.columns, now)
        return freshTable
    }

    override suspend fun getQuestion(recordId: String): Question {
        val now = getTimeMillis()
        val cachedQuestionPair = questionCache[recordId]
        if (cachedQuestionPair != null) {
            val (cachedQuestion, timestamp) = cachedQuestionPair
            if (now - timestamp < staleTime) {
                return cachedQuestion
            }
        }
        val freshQuestion = getQuestionFromAirtable(recordId)
        questionCache[recordId] = Pair(freshQuestion, now)
        return freshQuestion
    }

    override suspend fun getColumns(): List<Column> {
        val now = getTimeMillis()
        val cachedColumnsPair = columnCache[id]
        if (cachedColumnsPair != null) {
            val (cachedColumns, timestamp) = cachedColumnsPair
            if (now - timestamp < staleTime) {
                return cachedColumns
            }
        }
        val freshColumns = getColumnsFromAirTable()
        columnCache[id] = Pair(freshColumns, now)
        return freshColumns
    }

    private suspend fun getTableFromAirTable(): Table {
        val allRecords = fetchAllRecordsFromTable()
        val airTableMetadata = fetchMetadataFromBase()

        val tableMetadata = airTableMetadata.tables.first { it.id == tableId }
        if (tableMetadata.fields == null) {
            throw IllegalArgumentException("Table $tableId has no fields")
        }

        val questions = allRecords.records.mapNotNull { record ->
            if (record.fields.jsonObject["Svartype"]?.jsonPrimitive?.content == null) {
                null
            } else {
                try {
                    record.mapToQuestion(
                        recordId = record.id,
                        metaDataFields = tableMetadata.fields,
                        answerType = mapAirTableFieldTypeToAnswerType(
                            AirTableFieldType.fromString(
                                record.fields.jsonObject["Svartype"]?.jsonPrimitive?.content ?: "unknown"
                            )
                        ),
                        answerOptions = record.fields.jsonObject["Svar"]?.jsonArray?.map { it.jsonPrimitive.content }
                    )

                } catch (e: IllegalArgumentException) {
                    logger.error("Answertype ${record.fields.jsonObject["Svartype"]?.jsonPrimitive?.content} caused an error, and is skipped")
                    null
                }
            }
        }

        val columns = tableMetadata.fields.mapNotNull { field ->
            if (field.type == "multipleRecordLinks") {
                null
            } else {
                try {
                    Column(
                        type = mapAirTableFieldTypeToOptionalFieldType(AirTableFieldType.fromString(field.type)),
                        name = field.name,
                        options = field.options?.choices?.map { choice ->
                            Option(name = choice.name, color = choice.color)
                        }
                    )
                } catch (e: IllegalArgumentException) {
                    logger.error("field type ${field.type} could not be mapped, and will be skipped")
                    null
                }
            }
        }

        return Table(
            id = id,
            name = airtableClient.getBases().bases.find { it.id == baseId }?.name ?: tableMetadata.name,
            columns = columns,
            records = questions
        )
    }

    private suspend fun getQuestionFromAirtable(recordId: String): Question {
        val record = fetchRecord(recordId)
        val airTableMetadata = fetchMetadataFromBase()

        val tableMetadata = airTableMetadata.tables.first { it.id == tableId }
        if (tableMetadata.fields == null) {
            throw IllegalArgumentException("Table $tableId has no fields")
        }

        val question = record.mapToQuestion(
            recordId = record.id,
            metaDataFields = tableMetadata.fields,
            answerType = mapAirTableFieldTypeToAnswerType(
                AirTableFieldType.fromString(
                    record.fields.jsonObject["Svartype"]?.jsonPrimitive?.content ?: "unknown"
                )
            ),
            answerOptions = record.fields.jsonObject["Svar"]?.jsonArray?.map { it.jsonPrimitive.content })

        return question
    }

    private suspend fun getColumnsFromAirTable(): List<Column> {
        val airTableMetadata = fetchMetadataFromBase()

        val tableMetadata = airTableMetadata.tables.first { it.id == tableId }
        if (tableMetadata.fields == null) {
            throw IllegalArgumentException("Table $tableId has no fields")
        }
        return tableMetadata.fields.map { field ->
            Column(
                type = mapAirTableFieldTypeToOptionalFieldType(AirTableFieldType.fromString(field.type)),
                name = field.name,
                options = field.options?.choices?.map { choice ->
                    Option(name = choice.name, color = choice.color)
                }
            )
        }
    }

    private fun filterMetadataOnStop(metadataResponse: MetadataResponse): MetadataResponse {
        val newTables = metadataResponse.tables.map { table ->
            val fields = table.fields
            if (!fields.isNullOrEmpty()) {
                val stopIndex = fields.indexOfFirst { it.name == "STOP" }
                if (stopIndex != -1) {
                    val newFields = fields.slice(0..<stopIndex)
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

    private suspend fun fetchMetadataFromBase(): MetadataResponse {
        val metadataResponse = airtableClient.getBaseSchema(baseId)
        val filteredMetaData = filterMetadataOnStop(metadataResponse = metadataResponse)
        return filteredMetaData

    }

    suspend fun fetchAllRecordsFromTable(): AirtableResponse {
        var offset: String? = null
        val allRecords = mutableListOf<Record>()
        do {
            val response = fetchRecordsFromTable(offset)
            val records = response.records
            allRecords.addAll(records)
            offset = response.offset
        } while (offset != null)

        return AirtableResponse(allRecords)
    }

    private suspend fun fetchRecordsFromTable(offset: String? = null): AirtableResponse {
        return airtableClient.getRecords(baseId, tableId, viewId, offset)
    }

    private suspend fun fetchRecord(recordId: String): Record {
        return airtableClient.getRecord(baseId, tableId, recordId)
    }
}