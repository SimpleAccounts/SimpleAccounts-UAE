package com.simpleaccounts.rest.validationcontroller;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.repository.PayrollRepository;
import com.simpleaccounts.repository.ProductRepository;
import com.simpleaccounts.rest.creditnotecontroller.CreditNoteRepository;
import com.simpleaccounts.rest.payroll.service.SalaryComponentService;
import com.simpleaccounts.rfq_po.PoQuatation;
import com.simpleaccounts.rfq_po.PoQuatationService;
import com.simpleaccounts.service.*;
import io.swagger.annotations.ApiOperation;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;

@Component
@RequestMapping("/rest/validation")
@RequiredArgsConstructor
public class ValidationController {
    private static final String JSON_KEY_DELETE_FLAG = "deleteFlag";
    private static final String JSON_KEY_EMAIL = "email";
    private static final String JSON_KEY_ACCOUNT_NUMBER = "accountNumber";

    private final ProductService productService;
    private final SalaryComponentService salaryComponentService;
    private final VatCategoryService vatCategoryService;
    private final ContactService contactService;
    private final TransactionCategoryService transactionCategoryService;
    private final BankAccountService bankAccountService;
    private final InvoiceService invoiceService;
    private final RoleService roleService;
    private final UserService userService;
    private final CurrencyExchangeService currencyExchangeService;
    private final PoQuatationService poQuatationService;
    private final EmployeeService employeeService;
    private final EmployeeDesignationService employeeDesignationService;
    private final EmployeeDesignationService employeeDesignationNameService;
    private final EmploymentService employmentService;
    private final ExpenseService expenseService;
    private final EmployeeBankDetailsService employeeBankDetailsService;
    private final JournalService journalService;
    private final PayrollRepository payrollRepository;
    private final CreditNoteRepository creditNoteRepository;
    private final ProductRepository productRepository;

    @LogRequest
    @ApiOperation(value = "Validate entries before adding to the system")
    @GetMapping(value = "/validate")
    public ResponseEntity<String> validate(@ModelAttribute ValidationModel validationModel, HttpServletRequest request) {
        if (validationModel.getModuleType() == null) {
            return new ResponseEntity<>("Bad request", HttpStatus.BAD_REQUEST);
        }

        switch (validationModel.getModuleType()) {
            case 1:
            case 7:
                return validateProduct(validationModel);
            case 2:
            case 10:
                return validateSettings(validationModel);
            case 3:
            case 21:
            case 22:
                return validateContact(validationModel);
            case 4:
            case 5:
            case 16:
            case 17:
            case 19:
                return validateAccounts(validationModel);
            case 6:
            case 11:
            case 12:
            case 13:
            case 14:
            case 18:
            case 20:
            case 28:
                return validateTransactions(validationModel);
            case 8:
            case 9:
                return validateUserRole(validationModel);
            case 15:
            case 23:
            case 24:
            case 25:
            case 26:
            case 27:
            case 29:
            case 30:
                return validateHR(validationModel);
            default:
                return new ResponseEntity<>("Bad request", HttpStatus.BAD_REQUEST);
        }
    }

    private ResponseEntity<String> validateProduct(ValidationModel validationModel) {
        if (validationModel.getModuleType() == 1) {
            List<Product> productList = productRepository.findByProductNameAndDeleteFlagIgnoreCase(validationModel.getName(), false);
            if (productList != null && !productList.isEmpty())
                return new ResponseEntity<>("Product Name Already Exists", HttpStatus.OK);
            else
                return new ResponseEntity<>("Product name does not exists", HttpStatus.OK);
        } else {
            Map<String, Object> param1 = new HashMap<>();
            param1.put("productCode", validationModel.getProductCode());
            param1.put("deleteFlag", false);
            List<Product> productList1 = productService.findByAttributes(param1);
            if (productList1 != null && !productList1.isEmpty())
                return new ResponseEntity<>("Product Code Already Exists", HttpStatus.OK);
            else
                return new ResponseEntity<>("Product code does not exists", HttpStatus.OK);
        }
    }

    private ResponseEntity<String> validateSettings(ValidationModel validationModel) {
        Map<String, Object> param = new HashMap<>();
        if (validationModel.getModuleType() == 2) {
            param.put("name", validationModel.getName());
            param.put(JSON_KEY_DELETE_FLAG, false);
            List<VatCategory> vatList = vatCategoryService.findByAttributes(param);
            if (vatList != null && !vatList.isEmpty())
                return new ResponseEntity<>("Vat name already exists", HttpStatus.OK);
            else
                return new ResponseEntity<>("Vat name does not exists", HttpStatus.OK);
        } else {
            param.put("currencyCode", validationModel.getCurrencyCode());
            param.put(JSON_KEY_DELETE_FLAG, false);
            List<CurrencyConversion> currencyConversions = currencyExchangeService.findByAttributes(param);
            if (currencyConversions != null && !currencyConversions.isEmpty())
                return new ResponseEntity<>("Currency Conversions Already Exists", HttpStatus.OK);
            else
                return new ResponseEntity<>("Currency Conversions does not exists", HttpStatus.OK);
        }
    }

