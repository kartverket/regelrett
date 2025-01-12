package no.bekk.services

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import no.bekk.model.internal.Question

object QuestionService {
    private const val TEST_FILE = "questions/testQuestions.json"

    fun getTestQuestions(): List<Question> {
        val testQuestions = this::class.java.classLoader.getResource(TEST_FILE)?.readText() ?: throw RuntimeException("Could not load test questions from $TEST_FILE")
        val questions = Gson().fromJson<List<Question>>(testQuestions, object : TypeToken<List<Question>>() {}.type)
        return questions
    }

}