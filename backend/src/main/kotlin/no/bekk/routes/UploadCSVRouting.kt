package no.bekk.routes

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import no.bekk.authentication.hasSuperUserAccess
import no.bekk.configuration.Database
import java.io.StringWriter
import java.sql.ResultSet
import java.sql.SQLException
import java.util.Date
import io.ktor.http.ContentType


fun Route.uploadCSVRouting() {
    route("/dump-csv") {
        get {
            if (!hasSuperUserAccess(call)) {
                call.respond(HttpStatusCode.Unauthorized)
                return@get
            }
            val csvData = getLatestAnswersAndComments()
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

fun getLatestAnswersAndComments(): List<AnswersCSVDump> {
    val sqlStatement = "SELECT \n" +
            "    a.question_id, \n" +
            "    a.answer, \n" +
            "    a.answer_type, \n" +
            "    a.answer_unit, \n" +
            "    a.updated as answer_updated,\n" +
            "    c.comment, \n" +
            "    c.updated as comment_updated,\n" +
            "    a.actor as answer_actor,\n" +
            "    c.actor as comment_actor,\n" +
            "    a.context_id,\n" +
            "    ctx.name as context_name,\n" +
            "    ctx.table_id as table_id,\n" +
            "    ctx.team_id\n" +
            "FROM \n" +
            "    answers a\n" +
            "JOIN \n" +
            "    (SELECT question_id, record_id, MAX(updated) as latest FROM answers GROUP BY question_id, record_id) as latest_answers\n" +
            "    ON a.question_id = latest_answers.question_id AND a.record_id = latest_answers.record_id AND a.updated = latest_answers.latest\n" +
            "LEFT JOIN \n" +
            "    comments c ON a.question_id = c.question_id AND a.record_id = c.record_id\n" +
            "LEFT JOIN \n" +
            "    (SELECT question_id, record_id, MAX(updated) as latest FROM comments GROUP BY question_id, record_id) as latest_comments\n" +
            "    ON c.question_id = latest_comments.question_id AND c.record_id = latest_comments.record_id AND c.updated = latest_comments.latest\n" +
            "JOIN \n" +
            "    contexts ctx ON a.context_id = ctx.id;\n"

    try {
        val resultList = mutableListOf<AnswersCSVDump>()
        Database.getConnection().use { conn ->
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
    stringWriter.append("questionId,answer,answer_type,answer_unit,answer_updated,answer_actor,comment,comment_updated,comment_actor,context_id,context_name,table_id,team_id\n")
    this.forEach {
        stringWriter.append("${it.questionId},${it.answer},${it.answerType},${it.answerUnit},${it.answerUpdated},${it.answerActor},${it.comment},${it.commentUpdated},${it.commentActor},${it.contextId},${it.contextName},${it.tableName},${it.teamId}\n")
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
        comment = rs.getString("comment"),
        commentUpdated = rs.getDate("comment_updated"),
        commentActor = rs.getString("comment_actor"),
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
    val comment: String?,
    val commentUpdated: Date?,
    val commentActor: String?,
    val contextId: String,
    val tableName: String,
    val teamId: String,
    val contextName: String,
)
