package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.MailThemeTemplates;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("MailThemeTemplatesDaoImpl Unit Tests")
class MailThemeTemplatesDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private Query query;

    @Mock
    private TypedQuery<MailThemeTemplates> typedQuery;

    @InjectMocks
    private MailThemeTemplatesDaoImpl dao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(dao, "entityManager", entityManager);
        ReflectionTestUtils.setField(dao, "entityClass", MailThemeTemplates.class);
    }

    @Test
    @DisplayName("Should update mail theme by disabling all and enabling selected")
    void updateMailThemeDisablesAllAndEnablesSelected() {
        // Arrange
        Integer templateId = 5;
        String disableQuery = "UPDATE MailThemeTemplates m SET m.templateEnable=false WHERE m.templateEnable=true ";
        String enableQuery = "UPDATE MailThemeTemplates m SET m.templateEnable=true WHERE m.templateId = :templateId ";

        when(entityManager.createQuery(disableQuery)).thenReturn(query);
        when(entityManager.createQuery(enableQuery)).thenReturn(query);
        when(query.setParameter("templateId", templateId)).thenReturn(query);
        when(query.executeUpdate()).thenReturn(1);

        // Act
        dao.updateMailTheme(templateId);

        // Assert
        verify(entityManager).createQuery(disableQuery);
        verify(entityManager).createQuery(enableQuery);
        verify(query).setParameter("templateId", templateId);
        verify(query, times(2)).executeUpdate();
    }

    @Test
    @DisplayName("Should execute disable query before enable query")
    void updateMailThemeExecutesQueriesInOrder() {
        // Arrange
        Integer templateId = 1;
        Query disableQuery = org.mockito.Mockito.mock(Query.class);
        Query enableQuery = org.mockito.Mockito.mock(Query.class);

        when(entityManager.createQuery(anyString()))
            .thenReturn(disableQuery)
            .thenReturn(enableQuery);
        when(enableQuery.setParameter("templateId", templateId)).thenReturn(enableQuery);
        when(disableQuery.executeUpdate()).thenReturn(1);
        when(enableQuery.executeUpdate()).thenReturn(1);

        // Act
        dao.updateMailTheme(templateId);

        // Assert
        var inOrder = org.mockito.Mockito.inOrder(disableQuery, enableQuery);
        inOrder.verify(disableQuery).executeUpdate();
        inOrder.verify(enableQuery).setParameter("templateId", templateId);
        inOrder.verify(enableQuery).executeUpdate();
    }

    @Test
    @DisplayName("Should set template ID parameter correctly")
    void updateMailThemeSetsParameterCorrectly() {
        // Arrange
        Integer templateId = 42;

        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter("templateId", templateId)).thenReturn(query);
        when(query.executeUpdate()).thenReturn(1);

        // Act
        dao.updateMailTheme(templateId);

        // Assert
        verify(query).setParameter("templateId", templateId);
    }

    @Test
    @DisplayName("Should handle template ID of zero")
    void updateMailThemeWithZeroTemplateId() {
        // Arrange
        Integer templateId = 0;

        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter("templateId", templateId)).thenReturn(query);
        when(query.executeUpdate()).thenReturn(1);

        // Act
        dao.updateMailTheme(templateId);

        // Assert
        verify(query).setParameter("templateId", 0);
    }

    @Test
    @DisplayName("Should execute both update queries")
    void updateMailThemeExecutesBothQueries() {
        // Arrange
        Integer templateId = 1;

        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter(anyString(), any())).thenReturn(query);
        when(query.executeUpdate()).thenReturn(1);

        // Act
        dao.updateMailTheme(templateId);

        // Assert
        verify(query, times(2)).executeUpdate();
    }

    @Test
    @DisplayName("Should get mail theme template by module ID")
    void getMailThemeTemplateReturnsTemplate() {
        // Arrange
        Integer moduleId = 1;
        MailThemeTemplates template = createTemplate(1, moduleId, true);
        String expectedQuery = "SELECT m FROM MailThemeTemplates m WHERE m.moduleId=:moduleId and m.templateEnable=true";

        when(entityManager.createQuery(expectedQuery)).thenReturn(query);
        when(query.setParameter("moduleId", moduleId)).thenReturn(query);
        when(query.getSingleResult()).thenReturn(template);

        // Act
        MailThemeTemplates result = dao.getMailThemeTemplate(moduleId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTemplateId()).isEqualTo(1);
        assertThat(result.getModuleId()).isEqualTo(moduleId);
        assertThat(result.getTemplateEnable()).isTrue();
    }

    @Test
    @DisplayName("Should execute correct query for getting mail theme template")
    void getMailThemeTemplateExecutesCorrectQuery() {
        // Arrange
        Integer moduleId = 5;
        String expectedQuery = "SELECT m FROM MailThemeTemplates m WHERE m.moduleId=:moduleId and m.templateEnable=true";

        when(entityManager.createQuery(expectedQuery)).thenReturn(query);
        when(query.setParameter("moduleId", moduleId)).thenReturn(query);
        when(query.getSingleResult()).thenReturn(createTemplate(1, moduleId, true));

        // Act
        dao.getMailThemeTemplate(moduleId);

        // Assert
        verify(entityManager).createQuery(expectedQuery);
    }

    @Test
    @DisplayName("Should set module ID parameter correctly")
    void getMailThemeTemplateSetsParameterCorrectly() {
        // Arrange
        Integer moduleId = 10;

        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter("moduleId", moduleId)).thenReturn(query);
        when(query.getSingleResult()).thenReturn(createTemplate(1, moduleId, true));

        // Act
        dao.getMailThemeTemplate(moduleId);

        // Assert
        verify(query).setParameter("moduleId", moduleId);
    }

    @Test
    @DisplayName("Should return only enabled template for module")
    void getMailThemeTemplateReturnsOnlyEnabledTemplate() {
        // Arrange
        Integer moduleId = 1;
        MailThemeTemplates template = createTemplate(1, moduleId, true);

        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter("moduleId", moduleId)).thenReturn(query);
        when(query.getSingleResult()).thenReturn(template);

        // Act
        MailThemeTemplates result = dao.getMailThemeTemplate(moduleId);

        // Assert
        assertThat(result.getTemplateEnable()).isTrue();
    }

    @Test
    @DisplayName("Should handle different module IDs")
    void getMailThemeTemplateWithDifferentModuleIds() {
        // Arrange
        MailThemeTemplates template1 = createTemplate(1, 1, true);
        MailThemeTemplates template2 = createTemplate(2, 2, true);

        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter("moduleId", 1)).thenReturn(query);
        when(query.setParameter("moduleId", 2)).thenReturn(query);
        when(query.getSingleResult())
            .thenReturn(template1)
            .thenReturn(template2);

        // Act
        MailThemeTemplates result1 = dao.getMailThemeTemplate(1);
        MailThemeTemplates result2 = dao.getMailThemeTemplate(2);

        // Assert
        assertThat(result1.getModuleId()).isEqualTo(1);
        assertThat(result2.getModuleId()).isEqualTo(2);
    }

    @Test
    @DisplayName("Should find mail theme template by primary key")
    void findByPKReturnsTemplate() {
        // Arrange
        Integer id = 1;
        MailThemeTemplates template = createTemplate(id, 1, true);

        when(entityManager.find(MailThemeTemplates.class, id))
            .thenReturn(template);

        // Act
        MailThemeTemplates result = dao.findByPK(id);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTemplateId()).isEqualTo(id);
    }

    @Test
    @DisplayName("Should return null when template not found by PK")
    void findByPKReturnsNullWhenNotFound() {
        // Arrange
        Integer id = 999;
        when(entityManager.find(MailThemeTemplates.class, id))
            .thenReturn(null);

        // Act
        MailThemeTemplates result = dao.findByPK(id);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should persist mail theme template successfully")
    void persistTemplateSuccessfully() {
        // Arrange
        MailThemeTemplates template = createTemplate(1, 1, true);

        // Act
        MailThemeTemplates result = dao.persist(template);

        // Assert
        verify(entityManager).persist(template);
        verify(entityManager).flush();
        verify(entityManager).refresh(template);
        assertThat(result).isEqualTo(template);
    }

    @Test
    @DisplayName("Should update mail theme template successfully")
    void updateTemplateSuccessfully() {
        // Arrange
        MailThemeTemplates template = createTemplate(1, 1, true);
        MailThemeTemplates merged = createTemplate(1, 1, true);

        when(entityManager.merge(template)).thenReturn(merged);

        // Act
        MailThemeTemplates result = dao.update(template);

        // Assert
        assertThat(result).isEqualTo(merged);
        verify(entityManager).merge(template);
    }

    @Test
    @DisplayName("Should delete managed mail theme template")
    void deleteTemplateWhenManaged() {
        // Arrange
        MailThemeTemplates template = createTemplate(1, 1, true);
        when(entityManager.contains(template)).thenReturn(true);

        // Act
        dao.delete(template);

        // Assert
        verify(entityManager).contains(template);
        verify(entityManager).remove(template);
        verify(entityManager, never()).merge(any());
    }

    @Test
    @DisplayName("Should merge then delete unmanaged template")
    void deleteTemplateWhenNotManaged() {
        // Arrange
        MailThemeTemplates template = createTemplate(1, 1, true);
        MailThemeTemplates merged = createTemplate(1, 1, true);

        when(entityManager.contains(template)).thenReturn(false);
        when(entityManager.merge(template)).thenReturn(merged);

        // Act
        dao.delete(template);

        // Assert
        verify(entityManager).contains(template);
        verify(entityManager).merge(template);
        verify(entityManager).remove(merged);
    }

    @Test
    @DisplayName("Should call getSingleResult for getting template")
    void getMailThemeTemplateCallsGetSingleResult() {
        // Arrange
        Integer moduleId = 1;

        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter("moduleId", moduleId)).thenReturn(query);
        when(query.getSingleResult()).thenReturn(createTemplate(1, moduleId, true));

        // Act
        dao.getMailThemeTemplate(moduleId);

        // Assert
        verify(query).getSingleResult();
    }

    @Test
    @DisplayName("Should handle multiple consecutive update operations")
    void updateMailThemeHandlesConsecutiveUpdates() {
        // Arrange
        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter(anyString(), any())).thenReturn(query);
        when(query.executeUpdate()).thenReturn(1);

        // Act
        dao.updateMailTheme(1);
        dao.updateMailTheme(2);
        dao.updateMailTheme(3);

        // Assert
        verify(query, times(6)).executeUpdate(); // 2 updates per call * 3 calls
    }

    @Test
    @DisplayName("Should return entity manager instance")
    void getEntityManagerReturnsInstance() {
        // Act
        EntityManager result = dao.getEntityManager();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isSameAs(entityManager);
    }

    @Test
    @DisplayName("Should correctly identify entity class")
    void entityClassIsCorrect() {
        // Arrange & Act
        Class<?> entityClass = (Class<?>) ReflectionTestUtils.getField(dao, "entityClass");

        // Assert
        assertThat(entityClass).isEqualTo(MailThemeTemplates.class);
    }

    @Test
    @DisplayName("Should handle null module ID")
    void getMailThemeTemplateWithNullModuleId() {
        // Arrange
        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter("moduleId", null)).thenReturn(query);
        when(query.getSingleResult()).thenReturn(createTemplate(1, null, true));

        // Act
        MailThemeTemplates result = dao.getMailThemeTemplate(null);

        // Assert
        assertThat(result).isNotNull();
    }

    private MailThemeTemplates createTemplate(Integer templateId, Integer moduleId, Boolean enabled) {
        MailThemeTemplates template = new MailThemeTemplates();
        template.setTemplateId(templateId);
        template.setModuleId(moduleId);
        template.setTemplateEnable(enabled);
        return template;
    }
}
