package com.simpleaccounts.rest.validationcontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.repository.PayrollRepository;
import com.simpleaccounts.repository.ProductRepository;
import com.simpleaccounts.rest.creditnotecontroller.CreditNoteRepository;
import com.simpleaccounts.rest.payroll.service.SalaryComponentService;
import com.simpleaccounts.rfq_po.PoQuatation;
import com.simpleaccounts.rfq_po.PoQuatationService;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.service.*;

import java.util.*;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@WebMvcTest(ValidationController.class)
@AutoConfigureMockMvc(addFilters = false)
class ValidationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private ProductService productService;
    @MockBean private SalaryComponentService salaryComponentService;
    @MockBean private VatCategoryService vatCategoryService;
    @MockBean private ContactService contactService;
    @MockBean private TransactionCategoryService transactionCategoryService;
    @MockBean private BankAccountService bankAccountService;
    @MockBean private InvoiceService invoiceService;
    @MockBean private RoleService roleService;
    @MockBean private UserService userService;
    @MockBean private CurrencyExchangeService currencyExchangeService;
    @MockBean private PoQuatationService poQuatationService;
    @MockBean private EmployeeService employeeService;
    @MockBean private EmployeeDesignationService employeeDesignationService;
    @MockBean private EmploymentService employmentService;
    @MockBean private ExpenseService expenseService;
    @MockBean private EmployeeBankDetailsService employeeBankDetailsService;
    @MockBean private JournalService journalService;
    @MockBean private PayrollRepository payrollRepository;
    @MockBean private CreditNoteRepository creditNoteRepository;
    @MockBean private ProductRepository productRepository;
    @MockBean private CustomUserDetailsService customUserDetailsService;

    @Test
    void validateShouldReturnProductNameExists() throws Exception {
        List<Product> products = Arrays.asList(new Product());

        when(productRepository.findByProductNameAndDeleteFlagIgnoreCase("Test Product", false))
            .thenReturn(products);

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "1")
                        .param("name", "Test Product"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Product Name Already Exists")));
    }

    @Test
    void validateShouldReturnProductNameNotExists() throws Exception {
        when(productRepository.findByProductNameAndDeleteFlagIgnoreCase("New Product", false))
            .thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "1")
                        .param("name", "New Product"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Product name does not exists")));
    }

    @Test
    void validateShouldReturnVatNameExists() throws Exception {
        List<VatCategory> vatCategories = Arrays.asList(new VatCategory());

        when(vatCategoryService.findByAttributes(any())).thenReturn(vatCategories);

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "2")
                        .param("name", "VAT 5%"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Vat name already exists")));
    }

    @Test
    void validateShouldReturnVatNameNotExists() throws Exception {
        when(vatCategoryService.findByAttributes(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "2")
                        .param("name", "New VAT"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Vat name does not exists")));
    }

    @Test
    void validateShouldReturnContactEmailExists() throws Exception {
        List<Contact> contacts = Arrays.asList(new Contact());

        when(contactService.findByAttributes(any())).thenReturn(contacts);

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "3")
                        .param("name", "contact@example.com"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Contact email already exists")));
    }

    @Test
    void validateShouldReturnContactEmailNotExists() throws Exception {
        when(contactService.findByAttributes(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "3")
                        .param("name", "new@example.com"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Contact email does not exists")));
    }

    @Test
    void validateShouldReturnChartOfAccountExists() throws Exception {
        List<TransactionCategory> categories = Arrays.asList(new TransactionCategory());

        when(transactionCategoryService.findByAttributes(any())).thenReturn(categories);

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "4")
                        .param("name", "Sales"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Chart Of Account already exists")));
    }

    @Test
    void validateShouldReturnChartOfAccountNotExists() throws Exception {
        when(transactionCategoryService.findByAttributes(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "4")
                        .param("name", "New Category"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Chart Of Account does not exists")));
    }

    @Test
    void validateShouldReturnBankAccountExists() throws Exception {
        List<BankAccount> accounts = Arrays.asList(new BankAccount());

        when(bankAccountService.findByAttributes(any())).thenReturn(accounts);

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "5")
                        .param("name", "123456789"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Bank Account Already Exists")));
    }

    @Test
    void validateShouldReturnBankAccountNotExists() throws Exception {
        when(bankAccountService.findByAttributes(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "5")
                        .param("name", "987654321"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Bank Account does not exists")));
    }

    @Test
    void validateShouldReturnInvoiceNumberExists() throws Exception {
        List<Invoice> invoices = Arrays.asList(new Invoice());

        when(invoiceService.findByAttributes(any())).thenReturn(invoices);

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "6")
                        .param("name", "INV-001"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Invoice Number Already Exists")));
    }

    @Test
    void validateShouldReturnInvoiceNumberNotExists() throws Exception {
        when(invoiceService.findByAttributes(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "6")
                        .param("name", "INV-999"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Invoice Number does not exists")));
    }

    @Test
    void validateShouldReturnProductCodeExists() throws Exception {
        List<Product> products = Arrays.asList(new Product());

        when(productService.findByAttributes(any())).thenReturn(products);

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "7")
                        .param("productCode", "PROD-001"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Product Code Already Exists")));
    }

    @Test
    void validateShouldReturnProductCodeNotExists() throws Exception {
        when(productService.findByAttributes(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "7")
                        .param("productCode", "PROD-999"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Product code does not exists")));
    }

    @Test
    void validateShouldReturnRoleNameExists() throws Exception {
        List<Role> roles = Arrays.asList(new Role());

        when(roleService.findByAttributes(any())).thenReturn(roles);

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "8")
                        .param("name", "Admin"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Role Name Already Exists")));
    }

    @Test
    void validateShouldReturnRoleNameNotExists() throws Exception {
        when(roleService.findByAttributes(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "8")
                        .param("name", "NewRole"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Role name does not exists")));
    }

    @Test
    void validateShouldReturnUserExists() throws Exception {
        List<User> users = Arrays.asList(new User());

        when(userService.findByAttributes(any())).thenReturn(users);

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "9")
                        .param("name", "user@example.com"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("User Already Exists")));
    }

    @Test
    void validateShouldReturnUserNotExists() throws Exception {
        when(userService.findByAttributes(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "9")
                        .param("name", "newuser@example.com"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("User does not exists")));
    }

    @Test
    void validateShouldReturnCurrencyConversionExists() throws Exception {
        List<CurrencyConversion> conversions = Arrays.asList(new CurrencyConversion());

        when(currencyExchangeService.findByAttributes(any())).thenReturn(conversions);

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "10")
                        .param("currencyCode", "USD"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Currency Conversions Already Exists")));
    }

    @Test
    void validateShouldReturnCurrencyConversionNotExists() throws Exception {
        when(currencyExchangeService.findByAttributes(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "10")
                        .param("currencyCode", "EUR"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Currency Conversions does not exists")));
    }

    @Test
    void validateShouldReturnRfqNumberExists() throws Exception {
        List<PoQuatation> rfqList = Arrays.asList(new PoQuatation());

        when(poQuatationService.findByAttributes(any())).thenReturn(rfqList);

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "11")
                        .param("name", "RFQ-001"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("RFQ Number Already Exists")));
    }

    @Test
    void validateShouldReturnPoNumberExists() throws Exception {
        List<PoQuatation> poList = Arrays.asList(new PoQuatation());

        when(poQuatationService.findByAttributes(any())).thenReturn(poList);

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "12")
                        .param("name", "PO-001"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Po Number Already Exists")));
    }

    @Test
    void validateShouldReturnGrnNumberExists() throws Exception {
        List<PoQuatation> grnList = Arrays.asList(new PoQuatation());

        when(poQuatationService.findByAttributes(any())).thenReturn(grnList);

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "13")
                        .param("name", "GRN-001"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("GRN Number Already Exists")));
    }

    @Test
    void validateShouldReturnQuotationNumberExists() throws Exception {
        List<PoQuatation> quotationList = Arrays.asList(new PoQuatation());

        when(poQuatationService.findByAttributes(any())).thenReturn(quotationList);

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "14")
                        .param("name", "QUO-001"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Quotation Number Already Exists")));
    }

    @Test
    void validateShouldReturnEmployeeCodeExists() throws Exception {
        List<Employment> employments = Arrays.asList(new Employment());

        when(employmentService.findByAttributes(any())).thenReturn(employments);

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "15")
                        .param("name", "EMP-001"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Employee Code Already Exists")));
    }

    @Test
    void validateShouldReturnUpdateBankAccountExists() throws Exception {
        BankAccount account = new BankAccount();
        account.setBankAccountId(1);

        List<BankAccount> accounts = Arrays.asList(account);

        when(bankAccountService.findByAttributes(any())).thenReturn(accounts);

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "17")
                        .param("name", "123456")
                        .param("checkId", "2"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Bank Account Already Exists")));
    }

    @Test
    void validateShouldReturnExpenseNumberExists() throws Exception {
        List<Expense> expenses = Arrays.asList(new Expense());

        when(expenseService.findByAttributes(any())).thenReturn(expenses);

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "18")
                        .param("name", "EXP-001"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Expense Number Already Exists")));
    }

    @Test
    void validateShouldReturnAccountNumberExists() throws Exception {
        List<EmployeeBankDetails> bankDetails = Arrays.asList(new EmployeeBankDetails());

        when(employeeBankDetailsService.findByAttributes(any())).thenReturn(bankDetails);

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "19")
                        .param("name", "987654321"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Account Number Already Exists")));
    }

    @Test
    void validateShouldReturnJournalReferenceExists() throws Exception {
        List<Journal> journals = Arrays.asList(new Journal());

        when(journalService.findByAttributes(any())).thenReturn(journals);

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "20")
                        .param("name", "JNL-001"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Journal Reference Number Already Exists")));
    }

    @Test
    void validateShouldReturnTaxRegNumberExists() throws Exception {
        List<Contact> contacts = Arrays.asList(new Contact());

        when(contactService.findByAttributes(any())).thenReturn(contacts);

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "21")
                        .param("name", "TRN123456"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Tax Registration Number Already Exists")));
    }

    @Test
    void validateShouldReturnPayrollSubjectExists() throws Exception {
        Payroll payroll = new Payroll();
        payroll.setPayrollSubject("Monthly Payroll");
        payroll.setDeleteFlag(false);

        when(payrollRepository.findAll()).thenReturn(Arrays.asList(payroll));

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "27")
                        .param("name", "Monthly Payroll"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Payroll Subject already exists")));
    }

    @Test
    void validateShouldReturnCreditNoteNumberExists() throws Exception {
        List<CreditNote> creditNotes = Arrays.asList(new CreditNote());

        when(creditNoteRepository.findAllByCreditNoteNumber("CN-001")).thenReturn(creditNotes);

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "28")
                        .param("name", "CN-001"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Credit Note Number Already Exists")));
    }

    @Test
    void validateShouldReturnSalaryComponentNameExists() throws Exception {
        List<SalaryComponent> components = Arrays.asList(new SalaryComponent());

        when(salaryComponentService.findByAttributes(any())).thenReturn(components);

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "29")
                        .param("name", "Basic Salary"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Description Name Already Exists")));
    }

    @Test
    void validateShouldReturnSalaryComponentCodeExists() throws Exception {
        List<SalaryComponent> components = Arrays.asList(new SalaryComponent());

        when(salaryComponentService.findByAttributes(any())).thenReturn(components);

        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "30")
                        .param("name", "BASIC"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Component ID Already Exists")));
    }

    @Test
    void validateShouldReturnBadRequestWhenModuleTypeNull() throws Exception {
        mockMvc.perform(get("/rest/validation/validate")
                        .param("name", "test"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void validateShouldReturnBadRequestWhenInvalidModuleType() throws Exception {
        mockMvc.perform(get("/rest/validation/validate")
                        .param("moduleType", "999")
                        .param("name", "test"))
                .andExpect(status().isBadRequest());
    }
}
