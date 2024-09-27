package no.bekk.services

import no.bekk.configuration.AppConfig
import no.bekk.model.internal.*
import no.bekk.providers.AirTableProvider
import no.bekk.providers.YamlProvider

class TableService {
    private val airTableProvider = AirTableProvider()
    private val yamlProvider = YamlProvider()

    suspend fun getTable(team: String?): Table {
        return when (val dataType = AppConfig.data.source) {
            "AIRTABLE" ->
                airTableProvider.getTable(
                    team = team
                )

            "YAML" ->
                yamlProvider.getTable()

            else -> throw IllegalArgumentException("Table source $dataType not supported")
        }
    }
}
