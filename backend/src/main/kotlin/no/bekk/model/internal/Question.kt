package no.bekk.model.internal

import kotlinx.serialization.Serializable

enum class OptionalFieldType {
    OPTION_MULTIPLE,
    OPTION_SINGLE,
    TEXT,
}

@Serializable
data class Question(
    val id: String,
    val recordId: String,
    val question: String,
    val metadata: QuestionMetadata,
    val updated: String?,
)

@Serializable
data class OptionalField(
    val key: String,
    val value: List<String>,
    val type: OptionalFieldType?,
    val options: List<String>?,
)

@Serializable
data class QuestionMetadata(
    val answerMetadata: AnswerMetadata,
    val optionalFields: List<OptionalField>? = null,
)
