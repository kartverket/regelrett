package no.bekk.database;

import no.bekk.configuration.getDatabaseConnection
import java.util.*
import java.sql.SQLException


class ContextRepository {
    fun insertContext(context: DatabaseContextRequest): DatabaseContext {
        val connection = getDatabaseConnection()
        val sqlStatement =
            "INSERT INTO contexts (team_id, table_id, name) VALUES(?, ?, ?) returning *"

        try {
            connection.prepareStatement(sqlStatement).use { statement ->
                statement.setString(1, context.teamId)
                statement.setString(2, context.tableId)
                statement.setString(3, context.name)

                val result = statement.executeQuery()
                if (result.next()) {
                    return DatabaseContext(
                        id = result.getString("id"),
                        teamId = result.getString("team_id"),
                        tableId = result.getString("table_id"),
                        name = result.getString("name"),
                    )
                } else {
                    throw RuntimeException("Error inserting context into database")
                }
            }
        } catch (e: SQLException) {
            if (e.sqlState == "23505") { // PostgreSQL unique_violation
                throw UniqueConstraintViolationException("A context with the same team_id and name already exists.")
            } else {
                throw e
            }
        }
    }

    fun getContextsByTeamId(teamId: String, tableId: String): List<DatabaseContext> {
        val connection = getDatabaseConnection()
        val sqlStatement = "SELECT * FROM contexts WHERE team_id = ? AND table_id = ?"

        connection.prepareStatement(sqlStatement).use { statement ->
            statement.setString(1, teamId)
            statement.setString(2, tableId)

            val result = statement.executeQuery()
            val contexts = mutableListOf<DatabaseContext>()

            while (result.next()) {
                contexts.add(
                    DatabaseContext(
                        id = result.getString("id"),
                        teamId = result.getString("team_id"),
                        tableId = result.getString("table_id"),
                        name = result.getString("name")
                    )
                )
            }
            return contexts
        }
    }

    fun getContext(id: String): DatabaseContext {
        val connection = getDatabaseConnection()
        val sqlStatement = "SELECT * FROM contexts WHERE id = ?"
        connection.prepareStatement(sqlStatement).use { statement ->
            statement.setObject(1, UUID.fromString(id))
            val result = statement.executeQuery()
            if (result.next()) {
                return DatabaseContext(
                    id = result.getString("id"),
                    teamId = result.getString("team_id"),
                    tableId = result.getString("table_id"),
                    name = result.getString("name")
                )
            } else {
                throw RuntimeException("Error getting context")
            }
        }
    }
}

class UniqueConstraintViolationException(message: String) : RuntimeException(message)
