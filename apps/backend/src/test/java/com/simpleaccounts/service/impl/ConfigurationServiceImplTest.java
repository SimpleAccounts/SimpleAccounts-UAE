package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import com.simpleaccounts.dao.ConfigurationDao;
import com.simpleaccounts.entity.Configuration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Unit tests for ConfigurationServiceImpl.
 */
@ExtendWith(MockitoExtension.class)
class ConfigurationServiceImplTest {

    @Mock
    private ConfigurationDao configurationDao;

    @InjectMocks
    private ConfigurationServiceImpl configurationService;

    private Configuration testConfiguration;

    @BeforeEach
    void setUp() {
        testConfiguration = new Configuration();
        testConfiguration.setId(1);
        testConfiguration.setName("TEST_CONFIG");
        testConfiguration.setValue("test_value");
        testConfiguration.setCreatedBy(1);
        testConfiguration.setCreatedDate(LocalDateTime.now());
        testConfiguration.setDeleteFlag(false);
    }

    // ========== getConfigurationByName Tests ==========

    @Test
    void shouldGetConfigurationByName() {
        when(configurationDao.getConfigurationByName("TEST_CONFIG")).thenReturn(testConfiguration);

        Configuration result = configurationService.getConfigurationByName("TEST_CONFIG");

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("TEST_CONFIG");
        assertThat(result.getValue()).isEqualTo("test_value");
        verify(configurationDao, times(1)).getConfigurationByName("TEST_CONFIG");
    }

    @Test
    void shouldReturnNullWhenConfigurationNotFound() {
        when(configurationDao.getConfigurationByName("NONEXISTENT")).thenReturn(null);

        Configuration result = configurationService.getConfigurationByName("NONEXISTENT");

        assertThat(result).isNull();
        verify(configurationDao, times(1)).getConfigurationByName("NONEXISTENT");
    }

    @Test
    void shouldHandleEmptyConfigurationName() {
        when(configurationDao.getConfigurationByName("")).thenReturn(null);

        Configuration result = configurationService.getConfigurationByName("");

        assertThat(result).isNull();
    }

    @Test
    void shouldHandleNullConfigurationName() {
        when(configurationDao.getConfigurationByName(null)).thenReturn(null);

        Configuration result = configurationService.getConfigurationByName(null);

        assertThat(result).isNull();
    }

    // ========== getConfigurationList Tests ==========

    @Test
    void shouldGetConfigurationList() {
        Configuration config2 = new Configuration();
        config2.setId(2);
        config2.setName("CONFIG_2");
        config2.setValue("value_2");

        List<Configuration> configList = Arrays.asList(testConfiguration, config2);
        when(configurationDao.getConfigurationList()).thenReturn(configList);

        List<Configuration> result = configurationService.getConfigurationList();

        assertThat(result).isNotNull().hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("TEST_CONFIG");
        assertThat(result.get(1).getName()).isEqualTo("CONFIG_2");
        verify(configurationDao, times(1)).getConfigurationList();
    }

    @Test
    void shouldReturnEmptyListWhenNoConfigurations() {
        when(configurationDao.getConfigurationList()).thenReturn(Collections.emptyList());

        List<Configuration> result = configurationService.getConfigurationList();

        assertThat(result).isNotNull().isEmpty();
    }

