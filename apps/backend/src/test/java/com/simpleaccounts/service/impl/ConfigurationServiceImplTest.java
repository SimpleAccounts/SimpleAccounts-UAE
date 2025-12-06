package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.ConfigurationDao;
import com.simpleaccounts.entity.Configuration;
import com.simpleaccounts.exceptions.ServiceException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ConfigurationServiceImplTest {

    @Mock
    private ConfigurationDao dao;

    @InjectMocks
    private ConfigurationServiceImpl configurationService;

    private Configuration testConfiguration;

    @BeforeEach
    void setUp() {
        testConfiguration = new Configuration();
        testConfiguration.setId(1);
        testConfiguration.setConfigurationName("DEFAULT_CURRENCY");
        testConfiguration.setConfigurationValue("AED");
        testConfiguration.setConfigurationDescription("Default currency for transactions");
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnDaoWhenGetDaoCalled() {
        assertThat(configurationService.getDao()).isEqualTo(dao);
    }

    // ========== getConfigurationByName Tests ==========

    @Test
    void shouldReturnConfigurationWhenValidNameProvided() {
        when(dao.getConfigurationByName("DEFAULT_CURRENCY")).thenReturn(testConfiguration);

        Configuration result = configurationService.getConfigurationByName("DEFAULT_CURRENCY");

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testConfiguration);
        assertThat(result.getConfigurationName()).isEqualTo("DEFAULT_CURRENCY");
        assertThat(result.getConfigurationValue()).isEqualTo("AED");
        verify(dao, times(1)).getConfigurationByName("DEFAULT_CURRENCY");
    }

    @Test
    void shouldReturnNullWhenConfigurationNotFoundByName() {
        when(dao.getConfigurationByName("NONEXISTENT")).thenReturn(null);

        Configuration result = configurationService.getConfigurationByName("NONEXISTENT");

        assertThat(result).isNull();
        verify(dao, times(1)).getConfigurationByName("NONEXISTENT");
    }

    @Test
    void shouldReturnConfigurationWithAllFieldsPopulated() {
        Configuration fullConfig = new Configuration();
        fullConfig.setId(2);
        fullConfig.setConfigurationName("TAX_RATE");
        fullConfig.setConfigurationValue("5.0");
        fullConfig.setConfigurationDescription("VAT tax rate percentage");

        when(dao.getConfigurationByName("TAX_RATE")).thenReturn(fullConfig);

        Configuration result = configurationService.getConfigurationByName("TAX_RATE");

        assertThat(result).isNotNull();
        assertThat(result.getConfigurationName()).isEqualTo("TAX_RATE");
        assertThat(result.getConfigurationValue()).isEqualTo("5.0");
        assertThat(result.getConfigurationDescription()).isEqualTo("VAT tax rate percentage");
        verify(dao, times(1)).getConfigurationByName("TAX_RATE");
    }

    @Test
    void shouldHandleDifferentConfigurationNames() {
        Configuration currencyConfig = createConfiguration(1, "CURRENCY", "AED", "Currency");
        Configuration taxConfig = createConfiguration(2, "TAX_RATE", "5.0", "Tax Rate");
        Configuration languageConfig = createConfiguration(3, "LANGUAGE", "EN", "Language");

        when(dao.getConfigurationByName("CURRENCY")).thenReturn(currencyConfig);
        when(dao.getConfigurationByName("TAX_RATE")).thenReturn(taxConfig);
        when(dao.getConfigurationByName("LANGUAGE")).thenReturn(languageConfig);

        Configuration result1 = configurationService.getConfigurationByName("CURRENCY");
        Configuration result2 = configurationService.getConfigurationByName("TAX_RATE");
        Configuration result3 = configurationService.getConfigurationByName("LANGUAGE");

        assertThat(result1.getConfigurationValue()).isEqualTo("AED");
        assertThat(result2.getConfigurationValue()).isEqualTo("5.0");
        assertThat(result3.getConfigurationValue()).isEqualTo("EN");
        verify(dao, times(1)).getConfigurationByName("CURRENCY");
        verify(dao, times(1)).getConfigurationByName("TAX_RATE");
        verify(dao, times(1)).getConfigurationByName("LANGUAGE");
    }

    @Test
    void shouldHandleNullConfigurationName() {
        when(dao.getConfigurationByName(null)).thenReturn(null);

        Configuration result = configurationService.getConfigurationByName(null);

        assertThat(result).isNull();
        verify(dao, times(1)).getConfigurationByName(null);
    }

    @Test
    void shouldHandleEmptyConfigurationName() {
        when(dao.getConfigurationByName("")).thenReturn(null);

        Configuration result = configurationService.getConfigurationByName("");

        assertThat(result).isNull();
        verify(dao, times(1)).getConfigurationByName("");
    }

    @Test
    void shouldHandleCaseDistinctionInConfigurationName() {
        Configuration lowerConfig = createConfiguration(1, "currency", "USD", "Lower case");
        Configuration upperConfig = createConfiguration(2, "CURRENCY", "AED", "Upper case");

        when(dao.getConfigurationByName("currency")).thenReturn(lowerConfig);
        when(dao.getConfigurationByName("CURRENCY")).thenReturn(upperConfig);

        Configuration result1 = configurationService.getConfigurationByName("currency");
        Configuration result2 = configurationService.getConfigurationByName("CURRENCY");

        assertThat(result1.getConfigurationValue()).isEqualTo("USD");
        assertThat(result2.getConfigurationValue()).isEqualTo("AED");
        verify(dao, times(1)).getConfigurationByName("currency");
        verify(dao, times(1)).getConfigurationByName("CURRENCY");
    }

    // ========== getConfigurationList Tests ==========

    @Test
    void shouldReturnConfigurationListWhenConfigurationsExist() {
        Configuration config2 = createConfiguration(2, "TAX_RATE", "5.0", "Tax Rate");
        Configuration config3 = createConfiguration(3, "LANGUAGE", "EN", "Language");

        List<Configuration> expectedList = Arrays.asList(testConfiguration, config2, config3);
        when(dao.getConfigurationList()).thenReturn(expectedList);

        List<Configuration> result = configurationService.getConfigurationList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(testConfiguration, config2, config3);
        assertThat(result.get(0).getConfigurationName()).isEqualTo("DEFAULT_CURRENCY");
        assertThat(result.get(1).getConfigurationName()).isEqualTo("TAX_RATE");
        assertThat(result.get(2).getConfigurationName()).isEqualTo("LANGUAGE");
        verify(dao, times(1)).getConfigurationList();
    }

    @Test
    void shouldReturnEmptyListWhenNoConfigurationsExist() {
        when(dao.getConfigurationList()).thenReturn(Collections.emptyList());

        List<Configuration> result = configurationService.getConfigurationList();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(dao, times(1)).getConfigurationList();
    }

    @Test
    void shouldReturnSingleConfiguration() {
        List<Configuration> expectedList = Collections.singletonList(testConfiguration);
        when(dao.getConfigurationList()).thenReturn(expectedList);

        List<Configuration> result = configurationService.getConfigurationList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(testConfiguration);
        verify(dao, times(1)).getConfigurationList();
    }

    @Test
    void shouldReturnLargeConfigurationList() {
        List<Configuration> largeList = new ArrayList<>();
        for (int i = 1; i <= 50; i++) {
            Configuration config = createConfiguration(i, "CONFIG_" + i, "VALUE_" + i, "Description " + i);
            largeList.add(config);
        }

        when(dao.getConfigurationList()).thenReturn(largeList);

        List<Configuration> result = configurationService.getConfigurationList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(50);
        assertThat(result.get(0).getConfigurationName()).isEqualTo("CONFIG_1");
        assertThat(result.get(49).getConfigurationName()).isEqualTo("CONFIG_50");
        verify(dao, times(1)).getConfigurationList();
    }

    @Test
    void shouldHandleMultipleCallsToGetConfigurationList() {
        List<Configuration> expectedList = Arrays.asList(testConfiguration);
        when(dao.getConfigurationList()).thenReturn(expectedList);

        configurationService.getConfigurationList();
        configurationService.getConfigurationList();

        verify(dao, times(2)).getConfigurationList();
    }

    // ========== updateConfigurationList Tests ==========

    @Test
    void shouldUpdateConfigurationListWhenAllHaveIds() {
        Configuration config1 = createConfiguration(1, "CURRENCY", "AED", "Currency");
        Configuration config2 = createConfiguration(2, "TAX_RATE", "5.0", "Tax Rate");
        Configuration config3 = createConfiguration(3, "LANGUAGE", "EN", "Language");

        List<Configuration> configList = Arrays.asList(config1, config2, config3);

        configurationService.updateConfigurationList(configList);

        verify(dao, times(1)).update(config1);
        verify(dao, times(1)).update(config2);
        verify(dao, times(1)).update(config3);
        verify(dao, never()).persist(any(Configuration.class));
    }

    @Test
    void shouldPersistConfigurationListWhenAllHaveNullIds() {
        Configuration config1 = createConfiguration(null, "NEW_CONFIG1", "VALUE1", "Description 1");
        Configuration config2 = createConfiguration(null, "NEW_CONFIG2", "VALUE2", "Description 2");

        List<Configuration> configList = Arrays.asList(config1, config2);

        configurationService.updateConfigurationList(configList);

        verify(dao, times(1)).persist(config1);
        verify(dao, times(1)).persist(config2);
        verify(dao, never()).update(any(Configuration.class));
    }

    @Test
    void shouldHandleMixedConfigurationListWithNewAndExisting() {
        Configuration existingConfig = createConfiguration(1, "EXISTING", "VALUE", "Existing");
        Configuration newConfig = createConfiguration(null, "NEW", "VALUE", "New");

        List<Configuration> configList = Arrays.asList(existingConfig, newConfig);

        configurationService.updateConfigurationList(configList);

        verify(dao, times(1)).update(existingConfig);
        verify(dao, times(1)).persist(newConfig);
    }

    @Test
    void shouldHandleEmptyConfigurationList() {
        List<Configuration> emptyList = new ArrayList<>();

        configurationService.updateConfigurationList(emptyList);

        verify(dao, never()).update(any(Configuration.class));
        verify(dao, never()).persist(any(Configuration.class));
    }

    @Test
    void shouldHandleSingleConfigurationInList() {
        List<Configuration> singleList = Collections.singletonList(testConfiguration);

        configurationService.updateConfigurationList(singleList);

        verify(dao, times(1)).update(testConfiguration);
        verify(dao, never()).persist(any(Configuration.class));
    }

    @Test
    void shouldUpdateMultipleConfigurationsInCorrectOrder() {
        Configuration config1 = createConfiguration(1, "CONFIG1", "VALUE1", "First");
        Configuration config2 = createConfiguration(2, "CONFIG2", "VALUE2", "Second");
        Configuration config3 = createConfiguration(3, "CONFIG3", "VALUE3", "Third");

        List<Configuration> configList = Arrays.asList(config1, config2, config3);

        configurationService.updateConfigurationList(configList);

        ArgumentCaptor<Configuration> captor = ArgumentCaptor.forClass(Configuration.class);
        verify(dao, times(3)).update(captor.capture());

        List<Configuration> capturedConfigs = captor.getAllValues();
        assertThat(capturedConfigs).hasSize(3);
        assertThat(capturedConfigs.get(0).getConfigurationName()).isEqualTo("CONFIG1");
        assertThat(capturedConfigs.get(1).getConfigurationName()).isEqualTo("CONFIG2");
        assertThat(capturedConfigs.get(2).getConfigurationName()).isEqualTo("CONFIG3");
    }

    @Test
    void shouldPersistMultipleNewConfigurationsInCorrectOrder() {
        Configuration config1 = createConfiguration(null, "NEW1", "VALUE1", "First");
        Configuration config2 = createConfiguration(null, "NEW2", "VALUE2", "Second");

        List<Configuration> configList = Arrays.asList(config1, config2);

        configurationService.updateConfigurationList(configList);

        ArgumentCaptor<Configuration> captor = ArgumentCaptor.forClass(Configuration.class);
        verify(dao, times(2)).persist(captor.capture());

        List<Configuration> capturedConfigs = captor.getAllValues();
        assertThat(capturedConfigs).hasSize(2);
        assertThat(capturedConfigs.get(0).getConfigurationName()).isEqualTo("NEW1");
        assertThat(capturedConfigs.get(1).getConfigurationName()).isEqualTo("NEW2");
    }

    @Test
    void shouldHandleLargeConfigurationListUpdate() {
        List<Configuration> largeList = new ArrayList<>();
        for (int i = 1; i <= 20; i++) {
            Configuration config = createConfiguration(i, "CONFIG_" + i, "VALUE_" + i, "Desc " + i);
            largeList.add(config);
        }

        configurationService.updateConfigurationList(largeList);

        verify(dao, times(20)).update(any(Configuration.class));
        verify(dao, never()).persist(any(Configuration.class));
    }

    @Test
    void shouldHandleConfigurationListWithAlternatingNewAndExisting() {
        List<Configuration> configList = new ArrayList<>();
        configList.add(createConfiguration(1, "EXISTING1", "VAL1", "Desc1"));
        configList.add(createConfiguration(null, "NEW1", "VAL2", "Desc2"));
        configList.add(createConfiguration(2, "EXISTING2", "VAL3", "Desc3"));
        configList.add(createConfiguration(null, "NEW2", "VAL4", "Desc4"));
        configList.add(createConfiguration(3, "EXISTING3", "VAL5", "Desc5"));

        configurationService.updateConfigurationList(configList);

        verify(dao, times(3)).update(any(Configuration.class));
        verify(dao, times(2)).persist(any(Configuration.class));
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldFindConfigurationByPrimaryKey() {
        when(dao.findByPK(1)).thenReturn(testConfiguration);

        Configuration result = configurationService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testConfiguration);
        assertThat(result.getId()).isEqualTo(1);
        verify(dao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenConfigurationNotFoundByPK() {
        when(dao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> configurationService.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(dao, times(1)).findByPK(999);
    }

    @Test
    void shouldPersistNewConfiguration() {
        configurationService.persist(testConfiguration);

        verify(dao, times(1)).persist(testConfiguration);
    }

    @Test
    void shouldUpdateExistingConfiguration() {
        when(dao.update(testConfiguration)).thenReturn(testConfiguration);

        Configuration result = configurationService.update(testConfiguration);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testConfiguration);
        verify(dao, times(1)).update(testConfiguration);
    }

    @Test
    void shouldUpdateConfigurationAndReturnUpdatedEntity() {
        testConfiguration.setConfigurationValue("USD");
        testConfiguration.setConfigurationDescription("Updated Description");

        when(dao.update(testConfiguration)).thenReturn(testConfiguration);

        Configuration result = configurationService.update(testConfiguration);

        assertThat(result).isNotNull();
        assertThat(result.getConfigurationValue()).isEqualTo("USD");
        assertThat(result.getConfigurationDescription()).isEqualTo("Updated Description");
        verify(dao, times(1)).update(testConfiguration);
    }

    @Test
    void shouldDeleteConfiguration() {
        configurationService.delete(testConfiguration);

        verify(dao, times(1)).delete(testConfiguration);
    }

    @Test
    void shouldFindConfigurationsByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("configurationName", "DEFAULT_CURRENCY");

        List<Configuration> expectedList = Arrays.asList(testConfiguration);
        when(dao.findByAttributes(attributes)).thenReturn(expectedList);

        List<Configuration> result = configurationService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testConfiguration);
        verify(dao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("configurationName", "NONEXISTENT");

        when(dao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<Configuration> result = configurationService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(dao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<Configuration> result = configurationService.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(dao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<Configuration> result = configurationService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(dao, never()).findByAttributes(any());
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleConfigurationWithMinimalData() {
        Configuration minimalConfig = new Configuration();
        minimalConfig.setId(99);

        when(dao.findByPK(99)).thenReturn(minimalConfig);

        Configuration result = configurationService.findByPK(99);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(99);
        assertThat(result.getConfigurationName()).isNull();
        assertThat(result.getConfigurationValue()).isNull();
        verify(dao, times(1)).findByPK(99);
    }

    @Test
    void shouldHandleConfigurationWithNullDescription() {
        testConfiguration.setConfigurationDescription(null);
        when(dao.getConfigurationByName("DEFAULT_CURRENCY")).thenReturn(testConfiguration);

        Configuration result = configurationService.getConfigurationByName("DEFAULT_CURRENCY");

        assertThat(result).isNotNull();
        assertThat(result.getConfigurationDescription()).isNull();
        verify(dao, times(1)).getConfigurationByName("DEFAULT_CURRENCY");
    }

    @Test
    void shouldHandleConfigurationWithLongValue() {
        String longValue = "This is a very long configuration value that might contain JSON or XML data " +
                "or any other complex string that needs to be stored in the configuration table. " +
                "It can span multiple lines and contain various special characters.";
        testConfiguration.setConfigurationValue(longValue);

        when(dao.update(testConfiguration)).thenReturn(testConfiguration);

        Configuration result = configurationService.update(testConfiguration);

        assertThat(result).isNotNull();
        assertThat(result.getConfigurationValue()).isEqualTo(longValue);
        verify(dao, times(1)).update(testConfiguration);
    }

    @Test
    void shouldHandleConfigurationWithSpecialCharacters() {
        testConfiguration.setConfigurationName("CONFIG_NAME_WITH_UNDERSCORE");
        testConfiguration.setConfigurationValue("value@with#special$chars%");

        when(dao.getConfigurationByName("CONFIG_NAME_WITH_UNDERSCORE")).thenReturn(testConfiguration);

        Configuration result = configurationService.getConfigurationByName("CONFIG_NAME_WITH_UNDERSCORE");

        assertThat(result).isNotNull();
        assertThat(result.getConfigurationValue()).isEqualTo("value@with#special$chars%");
        verify(dao, times(1)).getConfigurationByName("CONFIG_NAME_WITH_UNDERSCORE");
    }

    @Test
    void shouldHandleNumericConfigurationValues() {
        testConfiguration.setConfigurationValue("12345");
        when(dao.getConfigurationByName("DEFAULT_CURRENCY")).thenReturn(testConfiguration);

        Configuration result = configurationService.getConfigurationByName("DEFAULT_CURRENCY");

        assertThat(result).isNotNull();
        assertThat(result.getConfigurationValue()).isEqualTo("12345");
        verify(dao, times(1)).getConfigurationByName("DEFAULT_CURRENCY");
    }

    @Test
    void shouldHandleBooleanConfigurationValues() {
        testConfiguration.setConfigurationValue("true");
        when(dao.getConfigurationByName("DEFAULT_CURRENCY")).thenReturn(testConfiguration);

        Configuration result = configurationService.getConfigurationByName("DEFAULT_CURRENCY");

        assertThat(result).isNotNull();
        assertThat(result.getConfigurationValue()).isEqualTo("true");
        verify(dao, times(1)).getConfigurationByName("DEFAULT_CURRENCY");
    }

    @Test
    void shouldHandleEmptyConfigurationValue() {
        testConfiguration.setConfigurationValue("");
        when(dao.getConfigurationByName("DEFAULT_CURRENCY")).thenReturn(testConfiguration);

        Configuration result = configurationService.getConfigurationByName("DEFAULT_CURRENCY");

        assertThat(result).isNotNull();
        assertThat(result.getConfigurationValue()).isEmpty();
        verify(dao, times(1)).getConfigurationByName("DEFAULT_CURRENCY");
    }

    @Test
    void shouldUpdateConfigurationListWithZeroId() {
        Configuration configWithZeroId = createConfiguration(0, "ZERO_ID", "VALUE", "Description");
        List<Configuration> configList = Collections.singletonList(configWithZeroId);

        configurationService.updateConfigurationList(configList);

        verify(dao, never()).update(any(Configuration.class));
        verify(dao, times(1)).persist(configWithZeroId);
    }

    @Test
    void shouldVerifyDaoInteractionForGetConfigurationList() {
        List<Configuration> expectedList = Arrays.asList(testConfiguration);
        when(dao.getConfigurationList()).thenReturn(expectedList);

        configurationService.getConfigurationList();
        configurationService.getConfigurationList();
        configurationService.getConfigurationList();

        verify(dao, times(3)).getConfigurationList();
    }

    @Test
    void shouldHandleConfigurationListWithDuplicateNames() {
        Configuration config1 = createConfiguration(1, "DUPLICATE", "VALUE1", "First");
        Configuration config2 = createConfiguration(2, "DUPLICATE", "VALUE2", "Second");

        List<Configuration> configList = Arrays.asList(config1, config2);
        when(dao.getConfigurationList()).thenReturn(configList);

        List<Configuration> result = configurationService.getConfigurationList();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getConfigurationValue()).isEqualTo("VALUE1");
        assertThat(result.get(1).getConfigurationValue()).isEqualTo("VALUE2");
        verify(dao, times(1)).getConfigurationList();
    }

    // ========== Helper Methods ==========

    private Configuration createConfiguration(Integer id, String name, String value, String description) {
        Configuration config = new Configuration();
        config.setId(id);
        config.setConfigurationName(name);
        config.setConfigurationValue(value);
        config.setConfigurationDescription(description);
        return config;
    }
}
