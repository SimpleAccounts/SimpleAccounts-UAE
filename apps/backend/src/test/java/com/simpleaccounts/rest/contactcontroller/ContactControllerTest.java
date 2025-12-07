package com.simpleaccounts.rest.contactcontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.simpleaccounts.entity.Company;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rfq_po.PoQuatationService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.BankAccountService;
import com.simpleaccounts.service.ContactService;
import com.simpleaccounts.service.ContactTransactionCategoryService;
import com.simpleaccounts.service.InventoryService;
import com.simpleaccounts.service.InvoiceService;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.utils.TransactionCategoryCreationHelper;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
@DisplayName("ContactController Unit Tests")
class ContactControllerTest {

  private MockMvc mockMvc;

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

  @InjectMocks private ContactController contactController;

  @BeforeEach
  void setUp() {
    mockMvc = MockMvcBuilders.standaloneSetup(contactController).build();
  }

  @Test
  @DisplayName("Should return contacts for dropdown")
  void getContactsForDropdownReturnsList() throws Exception {
    List<DropdownObjectModel> dropdownList =
        Arrays.asList(
            new DropdownObjectModel(1, "John Doe"), new DropdownObjectModel(2, "Jane Smith"));

    when(contactService.getContactForDropdownObjectModel(anyInt())).thenReturn(dropdownList);

    mockMvc
        .perform(get("/rest/contact/getContactsForDropdown").param("contactType", "1"))
        .andExpect(status().isOk());
  }

  @Test
  @DisplayName("Should return contact by ID")
  void getContactByIdReturnsContact() throws Exception {
    Contact contact = createContact(1, "John", "Doe", "john@test.com");
    ContactPersistModel persistModel =
        ContactPersistModel.builder().contactId(1).firstName("John").lastName("Doe").build();

    when(contactService.findByPK(1)).thenReturn(contact);
    when(contactHelper.getContactPersistModel(any(Contact.class))).thenReturn(persistModel);

    mockMvc
        .perform(get("/rest/contact/getContactById").param("contactId", "1"))
        .andExpect(status().isOk());
  }

  @Test
  @DisplayName("Should return invoice count for contact")
  void getInvoicesCountForContactReturnsCount() throws Exception {
    when(invoiceService.getTotalInvoiceCountByContactId(1)).thenReturn(5);
    when(poQuatationService.getTotalPoQuotationCountForContact(1)).thenReturn(3);
    when(inventoryService.getTotalInventoryCountForContact(1)).thenReturn(2);

    mockMvc
        .perform(get("/rest/contact/getInvoicesCountForContact").param("contactId", "1"))
        .andExpect(status().isOk());
  }

  @Test
  @DisplayName("Should return contact list with admin role")
  void getContactListReturnsListForAdmin() throws Exception {
    User adminUser = createUser(1, "Admin", "User", "admin@test.com");
    Role adminRole = new Role();
    adminRole.setRoleCode(1);
    adminRole.setRoleName("Admin");
    adminUser.setRole(adminRole);

    PaginationResponseModel response = new PaginationResponseModel(0, Collections.emptyList());

    when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
    when(userService.findByPK(1)).thenReturn(adminUser);
    when(contactService.getContactList(any(), any())).thenReturn(response);
    when(contactHelper.getModelList(any())).thenReturn(Collections.emptyList());

    mockMvc
        .perform(get("/rest/contact/getContactList").param("contactType", "1"))
        .andExpect(status().isOk());
  }

  @Test
  @DisplayName("Should return contact list with non-admin role")
  void getContactListReturnsListForNonAdmin() throws Exception {
    User user = createUser(1, "Regular", "User", "user@test.com");
    Role userRole = new Role();
    userRole.setRoleCode(2);
    userRole.setRoleName("User");
    user.setRole(userRole);

    PaginationResponseModel response = new PaginationResponseModel(0, Collections.emptyList());

    when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
    when(userService.findByPK(1)).thenReturn(user);
    when(contactService.getContactList(any(), any())).thenReturn(response);
    when(contactHelper.getModelList(any())).thenReturn(Collections.emptyList());

    mockMvc
        .perform(get("/rest/contact/getContactList").param("contactType", "1"))
        .andExpect(status().isOk());
  }

  @Test
  @DisplayName("Should return not found when contact list is null")
  void getContactListReturnsNotFoundWhenNull() throws Exception {
    User user = createUser(1, "Admin", "User", "admin@test.com");
    Role adminRole = new Role();
    adminRole.setRoleCode(1);
    user.setRole(adminRole);

    when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
    when(userService.findByPK(1)).thenReturn(user);
    when(contactService.getContactList(any(), any())).thenReturn(null);

    mockMvc
        .perform(get("/rest/contact/getContactList").param("contactType", "1"))
        .andExpect(status().isNotFound());
  }

  private Contact createContact(Integer id, String firstName, String lastName, String email) {
    Contact contact = new Contact();
    contact.setContactId(id);
    contact.setFirstName(firstName);
    contact.setLastName(lastName);
    contact.setEmail(email);
    contact.setDeleteFlag(false);
    contact.setIsActive(true);
    return contact;
  }

  private User createUser(Integer id, String firstName, String lastName, String email) {
    User user = new User();
    user.setUserId(id);
    user.setFirstName(firstName);
    user.setLastName(lastName);
    user.setUserEmail(email);
    user.setDeleteFlag(false);
    user.setIsActive(true);
    Company company = new Company();
    company.setCompanyId(1);
    user.setCompany(company);
    return user;
  }
}
