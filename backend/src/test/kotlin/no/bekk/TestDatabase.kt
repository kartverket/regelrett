package no.bekk

import no.bekk.configuration.DbConfig
import org.testcontainers.containers.PostgreSQLContainer

class TestDatabase {
    private val postgresContainer = PostgreSQLContainer("postgres:15-alpine").apply {
        start()
    }

    fun getTestdatabaseConfig(): DbConfig {
        return DbConfig(
            url = postgresContainer.jdbcUrl,
            username = postgresContainer.username,
            password = postgresContainer.password,
        )
    }

    fun stopTestDatabase() {
        postgresContainer.stop()
    }
}