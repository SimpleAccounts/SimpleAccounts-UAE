package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import com.simpleaccounts.dao.DocumentTemplateDao;
import com.simpleaccounts.entity.DocumentTemplate;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Unit tests for DocumentTemplateServiceImpl.
 */
@ExtendWith(MockitoExtension.class)
class DocumentTemplateServiceImplTest {

    @Mock
    private DocumentTemplateDao documentTemplateDao;

    @InjectMocks
    private DocumentTemplateServiceImpl documentTemplateService;

    private DocumentTemplate testTemplate;

    @BeforeEach
    void setUp() {
        testTemplate = new DocumentTemplate();
        testTemplate.setId(1);
        testTemplate.setName("Invoice Template");
        testTemplate.setType(1);
        testTemplate.setTemplate("<html><body>Invoice</body></html>".getBytes());
        testTemplate.setCreatedBy(1);
        testTemplate.setCreatedDate(LocalDateTime.now());
        testTemplate.setDeleteFlag(false);
    }

    // ========== getDocumentTemplateById Tests ==========

    @Test
    void shouldGetDocumentTemplateById() {
        when(documentTemplateDao.getDocumentTemplateById(1)).thenReturn(testTemplate);

        DocumentTemplate result = documentTemplateService.getDocumentTemplateById(1);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1);
        assertThat(result.getName()).isEqualTo("Invoice Template");
        verify(documentTemplateDao, times(1)).getDocumentTemplateById(1);
    }

    @Test
    void shouldReturnNullWhenTemplateNotFound() {
        when(documentTemplateDao.getDocumentTemplateById(999)).thenReturn(null);

        DocumentTemplate result = documentTemplateService.getDocumentTemplateById(999);

        assertThat(result).isNull();
        verify(documentTemplateDao, times(1)).getDocumentTemplateById(999);
    }

    @Test
    void shouldHandleNullId() {
        when(documentTemplateDao.getDocumentTemplateById(null)).thenReturn(null);

        DocumentTemplate result = documentTemplateService.getDocumentTemplateById(null);

        assertThat(result).isNull();
    }

    @Test
    void shouldHandleZeroId() {
        when(documentTemplateDao.getDocumentTemplateById(0)).thenReturn(null);

        DocumentTemplate result = documentTemplateService.getDocumentTemplateById(0);

        assertThat(result).isNull();
    }

    @Test
    void shouldHandleNegativeId() {
        when(documentTemplateDao.getDocumentTemplateById(-1)).thenReturn(null);

        DocumentTemplate result = documentTemplateService.getDocumentTemplateById(-1);

        assertThat(result).isNull();
    }

    // ========== Template Type Tests ==========

    @Test
    void shouldRetrieveInvoiceTemplate() {
        testTemplate.setType(1); // Invoice type
        when(documentTemplateDao.getDocumentTemplateById(1)).thenReturn(testTemplate);

        DocumentTemplate result = documentTemplateService.getDocumentTemplateById(1);

        assertThat(result.getType()).isEqualTo(1);
    }

    @Test
    void shouldRetrieveQuotationTemplate() {
        testTemplate.setType(2); // Quotation type
        when(documentTemplateDao.getDocumentTemplateById(2)).thenReturn(testTemplate);

        DocumentTemplate result = documentTemplateService.getDocumentTemplateById(2);

        assertThat(result.getType()).isEqualTo(2);
    }

    @Test
    void shouldRetrievePurchaseOrderTemplate() {
        testTemplate.setType(3); // Purchase Order type
        when(documentTemplateDao.getDocumentTemplateById(3)).thenReturn(testTemplate);

        DocumentTemplate result = documentTemplateService.getDocumentTemplateById(3);

        assertThat(result.getType()).isEqualTo(3);
    }

    // ========== Template Content Tests ==========

    @Test
    void shouldReturnTemplateWithContent() {
        when(documentTemplateDao.getDocumentTemplateById(1)).thenReturn(testTemplate);

        DocumentTemplate result = documentTemplateService.getDocumentTemplateById(1);

        assertThat(result.getTemplate()).isNotEmpty();
        assertThat(new String(result.getTemplate())).contains("Invoice");
    }

    @Test
    void shouldHandleTemplateWithHtmlContent() {
        testTemplate.setTemplate("<html><head><title>Invoice</title></head><body><h1>Invoice #1</h1></body></html>".getBytes());
        when(documentTemplateDao.getDocumentTemplateById(1)).thenReturn(testTemplate);

        DocumentTemplate result = documentTemplateService.getDocumentTemplateById(1);

        String content = new String(result.getTemplate());
        assertThat(content).contains("<html>");
        assertThat(content).contains("<body>");
    }

    @Test
    void shouldHandleLargeTemplate() {
        byte[] largeTemplate = new byte[100 * 1024]; // 100KB
        testTemplate.setTemplate(largeTemplate);
        when(documentTemplateDao.getDocumentTemplateById(1)).thenReturn(testTemplate);

        DocumentTemplate result = documentTemplateService.getDocumentTemplateById(1);

        assertThat(result.getTemplate()).hasSize(100 * 1024);
    }

    @Test
    void shouldHandleEmptyTemplate() {
        testTemplate.setTemplate(new byte[0]);
        when(documentTemplateDao.getDocumentTemplateById(1)).thenReturn(testTemplate);

        DocumentTemplate result = documentTemplateService.getDocumentTemplateById(1);

        assertThat(result.getTemplate()).isEmpty();
    }

    // ========== Template Name Tests ==========

    @Test
    void shouldReturnTemplateWithCorrectName() {
        when(documentTemplateDao.getDocumentTemplateById(1)).thenReturn(testTemplate);

        DocumentTemplate result = documentTemplateService.getDocumentTemplateById(1);

        assertThat(result.getName()).isEqualTo("Invoice Template");
    }

    @Test
    void shouldHandleTemplateWithSpecialCharactersInName() {
        testTemplate.setName("Invoice Template - 2024 (Arabic: فاتورة)");
        when(documentTemplateDao.getDocumentTemplateById(1)).thenReturn(testTemplate);

        DocumentTemplate result = documentTemplateService.getDocumentTemplateById(1);

        assertThat(result.getName()).contains("Arabic");
    }

    // ========== DAO Interaction Tests ==========

    @Test
    void shouldCallDaoExactlyOnce() {
        when(documentTemplateDao.getDocumentTemplateById(1)).thenReturn(testTemplate);

        documentTemplateService.getDocumentTemplateById(1);

        verify(documentTemplateDao, times(1)).getDocumentTemplateById(1);
    }

    @Test
    void shouldCallDaoWithCorrectId() {
        when(documentTemplateDao.getDocumentTemplateById(42)).thenReturn(testTemplate);

        documentTemplateService.getDocumentTemplateById(42);

        verify(documentTemplateDao).getDocumentTemplateById(42);
    }

    // ========== Entity Tests ==========

    @Test
    void shouldConstructorWithIdWork() {
        DocumentTemplate template = new DocumentTemplate(100);
        assertThat(template.getId()).isEqualTo(100);
    }

    @Test
    void shouldConstructorWithAllParamsWork() {
        byte[] content = "test".getBytes();
        DocumentTemplate template = new DocumentTemplate(1, "Test", 2, content);

        assertThat(template.getId()).isEqualTo(1);
        assertThat(template.getName()).isEqualTo("Test");
        assertThat(template.getType()).isEqualTo(2);
        assertThat(template.getTemplate()).isEqualTo(content);
    }

    @Test
    void shouldEqualsWorkCorrectly() {
        DocumentTemplate template1 = new DocumentTemplate(1);
        DocumentTemplate template2 = new DocumentTemplate(1);
        DocumentTemplate template3 = new DocumentTemplate(2);

        assertThat(template1).isEqualTo(template2);
        assertThat(template1).isNotEqualTo(template3);
    }

    @Test
    void shouldHashCodeWorkCorrectly() {
        DocumentTemplate template1 = new DocumentTemplate(1);
        DocumentTemplate template2 = new DocumentTemplate(1);

        assertThat(template1.hashCode()).isEqualTo(template2.hashCode());
    }

    @Test
    void shouldToStringContainId() {
        DocumentTemplate template = new DocumentTemplate(123);

        assertThat(template.toString()).contains("123");
    }

    // ========== Default Values Tests ==========

    @Test
    void shouldHaveDefaultDeleteFlag() {
        DocumentTemplate newTemplate = new DocumentTemplate();
        assertThat(newTemplate.getDeleteFlag()).isFalse();
    }

    @Test
    void shouldHaveDefaultVersionNumber() {
        DocumentTemplate newTemplate = new DocumentTemplate();
        assertThat(newTemplate.getVersionNumber()).isEqualTo(1);
    }

    @Test
    void shouldHaveDefaultCreatedBy() {
        DocumentTemplate newTemplate = new DocumentTemplate();
        assertThat(newTemplate.getCreatedBy()).isEqualTo(0);
    }
}
