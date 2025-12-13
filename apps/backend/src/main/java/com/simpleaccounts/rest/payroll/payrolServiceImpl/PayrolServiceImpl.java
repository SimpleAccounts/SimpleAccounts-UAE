package com.simpleaccounts.rest.payroll.payrolServiceImpl;

import com.simpleaccounts.constant.CommonColumnConstants;
import lombok.RequiredArgsConstructor;

import com.simpleaccounts.constant.dbfilter.PayrollFilterEnum;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.repository.*;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.payroll.PayrollDao;
import com.simpleaccounts.rest.payroll.PayrollRestHepler;
import com.simpleaccounts.rest.payroll.UserDto;
import com.simpleaccounts.rest.payroll.dto.PayrollEmployeeDto;
import com.simpleaccounts.rest.payroll.dto.PayrollEmployeeResultSet;
import com.simpleaccounts.rest.payroll.model.GeneratePayrollPersistModel;
import com.simpleaccounts.rest.payroll.model.PayrolRequestModel;
import com.simpleaccounts.rest.payroll.payrolService.PayrolService;
import com.simpleaccounts.rest.payroll.service.SalaryService;
import com.simpleaccounts.service.EmployeeService;
import com.simpleaccounts.utils.DateFormatUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.TextStyle;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
	@SuppressWarnings("java:S3973")
	@RequiredArgsConstructor
public class PayrolServiceImpl extends PayrolService {
    private static final Logger logger = LoggerFactory.getLogger(PayrolServiceImpl.class);
    private final PayrollRepository payrollRepository;
    private final PayrolEmployeeRepository payrolEmployeeRepository;
    private final EmployeeService employeeService;
    
    private final UserJpaRepository userJpaRepository;

	private final PayrollRestHepler payrollRestHepler;
    private final EmployeeSalaryComponentRelationRepository  EmpSalaryCompRelRepository;
	private final SalaryService salaryService;
	private final SalaryRepository salaryRepository;
	private final DateFormatUtil dateFormatUtil;

	private final PayrollDao payrollDao;

    private static final String APPROVER = "Payroll Approver";
    private static final String ADMIN = "Admin";
	private static final String ACCOUNTANT = "Accountant";
    private static final Integer TYPE = 1;
    
    // id 3 is for deduction
    private static final Integer SALARY_STRUCTURE_DEDUCTION_ID = 3;

    public Payroll createNewPayrol(User user, PayrolRequestModel payrolRequestModel, Integer userId){

           Payroll payroll = new Payroll();
           payroll.setDeleteFlag(Boolean.FALSE);
           payroll.setIsActive(true);
           if(payrolRequestModel.getApproverId()!=null) {
			   payroll.setPayrollApprover(payrolRequestModel.getApproverId());
		   }

           payroll.setGeneratedBy(user.getUserId().toString());

		if (payrolRequestModel.getSalaryDate() != null) {
			Instant instant = Instant.ofEpochMilli(payrolRequestModel.getSalaryDate().getTime());
			LocalDateTime payrollDate = LocalDateTime.ofInstant(instant,
					ZoneId.systemDefault());
			payroll.setPayrollDate(payrollDate);

		}
        if(payrolRequestModel.getPayPeriod()!=null){
           payroll.setPayPeriod(payrolRequestModel.getPayPeriod());
        }
        if(payrolRequestModel.getPayrollSubject()!=null){
           payroll.setPayrollSubject(payrolRequestModel.getPayrollSubject());
        }
        payroll.setDeleteFlag(Boolean.FALSE);
		payroll.setTotalAmountPayroll(payrolRequestModel.getTotalAmountPayroll());
		payroll.setDueAmountPayroll(payrolRequestModel.getTotalAmountPayroll());
        payrollRepository.save(payroll);
		for(Integer employee : payrolRequestModel.getEmployeeListIds()){
			PayrollEmployee payrollEmployee = new PayrollEmployee();
			payrollEmployee.setEmployeeID(employeeService.findByPK(employee));
			payrollEmployee.setPayrollId(payrollRepository.findById(payroll.getId()));
			payrolEmployeeRepository.save(payrollEmployee);
		}

		List<GeneratePayrollPersistModel> generatePayrollPersistModels = new ArrayList<>();
		payrollRestHepler.generatePayroll(payrolRequestModel, generatePayrollPersistModels,user,payroll);

        return payroll;

    }
	/**
	 * To Convert Input date into LocalDate Format.
	 * @param strDateTime
	 * @return
	 */
	public LocalDateTime dateConvertIntoLocalDataTime(String strDateTime) {

		DateTimeFormatter dtfInput = new DateTimeFormatterBuilder()
				.parseCaseInsensitive()
				.appendPattern("E MMM d uuuu H:m:s")
				.appendLiteral(" ")
				.appendZoneId()
				.appendPattern("X")
				.appendLiteral(" ")
				.appendLiteral("(")
				.appendZoneText(TextStyle.FULL)
				.appendLiteral(')')
				.toFormatter(Locale.ENGLISH);

		ZonedDateTime zdt = ZonedDateTime.parse(strDateTime, dtfInput);
		OffsetDateTime odt = zdt.toOffsetDateTime();

		// To LocalDate.
		LocalDate localDate = odt.toLocalDate();
		System.out.println(localDate);
		LocalTime time=odt.toLocalTime();
		String outputDate = localDate+" "+time;

		DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
		LocalDateTime datetime = LocalDateTime.parse(outputDate,dtf);

		return datetime;

	}
    public void savePayrollEmployeeRelation(Integer payrollId, User user, List<Integer> employeeListIds){

        for(Integer employee : employeeListIds){
            PayrollEmployee payrollEmployee = new PayrollEmployee();
            payrollEmployee.setEmployeeID(employeeService.findByPK(employee));
            payrollEmployee.setPayrollId(payrollRepository.findById(payrollId));
            payrolEmployeeRepository.save(payrollEmployee);
        }
    }
    
