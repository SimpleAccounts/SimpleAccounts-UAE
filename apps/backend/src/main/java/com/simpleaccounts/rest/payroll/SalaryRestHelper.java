package com.simpleaccounts.rest.payroll;

import com.simpleaccounts.constant.DefaultTypeConstant;
import com.simpleaccounts.constant.EmailConstant;
import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.model.SalaryPersistModel;
import com.simpleaccounts.rest.employeecontroller.EmployeeController;
import com.simpleaccounts.rest.employeecontroller.EmployeeListModel;
import com.simpleaccounts.rest.payroll.service.EmployeeSalaryComponentRelationService;
import com.simpleaccounts.rest.payroll.service.Impl.SalaryServiceImpl;
import com.simpleaccounts.rest.payroll.service.SalaryService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.*;
import com.simpleaccounts.service.bankaccount.ChartOfAccountService;
import com.simpleaccounts.utils.DateFormatUtil;
import com.simpleaccounts.utils.EmailSender;
import com.simpleaccounts.utils.MailUtility;
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
import java.util.Objects;
import javax.servlet.http.HttpServletRequest;
import javax.xml.bind.DatatypeConverter;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import static com.simpleaccounts.rest.invoicecontroller.HtmlTemplateConstants.PAYSLIP_MAIL_TEMPLATE;
import static com.simpleaccounts.rest.invoicecontroller.HtmlTemplateConstants.PAYSLIP_TEMPLATE;

@Component
@RequiredArgsConstructor
public class SalaryRestHelper {
    private final Logger logger = LoggerFactory.getLogger(SalaryRestHelper.class);
    private static final String PAYROLL_LIABILITY = "PAYROLL_LIABILITY";
    private static final String DATE_FORMAT_DD_SLASH_MM_SLASH_YYYY = "DATE_FORMAT_DD_SLASH_MM_SLASH_YYYY";
    private static final String HTML_TR_TD_OPEN = "HTML_TR_TD_OPEN";
    private static final String HTML_TD_TR_CLOSE = "HTML_TD_TR_CLOSE";
    private static final String SALARY_TYPE_FIXED = "Fixed";
    private static final String SALARY_TYPE_FIXED_ALLOWANCE = "Fixed Allowance";
    private static final String SALARY_TYPE_DEDUCTION = "Deduction";
    private final JwtTokenUtil jwtTokenUtil;

    private final EmployeeService employeeService;

    private final JournalService journalService;

    private final UserService userService;

    private final SalaryService salaryService;

    private final DateFormatUtil dateFormatUtil;

    private final ChartOfAccountService chartOfAccountService;

    private final TransactionCategoryService transactionCategoryService;

    private final CoacTransactionCategoryService coacTransactionCategoryService;

    private final BankAccountService bankAccountService;

    private final EmployeeTransactioncategoryService employeeTransactioncategoryService;

    private final JournalLineItemService journalLineItemService;

    private final EmployeeSalaryComponentRelationService employeeSalaryComponentRelationService;
    private final ResourceLoader resourceLoader;
    private final EmailSender emailSender;
    private final EmaiLogsService emaiLogsService;
    private final MailUtility mailUtility;
    private final EmployeeController employeeController;
    private final SalaryServiceImpl salaryServiceImpl;

