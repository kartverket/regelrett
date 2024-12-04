package no.bekk.database

import no.bekk.configuration.Database
import java.util.*
import java.sql.SQLException


object ContextRepository {
    fun insertContext(context: DatabaseContextRequest): DatabaseContext {
        val sqlStatement =
            "INSERT INTO contexts (team_id, table_id, name) VALUES(?, ?, ?) returning *"

        try {
            Database.getConnection().use { conn ->
                conn.prepareStatement(sqlStatement).use { statement ->
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
            }
        } catch (e: SQLException) {
            if (e.sqlState == "23505") { // PostgreSQL unique_violation
                throw UniqueConstraintViolationException("A context with the same team_id, table_id and name already exists.")
            } else {
                throw e
            }
        }
    }

    fun getContextsByTeamId(teamId: String): List<DatabaseContext> {
        val sqlStatement = "SELECT * FROM contexts WHERE team_id = ?"

        Database.getConnection().use { conn ->
            conn.prepareStatement(sqlStatement).use { statement ->
                statement.setString(1, teamId)

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
    }

    fun getContextByTeamIdAndTableId(teamId: String, tableId: String): List<DatabaseContext> {
        val sqlStatement = "SELECT * FROM contexts WHERE team_id = ? AND table_id = ?"

        Database.getConnection().use { conn ->
            conn.prepareStatement(sqlStatement).use { statement ->
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
    }

    fun getContext(id: String): DatabaseContext {
        val sqlStatement = "SELECT * FROM contexts WHERE id = ?"
        Database.getConnection().use { conn ->
            conn.prepareStatement(sqlStatement).use { statement ->
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

    fun deleteContext(id: String): Boolean {
        val sqlStatementContext = "DELETE FROM contexts WHERE id = ?"
        Database.getConnection().use { conn ->
            conn.prepareStatement(sqlStatementContext).use { statement ->
                statement.setObject(1, UUID.fromString(id))
                return statement.executeUpdate() > 0
            }
        }
    }
}

class UniqueConstraintViolationException(message: String) : RuntimeException(message)
