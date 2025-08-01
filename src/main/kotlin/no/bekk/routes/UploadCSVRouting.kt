package no.bekk.routes

import io.ktor.http.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import no.bekk.authentication.AuthService
import no.bekk.configuration.Database
import no.bekk.util.logger
import java.io.StringWriter
import java.sql.ResultSet
import java.sql.SQLException
import java.util.*


fun Route.uploadCSVRouting(authService: AuthService, database: Database) {
    route("/dump-csv") {
        get {
            logger.info("Received GET /dump-csv")
            if (!authService.hasSuperUserAccess(call)) {
                call.respond(HttpStatusCode.Unauthorized)
                return@get
            }
            val csvData = getLatestAnswersAndComments(database)
            val csv = csvData.toCsv()

            val fileName = "data.csv"
            call.response.header(
                HttpHeaders.ContentDisposition,
                ContentDisposition.Attachment.withParameter(ContentDisposition.Parameters.FileName, fileName).toString()
            )

            call.respondBytes(
                bytes = csv.toByteArray(Charsets.UTF_8),
                contentType = ContentType.Text.CSV.withCharset(Charsets.UTF_8)
            )
            return@get

        }
    }

}

fun getLatestAnswersAndComments(database: Database): List<AnswersCSVDump> {
    val sqlStatement = """
        SELECT 
            a.question_id, 
            a.answer, 
            a.answer_type, 
            a.answer_unit, 
            a.updated as answer_updated,
            a.actor as answer_actor,
            a.context_id,
            ctx.name as context_name,
            ctx.table_id as table_id,
            ctx.team_id
        FROM 
            answers a
        JOIN 
            (SELECT question_id, record_id, MAX(updated) as latest 
             FROM answers 
             GROUP BY question_id, record_id, context_id) as latest_answers
            ON a.question_id = latest_answers.question_id 
               AND a.record_id = latest_answers.record_id 
               AND a.updated = latest_answers.latest
        JOIN 
            contexts ctx ON a.context_id = ctx.id
        WHERE 
            a.answer IS NOT NULL AND TRIM(a.answer) != '';
    """.trimIndent()

    try {
        val resultList = mutableListOf<AnswersCSVDump>()
        database.getConnection().use { conn ->
            conn.prepareStatement(sqlStatement).use { statement ->
                val resultSet = statement.executeQuery()
                while (resultSet.next()) {
                    resultList.add(mapRowToAnswersCSVDump(resultSet))
                }
            }
        }
        return resultList
    } catch (e: SQLException) {
        throw e
    }
}

fun List<AnswersCSVDump>.toCsv(): String {
    val stringWriter = StringWriter()
    stringWriter.append("questionId,answer,answer_type,answer_unit,answer_updated,answer_actor,context_id,context_name,table_id,team_id\n")
    this.forEach {
        stringWriter.append("\"${it.questionId}\",\"${it.answer}\",\"${it.answerType}\",\"${it.answerUnit}\",\"${it.answerUpdated}\",\"${it.answerActor}\",\"${it.contextId}\",\"${it.contextName}\",\"${it.tableName}\",\"${it.teamId}\"\n")
    }

    return stringWriter.toString()
}

fun mapRowToAnswersCSVDump(rs: ResultSet): AnswersCSVDump {
    return AnswersCSVDump(
        questionId = rs.getString("question_id"),
        answer = rs.getString("answer"),
        answerType = rs.getString("answer_type"),
        answerUnit = rs.getString("answer_unit"),
        answerUpdated = rs.getDate("answer_updated"),
        answerActor = rs.getString("answer_actor"),
        contextId = rs.getString("context_id"),
        tableName = rs.getString("table_id"),
        teamId = rs.getString("team_id"),
        contextName = rs.getString("context_name")
    )
}

data class AnswersCSVDump(
    val questionId: String,
    val answer: String,
    val answerType: String,
    val answerUnit: String?,
    val answerUpdated: Date,
    val answerActor: String,
    val contextId: String,
    val tableName: String,
    val teamId: String,
    val contextName: String,
)
