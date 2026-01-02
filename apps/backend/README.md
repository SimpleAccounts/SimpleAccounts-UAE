# SimpleAccounts Backend

Backend application built with Spring Boot, providing REST APIs for the SimpleAccounts UAE platform.

## Quick Start

### Using DevContainer (Recommended)

The fastest way to start development:

```bash
# In VS Code with DevContainers extension
# Open the repository and reopen in container
# Backend dependencies are pre-installed

cd apps/backend
./mvnw spring-boot:run
```

Backend will be available at: http://localhost:8080

### Local Development

If Java 21 is installed:

```bash
cd apps/backend
./mvnw spring-boot:run
```

### Install Java 21

**Option 1: Using SDKMAN (Recommended for Linux/macOS)**

```bash
# Install SDKMAN
curl -s "https://get.sdkman.io" | bash

# Install Java 21
sdk install java 21-tem

# Verify
java -version
```

**Option 2: Using Homebrew (macOS)**

```bash
brew install openjdk@21

# Set JAVA_HOME
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
```

**Option 3: Download from Adoptium**

1. Visit: https://adoptium.net/temurin/releases/?version=21
2. Download installer for your OS
3. Install and verify: `java -version`

## Configuration

### Database

PostgreSQL connection is configured via environment variables:

```properties
# src/main/resources/application.properties
spring.datasource.url=${DATABASE_URL:jdbc:postgresql://localhost:5432/simpleaccounts}
spring.datasource.username=${DATABASE_USERNAME:simpleaccounts}
spring.datasource.password=${DATABASE_PASSWORD:simpleaccounts_dev}
```

### Redis

```properties
spring.redis.host=${REDIS_HOST:localhost}
spring.redis.port=${REDIS_PORT:6379}
```

## Verify Backend is Running

```bash
# Check health
curl http://localhost:8080/rest/company/getCompanyCount

# Should return: 0 (or 1 if company exists)
```

## Security Notes

### Password Handling

**In Transit:**

- ✅ Passwords hashed with BCrypt before storage
- ⚠️ Use HTTPS in production (currently HTTP in development)

**Server-Side:**

- ✅ BCrypt hashing implemented (see `CompanyController.java`)
- ⚠️ Ensure passwords NOT logged in plain text
- ⚠️ Ensure passwords NOT stored in plain text

**Location:**

- Frontend: `apps/frontend/src/screens/register/screen.js`
- Backend: `CompanyController.java` (password hashing)

### Recommended Improvements

- [ ] Use HTTPS in production
- [ ] Add request logging filter that redacts sensitive fields
- [ ] Implement rate limiting on registration endpoint
- [ ] Add password strength validation

**Priority:** Medium (acceptable for development, must address before production)

## Tech Stack

- **Java 21** - LTS version
- **Spring Boot 3.x** - Application framework
- **PostgreSQL** - Database
- **Redis** - Caching layer
- **Maven** - Build tool
- **Liquibase** - Database migrations

## Development

### Running Tests

```bash
./mvnw test
```

### Building

```bash
./mvnw clean package
```

### Database Migrations

Liquibase migrations are in `src/main/resources/db/changelog/`.

Migrations run automatically on application startup.

## API Documentation

REST API endpoints are available at:

- Company: `/rest/company/*`
- [Add other endpoint categories as they are documented]

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 8080
lsof -i :8080

# Kill it
kill -9 <PID>
```

### Database Connection Failed

Ensure PostgreSQL is running:

```bash
# Check if running
pg_isready -h localhost -p 5432

# Start PostgreSQL (macOS with Homebrew)
brew services start postgresql@16
```

## Contributing

See root [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.