    private ResponseEntity<String> validateContact(ValidationModel validationModel) {
        Map<String, Object> param = new HashMap<>();
        if (validationModel.getModuleType() == 3) {
            param.put(JSON_KEY_EMAIL, validationModel.getName());
            param.put(JSON_KEY_DELETE_FLAG, false);
            List<Contact> list = contactService.findByAttributes(param);
            if (list != null && !list.isEmpty())
                return new ResponseEntity<>("Contact email already exists", HttpStatus.OK);
            else
                return new ResponseEntity<>("Contact email does not exists", HttpStatus.OK);
        } else if (validationModel.getModuleType() == 21) {
            param.put("vatRegistrationNumber", validationModel.getName());
            param.put(JSON_KEY_DELETE_FLAG, false);
            List<Contact> contactList = contactService.findByAttributes(param);
            if (contactList != null && !contactList.isEmpty())
                return new ResponseEntity<>("Tax Registration Number Already Exists", HttpStatus.OK);
            else
                return new ResponseEntity<>("Tax Registration Number does not exists", HttpStatus.OK);
        } else {
            param.put(JSON_KEY_EMAIL, validationModel.getName());
            param.put(JSON_KEY_DELETE_FLAG, false);
            List<Contact> contactList1 = contactService.findByAttributes(param);
            if (contactList1 != null && !contactList1.isEmpty())
                return new ResponseEntity<>("Email Already Exists", HttpStatus.OK);
            else
                return new ResponseEntity<>("Email does not exists", HttpStatus.OK);
        }
    }

    private ResponseEntity<String> validateAccounts(ValidationModel validationModel) {
        Map<String, Object> param = new HashMap<>();
        if (validationModel.getModuleType() == 4) {
            param.put("transactionCategoryName", validationModel.getName());
            param.put(JSON_KEY_DELETE_FLAG, false);
            List<TransactionCategory> transactionCategoryList = transactionCategoryService.findByAttributes(param);
            if (transactionCategoryList != null && !transactionCategoryList.isEmpty())
                return new ResponseEntity<>("Chart Of Account already exists", HttpStatus.OK);
            else
                return new ResponseEntity<>("Chart Of Account does not exists", HttpStatus.OK);
        } else if (validationModel.getModuleType() == 16) {
            param.put("transactionCategoryName", validationModel.getName());
            param.put(JSON_KEY_DELETE_FLAG, false);
            List<TransactionCategory> coaList = transactionCategoryService.findByAttributes(param);
            if (coaList != null && !coaList.isEmpty())
                return new ResponseEntity<>("Transaction Category Name Already Exists", HttpStatus.OK);
            else
                return new ResponseEntity<>("transaction Category Name does not exists", HttpStatus.OK);
        } else if (validationModel.getModuleType() == 5 || validationModel.getModuleType() == 17) {
            param.put(JSON_KEY_ACCOUNT_NUMBER, validationModel.getName());
            param.put(JSON_KEY_DELETE_FLAG, false);
            List<BankAccount> bankAccountList = bankAccountService.findByAttributes(param);
            if (bankAccountList != null && !bankAccountList.isEmpty()) {
                if (validationModel.getModuleType() == 17 && !Objects.equals(validationModel.getCheckId(), bankAccountList.get(0).getBankAccountId())) {
                    return new ResponseEntity<>("Bank Account Already Exists", HttpStatus.OK);
                } else if (validationModel.getModuleType() == 5) {
                    return new ResponseEntity<>("Bank Account Already Exists", HttpStatus.OK);
                }
            }
            return new ResponseEntity<>("Bank Account does not exists", HttpStatus.OK);
        } else { // Case 19
            param.put(JSON_KEY_ACCOUNT_NUMBER, validationModel.getName());
            param.put(JSON_KEY_DELETE_FLAG, false);
            List<EmployeeBankDetails> employeeBankDetailsList = employeeBankDetailsService.findByAttributes(param);
            if (employeeBankDetailsList != null && !employeeBankDetailsList.isEmpty())
                return new ResponseEntity<>("Account Number Already Exists", HttpStatus.OK);
            else
                return new ResponseEntity<>("accountNumber does not exists", HttpStatus.OK);
        }
    }

