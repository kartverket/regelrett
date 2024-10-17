package no.bekk.util

import com.azure.identity.ClientSecretCredentialBuilder
import com.microsoft.graph.models.Group
import com.microsoft.graph.serviceclient.GraphServiceClient
import no.bekk.configuration.AppConfig
import no.bekk.configuration.getDatabaseConnection
import no.bekk.database.*
import java.util.UUID

class RemoveTeamAndFunctionHelper {
    val contextRepository = ContextRepository()
    fun run() {
        val connection = getDatabaseConnection()
        connection.autoCommit = false
        try {
            val deleteContextAnswersQuery = "DELETE FROM answers WHERE context_id NOT IN (SELECT id FROM contexts)"
            val deleteContextCommentsQuery = "DELETE FROM comments WHERE context_id NOT IN (SELECT id FROM contexts)"
            val deleteFunctionAnswersQuery = "DELETE FROM answers WHERE function_id IS NOT NULL"
            val deleteFunctionCommentsQuery = "DELETE FROM comments WHERE function_id IS NOT NULL"

            connection.prepareStatement(deleteContextAnswersQuery).execute()
            connection.prepareStatement(deleteContextCommentsQuery).execute()
            connection.prepareStatement(deleteFunctionAnswersQuery).execute()
            connection.prepareStatement(deleteFunctionCommentsQuery).execute()

            val getAllTeamsAnswersQuery = "SELECT DISTINCT team, table_id FROM answers WHERE team IS NOT NULL"
            val getAllTeamsCommentsQuery = "SELECT DISTINCT team, table_id FROM answers WHERE team IS NOT NULL"

            val teams = mutableSetOf<Pair<String, String>>()

            var resultSet = connection.prepareStatement(getAllTeamsAnswersQuery).executeQuery()
            while (resultSet.next()) {
                teams.add(
                    Pair(resultSet.getString("team"), resultSet.getString("table_id"))
                )
            }
            resultSet = connection.prepareStatement(getAllTeamsCommentsQuery).executeQuery()
            while (resultSet.next()) {
                teams.add(
                    Pair(resultSet.getString("team"), resultSet.getString("table_id"))
                )
            }

            val updateAnswersStatement = connection.prepareStatement("UPDATE answers SET context_id = ?, table_id = ?, team = NULL WHERE team = ?")
            val updateCommentsStatement = connection.prepareStatement("UPDATE comments SET context_id = ?, table_id = ?, team = NULL WHERE team = ?")
            var idx = 0
            for ((team, tableId) in teams) {
                val group = MicrosoftServiceInternal2.getGroup(team)
                val inserted = contextRepository.insertContext(
                    DatabaseContextRequest(
                        teamId = team,
                        tableId = tableId,
                        name = group.displayName + idx + idx
                    )
                )
                updateAnswersStatement.setObject(1, UUID.fromString(inserted.id))
                updateAnswersStatement.setString(2, inserted.tableId)
                updateAnswersStatement.setString(3, group.id)
                updateAnswersStatement.addBatch()

                updateCommentsStatement.setObject(1, UUID.fromString(inserted.id))
                updateCommentsStatement.setString(2, inserted.tableId)
                updateCommentsStatement.setString(3, group.id)
                updateCommentsStatement.addBatch()
                idx++
            }

            updateAnswersStatement.executeBatch()
            updateCommentsStatement.executeBatch()
            connection.commit()
            logger.info("Updated ${teams.size} answers or comments")
        } catch (e: Exception) {
            throw RuntimeException("Error migrating to context", e)
        } finally {
            connection.autoCommit = true
            connection.close()
        }
    }
}

private object MicrosoftServiceInternal2 {
    private val tenantId = AppConfig.oAuth.tenantId
    private val clientId = AppConfig.oAuth.clientId
    private val clientSecret = AppConfig.oAuth.clientSecret

    private val scopes = "https://graph.microsoft.com/.default"
    private val credential = ClientSecretCredentialBuilder().clientId(clientId).tenantId(tenantId).clientSecret(clientSecret).build()
    private val graphClient = GraphServiceClient(credential, scopes)

    fun getGroup(groupId: String): Group {
        return graphClient.groups().byGroupId(groupId).get()
    }
}