package no.bekk.di

import no.bekk.authentication.AuthServiceImpl
import no.bekk.configuration.Config
import no.bekk.configuration.JDBCDatabase
import no.bekk.database.AnswerRepositoryImpl
import no.bekk.database.CommentRepositoryImpl
import no.bekk.database.ContextRepositoryImpl
import no.bekk.services.FormServiceImpl
import no.bekk.services.MicrosoftServiceImpl
import no.bekk.services.provisioning.provideProvisioningService

fun rootComposer(config: Config): Dependencies {
    val database = JDBCDatabase.create(config.database)
    val formService = FormServiceImpl()
    val answerRepository = AnswerRepositoryImpl(database)
    val commentRepository = CommentRepositoryImpl(database)
    val contextRepository = ContextRepositoryImpl(database)
    val provisioningService = provideProvisioningService(config, formService)
    val authService = AuthServiceImpl(MicrosoftServiceImpl(config), contextRepository, config.oAuth)

    return Dependencies(
        formService = formService,
        database = database,
        answerRepository = answerRepository,
        provisioningService = provisioningService,
        commentRepository = commentRepository,
        contextRepository = contextRepository,
        authService = authService,
    )
}
