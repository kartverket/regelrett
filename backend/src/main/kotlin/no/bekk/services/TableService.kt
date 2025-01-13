package no.bekk.services

import io.ktor.client.*
import no.bekk.configuration.AirTableInstanceConfig
import no.bekk.configuration.AppConfig
import no.bekk.configuration.YAMLInstanceConfig
import no.bekk.providers.AirTableProvider
import no.bekk.providers.TableProvider
import no.bekk.providers.YamlProvider
import no.bekk.providers.clients.AirTableClient

object TableService {


  private val providers: List<TableProvider> = AppConfig.tables.tables.map { table ->
        when (table) {
            is AirTableInstanceConfig -> AirTableProvider(
                id = table.id,
                airtableClient = AirTableClient(
                    table.accessToken
                ),
                baseId = table.baseId,
                tableId =   table.tableId,
                viewId = table.viewId,
                webhookId = table.webhookId,
                webhookSecret = table.webhookSecret,
            )
            is YAMLInstanceConfig -> YamlProvider(
                id = table.id,
                endpoint = table.endpoint,
                resourcePath =   table.resourcePath,
            )
            else ->  throw Exception("Valid tabletype not found")

        }
    }


    fun getTableProvider(tableId: String): TableProvider {
        return providers.find { it.id == tableId } ?: throw Exception("Table $tableId not found")
    }

    fun getTableProviders(): List<TableProvider> {
        return providers
    }
}