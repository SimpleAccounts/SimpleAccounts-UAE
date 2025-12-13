package com.simpleaccounts.service.impl;

import static com.simpleaccounts.rest.invoicecontroller.HtmlTemplateConstants.THANK_YOU_TEMPLATE;

import com.simpleaccounts.constant.CommonColumnConstants;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.constant.EmailConstant;
import com.simpleaccounts.constant.dbfilter.EmployeeFilterEnum;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.EmployeeDao;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.repository.EmployeeRepository;
import com.simpleaccounts.repository.EmployeeSalaryComponentRelationRepository;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.payroll.dto.PayrollEmployeeDto;
import com.simpleaccounts.rest.payroll.dto.PayrollEmployeeResultSet;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.*;
import com.simpleaccounts.utils.DateFormatUtil;
import com.simpleaccounts.utils.EmailSender;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.simpleaccounts.utils.DateFormatUtil;
import com.simpleaccounts.utils.EmailSender;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;
import javax.xml.bind.DatatypeConverter;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Created by Suraj Rahade on 24/04/2021.
 */
@Service("employeeService")
@Transactional
@RequiredArgsConstructor
public class EmployeeServiceImpl extends EmployeeService {

    private final Logger logger = LoggerFactory.getLogger(ContactService.class);

    private final EmployeeDao employeeDao;
    private final EmployeeRepository employeeRepository;
    private final EmployeeSalaryComponentRelationRepository EmpSalaryCompRelRepository;

    private final DateFormatUtil dateFormatUtil;

    private final EmploymentService employmentService;

    private final ResourceLoader resourceLoader;

    private final EmailSender emailSender;

    private final EmaiLogsService emaiLogsService;

    private final UserService userService;

    private final JwtTokenUtil jwtTokenUtil;

    @Override
    public List<DropdownModel> getEmployeesForDropdown() {
        return employeeDao.getEmployeesForDropdown();
    }
    // id 3 is for deduction
    private static final Integer SALARY_STRUCTURE_DEDUCTION_ID = 3;
    public  List<DropdownObjectModel> getEmployeesNotInUserForDropdown(){

        return employeeDao.getEmployeesNotInUserForDropdown();
    }

    @Override
    public List<Employee> getEmployees(Integer pageNo, Integer pageSize) {
        return employeeDao.getEmployees(pageNo, pageSize);
    }

    @Override
    public List<Employee> getEmployees(String searchQuery, Integer pageNo, Integer pageSize) {
        return employeeDao.getEmployees(searchQuery, pageNo, pageSize);
    }

    @Override
    public Optional<Employee> getEmployeeByEmail(String email) {
        return employeeDao.getEmployeeByEmail(email);
    }

    @Override
    protected Dao<Integer, Employee> getDao() {
        return this.employeeDao;
    }
    
    @Override
    public PaginationResponseModel getEmployeeList(Map<EmployeeFilterEnum, Object> filterMap,PaginationModel paginationModel){
    	return employeeDao.getEmployeeList( filterMap,paginationModel);
    }

	@Override
	public void deleteByIds(ArrayList<Integer> ids) {
		employeeDao. deleteByIds(ids);
	}

    public  List<PayrollEmployeeDto> getAllActiveCompleteEmployee(String payrollDate){

        LocalDateTime startDate = dateFormatUtil.getDateStrAsLocalDateTime(payrollDate,
                CommonColumnConstants.DD_MM_YYYY);

        List<PayrollEmployeeDto> PayrollEmployeeDtoList =  new ArrayList<>();

        List <PayrollEmployeeResultSet> payrollEmployeeResultSet  = employeeRepository.getAllActiveCompleteEmployee();

        if (payrollEmployeeResultSet != null) {
            for(PayrollEmployeeResultSet payrollEmp : payrollEmployeeResultSet) {
                Employment employment=employmentService.findByPK(payrollEmp.getId());

              if(employment.getDateOfJoining().isBefore(startDate)==true || employment.getDateOfJoining().isEqual(startDate)==true)
              {
                    PayrollEmployeeDto payrollEmployeeDto = new PayrollEmployeeDto();

                    BigDecimal grossPay = BigDecimal.ZERO;
                    BigDecimal deduction = BigDecimal.ZERO;
                    BigDecimal netPay = BigDecimal.ZERO;
                    BigDecimal LopDay = BigDecimal.valueOf(0);
                    BigDecimal NoOfDays = BigDecimal.valueOf(0);

                    List<EmployeeSalaryComponentRelation> empSalComRel = EmpSalaryCompRelRepository.findByemployeeId(payrollEmp.getEmpId());

                    if (empSalComRel != null)
                        for (EmployeeSalaryComponentRelation result : empSalComRel) {
                            if (SALARY_STRUCTURE_DEDUCTION_ID.equals(result.getSalaryStructure().getId())) {
                                deduction = deduction.add(result.getMonthlyAmount());
                            } else
                                grossPay = grossPay.add(result.getMonthlyAmount());

                            NoOfDays = result.getNoOfDays();
                        }
                    netPay = grossPay.subtract(deduction);

                    payrollEmployeeDto.setId(payrollEmp.getId());
                    payrollEmployeeDto.setEmpId(payrollEmp.getEmpId());
                    payrollEmployeeDto.setEmpName(payrollEmp.getEmpFirstName() + " " + payrollEmp.getEmpLastName());
                    payrollEmployeeDto.setEmpCode(payrollEmp.getEmpCode());
                    payrollEmployeeDto.setLopDay(LopDay);
                    payrollEmployeeDto.setNoOfDays(NoOfDays);
                    payrollEmployeeDto.setGrossPay(grossPay);
                    payrollEmployeeDto.setDeduction(deduction);
                    payrollEmployeeDto.setNetPay(netPay);

                    PayrollEmployeeDtoList.add(payrollEmployeeDto);
                }
            }
        }

        return PayrollEmployeeDtoList;
    }

    @Override
    public boolean sendInvitationMail(Employee employee, HttpServletRequest request) {
        long millis=System.currentTimeMillis();

        Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
        User user=userService.findByPK(userId);
        String image="";
        if (user.getCompany() != null  && user.getCompany().getCompanyLogo() != null) {
            image = " data:image/jpg;base64," + DatatypeConverter.printBase64Binary(
                    user.getCompany().getCompanyLogo()) ;

        }
        String htmlContent="";
        try {
            byte[] contentData = Files.readAllBytes(Paths.get(resourceLoader.getResource("classpath:"+THANK_YOU_TEMPLATE).getURI()));
            htmlContent= new String(contentData, StandardCharsets.UTF_8);
        } catch (IOException e) {
            logger.error("Error processing employee service", e);
        }

        try {
            emailSender.send(employee.getEmail(), "Welcome To SimpleAccounts",
                    emailSender.invitationmailBody.replace("{name}", employee.getFirstName()+" "+employee.getLastName())
                            .replace("{companylogo}",image),
                    EmailConstant.ADMIN_SUPPORT_EMAIL,
                    EmailConstant.ADMIN_EMAIL_SENDER_NAME, true);
        } catch (MessagingException e) {
            logger.error("Error", e);

            return false;
        }
        return true;
    }

}
