package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.MailThemeTemplates;
import com.simpleaccounts.dao.MailThemeTemplatesDao;
import com.simpleaccounts.exceptions.ServiceException;
import java.time.LocalDateTime;
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
class MailThemeTemplatesServiceImplTest {

    @Mock
    private MailThemeTemplatesDao mailThemeTemplatesDao;

    @InjectMocks
    private MailThemeTemplatesServiceImpl mailThemeTemplatesService;

    private MailThemeTemplates testMailThemeTemplate;

    @BeforeEach
    void setUp() {
        testMailThemeTemplate = new MailThemeTemplates();
        testMailThemeTemplate.setId(1);
        testMailThemeTemplate.setTemplateId(101);
        testMailThemeTemplate.setModuleId(201);
        testMailThemeTemplate.setTemplateName("Invoice Template");
        testMailThemeTemplate.setTemplateContent("<html>Invoice Content</html>");
        testMailThemeTemplate.setCreatedBy(1);
        testMailThemeTemplate.setCreatedDate(LocalDateTime.now());
        testMailThemeTemplate.setDeleteFlag(false);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnMailThemeTemplatesDaoWhenGetDaoCalled() {
        assertThat(mailThemeTemplatesService.getDao()).isEqualTo(mailThemeTemplatesDao);
    }

    @Test
    void shouldReturnNonNullDao() {
        assertThat(mailThemeTemplatesService.getDao()).isNotNull();
    }

    // ========== updateMailTheme Tests ==========

    @Test
    void shouldUpdateMailThemeWhenValidTemplateIdProvided() {
        Integer templateId = 101;

        mailThemeTemplatesService.updateMailTheme(templateId);

        verify(mailThemeTemplatesDao, times(1)).updateMailTheme(templateId);
    }

    @Test
    void shouldUpdateMailThemeWithZeroTemplateId() {
        Integer templateId = 0;

        mailThemeTemplatesService.updateMailTheme(templateId);

        verify(mailThemeTemplatesDao, times(1)).updateMailTheme(templateId);
    }

    @Test
    void shouldUpdateMailThemeWithNegativeTemplateId() {
        Integer templateId = -1;

        mailThemeTemplatesService.updateMailTheme(templateId);

        verify(mailThemeTemplatesDao, times(1)).updateMailTheme(templateId);
    }

    @Test
    void shouldUpdateMailThemeWithLargeTemplateId() {
        Integer templateId = Integer.MAX_VALUE;

        mailThemeTemplatesService.updateMailTheme(templateId);

        ArgumentCaptor<Integer> captor = ArgumentCaptor.forClass(Integer.class);
        verify(mailThemeTemplatesDao, times(1)).updateMailTheme(captor.capture());
        assertThat(captor.getValue()).isEqualTo(Integer.MAX_VALUE);
    }

    @Test
    void shouldUpdateMailThemeWithNullTemplateId() {
        mailThemeTemplatesService.updateMailTheme(null);

        verify(mailThemeTemplatesDao, times(1)).updateMailTheme(null);
    }

    @Test
    void shouldHandleMultipleUpdateMailThemeCalls() {
        mailThemeTemplatesService.updateMailTheme(1);
        mailThemeTemplatesService.updateMailTheme(2);
        mailThemeTemplatesService.updateMailTheme(3);

        verify(mailThemeTemplatesDao, times(3)).updateMailTheme(anyInt());
    }

    // ========== getMailThemeTemplate Tests ==========

    @Test
    void shouldReturnMailThemeTemplateWhenValidModuleIdProvided() {
        Integer moduleId = 201;
        when(mailThemeTemplatesDao.getMailThemeTemplate(moduleId)).thenReturn(testMailThemeTemplate);

        MailThemeTemplates result = mailThemeTemplatesService.getMailThemeTemplate(moduleId);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testMailThemeTemplate);
        assertThat(result.getModuleId()).isEqualTo(201);
        assertThat(result.getTemplateName()).isEqualTo("Invoice Template");
        verify(mailThemeTemplatesDao, times(1)).getMailThemeTemplate(moduleId);
    }

    @Test
    void shouldReturnNullWhenNoTemplateFoundForModuleId() {
        Integer moduleId = 999;
        when(mailThemeTemplatesDao.getMailThemeTemplate(moduleId)).thenReturn(null);

        MailThemeTemplates result = mailThemeTemplatesService.getMailThemeTemplate(moduleId);

        assertThat(result).isNull();
        verify(mailThemeTemplatesDao, times(1)).getMailThemeTemplate(moduleId);
    }