    /**
	 * 
	 * @return List of Approved User (List of user having Role name = Approved)
	 */
   public List<UserDto> getAprovedUserList() {
		
	   java.util.List<String> roles = new ArrayList<>();
	   roles.add(APPROVER);
	   roles.add(ADMIN);
	   roles.add(ACCOUNTANT);
	   
		return userJpaRepository.findApprovedUser(roles);
	}

    public void deleteByIds(List<Integer> payEmpListIds){
    	
    	try {
    	 for (Integer id : payEmpListIds)
         {
    		 payrolEmployeeRepository.deleteById(id);
         }
    	 
    	}
    	catch(Exception e)
    	{
    		logger.error("Error processing payroll service", e);
    	}
    }
    
    

	@Override
	public List<PayrollEmployeeDto> getAllPayrollEmployee(Integer payrollId, String payrollDate) {
		List<Integer> empList =  new ArrayList<>();
		List<PayrollEmployeeDto> PayrollEmployeeDtoList =  new ArrayList<>();
		LocalDateTime startDate = dateFormatUtil.getDateStrAsLocalDateTime(payrollDate,
				CommonColumnConstants.DD_MM_YYYY);
		List <PayrollEmployeeResultSet> payrollEmployeeResultSet  = payrolEmployeeRepository.findPayEmployee(payrollId, TYPE);
		
		if (payrollEmployeeResultSet != null) {
			for(PayrollEmployeeResultSet payrollEmp : payrollEmployeeResultSet) {

				PayrollEmployeeDto payrollEmployeeDto = new PayrollEmployeeDto();
				BigDecimal grossPay = BigDecimal.ZERO;
				BigDecimal  deduction = BigDecimal.ZERO;
				BigDecimal  netPay = BigDecimal.ZERO;
				
				List<EmployeeSalaryComponentRelation>  empSalComRel =  EmpSalaryCompRelRepository.findByemployeeId(payrollEmp.getEmpId());

				if (empSalComRel != null)
					for (EmployeeSalaryComponentRelation result : empSalComRel) {
						if (SALARY_STRUCTURE_DEDUCTION_ID.equals(result.getSalaryStructure().getId())) {
							deduction =deduction.add(result.getMonthlyAmount());
						}
						else
						grossPay = grossPay.add(result.getMonthlyAmount());

					}
				netPay = grossPay.subtract(deduction) ;
				payrollEmployeeDto.setId(payrollEmp.getId());
				payrollEmployeeDto.setEmpId(payrollEmp.getEmpId());
				payrollEmployeeDto.setEmpName(payrollEmp.getEmpFirstName()+" "+payrollEmp.getEmpLastName());
				payrollEmployeeDto.setEmpCode(payrollEmp.getEmpCode());
				payrollEmployeeDto.setLopDay(payrollEmp.getLopDays());
				payrollEmployeeDto.setNoOfDays(payrollEmp.getNoOfDays());	
				payrollEmployeeDto.setGrossPay(grossPay);
				payrollEmployeeDto.setDeduction(deduction);
				payrollEmployeeDto.setNetPay(netPay);
				empList.add(payrollEmp.getEmpId());
				PayrollEmployeeDtoList.add(payrollEmployeeDto);
				}
			}

		List<PayrollEmployeeDto> allEmployeeList = employeeService.getAllActiveCompleteEmployee(payrollDate);

		if(allEmployeeList!=null && !allEmployeeList.isEmpty()) {
			for (PayrollEmployeeDto payrollEmp : allEmployeeList) {

				if (empList.contains(payrollEmp.getEmpId()))
					continue;

				PayrollEmployeeDto payrollEmployeeDto = new PayrollEmployeeDto();
				BigDecimal grossPay = BigDecimal.ZERO;
				BigDecimal deduction =BigDecimal.ZERO;
				BigDecimal  netPay = BigDecimal.ZERO;
				BigDecimal LopDay = BigDecimal.valueOf(0);
				BigDecimal NoOfDays = BigDecimal.valueOf(0);
				List<EmployeeSalaryComponentRelation>  empSalComRel =  EmpSalaryCompRelRepository.findByemployeeId(payrollEmp.getEmpId());

				if (empSalComRel != null)
					for (EmployeeSalaryComponentRelation result : empSalComRel) {
						if (SALARY_STRUCTURE_DEDUCTION_ID.equals(result.getSalaryStructure().getId())) {
							deduction =deduction.add(result.getMonthlyAmount());
						}
						else
						grossPay = grossPay.add(result.getMonthlyAmount());

						NoOfDays = result.getNoOfDays();
					}

				netPay = grossPay.subtract(deduction) ;
				payrollEmployeeDto.setId(payrollEmp.getId());
				payrollEmployeeDto.setEmpId(payrollEmp.getEmpId());
				payrollEmployeeDto.setEmpName(payrollEmp.getEmpName());
				payrollEmployeeDto.setEmpCode(payrollEmp.getEmpCode());
				payrollEmployeeDto.setLopDay(LopDay);
				payrollEmployeeDto.setNoOfDays(NoOfDays);
				payrollEmployeeDto.setGrossPay(grossPay);
				payrollEmployeeDto.setDeduction(deduction);
				payrollEmployeeDto.setNetPay(netPay);
				PayrollEmployeeDtoList.add(payrollEmployeeDto);

			}
		}

		return PayrollEmployeeDtoList;
		
	}
	
	
	@Override
	public List<PayrollEmployeeDto> getAllPayrollEmployeeForApprover(Integer payrollId) {
		List<PayrollEmployeeDto> PayrollEmployeeDtoList = new ArrayList<>();

		List <PayrollEmployeeResultSet> payrollEmployeeResultSet = payrolEmployeeRepository.findPayEmployee(payrollId, TYPE);
		int perDaySalary=0;
		if (payrollEmployeeResultSet != null) {
			for(PayrollEmployeeResultSet payrollEmp : payrollEmployeeResultSet) {

				PayrollEmployeeDto payrollEmployeeDto = new PayrollEmployeeDto();
				BigDecimal grossPay = BigDecimal.ZERO;
				BigDecimal deduction =  BigDecimal.ZERO;
				BigDecimal netPay =  BigDecimal.ZERO;

				List<Salary> salaryList = salaryRepository.findByPayrollEmployeeId(payrollId,payrollEmp.getEmpId());
				if (salaryList != null)
					for (Salary result : salaryList) {
						if (result.getSalaryComponent()!=null && SALARY_STRUCTURE_DEDUCTION_ID.equals(result.getSalaryComponent().getSalaryStructure().getId())) {
							deduction =deduction.add( result.getTotalAmount());
						}
						else
						if (result.getSalaryComponent()!=null)
						grossPay = grossPay.add( result.getTotalAmount());
					}
				netPay = grossPay.subtract(deduction);

				payrollEmployeeDto.setId(payrollEmp.getId());
				payrollEmployeeDto.setEmpId(payrollEmp.getEmpId());
				payrollEmployeeDto.setEmpName(payrollEmp.getEmpFirstName()+" "+payrollEmp.getEmpLastName());
				payrollEmployeeDto.setEmpCode(payrollEmp.getEmpCode());
				payrollEmployeeDto.setLopDay(payrollEmp.getLopDays());
				payrollEmployeeDto.setNoOfDays(payrollEmp.getNoOfDays());
				payrollEmployeeDto.setGrossPay(grossPay);
				payrollEmployeeDto.setDeduction(deduction);
				payrollEmployeeDto.setNetPay(netPay);
				PayrollEmployeeDtoList.add(payrollEmployeeDto);
			}
		}

		return PayrollEmployeeDtoList;
	}

	
	@Override
	public Payroll updatePayrol(User user, PayrolRequestModel payrolRequestModel, Integer userId) {
		
        Payroll payroll = getByPayrollById(payrolRequestModel.getPayrollId());
        payroll.setDeleteFlag(Boolean.FALSE);
        payroll.setIsActive(true);
        payroll.setPayrollApprover(payrolRequestModel.getApproverId());
		payroll.setComment(null);
        payroll.setGeneratedBy(user.getUserId().toString());

		if (payrolRequestModel.getSalaryDate() != null) {
			Instant instant = Instant.ofEpochMilli(payrolRequestModel.getSalaryDate().getTime());
			LocalDateTime payrollDate = LocalDateTime.ofInstant(instant,
					ZoneId.systemDefault());
			payroll.setPayrollDate(payrollDate);}
	     if(payrolRequestModel.getPayPeriod()!=null){
	        payroll.setPayPeriod(payrolRequestModel.getPayPeriod());
	     }	
	     if(payrolRequestModel.getPayrollSubject()!=null){
	        payroll.setPayrollSubject(payrolRequestModel.getPayrollSubject());
	     }
	     payroll.setDeleteFlag(Boolean.FALSE);
		payroll.setTotalAmountPayroll(payrolRequestModel.getTotalAmountPayroll());
		payroll.setDueAmountPayroll(payrolRequestModel.getTotalAmountPayroll());
	     payrollRepository.save(payroll);

	     List<PayrollEmployee> payrollEmpList = payrolEmployeeRepository.findByPayrollId(payroll);

		if (payrollEmpList != null) {
			for (PayrollEmployee payrollEmployee : payrollEmpList) {
				payrolEmployeeRepository.delete(payrollEmployee);
			}
		}

		for (Integer employee : payrolRequestModel.getEmployeeListIds()) {
			PayrollEmployee payrollEmployee = new PayrollEmployee();
			payrollEmployee.setEmployeeID(employeeService.findByPK(employee));
			payrollEmployee.setPayrollId(payrollRepository.findById(payroll.getId()));
			payrolEmployeeRepository.save(payrollEmployee);
		}

		List<GeneratePayrollPersistModel> generatePayrollPersistModels = new ArrayList<>();
		payrollRestHepler.generatePayroll(payrolRequestModel, generatePayrollPersistModels, user, payroll);

     return payroll;
		
	}

