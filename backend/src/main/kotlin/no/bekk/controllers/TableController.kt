package no.bekk.controllers

import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import no.bekk.database.DatabaseRepository
import no.bekk.domain.mapToQuestion
import no.bekk.model.airtable.AirTableFieldType
import no.bekk.model.airtable.mapAirTableFieldTypeToOptionalFieldType
import no.bekk.services.AirTableService
import no.bekk.model.internal.*

class TableController {
    private val airTableService = AirTableService()
    private val databaseRepository = DatabaseRepository()

    private fun getAnswers(team: String?) = team?.let {
        databaseRepository.getAnswersByTeamIdFromDatabase(team)
    } ?: run {
        databaseRepository.getAnswersFromDatabase()
    }

    private fun getComments(team: String?) = team?.let {
        databaseRepository.getCommentsByTeamIdFromDatabase(it)
    } ?: mutableListOf()

    private suspend fun getTableFromAirTable(tableInternalId: String, tableReferenceId: String, team: String?): Table {
        val metodeverkData = airTableService.fetchDataFromMetodeverk()
        val airTableMetadata = airTableService.fetchDataFromMetadata()

        val tableMetadata = airTableMetadata.tables.first { it.id == tableReferenceId }
        if (tableMetadata.fields == null) {
            throw IllegalArgumentException("Table $tableReferenceId has no fields")
        }

        val answers = getAnswers(team)
        val comments = getComments(team)

        val questions = metodeverkData.records.map { record ->
            record.mapToQuestion(
                answers = answers.filter { it.questionId == record.fields.jsonObject["ID"]?.jsonPrimitive?.content},
                comments = comments.filter { it.questionId == record.fields.jsonObject["ID"]?.jsonPrimitive?.content },
                metaDataFields = tableMetadata.fields,
            )
        }

        val fields = tableMetadata.fields.map { field ->
            Field(
                type = mapAirTableFieldTypeToOptionalFieldType(AirTableFieldType.fromString(field.type)),
                name = field.name,
                options = field.options?.choices?.map { choice -> choice.name }
            )
        }

        return Table(
            id = tableInternalId,
            name = tableMetadata.name,
            fields = fields,
            records = questions
        )
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
        "570e9285-3228-4396-b82b-e9752e23cd73" -> TableReference("tblLZbUqA0XnUgC2v", TableSources.AIRTABLE)
        else -> throw IllegalArgumentException("Table $tableId not found")
    }
}