    @Test
    void shouldGetMailThemeTemplateWithZeroModuleId() {
        Integer moduleId = 0;
        when(mailThemeTemplatesDao.getMailThemeTemplate(moduleId)).thenReturn(testMailThemeTemplate);

        MailThemeTemplates result = mailThemeTemplatesService.getMailThemeTemplate(moduleId);

        assertThat(result).isNotNull();
        verify(mailThemeTemplatesDao, times(1)).getMailThemeTemplate(moduleId);
    }

    @Test
    void shouldGetMailThemeTemplateWithNullModuleId() {
        when(mailThemeTemplatesDao.getMailThemeTemplate(null)).thenReturn(null);

        MailThemeTemplates result = mailThemeTemplatesService.getMailThemeTemplate(null);

        assertThat(result).isNull();
        verify(mailThemeTemplatesDao, times(1)).getMailThemeTemplate(null);
    }

    @Test
    void shouldHandleMultipleGetMailThemeTemplateCalls() {
        Integer moduleId = 201;
        when(mailThemeTemplatesDao.getMailThemeTemplate(moduleId)).thenReturn(testMailThemeTemplate);

        MailThemeTemplates result1 = mailThemeTemplatesService.getMailThemeTemplate(moduleId);
        MailThemeTemplates result2 = mailThemeTemplatesService.getMailThemeTemplate(moduleId);

        assertThat(result1).isEqualTo(result2);
        verify(mailThemeTemplatesDao, times(2)).getMailThemeTemplate(moduleId);
    }

