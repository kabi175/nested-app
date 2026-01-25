plugins {
	java
	id("org.springframework.boot") version "3.5.5"
	id("io.spring.dependency-management") version "1.1.7"
}

group = "com.nested"
version = "0.0.1-SNAPSHOT"
description = "project for Spring Boot"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(21)
	}
}

configurations {
	compileOnly {
		extendsFrom(configurations.annotationProcessor.get())
	}
}

repositories {
	mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
	implementation("org.springframework.boot:spring-boot-starter-actuator")
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-webflux")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    implementation("org.springframework.boot:spring-boot-starter-quartz")

    implementation("org.springframework.boot:spring-boot-starter-thymeleaf")
	implementation("org.apache.commons:commons-text:1.12.0")
    implementation("jakarta.annotation:jakarta.annotation-api:2.1.1")

    // Resilience4j dependencies for fault tolerance (Circuit Breaker)
    implementation("io.github.resilience4j:resilience4j-spring-boot3:2.2.0")
    implementation("io.github.resilience4j:resilience4j-reactor:2.2.0")

	// Swagger/OpenAPI dependencies
	implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.13")

	// AWS S3 dependencies
	implementation("software.amazon.awssdk:s3:2.20.26")
	implementation("software.amazon.awssdk:sts:2.20.26")

    // MaxMind GeoIP2 for geolocation
    implementation("com.maxmind.geoip2:geoip2:4.2.0")

	implementation("org.flywaydb:flyway-core")
	implementation("org.flywaydb:flyway-database-postgresql")
    implementation("com.twilio.sdk:twilio:11.3.0")
    implementation("com.auth0:auth0:2.26.0")
    implementation("com.sendgrid:sendgrid-java:4.10.1")

    // Note: Trace IDs are handled by custom TraceIdFilter using MDC
    // No external tracing dependencies needed
    
    // Logstash encoder for JSON logging (Grafana/Loki friendly)
    implementation("net.logstash.logback:logstash-logback-encoder:7.4")


//	runtimeOnly("io.netty:netty-resolver-dns-native-macos:4.1.94.Final:osx-aarch_64");

	compileOnly("org.projectlombok:lombok")
	annotationProcessor("org.projectlombok:lombok")

	developmentOnly("org.springframework.boot:spring-boot-devtools")
	runtimeOnly("org.postgresql:postgresql")
	
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testImplementation("org.springframework.security:spring-security-test")
	testImplementation("org.flywaydb:flyway-core")
	testImplementation("org.flywaydb:flyway-database-postgresql")
	testImplementation("org.postgresql:postgresql")
	testImplementation("org.assertj:assertj-core:3.24.2")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
	useJUnitPlatform()
}
