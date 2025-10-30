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

# Create config directory for external files
RUN mkdir -p /app/config && chown -R spring:spring /app/config

# Copy JAR
COPY --from=builder /build/build/libs/*.jar app.jar

# Copy service account key (optional - can also be mounted via volume)
COPY --from=builder /build/serviceAccountKey.json /app/config/serviceAccountKey.json

RUN chown -R spring:spring /app
USER spring

# Set default path to the copied/mounted service account key
ENV FIREBASE_SERVICE_ACCOUNT_PATH=file:/app/config/serviceAccountKey.json

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
