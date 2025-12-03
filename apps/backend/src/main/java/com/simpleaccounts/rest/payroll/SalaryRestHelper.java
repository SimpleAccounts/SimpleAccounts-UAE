package com.simpleaccounts.rest.payroll;

import com.simpleaccounts.constant.CommonColumnConstants;
import com.simpleaccounts.constant.DefaultTypeConstant;
import com.simpleaccounts.constant.EmailConstant;
import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.model.SalaryPersistModel;
import com.simpleaccounts.rest.employeecontroller.EmployeeController;
import com.simpleaccounts.rest.employeecontroller.EmployeeListModel;
import com.simpleaccounts.rest.payroll.model.MoneyPaidToUserModel;
import com.simpleaccounts.rest.payroll.service.EmployeeSalaryComponentRelationService;
import com.simpleaccounts.rest.payroll.service.Impl.SalaryServiceImpl;
import com.simpleaccounts.rest.payroll.service.SalaryComponentService;
import com.simpleaccounts.rest.payroll.service.SalaryService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.*;
import com.simpleaccounts.service.bankaccount.ChartOfAccountService;
import com.simpleaccounts.utils.DateFormatUtil;
import com.simpleaccounts.utils.EmailSender;
import com.simpleaccounts.utils.MailUtility;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.servlet.http.HttpServletRequest;
import javax.xml.bind.DatatypeConverter;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.simpleaccounts.rest.invoicecontroller.HtmlTemplateConstants.PAYSLIP_MAIL_TEMPLATE;
import static com.simpleaccounts.rest.invoicecontroller.HtmlTemplateConstants.PAYSLIP_TEMPLATE;

@Component
public class SalaryRestHelper {
    private final Logger logger = LoggerFactory.getLogger(SalaryRestHelper.class);
    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private JournalService journalService;

    @Autowired
    private UserService userService;

    @Autowired
    private SalaryService salaryService;

    @Autowired
    private DateFormatUtil dateFormatUtil;

    @Autowired
    private ChartOfAccountService chartOfAccountService;

    @Autowired
    private TransactionCategoryService transactionCategoryService;

    @Autowired
    CoacTransactionCategoryService coacTransactionCategoryService;

    @Autowired
    BankAccountService bankAccountService;

    @Autowired
    EmployeeTransactioncategoryService employeeTransactioncategoryService ;

    @Autowired
    JournalLineItemService journalLineItemService;

    @Autowired
    EmployeeSalaryComponentRelationService employeeSalaryComponentRelationService;
    @Autowired
    ResourceLoader resourceLoader;
    @Autowired
    EmailSender emailSender;
    @Autowired
    EmaiLogsService emaiLogsService;
    @Autowired
    MailUtility mailUtility;
    @Autowired
    EmployeeController employeeController;
    @Autowired
    SalaryServiceImpl salaryServiceImpl;

