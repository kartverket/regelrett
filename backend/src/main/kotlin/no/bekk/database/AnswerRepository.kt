package no.bekk.database


import no.bekk.configuration.Database
import no.bekk.util.logger
import java.sql.SQLException
import java.sql.Types
import java.util.*

object AnswerRepository {

    fun getAnswersByContextIdFromDatabase(contextId: String): MutableList<DatabaseAnswer> {
        logger.debug("Fetching answers from database for contextId: $contextId")

        val answers = mutableListOf<DatabaseAnswer>()
        try {
            Database.getConnection().use { conn ->
                val statement = conn.prepareStatement(
                    "SELECT id, actor, record_id, question, question_id, answer, updated, answer_type, answer_unit FROM answers WHERE context_id = ? order by updated"
                )
                statement.setObject(1, UUID.fromString(contextId))
                val resultSet = statement.executeQuery()
                while (resultSet.next()) {
                    val actor = resultSet.getString("actor")
                    val recordId = resultSet.getString("record_id")
                    val question = resultSet.getString("question")
                    val questionId = resultSet.getString("question_id")
                    val answer = resultSet.getString("answer")
                    val updated = resultSet.getObject("updated", java.time.LocalDateTime::class.java)
                    val answerType = resultSet.getString("answer_type")
                    val answerUnit = resultSet.getString("answer_unit")

                    answers.add(
                        DatabaseAnswer(
                            actor = actor,
                            recordId = recordId,
                            question = question,
                            questionId = questionId,
                            answer = answer,
                            updated = updated?.toString() ?: "",
                            answerType = answerType,
                            answerUnit = answerUnit,
                            contextId = contextId
                        )
                    )
                }
                logger.info("Successfully fetched context's $contextId answers from database.")
            }
        } catch (e: SQLException) {
            logger.error("Error fetching answers from database for contextId: $contextId. ${e.message}", e)
            throw RuntimeException("Error fetching answers from database", e)
        }
        return answers
    }

    fun getAnswersByContextAndRecordIdFromDatabase(contextId: String, recordId: String): MutableList<DatabaseAnswer> {
        logger.debug("Fetching answers from database for contextId: $contextId with recordId: $recordId")

        val answers = mutableListOf<DatabaseAnswer>()
        try {
            Database.getConnection().use { conn ->
                val statement = conn.prepareStatement(
                    "SELECT id, actor, question, question_id, answer, updated, answer_type, answer_unit FROM answers WHERE context_id = ? AND record_id = ? order by updated"
                )
                statement.setObject(1, UUID.fromString(contextId))
                statement.setString(2, recordId)
                val resultSet = statement.executeQuery()
                while (resultSet.next()) {
                    val actor = resultSet.getString("actor")
                    val questionId = resultSet.getString("question_id")
                    val question = resultSet.getString("question")
                    val answer = resultSet.getString("answer")
                    val updated = resultSet.getObject("updated", java.time.LocalDateTime::class.java)
                    val answerType = resultSet.getString("answer_type")
                    val answerUnit = resultSet.getString("answer_unit")

                    answers.add(
                        DatabaseAnswer(
                            actor = actor,
                            recordId = recordId,
                            question = question,
                            questionId = questionId,
                            answer = answer,
                            updated = updated.toString(),
                            answerType = answerType,
                            answerUnit = answerUnit,
                            contextId = contextId
                        )
                    )
                }
                logger.info("Successfully fetched context's $contextId answers with record id $recordId from database.")
            }
        } catch (e: SQLException) {
            logger.error(
                "Error fetching answers from database for contextId: $contextId with recordId $recordId. ${e.message}",
                e
            )
            throw RuntimeException("Error fetching answers from database", e)
        }
        return answers
    }


    fun insertAnswerOnContext(answer: DatabaseAnswerRequest): DatabaseAnswer {
        require(answer.contextId != null) {
            "You have to supply a contextId"
        }

        logger.debug("Inserting answer into database: {}", answer)
        try {
            return insertAnswerRow(answer)
        } catch (e: SQLException) {
            logger.error("Error inserting answer row into database: ${e.message}")
            throw RuntimeException("Error fetching answers from database", e)
        }
    }

    private fun insertAnswerRow(answer: DatabaseAnswerRequest): DatabaseAnswer {
        val sqlStatement =
            "INSERT INTO answers (actor, record_id, question, question_id, answer, team, function_id, answer_type, answer_unit, context_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) returning *"

        Database.getConnection().use { conn ->
            conn.prepareStatement(sqlStatement).use { statement ->
                statement.setString(1, answer.actor)
                statement.setString(2, answer.recordId)
                statement.setString(3, answer.question)
                statement.setString(4, answer.questionId)
                statement.setString(5, answer.answer)
                statement.setString(6, answer.team)
                if (answer.functionId != null) {
                    statement.setInt(7, answer.functionId)
                } else {
                    statement.setNull(7, Types.INTEGER)
                }
                statement.setString(8, answer.answerType)
                statement.setString(9, answer.answerUnit)
                if (answer.contextId != null) {
                    statement.setObject(10, UUID.fromString(answer.contextId))
                } else {
                    statement.setNull(10, Types.OTHER)
                }

                val result = statement.executeQuery()
                if (result.next()) {
                    var functionId: Int? = result.getInt("function_id")
                    if (result.wasNull()) {
                        functionId = null
                    }
                    return DatabaseAnswer(
                        actor = result.getString("actor"),
                        recordId = result.getString("record_id"),
                        questionId = result.getString("question_id"),
                        question = result.getString("question"),
                        answer = result.getString("answer"),
                        updated = result.getObject("updated", java.time.LocalDateTime::class.java).toString(),
                        team = result.getString("team"),
                        functionId = functionId,
                        answerType = result.getString("answer_type"),
                        answerUnit = result.getString("answer_unit"),
                        contextId = result.getString("context_id")
                    )
                } else {
                    throw RuntimeException("Error inserting comments from database")
                }
            }
        }
    }
}