	@Override
	public Payroll getByPayrollById(Integer payrollId) {

		return payrollRepository.findById(payrollId);
	}

	public void deletePayroll(Integer id){

		Payroll payroll = getByPayrollById(id);
		if(payroll!=null) {
			List<PayrollEmployee> payrollEmpList = payrolEmployeeRepository.findByPayrollId(payroll);

			if (payrollEmpList != null) {
			payrolEmployeeRepository.deleteAll(payrollEmpList);

			}

			Map<String, Object> paramSalary = new HashMap<>();
			paramSalary.put("payrollId", payroll.getId());
			List<Salary> list = salaryService.findByAttributes(paramSalary);
			if (list != null) {
				for (Salary salary : list) {
					salaryService.delete(salary);
				}
			}
			payrollRepository.delete(payroll);
		}

   }
	
	/**
	 * 
	 * @param id
	 * @return
	 */
	public List<Integer> getEmployeeList(Integer id) {
	    
		 List<Integer> empIdList = payrolEmployeeRepository.getEmployeeListByPayrollId(id);
		
		return empIdList;
	}

	public PaginationResponseModel getList(Map<PayrollFilterEnum, Object> map,
														   PaginationModel paginationModel){
		return payrollDao.getList(map, paginationModel);
	}

	@Override
	protected Dao<Integer, Payroll> getDao() {
		return payrollDao;
	}
}
