#Stage 1: Build the app
FROM gradle:8.4-jdk21 AS builder
WORKDIR /build
COPY build.gradle.kts gradlew gradle/ ./
RUN ./gradlew build -x test --no-daemon || return 0
COPY . .
RUN ./gradlew bootJar --no-daemon

#Stage 2: Run the app
FROM eclipse-temurin:21-jre-jammy
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -XX:+UseContainerSupport"
RUN groupadd --system spring && useradd --system --gid spring spring
WORKDIR /app
COPY --from=builder /build/build/libs/*.jar app.jar
RUN chown -R spring:spring /app
USER spring
ENTRYPOINT ["java", "-jar", "app.jar"]
