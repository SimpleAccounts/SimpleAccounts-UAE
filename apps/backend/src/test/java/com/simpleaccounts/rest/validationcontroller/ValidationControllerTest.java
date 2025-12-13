package com.simpleaccounts.rest.validationcontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.repository.PayrollRepository;
import com.simpleaccounts.repository.ProductRepository;
import com.simpleaccounts.rest.creditnotecontroller.CreditNoteRepository;
import com.simpleaccounts.rest.payroll.service.SalaryComponentService;
import com.simpleaccounts.rfq_po.PoQuatationService;
import com.simpleaccounts.service.*;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

/**
 * Unit tests for ValidationController.
 */
@ExtendWith(MockitoExtension.class)
class ValidationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ProductService productService;
    @Mock
    private SalaryComponentService salaryComponentService;
    @Mock
    private VatCategoryService vatCategoryService;
    @Mock
    private ContactService contactService;
    @Mock
    private TransactionCategoryService transactionCategoryService;
    @Mock
    private BankAccountService bankAccountService;
    @Mock
    private InvoiceService invoiceService;
    @Mock
    private RoleService roleService;
    @Mock
    private UserService userService;
    @Mock
    private CurrencyExchangeService currencyExchangeService;
    @Mock
    private PoQuatationService poQuatationService;
    @Mock
    private EmployeeService employeeService;
    @Mock
    private EmployeeDesignationService employeeDesignationService;
    @Mock
    private EmploymentService employmentService;
    @Mock
    private ExpenseService expenseService;
    @Mock
    private EmployeeBankDetailsService employeeBankDetailsService;
    @Mock
    private JournalService journalService;
    @Mock
    private PayrollRepository payrollRepository;
    @Mock
    private CreditNoteRepository creditNoteRepository;
    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ValidationController validationController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(validationController).build();
    }

    // ========== Product Validation Tests ==========

    @Test
    void shouldReturnProductNameExistsWhenProductFound() throws Exception {
        Product product = new Product();
        product.setProductName("TestProduct");
        when(productRepository.findByProductNameAndDeleteFlagIgnoreCase("TestProduct", false))
                .thenReturn(Collections.singletonList(product));

        mockMvc.perform(get("/rest/validation/validate")
                .param("moduleType", "1")
                .param("name", "TestProduct"))
                .andExpect(status().isOk())
                .andExpect(content().string("Product Name Already Exists"));
    }

    @Test
    void shouldReturnProductNameNotExistsWhenNotFound() throws Exception {
        when(productRepository.findByProductNameAndDeleteFlagIgnoreCase("NonExistent", false))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/rest/validation/validate")
                .param("moduleType", "1")
                .param("name", "NonExistent"))
                .andExpect(status().isOk())
                .andExpect(content().string("Product name does not exists"));
    }

    @Test
    void shouldValidateProductCode() throws Exception {
        when(productService.findByAttributes(any())).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/rest/validation/validate")
                .param("moduleType", "7")
                .param("productCode", "PROD001"))
                .andExpect(status().isOk())
                .andExpect(content().string("Product code does not exists"));
    }

    @Test
    void shouldReturnProductCodeExistsWhenFound() throws Exception {
        Product product = new Product();
        product.setProductCode("PROD001");
        when(productService.findByAttributes(any())).thenReturn(Collections.singletonList(product));

        mockMvc.perform(get("/rest/validation/validate")
                .param("moduleType", "7")
                .param("productCode", "PROD001"))
                .andExpect(status().isOk())
                .andExpect(content().string("Product Code Already Exists"));
    }

    // ========== VAT Validation Tests ==========

    @Test
    void shouldValidateVatName() throws Exception {
        VatCategory vat = new VatCategory();
        vat.setName("Standard VAT");
        when(vatCategoryService.findByAttributes(any())).thenReturn(Collections.singletonList(vat));

        mockMvc.perform(get("/rest/validation/validate")
                .param("moduleType", "2")
                .param("name", "Standard VAT"))
                .andExpect(status().isOk())
                .andExpect(content().string("Vat name already exists"));
    }

    @Test
    void shouldReturnVatNameNotExists() throws Exception {
        when(vatCategoryService.findByAttributes(any())).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/rest/validation/validate")
                .param("moduleType", "2")
                .param("name", "NonExistent VAT"))
                .andExpect(status().isOk())
                .andExpect(content().string("Vat name does not exists"));
    }

    // ========== Contact Validation Tests ==========

    @Test
    void shouldValidateContactEmail() throws Exception {
        Contact contact = new Contact();
        contact.setEmail("test@example.com");
        when(contactService.findByAttributes(any())).thenReturn(Collections.singletonList(contact));

        mockMvc.perform(get("/rest/validation/validate")
                .param("moduleType", "3")
                .param("name", "test@example.com"))
                .andExpect(status().isOk())
                .andExpect(content().string("Contact email already exists"));
    }

    @Test
    void shouldValidateTaxRegistrationNumber() throws Exception {
        when(contactService.findByAttributes(any())).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/rest/validation/validate")
                .param("moduleType", "21")
                .param("name", "TRN12345"))
                .andExpect(status().isOk())
                .andExpect(content().string("Tax Registration Number does not exists"));
    }

    // ========== Bank Account Validation Tests ==========

    @Test
    void shouldValidateBankAccountNumber() throws Exception {
        BankAccount bankAccount = new BankAccount();
        bankAccount.setAccountNumber("1234567890");
        when(bankAccountService.findByAttributes(any())).thenReturn(Collections.singletonList(bankAccount));

        mockMvc.perform(get("/rest/validation/validate")
                .param("moduleType", "5")
                .param("name", "1234567890"))
                .andExpect(status().isOk())
                .andExpect(content().string("Bank Account Already Exists"));
    }

    @Test
    void shouldReturnBankAccountNotExists() throws Exception {
        when(bankAccountService.findByAttributes(any())).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/rest/validation/validate")
                .param("moduleType", "5")
                .param("name", "NonExistent"))
                .andExpect(status().isOk())
                .andExpect(content().string("Bank Account does not exists"));
    }

    // ========== Invoice Validation Tests ==========

    @Test
    void shouldValidateInvoiceNumber() throws Exception {
        Invoice invoice = new Invoice();
        invoice.setReferenceNumber("INV-001");
        when(invoiceService.findByAttributes(any())).thenReturn(Collections.singletonList(invoice));

        mockMvc.perform(get("/rest/validation/validate")
                .param("moduleType", "6")
                .param("name", "INV-001"))
                .andExpect(status().isOk())
                .andExpect(content().string("Invoice Number Already Exists"));
    }

    @Test
    void shouldReturnInvoiceNumberNotExists() throws Exception {
        when(invoiceService.findByAttributes(any())).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/rest/validation/validate")
                .param("moduleType", "6")
                .param("name", "INV-999"))
                .andExpect(status().isOk())
                .andExpect(content().string("Invoice Number does not exists"));
    }

    // ========== User/Role Validation Tests ==========

    @Test
    void shouldValidateRoleName() throws Exception {
        Role role = new Role();
        role.setRoleName("Admin");
        when(roleService.findByAttributes(any())).thenReturn(Collections.singletonList(role));

        mockMvc.perform(get("/rest/validation/validate")
                .param("moduleType", "8")
                .param("name", "Admin"))
                .andExpect(status().isOk())
                .andExpect(content().string("Role Name Already Exists"));
    }

    @Test
    void shouldValidateUserEmail() throws Exception {
        User user = new User();
        user.setUserEmail("admin@example.com");
        when(userService.findByAttributes(any())).thenReturn(Collections.singletonList(user));

        mockMvc.perform(get("/rest/validation/validate")
                .param("moduleType", "9")
                .param("name", "admin@example.com"))
                .andExpect(status().isOk())
                .andExpect(content().string("User Already Exists"));
    }

    // ========== HR Validation Tests ==========

    @Test
    void shouldValidateEmployeeCode() throws Exception {
        Employment employment = new Employment();
        employment.setEmployeeCode("EMP001");
        when(employmentService.findByAttributes(any())).thenReturn(Collections.singletonList(employment));

        mockMvc.perform(get("/rest/validation/validate")
                .param("moduleType", "15")
                .param("name", "EMP001"))
                .andExpect(status().isOk())
                .andExpect(content().string("Employee Code Already Exists"));
    }

    @Test
    void shouldValidateEmployeeEmail() throws Exception {
        Employee employee = new Employee();
        employee.setEmail("employee@example.com");
        when(employeeService.findByAttributes(any())).thenReturn(Collections.singletonList(employee));

        mockMvc.perform(get("/rest/validation/validate")
                .param("moduleType", "24")
                .param("name", "employee@example.com"))
                .andExpect(status().isOk())
                .andExpect(content().string("Employee email already exists"));
    }

    // ========== Transaction Validation Tests ==========

    @Test
    void shouldValidateJournalReferenceNumber() throws Exception {
        when(journalService.findByAttributes(any())).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/rest/validation/validate")
                .param("moduleType", "20")
                .param("name", "JRN-001"))
                .andExpect(status().isOk())
                .andExpect(content().string("Journal Reference Number does not exists"));
    }

    @Test
    void shouldValidateExpenseNumber() throws Exception {
        Expense expense = new Expense();
        expense.setExpenseNumber("EXP-001");
        when(expenseService.findByAttributes(any())).thenReturn(Collections.singletonList(expense));

        mockMvc.perform(get("/rest/validation/validate")
                .param("moduleType", "18")
                .param("name", "EXP-001"))
                .andExpect(status().isOk())
                .andExpect(content().string("Expense Number Already Exists"));
    }

    // ========== Edge Cases ==========

    @Test
    void shouldReturnBadRequestForNullModuleType() throws Exception {
        mockMvc.perform(get("/rest/validation/validate")
                .param("name", "TestValue"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReturnBadRequestForUnsupportedModuleType() throws Exception {
        mockMvc.perform(get("/rest/validation/validate")
                .param("moduleType", "999")
                .param("name", "TestValue"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldHandleEmptyName() throws Exception {
        when(productRepository.findByProductNameAndDeleteFlagIgnoreCase("", false))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/rest/validation/validate")
                .param("moduleType", "1")
                .param("name", ""))
                .andExpect(status().isOk());
    }

    // ========== Currency Validation Tests ==========

    @Test
    void shouldValidateCurrencyCode() throws Exception {
        CurrencyConversion currency = new CurrencyConversion();
        currency.setCurrencyCode("USD");
        when(currencyExchangeService.findByAttributes(any())).thenReturn(Collections.singletonList(currency));

        mockMvc.perform(get("/rest/validation/validate")
                .param("moduleType", "10")
                .param("currencyCode", "1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Currency Conversions Already Exists"));
    }

    // ========== Chart of Account Validation Tests ==========

    @Test
    void shouldValidateChartOfAccountName() throws Exception {
        TransactionCategory category = new TransactionCategory();
        category.setTransactionCategoryName("Sales Revenue");
        when(transactionCategoryService.findByAttributes(any())).thenReturn(Collections.singletonList(category));

        mockMvc.perform(get("/rest/validation/validate")
                .param("moduleType", "4")
                .param("name", "Sales Revenue"))
                .andExpect(status().isOk())
                .andExpect(content().string("Chart Of Account already exists"));
    }
}
