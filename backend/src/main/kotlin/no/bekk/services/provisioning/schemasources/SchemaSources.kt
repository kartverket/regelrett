package no.bekk.services.provisioning.schemasources

import no.bekk.providers.AirTableProvider
import no.bekk.providers.YamlProvider
import no.bekk.providers.clients.AirTableClient
import no.bekk.services.FormService
import no.bekk.util.logger

class SchemaSourceProvisioner(
    val cfgReader: ConfigReader,
    val formService: FormService,
) {
    fun applyChanges(configPath: String) {
        val configs = cfgReader.readConfig(configPath)

        for (cfg in configs) {
            provisionDataSources(cfg)
        }
    }

    fun provisionDataSources(configs: Configs) {
        for (schemasource in configs.schemasources) {
            val providerExists = formService.hasFormProvider(schemasource.name)
            fun missingProperty(property: String, schemaType: String) = "Property $property is missing in ${schemasource.name} but is required in $schemaType schema specifications"

            val provider = try {
                when (schemasource.type) {
                    "AIRTABLE" -> AirTableProvider(
                        name = schemasource.name,
                        id = schemasource.uid ?: throw IllegalArgumentException(missingProperty("uid", "YAML")),
                        airtableClient = AirTableClient(
                            schemasource.access_token ?: throw IllegalArgumentException(missingProperty("access_token", "AirTable")),
                            schemasource.url ?: throw IllegalArgumentException(missingProperty("url", "AirTable")),
                        ),
                        baseId = schemasource.base_id ?: throw IllegalArgumentException(missingProperty("base_id", "AirTable")),
                        tableId = schemasource.table_id ?: throw IllegalArgumentException(missingProperty("table_id", "AirTable")),
                        viewId = schemasource.view_id,
                        webhookId = schemasource.webhook_id,
                        webhookSecret = schemasource.webhook_secret,
                    )
                    "YAML" -> YamlProvider(
                        name = schemasource.name,
                        id = schemasource.uid ?: throw IllegalArgumentException(missingProperty("uid", "YAML")),
                        endpoint = schemasource.url,
                        resourcePath = schemasource.resource_path,
                    )
                    else -> throw IllegalStateException("Illegal type \"${schemasource.type}\"")
                }
            } catch (e: Exception) {
                logger.error("The following exception happened while provisioning schema sources", e)
                continue
            }

            if (providerExists) {
                // formService.updateFormProvider(provider)
                formService.addFormProvider(schemasource)
            } else {
                formService.addFormProvider(schemasource)
            }
        }
    }
    companion object {
        fun provision(configDirectory: String, formService: FormService) {
            val provisioner = SchemaSourceProvisioner(ConfigReader(), formService)
            provisioner.applyChanges(configDirectory)
        }
    }
}
