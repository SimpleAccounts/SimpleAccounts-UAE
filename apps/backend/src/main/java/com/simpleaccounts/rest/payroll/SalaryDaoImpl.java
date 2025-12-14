package com.simpleaccounts.rest.payroll;

import com.simpleaccounts.constant.CommonColumnConstants;
import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.impl.TransactionCategoryClosingBalanceDaoImpl;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.repository.PayrollRepository;
import com.simpleaccounts.rest.payroll.service.EmployeeSalaryComponentRelationService;
import com.simpleaccounts.rest.payroll.service.IncompleteEmployeeProfileModel;
import com.simpleaccounts.rest.payroll.service.SalarySlipListtModel;
import com.simpleaccounts.service.EmployeeBankDetailsService;
import com.simpleaccounts.service.EmployeeService;
import com.simpleaccounts.service.EmploymentService;
import com.simpleaccounts.utils.ChartUtil;
import com.simpleaccounts.utils.DateFormatUtil;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import javax.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

@Repository(value = "salaryDao")
	@SuppressWarnings("java:S131")
	@RequiredArgsConstructor
public class SalaryDaoImpl extends AbstractDao<Integer, Salary> implements SalaryDao{
    private static final String JSON_KEY_EMPLOYEE_ID = "employeeId";
    private static final String JSON_KEY_EMPLOYEE = "employee";
    
    private static final Logger LOGGER = LoggerFactory.getLogger(TransactionCategoryClosingBalanceDaoImpl.class);
    private final EmployeeService employeeService;
    private final EmploymentService employmentService;
    private final ChartUtil chartUtil;
    private final EmployeeBankDetailsService employeeBankDetailsService;
    private final EmployeeSalaryComponentRelationService employeeSalaryComponentRelationService;
    private final DateFormatUtil dateFormatUtil;
    private final PayrollRepository payrollRepository;

    public List getSalaryByEmployeeId(Employee employee,String salaryDate){

        LocalDateTime dateForSalary =  dateFormatUtil.getDateStrAsLocalDateTime(salaryDate, CommonColumnConstants.DD_MM_YYYY);
        Query query= getEntityManager().createQuery(
                "SELECT str.name,sc.description,s.totalAmount,s.employeeId.id,s.salaryDate ,s.noOfDays,s.id " +
                "FROM Salary s,SalaryComponent sc,SalaryStructure str " +
                "WHERE s.salaryComponent.id = sc.id and s.employeeId = :employeeId and sc.salaryStructure.id = str.id ");
        query.setParameter("employeeId", employee);

        return query.getResultList();
    }

