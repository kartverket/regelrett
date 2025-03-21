package no.bekk

import no.bekk.providers.FormProvider
import no.bekk.services.FormService

interface MockFormService : FormService {
    override fun getFormProvider(formId: String): FormProvider = TODO("Not yet implemented")
    override fun getFormProviders(): List<FormProvider> = TODO("Not yet implemented")
}