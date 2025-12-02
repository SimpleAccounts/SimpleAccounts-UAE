package com.simplevat.rest.validationcontroller;

import com.simplevat.aop.LogRequest;
import com.simplevat.entity.*;
import com.simplevat.entity.bankaccount.BankAccount;
import com.simplevat.entity.bankaccount.TransactionCategory;
import com.simplevat.repository.PayrollRepository;
import com.simplevat.repository.ProductRepository;
import com.simplevat.rest.creditnotecontroller.CreditNoteRepository;
import com.simplevat.rest.payroll.PayrollService;
import com.simplevat.rest.payroll.service.SalaryComponentService;
import com.simplevat.rfq_po.PoQuatation;
import com.simplevat.rfq_po.PoQuatationService;
import com.simplevat.service.*;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.springframework.util.StringUtils.isEmpty;

@Component
@RequestMapping("/rest/validation")
public class ValidationController {

    @Autowired
    private ProductService productService;

    @Autowired
    private SalaryComponentService salaryComponentService;

    @Autowired
    private VatCategoryService vatCategoryService;

    @Autowired
    private ContactService contactService;

    @Autowired
    private TransactionCategoryService transactionCategoryService;

    @Autowired
    private BankAccountService bankAccountService;

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private RoleService roleService;

    @Autowired
    private UserService userService;

    @Autowired
    private CurrencyExchangeService currencyExchangeService;

    @Autowired
    private PoQuatationService poQuatationService;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private EmployeeDesignationService employeeDesignationService;

    @Autowired
    private EmployeeDesignationService employeeDesignationNameService;

    @Autowired
    private EmploymentService employmentService;
    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private EmployeeBankDetailsService employeeBankDetailsService;

    @Autowired
    private JournalService journalService;

