package no.bekk.providers

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.JsonDeserializer
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.module.SimpleModule
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import no.bekk.model.internal.Column
import no.bekk.model.internal.OptionalFieldType
import no.bekk.model.internal.Question
import no.bekk.model.internal.Table

class YamlProvider: Provider {

    // Temporary code for reading in a static YAML file. In the future, this will be read from a URL
    override suspend fun getTable(team: String?): Table {
        val yamlFile = this::class.java.classLoader.getResource(TEST_FILE)?.readText()
        return convertData(yamlFile!!)
    }

    companion object {
        const val TEST_FILE = "questions/testQuestions.yaml"
    }

    private fun convertData(yamlFile: String): Table{
        val module = SimpleModule().apply {
            addDeserializer(Table::class.java, YamlDeserializer)
        }
        val objectMapper = ObjectMapper(YAMLFactory()).apply {
            registerModule(module)
            registerKotlinModule()
        }
         try {
             return objectMapper.readValue(yamlFile, Table::class.java)
        } catch (e: Exception) {
            e.printStackTrace()
            throw e
        }
    }

    object YamlDeserializer : JsonDeserializer<Table>() {
        override fun deserialize(p0: JsonParser, p1: DeserializationContext): Table {
            val node = p0.readValueAsTree<JsonNode>()
            val objectMapper = p0.codec as ObjectMapper

            val id = node.get("id").asText()
            val name = node.get("name").asText()

            val columnsNode = node.get("columns")
            val columns = columnsNode.map { columnNode ->
                Column(
                    type = OptionalFieldType.OPTION_SINGLE,
                    name = columnNode.asText(),
                    options = null
                )
            }

            val recordsNode = node.get("records")
            val records: List<Question> = recordsNode.map { recordNode ->
                objectMapper.treeToValue(recordNode, Question::class.java)
            }

            return Table(
                id = id,
                name = name,
                columns = columns,
                records = records
            )
        }
    }
}