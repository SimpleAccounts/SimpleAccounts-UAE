package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.Configuration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("ConfigurationDaoImpl Unit Tests")
class ConfigurationDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<Configuration> typedQuery;

    @InjectMocks
    private ConfigurationDaoImpl configurationDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(configurationDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(configurationDao, "entityClass", Configuration.class);
    }

    @Test
    @DisplayName("Should return configuration by name when it exists")
    void getConfigurationByNameReturnsConfigurationWhenExists() {
        // Arrange
        String configName = "tax.rate";
        Configuration expectedConfig = createConfiguration(1, configName, "15");

        when(entityManager.createNamedQuery("Configuration.findByName", Configuration.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("name", configName))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(Collections.singletonList(expectedConfig));

        // Act
        Configuration result = configurationDao.getConfigurationByName(configName);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo(configName);
        assertThat(result.getValue()).isEqualTo("15");
    }

    @Test
    @DisplayName("Should return null when configuration not found by name")
    void getConfigurationByNameReturnsNullWhenNotFound() {
        // Arrange
        String configName = "nonexistent.config";

        when(entityManager.createNamedQuery("Configuration.findByName", Configuration.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("name", configName))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        Configuration result = configurationDao.getConfigurationByName(configName);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return null when result list is null")
    void getConfigurationByNameReturnsNullWhenListIsNull() {
        // Arrange
        String configName = "test.config";

        when(entityManager.createNamedQuery("Configuration.findByName", Configuration.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("name", configName))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(null);

        // Act
        Configuration result = configurationDao.getConfigurationByName(configName);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should use named query Configuration.findByName")
    void getConfigurationByNameUsesCorrectNamedQuery() {
        // Arrange
        String configName = "app.version";

        when(entityManager.createNamedQuery("Configuration.findByName", Configuration.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("name", configName))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        configurationDao.getConfigurationByName(configName);

        // Assert
        verify(entityManager).createNamedQuery("Configuration.findByName", Configuration.class);
    }

    @Test
    @DisplayName("Should set name parameter correctly")
    void getConfigurationByNameSetsParameterCorrectly() {
        // Arrange
        String configName = "database.url";

        when(entityManager.createNamedQuery("Configuration.findByName", Configuration.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("name", configName))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        configurationDao.getConfigurationByName(configName);

        // Assert
        verify(typedQuery).setParameter("name", configName);
    }

    @Test
    @DisplayName("Should return first configuration when multiple exist with same name")
    void getConfigurationByNameReturnsFirstWhenMultipleExist() {
        // Arrange
        String configName = "duplicate.config";
        Configuration config1 = createConfiguration(1, configName, "value1");
        Configuration config2 = createConfiguration(2, configName, "value2");

        when(entityManager.createNamedQuery("Configuration.findByName", Configuration.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("name", configName))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(Arrays.asList(config1, config2));

        // Act
        Configuration result = configurationDao.getConfigurationByName(configName);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getConfigurationId()).isEqualTo(1);
        assertThat(result.getValue()).isEqualTo("value1");
    }

    @Test
    @DisplayName("Should return list of all configurations")
    void getConfigurationListReturnsAllConfigurations() {
        // Arrange
        List<Configuration> expectedConfigs = createConfigurationList(5);

        when(entityManager.createQuery("SELECT c FROM Configuration c", Configuration.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedConfigs);

        // Act
        List<Configuration> result = configurationDao.getConfigurationList();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        assertThat(result).isEqualTo(expectedConfigs);
    }

    @Test
    @DisplayName("Should return empty list when no configurations exist")
    void getConfigurationListReturnsEmptyListWhenNoConfigs() {
        // Arrange
        when(entityManager.createQuery("SELECT c FROM Configuration c", Configuration.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<Configuration> result = configurationDao.getConfigurationList();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return empty list when result is null")
    void getConfigurationListReturnsEmptyListWhenResultIsNull() {
        // Arrange
        when(entityManager.createQuery("SELECT c FROM Configuration c", Configuration.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(null);

        // Act
        List<Configuration> result = configurationDao.getConfigurationList();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should use correct JPQL query for list")
    void getConfigurationListUsesCorrectQuery() {
        // Arrange
        when(entityManager.createQuery("SELECT c FROM Configuration c", Configuration.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        configurationDao.getConfigurationList();

        // Assert
        verify(entityManager).createQuery("SELECT c FROM Configuration c", Configuration.class);
    }

    @Test
    @DisplayName("Should handle single configuration in list")
    void getConfigurationListHandlesSingleConfiguration() {
        // Arrange
        List<Configuration> configs = Collections.singletonList(
            createConfiguration(1, "single.config", "value")
        );

        when(entityManager.createQuery("SELECT c FROM Configuration c", Configuration.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(configs);

        // Act
        List<Configuration> result = configurationDao.getConfigurationList();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("single.config");
    }

    @Test
    @DisplayName("Should handle large list of configurations")
    void getConfigurationListHandlesLargeList() {
        // Arrange
        List<Configuration> configs = createConfigurationList(100);

        when(entityManager.createQuery("SELECT c FROM Configuration c", Configuration.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(configs);

        // Act
        List<Configuration> result = configurationDao.getConfigurationList();

        // Assert
        assertThat(result).hasSize(100);
    }

    @Test
    @DisplayName("Should handle configuration name with special characters")
    void getConfigurationByNameHandlesSpecialCharacters() {
        // Arrange
        String configName = "config.with.dots.and_underscores";
        Configuration config = createConfiguration(1, configName, "value");

        when(entityManager.createNamedQuery("Configuration.findByName", Configuration.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("name", configName))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(Collections.singletonList(config));

        // Act
        Configuration result = configurationDao.getConfigurationByName(configName);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo(configName);
    }

    @Test
    @DisplayName("Should handle empty string as configuration name")
    void getConfigurationByNameHandlesEmptyString() {
        // Arrange
        String configName = "";

        when(entityManager.createNamedQuery("Configuration.findByName", Configuration.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("name", configName))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        Configuration result = configurationDao.getConfigurationByName(configName);

        // Assert
        assertThat(result).isNull();
        verify(typedQuery).setParameter("name", configName);
    }

    @Test
    @DisplayName("Should return configurations in order from query")
    void getConfigurationListReturnsConfigsInOrder() {
        // Arrange
        Configuration config1 = createConfiguration(1, "config.a", "value1");
        Configuration config2 = createConfiguration(2, "config.b", "value2");
        Configuration config3 = createConfiguration(3, "config.c", "value3");
        List<Configuration> configs = Arrays.asList(config1, config2, config3);

        when(entityManager.createQuery("SELECT c FROM Configuration c", Configuration.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(configs);

        // Act
        List<Configuration> result = configurationDao.getConfigurationList();

        // Assert
        assertThat(result.get(0).getName()).isEqualTo("config.a");
        assertThat(result.get(1).getName()).isEqualTo("config.b");
        assertThat(result.get(2).getName()).isEqualTo("config.c");
    }

    @Test
    @DisplayName("Should return consistent results on multiple calls to getConfigurationList")
    void getConfigurationListReturnsConsistentResults() {
        // Arrange
        List<Configuration> configs = createConfigurationList(3);

        when(entityManager.createQuery("SELECT c FROM Configuration c", Configuration.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(configs);

        // Act
        List<Configuration> result1 = configurationDao.getConfigurationList();
        List<Configuration> result2 = configurationDao.getConfigurationList();

        // Assert
        assertThat(result1).isEqualTo(result2);
    }

    @Test
    @DisplayName("Should verify getResultList is called for getConfigurationByName")
    void getConfigurationByNameCallsGetResultList() {
        // Arrange
        String configName = "test.config";

        when(entityManager.createNamedQuery("Configuration.findByName", Configuration.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("name", configName))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        configurationDao.getConfigurationByName(configName);

        // Assert
        verify(typedQuery).getResultList();
    }

    @Test
    @DisplayName("Should verify getResultList is called for getConfigurationList")
    void getConfigurationListCallsGetResultList() {
        // Arrange
        when(entityManager.createQuery("SELECT c FROM Configuration c", Configuration.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        configurationDao.getConfigurationList();

        // Assert
        verify(typedQuery).getResultList();
    }

    @Test
    @DisplayName("Should not use createQuery for getConfigurationByName")
    void getConfigurationByNameDoesNotUseCreateQuery() {
        // Arrange
        String configName = "test.config";

        when(entityManager.createNamedQuery("Configuration.findByName", Configuration.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("name", configName))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        configurationDao.getConfigurationByName(configName);

        // Assert
        verify(entityManager, never()).createQuery(anyString(), eq(Configuration.class));
    }

    @Test
    @DisplayName("Should not use named query for getConfigurationList")
    void getConfigurationListDoesNotUseNamedQuery() {
        // Arrange
        when(entityManager.createQuery("SELECT c FROM Configuration c", Configuration.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        configurationDao.getConfigurationList();

        // Assert
        verify(entityManager, never()).createNamedQuery(anyString(), any());
    }

    @Test
    @DisplayName("Should handle configuration with null value")
    void getConfigurationByNameHandlesNullValue() {
        // Arrange
        String configName = "config.with.null";
        Configuration config = createConfiguration(1, configName, null);

        when(entityManager.createNamedQuery("Configuration.findByName", Configuration.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("name", configName))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(Collections.singletonList(config));

        // Act
        Configuration result = configurationDao.getConfigurationByName(configName);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo(configName);
        assertThat(result.getValue()).isNull();
    }

    @Test
    @DisplayName("Should return configurations with different values")
    void getConfigurationListReturnsDifferentValues() {
        // Arrange
        Configuration config1 = createConfiguration(1, "config1", "value1");
        Configuration config2 = createConfiguration(2, "config2", "value2");
        List<Configuration> configs = Arrays.asList(config1, config2);

        when(entityManager.createQuery("SELECT c FROM Configuration c", Configuration.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(configs);

        // Act
        List<Configuration> result = configurationDao.getConfigurationList();

        // Assert
        assertThat(result.get(0).getValue()).isEqualTo("value1");
        assertThat(result.get(1).getValue()).isEqualTo("value2");
    }

    @Test
    @DisplayName("Should create query exactly once per call to getConfigurationList")
    void getConfigurationListCreatesQueryOncePerCall() {
        // Arrange
        when(entityManager.createQuery("SELECT c FROM Configuration c", Configuration.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        configurationDao.getConfigurationList();

        // Assert
        verify(entityManager, times(1)).createQuery(anyString(), eq(Configuration.class));
    }

    private List<Configuration> createConfigurationList(int count) {
        List<Configuration> configs = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            configs.add(createConfiguration(i + 1, "config." + (i + 1), "value" + (i + 1)));
        }
        return configs;
    }

    private Configuration createConfiguration(int id, String name, String value) {
        Configuration config = new Configuration();
        config.setConfigurationId(id);
        config.setName(name);
        config.setValue(value);
        return config;
    }
}
