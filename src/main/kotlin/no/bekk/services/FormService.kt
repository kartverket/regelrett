package no.bekk.services

import kotlinx.serialization.Serializable
import no.bekk.providers.AirTableProvider
import no.bekk.providers.FormProvider
import no.bekk.providers.YamlProvider
import no.bekk.providers.clients.AirTableClient
import no.bekk.services.provisioning.schemasources.UpsertDataFromConfig
import no.bekk.util.generateNewUid
import no.bekk.util.logger

@Serializable
data class FormsMetadataDto(
    val id: String,
    val name: String,
)

const val MAX_DATA_SOURCE_NAME_LEN = 190
const val MAX_DATA_SOURCE_URL_LEN = 255

interface FormService {
    fun getFormProvider(formId: String): FormProvider

    fun getFormProviderByName(name: String): FormProvider

    fun hasFormProvider(name: String): Boolean

    fun addFormProvider(command: UpsertDataFromConfig)

    // TODO: fun updateFormProvider(provider: FormProvider)

    fun getFormProviders(): List<FormProvider>
}

class FormProviderNotFoundException(message: String? = null, cause: Throwable? = null) : IllegalArgumentException(message, cause)

class FormServiceImpl : FormService {
    private val logger = logger()
    private val providers: MutableMap<String, FormProvider> = mutableMapOf()

    override fun getFormProvider(formId: String): FormProvider {
        logger.debug("Getting form provider for formId: {}", formId)
        return providers[formId] ?: run {
            logger.error("Form provider not found for formId: {}. Available providers: {}", formId, providers.keys)
            throw FormProviderNotFoundException("Form $formId not found")
        }
    }

    override fun getFormProviderByName(name: String): FormProvider {
        logger.debug("Getting form provider by name: {}", name)
        return providers.values.find { it.name == name } ?: run {
            logger.error("Form provider not found by name: {}. Available providers: {}", name, providers.values.map { it.name })
            throw FormProviderNotFoundException("Form $name not found")
        }
    }

    override fun hasFormProvider(name: String): Boolean {
        val exists = providers.values.any { it.name == name }
        logger.debug("Checking if form provider exists by name: {} - result: {}", name, exists)
        return exists
    }

    override fun getFormProviders(): List<FormProvider> {
        logger.debug("Getting all form providers. Count: {}", providers.size)
        return providers.values.toList()
    }

    override fun addFormProvider(command: UpsertDataFromConfig) {
        logger.info("Adding new form provider: type={}, name={}", command.type, command.name)
        
        var cmd = command
        if (command.name == "") {
            val generatedName = getAvailableName(cmd.type)
            logger.debug("Generated name for provider: {}", generatedName)
            cmd = cmd.copy(name = generatedName)
        }

        // Validate inputs
        if (cmd.name.length > MAX_DATA_SOURCE_NAME_LEN) {
            logger.error("Datasource name too long: {} (max: {})", cmd.name.length, MAX_DATA_SOURCE_NAME_LEN)
            throw IllegalArgumentException("Datasource name invalid, max length is $MAX_DATA_SOURCE_NAME_LEN")
        }

        if (cmd.url?.length ?: 0 > MAX_DATA_SOURCE_URL_LEN) {
            logger.error("Datasource URL too long: {} (max: {})", cmd.url?.length, MAX_DATA_SOURCE_URL_LEN)
            throw IllegalArgumentException("Datasource url invalid, max length is $MAX_DATA_SOURCE_URL_LEN")
        }

        val uuid = cmd.uid ?: generateNewProviderUid()
        logger.debug("Using UUID for provider: {}", uuid)

        fun missingProperty(property: String, schemaType: String) = "Property $property is missing in ${cmd.name} but is required in $schemaType schema specifications"
        
        try {
            val provider = when (cmd.type) {
                "AIRTABLE" -> {
                    logger.debug("Creating AirTable provider with baseId: {}, tableId: {}", cmd.base_id, cmd.table_id)
                    AirTableProvider(
                        name = cmd.name,
                        id = uuid,
                        airtableClient = AirTableClient(
                            cmd.access_token ?: throw IllegalArgumentException(missingProperty("access_token", "AirTable")),
                            cmd.url ?: throw IllegalArgumentException(missingProperty("url", "AirTable")),
                        ),
                        baseId = cmd.base_id ?: throw IllegalArgumentException(missingProperty("base_id", "AirTable")),
                        tableId = cmd.table_id ?: throw IllegalArgumentException(missingProperty("table_id", "AirTable")),
                        viewId = cmd.view_id,
                        webhookId = cmd.webhook_id,
                        webhookSecret = cmd.webhook_secret,
                    )
                }
                "YAML" -> {
                    logger.debug("Creating YAML provider with endpoint: {}, resourcePath: {}", cmd.url, cmd.resource_path)
                    YamlProvider(
                        name = cmd.name,
                        id = uuid,
                        endpoint = cmd.url,
                        resourcePath = cmd.resource_path,
                    )
                }
                else -> {
                    logger.error("Unknown provider type: {}", cmd.type)
                    throw IllegalStateException("Illegal type \"${cmd.type}\"")
                }
            }

            logger.info("Successfully created {} form provider: {} with ID: {}", cmd.type, provider.name, provider.id)
            providers[provider.id] = provider
            logger.debug("Total providers after addition: {}", providers.size)
            
        } catch (e: Exception) {
            logger.error("Failed to create form provider: type={}, name={}", cmd.type, cmd.name, e)
            throw e
        }
    }

    private fun getAvailableName(type: String): String {
        logger.debug("Generating available name for type: {}", type)
        
        val existingNames = mutableMapOf<String, Boolean>()
        for (provider in providers.values) {
            existingNames[provider.name.lowercase()] = true
        }

        var name = type
        var currentDigit = 0

        while (existingNames[name.lowercase()] == true) {
            currentDigit++
            name = "$type-$currentDigit"
        }

        logger.debug("Generated available name: {} for type: {}", name, type)
        return name
    }

    fun generateNewProviderUid(): String {
        logger.debug("Generating new provider UID")
        
        for (i in 0..3) {
            val uuid = generateNewUid()
            logger.debug("Generated UUID attempt {}: {}", i + 1, uuid)

            if (providers.values.none { it.id == uuid }) {
                logger.debug("UUID is unique, using: {}", uuid)
                return uuid
            }
            
            logger.debug("UUID collision detected, retrying...")
        }
        
        logger.error("Failed to generate unique UID after 4 attempts")
        throw IllegalStateException("Failed to generate UID for provider")
    }
}
