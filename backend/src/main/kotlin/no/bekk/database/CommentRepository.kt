package no.bekk.database

import no.bekk.configuration.Database
import no.bekk.util.logger
import java.sql.ResultSet
import java.sql.SQLException
import java.util.*

object CommentRepository {
    fun getCommentsByContextIdFromDatabase(contextId: String): MutableList<DatabaseComment> {
        logger.debug("Fetching comments for context: $contextId")
        val comments = mutableListOf<DatabaseComment>()
        try {
            Database.getConnection().use { conn ->
                val statement = conn.prepareStatement(
                    "SELECT id, actor, record_id, question_id, comment, updated FROM comments WHERE context_id = ? order by updated"
                )
                statement.setObject(1, UUID.fromString(contextId))
                val resultSet = statement.executeQuery()
                while (resultSet.next()) {
                    val actor = resultSet.getString("actor")
                    val recordId = resultSet.getString("record_id")
                    val questionId = resultSet.getString("question_id")
                    val comment = resultSet.getString("comment")
                    val updated = resultSet.getObject("updated", java.time.LocalDateTime::class.java)

                    comments.add(
                        DatabaseComment(
                            actor = actor,
                            recordId = recordId,
                            questionId = questionId,
                            comment = comment,
                            updated = updated?.toString() ?: "",
                            contextId = contextId,
                        )
                    )
                }
                logger.debug("Successfully fetched context's $contextId comments from database.")
            }
        } catch (e: SQLException) {
            logger.error("Error fetching comments for context $contextId: ${e.message}")
            throw RuntimeException("Error fetching comments from database", e)
        }
        return comments
    }

    fun getCommentsByContextAndRecordIdFromDatabase(contextId: String, recordId: String): MutableList<DatabaseComment> {
        logger.debug("Fetching comments for context: $contextId with recordId: $recordId")

        val comments = mutableListOf<DatabaseComment>()
        try {
            Database.getConnection().use { conn ->
                val statement = conn.prepareStatement(
                    "SELECT id, actor, record_id, question_id, comment, updated FROM comments WHERE context_id = ? AND record_id = ? order by updated"
                )
                statement.setObject(1, UUID.fromString(contextId))
                statement.setString(2, recordId)
                val resultSet = statement.executeQuery()
                while (resultSet.next()) {
                    val actor = resultSet.getString("actor")
                    val questionId = resultSet.getString("question_id")
                    val comment = resultSet.getString("comment")
                    val updated = resultSet.getObject("updated", java.time.LocalDateTime::class.java)

                    comments.add(
                        DatabaseComment(
                            actor = actor,
                            recordId = recordId,
                            questionId = questionId,
                            comment = comment,
                            updated = updated.toString(),
                            contextId = contextId,
                        )
                    )
                }
                logger.debug("Successfully fetched context's $contextId comments with recordId $recordId from database.")
            }
        } catch (e: SQLException) {
            logger.error("Error fetching comments for context $contextId with recordId $recordId: ${e.message}")
            throw RuntimeException("Error fetching comments from database", e)
        }
        return comments
    }

    fun insertCommentOnContext(comment: DatabaseCommentRequest): DatabaseComment {
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

        logger.debug("Checking if comment exists for recordId={} and contextId={}", comment.recordId, comment.contextId)

        val selectQuery = "SELECT * FROM comments WHERE record_id = ? AND context_id = ?"
        val updateQuery = "UPDATE comments SET comment = ?, updated = NOW() WHERE context_id = ? AND record_id = ?"
        val insertQuery = """
        INSERT INTO comments (actor, record_id, question_id, comment, context_id) 
        VALUES (?, ?, ?, ?, ?) 
        RETURNING * 
    """

        Database.getConnection().use { conn ->
            conn.prepareStatement(selectQuery).use { statement ->
                statement.setString(1, comment.recordId)
                statement.setObject(2, UUID.fromString(comment.contextId))

                val resultSet = statement.executeQuery()
                if (resultSet.next()) {
                    logger.debug(
                        "Updating existing comment for recordId={} and contextId={}",
                        comment.recordId,
                        comment.contextId
                    )
                    conn.prepareStatement(updateQuery).use { updateStatement ->
                        updateStatement.setString(1, comment.comment)
                        updateStatement.setObject(2, UUID.fromString(comment.contextId))
                        updateStatement.setString(3, comment.recordId)

                        val updatedResult = updateStatement.executeUpdate()
                        if (updatedResult > 0) {
                            conn.prepareStatement(selectQuery).use { statement ->
                                statement.setString(1, comment.recordId)
                                statement.setObject(2, UUID.fromString(comment.contextId))
                                val updatedResultSet = statement.executeQuery()
                                if (updatedResultSet.next()) {
                                    return mapResultSetToDatabaseComment(updatedResultSet)
                                }
                            }
                        }
                        throw RuntimeException("Error updating comment")
                    }
                }
            }
            logger.debug("Inserting comment row into database: {}", comment)
            conn.prepareStatement(insertQuery).use { statement ->
                statement.setString(1, comment.actor)
                statement.setString(2, comment.recordId)
                statement.setString(3, comment.questionId)
                statement.setString(4, comment.comment)
                statement.setObject(5, UUID.fromString(comment.contextId))

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

    fun deleteCommentFromDatabase(contextId: String, recordId: String): Boolean {
        logger.debug("Deleting comment from database with recordId: $recordId and contextId: $contextId")
        val query = "DELETE FROM comments WHERE context_id = ? AND record_id = ?"
        Database.getConnection().use { conn ->
            conn.prepareStatement(query).use { statement ->
                statement.setObject(1, UUID.fromString(contextId))
                statement.setString(2, recordId)
                return statement.executeUpdate() > 0
            }
        }
    }
}