    @Autowired
    private PayrollRepository payrollRepository;
    @Autowired
    private CreditNoteRepository creditNoteRepository;
    @Autowired
    private ProductRepository productRepository;
    @LogRequest
    @ApiOperation(value = "Validate entries before adding to the system")
    @GetMapping(value = "/validate")
    public ResponseEntity<String> validate(@ModelAttribute ValidationModel validationModel, HttpServletRequest request) {
        if(validationModel.getModuleType()!=null)
        {
            switch(validationModel.getModuleType())
            {
                case 1: //Product validation
                    List<Product> productList = productRepository.findByProductNameAndDeleteFlagIgnoreCase(validationModel.getName(), false);
                    if(productList!= null && productList.size()>0)
                        return new ResponseEntity<>("Product Name Already Exists", HttpStatus.OK);
                    else
                        return new ResponseEntity<>("Product name does not exists", HttpStatus.OK);
                case 2: //Vat validation
                    Map<String, Object> param = new HashMap<>();
                    param = new HashMap<>();
                    param.put("name", validationModel.getName());
                    param.put("deleteFlag", false);
                    List<VatCategory> vatList = vatCategoryService.findByAttributes(param);
                    if(vatList!= null && vatList.size()>0)
                        return new ResponseEntity<>("Vat name already exists", HttpStatus.OK);
                    else
                        return new ResponseEntity<>("Vat name does not exists", HttpStatus.OK);
                case 3: //Contact Validation
                    param = new HashMap<>();
                    param.put("email", validationModel.getName());
                    param.put("deleteFlag", false);
                    List<Contact> list = contactService.findByAttributes(param);
                    if(list!= null && list.size()>0)
                        return new ResponseEntity<>("Contact email already exists", HttpStatus.OK);
                    else
                        return new ResponseEntity<>("Contact email does not exists", HttpStatus.OK);
                case 4:  //Chart of Account
                    param = new HashMap<>();
                    param.put("transactionCategoryName",validationModel.getName());
                    param.put("deleteFlag", false);
                    List<TransactionCategory> transactionCategoryList = transactionCategoryService.findByAttributes(param);
                    if(transactionCategoryList!= null && transactionCategoryList.size()>0)
                        return new ResponseEntity<>("Chart Of Account already exists", HttpStatus.OK);
                    else
                        return new ResponseEntity<>("Chart Of Account does not exists", HttpStatus.OK);
                case 5://bank
                    param = new HashMap<>();
                    param.put("accountNumber",validationModel.getName());
                    param.put("deleteFlag", false);
                    List<BankAccount> bankAccountList = bankAccountService.findByAttributes(param);
                    if(bankAccountList!= null && bankAccountList.size()>0 ){
                            return new ResponseEntity<>("Bank Account Already Exists", HttpStatus.OK);
                         }
                    else
                            return new ResponseEntity<>("Bank Account does not exists", HttpStatus.OK);
                case 6:
                    param = new HashMap<>();
                    param.put("referenceNumber",validationModel.getName());
                    param.put("deleteFlag", false);
                    List<Invoice> invoiceList = invoiceService.findByAttributes(param);
                    if(invoiceList!= null && invoiceList.size()>0)
                        return new ResponseEntity<>("Invoice Number Already Exists", HttpStatus.OK);
                    else
                        return new ResponseEntity<>("Invoice Number does not exists", HttpStatus.OK);
                case 7: //Product validation
                    Map<String, Object> param1 = new HashMap<>();
                    param1.put("productCode",validationModel.getProductCode());
                    param1.put("deleteFlag", false);
                    List<Product> productList1 = productService.findByAttributes(param1);
                    if(productList1!= null && productList1.size()>0)
                        return new ResponseEntity<>("Product Code Already Exists", HttpStatus.OK);
                    else
                        return new ResponseEntity<>("Product code does not exists", HttpStatus.OK);
                case 8: //Role
                    param = new HashMap<>();
                    param.put("roleName",validationModel.getName());
                    param.put("deleteFlag", false);
                    List<Role> rolelist = roleService.findByAttributes(param);
                    if(rolelist!= null && rolelist.size()>0)
                        return new ResponseEntity<>("Role Name Already Exists", HttpStatus.OK);
                    else
                        return new ResponseEntity<>("Role name does not exists", HttpStatus.OK);
                case 9: //user
                    param = new HashMap<>();
                    param.put("userEmail",validationModel.getName());
                    param.put("deleteFlag", false);
                    List<User> userList = userService.findByAttributes(param);
                    if(userList!= null && userList.size()>0)
                        return new ResponseEntity<>("User Already Exists", HttpStatus.OK);
                    else
                        return new ResponseEntity<>("User does not exists", HttpStatus.OK);
                case 10: //Currency Exchange
                    param = new HashMap<>();
                    param.put("currencyCode",validationModel.getCurrencyCode());
                    param.put("deleteFlag", false);
                    List<CurrencyConversion> currencyConversions = currencyExchangeService.findByAttributes(param);
                    if(currencyConversions!= null && currencyConversions.size()>0)
                        return new ResponseEntity<>("Currency Conversions Already Exists", HttpStatus.OK);
                    else
                        return new ResponseEntity<>("Currency Conversions does not exists", HttpStatus.OK);
                case 11: //RFQ
                    param = new HashMap<>();
                    param.put("rfqNumber",validationModel.getName());
                    param.put("deleteFlag", false);
                    List<PoQuatation> poQuatationList = poQuatationService.findByAttributes(param);
                    if(poQuatationList!= null && poQuatationList.size()>0)
                        return new ResponseEntity<>("RFQ Number Already Exists", HttpStatus.OK);
                    else
                        return new ResponseEntity<>("rfqNumber does not exists", HttpStatus.OK);
                case 12: //Po
                    param = new HashMap<>();
                    param.put("poNumber",validationModel.getName());
                    param.put("deleteFlag", false);
                    List<PoQuatation> poQuatationList1 = poQuatationService.findByAttributes(param);
                    if(poQuatationList1!= null && poQuatationList1.size()>0)
                        return new ResponseEntity<>("Po Number Already Exists", HttpStatus.OK);
                    else
                        return new ResponseEntity<>("poNumber does not exists", HttpStatus.OK);
                case 13: //GRN
                    param = new HashMap<>();
                    param.put("grnNumber",validationModel.getName());
                    param.put("deleteFlag", false);
                    List<PoQuatation> poQuatationList2 = poQuatationService.findByAttributes(param);
                    if(poQuatationList2!= null && poQuatationList2.size()>0)
                        return new ResponseEntity<>("GRN Number Already Exists", HttpStatus.OK);
                    else
                        return new ResponseEntity<>("grnNumber does not exists", HttpStatus.OK);
                case 14: //Quotation
                    param = new HashMap<>();
                    param.put("QuotationNumber",validationModel.getName());
                    param.put("deleteFlag", false);
                    List<PoQuatation> poQuatationList3 = poQuatationService.findByAttributes(param);
                    if(poQuatationList3!= null && poQuatationList3.size()>0)
                        return new ResponseEntity<>("Quotation Number Already Exists", HttpStatus.OK);
                    else
                        return new ResponseEntity<>("QuotationNumber does not exists", HttpStatus.OK);
                case 15: //EmployeeCode
                    param = new HashMap<>();
                    param.put("employeeCode",validationModel.getName());
                    param.put("deleteFlag", false);
                    List<Employment> employeeList = employmentService.findByAttributes(param);
                    if(employeeList!= null && employeeList.size()>0)
                        return new ResponseEntity<>("Employee Code Already Exists", HttpStatus.OK);
                    else
                        return new ResponseEntity<>("employeeCode does not exists", HttpStatus.OK);
                case 16: //COA Name
                    param = new HashMap<>();
                    param.put("transactionCategoryName",validationModel.getName());
                    param.put("deleteFlag", false);
                    List<TransactionCategory> coaList = transactionCategoryService.findByAttributes(param);
                    if(coaList!= null && coaList.size()>0)
                        return new ResponseEntity<>("Transaction Category Name Already Exists", HttpStatus.OK);
                    else
                        return new ResponseEntity<>("transaction Category Name does not exists", HttpStatus.OK);
                case 17://update-bank
                    param = new HashMap<>();
                    param.put("accountNumber",validationModel.getName());
                    param.put("deleteFlag", false);
                    List<BankAccount> bankAccountList1 = bankAccountService.findByAttributes(param);
                    if(bankAccountList1!= null && bankAccountList1.size()>0 ){
                        if( validationModel.getCheckId()!=bankAccountList1.get(0).getBankAccountId()){
                            return new ResponseEntity<>("Bank Account Already Exists", HttpStatus.OK);
                        }
                        else
                            return new ResponseEntity<>("Bank Account does not exists", HttpStatus.OK);
                    }
                    else
                        return new ResponseEntity<>("Bank Account does not exists", HttpStatus.OK);
                case 18: //ExpenseNumber
                    param = new HashMap<>();
                    param.put("expenseNumber",validationModel.getName());
                    param.put("deleteFlag", false);
                    List<Expense> espenseList = expenseService.findByAttributes(param);
                    if(espenseList!= null && espenseList.size()>0)
                        return new ResponseEntity<>("Expense Number Already Exists", HttpStatus.OK);
                    else
                        return new ResponseEntity<>("Expense Number does not exists", HttpStatus.OK);
                case 19: //AccountNumber
                    param = new HashMap<>();
                    param.put("accountNumber",validationModel.getName());
                    param.put("deleteFlag", false);
                    List<EmployeeBankDetails> employeeBankDetailsList = employeeBankDetailsService.findByAttributes(param);
                    if(employeeBankDetailsList!= null && employeeBankDetailsList.size()>0)
                        return new ResponseEntity<>("Account Number Already Exists", HttpStatus.OK);
                    else
                        return new ResponseEntity<>("accountNumber does not exists", HttpStatus.OK);
                case 20: //Journal Reference
                    param = new HashMap<>();
                        param.put("journlReferencenNo",validationModel.getName());
                    param.put("deleteFlag", false);
                    List<Journal> journalList = journalService.findByAttributes(param);
                    if(journalList!= null && journalList.size()>0)
                        return new ResponseEntity<>("Journal Reference Number Already Exists", HttpStatus.OK);
                    else
                        return new ResponseEntity<>("Journal Reference Number does not exists", HttpStatus.OK);

                case 21: //Tax Reg Number Check For Contact
                    param = new HashMap<>();
                    param.put("vatRegistrationNumber",validationModel.getName());
                    param.put("deleteFlag", false);
                    List<Contact> contactList = contactService.findByAttributes(param);
                    if(contactList!= null && contactList.size()>0)
                        return new ResponseEntity<>("Tax Registration Number Already Exists", HttpStatus.OK);
                    else
                        return new ResponseEntity<>("Tax Registration Number does not exists", HttpStatus.OK);

                case 22: //email Check For Contact
                    param = new HashMap<>();
                    param.put("email",validationModel.getName());
                    param.put("deleteFlag", false);
                    List<Contact> contactList1 = contactService.findByAttributes(param);
                    if(contactList1!= null && contactList1.size()>0)
                        return new ResponseEntity<>("Email Already Exists", HttpStatus.OK);
                    else
                        return new ResponseEntity<>("Email does not exists", HttpStatus.OK);
                case 23: //Labor card Id ( Employee )
                    param = new HashMap<>();
                    param.put("labourCard",validationModel.getName());
                    param.put("deleteFlag", false);
                    List<Employment> employeelabourCardList = employmentService.findByAttributes(param);
                    if(employeelabourCardList!= null && employeelabourCardList.size()>0)
                        return new ResponseEntity<>("Labour Card Id Already Exists", HttpStatus.OK);
                    else
                        return new ResponseEntity<>("Labour Card Id Does Not Exists", HttpStatus.OK);
                case 24: //Employee email validation
                    param = new HashMap<>();
                    param.put("email", validationModel.getName());
                    param.put("deleteFlag", false);
                    List<Employee> employees = employeeService.findByAttributes(param);
                    if(employees!= null && employees.size()>0)
                        return new ResponseEntity<>("Employee email already exists", HttpStatus.OK);
                    else
                        return new ResponseEntity<>("Employee email does not exists", HttpStatus.OK);
                case 25: //Designation ID validation
                    param = new HashMap<>();
                    if(validationModel.getName()!=null && !validationModel.getName().isEmpty()) {
                        param.put("designationId", Integer.parseInt(validationModel.getName()));
                        param.put("deleteFlag", false);
                        List<EmployeeDesignation> employeeDesignations = employeeDesignationService.findByAttributes(param);
                        if (employeeDesignations != null && employeeDesignations.size() > 0)
                            return new ResponseEntity<>("Designation ID already exists", HttpStatus.OK);
                        else
                            return new ResponseEntity<>("Designation ID does not exists", HttpStatus.OK);
                    }
                case 26: //Designation name validation
                    param = new HashMap<>();
                    if(validationModel.getName()!=null && !validationModel.getName().isEmpty()) {
                        param.put("designationName", (validationModel.getName()));
                        param.put("deleteFlag", false);
                        List<EmployeeDesignation> employeeDesignations = employeeDesignationNameService.findByAttributes(param);
                        if (employeeDesignations != null && employeeDesignations.size() > 0)
                            return new ResponseEntity<>("Designation name already exists", HttpStatus.OK);
                        else
                            return new ResponseEntity<>("Designation name does not exists", HttpStatus.OK);
                    }
                case 27: //Payroll subject
                    List<Payroll> payrolls = payrollRepository.findAll();
                    if (payrolls!=null && payrolls.size()>0)
                        payrolls = payrolls.stream().filter(payroll -> payroll.getPayrollSubject().equals(validationModel.getName()))
                                .filter(payroll -> payroll.getDeleteFlag().equals(Boolean.FALSE)).collect(Collectors.toList());
                    if(payrolls!= null && payrolls.size()>0)
                        return new ResponseEntity<>("Payroll Subject already exists", HttpStatus.OK);
                    else
                        return new ResponseEntity<>("Payroll Subject does not exists", HttpStatus.OK);
                case 28://TCN number
                    List<CreditNote> creditNoteList = creditNoteRepository.findAllByCreditNoteNumber(validationModel.getName());
                    if(creditNoteList!= null && creditNoteList.size()>0)
                        return new ResponseEntity<>("Credit Note Number Already Exists", HttpStatus.OK);
                    else
                        return new ResponseEntity<>("Credit Note Number does not exists", HttpStatus.OK);
                case 29: //Salary Component name
                     param = new HashMap<>();
                    param.put("description", validationModel.getName());
                    param.put("deleteFlag", false);
                    List<SalaryComponent> salaryComponentList = salaryComponentService.findByAttributes(param);
                    if(salaryComponentList!= null && salaryComponentList.size()>0)
                        return new ResponseEntity<>("Description Name Already Exists", HttpStatus.OK);
                    else
                        return new ResponseEntity<>("Description name does not exists", HttpStatus.OK);
                case 30: //Salary Component code
                    param = new HashMap<>();
                    param.put("componentCode", validationModel.getName());
                    param.put("deleteFlag", false);
                    List<SalaryComponent> salaryComponentList1 = salaryComponentService.findByAttributes(param);
                    if(salaryComponentList1!= null && salaryComponentList1.size()>0)
                        return new ResponseEntity<>("Component ID Already Exists", HttpStatus.OK);
                    else
                        return new ResponseEntity<>("Component ID does not exists", HttpStatus.OK);
                default:
                    return new ResponseEntity<>("Bad request", HttpStatus.BAD_REQUEST);
            }
        }
        return new ResponseEntity<>("Bad request", HttpStatus.BAD_REQUEST);
    }
}
