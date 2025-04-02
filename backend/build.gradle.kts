import com.github.jengelman.gradle.plugins.shadow.tasks.ShadowJar
import org.gradle.api.tasks.testing.logging.TestExceptionFormat

val ktor_version: String by project
val kotlin_version: String by project
val logback_version: String by project

plugins {
    kotlin("jvm") version "2.1.20"
    id("io.ktor.plugin") version "3.1.2"
    kotlin("plugin.serialization") version "2.1.20"
    id("com.gradleup.shadow") version "8.3.0"
    id("org.flywaydb.flyway") version "11.3.4"
}

group = "no.bekk"
version = "0.0.1"

application {
    mainClass.set("io.ktor.server.netty.EngineMain")
    val isDevelopment: Boolean = project.ext.has("development")
    applicationDefaultJvmArgs = listOf("-Dio.ktor.development=$isDevelopment")
}

repositories {
    mavenCentral()
    maven {
        url = uri("https://download.red-gate.com/maven/release")
    }
}
val flywayVersion = "10.17.3"


buildscript {
    dependencies {
        classpath("org.flywaydb:flyway-database-postgresql:10.17.3")
    }
}

flyway {
    url = System.getenv("DB_URL")
    user = System.getenv("DB_NAME")
    password = System.getenv("DB_PASSWORD")
}

dependencies {
    implementation("io.ktor:ktor-server-auth-jwt:$ktor_version")
    implementation("com.auth0:java-jwt:4.4.0")
    implementation("io.ktor:ktor-server-config-yaml:$ktor_version")
    implementation("io.ktor:ktor-server-core-jvm")
    implementation("io.ktor:ktor-server-netty-jvm")
    implementation("io.ktor:ktor-server-default-headers:$ktor_version")
    implementation("io.ktor:ktor-server-content-negotiation:$ktor_version")
    implementation("io.ktor:ktor-serialization-kotlinx-json:$ktor_version")
    implementation("io.ktor:ktor-server-auth:$ktor_version")
    implementation("io.ktor:ktor-client-core:$ktor_version")
    implementation("io.ktor:ktor-client-cio:$ktor_version")
    implementation("io.ktor:ktor-client-auth:$ktor_version")
    implementation("io.ktor:ktor-client-content-negotiation:$ktor_version")
    implementation("io.ktor:ktor-serialization-kotlinx-json:$ktor_version")
    implementation("ch.qos.logback:logback-classic:$logback_version")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.3.3")
    implementation("net.mamoe.yamlkt:yamlkt:0.13.0")    // This is the same library that ktor uses
    implementation("org.jetbrains.exposed:exposed-core:0.36.1")
    implementation("com.microsoft.azure:msal4j:1.19.1")
    implementation("net.minidev:json-smart:2.5.2") // Kan slettes når msal ograderer json smart til 5.2.
    implementation("org.jetbrains.exposed:exposed-dao:0.36.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.1")
    implementation("io.ktor:ktor-server-forwarded-header:$ktor_version")
    implementation("org.jooq:jooq:3.19.8")
    implementation("org.jooq:jooq-meta:3.20.2")
    implementation("org.jooq:jooq-codegen:3.19.8")
    implementation("com.zaxxer:HikariCP:5.0.1")
    implementation("org.flywaydb:flyway-core:$flywayVersion")
    implementation("org.flywaydb:flyway-database-postgresql:$flywayVersion")
    implementation("org.postgresql:postgresql:42.7.3")
    implementation("io.ktor:ktor-server-cors:$ktor_version")
    implementation("com.google.code.gson:gson:2.12.1")
    implementation("com.azure:azure-identity:1.14.0")
    implementation("com.microsoft.graph:microsoft-graph:6.16.0")
    implementation("com.github.ben-manes.caffeine:caffeine:3.1.6")
    testImplementation("io.ktor:ktor-server-test-host:$ktor_version")
    testImplementation("org.jetbrains.kotlin:kotlin-test:$kotlin_version")
    testImplementation("io.mockk:mockk:1.13.16")
    testImplementation("org.testcontainers:testcontainers:1.20.6")
    testImplementation("org.testcontainers:postgresql:1.20.6")
}

tasks {
    withType<ShadowJar> {
        isZip64 = true
        mergeServiceFiles()
    }
    withType<Test> {
        testLogging {
            showCauses = true
            showExceptions = true
            exceptionFormat = TestExceptionFormat.FULL
            events("passed", "skipped", "failed")
        }
        useJUnitPlatform()
    }
}