    @Test
    void shouldReturnTemplateWithAllFieldsPopulated() {
        testMailThemeTemplate.setSubject("Invoice Subject");
        testMailThemeTemplate.setTemplateContent("<html><body>Full Content</body></html>");
        Integer moduleId = 201;

        when(mailThemeTemplatesDao.getMailThemeTemplate(moduleId)).thenReturn(testMailThemeTemplate);

        MailThemeTemplates result = mailThemeTemplatesService.getMailThemeTemplate(moduleId);

        assertThat(result).isNotNull();
        assertThat(result.getSubject()).isEqualTo("Invoice Subject");
        assertThat(result.getTemplateContent()).contains("<html>");
        verify(mailThemeTemplatesDao, times(1)).getMailThemeTemplate(moduleId);
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldFindMailThemeTemplateByPrimaryKey() {
        when(mailThemeTemplatesDao.findByPK(1)).thenReturn(testMailThemeTemplate);

        MailThemeTemplates result = mailThemeTemplatesService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testMailThemeTemplate);
        assertThat(result.getId()).isEqualTo(1);
        verify(mailThemeTemplatesDao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenMailThemeTemplateNotFoundByPK() {
        when(mailThemeTemplatesDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> mailThemeTemplatesService.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(mailThemeTemplatesDao, times(1)).findByPK(999);
    }

    @Test
    void shouldPersistNewMailThemeTemplate() {
        mailThemeTemplatesService.persist(testMailThemeTemplate);

        verify(mailThemeTemplatesDao, times(1)).persist(testMailThemeTemplate);
    }

    @Test
    void shouldUpdateExistingMailThemeTemplate() {
        when(mailThemeTemplatesDao.update(testMailThemeTemplate)).thenReturn(testMailThemeTemplate);

        MailThemeTemplates result = mailThemeTemplatesService.update(testMailThemeTemplate);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testMailThemeTemplate);
        verify(mailThemeTemplatesDao, times(1)).update(testMailThemeTemplate);
    }

    @Test
    void shouldUpdateMailThemeTemplateAndReturnUpdatedEntity() {
        testMailThemeTemplate.setTemplateName("Updated Template Name");
        when(mailThemeTemplatesDao.update(testMailThemeTemplate)).thenReturn(testMailThemeTemplate);

        MailThemeTemplates result = mailThemeTemplatesService.update(testMailThemeTemplate);

        assertThat(result).isNotNull();
        assertThat(result.getTemplateName()).isEqualTo("Updated Template Name");
        verify(mailThemeTemplatesDao, times(1)).update(testMailThemeTemplate);
    }

    @Test
    void shouldDeleteMailThemeTemplate() {
        mailThemeTemplatesService.delete(testMailThemeTemplate);

        verify(mailThemeTemplatesDao, times(1)).delete(testMailThemeTemplate);
    }

    @Test
    void shouldFindMailThemeTemplatesByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("moduleId", 201);
        attributes.put("deleteFlag", false);

        List<MailThemeTemplates> expectedList = Arrays.asList(testMailThemeTemplate);
        when(mailThemeTemplatesDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<MailThemeTemplates> result = mailThemeTemplatesService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testMailThemeTemplate);
        verify(mailThemeTemplatesDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("moduleId", 999);

        when(mailThemeTemplatesDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<MailThemeTemplates> result = mailThemeTemplatesService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(mailThemeTemplatesDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<MailThemeTemplates> result = mailThemeTemplatesService.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(mailThemeTemplatesDao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<MailThemeTemplates> result = mailThemeTemplatesService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(mailThemeTemplatesDao, never()).findByAttributes(any());
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleTemplateWithMinimalData() {
        MailThemeTemplates minimalTemplate = new MailThemeTemplates();
        minimalTemplate.setId(99);

        when(mailThemeTemplatesDao.findByPK(99)).thenReturn(minimalTemplate);

        MailThemeTemplates result = mailThemeTemplatesService.findByPK(99);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(99);
        assertThat(result.getTemplateName()).isNull();
        verify(mailThemeTemplatesDao, times(1)).findByPK(99);
    }

    @Test
    void shouldHandleMultipleTemplatesInFindByAttributes() {
        MailThemeTemplates template2 = new MailThemeTemplates();
        template2.setId(2);
        template2.setModuleId(201);

        MailThemeTemplates template3 = new MailThemeTemplates();
        template3.setId(3);
        template3.setModuleId(201);

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("moduleId", 201);

        List<MailThemeTemplates> expectedList = Arrays.asList(testMailThemeTemplate, template2, template3);
        when(mailThemeTemplatesDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<MailThemeTemplates> result = mailThemeTemplatesService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(testMailThemeTemplate, template2, template3);
        verify(mailThemeTemplatesDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldVerifyDaoInteractionForGetMailThemeTemplate() {
        Integer moduleId = 201;
        when(mailThemeTemplatesDao.getMailThemeTemplate(moduleId)).thenReturn(testMailThemeTemplate);

        mailThemeTemplatesService.getMailThemeTemplate(moduleId);
        mailThemeTemplatesService.getMailThemeTemplate(moduleId);
        mailThemeTemplatesService.getMailThemeTemplate(moduleId);

        verify(mailThemeTemplatesDao, times(3)).getMailThemeTemplate(moduleId);
    }

    @Test
    void shouldHandleTemplateWithLongContent() {
        String longContent = "<html>" + "a".repeat(10000) + "</html>";
        testMailThemeTemplate.setTemplateContent(longContent);

        when(mailThemeTemplatesDao.getMailThemeTemplate(201)).thenReturn(testMailThemeTemplate);

        MailThemeTemplates result = mailThemeTemplatesService.getMailThemeTemplate(201);

        assertThat(result).isNotNull();
        assertThat(result.getTemplateContent()).hasSize(longContent.length());
        verify(mailThemeTemplatesDao, times(1)).getMailThemeTemplate(201);
    }

    @Test
    void shouldHandleSequentialUpdateOperations() {
        testMailThemeTemplate.setTemplateName("Version 1");
        when(mailThemeTemplatesDao.update(any(MailThemeTemplates.class))).thenReturn(testMailThemeTemplate);

        mailThemeTemplatesService.update(testMailThemeTemplate);

        testMailThemeTemplate.setTemplateName("Version 2");
        mailThemeTemplatesService.update(testMailThemeTemplate);

        verify(mailThemeTemplatesDao, times(2)).update(testMailThemeTemplate);
    }

    @Test
    void shouldPersistAndFindMailThemeTemplate() {
        when(mailThemeTemplatesDao.findByPK(1)).thenReturn(testMailThemeTemplate);

        mailThemeTemplatesService.persist(testMailThemeTemplate);
        MailThemeTemplates found = mailThemeTemplatesService.findByPK(1);

        assertThat(found).isNotNull();
        assertThat(found).isEqualTo(testMailThemeTemplate);
        verify(mailThemeTemplatesDao, times(1)).persist(testMailThemeTemplate);
        verify(mailThemeTemplatesDao, times(1)).findByPK(1);
    }
}