    public SalaryListPerMonthResponseModel getSalaryPerMonthList(SalaryPerMonthRequestModel requestModel, SalaryListPerMonthResponseModel salaryListPerMonthResponseModel){

        List<SalaryPerMonthModel> salaryPerMonthModelList = new ArrayList<>();
        salaryListPerMonthResponseModel.setResultSalaryPerMonthList(salaryPerMonthModelList);

        String quertStr = " SELECT s from  Salary s where s.salaryDate < :presentDate GROUP BY s.employeeId,s.salaryComponent.id";
        Query query = getEntityManager().createQuery(quertStr);
        query.setParameter("presentDate",  dateFormatUtil.getDateStrAsLocalDateTime(requestModel.getPresentDate(), CommonColumnConstants.DD_MM_YYYY));
        List<Salary> list = query.getResultList();
        List<Integer> salaryPaidEmployeeList = new ArrayList<>();
        Employment employment = null;
        EmployeeBankDetails employeeBankDetails = null;
        Map<Integer,SalaryPerMonthModel> salaryMap = new HashMap<>();

        for(Salary salary : list)
        {

            SalaryPerMonthModel salaryPerMonthModel = salaryMap.get(salary.getEmployeeId().getId());
            if(salaryPerMonthModel==null){
                salaryPerMonthModel = new SalaryPerMonthModel();
                salaryPerMonthModel.setEmployeeId(salary.getEmployeeId().getId());
                salaryPerMonthModel.setEmployeeName(salary.getEmployeeId().getFirstName()+" "+salary.getEmployeeId().getLastName());
                salaryPerMonthModel.setPayDays(salary.getNoOfDays());
                salaryPerMonthModel.setStatus("Paid");
                salaryPaidEmployeeList.add(salary.getEmployeeId().getId());
                salaryMap.put(salary.getEmployeeId().getId(),salaryPerMonthModel);

                salaryPerMonthModelList.add(salaryPerMonthModel);
            }
            if (salary.getSalaryComponent()==null)
            {
                salaryPerMonthModel.setNetPay(salary.getTotalAmount());
                continue;
            }
            switch(PayrollEnumConstants.get(salary.getSalaryComponent().getSalaryStructure().getId())){

                case Fixed:
                case Variable:
                case Fixed_Allowance:
                    salaryPerMonthModel.setEarnings(salaryPerMonthModel.getEarnings().add(salary.getTotalAmount()));
                    salaryPerMonthModel.setGrossSalary(salaryPerMonthModel.getGrossSalary().add(salary.getTotalAmount()));
                    break;
                case Deduction:
                    salaryPerMonthModel.setGrossSalary(salaryPerMonthModel.getGrossSalary().add(salary.getTotalAmount()));
                    salaryPerMonthModel.setDeductions(salaryPerMonthModel.getDeductions().add(salary.getTotalAmount()));
                    break;

            }
        }
        quertStr = " SELECT esc from  EmployeeSalaryComponentRelation esc GROUP BY esc.employeeId,esc.salaryComponentId";
        query = getEntityManager().createQuery(quertStr);

        List<EmployeeSalaryComponentRelation> esclist = query.getResultList();

        for(EmployeeSalaryComponentRelation salary : esclist)
        {
            employment = null;
            employeeBankDetails = null;
            Map<String, Object> paramEmployee = new HashMap<>();
            paramEmployee.put(JSON_KEY_EMPLOYEE, salary.getEmployeeId().getId());
            List<Employment> employmentList = employmentService.findByAttributes(paramEmployee);
            if (employmentList!=null && !employmentList.isEmpty()){
                employment = employmentList.get(0);
            }
            Map<String, Object> paramBankDetails = new HashMap<>();
            paramBankDetails.put(JSON_KEY_EMPLOYEE, salary.getEmployeeId().getId());
            List<EmployeeBankDetails> employeeBankDetailsList = employeeBankDetailsService.findByAttributes(paramBankDetails);
            if (employeeBankDetailsList!=null && !employeeBankDetailsList.isEmpty()) {
                employeeBankDetails = employeeBankDetailsList.get(0);
            }
	            if (employment != null && employment.getId()!=null&& employeeBankDetails != null && employeeBankDetails.getId()!=null&&((salary.getMonthlyAmount()).compareTo(BigDecimal.ZERO)>0)&&((salary.getYearlyAmount()).compareTo(BigDecimal.ZERO)>0)
	                    && Boolean.TRUE.equals(salary.getEmployeeId().getIsActive())) {
		                if (salaryPaidEmployeeList.contains(salary.getEmployeeId().getId()))
		                    continue;
                SalaryPerMonthModel salaryPerMonthModel = salaryMap.get(salary.getEmployeeId().getId());
                if (salaryPerMonthModel == null) {
                    salaryPerMonthModel = new SalaryPerMonthModel();
                    salaryPerMonthModel.setEmployeeId(salary.getEmployeeId().getId());
                    salaryPerMonthModel.setEmployeeName(salary.getEmployeeId().getFirstName() + " " + salary.getEmployeeId().getLastName());
                    salaryPerMonthModel.setPayDays(salary.getNoOfDays());
                    salaryPerMonthModel.setStatus("Draft");

                    salaryMap.put(salary.getEmployeeId().getId(), salaryPerMonthModel);

                    salaryPerMonthModelList.add(salaryPerMonthModel);
                }
                if (salaryPerMonthModel.getNetPay() == null) {
                    salaryPerMonthModel.setNetPay(salary.getMonthlyAmount());
                }
                switch (PayrollEnumConstants.get(salary.getSalaryStructure().getId())) {

                    case Fixed:
                    case Variable:
                    case Fixed_Allowance:
                        salaryPerMonthModel.setEarnings(salary.getMonthlyAmount().add(salaryPerMonthModel.getEarnings()));
                        salaryPerMonthModel.setGrossSalary(salaryPerMonthModel.getGrossSalary().add(salary.getMonthlyAmount()));
                        break;
                    case Deduction:
                        salaryPerMonthModel.setGrossSalary(salaryPerMonthModel.getGrossSalary().add(salary.getMonthlyAmount()));
                        salaryPerMonthModel.setDeductions(salaryPerMonthModel.getDeductions().add(salary.getMonthlyAmount()));
                        break;
                    case DEFAULT:
                    default:
                        // No action needed for default case
                        break;
                }

            }

        }
        return salaryListPerMonthResponseModel;
    }

