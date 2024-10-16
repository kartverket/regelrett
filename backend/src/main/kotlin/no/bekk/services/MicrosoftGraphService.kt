package no.bekk.services

import com.azure.identity.ClientSecretCredentialBuilder
import com.microsoft.graph.models.Group
import com.microsoft.graph.models.User
import com.microsoft.graph.serviceclient.GraphServiceClient
import no.bekk.configuration.AppConfig
import no.bekk.domain.MicrosoftGraphUser

class MicrosoftGraphService {

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

    fun getGroup(groupName: String): Group {
        return graphClient.groups().get {
            it.queryParameters.filter = "displayName eq 'AAD - TF - TEAM - $groupName'"
            it.queryParameters.select = arrayOf("id", "displayName")
            it.queryParameters.count = true
            it.headers.add("ConsistencyLevel", "eventual")
        }.value[0]
    }

    fun getUser(userId: String): User {
        return graphClient.users().byUserId(userId).get()
    }
}