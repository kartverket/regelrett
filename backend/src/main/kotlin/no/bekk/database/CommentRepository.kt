package no.bekk.database

import no.bekk.configuration.Database
import no.bekk.util.logger
import java.sql.ResultSet
import java.sql.SQLException
import java.util.*

interface CommentRepository {
    fun getCommentsByContextIdFromDatabase(contextId: String): List<DatabaseComment>
    fun getCommentsByContextAndRecordIdFromDatabase(contextId: String, recordId: String): List<DatabaseComment>
    fun insertCommentOnContext(comment: DatabaseCommentRequest): DatabaseComment
    fun deleteCommentFromDatabase(contextId: String, recordId: String): Boolean
    fun copyCommentsFromOtherContext(newContextId: String, contextToCopy: String)
}

class CommentRepositoryImpl(private val database: Database) : CommentRepository {
    override fun getCommentsByContextIdFromDatabase(contextId: String): List<DatabaseComment> {
        logger.debug("Fetching comments for context: $contextId")

        return try {
            database.getConnection().use { conn ->
                val statement = conn.prepareStatement(
                    "SELECT id, actor, record_id, question_id, comment, updated FROM comments WHERE context_id = ? order by updated"
                )
                statement.setObject(1, UUID.fromString(contextId))
                val resultSet = statement.executeQuery()
                buildList {
                    while (resultSet.next()) {
                        add(
                            DatabaseComment(
                                actor = resultSet.getString("actor"),
                                recordId = resultSet.getString("record_id"),
                                questionId = resultSet.getString("question_id"),
                                comment = resultSet.getString("comment"),
                                updated = resultSet.getObject("updated", java.time.LocalDateTime::class.java)
                                    ?.toString() ?: "",
                                contextId = contextId,
                            )
                        )
                    }
                }.also {
                    logger.debug("Successfully fetched context's $contextId comments from database.")
                }
            }
        } catch (e: SQLException) {
            logger.error("Error fetching comments for context $contextId: ${e.message}")
            throw RuntimeException("Error fetching comments from database", e)
        }
    }

    override fun getCommentsByContextAndRecordIdFromDatabase(
        contextId: String,
        recordId: String
    ): List<DatabaseComment> {
        logger.debug("Fetching comments for context: $contextId with recordId: $recordId")

        return try {
            database.getConnection().use { conn ->
                val statement = conn.prepareStatement(
                    "SELECT id, actor, record_id, question_id, comment, updated FROM comments WHERE context_id = ? AND record_id = ? order by updated"
                )
                statement.setObject(1, UUID.fromString(contextId))
                statement.setString(2, recordId)
                val resultSet = statement.executeQuery()
                buildList {
                    while (resultSet.next()) {
                        add(
                            DatabaseComment(
                                actor = resultSet.getString("actor"),
                                recordId = recordId,
                                questionId = resultSet.getString("question_id"),
                                comment = resultSet.getString("comment"),
                                updated = resultSet.getObject("updated", java.time.LocalDateTime::class.java)
                                    .toString(),
                                contextId = contextId,
                            )
                        )
                    }
                }.also {
                    logger.debug("Successfully fetched context's $contextId comments with recordId $recordId from database.")
                }
            }
        } catch (e: SQLException) {
            logger.error("Error fetching comments for context $contextId with recordId $recordId: ${e.message}")
            throw RuntimeException("Error fetching comments from database", e)
        }
    }

    override fun insertCommentOnContext(comment: DatabaseCommentRequest): DatabaseComment {
        require(comment.contextId != null) {
            "You have to supply a contextId"
        }

        logger.debug("Inserting comment into database: {}", comment)
        return try {
            insertCommentRow(comment)
        } catch (e: SQLException) {
            logger.error("Error inserting answer row into database: ${e.message}")
            throw RuntimeException("Error fetching answers from database", e)
        }
    }

    private fun insertCommentRow(comment: DatabaseCommentRequest): DatabaseComment {
        require(comment.contextId != null) {
            "You have to supply a contextId"
        }

        logger.debug(
            "Inserting or updating comment for recordId={} and contextId={}",
            comment.recordId,
            comment.contextId
        )

        val upsertQuery = """
        INSERT INTO comments (actor, record_id, question_id, comment, context_id) 
        VALUES (?, ?, ?, ?, ?) 
        ON CONFLICT (context_id, record_id) DO UPDATE SET updated = NOW(), comment = ?
        RETURNING *
    """

        database.getConnection().use { conn ->
            logger.debug("Inserting or updating comment row into database: {}", comment)
            conn.prepareStatement(upsertQuery).use { statement ->
                statement.setString(1, comment.actor)
                statement.setString(2, comment.recordId)
                statement.setString(3, comment.questionId)
                statement.setString(4, comment.comment)
                statement.setObject(5, UUID.fromString(comment.contextId))
                statement.setString(6, comment.comment)

                val insertedResult = statement.executeQuery()
                if (insertedResult.next()) {
                    return mapResultSetToDatabaseComment(insertedResult)
                }
                throw RuntimeException("Error inserting comment into database")
            }
        }
    }

    private fun mapResultSetToDatabaseComment(resultSet: ResultSet): DatabaseComment {
        return DatabaseComment(
            actor = resultSet.getString("actor"),
            recordId = resultSet.getString("record_id"),
            questionId = resultSet.getString("question_id"),
            comment = resultSet.getString("comment"),
            updated = resultSet.getObject("updated", java.time.LocalDateTime::class.java).toString(),
            contextId = resultSet.getString("context_id")
        )
    }

    override fun deleteCommentFromDatabase(contextId: String, recordId: String): Boolean {
        logger.debug("Deleting comment from database with recordId: $recordId and contextId: $contextId")
        val query = "DELETE FROM comments WHERE context_id = ? AND record_id = ?"
        database.getConnection().use { conn ->
            conn.prepareStatement(query).use { statement ->
                statement.setObject(1, UUID.fromString(contextId))
                statement.setString(2, recordId)
                return statement.executeUpdate() > 0
            }
        }
    }

    override fun copyCommentsFromOtherContext(newContextId: String, contextToCopy: String) {
        logger.info("Copying most recent comments from context $contextToCopy to new context $newContextId")
        val mostRecentComments = getCommentsByContextIdFromDatabase(contextToCopy)

        mostRecentComments.forEach { comment ->
            try {
                insertCommentOnContext(
                    DatabaseCommentRequest(
                        actor = comment.actor,
                        recordId = comment.recordId,
                        questionId = comment.questionId,
                        comment = comment.comment,
                        contextId = newContextId
                    )
                )
                logger.info("Comment copied to context $newContextId")
            } catch (e: SQLException) {
                logger.error(
                    "Error copying comment to context $newContextId: ${e.message}",
                    e
                )
                throw RuntimeException("Error copying comments to new context", e)
            }
        }
    }
}
