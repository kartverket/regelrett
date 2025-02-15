package no.bekk.services

import com.azure.identity.ClientSecretCredentialBuilder
import com.microsoft.graph.models.User
import com.microsoft.graph.serviceclient.GraphServiceClient
import no.bekk.configuration.AppConfig

object MicrosoftGraphService {

    private val tenantId = AppConfig.oAuth.tenantId
    private val clientId = AppConfig.oAuth.clientId
    private val clientSecret = AppConfig.oAuth.clientSecret

    private val scopes = "https://graph.microsoft.com/.default"
    private val credential = ClientSecretCredentialBuilder()
        .clientId(clientId)
        .tenantId(tenantId)
        .clientSecret(clientSecret)
        .build()
    private val graphClient = GraphServiceClient(credential, scopes)

    fun getUser(userId: String): User {
        return graphClient.users().byUserId(userId).get()
    }
}