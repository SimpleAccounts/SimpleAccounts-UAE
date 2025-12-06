package com.simpleaccounts.rest.customizeinvoiceprefixsuffixccontroller;

import com.simpleaccounts.entity.CustomizeInvoiceTemplate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CustomizeInvoiceTemplateController.class)
@DisplayName("CustomizeInvoiceTemplateController Tests")
class CustomizeInvoiceTemplateControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CustomizeInvoiceTemplateService customizeInvoiceTemplateService;

    private CustomizeInvoiceTemplate customizeInvoiceTemplate;

    @BeforeEach
    void setUp() {
        customizeInvoiceTemplate = new CustomizeInvoiceTemplate();
        customizeInvoiceTemplate.setId(1);
        customizeInvoiceTemplate.setType(1);
        customizeInvoiceTemplate.setPrefix("INV-");
        customizeInvoiceTemplate.setSuffix("001");
    }

    @Test
    @DisplayName("Should get invoice prefix list successfully")
    void testGetListForInvoicePrefix_Success() throws Exception {
        when(customizeInvoiceTemplateService.getCustomizeInvoiceTemplate(1))
                .thenReturn(customizeInvoiceTemplate);

        mockMvc.perform(get("/rest/customizeinvoiceprefixsuffix/getListForInvoicePrefixAndSuffix")
                        .param("invoiceType", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.invoiceId").value(1))
                .andExpect(jsonPath("$.invoiceType").value(1))
                .andExpect(jsonPath("$.invoiceNo").value("INV-001"));

        verify(customizeInvoiceTemplateService, times(1)).getCustomizeInvoiceTemplate(1);
    }

    @Test
    @DisplayName("Should return 204 when invoice template not found")
    void testGetListForInvoicePrefix_NotFound() throws Exception {
        when(customizeInvoiceTemplateService.getCustomizeInvoiceTemplate(anyInt()))
                .thenReturn(null);

        mockMvc.perform(get("/rest/customizeinvoiceprefixsuffix/getListForInvoicePrefixAndSuffix")
                        .param("invoiceType", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(customizeInvoiceTemplateService, times(1)).getCustomizeInvoiceTemplate(1);
    }

    @Test
    @DisplayName("Should get invoice prefix list for different invoice types")
    void testGetListForInvoicePrefix_DifferentTypes() throws Exception {
        CustomizeInvoiceTemplate template2 = new CustomizeInvoiceTemplate();
        template2.setId(2);
        template2.setType(2);
        template2.setPrefix("QUOT-");
        template2.setSuffix("100");

        when(customizeInvoiceTemplateService.getCustomizeInvoiceTemplate(2))
                .thenReturn(template2);

        mockMvc.perform(get("/rest/customizeinvoiceprefixsuffix/getListForInvoicePrefixAndSuffix")
                        .param("invoiceType", "2")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.invoiceId").value(2))
                .andExpect(jsonPath("$.invoiceType").value(2))
                .andExpect(jsonPath("$.invoiceNo").value("QUOT-100"));

        verify(customizeInvoiceTemplateService, times(1)).getCustomizeInvoiceTemplate(2);
    }

    @Test
    @DisplayName("Should handle null prefix in invoice template")
    void testGetListForInvoicePrefix_NullPrefix() throws Exception {
        CustomizeInvoiceTemplate templateWithNullPrefix = new CustomizeInvoiceTemplate();
        templateWithNullPrefix.setId(1);
        templateWithNullPrefix.setType(1);
        templateWithNullPrefix.setPrefix(null);
        templateWithNullPrefix.setSuffix("001");

        when(customizeInvoiceTemplateService.getCustomizeInvoiceTemplate(1))
                .thenReturn(templateWithNullPrefix);

        mockMvc.perform(get("/rest/customizeinvoiceprefixsuffix/getListForInvoicePrefixAndSuffix")
                        .param("invoiceType", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(customizeInvoiceTemplateService, times(1)).getCustomizeInvoiceTemplate(1);
    }

    @Test
    @DisplayName("Should handle null suffix in invoice template")
    void testGetListForInvoicePrefix_NullSuffix() throws Exception {
        CustomizeInvoiceTemplate templateWithNullSuffix = new CustomizeInvoiceTemplate();
        templateWithNullSuffix.setId(1);
        templateWithNullSuffix.setType(1);
        templateWithNullSuffix.setPrefix("INV-");
        templateWithNullSuffix.setSuffix(null);

        when(customizeInvoiceTemplateService.getCustomizeInvoiceTemplate(1))
                .thenReturn(templateWithNullSuffix);

        mockMvc.perform(get("/rest/customizeinvoiceprefixsuffix/getListForInvoicePrefixAndSuffix")
                        .param("invoiceType", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(customizeInvoiceTemplateService, times(1)).getCustomizeInvoiceTemplate(1);
    }

    @Test
    @DisplayName("Should get next invoice number successfully")
    void testGetNextInvoiceNo_Success() throws Exception {
        when(customizeInvoiceTemplateService.getLastInvoice(1))
                .thenReturn("INV-002");

        mockMvc.perform(get("/rest/customizeinvoiceprefixsuffix/getNextInvoiceNo")
                        .param("invoiceType", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("INV-002"));

        verify(customizeInvoiceTemplateService, times(1)).getLastInvoice(1);
    }

    @Test
    @DisplayName("Should return 404 when next invoice number not found")
    void testGetNextInvoiceNo_NotFound() throws Exception {
        when(customizeInvoiceTemplateService.getLastInvoice(anyInt()))
                .thenReturn(null);

        mockMvc.perform(get("/rest/customizeinvoiceprefixsuffix/getNextInvoiceNo")
                        .param("invoiceType", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(customizeInvoiceTemplateService, times(1)).getLastInvoice(1);
    }

    @Test
    @DisplayName("Should get next invoice number for different invoice types")
    void testGetNextInvoiceNo_DifferentTypes() throws Exception {
        when(customizeInvoiceTemplateService.getLastInvoice(2))
                .thenReturn("QUOT-101");

        mockMvc.perform(get("/rest/customizeinvoiceprefixsuffix/getNextInvoiceNo")
                        .param("invoiceType", "2")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("QUOT-101"));

        verify(customizeInvoiceTemplateService, times(1)).getLastInvoice(2);
    }

    @Test
    @DisplayName("Should handle exception in getNextInvoiceNo")
    void testGetNextInvoiceNo_Exception() throws Exception {
        when(customizeInvoiceTemplateService.getLastInvoice(anyInt()))
                .thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(get("/rest/customizeinvoiceprefixsuffix/getNextInvoiceNo")
                        .param("invoiceType", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());

        verify(customizeInvoiceTemplateService, times(1)).getLastInvoice(1);
    }

    @Test
    @DisplayName("Should get next invoice number with numeric value")
    void testGetNextInvoiceNo_NumericValue() throws Exception {
        when(customizeInvoiceTemplateService.getLastInvoice(1))
                .thenReturn("INV-00123");

        mockMvc.perform(get("/rest/customizeinvoiceprefixsuffix/getNextInvoiceNo")
                        .param("invoiceType", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("INV-00123"));

        verify(customizeInvoiceTemplateService, times(1)).getLastInvoice(1);
    }

    @Test
    @DisplayName("Should handle invoice type with zero value")
    void testGetListForInvoicePrefix_ZeroType() throws Exception {
        CustomizeInvoiceTemplate template = new CustomizeInvoiceTemplate();
        template.setId(0);
        template.setType(0);
        template.setPrefix("DEF-");
        template.setSuffix("000");

        when(customizeInvoiceTemplateService.getCustomizeInvoiceTemplate(0))
                .thenReturn(template);

        mockMvc.perform(get("/rest/customizeinvoiceprefixsuffix/getListForInvoicePrefixAndSuffix")
                        .param("invoiceType", "0")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.invoiceId").value(0))
                .andExpect(jsonPath("$.invoiceType").value(0));

        verify(customizeInvoiceTemplateService, times(1)).getCustomizeInvoiceTemplate(0);
    }

    @Test
    @DisplayName("Should handle large invoice type values")
    void testGetListForInvoicePrefix_LargeType() throws Exception {
        CustomizeInvoiceTemplate template = new CustomizeInvoiceTemplate();
        template.setId(999);
        template.setType(999);
        template.setPrefix("LARGE-");
        template.setSuffix("999");

        when(customizeInvoiceTemplateService.getCustomizeInvoiceTemplate(999))
                .thenReturn(template);

        mockMvc.perform(get("/rest/customizeinvoiceprefixsuffix/getListForInvoicePrefixAndSuffix")
                        .param("invoiceType", "999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.invoiceId").value(999));

        verify(customizeInvoiceTemplateService, times(1)).getCustomizeInvoiceTemplate(999);
    }

    @Test
    @DisplayName("Should handle empty prefix and suffix")
    void testGetListForInvoicePrefix_EmptyPrefixAndSuffix() throws Exception {
        CustomizeInvoiceTemplate template = new CustomizeInvoiceTemplate();
        template.setId(1);
        template.setType(1);
        template.setPrefix("");
        template.setSuffix("");

        when(customizeInvoiceTemplateService.getCustomizeInvoiceTemplate(1))
                .thenReturn(template);

        mockMvc.perform(get("/rest/customizeinvoiceprefixsuffix/getListForInvoicePrefixAndSuffix")
                        .param("invoiceType", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.invoiceNo").value(""));

        verify(customizeInvoiceTemplateService, times(1)).getCustomizeInvoiceTemplate(1);
    }

    @Test
    @DisplayName("Should verify service is called once per request")
    void testGetListForInvoicePrefix_ServiceCalledOnce() throws Exception {
        when(customizeInvoiceTemplateService.getCustomizeInvoiceTemplate(1))
                .thenReturn(customizeInvoiceTemplate);

        mockMvc.perform(get("/rest/customizeinvoiceprefixsuffix/getListForInvoicePrefixAndSuffix")
                        .param("invoiceType", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(customizeInvoiceTemplateService, times(1)).getCustomizeInvoiceTemplate(1);
        verifyNoMoreInteractions(customizeInvoiceTemplateService);
    }

    @Test
    @DisplayName("Should handle special characters in prefix")
    void testGetListForInvoicePrefix_SpecialCharacters() throws Exception {
        CustomizeInvoiceTemplate template = new CustomizeInvoiceTemplate();
        template.setId(1);
        template.setType(1);
        template.setPrefix("INV-@#$-");
        template.setSuffix("001");

        when(customizeInvoiceTemplateService.getCustomizeInvoiceTemplate(1))
                .thenReturn(template);

        mockMvc.perform(get("/rest/customizeinvoiceprefixsuffix/getListForInvoicePrefixAndSuffix")
                        .param("invoiceType", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.invoiceNo").value("INV-@#$-001"));

        verify(customizeInvoiceTemplateService, times(1)).getCustomizeInvoiceTemplate(1);
    }

    @Test
    @DisplayName("Should get next invoice number with empty string")
    void testGetNextInvoiceNo_EmptyString() throws Exception {
        when(customizeInvoiceTemplateService.getLastInvoice(1))
                .thenReturn("");

        mockMvc.perform(get("/rest/customizeinvoiceprefixsuffix/getNextInvoiceNo")
                        .param("invoiceType", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string(""));

        verify(customizeInvoiceTemplateService, times(1)).getLastInvoice(1);
    }

    @Test
    @DisplayName("Should handle multiple calls to service")
    void testGetNextInvoiceNo_MultipleCalls() throws Exception {
        when(customizeInvoiceTemplateService.getLastInvoice(1))
                .thenReturn("INV-001")
                .thenReturn("INV-002");

        mockMvc.perform(get("/rest/customizeinvoiceprefixsuffix/getNextInvoiceNo")
                        .param("invoiceType", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("INV-001"));

        mockMvc.perform(get("/rest/customizeinvoiceprefixsuffix/getNextInvoiceNo")
                        .param("invoiceType", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("INV-002"));

        verify(customizeInvoiceTemplateService, times(2)).getLastInvoice(1);
    }

    @Test
    @DisplayName("Should handle negative invoice type")
    void testGetListForInvoicePrefix_NegativeType() throws Exception {
        when(customizeInvoiceTemplateService.getCustomizeInvoiceTemplate(-1))
                .thenReturn(null);

        mockMvc.perform(get("/rest/customizeinvoiceprefixsuffix/getListForInvoicePrefixAndSuffix")
                        .param("invoiceType", "-1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(customizeInvoiceTemplateService, times(1)).getCustomizeInvoiceTemplate(-1);
    }

    @Test
    @DisplayName("Should handle very long prefix and suffix")
    void testGetListForInvoicePrefix_LongPrefixAndSuffix() throws Exception {
        CustomizeInvoiceTemplate template = new CustomizeInvoiceTemplate();
        template.setId(1);
        template.setType(1);
        template.setPrefix("VERY-LONG-PREFIX-WITH-MANY-CHARACTERS-");
        template.setSuffix("-VERY-LONG-SUFFIX-WITH-MANY-CHARACTERS");

        when(customizeInvoiceTemplateService.getCustomizeInvoiceTemplate(1))
                .thenReturn(template);

        mockMvc.perform(get("/rest/customizeinvoiceprefixsuffix/getListForInvoicePrefixAndSuffix")
                        .param("invoiceType", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.invoiceNo").value("VERY-LONG-PREFIX-WITH-MANY-CHARACTERS--VERY-LONG-SUFFIX-WITH-MANY-CHARACTERS"));

        verify(customizeInvoiceTemplateService, times(1)).getCustomizeInvoiceTemplate(1);
    }

    @Test
    @DisplayName("Should verify correct content type in response")
    void testGetListForInvoicePrefix_ContentType() throws Exception {
        when(customizeInvoiceTemplateService.getCustomizeInvoiceTemplate(1))
                .thenReturn(customizeInvoiceTemplate);

        mockMvc.perform(get("/rest/customizeinvoiceprefixsuffix/getListForInvoicePrefixAndSuffix")
                        .param("invoiceType", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        verify(customizeInvoiceTemplateService, times(1)).getCustomizeInvoiceTemplate(1);
    }

    @Test
    @DisplayName("Should handle null invoice type parameter gracefully")
    void testGetNextInvoiceNo_NullParameter() throws Exception {
        mockMvc.perform(get("/rest/customizeinvoiceprefixsuffix/getNextInvoiceNo")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should get next invoice number with whitespace")
    void testGetNextInvoiceNo_WithWhitespace() throws Exception {
        when(customizeInvoiceTemplateService.getLastInvoice(1))
                .thenReturn("INV - 001");

        mockMvc.perform(get("/rest/customizeinvoiceprefixsuffix/getNextInvoiceNo")
                        .param("invoiceType", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("INV - 001"));

        verify(customizeInvoiceTemplateService, times(1)).getLastInvoice(1);
    }
}
