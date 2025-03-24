package no.bekk.database

import no.bekk.TestDatabase
import no.bekk.configuration.Database
import no.bekk.configuration.JDBCDatabase
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import java.util.*

class ContextRepositoryTest {
    @Test
    fun `get context by id`() {
        val (contextRepository, context) = defaultSetup()
        val fetched = contextRepository.getContext(context.id)

        assertEquals(context, fetched)
    }

    @Test
    fun `get context by teamId`() {
        val (contextRepository, context) = defaultSetup()
        val fetchedList = contextRepository.getContextsByTeamId(context.teamId)

        assertEquals(1, fetchedList.size)
        assertEquals(context, fetchedList.first())
    }

    @Test
    fun `get context by teamId and formId`() {
        val (contextRepository, context) = defaultSetup()
        val fetchedList = contextRepository.getContextByTeamIdAndFormId(context.teamId, context.formId)

        assertEquals(1, fetchedList.size)
        assertEquals(context, fetchedList.first())
    }

    @Test
    fun `delete context`() {
        val (contextRepository, context) = defaultSetup()
        assertTrue(contextRepository.deleteContext(context.id))
    }

    @Test
    fun `change context team`() {
        val (contextRepository, context) = defaultSetup()
        val newTeamId = UUID.randomUUID().toString()
        assertTrue(contextRepository.changeTeam(context.id, newTeamId))

        val updatedContext = contextRepository.getContext(context.id)
        assertEquals(newTeamId, updatedContext.teamId)
    }

    private fun defaultSetup(
        teamId: String = "teamId",
        formId: String = "formId",
        name: String = "name"
    ): Pair<ContextRepositoryImpl, DatabaseContext> {
        val contextRepository = ContextRepositoryImpl(database)
        val context = contextRepository.insertContext(DatabaseContextRequest(teamId, formId, name))

        return Pair(contextRepository, context)
    }

    @AfterEach
    fun cleanup() {
        database.getConnection().use { connection ->
            connection.createStatement().use { statement ->
                statement.executeUpdate("DELETE FROM contexts")
            }
        }
    }

    companion object {

        private lateinit var testDatabase: TestDatabase
        private lateinit var database: Database

        @JvmStatic
        @BeforeAll
        fun setup() {
            testDatabase = TestDatabase()
            database = JDBCDatabase.create(testDatabase.getTestdatabaseConfig())
        }

        @JvmStatic
        @AfterAll
        fun stopDatabase() {
            testDatabase.stopTestDatabase()
        }
    }
}