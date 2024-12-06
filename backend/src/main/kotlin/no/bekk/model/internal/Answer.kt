package no.bekk.model.internal

import kotlinx.serialization.Serializable

enum class AnswerType {
    SELECT_MULTIPLE,
    SELECT_SINGLE,
    TEXT_MULTI_LINE,
    TEXT_SINGLE_LINE,
    PERCENT,
    CHECKBOX,
    TIME
}

@Serializable
data class Answer(
    val actor: String,
    val questionId: String,
    val question: String,
    val answer: String,
    val team: String?,
    val updated: String,
)

@Serializable
data class AnswerMetadata(
    val type: AnswerType,
    val options: List<String>? = null,
    val units: List<String>? = null,
    val expiry: Int?
)