    private ResponseEntity<String> validateTransactions(ValidationModel validationModel) {
        Map<String, Object> param = new HashMap<>();
        switch (validationModel.getModuleType()) {
            case 6:
                param.put("referenceNumber", validationModel.getName());
                param.put(JSON_KEY_DELETE_FLAG, false);
                List<Invoice> invoiceList = invoiceService.findByAttributes(param);
                if (invoiceList != null && !invoiceList.isEmpty())
                    return new ResponseEntity<>("Invoice Number Already Exists", HttpStatus.OK);
                else
                    return new ResponseEntity<>("Invoice Number does not exists", HttpStatus.OK);
            case 11:
                param.put("rfqNumber", validationModel.getName());
                param.put(JSON_KEY_DELETE_FLAG, false);
                List<PoQuatation> poQuatationList = poQuatationService.findByAttributes(param);
                if (poQuatationList != null && !poQuatationList.isEmpty())
                    return new ResponseEntity<>("RFQ Number Already Exists", HttpStatus.OK);
                else
                    return new ResponseEntity<>("rfqNumber does not exists", HttpStatus.OK);
            case 12:
                param.put("poNumber", validationModel.getName());
                param.put(JSON_KEY_DELETE_FLAG, false);
                List<PoQuatation> poQuatationList1 = poQuatationService.findByAttributes(param);
                if (poQuatationList1 != null && !poQuatationList1.isEmpty())
                    return new ResponseEntity<>("Po Number Already Exists", HttpStatus.OK);
                else
                    return new ResponseEntity<>("poNumber does not exists", HttpStatus.OK);
            case 13:
                param.put("grnNumber", validationModel.getName());
                param.put(JSON_KEY_DELETE_FLAG, false);
                List<PoQuatation> poQuatationList2 = poQuatationService.findByAttributes(param);
                if (poQuatationList2 != null && !poQuatationList2.isEmpty())
                    return new ResponseEntity<>("GRN Number Already Exists", HttpStatus.OK);
                else
                    return new ResponseEntity<>("grnNumber does not exists", HttpStatus.OK);
            case 14:
                param.put("QuotationNumber", validationModel.getName());
                param.put(JSON_KEY_DELETE_FLAG, false);
                List<PoQuatation> poQuatationList3 = poQuatationService.findByAttributes(param);
                if (poQuatationList3 != null && !poQuatationList3.isEmpty())
                    return new ResponseEntity<>("Quotation Number Already Exists", HttpStatus.OK);
                else
                    return new ResponseEntity<>("QuotationNumber does not exists", HttpStatus.OK);
            case 18:
                param.put("expenseNumber", validationModel.getName());
                param.put(JSON_KEY_DELETE_FLAG, false);
                List<Expense> espenseList = expenseService.findByAttributes(param);
                if (espenseList != null && !espenseList.isEmpty())
                    return new ResponseEntity<>("Expense Number Already Exists", HttpStatus.OK);
                else
                    return new ResponseEntity<>("Expense Number does not exists", HttpStatus.OK);
            case 20:
                param.put("journlReferencenNo", validationModel.getName());
                param.put(JSON_KEY_DELETE_FLAG, false);
                List<Journal> journalList = journalService.findByAttributes(param);
                if (journalList != null && !journalList.isEmpty())
                    return new ResponseEntity<>("Journal Reference Number Already Exists", HttpStatus.OK);
                else
                    return new ResponseEntity<>("Journal Reference Number does not exists", HttpStatus.OK);
            case 28:
                List<CreditNote> creditNoteList = creditNoteRepository.findAllByCreditNoteNumber(validationModel.getName());
                if (creditNoteList != null && !creditNoteList.isEmpty())
                    return new ResponseEntity<>("Credit Note Number Already Exists", HttpStatus.OK);
                else
                    return new ResponseEntity<>("Credit Note Number does not exists", HttpStatus.OK);
            default:
                return new ResponseEntity<>("Bad request", HttpStatus.BAD_REQUEST);
        }
    }

    private ResponseEntity<String> validateUserRole(ValidationModel validationModel) {
        Map<String, Object> param = new HashMap<>();
        if (validationModel.getModuleType() == 8) {
            param.put("roleName", validationModel.getName());
            param.put(JSON_KEY_DELETE_FLAG, false);
            List<Role> rolelist = roleService.findByAttributes(param);
            if (rolelist != null && !rolelist.isEmpty())
                return new ResponseEntity<>("Role Name Already Exists", HttpStatus.OK);
            else
                return new ResponseEntity<>("Role name does not exists", HttpStatus.OK);
        } else {
            param.put("userEmail", validationModel.getName());
            param.put(JSON_KEY_DELETE_FLAG, false);
            List<User> userList = userService.findByAttributes(param);
            if (userList != null && !userList.isEmpty())
                return new ResponseEntity<>("User Already Exists", HttpStatus.OK);
            else
                return new ResponseEntity<>("User does not exists", HttpStatus.OK);
        }
    }

