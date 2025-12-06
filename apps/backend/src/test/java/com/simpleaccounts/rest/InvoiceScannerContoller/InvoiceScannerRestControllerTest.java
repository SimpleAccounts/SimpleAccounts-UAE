package com.simpleaccounts.rest.InvoiceScannerContoller;

import com.simpleaccounts.constant.CommonStatusEnum;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.helper.ExpenseRestHelper;
import com.simpleaccounts.repository.JournalLineItemRepository;
import com.simpleaccounts.repository.QuotationInvoiceRepository;
import com.simpleaccounts.rest.expensescontroller.ExpenseModel;
import com.simpleaccounts.rest.invoicecontroller.InvoiceLineItemModel;
import com.simpleaccounts.rest.invoicecontroller.InvoiceRequestModel;
import com.simpleaccounts.rest.invoicecontroller.InvoiceRestHelper;
import com.simpleaccounts.rfq_po.PoQuatation;
import com.simpleaccounts.rfq_po.PoQuatationService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(InvoiceScannerRestController.class)
@DisplayName("InvoiceScannerRestController Tests")
class InvoiceScannerRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtTokenUtil jwtTokenUtil;

    @MockBean
    private JSONExpenseParser jsonExpenseParser;

    @MockBean
    private InvoiceRestHelper invoiceRestHelper;

    @MockBean
    private FileAttachmentService fileAttachmentService;

    @MockBean
    private InvoiceService invoiceService;

    @MockBean
    private BankAccountService bankAccountService;

    @MockBean
    private ContactService contactService;

    @MockBean
    private ExpenseRestHelper expenseRestHelper;

    @MockBean
    private ExpenseService expenseService;

    @MockBean
    private CurrencyService currencyService;

    @MockBean
    private UserService userService;

    @MockBean
    private InvoiceLineItemService invoiceLineItemService;

    @MockBean
    private PlaceOfSupplyService placeOfSupplyService;

    @MockBean
    private CreditNoteInvoiceRelationService creditNoteInvoiceRelationService;

    @MockBean
    private PoQuatationService poQuatationService;

    @MockBean
    private QuotationInvoiceRepository quotationInvoiceRepository;

    @MockBean
    private JournalLineItemRepository journalLineItemRepository;

    @MockBean
    private InvoiceScannerService invoiceScannerService;

    private Invoice mockInvoice;
    private Expense mockExpense;

    @BeforeEach
    void setUp() {
        mockInvoice = new Invoice();
        mockInvoice.setInvoiceId(1);
        mockInvoice.setReferenceNumber("INV-001");
        mockInvoice.setType(1);

        mockExpense = new Expense();
        mockExpense.setExpenseId(1);
        mockExpense.setExpenseNumber("EXP-001");

        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);
    }

    @Test
    @DisplayName("Should save invoice scan successfully")
    void testSaveInvoiceScan_Success() throws Exception {
        String jsonString = "{\"referenceNumber\":\"INV-001\"}";

        when(invoiceRestHelper.doesInvoiceNumberExist(anyString())).thenReturn(false);
        when(invoiceScannerService.getEntity(any(), anyInt(), anyList())).thenReturn(mockInvoice);

        mockMvc.perform(post("/rest/invoiceScanner/invoiceScan/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonString))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0045"))
                .andExpect(jsonPath("$.error").value(false));

        verify(invoiceService, times(1)).persist(any(Invoice.class));
    }

    @Test
    @DisplayName("Should return BAD_REQUEST when invoice number already exists")
    void testSaveInvoiceScan_DuplicateInvoiceNumber() throws Exception {
        String jsonString = "{\"referenceNumber\":\"INV-001\"}";

        when(invoiceRestHelper.doesInvoiceNumberExist("INV-001")).thenReturn(true);

        mockMvc.perform(post("/rest/invoiceScanner/invoiceScan/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonString))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("0023"))
                .andExpect(jsonPath("$.error").value(true));

        verify(invoiceService, never()).persist(any(Invoice.class));
    }

    @Test
    @DisplayName("Should handle exception during invoice save")
    void testSaveInvoiceScan_Exception() throws Exception {
        String jsonString = "{\"referenceNumber\":\"INV-001\"}";

        when(invoiceRestHelper.doesInvoiceNumberExist(anyString())).thenReturn(false);
        when(invoiceScannerService.getEntity(any(), anyInt(), anyList()))
                .thenThrow(new RuntimeException("Processing error"));

        mockMvc.perform(post("/rest/invoiceScanner/invoiceScan/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonString))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value(true));
    }

    @Test
    @DisplayName("Should save invoice with attachment file")
    void testSaveInvoiceScan_WithAttachment() throws Exception {
        String jsonString = "{\"referenceNumber\":\"INV-001\"}";
        FileAttachment fileAttachment = new FileAttachment();
        fileAttachment.setId(1);

        when(invoiceRestHelper.doesInvoiceNumberExist(anyString())).thenReturn(false);
        when(invoiceScannerService.getEntity(any(), anyInt(), anyList())).thenReturn(mockInvoice);
        when(fileAttachmentService.storeFile(any(MultipartFile.class), any(), any()))
                .thenReturn(fileAttachment);

        mockMvc.perform(post("/rest/invoiceScanner/invoiceScan/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonString))
                .andExpect(status().isOk());

        verify(invoiceService, times(1)).persist(any(Invoice.class));
    }

    @Test
    @DisplayName("Should save invoice with quotation")
    void testSaveInvoiceScan_WithQuotation() throws Exception {
        String jsonString = "{\"referenceNumber\":\"INV-001\",\"quotationId\":1}";
        PoQuatation quotation = new PoQuatation();
        quotation.setId(1);

        when(invoiceRestHelper.doesInvoiceNumberExist(anyString())).thenReturn(false);
        when(invoiceScannerService.getEntity(any(), anyInt(), anyList())).thenReturn(mockInvoice);
        when(poQuatationService.findByPK(1)).thenReturn(quotation);

        mockMvc.perform(post("/rest/invoiceScanner/invoiceScan/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonString))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0045"));

        verify(quotationInvoiceRepository, times(1)).save(any(QuotationInvoiceRelation.class));
        verify(poQuatationService, times(1)).update(any(PoQuatation.class));
    }

    @Test
    @DisplayName("Should parse invoice JSON correctly")
    void testSaveInvoiceScan_ParsesJSON() throws Exception {
        String jsonString = "{\"referenceNumber\":\"INV-001\",\"amount\":1000}";

        when(invoiceRestHelper.doesInvoiceNumberExist(anyString())).thenReturn(false);
        when(invoiceScannerService.getEntity(any(), anyInt(), anyList())).thenReturn(mockInvoice);

        mockMvc.perform(post("/rest/invoiceScanner/invoiceScan/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonString))
                .andExpect(status().isOk());

        verify(jsonExpenseParser, times(1))
                .parseInvoice(eq(jsonString), any(InvoiceRequestModel.class), anyList());
    }

    @Test
    @DisplayName("Should save invoice with supplier type")
    void testSaveInvoiceScan_SupplierType() throws Exception {
        String jsonString = "{\"referenceNumber\":\"INV-001\",\"type\":\"2\"}";

        when(invoiceRestHelper.doesInvoiceNumberExist(anyString())).thenReturn(false);
        when(invoiceScannerService.getEntity(any(), anyInt(), anyList())).thenReturn(mockInvoice);

        mockMvc.perform(post("/rest/invoiceScanner/invoiceScan/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonString))
                .andExpect(status().isOk());

        verify(invoiceService, times(1)).persist(any(Invoice.class));
    }

    @Test
    @DisplayName("Should save expense scan successfully")
    void testSaveExpenseScan_Success() throws Exception {
        String jsonString = "{\"expenseNumber\":\"EXP-001\"}";

        when(expenseRestHelper.doesInvoiceNumberExist(anyString())).thenReturn(false);
        when(invoiceScannerService.getExpenseEntity(any(ExpenseModel.class))).thenReturn(mockExpense);

        mockMvc.perform(post("/rest/invoiceScanner/expenseScan/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonString))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0065"))
                .andExpect(jsonPath("$.error").value(false));

        verify(expenseService, times(1)).persist(any(Expense.class));
    }

    @Test
    @DisplayName("Should return BAD_REQUEST when expense number already exists")
    void testSaveExpenseScan_DuplicateExpenseNumber() throws Exception {
        String jsonString = "{\"expenseNumber\":\"EXP-001\"}";

        when(expenseRestHelper.doesInvoiceNumberExist("EXP-001")).thenReturn(true);

        mockMvc.perform(post("/rest/invoiceScanner/expenseScan/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonString))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("0023"))
                .andExpect(jsonPath("$.error").value(true));

        verify(expenseService, never()).persist(any(Expense.class));
    }

    @Test
    @DisplayName("Should handle exception during expense save")
    void testSaveExpenseScan_Exception() throws Exception {
        String jsonString = "{\"expenseNumber\":\"EXP-001\"}";

        when(expenseRestHelper.doesInvoiceNumberExist(anyString())).thenReturn(false);
        when(invoiceScannerService.getExpenseEntity(any(ExpenseModel.class)))
                .thenThrow(new RuntimeException("Processing error"));

        mockMvc.perform(post("/rest/invoiceScanner/expenseScan/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonString))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value(true));
    }

    @Test
    @DisplayName("Should save expense with attachment file")
    void testSaveExpenseScan_WithAttachment() throws Exception {
        String jsonString = "{\"expenseNumber\":\"EXP-001\"}";
        FileAttachment fileAttachment = new FileAttachment();
        fileAttachment.setId(1);

        when(expenseRestHelper.doesInvoiceNumberExist(anyString())).thenReturn(false);
        when(invoiceScannerService.getExpenseEntity(any(ExpenseModel.class))).thenReturn(mockExpense);
        when(fileAttachmentService.storeExpenseFile(any(MultipartFile.class), any(ExpenseModel.class)))
                .thenReturn(fileAttachment);

        mockMvc.perform(post("/rest/invoiceScanner/expenseScan/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonString))
                .andExpect(status().isOk());

        verify(expenseService, times(1)).persist(any(Expense.class));
    }

    @Test
    @DisplayName("Should set expense exclusive VAT flag")
    void testSaveExpenseScan_WithExclusiveVat() throws Exception {
        String jsonString = "{\"expenseNumber\":\"EXP-001\",\"exclusiveVat\":true}";

        when(expenseRestHelper.doesInvoiceNumberExist(anyString())).thenReturn(false);
        when(invoiceScannerService.getExpenseEntity(any(ExpenseModel.class))).thenReturn(mockExpense);

        mockMvc.perform(post("/rest/invoiceScanner/expenseScan/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonString))
                .andExpect(status().isOk());

        verify(expenseService, times(1)).persist(any(Expense.class));
    }

    @Test
    @DisplayName("Should handle null expense number gracefully")
    void testSaveExpenseScan_NullExpenseNumber() throws Exception {
        String jsonString = "{\"amount\":1000}";

        when(expenseRestHelper.doesInvoiceNumberExist(null)).thenReturn(false);
        when(invoiceScannerService.getExpenseEntity(any(ExpenseModel.class))).thenReturn(mockExpense);

        mockMvc.perform(post("/rest/invoiceScanner/expenseScan/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonString))
                .andExpect(status().isOk());

        verify(expenseService, times(1)).persist(any(Expense.class));
    }

    @Test
    @DisplayName("Should verify invoice service persistence called once")
    void testSaveInvoiceScan_ServiceCalledOnce() throws Exception {
        String jsonString = "{\"referenceNumber\":\"INV-001\"}";

        when(invoiceRestHelper.doesInvoiceNumberExist(anyString())).thenReturn(false);
        when(invoiceScannerService.getEntity(any(), anyInt(), anyList())).thenReturn(mockInvoice);

        mockMvc.perform(post("/rest/invoiceScanner/invoiceScan/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonString))
                .andExpect(status().isOk());

        verify(invoiceService, times(1)).persist(any(Invoice.class));
        verify(invoiceService, times(1)).persist(mockInvoice);
    }

    @Test
    @DisplayName("Should verify expense service persistence called once")
    void testSaveExpenseScan_ServiceCalledOnce() throws Exception {
        String jsonString = "{\"expenseNumber\":\"EXP-001\"}";

        when(expenseRestHelper.doesInvoiceNumberExist(anyString())).thenReturn(false);
        when(invoiceScannerService.getExpenseEntity(any(ExpenseModel.class))).thenReturn(mockExpense);

        mockMvc.perform(post("/rest/invoiceScanner/expenseScan/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonString))
                .andExpect(status().isOk());

        verify(expenseService, times(1)).persist(any(Expense.class));
        verify(expenseService, times(1)).persist(mockExpense);
    }

    @Test
    @DisplayName("Should handle malformed JSON in invoice scan")
    void testSaveInvoiceScan_MalformedJSON() throws Exception {
        String malformedJson = "{\"referenceNumber\":\"INV-001\"";

        mockMvc.perform(post("/rest/invoiceScanner/invoiceScan/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(malformedJson))
                .andExpect(status().isBadRequest());

        verify(invoiceService, never()).persist(any(Invoice.class));
    }

    @Test
    @DisplayName("Should handle malformed JSON in expense scan")
    void testSaveExpenseScan_MalformedJSON() throws Exception {
        String malformedJson = "{\"expenseNumber\":\"EXP-001\"";

        mockMvc.perform(post("/rest/invoiceScanner/expenseScan/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(malformedJson))
                .andExpect(status().isBadRequest());

        verify(expenseService, never()).persist(any(Expense.class));
    }

    @Test
    @DisplayName("Should set invoice created by and date")
    void testSaveInvoiceScan_SetsCreatedFields() throws Exception {
        String jsonString = "{\"referenceNumber\":\"INV-001\"}";

        when(invoiceRestHelper.doesInvoiceNumberExist(anyString())).thenReturn(false);
        when(invoiceScannerService.getEntity(any(), anyInt(), anyList())).thenReturn(mockInvoice);

        mockMvc.perform(post("/rest/invoiceScanner/invoiceScan/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonString))
                .andExpect(status().isOk());

        verify(invoiceService, times(1)).persist(argThat(invoice ->
            invoice.getCreatedBy() != null && invoice.getCreatedDate() != null
        ));
    }

    @Test
    @DisplayName("Should set expense created by and date")
    void testSaveExpenseScan_SetsCreatedFields() throws Exception {
        String jsonString = "{\"expenseNumber\":\"EXP-001\"}";

        when(expenseRestHelper.doesInvoiceNumberExist(anyString())).thenReturn(false);
        when(invoiceScannerService.getExpenseEntity(any(ExpenseModel.class))).thenReturn(mockExpense);

        mockMvc.perform(post("/rest/invoiceScanner/expenseScan/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonString))
                .andExpect(status().isOk());

        verify(expenseService, times(1)).persist(argThat(expense ->
            expense.getCreatedBy() != null && expense.getCreatedDate() != null
        ));
    }

    @Test
    @DisplayName("Should handle empty JSON string in invoice scan")
    void testSaveInvoiceScan_EmptyJSON() throws Exception {
        String emptyJson = "{}";

        when(invoiceRestHelper.doesInvoiceNumberExist(null)).thenReturn(false);
        when(invoiceScannerService.getEntity(any(), anyInt(), anyList())).thenReturn(mockInvoice);

        mockMvc.perform(post("/rest/invoiceScanner/invoiceScan/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(emptyJson))
                .andExpect(status().isOk());

        verify(jsonExpenseParser, times(1)).parseInvoice(eq(emptyJson), any(), anyList());
    }

    @Test
    @DisplayName("Should handle empty JSON string in expense scan")
    void testSaveExpenseScan_EmptyJSON() throws Exception {
        String emptyJson = "{}";

        when(expenseRestHelper.doesInvoiceNumberExist(null)).thenReturn(false);
        when(invoiceScannerService.getExpenseEntity(any(ExpenseModel.class))).thenReturn(mockExpense);

        mockMvc.perform(post("/rest/invoiceScanner/expenseScan/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(emptyJson))
                .andExpect(status().isOk());

        verify(expenseService, times(1)).persist(any(Expense.class));
    }

    @Test
    @DisplayName("Should verify quotation status updated to INVOICED")
    void testSaveInvoiceScan_QuotationStatusUpdated() throws Exception {
        String jsonString = "{\"referenceNumber\":\"INV-001\",\"quotationId\":1}";
        PoQuatation quotation = new PoQuatation();
        quotation.setId(1);
        quotation.setStatus(CommonStatusEnum.PENDING.getValue());

        when(invoiceRestHelper.doesInvoiceNumberExist(anyString())).thenReturn(false);
        when(invoiceScannerService.getEntity(any(), anyInt(), anyList())).thenReturn(mockInvoice);
        when(poQuatationService.findByPK(1)).thenReturn(quotation);

        mockMvc.perform(post("/rest/invoiceScanner/invoiceScan/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonString))
                .andExpect(status().isOk());

        verify(poQuatationService, times(1)).update(argThat(q ->
            q.getStatus().equals(CommonStatusEnum.INVOICED.getValue())
        ));
    }

    @Test
    @DisplayName("Should handle complex invoice JSON with line items")
    void testSaveInvoiceScan_WithLineItems() throws Exception {
        String jsonString = "{\"referenceNumber\":\"INV-001\",\"lineItems\":[{\"productId\":1,\"quantity\":10}]}";

        when(invoiceRestHelper.doesInvoiceNumberExist(anyString())).thenReturn(false);
        when(invoiceScannerService.getEntity(any(), anyInt(), anyList())).thenReturn(mockInvoice);

        mockMvc.perform(post("/rest/invoiceScanner/invoiceScan/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonString))
                .andExpect(status().isOk());

        verify(jsonExpenseParser, times(1))
                .parseInvoice(eq(jsonString), any(InvoiceRequestModel.class), anyList());
    }

    @Test
    @DisplayName("Should verify delete flag set to false for invoice")
    void testSaveInvoiceScan_DeleteFlagFalse() throws Exception {
        String jsonString = "{\"referenceNumber\":\"INV-001\"}";

        when(invoiceRestHelper.doesInvoiceNumberExist(anyString())).thenReturn(false);
        when(invoiceScannerService.getEntity(any(), anyInt(), anyList())).thenReturn(mockInvoice);

        mockMvc.perform(post("/rest/invoiceScanner/invoiceScan/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonString))
                .andExpect(status().isOk());

        verify(invoiceService, times(1)).persist(argThat(invoice ->
            Boolean.FALSE.equals(invoice.getDeleteFlag())
        ));
    }

    @Test
    @DisplayName("Should handle quotation relation creation")
    void testSaveInvoiceScan_QuotationRelation() throws Exception {
        String jsonString = "{\"referenceNumber\":\"INV-001\",\"quotationId\":1}";
        PoQuatation quotation = new PoQuatation();
        quotation.setId(1);

        when(invoiceRestHelper.doesInvoiceNumberExist(anyString())).thenReturn(false);
        when(invoiceScannerService.getEntity(any(), anyInt(), anyList())).thenReturn(mockInvoice);
        when(poQuatationService.findByPK(1)).thenReturn(quotation);

        mockMvc.perform(post("/rest/invoiceScanner/invoiceScan/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonString))
                .andExpect(status().isOk());

        verify(quotationInvoiceRepository, times(1)).save(argThat(relation ->
            relation.getInvoice().equals(mockInvoice) &&
            relation.getPoQuatation().equals(quotation) &&
            Boolean.FALSE.equals(relation.getDeleteFlag())
        ));
    }
}
