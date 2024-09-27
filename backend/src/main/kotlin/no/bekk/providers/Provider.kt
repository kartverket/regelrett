package no.bekk.providers

import no.bekk.model.internal.Table

interface Provider {
    suspend fun getTable(team: String? = null): Table
}