package no.bekk.providers

import io.ktor.client.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.server.plugins.*
import kotlinx.serialization.serializer
import net.mamoe.yamlkt.Yaml
import no.bekk.model.internal.*
import no.bekk.util.logger

class YamlProvider(
    override val name: String,
    override val id: String,
    private val httpClient: HttpClient? = null,
    private val endpoint: String? = null,
    private val resourcePath: String? = null,
) : FormProvider {
    private val logger = logger()
    
    init {
        require((endpoint != null && httpClient != null) || resourcePath != null) {
            "endpoint and httpClient or resourcePath must be set"
        }
        
        logger.info("Initializing YamlProvider '{}' with id: {}", name, id)
        if (endpoint != null) {
            logger.debug("YamlProvider configured with endpoint: {}", endpoint)
        } else {
            logger.debug("YamlProvider configured with resource path: {}", resourcePath)
        }
    }

    override suspend fun getForm(): Form {
        logger.debug("Fetching form data for provider: {}", name)
        return if (endpoint != null) {
            getFormFromYamlEndpoint()
        } else {
            getFormFromResourcePath()
        }
    }

    override suspend fun getSchema(): Schema {
        logger.debug("Fetching schema for provider: {}", name)
        
        if (endpoint != null) {
            val form = getFormFromYamlEndpoint()
            return Schema(
                id = form.id,
                name = form.name,
            ).also {
                logger.debug("Successfully retrieved schema from endpoint for provider: {}", name)
            }
        } else {
            val form = getFormFromResourcePath()
            return Schema(
                id = form.id,
                name = form.name,
            ).also {
                logger.debug("Successfully retrieved schema from resource path for provider: {}", name)
            }
        }
    }

    override suspend fun getColumns(): List<Column> {
        logger.debug("Fetching columns for provider: {}", name)
        
        return if (endpoint != null) {
            getFormFromYamlEndpoint().columns.also {
                logger.debug("Successfully retrieved {} columns from endpoint for provider: {}", it.size, name)
            }
        } else {
            getFormFromResourcePath().columns.also {
                logger.debug("Successfully retrieved {} columns from resource path for provider: {}", it.size, name)
            }
        }
    }

    override suspend fun getQuestion(recordId: String): Question {
        logger.debug("Fetching question with recordId: {} for provider: {}", recordId, name)
        
        return if (endpoint != null) {
            getFormFromYamlEndpoint().records.find { it.id == recordId } ?: run {
                logger.error("Question with recordId: {} not found in provider: {}", recordId, name)
                throw NotFoundException("Question $recordId not found")
            }
        } else {
            getFormFromResourcePath().records.find { it.id == recordId } ?: run {
                logger.error("Question with recordId: {} not found in provider: {}", recordId, name)
                throw NotFoundException("Question $recordId not found")
            }
        }.also {
            logger.debug("Successfully retrieved question with recordId: {} for provider: {}", recordId, name)
        }
    }

    private suspend fun getFormFromYamlEndpoint(): Form {
        require(endpoint != null && httpClient != null) { "endpoint and httpClient must not be null" }
        
        logger.debug("Fetching YAML content from endpoint: {}", endpoint)
        
        try {
            val response = httpClient.get(endpoint)
            
            if (response.status.value !in 200..299) {
                logger.error("Failed to fetch YAML from endpoint: {}. Status: {}", endpoint, response.status)
                throw IllegalStateException("Failed to fetch YAML from endpoint. Status: ${response.status}")
            }
            
            val responseBody = response.bodyAsText()
            logger.debug("Successfully fetched YAML content from endpoint: {} (length: {})", endpoint, responseBody.length)
            
            return parseAndConvertToForm(responseBody)
        } catch (e: Exception) {
            logger.error("Error fetching YAML from endpoint: {}", endpoint, e)
            throw IllegalStateException("Error fetching YAML from endpoint: $endpoint", e)
        }
    }

    private fun getFormFromResourcePath(): Form {
        require(resourcePath != null) { "Resource path not set" }
        
        logger.debug("Loading YAML content from resource path: {}", resourcePath)
        
        try {
            val body = this::class.java.classLoader.getResource(resourcePath)?.readText()
                ?: run {
                    logger.error("Resource not found at path: {}", resourcePath)
                    throw NotFoundException("Resource not found: $resourcePath")
                }
            
            logger.debug("Successfully loaded YAML content from resource path: {} (length: {})", resourcePath, body.length)
            
            return parseAndConvertToForm(body)
        } catch (e: Exception) {
            logger.error("Error loading YAML from resource path: {}", resourcePath, e)
            throw IllegalStateException("Error loading YAML from resource path: $resourcePath", e)
        }
    }

    private fun parseAndConvertToForm(yamlString: String): Form {
        logger.debug("Parsing YAML content for provider: {}", name)
        
        try {
            val form = Yaml.decodeFromString<FormWithoutId>(serializer(), yamlString)

            val convertedForm = Form(
                id = id,
                name = form.name,
                columns = form.columns,
                records = form.records.map {
                    Question(
                        id = it.id,
                        recordId = it.id, // need to set recordId since all endpoints require it as of now
                        question = it.question,
                        metadata = it.metadata,
                    )
                },
            )
            
            logger.info("Successfully parsed YAML for provider: {} - found {} records and {} columns", 
                name, convertedForm.records.size, convertedForm.columns.size)
            
            return convertedForm
        } catch (e: Exception) {
            logger.error("Error parsing YAML content for provider: {}", name, e)
            throw IllegalStateException("Error parsing YAML content for provider: $name", e)
        }
    }
}
