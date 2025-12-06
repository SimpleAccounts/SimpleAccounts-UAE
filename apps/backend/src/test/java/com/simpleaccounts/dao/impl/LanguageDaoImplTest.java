package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.times;

import com.simpleaccounts.entity.Language;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
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
@DisplayName("LanguageDaoImpl Unit Tests")
class LanguageDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<Language> languageTypedQuery;

    @InjectMocks
    private LanguageDaoImpl languageDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(languageDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(languageDao, "entityClass", Language.class);
    }

    @Test
    @DisplayName("Should return language by ID")
    void getLanguageByIdReturnsLanguage() {
        // Arrange
        Integer languageId = 1;
        Language expectedLanguage = createLanguage(languageId, "English", "en");

        when(entityManager.find(Language.class, languageId))
            .thenReturn(expectedLanguage);

        // Act
        Language result = languageDao.getLanguageById(languageId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getLanguageId()).isEqualTo(languageId);
        assertThat(result.getLanguageName()).isEqualTo("English");
    }

    @Test
    @DisplayName("Should return null when language ID not found")
    void getLanguageByIdReturnsNullWhenNotFound() {
        // Arrange
        Integer languageId = 999;

        when(entityManager.find(Language.class, languageId))
            .thenReturn(null);

        // Act
        Language result = languageDao.getLanguageById(languageId);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should verify entity manager find is called")
    void getLanguageByIdCallsEntityManagerFind() {
        // Arrange
        Integer languageId = 5;

        when(entityManager.find(Language.class, languageId))
            .thenReturn(createLanguage(languageId, "Spanish", "es"));

        // Act
        languageDao.getLanguageById(languageId);

        // Assert
        verify(entityManager).find(Language.class, languageId);
    }

    @Test
    @DisplayName("Should return all languages")
    void getLanguagesReturnsAllLanguages() {
        // Arrange
        List<Language> expectedLanguages = createLanguageList(5);

        when(entityManager.createNamedQuery("allLanguages", Language.class))
            .thenReturn(languageTypedQuery);
        when(languageTypedQuery.getResultList())
            .thenReturn(expectedLanguages);

        // Act
        List<Language> result = languageDao.getLanguages();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        assertThat(result).isEqualTo(expectedLanguages);
    }

    @Test
    @DisplayName("Should return empty list when no languages exist")
    void getLanguagesReturnsEmptyListWhenNoLanguages() {
        // Arrange
        when(entityManager.createNamedQuery("allLanguages", Language.class))
            .thenReturn(languageTypedQuery);
        when(languageTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<Language> result = languageDao.getLanguages();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should use correct named query for all languages")
    void getLanguagesUsesCorrectNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("allLanguages", Language.class))
            .thenReturn(languageTypedQuery);
        when(languageTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        languageDao.getLanguages();

        // Assert
        verify(entityManager).createNamedQuery("allLanguages", Language.class);
    }

    @Test
    @DisplayName("Should return default language")
    void getDefaultLanguageReturnsDefaultLanguage() {
        // Arrange
        Language defaultLanguage = createLanguage(1, "English", "en");
        defaultLanguage.setDefaultFlag("Y");

        when(entityManager.createQuery(anyString(), eq(Language.class)))
            .thenReturn(languageTypedQuery);
        when(languageTypedQuery.getSingleResult())
            .thenReturn(defaultLanguage);

        // Act
        Language result = languageDao.getDefaultLanguage();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getDefaultFlag()).isEqualTo("Y");
        assertThat(result.getLanguageName()).isEqualTo("English");
    }

    @Test
    @DisplayName("Should build correct query for default language")
    void getDefaultLanguageBuildsCorrectQuery() {
        // Arrange
        Language defaultLanguage = createLanguage(1, "English", "en");

        when(entityManager.createQuery(anyString(), eq(Language.class)))
            .thenReturn(languageTypedQuery);
        when(languageTypedQuery.getSingleResult())
            .thenReturn(defaultLanguage);

        // Act
        languageDao.getDefaultLanguage();

        // Assert
        verify(entityManager).createQuery(
            "SELECT l FROM Language l where l.deleteFlag=false AND l.defaultFlag = 'Y' ORDER BY l.orderSequence ASC ",
            Language.class
        );
    }

    @Test
    @DisplayName("Should throw exception when no default language found")
    void getDefaultLanguageThrowsExceptionWhenNotFound() {
        // Arrange
        when(entityManager.createQuery(anyString(), eq(Language.class)))
            .thenReturn(languageTypedQuery);
        when(languageTypedQuery.getSingleResult())
            .thenThrow(new NoResultException());

        // Act & Assert
        assertThatThrownBy(() -> languageDao.getDefaultLanguage())
            .isInstanceOf(NoResultException.class);
    }

    @Test
    @DisplayName("Should return single language when only one exists")
    void getLanguagesReturnsSingleLanguage() {
        // Arrange
        List<Language> languages = Collections.singletonList(
            createLanguage(1, "English", "en")
        );

        when(entityManager.createNamedQuery("allLanguages", Language.class))
            .thenReturn(languageTypedQuery);
        when(languageTypedQuery.getResultList())
            .thenReturn(languages);

        // Act
        List<Language> result = languageDao.getLanguages();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getLanguageName()).isEqualTo("English");
    }

    @Test
    @DisplayName("Should handle large list of languages")
    void getLanguagesHandlesLargeList() {
        // Arrange
        List<Language> languages = createLanguageList(100);

        when(entityManager.createNamedQuery("allLanguages", Language.class))
            .thenReturn(languageTypedQuery);
        when(languageTypedQuery.getResultList())
            .thenReturn(languages);

        // Act
        List<Language> result = languageDao.getLanguages();

        // Assert
        assertThat(result).hasSize(100);
    }

    @Test
    @DisplayName("Should return consistent results on multiple calls")
    void getLanguagesReturnsConsistentResults() {
        // Arrange
        List<Language> languages = createLanguageList(3);

        when(entityManager.createNamedQuery("allLanguages", Language.class))
            .thenReturn(languageTypedQuery);
        when(languageTypedQuery.getResultList())
            .thenReturn(languages);

        // Act
        List<Language> result1 = languageDao.getLanguages();
        List<Language> result2 = languageDao.getLanguages();

        // Assert
        assertThat(result1).isEqualTo(result2);
    }

    @Test
    @DisplayName("Should handle null language ID")
    void getLanguageByIdHandlesNullId() {
        // Arrange
        Integer languageId = null;

        when(entityManager.find(Language.class, languageId))
            .thenReturn(null);

        // Act
        Language result = languageDao.getLanguageById(languageId);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return language with zero ID")
    void getLanguageByIdHandlesZeroId() {
        // Arrange
        Integer languageId = 0;
        Language language = createLanguage(languageId, "Unknown", "un");

        when(entityManager.find(Language.class, languageId))
            .thenReturn(language);

        // Act
        Language result = languageDao.getLanguageById(languageId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getLanguageId()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should return language with negative ID")
    void getLanguageByIdHandlesNegativeId() {
        // Arrange
        Integer languageId = -1;

        when(entityManager.find(Language.class, languageId))
            .thenReturn(null);

        // Act
        Language result = languageDao.getLanguageById(languageId);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should call named query method correctly")
    void getLanguagesCallsExecuteNamedQuery() {
        // Arrange
        List<Language> languages = createLanguageList(2);

        when(entityManager.createNamedQuery("allLanguages", Language.class))
            .thenReturn(languageTypedQuery);
        when(languageTypedQuery.getResultList())
            .thenReturn(languages);

        // Act
        languageDao.getLanguages();

        // Assert
        verify(languageTypedQuery).getResultList();
    }

    @Test
    @DisplayName("Should return default language with correct flag")
    void getDefaultLanguageReturnsCorrectFlag() {
        // Arrange
        Language defaultLanguage = createLanguage(1, "Arabic", "ar");
        defaultLanguage.setDefaultFlag("Y");
        defaultLanguage.setDeleteFlag(false);

        when(entityManager.createQuery(anyString(), eq(Language.class)))
            .thenReturn(languageTypedQuery);
        when(languageTypedQuery.getSingleResult())
            .thenReturn(defaultLanguage);

        // Act
        Language result = languageDao.getDefaultLanguage();

        // Assert
        assertThat(result.getDefaultFlag()).isEqualTo("Y");
        assertThat(result.getDeleteFlag()).isFalse();
    }

    @Test
    @DisplayName("Should verify getSingleResult is called for default language")
    void getDefaultLanguageCallsGetSingleResult() {
        // Arrange
        Language defaultLanguage = createLanguage(1, "English", "en");

        when(entityManager.createQuery(anyString(), eq(Language.class)))
            .thenReturn(languageTypedQuery);
        when(languageTypedQuery.getSingleResult())
            .thenReturn(defaultLanguage);

        // Act
        languageDao.getDefaultLanguage();

        // Assert
        verify(languageTypedQuery).getSingleResult();
    }

    @Test
    @DisplayName("Should return languages in correct order")
    void getLanguagesReturnsInCorrectOrder() {
        // Arrange
        Language lang1 = createLanguage(1, "English", "en");
        Language lang2 = createLanguage(2, "Arabic", "ar");
        Language lang3 = createLanguage(3, "French", "fr");
        List<Language> languages = Arrays.asList(lang1, lang2, lang3);

        when(entityManager.createNamedQuery("allLanguages", Language.class))
            .thenReturn(languageTypedQuery);
        when(languageTypedQuery.getResultList())
            .thenReturn(languages);

        // Act
        List<Language> result = languageDao.getLanguages();

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getLanguageId()).isEqualTo(1);
        assertThat(result.get(1).getLanguageId()).isEqualTo(2);
        assertThat(result.get(2).getLanguageId()).isEqualTo(3);
    }

    @Test
    @DisplayName("Should handle multiple languages with same properties")
    void getLanguagesHandlesDuplicateProperties() {
        // Arrange
        Language lang1 = createLanguage(1, "English", "en");
        Language lang2 = createLanguage(2, "English", "en");
        List<Language> languages = Arrays.asList(lang1, lang2);

        when(entityManager.createNamedQuery("allLanguages", Language.class))
            .thenReturn(languageTypedQuery);
        when(languageTypedQuery.getResultList())
            .thenReturn(languages);

        // Act
        List<Language> result = languageDao.getLanguages();

        // Assert
        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Should return language by maximum integer ID")
    void getLanguageByIdHandlesMaxIntegerId() {
        // Arrange
        Integer languageId = Integer.MAX_VALUE;
        Language language = createLanguage(languageId, "Test", "tt");

        when(entityManager.find(Language.class, languageId))
            .thenReturn(language);

        // Act
        Language result = languageDao.getLanguageById(languageId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getLanguageId()).isEqualTo(Integer.MAX_VALUE);
    }

    @Test
    @DisplayName("Should call entity manager exactly once for language by ID")
    void getLanguageByIdCallsEntityManagerOnce() {
        // Arrange
        Integer languageId = 3;

        when(entityManager.find(Language.class, languageId))
            .thenReturn(createLanguage(languageId, "German", "de"));

        // Act
        languageDao.getLanguageById(languageId);

        // Assert
        verify(entityManager, times(1)).find(Language.class, languageId);
    }

    @Test
    @DisplayName("Should call entity manager exactly once for all languages")
    void getLanguagesCallsEntityManagerOnce() {
        // Arrange
        when(entityManager.createNamedQuery("allLanguages", Language.class))
            .thenReturn(languageTypedQuery);
        when(languageTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        languageDao.getLanguages();

        // Assert
        verify(entityManager, times(1)).createNamedQuery("allLanguages", Language.class);
    }

    @Test
    @DisplayName("Should call entity manager exactly once for default language")
    void getDefaultLanguageCallsEntityManagerOnce() {
        // Arrange
        Language defaultLanguage = createLanguage(1, "English", "en");

        when(entityManager.createQuery(anyString(), eq(Language.class)))
            .thenReturn(languageTypedQuery);
        when(languageTypedQuery.getSingleResult())
            .thenReturn(defaultLanguage);

        // Act
        languageDao.getDefaultLanguage();

        // Assert
        verify(entityManager, times(1)).createQuery(anyString(), eq(Language.class));
    }

    private List<Language> createLanguageList(int count) {
        List<Language> languages = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            languages.add(createLanguage(i + 1, "Language " + (i + 1), "l" + (i + 1)));
        }
        return languages;
    }

    private Language createLanguage(Integer id, String name, String code) {
        Language language = new Language();
        language.setLanguageId(id);
        language.setLanguageName(name);
        language.setLanguageCode(code);
        language.setDefaultFlag("N");
        language.setDeleteFlag(false);
        return language;
    }
}
