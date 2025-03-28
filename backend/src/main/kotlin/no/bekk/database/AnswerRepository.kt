package no.bekk.database

import no.bekk.configuration.Database
import no.bekk.util.logger
import java.sql.SQLException
import java.util.*

interface AnswerRepository {
    fun getAnswersByContextIdFromDatabase(contextId: String): List<DatabaseAnswer>
    fun getAnswersByContextAndRecordIdFromDatabase(contextId: String, recordId: String): List<DatabaseAnswer>
    fun copyAnswersFromOtherContext(newContextId: String, contextToCopy: String)
    fun insertAnswerOnContext(answer: DatabaseAnswerRequest): DatabaseAnswer
}

class AnswerRepositoryImpl(private val database: Database) : AnswerRepository {
    override fun getAnswersByContextIdFromDatabase(contextId: String): List<DatabaseAnswer> {
        logger.debug("Fetching answers from database for contextId: $contextId")

        return try {
            database.getConnection().use { conn ->
                val statement = conn.prepareStatement(
                    "SELECT id, actor, record_id, question_id, answer, updated, answer_type, answer_unit FROM answers WHERE context_id = ? order by updated"
                )
                statement.setObject(1, UUID.fromString(contextId))
                val resultSet = statement.executeQuery()
                buildList {
                    while (resultSet.next()) {
                        add(
                            DatabaseAnswer(
                                actor = resultSet.getString("actor"),
                                recordId = resultSet.getString("record_id"),
                                questionId = resultSet.getString("question_id"),
                                answer = resultSet.getString("answer"),
                                updated = resultSet.getObject("updated", java.time.LocalDateTime::class.java)
                                    ?.toString() ?: "",
                                answerType = resultSet.getString("answer_type"),
                                answerUnit = resultSet.getString("answer_unit"),
                                contextId = contextId
                            )
                        )
                    }
                }.also {
                    logger.debug("Successfully fetched context's $contextId answers from database.")
                }
            }
        } catch (e: SQLException) {
            logger.error("Error fetching answers from database for contextId: $contextId. ${e.message}", e)
            throw RuntimeException("Error fetching answers from database", e)
        }
    }

    override fun getAnswersByContextAndRecordIdFromDatabase(
        contextId: String,
        recordId: String
    ): List<DatabaseAnswer> {
        logger.debug("Fetching answers from database for contextId: $contextId with recordId: $recordId")

        return try {
            database.getConnection().use { conn ->
                val statement = conn.prepareStatement(
                    "SELECT id, actor, question_id, answer, updated, answer_type, answer_unit FROM answers WHERE context_id = ? AND record_id = ? order by updated"
                )
                statement.setObject(1, UUID.fromString(contextId))
                statement.setString(2, recordId)
                val resultSet = statement.executeQuery()
                buildList {
                    while (resultSet.next()) {
                        add(
                            DatabaseAnswer(
                                actor = resultSet.getString("actor"),
                                recordId = recordId,
                                questionId = resultSet.getString("question_id"),
                                answer = resultSet.getString("answer"),
                                updated = resultSet.getObject("updated", java.time.LocalDateTime::class.java)
                                    .toString(),
                                answerType = resultSet.getString("answer_type"),
                                answerUnit = resultSet.getString("answer_unit"),
                                contextId = contextId
                            )
                        )
                    }
                }.also {
                    logger.debug("Successfully fetched context's $contextId answers with record id $recordId from database.")
                }
            }
        } catch (e: SQLException) {
            logger.error(
                "Error fetching answers from database for contextId: $contextId with recordId $recordId. ${e.message}",
                e
            )
            throw RuntimeException("Error fetching answers from database", e)
        }
    }

    override fun copyAnswersFromOtherContext(newContextId: String, contextToCopy: String) {
        logger.info("Copying most recent answers from context $contextToCopy to new context $newContextId")
        val mostRecentAnswers = getLatestAnswersByContextIdFromDatabase(contextToCopy)

        mostRecentAnswers.forEach { answer ->
            try {
                insertAnswerOnContext(
                    DatabaseAnswerRequest(
                        actor = answer.actor,
                        recordId = answer.recordId,
                        questionId = answer.questionId,
                        answer = answer.answer,
                        answerType = answer.answerType,
                        answerUnit = answer.answerUnit,
                        contextId = newContextId
                    )
                )
                logger.info("Answer for questionId ${answer.questionId} copied to context $newContextId")
            } catch (e: SQLException) {
                logger.error(
                    "Error copying answer for questionId ${answer.questionId} to context $newContextId: ${e.message}",
                    e
                )
                throw RuntimeException("Error copying answers to new context", e)
            }
        }
    }

    private fun getLatestAnswersByContextIdFromDatabase(contextId: String): List<DatabaseAnswer> {
        logger.debug("Fetching latest answers from database for contextId: $contextId")

        return try {
            database.getConnection().use { conn ->
                val statement = conn.prepareStatement(
                    """
                SELECT DISTINCT ON (question_id) id, actor, record_id, question_id, answer, updated, answer_type, answer_unit 
                FROM answers
                WHERE context_id = ?
                ORDER BY question_id, updated DESC
            """
                )
                statement.setObject(1, UUID.fromString(contextId))
                val resultSet = statement.executeQuery()
                buildList {
                    while (resultSet.next()) {
                        add(
                            DatabaseAnswer(
                                actor = resultSet.getString("actor"),
                                recordId = resultSet.getString("record_id"),
                                questionId = resultSet.getString("question_id"),
                                answer = resultSet.getString("answer"),
                                updated = resultSet.getObject("updated", java.time.LocalDateTime::class.java)
                                    ?.toString()
                                    ?: "",
                                answerType = resultSet.getString("answer_type"),
                                answerUnit = resultSet.getString("answer_unit"),
                                contextId = contextId
                            )
                        )
                    }
                }.also {
                    logger.info("Successfully fetched latest context's $contextId answers from database.")
                }
            }
        } catch (e: SQLException) {
            logger.error("Error fetching latest answers from database for contextId: $contextId. ${e.message}", e)
            throw RuntimeException("Error fetching latest answers from database", e)
        }
    }

    override fun insertAnswerOnContext(answer: DatabaseAnswerRequest): DatabaseAnswer {
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
        require(answer.contextId != null) {
            "You have to supply a contextId"
        }
        val sqlStatement =
            "INSERT INTO answers (actor, record_id, question_id, answer, answer_type, answer_unit, context_id) VALUES (?, ?, ?, ?, ?, ?, ?) returning *"

        database.getConnection().use { conn ->
            conn.prepareStatement(sqlStatement).use { statement ->
                statement.setString(1, answer.actor)
                statement.setString(2, answer.recordId)
                statement.setString(3, answer.questionId)
                statement.setString(4, answer.answer)
                statement.setString(5, answer.answerType)
                statement.setString(6, answer.answerUnit)
                statement.setObject(7, UUID.fromString(answer.contextId))

                val result = statement.executeQuery()
                if (result.next()) {
                    return DatabaseAnswer(
                        actor = result.getString("actor"),
                        recordId = result.getString("record_id"),
                        questionId = result.getString("question_id"),
                        answer = result.getString("answer"),
                        updated = result.getObject("updated", java.time.LocalDateTime::class.java).toString(),
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
