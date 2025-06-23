import com.github.jengelman.gradle.plugins.shadow.tasks.ShadowJar
import org.gradle.api.tasks.testing.logging.TestExceptionFormat

val ktor_version: String by project
val kotlin_version: String by project
val logback_version: String by project

plugins {
    kotlin("jvm") version "2.1.20"
    id("io.ktor.plugin") version "3.1.2"
    kotlin("plugin.serialization") version "2.1.21"
    id("com.gradleup.shadow") version "8.3.6"
    id("org.flywaydb.flyway") version "11.8.2"
}

group = "no.bekk"
version = "0.0.1"

application {
    mainClass.set("no.bekk.ApplicationKt")
    val isDevelopment: Boolean = project.ext.has("development")
    applicationDefaultJvmArgs = listOf("-Dio.ktor.development=$isDevelopment")
}

repositories {
    mavenCentral()
    maven {
        url = uri("https://download.red-gate.com/maven/release")
    }
}
val flywayVersion = "11.8.1"


buildscript {
    dependencies {
        classpath("org.flywaydb:flyway-database-postgresql:11.8.1")
    }
}

flyway {
    url = System.getenv("DB_URL")
    user = System.getenv("DB_NAME")
    password = System.getenv("DB_PASSWORD")
}

dependencies {
    implementation("io.ktor:ktor-server-auth-jwt:$ktor_version")
    implementation("com.auth0:java-jwt:4.5.0")
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
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.8.1")
    implementation("net.mamoe.yamlkt:yamlkt:0.13.0")    // This is the same library that ktor uses
    implementation("com.microsoft.azure:msal4j:1.20.1")
    implementation("net.minidev:json-smart:2.5.2") // Kan slettes når msal ograderer json smart til 5.2.
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.10.2")
    implementation("io.ktor:ktor-server-forwarded-header:$ktor_version")
    implementation("org.jooq:jooq:3.20.4")
    implementation("org.jooq:jooq-meta:3.20.4")
    implementation("org.jooq:jooq-codegen:3.20.4")
    implementation("com.zaxxer:HikariCP:6.3.0")
    implementation("org.flywaydb:flyway-core:$flywayVersion")
    implementation("org.flywaydb:flyway-database-postgresql:$flywayVersion")
    implementation("org.postgresql:postgresql:42.7.5")
    implementation("io.ktor:ktor-server-cors:$ktor_version")
    implementation("com.google.code.gson:gson:2.13.1")
    implementation("com.azure:azure-identity:1.16.1")
    implementation("com.microsoft.graph:microsoft-graph:6.39.0")
    implementation("com.github.ben-manes.caffeine:caffeine:3.2.0")
    testImplementation("io.ktor:ktor-server-test-host:$ktor_version")
    testImplementation("org.jetbrains.kotlin:kotlin-test:$kotlin_version")
    testImplementation("io.mockk:mockk:1.14.2")
    testImplementation("org.testcontainers:testcontainers:1.21.2")
    testImplementation("org.testcontainers:postgresql:1.21.2")
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