    public IncompleteEmployeeResponseModel getIncompleteEmployeeList(IncompleteEmployeeResponseModel incompleteEmployeeResponseModel){

        List<IncompleteEmployeeProfileModel> incompleteEmployeelist = new ArrayList<>();
        Query query= getEntityManager().createQuery("SELECT e from  Employee e where  e.isActive = true GROUP BY e.id ORDER BY e.id DESC");
        List<Employee> employeeList = query.getResultList();
        Map<String,IncompleteEmployeeProfileModel> incompleteEmployeeProfileMap = new HashMap<>();
        Employment employment =null;
        EmployeeBankDetails employeeBankDetail=null;
        for (Employee employee : employeeList){
            Map<String, Object> paramEmployee = new HashMap<>();
            paramEmployee.put(JSON_KEY_EMPLOYEE, employee.getId());
            List<Employment> employmentList = employmentService.findByAttributes(paramEmployee);
            if (employmentList!=null&&!employmentList.isEmpty()) {
                employment = employmentList.get(0);
            }
            Map<String, Object> paramBankDetails = new HashMap<>();
            paramBankDetails.put(JSON_KEY_EMPLOYEE, employee.getId());
            List<EmployeeBankDetails> employeeBankDetailsList = employeeBankDetailsService.findByAttributes(paramBankDetails);
            if (employeeBankDetailsList!=null&&!employeeBankDetailsList.isEmpty()){
                employeeBankDetail = employeeBankDetailsList.get(0);
            }
            Map<String, Object> employeeSalaryComponentDetail = new HashMap<>();
            employeeSalaryComponentDetail.put(JSON_KEY_EMPLOYEE_ID, employee.getId());
            List<EmployeeSalaryComponentRelation> employeeSalaryComponentDetailList = employeeSalaryComponentRelationService.findByAttributes(employeeSalaryComponentDetail);
            EmployeeSalaryComponentRelation employeeSalaryComponentRelation = employeeSalaryComponentDetailList.get(0);
            if (employment==null||employeeBankDetail==null||((employeeSalaryComponentRelation.getMonthlyAmount()).compareTo(BigDecimal.ZERO)<1)||((employeeSalaryComponentRelation.getYearlyAmount()).compareTo(BigDecimal.ZERO)<1)){
                IncompleteEmployeeProfileModel incompleteEmployeeProfileModel = incompleteEmployeeProfileMap.get(employee.getId().toString());
                if (incompleteEmployeeProfileModel == null) {
                    incompleteEmployeeProfileModel = new IncompleteEmployeeProfileModel();
                    incompleteEmployeeProfileModel.setEmployeeId(employee.getId().toString());
                    incompleteEmployeeProfileModel.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());
                    incompleteEmployeeProfileMap.put(employee.getId().toString(), incompleteEmployeeProfileModel);

                    incompleteEmployeelist.add(incompleteEmployeeProfileModel);
                }

            }

        }
        incompleteEmployeeResponseModel.setIncompleteEmployeeList(incompleteEmployeelist);
        return incompleteEmployeeResponseModel;
    }
    public SalarySlipListtResponseModel getSalarySlipListt(Employee employeeId,SalarySlipListtResponseModel salarySlipListtResponseModel) {

        List<SalarySlipListtModel> salarySlipListtModellList = new ArrayList<>();
        salarySlipListtResponseModel.setResultSalarySlipList(salarySlipListtModellList);
        Query query= getEntityManager().createQuery("SELECT Distinct s from  Salary s where  s.employeeId = :employeeId and s.salaryComponent.id=1");
        query.setParameter("employeeId", employeeId);

        List<Salary> list = query.getResultList();

        for (Salary salary : list){
            if(salary!=null && salary.getPayrollId()!=null && !salary.getPayrollId().getStatus().equalsIgnoreCase("Voided") &&
                    !salary.getPayrollId().getStatus().equalsIgnoreCase("Submitted") &&
                    !salary.getPayrollId().getStatus().equalsIgnoreCase("Rejected")) {
                SalarySlipListtModel salarySlipListtModel = new SalarySlipListtModel();
                LocalDateTime localDateTime = salary.getSalaryDate();
                salarySlipListtModel.setSalaryDate(localDateTime.toLocalDate());
                LocalDateTime date = salary.getSalaryDate();
                String month = date.getMonth().toString();
                Integer year = date.getYear();

                Integer hyphenIndex = salary.getPayrollId().getPayPeriod().indexOf("-");
                String dateString = salary.getPayrollId().getPayPeriod().substring(0, hyphenIndex);
                DateTimeFormatter inputFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                LocalDate salaryMonth = LocalDate.parse(dateString, inputFormatter);
                DateTimeFormatter outputFormatter = DateTimeFormatter.ofPattern("MMMM yyyy");
                String formattedDate = salaryMonth.format(outputFormatter);
                salarySlipListtModel.setMonthYear(formattedDate);

                if(salary.getPayrollId() != null){
                    Payroll payroll = payrollRepository.findById(salary.getPayrollId().getId());
                    salarySlipListtModel.setPayPeriod(payroll.getPayPeriod());
                }
                salarySlipListtModellList.add(salarySlipListtModel);
            }

        }

        return salarySlipListtResponseModel;
    }
}
