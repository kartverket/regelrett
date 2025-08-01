package no.bekk.services.provisioning.schemasources

import kotlinx.serialization.Serializable

@Serializable
data class Configs(
    val schemasources: List<UpsertDataFromConfig> = emptyList(),
)

@Serializable
data class UpsertDataFromConfig(
    val name: String,
    val type: String,
    val uid: String?,
    val url: String?,
    val access_token: String?,
    val base_id: String?,
    val table_id: String?,
    val view_id: String?,
    val webhook_id: String?,
    val webhook_secret: String?,
    val resource_path: String? = null,
)
