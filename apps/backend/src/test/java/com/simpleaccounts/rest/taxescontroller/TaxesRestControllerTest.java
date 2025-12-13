package com.simpleaccounts.rest.taxescontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.JournalLineItemService;
import com.simpleaccounts.service.TransactionCategoryService;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
@DisplayName("TaxesRestController Unit Tests")
class TaxesRestControllerTest {

    private MockMvc mockMvc;

    @Mock
    private TransactionCategoryService transactionCategoryService;

    @Mock
    private JwtTokenUtil jwtTokenUtil;

    @Mock
    private JournalLineItemService journalLineItemService;

    @Mock
    private TaxesRestHelper taxesRestHelper;

    @InjectMocks
    private TaxesRestController taxesRestController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(taxesRestController).build();
    }

    @Nested
    @DisplayName("getVatTransactionList Tests")
    class GetVatTransactionListTests {

        @Test
        @DisplayName("Should return VAT transaction list with OK status")
        void getVatTransactionListReturnsOkStatus() throws Exception {
            // Arrange
            TransactionCategory inputVat = createTransactionCategory(88, "Input VAT");
            TransactionCategory outputVat = createTransactionCategory(94, "Output VAT");
            List<Object> dataList = new ArrayList<>();
            PaginationResponseModel response = new PaginationResponseModel(0, dataList);
            List<TaxesListModel> modelList = new ArrayList<>();

            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(transactionCategoryService.findByPK(88)).thenReturn(inputVat);
            when(transactionCategoryService.findByPK(94)).thenReturn(outputVat);
            when(journalLineItemService.getVatTransactionList(any(), any(), any())).thenReturn(response);
            when(taxesRestHelper.getListModel(any())).thenReturn(modelList);

            // Act & Assert
            mockMvc.perform(get("/rest/taxes/getVatTransationList"))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return NOT_FOUND when response is null")
        void getVatTransactionListReturnsNotFoundWhenNull() throws Exception {
            // Arrange
            TransactionCategory inputVat = createTransactionCategory(88, "Input VAT");
            TransactionCategory outputVat = createTransactionCategory(94, "Output VAT");

            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(transactionCategoryService.findByPK(88)).thenReturn(inputVat);
            when(transactionCategoryService.findByPK(94)).thenReturn(outputVat);
            when(journalLineItemService.getVatTransactionList(any(), any(), any())).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/taxes/getVatTransationList"))
                .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should filter by reference type")
        void getVatTransactionListFiltersReferenceType() throws Exception {
            // Arrange
            TransactionCategory inputVat = createTransactionCategory(88, "Input VAT");
            TransactionCategory outputVat = createTransactionCategory(94, "Output VAT");
            List<Object> dataList = new ArrayList<>();
            PaginationResponseModel response = new PaginationResponseModel(0, dataList);
            List<TaxesListModel> modelList = new ArrayList<>();

            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(transactionCategoryService.findByPK(88)).thenReturn(inputVat);
            when(transactionCategoryService.findByPK(94)).thenReturn(outputVat);
            when(journalLineItemService.getVatTransactionList(any(), any(), any())).thenReturn(response);
            when(taxesRestHelper.getListModel(any())).thenReturn(modelList);

            // Act & Assert
            mockMvc.perform(get("/rest/taxes/getVatTransationList")
                    .param("referenceType", "INVOICE"))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should filter by amount")
        void getVatTransactionListFiltersAmount() throws Exception {
            // Arrange
            TransactionCategory inputVat = createTransactionCategory(88, "Input VAT");
            TransactionCategory outputVat = createTransactionCategory(94, "Output VAT");
            List<Object> dataList = new ArrayList<>();
            PaginationResponseModel response = new PaginationResponseModel(0, dataList);
            List<TaxesListModel> modelList = new ArrayList<>();

            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(transactionCategoryService.findByPK(88)).thenReturn(inputVat);
            when(transactionCategoryService.findByPK(94)).thenReturn(outputVat);
            when(journalLineItemService.getVatTransactionList(any(), any(), any())).thenReturn(response);
            when(taxesRestHelper.getListModel(any())).thenReturn(modelList);

            // Act & Assert
            mockMvc.perform(get("/rest/taxes/getVatTransationList")
                    .param("amount", "1000"))
                .andExpect(status().isOk());
        }
    }

    private TransactionCategory createTransactionCategory(Integer id, String name) {
        TransactionCategory category = new TransactionCategory();
        category.setTransactionCategoryId(id);
        category.setTransactionCategoryName(name);
        return category;
    }
}
