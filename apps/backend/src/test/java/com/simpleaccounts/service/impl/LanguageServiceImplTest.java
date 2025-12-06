package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.LanguageDao;
import com.simpleaccounts.entity.Language;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class LanguageServiceImplTest {

    @Mock
    private LanguageDao languageDao;

    @InjectMocks
    private LanguageServiceImpl languageService;

    private Language testLanguage;
    private Language defaultLanguage;

    @BeforeEach
    void setUp() {
        testLanguage = new Language();
        testLanguage.setLanguageId(1);
        testLanguage.setLanguageName("English");
        testLanguage.setLanguageCode("en");
        testLanguage.setIsDefault(false);

        defaultLanguage = new Language();
        defaultLanguage.setLanguageId(2);
        defaultLanguage.setLanguageName("Arabic");
        defaultLanguage.setLanguageCode("ar");
        defaultLanguage.setIsDefault(true);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnLanguageDaoWhenGetDaoCalled() {
        assertThat(languageService.getDao()).isEqualTo(languageDao);
    }

    @Test
    void shouldReturnNonNullDao() {
        assertThat(languageService.getDao()).isNotNull();
    }

    // ========== getLanguages Tests ==========

    @Test
    void shouldReturnListOfLanguagesWhenLanguagesExist() {
        List<Language> expectedList = Arrays.asList(testLanguage, defaultLanguage);

        when(languageDao.getLanguages()).thenReturn(expectedList);

        List<Language> result = languageService.getLanguages();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(testLanguage, defaultLanguage);
        verify(languageDao, times(1)).getLanguages();
    }

    @Test
    void shouldReturnEmptyListWhenNoLanguagesExist() {
        when(languageDao.getLanguages()).thenReturn(Collections.emptyList());

        List<Language> result = languageService.getLanguages();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(languageDao, times(1)).getLanguages();
    }

    @Test
    void shouldReturnNullWhenNoLanguageData() {
        when(languageDao.getLanguages()).thenReturn(null);

        List<Language> result = languageService.getLanguages();

        assertThat(result).isNull();
        verify(languageDao, times(1)).getLanguages();
    }

    @Test
    void shouldReturnSingleLanguage() {
        List<Language> expectedList = Collections.singletonList(testLanguage);

        when(languageDao.getLanguages()).thenReturn(expectedList);

        List<Language> result = languageService.getLanguages();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getLanguageName()).isEqualTo("English");
        verify(languageDao, times(1)).getLanguages();
    }

    @Test
    void shouldReturnMultipleLanguages() {
        Language language3 = new Language();
        language3.setLanguageId(3);
        language3.setLanguageName("French");
        language3.setLanguageCode("fr");

        Language language4 = new Language();
        language4.setLanguageId(4);
        language4.setLanguageName("German");
        language4.setLanguageCode("de");

        List<Language> expectedList = Arrays.asList(testLanguage, defaultLanguage, language3, language4);

        when(languageDao.getLanguages()).thenReturn(expectedList);

        List<Language> result = languageService.getLanguages();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(4);
        assertThat(result).containsExactly(testLanguage, defaultLanguage, language3, language4);
        verify(languageDao, times(1)).getLanguages();
    }

    @Test
    void shouldHandleMultipleGetLanguagesCalls() {
        List<Language> expectedList = Arrays.asList(testLanguage);

        when(languageDao.getLanguages()).thenReturn(expectedList);

        List<Language> result1 = languageService.getLanguages();
        List<Language> result2 = languageService.getLanguages();

        assertThat(result1).isEqualTo(expectedList);
        assertThat(result2).isEqualTo(expectedList);
        verify(languageDao, times(2)).getLanguages();
    }

    @Test
    void shouldReturnLanguagesWithAllPropertiesPopulated() {
        testLanguage.setIsDefault(true);
        testLanguage.setLanguageCode("en-US");

        List<Language> expectedList = Collections.singletonList(testLanguage);

        when(languageDao.getLanguages()).thenReturn(expectedList);

        List<Language> result = languageService.getLanguages();

        assertThat(result).isNotNull();
        assertThat(result.get(0).getIsDefault()).isTrue();
        assertThat(result.get(0).getLanguageCode()).isEqualTo("en-US");
        verify(languageDao, times(1)).getLanguages();
    }

    // ========== getLanguage Tests ==========

    @Test
    void shouldReturnLanguageWhenValidLanguageIdProvided() {
        when(languageDao.getLanguageById(1)).thenReturn(testLanguage);

        Language result = languageService.getLanguage(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testLanguage);
        assertThat(result.getLanguageId()).isEqualTo(1);
        assertThat(result.getLanguageName()).isEqualTo("English");
        verify(languageDao, times(1)).getLanguageById(1);
    }

    @Test
    void shouldReturnNullWhenLanguageIdNotFound() {
        when(languageDao.getLanguageById(999)).thenReturn(null);

        Language result = languageService.getLanguage(999);

        assertThat(result).isNull();
        verify(languageDao, times(1)).getLanguageById(999);
    }

    @Test
    void shouldHandleNullLanguageId() {
        when(languageDao.getLanguageById(null)).thenReturn(null);

        Language result = languageService.getLanguage(null);

        assertThat(result).isNull();
        verify(languageDao, times(1)).getLanguageById(null);
    }

    @Test
    void shouldHandleZeroLanguageId() {
        when(languageDao.getLanguageById(0)).thenReturn(null);

        Language result = languageService.getLanguage(0);

        assertThat(result).isNull();
        verify(languageDao, times(1)).getLanguageById(0);
    }

    @Test
    void shouldHandleNegativeLanguageId() {
        when(languageDao.getLanguageById(-1)).thenReturn(null);

        Language result = languageService.getLanguage(-1);

        assertThat(result).isNull();
        verify(languageDao, times(1)).getLanguageById(-1);
    }

    @Test
    void shouldReturnDefaultLanguageById() {
        when(languageDao.getLanguageById(2)).thenReturn(defaultLanguage);

        Language result = languageService.getLanguage(2);

        assertThat(result).isNotNull();
        assertThat(result.getIsDefault()).isTrue();
        assertThat(result.getLanguageName()).isEqualTo("Arabic");
        verify(languageDao, times(1)).getLanguageById(2);
    }

    @Test
    void shouldHandleMultipleGetLanguageCalls() {
        when(languageDao.getLanguageById(1)).thenReturn(testLanguage);

        Language result1 = languageService.getLanguage(1);
        Language result2 = languageService.getLanguage(1);

        assertThat(result1).isEqualTo(testLanguage);
        assertThat(result2).isEqualTo(testLanguage);
        verify(languageDao, times(2)).getLanguageById(1);
    }

    @Test
    void shouldReturnDifferentLanguagesForDifferentIds() {
        when(languageDao.getLanguageById(1)).thenReturn(testLanguage);
        when(languageDao.getLanguageById(2)).thenReturn(defaultLanguage);

        Language result1 = languageService.getLanguage(1);
        Language result2 = languageService.getLanguage(2);

        assertThat(result1).isNotNull();
        assertThat(result2).isNotNull();
        assertThat(result1.getLanguageCode()).isEqualTo("en");
        assertThat(result2.getLanguageCode()).isEqualTo("ar");
        verify(languageDao, times(1)).getLanguageById(1);
        verify(languageDao, times(1)).getLanguageById(2);
    }

    // ========== getDefaultLanguage Tests ==========

    @Test
    void shouldReturnDefaultLanguageWhenExists() {
        when(languageDao.getDefaultLanguage()).thenReturn(defaultLanguage);

        Language result = languageService.getDefaultLanguage();

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(defaultLanguage);
        assertThat(result.getIsDefault()).isTrue();
        assertThat(result.getLanguageName()).isEqualTo("Arabic");
        verify(languageDao, times(1)).getDefaultLanguage();
    }

    @Test
    void shouldReturnNullWhenNoDefaultLanguageExists() {
        when(languageDao.getDefaultLanguage()).thenReturn(null);

        Language result = languageService.getDefaultLanguage();

        assertThat(result).isNull();
        verify(languageDao, times(1)).getDefaultLanguage();
    }

    @Test
    void shouldReturnEnglishAsDefaultLanguage() {
        testLanguage.setIsDefault(true);

        when(languageDao.getDefaultLanguage()).thenReturn(testLanguage);

        Language result = languageService.getDefaultLanguage();

        assertThat(result).isNotNull();
        assertThat(result.getIsDefault()).isTrue();
        assertThat(result.getLanguageCode()).isEqualTo("en");
        verify(languageDao, times(1)).getDefaultLanguage();
    }

    @Test
    void shouldHandleMultipleGetDefaultLanguageCalls() {
        when(languageDao.getDefaultLanguage()).thenReturn(defaultLanguage);

        Language result1 = languageService.getDefaultLanguage();
        Language result2 = languageService.getDefaultLanguage();
        Language result3 = languageService.getDefaultLanguage();

        assertThat(result1).isEqualTo(defaultLanguage);
        assertThat(result2).isEqualTo(defaultLanguage);
        assertThat(result3).isEqualTo(defaultLanguage);
        verify(languageDao, times(3)).getDefaultLanguage();
    }

    @Test
    void shouldReturnDefaultLanguageWithAllProperties() {
        defaultLanguage.setLanguageCode("ar-AE");

        when(languageDao.getDefaultLanguage()).thenReturn(defaultLanguage);

        Language result = languageService.getDefaultLanguage();

        assertThat(result).isNotNull();
        assertThat(result.getLanguageCode()).isEqualTo("ar-AE");
        assertThat(result.getIsDefault()).isTrue();
        verify(languageDao, times(1)).getDefaultLanguage();
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldPersistNewLanguage() {
        languageService.persist(testLanguage);

        verify(languageDao, times(1)).persist(testLanguage);
    }

    @Test
    void shouldUpdateExistingLanguage() {
        when(languageDao.update(testLanguage)).thenReturn(testLanguage);

        Language result = languageService.update(testLanguage);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testLanguage);
        verify(languageDao, times(1)).update(testLanguage);
    }

    @Test
    void shouldDeleteLanguage() {
        languageService.delete(testLanguage);

        verify(languageDao, times(1)).delete(testLanguage);
    }

    @Test
    void shouldFindLanguageByPrimaryKey() {
        when(languageDao.findByPK(1)).thenReturn(testLanguage);

        Language result = languageService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testLanguage);
        verify(languageDao, times(1)).findByPK(1);
    }

    @Test
    void shouldUpdateLanguageName() {
        testLanguage.setLanguageName("English (US)");

        when(languageDao.update(testLanguage)).thenReturn(testLanguage);

        Language result = languageService.update(testLanguage);

        assertThat(result).isNotNull();
        assertThat(result.getLanguageName()).isEqualTo("English (US)");
        verify(languageDao, times(1)).update(testLanguage);
    }

    @Test
    void shouldUpdateLanguageCode() {
        testLanguage.setLanguageCode("en-GB");

        when(languageDao.update(testLanguage)).thenReturn(testLanguage);

        Language result = languageService.update(testLanguage);

        assertThat(result).isNotNull();
        assertThat(result.getLanguageCode()).isEqualTo("en-GB");
        verify(languageDao, times(1)).update(testLanguage);
    }

    @Test
    void shouldUpdateDefaultFlag() {
        testLanguage.setIsDefault(true);

        when(languageDao.update(testLanguage)).thenReturn(testLanguage);

        Language result = languageService.update(testLanguage);

        assertThat(result).isNotNull();
        assertThat(result.getIsDefault()).isTrue();
        verify(languageDao, times(1)).update(testLanguage);
    }

    @Test
    void shouldHandleNullLanguageInUpdate() {
        when(languageDao.update(null)).thenReturn(null);

        Language result = languageService.update(null);

        assertThat(result).isNull();
        verify(languageDao, times(1)).update(null);
    }

    @Test
    void shouldFindLanguageByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("languageCode", "en");

        List<Language> expectedList = Collections.singletonList(testLanguage);

        when(languageDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<Language> result = languageService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getLanguageCode()).isEqualTo("en");
        verify(languageDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldFindDefaultLanguageByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("isDefault", true);

        List<Language> expectedList = Collections.singletonList(defaultLanguage);

        when(languageDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<Language> result = languageService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getIsDefault()).isTrue();
        verify(languageDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        when(languageDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<Language> result = languageService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(languageDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        when(languageDao.findByAttributes(null)).thenReturn(null);

        List<Language> result = languageService.findByAttributes(null);

        assertThat(result).isNull();
        verify(languageDao, times(1)).findByAttributes(null);
    }

    @Test
    void shouldPersistMultipleLanguages() {
        Language language2 = new Language();
        language2.setLanguageId(3);
        language2.setLanguageName("Spanish");

        languageService.persist(testLanguage);
        languageService.persist(language2);

        verify(languageDao, times(1)).persist(testLanguage);
        verify(languageDao, times(1)).persist(language2);
    }

    @Test
    void shouldDeleteMultipleLanguages() {
        Language language2 = new Language();
        language2.setLanguageId(3);

        languageService.delete(testLanguage);
        languageService.delete(language2);

        verify(languageDao, times(1)).delete(testLanguage);
        verify(languageDao, times(1)).delete(language2);
    }
}