    private ResponseEntity<String> validateHR(ValidationModel validationModel) {
        Map<String, Object> param = new HashMap<>();
        switch (validationModel.getModuleType()) {
            case 15:
                param.put("employeeCode", validationModel.getName());
                param.put(JSON_KEY_DELETE_FLAG, false);
                List<Employment> employeeList = employmentService.findByAttributes(param);
                if (employeeList != null && !employeeList.isEmpty())
                    return new ResponseEntity<>("Employee Code Already Exists", HttpStatus.OK);
                else
                    return new ResponseEntity<>("employeeCode does not exists", HttpStatus.OK);
            case 23:
                param.put("labourCard", validationModel.getName());
                param.put(JSON_KEY_DELETE_FLAG, false);
                List<Employment> employeelabourCardList = employmentService.findByAttributes(param);
                if (employeelabourCardList != null && !employeelabourCardList.isEmpty())
                    return new ResponseEntity<>("Labour Card Id Already Exists", HttpStatus.OK);
                else
                    return new ResponseEntity<>("Labour Card Id Does Not Exists", HttpStatus.OK);
            case 24:
                param.put(JSON_KEY_EMAIL, validationModel.getName());
                param.put(JSON_KEY_DELETE_FLAG, false);
                List<Employee> employees = employeeService.findByAttributes(param);
                if (employees != null && !employees.isEmpty())
                    return new ResponseEntity<>("Employee email already exists", HttpStatus.OK);
                else
                    return new ResponseEntity<>("Employee email does not exists", HttpStatus.OK);
            case 25:
                if (validationModel.getName() != null && !validationModel.getName().isEmpty()) {
                    try {
                        param.put("designationId", Integer.parseInt(validationModel.getName()));
                    } catch (NumberFormatException e) {
                        return new ResponseEntity<>("Invalid designation ID", HttpStatus.OK);
                    }
                    param.put(JSON_KEY_DELETE_FLAG, false);
                    List<EmployeeDesignation> employeeDesignations = employeeDesignationService.findByAttributes(param);
                    if (employeeDesignations != null && !employeeDesignations.isEmpty())
                        return new ResponseEntity<>("Designation ID already exists", HttpStatus.OK);
                    else
                        return new ResponseEntity<>("Designation ID does not exists", HttpStatus.OK);
                }
                break;
            case 26:
                if (validationModel.getName() != null && !validationModel.getName().isEmpty()) {
                    param.put("designationName", (validationModel.getName()));
                    param.put(JSON_KEY_DELETE_FLAG, false);
                    List<EmployeeDesignation> employeeDesignations = employeeDesignationNameService.findByAttributes(param);
                    if (employeeDesignations != null && !employeeDesignations.isEmpty())
                        return new ResponseEntity<>("Designation name already exists", HttpStatus.OK);
                    else
                        return new ResponseEntity<>("Designation name does not exists", HttpStatus.OK);
                }
                break;
            case 27:
                List<Payroll> payrolls = payrollRepository.findAll();
                if (payrolls != null && !payrolls.isEmpty())
                    payrolls = payrolls.stream().filter(payroll -> payroll.getPayrollSubject().equals(validationModel.getName()))
                            .filter(payroll -> payroll.getDeleteFlag().equals(Boolean.FALSE)).collect(Collectors.toList());
                if (payrolls != null && !payrolls.isEmpty())
                    return new ResponseEntity<>("Payroll Subject already exists", HttpStatus.OK);
                else
                    return new ResponseEntity<>("Payroll Subject does not exists", HttpStatus.OK);
            case 29:
                param.put("description", validationModel.getName());
                param.put(JSON_KEY_DELETE_FLAG, false);
                List<SalaryComponent> salaryComponentList = salaryComponentService.findByAttributes(param);
                if (salaryComponentList != null && !salaryComponentList.isEmpty())
                    return new ResponseEntity<>("Description Name Already Exists", HttpStatus.OK);
                else
                    return new ResponseEntity<>("Description name does not exists", HttpStatus.OK);
            case 30:
                param.put("componentCode", validationModel.getName());
                param.put(JSON_KEY_DELETE_FLAG, false);
                List<SalaryComponent> salaryComponentList1 = salaryComponentService.findByAttributes(param);
                if (salaryComponentList1 != null && !salaryComponentList1.isEmpty())
                    return new ResponseEntity<>("Component ID Already Exists", HttpStatus.OK);
                else
                    return new ResponseEntity<>("Component ID does not exists", HttpStatus.OK);
            default:
                return new ResponseEntity<>("Bad request", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>("Bad request", HttpStatus.BAD_REQUEST);
    }
}