    @Transactional(rollbackFor = Exception.class)
    public String generateSalary(SalaryPersistModel salaryPersistModel ,  HttpServletRequest request) {

        Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
        User user = userService.findByPK(userId);

        Map<String, Object> CategoryParam = new HashMap<>();
        CategoryParam.put("transactionCategoryName","Payroll Liability");
        List<TransactionCategory> payrollTransactionCategoryList = transactionCategoryService.findByAttributes(CategoryParam);

        if (payrollTransactionCategoryList != null && !payrollTransactionCategoryList.isEmpty()) {


            List<Integer> employeeListId = salaryPersistModel.getEmployeeListIds();
            //Traverse list get employee id
//        BigDecimal grossSalary = BigDecimal.ZERO;
            BigDecimal totalSalaryForSingleDay = BigDecimal.valueOf(Float.valueOf(0));
            BigDecimal salaryForjournalEntry = BigDecimal.ZERO;
            for (Integer employeeId : employeeListId) {
                Employee employee = employeeService.findByPK(employeeId);
//            Map<String, Object> param1 = new HashMap<>();
//            param1.put("employee", employee);
//            List<Employment> employmentList = employmentService.findByAttributes(param1);
                // get emplyee deatils from id (gross . sal role id )
//            for (Employment employment1 : employmentList) {
//                grossSalary = employment1.getGrossSalary();
//            }
//            SalaryRole salaryRoleId = employee.getSalaryRoleId();
                // Get No.of days from leave management and provide empid and month - By default get it from API
                // Get salary template components from salary template
                BigDecimal totSalaryForEmployeePerMonth = BigDecimal.ZERO;
                Map<String, Object> param = new HashMap<>();
                param.put("employeeId", employee);
                List<EmployeeSalaryComponentRelation> employeeSalaryComponentList = employeeSalaryComponentRelationService.findByAttributes(param);
                BigDecimal noOfDays = BigDecimal.valueOf(0);
                //Traverse salary template component list and for each component calculate salary for number of days
                for (EmployeeSalaryComponentRelation salaryComponent : employeeSalaryComponentList) {
                    //totalSalary = grossSalary.multiply(formula2);
                    //totalSalary = totalSalary.divide(BigDecimal.valueOf(30),2, RoundingMode.HALF_UP);
                    //a.divide(b, 2, RoundingMode.HALF_UP)
                    //totalSalary = totalSalary.multiply(BigDecimal.valueOf(salaryPersistModel.getNoOfDays()));
                    // Now create Salary for each component based on calculations , and then persist the salary object
//                totalSalaryForSingleDay = totalSalaryForSingleDay.divide(BigDecimal.valueOf(30),2, RoundingMode.HALF_UP);
//                if (salaryComponent.getFormula()!=null && ! salaryComponent.getFormula().isEmpty()) {
//                    Double formula = Double.parseDouble(salaryComponent.getFormula());
//                    formula = formula / 100;
//                    BigDecimal formula2 = BigDecimal.valueOf(formula);
//                    totalSalaryForSingleDay = totalSalaryForSingleDay.add(grossSalary.multiply(formula2));
//                }
//                else {
//                    totalSalaryForSingleDay = totalSalaryForSingleDay.add(BigDecimal.valueOf(Integer.parseInt(salaryComponent.getFlatAmount())));
//                }
                    noOfDays = salaryComponent.getNoOfDays();
                    BigDecimal totalSalaryPerMonth = salaryComponent.getMonthlyAmount();
                    totalSalaryForSingleDay = totalSalaryPerMonth.divide(salaryComponent.getNoOfDays());
                    BigDecimal salaryAsPerNoOfWorkingDays = totalSalaryForSingleDay.multiply(salaryComponent.getNoOfDays());

                    Salary salary = new Salary();
                    salary.setCreatedBy(user.getUserId());
                    salary.setCreatedDate(LocalDateTime.now());
                    salary.setEmployeeId(employee);
                    salary.setSalaryComponent(salaryComponent.getSalaryComponentId());
                    salary.setType(0);
                    salary.setNoOfDays(salaryComponent.getNoOfDays());
                    salary.setSalaryDate(dateFormatUtil.getDateStrAsLocalDateTime(salaryPersistModel.getSalaryDate(), "dd/MM/yyyy"));
                    salary.setTotalAmount(salaryAsPerNoOfWorkingDays);
                    salaryService.persist(salary);
                    if (salaryComponent.getSalaryStructure().getId()==PayrollEnumConstants.Deduction
                            .getId()){
                      //  salaryForjournalEntry = salaryForjournalEntry.subtract(BigDecimal.valueOf(totalSalaryForSingleDay * salaryComponent.getNoOfDays()));
                    }
                    else {
                        salaryForjournalEntry = salaryForjournalEntry.add(salaryAsPerNoOfWorkingDays);
                    }

                    EmployeeSalaryComponentRelation defaultEmployeeSalaryComponentRelation = employeeSalaryComponentRelationService.findByPK(salaryComponent.getId());
                    defaultEmployeeSalaryComponentRelation.setNoOfDays(BigDecimal.valueOf(30));
                    defaultEmployeeSalaryComponentRelation.setMonthlyAmount(totalSalaryForSingleDay.multiply(BigDecimal.valueOf(30)));
                    defaultEmployeeSalaryComponentRelation.setYearlyAmount(totalSalaryForSingleDay.multiply(BigDecimal.valueOf(30)).multiply(BigDecimal.valueOf(12)));
                    employeeSalaryComponentRelationService.update(defaultEmployeeSalaryComponentRelation);

                }

                Salary salary = new Salary();
                salary.setCreatedBy(user.getUserId());
                salary.setCreatedDate(LocalDateTime.now());
                salary.setEmployeeId(employee);
                salary.setNoOfDays(noOfDays);
                salary.setType(1);
                salary.setSalaryDate(dateFormatUtil.getDateStrAsLocalDateTime(salaryPersistModel.getSalaryDate(), "dd/MM/yyyy"));
                salary.setTotalAmount(salaryForjournalEntry);
                salaryService.persist(salary);

                List<JournalLineItem> journalLineItemList = new ArrayList<>();
                Journal journal = new Journal();
                JournalLineItem journalLineItem1 = new JournalLineItem();
                journalLineItem1.setTransactionCategory(payrollTransactionCategoryList.get(0));
                journalLineItem1.setCreditAmount(salaryForjournalEntry);
                journalLineItem1.setReferenceType(PostingReferenceTypeEnum.PAYROLL_APPROVED);
                journalLineItem1.setCreatedBy(userId);
                journalLineItem1.setJournal(journal);
                journalLineItem1.setReferenceId(employee.getId());
                journalLineItemList.add(journalLineItem1);
                Map<String, Object> employeeCategoryParam = new HashMap<>();
                employeeCategoryParam.put("employee", employee.getId());
                List<EmployeeTransactionCategoryRelation> employeeTransactionCategoryList = employeeTransactioncategoryService.findByAttributes(employeeCategoryParam);
                TransactionCategory transactionCategoryForSalaryWages = employeeTransactionCategoryList.get(1).getTransactionCategory();
                JournalLineItem journalLineItem2 = new JournalLineItem();
                journalLineItem2.setTransactionCategory(transactionCategoryForSalaryWages);
                journalLineItem2.setDebitAmount(salaryForjournalEntry);
                journalLineItem2.setReferenceType(PostingReferenceTypeEnum.PAYROLL_APPROVED);
                journalLineItem2.setCreatedBy(userId);
                journalLineItem2.setJournal(journal);
                journalLineItem2.setReferenceId(employee.getId());
                journalLineItemList.add(journalLineItem2);
                journal.setJournalLineItems(journalLineItemList);
                journal.setCreatedBy(userId);
                journal.setPostingReferenceType(PostingReferenceTypeEnum.PAYROLL_APPROVED);
                journal.setJournalDate(LocalDate.now());
                journal.setTransactionDate(LocalDateTime.now().toLocalDate());
                journalService.persist(journal);


            }
        }



        else {


            TransactionCategory finalPayrolltransactionCategory = new TransactionCategory();
            finalPayrolltransactionCategory.setChartOfAccount(chartOfAccountService.findByPK(13));
            finalPayrolltransactionCategory.setSelectableFlag(Boolean.FALSE);
            finalPayrolltransactionCategory.setTransactionCategoryCode("02-02-016");
            finalPayrolltransactionCategory.setTransactionCategoryName("Payroll Liability");
            finalPayrolltransactionCategory.setTransactionCategoryDescription("Other Liability");
            //ParentTransactionCategory null
            finalPayrolltransactionCategory.setCreatedDate(LocalDateTime.now());
            finalPayrolltransactionCategory.setCreatedBy(userId);
            finalPayrolltransactionCategory.setEditableFlag(false);
            finalPayrolltransactionCategory.setSelectableFlag(true);
            finalPayrolltransactionCategory.setDefaltFlag(DefaultTypeConstant.NO);
            finalPayrolltransactionCategory.setVersionNumber(1);
            transactionCategoryService.persist(finalPayrolltransactionCategory);
            CoacTransactionCategory coacTransactionCategoryRelation = new CoacTransactionCategory();
            coacTransactionCategoryService.addCoacTransactionCategory(finalPayrolltransactionCategory.getChartOfAccount(),finalPayrolltransactionCategory);




            Map<String, Object> payrollCategoryParam = new HashMap<>();
            payrollCategoryParam.put("transactionCategoryName","Payroll Liability");
            List<TransactionCategory> payrollList = transactionCategoryService.findByAttributes(payrollCategoryParam);


            List<Integer> employeeListId = salaryPersistModel.getEmployeeListIds();
            //Traverse list get employee id
//        BigDecimal grossSalary = BigDecimal.ZERO;
            BigDecimal totalSalaryForSingleDay = BigDecimal.valueOf(Float.valueOf(0));
            BigDecimal salaryForjournalEntry = BigDecimal.ZERO;
            for (Integer employeeId : employeeListId) {
                Employee employee = employeeService.findByPK(employeeId);
//            Map<String, Object> param1 = new HashMap<>();
//            param1.put("employee", employee);
//            List<Employment> employmentList = employmentService.findByAttributes(param1);
                // get emplyee deatils from id (gross . sal role id )
//            for (Employment employment1 : employmentList) {
//                grossSalary = employment1.getGrossSalary();
//            }
//            SalaryRole salaryRoleId = employee.getSalaryRoleId();
                // Get No.of days from leave management and provide empid and month - By default get it from API
                // Get salary template components from salary template

                Map<String, Object> param = new HashMap<>();
                param.put("employeeId", employee);
                List<EmployeeSalaryComponentRelation> employeeSalaryComponentList = employeeSalaryComponentRelationService.findByAttributes(param);
                BigDecimal noOfDays = BigDecimal.valueOf(0);
                //Traverse salary template component list and for each component calculate salary for number of days
                for (EmployeeSalaryComponentRelation salaryComponent : employeeSalaryComponentList) {
                    //totalSalary = grossSalary.multiply(formula2);
                    //totalSalary = totalSalary.divide(BigDecimal.valueOf(30),2, RoundingMode.HALF_UP);
                    //a.divide(b, 2, RoundingMode.HALF_UP)
                    //totalSalary = totalSalary.multiply(BigDecimal.valueOf(salaryPersistModel.getNoOfDays()));
                    // Now create Salary for each component based on calculations , and then persist the salary object
//                totalSalaryForSingleDay = totalSalaryForSingleDay.divide(BigDecimal.valueOf(30),2, RoundingMode.HALF_UP);
//                if (salaryComponent.getFormula()!=null && ! salaryComponent.getFormula().isEmpty()) {
//                    Double formula = Double.parseDouble(salaryComponent.getFormula());
//                    formula = formula / 100;
//                    BigDecimal formula2 = BigDecimal.valueOf(formula);
//                    totalSalaryForSingleDay = totalSalaryForSingleDay.add(grossSalary.multiply(formula2));
//                }
//                else {
//                    totalSalaryForSingleDay = totalSalaryForSingleDay.add(BigDecimal.valueOf(Integer.parseInt(salaryComponent.getFlatAmount())));
//                }
                    noOfDays= salaryComponent.getNoOfDays();
                    BigDecimal totalSalaryPerMonth = salaryComponent.getMonthlyAmount();
                    totalSalaryForSingleDay = totalSalaryPerMonth.divide(salaryComponent.getNoOfDays());
                    BigDecimal salaryAsPerNoOfWorkingDays = totalSalaryForSingleDay.multiply(salaryComponent.getNoOfDays());

                    Salary salary = new Salary();
                    salary.setCreatedBy(user.getUserId());
                    salary.setCreatedDate(LocalDateTime.now());
                    salary.setSalaryComponent(salaryComponent.getSalaryComponentId());
                    salary.setEmployeeId(employee);
                    salary.setType(0);
                    salary.setNoOfDays(salaryComponent.getNoOfDays());
                    salary.setSalaryDate(dateFormatUtil.getDateStrAsLocalDateTime(salaryPersistModel.getSalaryDate(), "dd/MM/yyyy"));
                    salary.setTotalAmount(salaryAsPerNoOfWorkingDays);
                    salaryService.persist(salary);
                    if (salaryComponent.getSalaryStructure().getId()==PayrollEnumConstants.Deduction.getId()){
                        salaryForjournalEntry = salaryForjournalEntry.subtract(totalSalaryForSingleDay.multiply(salaryComponent.getNoOfDays()));
                    }
                    else {
                    salaryForjournalEntry = salaryForjournalEntry.add(salaryAsPerNoOfWorkingDays);
                    }
                    EmployeeSalaryComponentRelation defaultEmployeeSalaryComponentRelation = employeeSalaryComponentRelationService.findByPK(salaryComponent.getId());
                    defaultEmployeeSalaryComponentRelation.setNoOfDays(BigDecimal.valueOf(30));
                    defaultEmployeeSalaryComponentRelation.setMonthlyAmount(totalSalaryForSingleDay.multiply(BigDecimal.valueOf(30)));
                    defaultEmployeeSalaryComponentRelation.setYearlyAmount(totalSalaryForSingleDay.multiply(BigDecimal.valueOf(30)).multiply(BigDecimal.valueOf(12)));
                    employeeSalaryComponentRelationService.update(defaultEmployeeSalaryComponentRelation);
                }
                Salary salary = new Salary();
                salary.setCreatedBy(user.getUserId());
                salary.setCreatedDate(LocalDateTime.now());
                salary.setEmployeeId(employee);
                salary.setNoOfDays(noOfDays);
                salary.setType(1);
                salary.setSalaryDate(dateFormatUtil.getDateStrAsLocalDateTime(salaryPersistModel.getSalaryDate(), "dd/MM/yyyy"));
                salary.setTotalAmount(salaryForjournalEntry);
                salaryService.persist(salary);

                List<JournalLineItem> journalLineItemList = new ArrayList<>();
                Journal journal = new Journal();
                JournalLineItem journalLineItem1 = new JournalLineItem();
                journalLineItem1.setTransactionCategory(payrollList.get(0));
                journalLineItem1.setCreditAmount(salaryForjournalEntry);
                journalLineItem1.setReferenceType(PostingReferenceTypeEnum.PAYROLL_APPROVED);
                journalLineItem1.setCreatedBy(userId);
                journalLineItem1.setJournal(journal);
                journalLineItem1.setReferenceId(employee.getId());
                journalLineItemList.add(journalLineItem1);
                Map<String, Object> employeeCategoryParam = new HashMap<>();
                employeeCategoryParam.put("employee", employee.getId());
                List<EmployeeTransactionCategoryRelation> employeeTransactionCategoryList = employeeTransactioncategoryService.findByAttributes(employeeCategoryParam);
                TransactionCategory transactionCategoryForSalaryWages = employeeTransactionCategoryList.get(1).getTransactionCategory();
                JournalLineItem journalLineItem2 = new JournalLineItem();
                journalLineItem2.setTransactionCategory(transactionCategoryForSalaryWages);
                journalLineItem2.setDebitAmount(salaryForjournalEntry);
                journalLineItem2.setReferenceType(PostingReferenceTypeEnum.PAYROLL_APPROVED);
                journalLineItem2.setCreatedBy(userId);
                journalLineItem2.setJournal(journal);
                journalLineItem2.setReferenceId(employee.getId());
                journalLineItemList.add(journalLineItem2);
                journal.setJournalLineItems(journalLineItemList);
                journal.setCreatedBy(userId);
                journal.setPostingReferenceType(PostingReferenceTypeEnum.PAYROLL_APPROVED);
                journal.setJournalDate(LocalDate.now());
                journal.setTransactionDate(LocalDate.now());
                journalService.persist(journal);
            }
        }



            return "Salary generated successfully" ;
        }


