package com.simpleaccounts.rest.payroll.service.Impl;
import com.simpleaccounts.constant.ChartOfAccountCategoryIdEnumConstant;
import com.simpleaccounts.constant.CommonColumnConstants;
import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.repository.JournalLineItemRepository;
import com.simpleaccounts.rest.payroll.*;
import com.simpleaccounts.rest.payroll.SalaryComponent;
import com.simpleaccounts.rest.payroll.model.MoneyPaidToUserModel;
import com.simpleaccounts.rest.payroll.service.SalaryService;
import com.simpleaccounts.service.EmployeeService;
import com.simpleaccounts.service.EmploymentService;
import com.simpleaccounts.utils.DateFormatUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.chrono.ChronoLocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;
import static org.terracotta.modules.ehcache.ToolkitInstanceFactoryImpl.LOGGER;

	@Service("salaryService")
	@Transactional
	@SuppressWarnings("java:S131")
	public class SalaryServiceImpl extends SalaryService {

    @Autowired
    private SalaryDao salaryDao;
    @Autowired
    EmployeeService employeeService;
    @Autowired
    EmploymentService employmentService;
    @Autowired
    SalaryService salaryService;
    @Override
    protected Dao<Integer, Salary> getDao() {
        return this.salaryDao;
    }
    @Autowired
    DateFormatUtil dateFormatUtil;
    @Autowired
    private EmployeeTransactionCategoryRelationRepository employeeTransactionCategoryRelationRepository;
    @Autowired
    private JournalLineItemRepository journalLineItemRepository;

    public SalarySlipModel getSalaryByEmployeeId(Integer employeeId,String salaryDate){

        SalarySlipModel salarySlipModel = new SalarySlipModel();
        Map<String ,List<SalaryComponent>> salarySlipMap = new LinkedHashMap<>();
        salarySlipModel.setSalarySlipResult(salarySlipMap);
        salarySlipModel.setDesignation(employeeService.findByPK(employeeId).getEmployeeDesignationId().getDesignationName());
        salarySlipModel.setEmployeename(employeeService.findByPK(employeeId).getFirstName() + " " + employeeService.findByPK(employeeId).getMiddleName() +  " " + employeeService.findByPK(employeeId).getLastName() );
        Employee employee = employeeService.findByPK(employeeId);
        List salaryList =  salaryDao.getSalaryByEmployeeId(employee,salaryDate);
        if(salaryList != null &&!salaryList.isEmpty()) {

            for(Object object : salaryList)
            {
                LocalDate dateForSalary =  dateFormatUtil.getDateStrAsLocalDateTime(salaryDate, CommonColumnConstants.DD_MM_YYYY).toLocalDate();
                Object[] objectArray = (Object[]) object;
                Salary salary = salaryService.findByPK((Integer) objectArray[6]);
                if(dateForSalary.equals(salary.getSalaryDate().toLocalDate()) && !salary.getPayrollId().getStatus().equalsIgnoreCase("Voided")) {
                    salarySlipModel.setNoOfDays(salary.getNoOfDays());
                    salarySlipModel.setLopDays(salary.getLopDays());
                    switch (PayrollEnumConstants.get(salary.getSalaryComponent().getSalaryStructure().getId())) {

                        case Fixed:
                        case Variable:
                        case Fixed_Allowance:
                            salarySlipModel.setEarnings(salarySlipModel.getEarnings().add(salary.getTotalAmount()));
                            // salarySlipModel.setGrossSalary(salarySlipModel.getGrossSalary().add(salary.getTotalAmount()));
                            break;
                        case Deduction:
                            // salarySlipModel.setGrossSalary(salarySlipModel.getGrossSalary().add(salary.getTotalAmount()));
                            salarySlipModel.setDeductions(salarySlipModel.getDeductions().add(salary.getTotalAmount()));
                            break;
                        default:
                            // Unknown payroll enum constant - no action needed
                            break;

                    }
                    salarySlipModel.setNetPay(salarySlipModel.getEarnings());
                    String salaryStructure = (String) objectArray[0];
                    LocalDateTime date = (LocalDateTime) objectArray[4];
                    salarySlipModel.setPayDate(date.toLocalDate());
                    salarySlipModel.setPayPeriod(salary.getPayrollId().getPayPeriod());
                    Integer year = date.getYear();

                    Integer hyphenIndex = salary.getPayrollId().getPayPeriod().indexOf("-");
                    String dateString = salary.getPayrollId().getPayPeriod().substring(0, hyphenIndex);
                    DateTimeFormatter inputFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                    LocalDate salaryMonth = LocalDate.parse(dateString, inputFormatter);
                    DateTimeFormatter outputFormatter = DateTimeFormatter.ofPattern("MMMM yyyy");
                    String formattedDate = salaryMonth.format(outputFormatter);
                    salarySlipModel.setSalaryMonth(formattedDate);

                    List<SalaryComponent> salaryComponentList = salarySlipMap.get(salaryStructure);
                    if (salaryComponentList == null) {
                        salaryComponentList = new ArrayList<>();
                        salarySlipMap.put(salaryStructure, salaryComponentList);

                    }

                    SalaryComponent salaryComponent = new SalaryComponent();
                    salaryComponent.setSalaryDate(date);
                    salaryComponent.setComponentName((String) objectArray[1]);
                    salaryComponent.setComponentValue((BigDecimal) objectArray[2]);
                    salaryComponent.setEmpId(employee.getId());
                    salaryComponent.setEmpName(employee.getFirstName());
                    salaryComponent.setNoOfDays((BigDecimal) objectArray[5]);
                    salaryComponentList.add(salaryComponent);
                }
            }
        }
        Map<String, Object> employmentParam = new HashMap<>();
        employmentParam.put("employee",employeeId);
        List<Employment> employmentList = employmentService.findByAttributes(employmentParam);
        if (employmentList!=null && !employmentList.isEmpty()){
            Employment employment = employmentList.get(0);
            LocalDateTime dateOfJoining = employment.getDateOfJoining();
            salarySlipModel.setDateOfJoining(dateOfJoining.toLocalDate());
        }
        return  salarySlipModel;
     }

    public  SalaryListPerMonthResponseModel getSalaryPerMonthList(SalaryPerMonthRequestModel requestModel , SalaryListPerMonthResponseModel salaryListPerMonthResponseModel){


        return salaryDao.getSalaryPerMonthList(requestModel, salaryListPerMonthResponseModel);
    }

    public IncompleteEmployeeResponseModel getIncompleteEmployeeList(IncompleteEmployeeResponseModel incompleteEmployeeResponseModel) {

        return  salaryDao.getIncompleteEmployeeList(incompleteEmployeeResponseModel);
    }

    public SalarySlipListtResponseModel getSalarySlipListt(Integer employeeId,SalarySlipListtResponseModel salarySlipListtResponseModel){

        Employee employee = employeeService.findByPK(employeeId);
        return  salaryDao.getSalarySlipListt(employee,salarySlipListtResponseModel);

    }
    public List<MoneyPaidToUserModel> getEmployeeTransactions(Integer employeeId,String startDate,String endDate) {
        List<MoneyPaidToUserModel> moneyPaidToUserModelList = new ArrayList<>();
        List<Integer> employeeTransactionCategoryRelationList = employeeTransactionCategoryRelationRepository.getAllTransactionCategoryByEmployeeId(employeeId);
        List<JournalLineItem> journalLineItemList = journalLineItemRepository.findAllByTransactionCategoryList(employeeTransactionCategoryRelationList);
        LocalDateTime strDate = dateFormatUtil.getDateStrAsLocalDateTime(startDate,
                CommonColumnConstants.DD_MM_YYYY);
        LocalDate std = strDate.toLocalDate();
        LocalDateTime enDate = dateFormatUtil.getDateStrAsLocalDateTime(endDate,
                CommonColumnConstants.DD_MM_YYYY);
        LocalDate end = enDate.toLocalDate();
        for(JournalLineItem journalLineItem:journalLineItemList ){
            MoneyPaidToUserModel model = new MoneyPaidToUserModel();
            if(journalLineItem.getReferenceType()!= PostingReferenceTypeEnum.PAYROLL_APPROVED) {
                if (journalLineItem.getJournal().getTransactionDate().isAfter(std) || journalLineItem.getJournal().getTransactionDate().isEqual(std)) {
                    if (journalLineItem.getJournal().getTransactionDate().isBefore(end) || journalLineItem.getJournal().getTransactionDate().isEqual(end)) {
                        model.setTransactionDate(journalLineItem.getJournal().getTransactionDate());
                        model.setCategory(journalLineItem.getTransactionCategory().getTransactionCategoryName());
                        model.setAmount(journalLineItem.getDebitAmount());
                        if(journalLineItem.getReferenceType() == PostingReferenceTypeEnum.MANUAL){
                            model.setTransactionType("Manual");
                        }
                        else {
                            model.setTransactionType("Money Paid To User");
                        }
                        moneyPaidToUserModelList.add(model);
                    }
                }
            }
        }
        return  moneyPaidToUserModelList;

    }


}