    @Transactional(rollbackFor = Exception.class)
    public String generateSalary(SalaryPersistModel salaryPersistModel ,  HttpServletRequest request) {

        Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
        User user = userService.findByPK(userId);

        Map<String, Object> CategoryParam = new HashMap<>();
CategoryParam.put("transactionCategoryName", PAYROLL_LIABILITY);
        List<TransactionCategory> payrollTransactionCategoryList = transactionCategoryService.findByAttributes(CategoryParam);

        if (payrollTransactionCategoryList != null && !payrollTransactionCategoryList.isEmpty()) {

            List<Integer> employeeListId = salaryPersistModel.getEmployeeListIds();

            BigDecimal totalSalaryForSingleDay = BigDecimal.valueOf(Float.valueOf(0));
            BigDecimal salaryForjournalEntry = BigDecimal.ZERO;
            for (Integer employeeId : employeeListId) {
                Employee employee = employeeService.findByPK(employeeId);

                BigDecimal totSalaryForEmployeePerMonth = BigDecimal.ZERO;
                Map<String, Object> param = new HashMap<>();
                param.put("employeeId", employee);
                List<EmployeeSalaryComponentRelation> employeeSalaryComponentList = employeeSalaryComponentRelationService.findByAttributes(param);
                BigDecimal noOfDays = BigDecimal.valueOf(0);
                //Traverse salary template component list and for each component calculate salary for number of days
                for (EmployeeSalaryComponentRelation salaryComponent : employeeSalaryComponentList) {

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
                    salary.setSalaryDate(dateFormatUtil.getDateStrAsLocalDateTime(salaryPersistModel.getSalaryDate(), DATE_FORMAT_DD_SLASH_MM_SLASH_YYYY));
                    salary.setTotalAmount(salaryAsPerNoOfWorkingDays);
                    salaryService.persist(salary);
                    if (Objects.equals(salaryComponent.getSalaryStructure().getId(), PayrollEnumConstants.Deduction.getId())){

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
                salary.setSalaryDate(dateFormatUtil.getDateStrAsLocalDateTime(salaryPersistModel.getSalaryDate(), DATE_FORMAT_DD_SLASH_MM_SLASH_YYYY));
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
            finalPayrolltransactionCategory.setTransactionCategoryName(PAYROLL_LIABILITY);
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
            payrollCategoryParam.put("transactionCategoryName", PAYROLL_LIABILITY);
            List<TransactionCategory> payrollList = transactionCategoryService.findByAttributes(payrollCategoryParam);

            List<Integer> employeeListId = salaryPersistModel.getEmployeeListIds();

            BigDecimal totalSalaryForSingleDay = BigDecimal.valueOf(Float.valueOf(0));
            BigDecimal salaryForjournalEntry = BigDecimal.ZERO;
            for (Integer employeeId : employeeListId) {
                Employee employee = employeeService.findByPK(employeeId);

                Map<String, Object> param = new HashMap<>();
                param.put("employeeId", employee);
                List<EmployeeSalaryComponentRelation> employeeSalaryComponentList = employeeSalaryComponentRelationService.findByAttributes(param);
                BigDecimal noOfDays = BigDecimal.valueOf(0);
                //Traverse salary template component list and for each component calculate salary for number of days
                for (EmployeeSalaryComponentRelation salaryComponent : employeeSalaryComponentList) {

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
                    salary.setSalaryDate(dateFormatUtil.getDateStrAsLocalDateTime(salaryPersistModel.getSalaryDate(), DATE_FORMAT_DD_SLASH_MM_SLASH_YYYY));
                    salary.setTotalAmount(salaryAsPerNoOfWorkingDays);
                    salaryService.persist(salary);
                    if (Objects.equals(salaryComponent.getSalaryStructure().getId(), PayrollEnumConstants.Deduction.getId())){
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
                salary.setSalaryDate(dateFormatUtil.getDateStrAsLocalDateTime(salaryPersistModel.getSalaryDate(), DATE_FORMAT_DD_SLASH_MM_SLASH_YYYY));
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
            logger.error("Error processing salary", e);
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
                 transactionRows= transactionRows.concat(HTML_TR_TD_OPEN +count.toString() + "</td>"+
                         "<td style=\"text-align: right;\">" + model.getTransactionDate() + " </td>" +
                         "<td style=\"text-align: right;\">" + model.getTransactionType() + " </td>"+
                         "<td style=\"text-align: right;\">" + result + " </td>"+
                         "<td style=\"text-align: right;\"> AED " + model.getAmount() + HTML_TD_TR_CLOSE);

             }
             }
         if(salarySlipModel.getSalarySlipResult().get(SALARY_TYPE_FIXED)!=null)
            for (int i = 0; i < salarySlipModel.getSalarySlipResult().get(SALARY_TYPE_FIXED).size(); i++) {
                SalaryComponent salaryComponent= salarySlipModel.getSalarySlipResult().get(SALARY_TYPE_FIXED).get(i);
                earningRows= earningRows.concat(HTML_TR_TD_OPEN + salaryComponent.getComponentName() + "</td>"+
                        "<td style=\"text-align: right;\">  AED  " + salaryComponent.getComponentValue() + HTML_TD_TR_CLOSE);

            }
        if(salarySlipModel.getSalarySlipResult().get(SALARY_TYPE_FIXED_ALLOWANCE)!=null)
            for (int i = 0; i < salarySlipModel.getSalarySlipResult().get(SALARY_TYPE_FIXED_ALLOWANCE).size(); i++)
            {
                SalaryComponent salaryComponent= salarySlipModel.getSalarySlipResult().get(SALARY_TYPE_FIXED_ALLOWANCE).get(i);
                earningRows=  earningRows.concat(HTML_TR_TD_OPEN + salaryComponent.getComponentName() + " </td>"+
                        "<td style=\"text-align: right;\">   AED  " + salaryComponent.getComponentValue() + HTML_TD_TR_CLOSE);

            }
        if(salarySlipModel.getSalarySlipResult().get(SALARY_TYPE_DEDUCTION)!=null)
            for (int i = 0; i < salarySlipModel.getSalarySlipResult().get(SALARY_TYPE_DEDUCTION).size(); i++)
            {
                SalaryComponent salaryComponent= salarySlipModel.getSalarySlipResult().get(SALARY_TYPE_DEDUCTION).get(i);
                deductionRows=  deductionRows.concat(HTML_TR_TD_OPEN + salaryComponent.getComponentName() + " </td>"+
                        "<td style=\"text-align: right;\">   AED  " + salaryComponent.getComponentValue() + HTML_TD_TR_CLOSE);
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
                .replace("HTML_TR_TD_OPEN{earning}</td><td>{amount}</td></tr>",earningRows)
                .replace("HTML_TR_TD_OPEN{count}</td><td>{transactionDate}</td><td>{transactionType}</td><td>{category}</td><td>{transactionAmount}</td></tr>",transactionRows)
                .replace("HTML_TR_TD_OPEN{deduction}</td><td>{amount}</td></tr>",deductionRows);

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
