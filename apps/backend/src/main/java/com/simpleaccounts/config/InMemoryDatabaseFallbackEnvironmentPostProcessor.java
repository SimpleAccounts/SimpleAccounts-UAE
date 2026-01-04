package com.simpleaccounts.config;

import java.util.LinkedHashMap;
import java.util.Map;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.PropertySource;
import org.springframework.util.StringUtils;

@SuppressWarnings("removal")
public class InMemoryDatabaseFallbackEnvironmentPostProcessor
    implements EnvironmentPostProcessor, Ordered {

    private static final Log log =
        LogFactory.getLog(InMemoryDatabaseFallbackEnvironmentPostProcessor.class);

    private static final String PROPERTY_SOURCE_NAME = "simpleaccountsInMemoryDatabaseFallback";

    @Override
    public void postProcessEnvironment(
        ConfigurableEnvironment environment, SpringApplication application) {
        if (environment.getPropertySources().contains(PROPERTY_SOURCE_NAME)) {
            return;
        }

        if (!shouldUseInMemoryDatabase(environment)) {
            return;
        }

        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put(
            "spring.datasource.url",
            "jdbc:h2:mem:simpleaccounts;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE");
        properties.put("spring.datasource.driverClassName", "org.h2.Driver");
        properties.put("spring.datasource.username", "sa");
        properties.put("spring.datasource.password", "");
        properties.put("spring.jpa.database-platform", "org.hibernate.dialect.H2Dialect");
        properties.put("spring.jpa.hibernate.ddl-auto", "create-drop");
        properties.put("spring.liquibase.enabled", "false");
        properties.put("spring.cache.type", "simple");
        properties.put("simpleaccounts.baseUrl", "http://localhost:8080");

        environment
            .getPropertySources()
            .addFirst(new MapPropertySource(PROPERTY_SOURCE_NAME, properties));

        log.warn(
            "Starting with in-memory H2 database because SIMPLEACCOUNTS_DB_* environment variables are not set.");
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }

    private boolean shouldUseInMemoryDatabase(ConfigurableEnvironment environment) {
        if (hasAnyDatabaseEnvironmentVariable(environment)) {
            return false;
        }

        String datasourceUrl = getRawProperty(environment, "spring.datasource.url");
        return datasourceUrl != null && datasourceUrl.contains("${SIMPLEACCOUNTS_DB_");
    }

    private boolean hasAnyDatabaseEnvironmentVariable(ConfigurableEnvironment environment) {
        return hasText(environment.getProperty("SIMPLEACCOUNTS_DB_HOST"))
            || hasText(environment.getProperty("SIMPLEACCOUNTS_DB_PORT"))
            || hasText(environment.getProperty("SIMPLEACCOUNTS_DB"))
            || hasText(environment.getProperty("SIMPLEACCOUNTS_DB_USER"))
            || hasText(environment.getProperty("SIMPLEACCOUNTS_DB_PASSWORD"));
    }

    private boolean hasText(String value) {
        return StringUtils.hasText(value);
    }

    private String getRawProperty(ConfigurableEnvironment environment, String key) {
        for (PropertySource<?> propertySource : environment.getPropertySources()) {
            Object value = propertySource.getProperty(key);
            if (value != null) {
                return value.toString();
            }
        }
        return null;
    }
}
