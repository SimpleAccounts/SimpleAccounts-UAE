package com.simpleaccounts.rest.invoicecontroller;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.simpleaccounts.entity.Invoice;
import com.simpleaccounts.helper.ExpenseRestHelper;
import com.simpleaccounts.repository.JournalLineItemRepository;
import com.simpleaccounts.repository.QuotationInvoiceRepository;
import com.simpleaccounts.rfq_po.PoQuatationService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.BankAccountService;
import com.simpleaccounts.service.ContactService;
import com.simpleaccounts.service.CreditNoteInvoiceRelationService;
import com.simpleaccounts.service.CurrencyService;
import com.simpleaccounts.service.ExpenseService;
import com.simpleaccounts.service.FileAttachmentService;
import com.simpleaccounts.service.InvoiceLineItemService;
import com.simpleaccounts.service.InvoiceService;
import com.simpleaccounts.service.PlaceOfSupplyService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.utils.ChartUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class InvoiceRestControllerTest {

    private MockMvc mockMvc;

    @Mock private JwtTokenUtil jwtTokenUtil;
    @Mock private InvoiceRestHelper invoiceRestHelper;
    @Mock private BankAccountService bankAccountService;
    @Mock private InvoiceService invoiceService;
    @Mock private ContactService contactService;
    @Mock private ChartUtil chartUtil;
    @Mock private ExpenseRestHelper expenseRestHelper;
    @Mock private ExpenseService expenseService;
    @Mock private CurrencyService currencyService;
    @Mock private UserService userService;
    @Mock private InvoiceLineItemService invoiceLineItemService;
    @Mock private PlaceOfSupplyService placeOfSupplyService;
    @Mock private FileAttachmentService fileAttachmentService;
    @Mock private CreditNoteInvoiceRelationService creditNoteInvoiceRelationService;
    @Mock private PoQuatationService poQuatationService;
    @Mock private QuotationInvoiceRepository quotationInvoiceRepository;
    @Mock private JournalLineItemRepository journalLineItemRepository;

    @InjectMocks
    private InvoiceRestController invoiceRestController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(invoiceRestController).build();
    }

    @Test
    void shouldGetInvoiceById() throws Exception {
        Integer invoiceId = 123;
        Invoice invoice = new Invoice();
        invoice.setId(invoiceId);
        
        InvoiceRequestModel requestModel = new InvoiceRequestModel();
        requestModel.setReferenceNumber("INV-123");

        when(invoiceService.findByPK(invoiceId)).thenReturn(invoice);
        when(invoiceRestHelper.getRequestModel(invoice)).thenReturn(requestModel);

        mockMvc.perform(get("/rest/invoice/getInvoiceById")
                .param("id", String.valueOf(invoiceId))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturnNotFoundWhenInvoiceByIdDoesNotExist() throws Exception {
        Integer invoiceId = 999;
        when(invoiceService.findByPK(invoiceId)).thenReturn(null);

        mockMvc.perform(get("/rest/invoice/getInvoiceById")
                .param("id", String.valueOf(invoiceId))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}
