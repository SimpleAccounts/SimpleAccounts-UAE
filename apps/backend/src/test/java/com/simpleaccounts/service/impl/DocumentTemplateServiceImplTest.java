package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.DocumentTemplateDao;
import com.simpleaccounts.entity.DocumentTemplate;
import com.simpleaccounts.exceptions.ServiceException;
import java.time.LocalDateTime;
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
class DocumentTemplateServiceImplTest {

    @Mock
    private DocumentTemplateDao documentTemplateDao;

    @InjectMocks
    private DocumentTemplateServiceImpl documentTemplateService;

    private DocumentTemplate testDocumentTemplate;

    @BeforeEach
    void setUp() {
        testDocumentTemplate = new DocumentTemplate();
        testDocumentTemplate.setDocumentTemplateId(1);
        testDocumentTemplate.setDocumentTemplateName("Invoice Template");
        testDocumentTemplate.setDocumentTemplateDescription("Default invoice template");
        testDocumentTemplate.setDocumentTemplateContent("<html><body>Invoice</body></html>");
        testDocumentTemplate.setCreatedBy(1);
        testDocumentTemplate.setCreatedDate(LocalDateTime.now());
        testDocumentTemplate.setDeleteFlag(false);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnDocumentTemplateDaoWhenGetDaoCalled() {
        assertThat(documentTemplateService.getDao()).isEqualTo(documentTemplateDao);
    }

    // ========== getDocumentTemplateById Tests ==========

    @Test
    void shouldReturnDocumentTemplateWhenValidIdProvided() {
        when(documentTemplateDao.getDocumentTemplateById(1)).thenReturn(testDocumentTemplate);

        DocumentTemplate result = documentTemplateService.getDocumentTemplateById(1);

        assertThat(result).isNotNull();
        assertThat(result.getDocumentTemplateId()).isEqualTo(1);
        assertThat(result.getDocumentTemplateName()).isEqualTo("Invoice Template");
        assertThat(result.getDocumentTemplateDescription()).isEqualTo("Default invoice template");
        verify(documentTemplateDao, times(1)).getDocumentTemplateById(1);
    }

    @Test
    void shouldReturnNullWhenDocumentTemplateNotFoundById() {
        when(documentTemplateDao.getDocumentTemplateById(999)).thenReturn(null);

        DocumentTemplate result = documentTemplateService.getDocumentTemplateById(999);

        assertThat(result).isNull();
        verify(documentTemplateDao, times(1)).getDocumentTemplateById(999);
    }

    @Test
    void shouldReturnDocumentTemplateWithNullFields() {
        DocumentTemplate template = new DocumentTemplate();
        template.setDocumentTemplateId(2);
        when(documentTemplateDao.getDocumentTemplateById(2)).thenReturn(template);

        DocumentTemplate result = documentTemplateService.getDocumentTemplateById(2);

        assertThat(result).isNotNull();
        assertThat(result.getDocumentTemplateId()).isEqualTo(2);
        assertThat(result.getDocumentTemplateName()).isNull();
        verify(documentTemplateDao, times(1)).getDocumentTemplateById(2);
    }

    @Test
    void shouldHandleMultipleCallsForSameId() {
        when(documentTemplateDao.getDocumentTemplateById(1)).thenReturn(testDocumentTemplate);

        DocumentTemplate result1 = documentTemplateService.getDocumentTemplateById(1);
        DocumentTemplate result2 = documentTemplateService.getDocumentTemplateById(1);

        assertThat(result1).isEqualTo(testDocumentTemplate);
        assertThat(result2).isEqualTo(testDocumentTemplate);
        verify(documentTemplateDao, times(2)).getDocumentTemplateById(1);
    }

    @Test
    void shouldReturnDocumentTemplateWithCompleteContent() {
        testDocumentTemplate.setDocumentTemplateContent("<html><head><style>body{}</style></head><body><h1>Invoice</h1></body></html>");
        when(documentTemplateDao.getDocumentTemplateById(1)).thenReturn(testDocumentTemplate);

        DocumentTemplate result = documentTemplateService.getDocumentTemplateById(1);

        assertThat(result).isNotNull();
        assertThat(result.getDocumentTemplateContent()).contains("<html>", "<body>", "Invoice");
        verify(documentTemplateDao, times(1)).getDocumentTemplateById(1);
    }

    // ========== findByPK Tests ==========

    @Test
    void shouldReturnDocumentTemplateWhenFoundByPK() {
        when(documentTemplateDao.findByPK(1)).thenReturn(testDocumentTemplate);

        DocumentTemplate result = documentTemplateService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getDocumentTemplateId()).isEqualTo(1);
        assertThat(result.getDocumentTemplateName()).isEqualTo("Invoice Template");
        verify(documentTemplateDao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenDocumentTemplateNotFoundByPK() {
        when(documentTemplateDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> documentTemplateService.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(documentTemplateDao, times(1)).findByPK(999);
    }

    @Test
    void shouldFindDocumentTemplateByDifferentIds() {
        DocumentTemplate template2 = new DocumentTemplate();
        template2.setDocumentTemplateId(2);
        template2.setDocumentTemplateName("Receipt Template");

        when(documentTemplateDao.findByPK(1)).thenReturn(testDocumentTemplate);
        when(documentTemplateDao.findByPK(2)).thenReturn(template2);

        DocumentTemplate result1 = documentTemplateService.findByPK(1);
        DocumentTemplate result2 = documentTemplateService.findByPK(2);

        assertThat(result1.getDocumentTemplateName()).isEqualTo("Invoice Template");
        assertThat(result2.getDocumentTemplateName()).isEqualTo("Receipt Template");
        verify(documentTemplateDao, times(1)).findByPK(1);
        verify(documentTemplateDao, times(1)).findByPK(2);
    }

    // ========== persist Tests ==========

    @Test
    void shouldPersistNewDocumentTemplate() {
        documentTemplateService.persist(testDocumentTemplate);

        verify(documentTemplateDao, times(1)).persist(testDocumentTemplate);
    }

    @Test
    void shouldPersistDocumentTemplateWithAllFields() {
        testDocumentTemplate.setDocumentTemplateHeader("Header Content");
        testDocumentTemplate.setDocumentTemplateFooter("Footer Content");

        documentTemplateService.persist(testDocumentTemplate);

        verify(documentTemplateDao, times(1)).persist(testDocumentTemplate);
    }

    @Test
    void shouldPersistMultipleDocumentTemplates() {
        DocumentTemplate template2 = new DocumentTemplate();
        template2.setDocumentTemplateId(2);

        documentTemplateService.persist(testDocumentTemplate);
        documentTemplateService.persist(template2);

        verify(documentTemplateDao, times(1)).persist(testDocumentTemplate);
        verify(documentTemplateDao, times(1)).persist(template2);
    }

    // ========== update Tests ==========

    @Test
    void shouldUpdateExistingDocumentTemplate() {
        when(documentTemplateDao.update(testDocumentTemplate)).thenReturn(testDocumentTemplate);

        DocumentTemplate result = documentTemplateService.update(testDocumentTemplate);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testDocumentTemplate);
        verify(documentTemplateDao, times(1)).update(testDocumentTemplate);
    }

    @Test
    void shouldUpdateDocumentTemplateAndReturnUpdatedEntity() {
        testDocumentTemplate.setDocumentTemplateName("Updated Template");
        when(documentTemplateDao.update(testDocumentTemplate)).thenReturn(testDocumentTemplate);

        DocumentTemplate result = documentTemplateService.update(testDocumentTemplate);

        assertThat(result).isNotNull();
        assertThat(result.getDocumentTemplateName()).isEqualTo("Updated Template");
        verify(documentTemplateDao, times(1)).update(testDocumentTemplate);
    }

    @Test
    void shouldUpdateDocumentTemplateContent() {
        String newContent = "<html><body><h1>Updated Invoice</h1></body></html>";
        testDocumentTemplate.setDocumentTemplateContent(newContent);
        when(documentTemplateDao.update(testDocumentTemplate)).thenReturn(testDocumentTemplate);

        DocumentTemplate result = documentTemplateService.update(testDocumentTemplate);

        assertThat(result).isNotNull();
        assertThat(result.getDocumentTemplateContent()).isEqualTo(newContent);
        verify(documentTemplateDao, times(1)).update(testDocumentTemplate);
    }

    // ========== delete Tests ==========

    @Test
    void shouldDeleteDocumentTemplate() {
        documentTemplateService.delete(testDocumentTemplate);

        verify(documentTemplateDao, times(1)).delete(testDocumentTemplate);
    }

    @Test
    void shouldDeleteMultipleDocumentTemplates() {
        DocumentTemplate template2 = new DocumentTemplate();
        template2.setDocumentTemplateId(2);

        documentTemplateService.delete(testDocumentTemplate);
        documentTemplateService.delete(template2);

        verify(documentTemplateDao, times(1)).delete(testDocumentTemplate);
        verify(documentTemplateDao, times(1)).delete(template2);
    }

    // ========== findByAttributes Tests ==========

    @Test
    void shouldReturnDocumentTemplatesWhenValidAttributesProvided() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("documentTemplateName", "Invoice Template");
        attributes.put("deleteFlag", false);

        List<DocumentTemplate> expectedList = Arrays.asList(testDocumentTemplate);
        when(documentTemplateDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<DocumentTemplate> result = documentTemplateService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testDocumentTemplate);
        verify(documentTemplateDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("documentTemplateName", "Non-existent Template");

        when(documentTemplateDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<DocumentTemplate> result = documentTemplateService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(documentTemplateDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnMultipleDocumentTemplatesWhenMultipleMatch() {
        DocumentTemplate template2 = new DocumentTemplate();
        template2.setDocumentTemplateId(2);
        template2.setDocumentTemplateName("Receipt Template");

        DocumentTemplate template3 = new DocumentTemplate();
        template3.setDocumentTemplateId(3);
        template3.setDocumentTemplateName("Quote Template");

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("deleteFlag", false);

        List<DocumentTemplate> expectedList = Arrays.asList(testDocumentTemplate, template2, template3);
        when(documentTemplateDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<DocumentTemplate> result = documentTemplateService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(testDocumentTemplate, template2, template3);
        verify(documentTemplateDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<DocumentTemplate> result = documentTemplateService.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(documentTemplateDao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<DocumentTemplate> result = documentTemplateService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(documentTemplateDao, never()).findByAttributes(any());
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleDocumentTemplateWithLongContent() {
        String longContent = new String(new char[10000]).replace('\0', 'x');
        testDocumentTemplate.setDocumentTemplateContent(longContent);
        when(documentTemplateDao.getDocumentTemplateById(1)).thenReturn(testDocumentTemplate);

        DocumentTemplate result = documentTemplateService.getDocumentTemplateById(1);

        assertThat(result).isNotNull();
        assertThat(result.getDocumentTemplateContent()).hasSize(10000);
        verify(documentTemplateDao, times(1)).getDocumentTemplateById(1);
    }

    @Test
    void shouldHandleDocumentTemplateWithSpecialCharacters() {
        testDocumentTemplate.setDocumentTemplateName("Template <>&\"'");
        testDocumentTemplate.setDocumentTemplateContent("<html>Special chars: <>&\"'</html>");
        when(documentTemplateDao.getDocumentTemplateById(1)).thenReturn(testDocumentTemplate);

        DocumentTemplate result = documentTemplateService.getDocumentTemplateById(1);

        assertThat(result).isNotNull();
        assertThat(result.getDocumentTemplateName()).contains("<", ">", "&", "\"", "'");
        verify(documentTemplateDao, times(1)).getDocumentTemplateById(1);
    }

    @Test
    void shouldHandleDocumentTemplateWithEmptyContent() {
        testDocumentTemplate.setDocumentTemplateContent("");
        when(documentTemplateDao.getDocumentTemplateById(1)).thenReturn(testDocumentTemplate);

        DocumentTemplate result = documentTemplateService.getDocumentTemplateById(1);

        assertThat(result).isNotNull();
        assertThat(result.getDocumentTemplateContent()).isEmpty();
        verify(documentTemplateDao, times(1)).getDocumentTemplateById(1);
    }

    @Test
    void shouldVerifyDaoInteractionForMultipleOperations() {
        when(documentTemplateDao.findByPK(1)).thenReturn(testDocumentTemplate);
        when(documentTemplateDao.update(testDocumentTemplate)).thenReturn(testDocumentTemplate);

        documentTemplateService.findByPK(1);
        documentTemplateService.update(testDocumentTemplate);
        documentTemplateService.persist(testDocumentTemplate);
        documentTemplateService.delete(testDocumentTemplate);

        verify(documentTemplateDao, times(1)).findByPK(1);
        verify(documentTemplateDao, times(1)).update(testDocumentTemplate);
        verify(documentTemplateDao, times(1)).persist(testDocumentTemplate);
        verify(documentTemplateDao, times(1)).delete(testDocumentTemplate);
    }
}
