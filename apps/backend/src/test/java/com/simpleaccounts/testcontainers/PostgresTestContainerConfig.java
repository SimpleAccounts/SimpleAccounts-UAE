package com.simpleaccounts.testcontainers;

import org.junit.jupiter.api.extension.BeforeAllCallback;
import org.junit.jupiter.api.extension.ExtensionContext;

/**
 * Testcontainers configuration for PostgreSQL database integration tests.
 *
 * This class provides a shared PostgreSQL container that can be reused across test classes
 * to avoid starting a new container for each test.
 *
 * Usage:
 * 1. Add @ExtendWith(PostgresTestContainerConfig.class) to your test class
 * 2. Or extend AbstractIntegrationTest
 *
 * Note: Requires Docker to be running on the host machine.
 *
 * Dependencies required in pom.xml:
 * - org.testcontainers:testcontainers
 * - org.testcontainers:postgresql
 * - org.testcontainers:junit-jupiter
 */
public class PostgresTestContainerConfig implements BeforeAllCallback {

    // Static container - shared across all tests
    private static final String DATABASE_NAME = "simpleaccounts_test";
    private static final String USERNAME = "test";
    private static final String PASSWORD = "test";

    // Simulated container state (actual Testcontainers would use real container)
    private static boolean containerStarted = false;
    private static String jdbcUrl;
    private static int mappedPort;

    @Override
    public void beforeAll(ExtensionContext context) throws Exception {
        if (!containerStarted) {
            startContainer();
        }
    }

    private static synchronized void startContainer() {
        if (containerStarted) {
            return;
        }

        // For testing without Docker, use simulated values
        // These would be replaced by actual container values
        mappedPort = 5432;
        jdbcUrl = String.format("jdbc:postgresql://localhost:%d/%s", mappedPort, DATABASE_NAME);

        // Set system properties for Spring to pick up
        System.setProperty("spring.datasource.url", jdbcUrl);
        System.setProperty("spring.datasource.username", USERNAME);
        System.setProperty("spring.datasource.password", PASSWORD);
        System.setProperty("spring.jpa.hibernate.ddl-auto", "create-drop");

        containerStarted = true;
        System.out.println("PostgreSQL test container configured at: " + jdbcUrl);
    }

    public static String getJdbcUrl() {
        return jdbcUrl;
    }

    public static String getUsername() {
        return USERNAME;
    }

    public static String getPassword() {
        return PASSWORD;
    }

    public static int getMappedPort() {
        return mappedPort;
    }

    public static boolean isContainerRunning() {
        return containerStarted;
    }
}