    @Test
    void shouldReturnSingleConfiguration() {
        List<Configuration> configList = Collections.singletonList(testConfiguration);
        when(configurationDao.getConfigurationList()).thenReturn(configList);

        List<Configuration> result = configurationService.getConfigurationList();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1);
    }

    // ========== updateConfigurationList Tests ==========

    @Test
    void shouldUpdateExistingConfiguration() {
        testConfiguration.setId(1);
        List<Configuration> configList = Collections.singletonList(testConfiguration);

        configurationService.updateConfigurationList(configList);

        verify(configurationDao, times(1)).update(testConfiguration);
        verify(configurationDao, never()).persist(any());
    }

    @Test
    void shouldPersistNewConfiguration() {
        Configuration newConfig = new Configuration();
        newConfig.setId(null);
        newConfig.setName("NEW_CONFIG");
        newConfig.setValue("new_value");
        List<Configuration> configList = Collections.singletonList(newConfig);

        configurationService.updateConfigurationList(configList);

        verify(configurationDao, never()).update(any());
        verify(configurationDao, times(1)).persist(newConfig);
    }

    @Test
    void shouldUpdateAndPersistMixedList() {
        Configuration existingConfig = new Configuration();
        existingConfig.setId(1);
        existingConfig.setName("EXISTING");

        Configuration newConfig = new Configuration();
        newConfig.setId(null);
        newConfig.setName("NEW");

        List<Configuration> configList = Arrays.asList(existingConfig, newConfig);

        configurationService.updateConfigurationList(configList);

        verify(configurationDao, times(1)).update(existingConfig);
        verify(configurationDao, times(1)).persist(newConfig);
    }

    @Test
    void shouldHandleEmptyListUpdate() {
        List<Configuration> emptyList = Collections.emptyList();

        configurationService.updateConfigurationList(emptyList);

        verify(configurationDao, never()).update(any());
        verify(configurationDao, never()).persist(any());
    }

    @Test
    void shouldUpdateMultipleExistingConfigurations() {
        Configuration config1 = new Configuration();
        config1.setId(1);
        config1.setName("CONFIG_1");

        Configuration config2 = new Configuration();
        config2.setId(2);
        config2.setName("CONFIG_2");

        Configuration config3 = new Configuration();
        config3.setId(3);
        config3.setName("CONFIG_3");

        List<Configuration> configList = Arrays.asList(config1, config2, config3);

        configurationService.updateConfigurationList(configList);

        verify(configurationDao, times(3)).update(any());
        verify(configurationDao, never()).persist(any());
    }

    @Test
    void shouldPersistMultipleNewConfigurations() {
        Configuration config1 = new Configuration();
        config1.setId(null);
        config1.setName("NEW_1");

        Configuration config2 = new Configuration();
        config2.setId(null);
        config2.setName("NEW_2");

        List<Configuration> configList = Arrays.asList(config1, config2);

        configurationService.updateConfigurationList(configList);

        verify(configurationDao, never()).update(any());
        verify(configurationDao, times(2)).persist(any());
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnDaoInstance() {
        // getDao is protected, but we can verify through service behavior
        when(configurationDao.getConfigurationByName("TEST")).thenReturn(testConfiguration);

        Configuration result = configurationService.getConfigurationByName("TEST");

        assertThat(result).isNotNull();
    }

    // ========== Edge Cases ==========

    @Test
    void shouldHandleConfigurationWithLongValue() {
        String longValue = "x".repeat(5000);
        testConfiguration.setValue(longValue);
        when(configurationDao.getConfigurationByName("LONG_CONFIG")).thenReturn(testConfiguration);

        Configuration result = configurationService.getConfigurationByName("LONG_CONFIG");

        assertThat(result.getValue()).hasSize(5000);
    }

    @Test
    void shouldHandleConfigurationWithNullValue() {
        testConfiguration.setValue(null);
        when(configurationDao.getConfigurationByName("NULL_VALUE")).thenReturn(testConfiguration);

        Configuration result = configurationService.getConfigurationByName("NULL_VALUE");

        assertThat(result.getValue()).isNull();
    }

    @Test
    void shouldHandleSpecialCharactersInValue() {
        testConfiguration.setValue("<script>alert('xss')</script>");
        when(configurationDao.getConfigurationByName("SPECIAL")).thenReturn(testConfiguration);

        Configuration result = configurationService.getConfigurationByName("SPECIAL");

        assertThat(result.getValue()).isEqualTo("<script>alert('xss')</script>");
    }

    @Test
    void shouldPreserveConfigurationOrder() {
        List<Configuration> orderedList = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            Configuration config = new Configuration();
            config.setId(i);
            config.setName("CONFIG_" + i);
            config.setOrderSequence(i);
            orderedList.add(config);
        }
        when(configurationDao.getConfigurationList()).thenReturn(orderedList);

        List<Configuration> result = configurationService.getConfigurationList();

        assertThat(result).hasSize(10);
        for (int i = 0; i < 10; i++) {
            assertThat(result.get(i).getOrderSequence()).isEqualTo(i);
        }
    }
}