    public SalaryListPerMonthResponseModel getSalaryPerMonthList(SalaryPerMonthRequestModel requestModel) {

        SalaryListPerMonthResponseModel salaryListPerMonthResponseModel = new SalaryListPerMonthResponseModel();

        return  salaryService.getSalaryPerMonthList(requestModel,salaryListPerMonthResponseModel);
    }

    public SalarySlipListtResponseModel getSalarySlipList(Integer employeeId) {

        SalarySlipListtResponseModel salarySlipListtResponseModel = new SalarySlipListtResponseModel();

        return  salaryService.getSalarySlipListt(employeeId,salarySlipListtResponseModel);

    }

    public IncompleteEmployeeResponseModel getIncompleteEmployeeList() {

        IncompleteEmployeeResponseModel incompleteEmployeeResponseModel = new IncompleteEmployeeResponseModel();
        return salaryService.getIncompleteEmployeeList(incompleteEmployeeResponseModel);
    }


    /**
     * Payslip Emails Method
     * this method will send payslip on employee E-mail
     * @param salarySlipModel
     * @param employeeId
     */
     void sendPayslipEmail(SalarySlipModel salarySlipModel, Integer employeeId,String startDate,String endDate,HttpServletRequest request) {
         Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
         User user = userService.findByPK(userId);
         Company company = null;
         if(user!=null) {
             company = user.getCompany();
         }
        Employee employee=employeeService.findByPK(employeeId);
        String image="";
        if (user.getCompany() != null  && user.getCompany().getCompanyLogo() != null) {
            image = " data:image/jpg;base64," + DatatypeConverter.printBase64Binary(
                    user.getCompany().getCompanyLogo()) ;
        }
        String htmlContent="";
         String pdfContent="";
        try {
            byte[] contentData = Files.readAllBytes(Paths.get(resourceLoader.getResource("classpath:"+PAYSLIP_MAIL_TEMPLATE).getURI()));
            byte[] pdfData = Files.readAllBytes(Paths.get(resourceLoader.getResource("classpath:"+PAYSLIP_TEMPLATE).getURI()));
            htmlContent= new String(contentData, StandardCharsets.UTF_8);
            pdfContent= new String(pdfData, StandardCharsets.UTF_8);
        } catch (IOException e) {
            e.printStackTrace();
        }
        ResponseEntity<EmployeeListModel> employeeListModel=employeeController.getEmployeeById(employeeId);

        String earningRows="";
        String deductionRows="";
        String transactionRows="";
        String sifEnabled ="";
         if(company.getGenerateSif()==Boolean.TRUE) {
             sifEnabled = "<td style=\"padding: 15px 15px 15px;\n" +
                     "border: 1px solid rgb(200, 206, 211);\">\n" +
                     "\n" +
                     "<b style=\"width: 50%;\n" +
                     "display: block;\n" +
                     "float: left;\">Bank Holder Name</b><b>:</b> {bankHolderName}<br /><br />\n" +
                     "\n" +
                     "<b style=\"width: 50%;\n" +
                     " display: block;\n" +
                     "float: left;\">Account Number</b><b>:</b> {accountNumber}<br /><br />\n" +
                     "\n" +
                     "<b style=\"width: 50%;\n" +
                     "display: block;\n" +
                     "float: left;\">Bank Name: </b>{bankName}<br /><br />\n" +
                     "\n" +
                     "<b style=\"width: 50%;\n" +
                     "display: block;\n" +
                     "float: left;\">Branch</b><b>:</b> {branch}<br /><br />\n" +
                     "\n" +
                     "<b style=\"width: 50%;\n" +
                     "display: block;\n" +
                     "float: left;\">IBAN</b><b>:</b> {iban}<br />\n" +
                     "\n" +
                     "</td> ";
         }
         List<MoneyPaidToUserModel> moneyPaidToUserModelList = new ArrayList<>();
         moneyPaidToUserModelList = salaryServiceImpl.getEmployeeTransactions(employeeId,startDate.replace("-","/"),endDate.replace("-","/"));
         Integer count = 0;
         BigDecimal totalB = BigDecimal.ZERO;
         if(moneyPaidToUserModelList!=null){
             for (MoneyPaidToUserModel model:moneyPaidToUserModelList) {
                 totalB= totalB.add(model.getAmount());
             }
             for (MoneyPaidToUserModel model:moneyPaidToUserModelList) {
                 String result = model.getCategory();
                 result = result.substring(0, result.indexOf("-"));
                 count++;
                 transactionRows= transactionRows.concat("<tr><td>" +count.toString() + "</td>"+
                         "<td style=\"text-align: right;\">" + model.getTransactionDate() + " </td>" +
                         "<td style=\"text-align: right;\">" + model.getTransactionType() + " </td>"+
                         "<td style=\"text-align: right;\">" + result + " </td>"+
                         "<td style=\"text-align: right;\"> AED " + model.getAmount() + " </td></tr>");

             }
             }
         if(salarySlipModel.getSalarySlipResult().get("Fixed")!=null)
            for (int i = 0; i < salarySlipModel.getSalarySlipResult().get("Fixed").size(); i++) {
                SalaryComponent salaryComponent= salarySlipModel.getSalarySlipResult().get("Fixed").get(i);
                earningRows= earningRows.concat("<tr><td>" + salaryComponent.getComponentName() + "</td>"+
                        "<td style=\"text-align: right;\">  AED  " + salaryComponent.getComponentValue() + " </td></tr>");

            }
        if(salarySlipModel.getSalarySlipResult().get("Fixed Allowance")!=null)
            for (int i = 0; i < salarySlipModel.getSalarySlipResult().get("Fixed Allowance").size(); i++)
            {
                SalaryComponent salaryComponent= salarySlipModel.getSalarySlipResult().get("Fixed Allowance").get(i);
                earningRows=  earningRows.concat("<tr><td>" + salaryComponent.getComponentName() + " </td>"+
                        "<td style=\"text-align: right;\">   AED  " + salaryComponent.getComponentValue() + " </td></tr>");

            }
        if(salarySlipModel.getSalarySlipResult().get("Deduction")!=null)
            for (int i = 0; i < salarySlipModel.getSalarySlipResult().get("Deduction").size(); i++)
            {
                SalaryComponent salaryComponent= salarySlipModel.getSalarySlipResult().get("Deduction").get(i);
                deductionRows=  deductionRows.concat("<tr><td>" + salaryComponent.getComponentName() + " </td>"+
                        "<td style=\"text-align: right;\">   AED  " + salaryComponent.getComponentValue() + " </td></tr>");
            }
        BigDecimal totalAandB = totalB.add(salarySlipModel.getNetPay().subtract(salarySlipModel.getDeductions()));

        String pdf=pdfContent
                .replace("{sifEnabled}",sifEnabled)
                .replace("{companylogo}",image)
                .replace("{salaryMonth}", salarySlipModel.getSalaryMonth())
                .replace("{companyAddress1}",user.getCompany().getCompanyAddressLine1()!=null?user.getCompany().getCompanyAddressLine1():"")
                .replace("{companyName}",user.getCompany().getCompanyName())
                .replace("{state}",user.getCompany().getCompanyStateCode().getStateName())
                .replace("{country}",user.getCompany().getCompanyCountryCode().getCountryName())
                .replace("{employeeCode}",employeeListModel.getBody().getEmployeeCode())
                .replace("{empName}",salarySlipModel.getEmployeename())
                .replace("{designation}",salarySlipModel.getDesignation())
                .replace("{dateOfJoining}",salarySlipModel.getDateOfJoining().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")))
                .replace("{payDate}",salarySlipModel.getPayDate().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")))
                .replace("{lostOfPaidDays}",salarySlipModel.getLopDays().toString())
                .replace("{accountNumber}", employeeListModel.getBody() != null && employeeListModel.getBody().getAccountNumber() != null ? employeeListModel.getBody().getAccountNumber() : "")
                .replace("{bankHolderName}",employeeListModel.getBody() != null && employeeListModel.getBody().getAccountHolderName() != null ? employeeListModel.getBody().getAccountHolderName() : "")
                .replace("{bankName}", employeeListModel.getBody() != null && employeeListModel.getBody().getBankName() != null ? employeeListModel.getBody().getBankName() : "")
                .replace("{branch}", employeeListModel.getBody() != null && employeeListModel.getBody().getBranch() != null ? employeeListModel.getBody().getBranch() : "")
                .replace("{iban}",employeeListModel.getBody() != null && employeeListModel.getBody().getIban() != null ? employeeListModel.getBody().getIban() : "")
                .replace("{totalB}",totalB.toString())
                .replace("{totalAandB}",totalAandB.toString())
                .replace("{startDate}",salarySlipModel.getPayPeriod().substring(0, Math.min(salarySlipModel.getPayPeriod().length(), 10)).replace("/", "-"))
                .replace("{endDate}",salarySlipModel.getPayPeriod().substring(Math.max(salarySlipModel.getPayPeriod().length() - 10, 0)).replace("/", "-"))
                .replace("{currency}","AED")
                .replace("{totalNet}",salarySlipModel.getNetPay().subtract(salarySlipModel.getDeductions()).toString())
                .replace("{totalDeductions}",salarySlipModel.getDeductions().toString())
                .replace("{poBoxNumber}",user.getCompany().getCompanyPoBoxNumber()!=null?user.getCompany().getCompanyPoBoxNumber():"")
                .replace("{grossTotal}",salarySlipModel.getEarnings().toString())
                .replace("<tr><td>{earning}</td><td>{amount}</td></tr>",earningRows)
                .replace("<tr><td>{count}</td><td>{transactionDate}</td><td>{transactionType}</td><td>{category}</td><td>{transactionAmount}</td></tr>",transactionRows)
                .replace("<tr><td>{deduction}</td><td>{amount}</td></tr>",deductionRows);

         String mail=   htmlContent  .replace("{companylogo}",image)
                 .replace("{name}",salarySlipModel.getEmployeename())
                 .replace("{startDate}",salarySlipModel.getPayPeriod().substring(0, Math.min(salarySlipModel.getPayPeriod().length(), 10)).replace("/", "-"))
                 .replace("{endDate}",salarySlipModel.getPayPeriod().substring(Math.max(salarySlipModel.getPayPeriod().length() - 10, 0)).replace("/", "-"));

        mailUtility.triggerEmailOnBackground2("Payslip", mail,pdf, null, EmailConstant.ADMIN_SUPPORT_EMAIL,
                EmailConstant.ADMIN_EMAIL_SENDER_NAME, new String[]{employee.getEmail()},
                true);

        EmailLogs emailLogs = new EmailLogs();
        emailLogs.setEmailDate(LocalDateTime.now());
        emailLogs.setEmailTo(user.getUserEmail());
        emailLogs.setEmailFrom( EmailConstant.ADMIN_SUPPORT_EMAIL);
        emailLogs.setModuleName("PAYROLL");
        emailLogs.setBaseUrl("-");
        emaiLogsService.persist(emailLogs);
        logger.info("PAYSLIP sent successfully....!");
        logger.info("Email send to =" +emailLogs );
    }

}