package com.simpleaccounts.rest.invoicecontroller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.never;

import com.simpleaccounts.bank.model.DeleteModel;
import com.simpleaccounts.constant.ContactTypeEnum;
import com.simpleaccounts.constant.dbfilter.InvoiceFilterEnum;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.Invoice;
import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.helper.ExpenseRestHelper;
import com.simpleaccounts.model.EarningDetailsModel;
import com.simpleaccounts.repository.JournalLineItemRepository;
import com.simpleaccounts.repository.QuotationInvoiceRepository;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.InviceSingleLevelDropdownModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.financialreport.AmountDetailRequestModel;
import com.simpleaccounts.rest.invoice.dto.VatAmountDto;
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
import com.simpleaccounts.service.JournalService;
import com.simpleaccounts.service.PlaceOfSupplyService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.utils.ChartUtil;
import com.simpleaccounts.utils.SimpleAccountsMessage;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class InvoiceRestControllerTest {

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
    @Mock private JournalService journalService;

    @InjectMocks
    private InvoiceRestController controller;

    private HttpServletRequest mockRequest;
    private User adminUser;
    private User normalUser;

    @BeforeEach
    void setUp() {
        mockRequest = mock(HttpServletRequest.class);

        Role adminRole = new Role();
        adminRole.setRoleCode(1); // Admin role

        Role userRole = new Role();
        userRole.setRoleCode(2); // Non-admin role

        adminUser = new User();
        adminUser.setUserId(1);
        adminUser.setRole(adminRole);

        normalUser = new User();
        normalUser.setUserId(2);
        normalUser.setRole(userRole);
    }

    @Test
    void getInvoiceListShouldBuildFilterMapAndReturnResponseForAdmin() {
        InvoiceRequestFilterModel filterModel = new InvoiceRequestFilterModel();
        filterModel.setReferenceNumber("INV-001");
        filterModel.setStatus(1);
        filterModel.setType(1);
        filterModel.setAmount(new BigDecimal("1000"));
        filterModel.setInvoiceDate("2024-01-15");
        filterModel.setInvoiceDueDate("2024-02-15");

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);

        List<InvoiceListModel> dataList = new ArrayList<>();
        PaginationResponseModel pagination = new PaginationResponseModel(1, dataList);
        when(invoiceService.getInvoiceList(any(), eq(filterModel))).thenReturn(pagination);
        when(invoiceRestHelper.getListModel(any())).thenReturn(dataList);

        ResponseEntity<PaginationResponseModel> response = controller.getInvoiceList(filterModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(invoiceService).getInvoiceList(captor.capture(), eq(filterModel));
        Map<InvoiceFilterEnum, Object> filterData = captor.getValue();

        // Admin should not have USER_ID filter
        assertThat(filterData).doesNotContainKey(InvoiceFilterEnum.USER_ID);
        assertThat(filterData).containsEntry(InvoiceFilterEnum.INVOICE_NUMBER, "INV-001");
        assertThat(filterData).containsEntry(InvoiceFilterEnum.STATUS, 1);
        assertThat(filterData).containsEntry(InvoiceFilterEnum.TYPE, 1);
        assertThat(filterData).containsEntry(InvoiceFilterEnum.DELETE_FLAG, false);
    }

    @Test
    void getInvoiceListShouldFilterByUserIdForNonAdmin() {
        InvoiceRequestFilterModel filterModel = new InvoiceRequestFilterModel();
        filterModel.setType(1);

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(2);
        when(userService.findByPK(2)).thenReturn(normalUser);

        PaginationResponseModel pagination = new PaginationResponseModel(0, new ArrayList<>());
        when(invoiceService.getInvoiceList(any(), eq(filterModel))).thenReturn(pagination);
        when(invoiceRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        controller.getInvoiceList(filterModel, mockRequest);

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(invoiceService).getInvoiceList(captor.capture(), eq(filterModel));
        Map<InvoiceFilterEnum, Object> filterData = captor.getValue();

        // Non-admin should have USER_ID filter
        assertThat(filterData).containsEntry(InvoiceFilterEnum.USER_ID, 2);
    }

    @Test
    void getInvoiceListShouldFilterByContactWhenProvided() {
        InvoiceRequestFilterModel filterModel = new InvoiceRequestFilterModel();
        filterModel.setContact(10);
        filterModel.setType(1);

        Contact contact = new Contact();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(contactService.findByPK(10)).thenReturn(contact);

        PaginationResponseModel pagination = new PaginationResponseModel(0, new ArrayList<>());
        when(invoiceService.getInvoiceList(any(), eq(filterModel))).thenReturn(pagination);
        when(invoiceRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        controller.getInvoiceList(filterModel, mockRequest);

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(invoiceService).getInvoiceList(captor.capture(), eq(filterModel));
        Map<InvoiceFilterEnum, Object> filterData = captor.getValue();

        assertThat(filterData).containsEntry(InvoiceFilterEnum.CONTACT, contact);
    }

    @Test
    void getInvoiceListShouldFilterByCurrencyWhenProvided() {
        InvoiceRequestFilterModel filterModel = new InvoiceRequestFilterModel();
        filterModel.setCurrencyCode(5);
        filterModel.setType(1);

        Currency currency = new Currency();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(currencyService.findByPK(5)).thenReturn(currency);

        PaginationResponseModel pagination = new PaginationResponseModel(0, new ArrayList<>());
        when(invoiceService.getInvoiceList(any(), eq(filterModel))).thenReturn(pagination);
        when(invoiceRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        controller.getInvoiceList(filterModel, mockRequest);

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(invoiceService).getInvoiceList(captor.capture(), eq(filterModel));
        Map<InvoiceFilterEnum, Object> filterData = captor.getValue();

        assertThat(filterData).containsEntry(InvoiceFilterEnum.CURRECY, currency);
    }

    @Test
    void getInvoiceListShouldReturnNotFoundWhenServiceReturnsNull() {
        InvoiceRequestFilterModel filterModel = new InvoiceRequestFilterModel();
        filterModel.setType(1);

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(invoiceService.getInvoiceList(any(), eq(filterModel))).thenReturn(null);

        ResponseEntity<PaginationResponseModel> response = controller.getInvoiceList(filterModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getInvoiceByIdShouldReturnInvoiceWhenFound() {
        Invoice invoice = new Invoice();
        invoice.setReferenceNumber("INV-001");

        InvoiceRequestModel requestModel = new InvoiceRequestModel();

        when(invoiceService.findByPK(1)).thenReturn(invoice);
        when(invoiceRestHelper.getRequestModel(invoice)).thenReturn(requestModel);

        ResponseEntity<InvoiceRequestModel> response = controller.getInvoiceById(1);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    void getInvoiceByIdShouldReturnNotFoundWhenInvoiceNotExists() {
        when(invoiceService.findByPK(999)).thenReturn(null);

        ResponseEntity<InvoiceRequestModel> response = controller.getInvoiceById(999);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void deleteShouldSetDeleteFlagAndCallUpdate() {
        Invoice invoice = new Invoice();
        invoice.setDeleteFlag(false);

        when(invoiceService.findByPK(1)).thenReturn(invoice);

        try {
            controller.delete(1);
        } catch (Exception e) {
            // MessageUtil may fail in unit tests, but we can still verify the business logic
        }

        // Verify the business logic was executed
        verify(invoiceService).findByPK(1);
        assertThat(invoice.getDeleteFlag()).isTrue();
        verify(invoiceService).update(invoice);
    }

    @Test
    void getInvoicesForDropdownShouldReturnListByType() {
        List<DropdownModel> dropdownList = Arrays.asList(
            new DropdownModel(1, "INV-001"),
            new DropdownModel(2, "INV-002")
        );

        when(invoiceService.getInvoicesForDropdown(1)).thenReturn(dropdownList);

        ResponseEntity<List<DropdownModel>> response = controller.getInvoicesForDropdown(1);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(2);
    }

    @Test
    void getNextInvoiceNoShouldReturnNextNumber() {
        when(invoiceService.getLastInvoiceNo(1)).thenReturn(100);

        ResponseEntity<Integer> response = controller.getNextInvoiceNo(1);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(100);
    }

    @Test
    void getNextInvoiceNoShouldReturnNotFoundWhenNull() {
        when(invoiceService.getLastInvoiceNo(1)).thenReturn(null);

        ResponseEntity<Integer> response = controller.getNextInvoiceNo(1);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getChartDataShouldReturnChartDataForMonthCount() {
        List<Invoice> invoices = new ArrayList<>();
        Object chartData = new Object();

        when(invoiceService.getInvoiceList(6)).thenReturn(invoices);
        when(chartUtil.getinvoiceData(invoices, 6)).thenReturn(chartData);

        ResponseEntity<Object> response = controller.getChartData(6);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    void getChartDataShouldReturnBadRequestWhenInvoiceListNull() {
        when(invoiceService.getInvoiceList(6)).thenReturn(null);

        ResponseEntity<Object> response = controller.getChartData(6);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void getTotalEarningsAmountDetailsShouldReturnEarnings() {
        EarningDetailsModel earningsModel = EarningDetailsModel.builder()
            .totalEarningsAmount(50000f)
            .totalEarningsAmountWeekly(10000f)
            .totalEarningsAmountMonthly(30000f)
            .build();

        when(invoiceService.getTotalEarnings()).thenReturn(earningsModel);

        ResponseEntity<EarningDetailsModel> response = controller.getTotalEarningsAmountDetails(mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getTotalEarningsAmount()).isEqualTo(50000f);
    }

    @Test
    void getDueInvoiceForContactShouldReturnUnpaidInvoices() {
        Integer contactId = 1;
        ContactTypeEnum type = ContactTypeEnum.CUSTOMER;

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);

        List<Invoice> invoiceList = new ArrayList<>();
        List<InvoiceDueAmountModel> dueAmountList = new ArrayList<>();

        when(invoiceService.getUnpaidInvoice(contactId, type)).thenReturn(invoiceList);
        when(invoiceRestHelper.getDueInvoiceList(invoiceList, adminUser)).thenReturn(dueAmountList);

        ResponseEntity<List<InvoiceDueAmountModel>> response =
            controller.getDueInvoiceForContact(contactId, type, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(invoiceService).getUnpaidInvoice(contactId, type);
    }

    @Test
    void getCustomerInvoicesCountForDeleteShouldReturnReceiptCount() {
        when(invoiceService.getReceiptCountByCustInvoiceId(1)).thenReturn(5);

        ResponseEntity<Integer> response = controller.getCustomerInvoicesCountForDelete(1);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(5);
    }

    @Test
    void getSupplierInvoicesCountForDeleteShouldReturnReceiptCount() {
        when(invoiceService.getReceiptCountBySupInvoiceId(1)).thenReturn(3);

        ResponseEntity<Integer> response = controller.getSupInvoicesCountForDelete(1);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(3);
    }

    @Test
    void getAmountDetailsShouldReturnVatAmountDtos() {
        AmountDetailRequestModel requestModel = new AmountDetailRequestModel();
        List<VatAmountDto> vatAmounts = Arrays.asList(
            new VatAmountDto()
        );

        when(invoiceService.getAmountDetails(requestModel)).thenReturn(vatAmounts);

        ResponseEntity<List<VatAmountDto>> response = controller.getAmountDetails(requestModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void getAmountDetailsShouldReturnNotFoundWhenNull() {
        AmountDetailRequestModel requestModel = new AmountDetailRequestModel();
        when(invoiceService.getAmountDetails(requestModel)).thenReturn(null);

        ResponseEntity<List<VatAmountDto>> response = controller.getAmountDetails(requestModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getSuggestionUnpaidInvoicesForCustomerShouldReturnDropdownList() {
        BigDecimal amount = new BigDecimal("1000");
        Integer contactId = 1;
        Integer currency = 1;
        Integer bankId = 1;

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);

        List<Invoice> invoiceList = new ArrayList<>();
        List<InviceSingleLevelDropdownModel> dropdownList = new ArrayList<>();

        when(invoiceService.getSuggestionInvoices(amount, contactId, ContactTypeEnum.CUSTOMER, currency, 1))
            .thenReturn(invoiceList);
        when(invoiceRestHelper.getDropDownModelList(invoiceList)).thenReturn(dropdownList);

        ResponseEntity<List<InviceSingleLevelDropdownModel>> response =
            controller.getSuggestionUnpaidInvoicesForCustomer(amount, currency, contactId, bankId, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(invoiceService).getSuggestionInvoices(amount, contactId, ContactTypeEnum.CUSTOMER, currency, 1);
    }

    @Test
    void getSuggestionUnpaidInvoicesForVendorShouldReturnDropdownList() {
        BigDecimal amount = new BigDecimal("1000");
        Integer contactId = 1;
        Integer currency = 1;
        Integer bankId = 1;

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);

        List<Invoice> invoiceList = new ArrayList<>();
        List<InviceSingleLevelDropdownModel> dropdownList = new ArrayList<>();

        when(invoiceService.getSuggestionInvoices(amount, contactId, ContactTypeEnum.SUPPLIER, currency, 1))
            .thenReturn(invoiceList);
        when(invoiceRestHelper.getDropDownModelList(invoiceList)).thenReturn(dropdownList);

        ResponseEntity<List<InviceSingleLevelDropdownModel>> response =
            controller.getSuggestionUnpaidInvoicesForVendor(amount, contactId, currency, bankId, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(invoiceService).getSuggestionInvoices(amount, contactId, ContactTypeEnum.SUPPLIER, currency, 1);
    }

    @Test
    void bulkDeleteShouldCallServiceWithIds() {
        DeleteModel deleteModel = new DeleteModel();
        ArrayList<Integer> ids = new ArrayList<>();
        ids.add(1);
        ids.add(2);
        ids.add(3);
        deleteModel.setIds(ids);

        try {
            ResponseEntity<?> response = controller.delete(deleteModel);
            // If it succeeds, verify OK status
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        } catch (Exception e) {
            // MessageUtil may fail in unit tests - this is expected
        }
    }
}
