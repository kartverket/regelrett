package no.bekk.services

import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import no.bekk.domain.Record
import no.bekk.domain.mapToQuestion
import no.bekk.model.airtable.AirTableFieldType
import no.bekk.model.airtable.mapAirTableFieldTypeToAnswerType
import no.bekk.model.airtable.mapAirTableFieldTypeToOptionalFieldType
import no.bekk.model.internal.*

class TableService {
    private val airTableService = AirTableService()

    private suspend fun getTableFromAirTable(tableInternalId: String, tableReferenceId: String, team: String?): Table {
        val metodeverkData = airTableService.fetchDataFromMetodeverk()
        val airTableMetadata = airTableService.fetchDataFromMetadata()

        val tableMetadata = airTableMetadata.tables.first { it.id == tableReferenceId }
        if (tableMetadata.fields == null) {
            throw IllegalArgumentException("Table $tableReferenceId has no fields")
        }

        val questions = metodeverkData.records.map { record ->
            record.mapToQuestion(
                recordId = record.id,
                metaDataFields = tableMetadata.fields,
                answerType = mapAirTableFieldTypeToAnswerType(AirTableFieldType.fromString(record.fields.jsonObject["Svartype"]?.jsonPrimitive?.content ?: "unknown")),
                answerOptions = record.fields.jsonObject["Svar"]?.jsonArray?.map { it.jsonPrimitive.content }
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
            id = tableInternalId,
            name = tableMetadata.name,
            columns = columns,
            records = questions
        )
    }

    private suspend fun getQuestionFromAirtable(recordId: String, tableReferenceId: String): Question {
        val record = airTableService.fetchRecord(recordId)
        val airTableMetadata = airTableService.fetchDataFromMetadata()

        val tableMetadata = airTableMetadata.tables.first { it.id == tableReferenceId }
        if (tableMetadata.fields == null) {
            throw IllegalArgumentException("Table $tableReferenceId has no fields")
        }

        val question = record.mapToQuestion(
                recordId = record.id,
                metaDataFields = tableMetadata.fields,
                answerType = mapAirTableFieldTypeToAnswerType(AirTableFieldType.fromString(record.fields.jsonObject["Svartype"]?.jsonPrimitive?.content ?: "unknown")),
                answerOptions = record.fields.jsonObject["Svar"]?.jsonArray?.map { it.jsonPrimitive.content })

        return question
    }

    private suspend fun getColumnsFromAirTable(tableReferenceId: String): List<Column> {
        val airTableMetadata = airTableService.fetchDataFromMetadata()

        val tableMetadata = airTableMetadata.tables.first { it.id == tableReferenceId }
        if (tableMetadata.fields == null) {
            throw IllegalArgumentException("Table $tableReferenceId has no fields")
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

    suspend fun getTable(tableId: String, team: String?): Table {
        val (tableReferenceId, tableSource) = tableMapping(tableId)
        when (tableSource) {
            TableSources.AIRTABLE ->
                return getTableFromAirTable(
                    tableInternalId = tableId,
                    tableReferenceId = tableReferenceId,
                    team = team
                )
            else -> throw IllegalArgumentException("Table source $tableSource not supported")
        }
    }

    suspend fun getQuestion(tableId: String, recordId: String): Question {
        val (tableReferenceId, tableSource) = tableMapping(tableId)
        when (tableSource) {
            TableSources.AIRTABLE ->
                return getQuestionFromAirtable(
                    recordId = recordId,
                    tableReferenceId = tableReferenceId,
                )
            else -> throw IllegalArgumentException("Table source $tableSource not supported")
        }
    }

    suspend fun getColumns(tableId: String): List<Column> {
        val (tableReferenceId, tableSource) = tableMapping(tableId)
        when (tableSource) {
            TableSources.AIRTABLE ->
                return getColumnsFromAirTable(
                    tableReferenceId = tableReferenceId,
                )
            else -> throw IllegalArgumentException("Table source $tableSource not supported")
        }
    }
}

enum class TableSources {
    AIRTABLE
}

data class TableReference(
    val id: String,
    val source: TableSources
)

fun tableMapping(tableId: String): TableReference {
    return when (tableId) {
        "570e9285-3228-4396-b82b-e9752e23cd73" -> TableReference("tblmSy2Dalsp2Mw5W", TableSources.AIRTABLE)
        else -> throw IllegalArgumentException("Table $tableId not found")
    }
}