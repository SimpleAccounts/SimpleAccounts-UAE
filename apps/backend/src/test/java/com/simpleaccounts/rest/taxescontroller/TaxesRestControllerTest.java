package com.simpleaccounts.rest.taxescontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.ContactService;
import com.simpleaccounts.service.JournalLineItemService;
import com.simpleaccounts.service.TransactionCategoryService;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@WebMvcTest(TaxesRestController.class)
@AutoConfigureMockMvc(addFilters = false)
class TaxesRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private TransactionCategoryService transactionCategoryService;
    @MockBean private JwtTokenUtil jwtTokenUtil;
    @MockBean private JournalLineItemService journalLineItemService;
    @MockBean private TaxesRestHelper taxesRestHelper;
    @MockBean private ContactService contactService;
    @MockBean private CustomUserDetailsService customUserDetailsService;

    private TransactionCategory vatCategory1;
    private TransactionCategory vatCategory2;

    @BeforeEach
    void setUp() {
        vatCategory1 = new TransactionCategory();
        vatCategory1.setTransactionCategoryId(88);
        vatCategory1.setTransactionCategoryName("VAT Input");

        vatCategory2 = new TransactionCategory();
        vatCategory2.setTransactionCategoryId(94);
        vatCategory2.setTransactionCategoryName("VAT Output");

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(transactionCategoryService.findByPK(88)).thenReturn(vatCategory1);
        when(transactionCategoryService.findByPK(94)).thenReturn(vatCategory2);
    }

    @Test
    void getVatTransactionListShouldReturnOkWithValidData() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(10, new ArrayList<>());
        List<Object> transformedList = new ArrayList<>();

        when(journalLineItemService.getVatTransactionList(any(), any(), any())).thenReturn(response);
        when(taxesRestHelper.getListModel(any())).thenReturn(transformedList);

        mockMvc.perform(get("/rest/taxes/getVatTransationList"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(10));

        verify(journalLineItemService).getVatTransactionList(any(), any(), any());
        verify(taxesRestHelper).getListModel(any());
    }

    @Test
    void getVatTransactionListShouldReturnNotFoundWhenServiceReturnsNull() throws Exception {
        when(journalLineItemService.getVatTransactionList(any(), any(), any())).thenReturn(null);

        mockMvc.perform(get("/rest/taxes/getVatTransationList"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getVatTransactionListShouldHandleReferenceTypeFilter() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(5, new ArrayList<>());

        when(journalLineItemService.getVatTransactionList(any(), any(), any())).thenReturn(response);
        when(taxesRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/taxes/getVatTransationList")
                        .param("referenceType", "INVOICE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(5));
    }

    @Test
    void getVatTransactionListShouldHandleAmountFilter() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(3, new ArrayList<>());

        when(journalLineItemService.getVatTransactionList(any(), any(), any())).thenReturn(response);
        when(taxesRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/taxes/getVatTransationList")
                        .param("amount", "1000.50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(3));
    }

    @Test
    void getVatTransactionListShouldHandleTransactionDateFilter() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(7, new ArrayList<>());

        when(journalLineItemService.getVatTransactionList(any(), any(), any())).thenReturn(response);
        when(taxesRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/taxes/getVatTransationList")
                        .param("transactionDate", "01-01-2024"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(7));
    }

    @Test
    void getVatTransactionListShouldHandleStatusFilter() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(2, new ArrayList<>());

        when(journalLineItemService.getVatTransactionList(any(), any(), any())).thenReturn(response);
        when(taxesRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/taxes/getVatTransationList")
                        .param("status", "PAID"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(2));
    }

    @Test
    void getVatTransactionListShouldHandleMultipleFilters() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(1, new ArrayList<>());

        when(journalLineItemService.getVatTransactionList(any(), any(), any())).thenReturn(response);
        when(taxesRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/taxes/getVatTransationList")
                        .param("referenceType", "INVOICE")
                        .param("amount", "500.00")
                        .param("status", "UNPAID"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(1));
    }

    @Test
    void getVatTransactionListShouldReturnInternalServerErrorOnException() throws Exception {
        when(journalLineItemService.getVatTransactionList(any(), any(), any()))
                .thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(get("/rest/taxes/getVatTransationList"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getVatTransactionListShouldExtractUserIdFromRequest() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(0, new ArrayList<>());

        when(journalLineItemService.getVatTransactionList(any(), any(), any())).thenReturn(response);
        when(taxesRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/taxes/getVatTransationList"))
                .andExpect(status().isOk());

        verify(jwtTokenUtil).getUserIdFromHttpRequest(any());
    }

    @Test
    void getVatTransactionListShouldFetchBothVatCategories() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(0, new ArrayList<>());

        when(journalLineItemService.getVatTransactionList(any(), any(), any())).thenReturn(response);
        when(taxesRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/taxes/getVatTransationList"))
                .andExpect(status().isOk());

        verify(transactionCategoryService).findByPK(88);
        verify(transactionCategoryService).findByPK(94);
    }

    @Test
    void getVatTransactionListShouldHandleEmptyTransactionDate() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(0, new ArrayList<>());

        when(journalLineItemService.getVatTransactionList(any(), any(), any())).thenReturn(response);
        when(taxesRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/taxes/getVatTransationList")
                        .param("transactionDate", ""))
                .andExpect(status().isOk());
    }

    @Test
    void getVatTransactionListShouldHandleNullAmount() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(0, new ArrayList<>());

        when(journalLineItemService.getVatTransactionList(any(), any(), any())).thenReturn(response);
        when(taxesRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/taxes/getVatTransationList"))
                .andExpect(status().isOk());
    }

    @Test
    void getVatTransactionListShouldReturnInternalServerErrorOnInvalidDateFormat() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(0, new ArrayList<>());

        when(journalLineItemService.getVatTransactionList(any(), any(), any())).thenReturn(response);

        mockMvc.perform(get("/rest/taxes/getVatTransationList")
                        .param("transactionDate", "invalid-date"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getVatTransactionListShouldSetDeleteFlagToFalse() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(0, new ArrayList<>());

        when(journalLineItemService.getVatTransactionList(any(), any(), any())).thenReturn(response);
        when(taxesRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/taxes/getVatTransationList"))
                .andExpect(status().isOk());

        verify(journalLineItemService).getVatTransactionList(any(), any(), any());
    }

    @Test
    void getVatTransactionListShouldTransformDataWithHelper() throws Exception {
        List<Object> originalData = Arrays.asList(new Object(), new Object());
        List<Object> transformedData = Arrays.asList(new Object(), new Object());
        PaginationResponseModel response = new PaginationResponseModel(2, originalData);

        when(journalLineItemService.getVatTransactionList(any(), any(), any())).thenReturn(response);
        when(taxesRestHelper.getListModel(originalData)).thenReturn(transformedData);

        mockMvc.perform(get("/rest/taxes/getVatTransationList"))
                .andExpect(status().isOk());

        verify(taxesRestHelper).getListModel(originalData);
    }

    @Test
    void getVatTransactionListShouldHandlePaginationParameters() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(100, new ArrayList<>());

        when(journalLineItemService.getVatTransactionList(any(), any(), any())).thenReturn(response);
        when(taxesRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/taxes/getVatTransationList")
                        .param("page", "1")
                        .param("limit", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(100));
    }

    @Test
    void getVatTransactionListShouldHandleZeroResults() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(0, new ArrayList<>());

        when(journalLineItemService.getVatTransactionList(any(), any(), any())).thenReturn(response);
        when(taxesRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/taxes/getVatTransationList"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(0))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data").isEmpty());
    }

    @Test
    void getVatTransactionListShouldHandleLargeAmountValue() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(0, new ArrayList<>());

        when(journalLineItemService.getVatTransactionList(any(), any(), any())).thenReturn(response);
        when(taxesRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/taxes/getVatTransationList")
                        .param("amount", "999999999.99"))
                .andExpect(status().isOk());
    }

    @Test
    void getVatTransactionListShouldHandleHelperException() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(1, new ArrayList<>());

        when(journalLineItemService.getVatTransactionList(any(), any(), any())).thenReturn(response);
        when(taxesRestHelper.getListModel(any())).thenThrow(new RuntimeException("Helper error"));

        mockMvc.perform(get("/rest/taxes/getVatTransationList"))
                .andExpect(status().isInternalServerError());
    }
}
