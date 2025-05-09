package no.bekk.di

import no.bekk.authentication.AuthServiceImpl
import no.bekk.configuration.Config
import no.bekk.configuration.JDBCDatabase
import no.bekk.database.AnswerRepositoryImpl
import no.bekk.database.CommentRepositoryImpl
import no.bekk.database.ContextRepositoryImpl
import no.bekk.services.FormServiceImpl
import no.bekk.services.MicrosoftServiceImpl

fun rootComposer(config: Config): Dependencies {
    val database = JDBCDatabase.create(config.database)
    val formService = FormServiceImpl(config.forms)
    val answerRepository = AnswerRepositoryImpl(database)
    val commentRepository = CommentRepositoryImpl(database)
    val contextRepository = ContextRepositoryImpl(database)
    val authService = AuthServiceImpl(MicrosoftServiceImpl(config), contextRepository, config.oAuth)

    return Dependencies(
        formService = formService,
        database = database,
        answerRepository = answerRepository,
        commentRepository = commentRepository,
        contextRepository = contextRepository,
        authService = authService,
    )
}
