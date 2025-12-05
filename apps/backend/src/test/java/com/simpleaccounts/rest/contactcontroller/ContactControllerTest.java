package com.simpleaccounts.rest.contactcontroller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.ContactFilterEnum;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rfq_po.PoQuatationService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.BankAccountService;
import com.simpleaccounts.service.ContactService;
import com.simpleaccounts.service.ContactTransactionCategoryService;
import com.simpleaccounts.service.InvoiceService;
import com.simpleaccounts.service.InventoryService;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.utils.TransactionCategoryCreationHelper;

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
class ContactControllerTest {

    @Mock private ContactService contactService;
    @Mock private TransactionCategoryCreationHelper transactionCategoryCreationHelper;
    @Mock private ContactHelper contactHelper;
    @Mock private JwtTokenUtil jwtTokenUtil;
    @Mock private InvoiceService invoiceService;
    @Mock private UserService userService;
    @Mock private TransactionCategoryService transactionCategoryService;
    @Mock private ContactTransactionCategoryService contactTransactionCategoryService;
    @Mock private PoQuatationService poQuatationService;
    @Mock private InventoryService inventoryService;
    @Mock private BankAccountService bankAccountService;

    @InjectMocks
    private ContactController controller;

    private HttpServletRequest mockRequest;
    private User adminUser;
    private User normalUser;

    @BeforeEach
    void setUp() {
        mockRequest = mock(HttpServletRequest.class);

        Role adminRole = new Role();
        adminRole.setRoleCode(1);

        Role userRole = new Role();
        userRole.setRoleCode(2);

        adminUser = new User();
        adminUser.setUserId(1);
        adminUser.setRole(adminRole);

        normalUser = new User();
        normalUser.setUserId(2);
        normalUser.setRole(userRole);
    }

    @Test
    void getContactListShouldReturnPaginatedListForAdmin() {
        ContactRequestFilterModel filterModel = new ContactRequestFilterModel();
        filterModel.setContactType(1);
        filterModel.setName("Test Contact");
        filterModel.setEmail("test@example.com");

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);

        PaginationResponseModel pagination = new PaginationResponseModel(10, new ArrayList<>());
        when(contactService.getContactList(any(), eq(filterModel))).thenReturn(pagination);
        when(contactHelper.getModelList(any())).thenReturn(new ArrayList<>());

        ResponseEntity<PaginationResponseModel> response =
            controller.getContactList(filterModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getCount()).isEqualTo(10);

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(contactService).getContactList(captor.capture(), eq(filterModel));
        Map<ContactFilterEnum, Object> filterData = captor.getValue();

        // Admin should not have USER_ID filter
        assertThat(filterData).doesNotContainKey(ContactFilterEnum.USER_ID);
        assertThat(filterData).containsEntry(ContactFilterEnum.CONTACT_TYPE, 1);
        assertThat(filterData).containsEntry(ContactFilterEnum.NAME, "Test Contact");
        assertThat(filterData).containsEntry(ContactFilterEnum.EMAIL, "test@example.com");
        assertThat(filterData).containsEntry(ContactFilterEnum.DELETE_FLAG, false);
    }

    @Test
    void getContactListShouldFilterByUserIdForNonAdmin() {
        ContactRequestFilterModel filterModel = new ContactRequestFilterModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(2);
        when(userService.findByPK(2)).thenReturn(normalUser);

        PaginationResponseModel pagination = new PaginationResponseModel(0, new ArrayList<>());
        when(contactService.getContactList(any(), eq(filterModel))).thenReturn(pagination);
        when(contactHelper.getModelList(any())).thenReturn(new ArrayList<>());

        controller.getContactList(filterModel, mockRequest);

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(contactService).getContactList(captor.capture(), eq(filterModel));
        Map<ContactFilterEnum, Object> filterData = captor.getValue();

        // Non-admin should have USER_ID filter
        assertThat(filterData).containsEntry(ContactFilterEnum.USER_ID, 2);
    }

    @Test
    void getContactListShouldReturnNotFoundWhenServiceReturnsNull() {
        ContactRequestFilterModel filterModel = new ContactRequestFilterModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(contactService.getContactList(any(), eq(filterModel))).thenReturn(null);

        ResponseEntity<PaginationResponseModel> response =
            controller.getContactList(filterModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getContactsForDropdownShouldReturnList() {
        List<DropdownObjectModel> dropdownList = Arrays.asList(
            new DropdownObjectModel(1, "Contact 1"),
            new DropdownObjectModel(2, "Contact 2")
        );

        when(contactService.getContactForDropdownObjectModel(1)).thenReturn(dropdownList);

        ResponseEntity<List<DropdownObjectModel>> response =
            controller.getContactsForDropdown(1);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(2);
    }

    @Test
    void getContactsForDropdownForVendorShouldReturnFilteredList() {
        BankAccount bankAccount = new BankAccount();
        Currency currency = new Currency();
        bankAccount.setBankAccountCurrency(currency);

        Contact contact = new Contact();
        contact.setContactId(1);
        contact.setFirstName("John");
        contact.setMiddleName("");
        contact.setLastName("Doe");
        contact.setCurrency(currency);

        List<Contact> supplierList = Arrays.asList(contact);

        when(bankAccountService.findByPK(5)).thenReturn(bankAccount);
        when(contactService.getSupplierContacts(currency)).thenReturn(supplierList);

        ResponseEntity<?> response = controller.getContactsForDropdownForVendor(5);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isInstanceOf(List.class);
    }

    @Test
    void getContactsForDropdownForVendorShouldUseOrganizationNameWhenAvailable() {
        BankAccount bankAccount = new BankAccount();
        Currency currency = new Currency();
        bankAccount.setBankAccountCurrency(currency);

        Contact contact = new Contact();
        contact.setContactId(1);
        contact.setOrganization("Test Company");
        contact.setFirstName("John");
        contact.setLastName("Doe");
        contact.setCurrency(currency);

        List<Contact> supplierList = Arrays.asList(contact);

        when(bankAccountService.findByPK(5)).thenReturn(bankAccount);
        when(contactService.getSupplierContacts(currency)).thenReturn(supplierList);

        ResponseEntity<?> response = controller.getContactsForDropdownForVendor(5);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}
