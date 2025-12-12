package com.simpleaccounts.rest.employeecontroller;

import com.simpleaccounts.constant.CommonColumnConstants;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.repository.PayrolEmployeeRepository;
import com.simpleaccounts.rest.payroll.service.EmployeeSalaryComponentRelationService;
import com.simpleaccounts.rest.payroll.service.SalaryComponentService;
import com.simpleaccounts.rest.payroll.service.SalaryRoleService;
import com.simpleaccounts.service.*;

import java.io.IOException;
import java.math.BigDecimal;

import java.time.LocalDateTime;

import java.util.*;

import com.simpleaccounts.utils.DateFormatUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author admin
 */
@Component
@RequiredArgsConstructor
public class EmployeeHelper {

	private static final Logger logger = LoggerFactory.getLogger(EmployeeHelper.class);

	private final CountryService countryService;

	private final SalaryComponentService salaryComponentService;

	private final EmployeeSalaryComponentRelationService employeeSalaryComponentRelationService;

	@Autowired
	CurrencyService currencyService;

	private final EmployeeService employeeService;

	private final SalaryRoleService salaryRoleService;

	private final EmployeeBankDetailsService employeeBankDetailsService;

	private final EmployeeDesignationService employeeDesignationService;
	private final StateService stateService;
	private final EmploymentService employmentService;
	private final DateFormatUtil dateUtil;

	private final PayrolEmployeeRepository payrolEmployeeRepository;
	public List<EmployeeListModel> getListModel(Object employeList) {

		List<EmployeeListModel> employeeListModels = new ArrayList<>();
		if (employeList != null) {
			for (Employee employee : (List<Employee>) employeList) {
				EmployeeListModel empModel = new EmployeeListModel();
				empModel.setId(employee.getId());
				empModel.setEmail(employee.getEmail());
				empModel.setFirstName(employee.getFirstName());
				empModel.setMiddleName(employee.getMiddleName());
				empModel.setLastName(employee.getLastName());
				empModel.setDob(employee.getDob());
				empModel.setGender(employee.getGender());
				empModel.setBloodGroup(employee.getBloodGroup());
				empModel.setMobileNumber(employee.getMobileNumber());
				empModel.setPermanentAddress(employee.getPermanentAddress());
				empModel.setPresentAddress(employee.getPresentAddress());
				empModel.setIsActive(employee.getIsActive());
				if(employee.getState()!=null) {
					empModel.setStateId(employee.getState().getId());
				}
				empModel.setCity(employee.getCity());
				if(employee.getSalaryRoleId()!=null) {
					empModel.setSalaryRoleId(employee.getSalaryRoleId().getId());
				}
				if(employee.getEmployeeDesignationId()!=null) {
					empModel.setEmployeeDesignationId(employee.getEmployeeDesignationId().getId());
				}
				empModel.setPincode(employee.getPincode());
				empModel.setIsActive(employee.getIsActive());
				Map<String, Object> param1 = new HashMap<>();
				param1.put("employee", employee);
				List<Employment> employmentList = employmentService.findByAttributes(param1);
				Employment employment = null;
				if (employmentList!=null&&!employmentList.isEmpty()){
					employment = employmentList.get(0);
					empModel.setEmployeeCode(employment.getEmployeeCode());
				}else {
					empModel.setEmployeeCode("-");
				}
//
				employeeListModels.add(empModel);
			}
		}
		return employeeListModels;
	}
	public List<EmployeeListModel> getListModelForProfileCompleted(Object employeList) {

		List<EmployeeListModel> employeeListModels = new ArrayList<>();
		if (employeList != null) {
			for (Employee employee : (List<Employee>) employeList) {
				EmployeeListModel empModel = new EmployeeListModel();
				empModel.setId(employee.getId());
				empModel.setEmail(employee.getEmail());
				empModel.setFirstName(employee.getFirstName());
				empModel.setMiddleName(employee.getMiddleName());
				empModel.setLastName(employee.getLastName());
				empModel.setDob(employee.getDob());
				empModel.setGender(employee.getGender());
				empModel.setBloodGroup(employee.getBloodGroup());
				empModel.setMobileNumber(employee.getMobileNumber());
				empModel.setPermanentAddress(employee.getPermanentAddress());
				empModel.setPresentAddress(employee.getPresentAddress());
				empModel.setIsActive(employee.getIsActive());
				if(employee.getState()!=null) {
					empModel.setStateId(employee.getState().getId());
				}
				empModel.setCity(employee.getCity());
				if(employee.getSalaryRoleId()!=null) {
					empModel.setSalaryRoleId(employee.getSalaryRoleId().getId());
				}
				if(employee.getEmployeeDesignationId()!=null) {
					empModel.setEmployeeDesignationId(employee.getEmployeeDesignationId().getId());
				}
				empModel.setPincode(employee.getPincode());
				empModel.setIsActive(employee.getIsActive());
				employeeListModels.add(empModel);
			}
		}

		return employeeListModels;
	}

	public Employee getEntity(EmployeePersistModel employeePersistModel, Integer userId) {
		Employee employee = new Employee();
		if (employeePersistModel.getId() != null) {
			employee = employeeService.findByPK(employeePersistModel.getId());
			employee.setId(employeePersistModel.getId());
		}
		if(employeePersistModel.getHomeAddress()!=null) {
			employee.setHomeAddress(employeePersistModel.getHomeAddress());
		}
		if(employeePersistModel.getEmergencyContactName1()!=null) {
			employee.setEmergencyContactName1(employeePersistModel.getEmergencyContactName1());
		}
		if(employeePersistModel.getEmergencyContactNumber1()!=null) {
			employee.setEmergencyContactNumber1(employeePersistModel.getEmergencyContactNumber1());
		}
		if(employeePersistModel.getEmergencyContactRelationship1()!=null) {
			employee.setEmergencyContactRelationship1(employeePersistModel.getEmergencyContactRelationship1());
		}
		if(employeePersistModel.getEmergencyContactName2()!=null) {
			employee.setEmergencyContactName2(employeePersistModel.getEmergencyContactName2());
		}
		if(employeePersistModel.getEmergencyContactNumber2()!=null) {
			employee.setEmergencyContactNumber2(employeePersistModel.getEmergencyContactNumber2());
		}

		if(employeePersistModel.getEmergencyContactRelationship2()!=null) {
			employee.setEmergencyContactRelationship2(employeePersistModel.getEmergencyContactRelationship2());
		}

//		// Educational details section

		if(employeePersistModel.getUniversity()!=null) {
			employee.setUniversity(employeePersistModel.getUniversity());
		}
		if(employeePersistModel.getQualification()!=null) {
			employee.setQualification(employeePersistModel.getQualification());
		}
		if(employeePersistModel.getQualificationYearOfCompletionDate()!=null) {
			employee.setQualificationYearOfCompletionDate(employeePersistModel.getQualificationYearOfCompletionDate());
		}
		employee.setEmail(employeePersistModel.getEmail());
		employee.setFirstName(employeePersistModel.getFirstName());
		employee.setMiddleName(employeePersistModel.getMiddleName());
		employee.setLastName(employeePersistModel.getLastName());
		employee.setMaritalStauts(employeePersistModel.getMaritalStatus());
		if (employeePersistModel.getId() != null) {
			employee.setCreatedBy(userId);
			employee.setCreatedDate(LocalDateTime.now());
		} else {
			employee.setLastUpdatedBy(userId);
			employee.setLastUpdateDate(LocalDateTime.now());
		}
		try {
			employee.setProfileImageBinary((employeePersistModel.getProfileImageBinary() != null)?employeePersistModel.getProfileImageBinary().getBytes():null);
		} catch (IOException e) {
			logger.error("Error processing employee", e);
		}
		if (employeePersistModel.getCountryId() != null) {
			employee.setCountry(countryService.findByPK(employeePersistModel.getCountryId()));

		}

		employee.setIsActive(employeePersistModel.getIsActive());
		employee.setBloodGroup(employeePersistModel.getBloodGroup());
		employee.setCity(employeePersistModel.getCity());
		employee.setGender(employeePersistModel.getGender());
		if(employeePersistModel.getStateId()!=null) {
			employee.setState(stateService.findByPK(employeePersistModel.getStateId()));
		}
		if(employeePersistModel.getParentId()!=null) {
			employee.setParentId(employeePersistModel.getParentId());
		}
		employee.setPincode(employeePersistModel.getPincode());
		employee.setPresentAddress(employeePersistModel.getPresentAddress());
		employee.setPermanentAddress(employeePersistModel.getPermanentAddress());
		employee.setMobileNumber(employeePersistModel.getMobileNumber());
 		if(employeePersistModel.getSalaryRoleId()!=null) {
			employee.setSalaryRoleId(salaryRoleService.findByPK(employeePersistModel.getSalaryRoleId()));
		}
		if(employeePersistModel.getEmployeeDesignationId()!=null) {
			employee.setEmployeeDesignationId(employeeDesignationService.findByPK(employeePersistModel.getEmployeeDesignationId()));
		}

		if (employeePersistModel.getDob() != null) {
			employee.setDob(dateUtil.getDateStrAsLocalDateTime(employeePersistModel.getDob(), CommonColumnConstants.DD_MM_YYYY));
		}
		return employee;
	}

	public EmployeeListModel getModel(Employee employee, Employment employment, EmployeeBankDetails employeeBankDetails, EmployeeParentRelation employeeParentRelation) {
		EmployeeListModel empModel = new EmployeeListModel();

		empModel.setId(employee.getId());
		empModel.setEmail(employee.getEmail());
		empModel.setFirstName(employee.getFirstName());
		empModel.setMiddleName(employee.getMiddleName());
		empModel.setLastName(employee.getLastName());
		empModel.setPresentAddress(employee.getPresentAddress());
		empModel.setPermanentAddress(employee.getPermanentAddress());
		empModel.setMaritalStatus(employee.getMaritalStauts());
		if(employee.getHomeAddress()!=null) {
			empModel.setHomeAddress(employee.getHomeAddress());
		}
		if(employee.getEmergencyContactName1()!=null) {
			empModel.setEmergencyContactName1(employee.getEmergencyContactName1());
		}
		if(employee.getEmergencyContactNumber1()!=null) {
			empModel.setEmergencyContactNumber1(employee.getEmergencyContactNumber1());
		}
		if(employee.getEmergencyContactRelationship1()!=null) {
			empModel.setEmergencyContactRelationship1(employee.getEmergencyContactRelationship1());
		}
		if(employee.getEmergencyContactName2()!=null) {
			empModel.setEmergencyContactName2(employee.getEmergencyContactName2());
		}
		if(employee.getEmergencyContactNumber2()!=null) {
			empModel.setEmergencyContactNumber2(employee.getEmergencyContactNumber2());
		}

		if(employee.getEmergencyContactRelationship2()!=null) {
			empModel.setEmergencyContactRelationship2(employee.getEmergencyContactRelationship2());
		}

//		// Educational details section

		if(employee.getUniversity()!=null) {
			empModel.setUniversity(employee.getUniversity());
		}
		if(employee.getQualification()!=null) {
			empModel.setQualification(employee.getQualification());
		}
		if(employee.getQualificationYearOfCompletionDate()!=null) {
			empModel.setQualificationYearOfCompletionDate(employee.getQualificationYearOfCompletionDate());
		}
		if(employee.getCountry() != null){
		empModel.setCountryId(employee.getCountry().getCountryCode());}

		if(employee.getCountry() != null){
		empModel.setCountryName(employee.getCountry().getCountryName());}

		if(employee.getState() != null){
		empModel.setStateId(employee.getState().getId());}

		if(employee.getSalaryRoleId() != null){
		empModel.setSalaryRoleId(employee.getSalaryRoleId().getId());}

		if(employee.getState()!=null){
		empModel.setStateId(employee.getState().getId());}

		if(employee.getPincode()!=null){
		empModel.setPincode(employee.getPincode());}

		if(employee.getCity()!=null){
		empModel.setCity(employee.getCity());}

		if(employee.getBloodGroup()!=null){
		empModel.setBloodGroup(employee.getBloodGroup());}

		if(employee.getDob()!=null){
		empModel.setDob(employee.getDob());}

		if(employee.getMobileNumber()!=null){
		empModel.setMobileNumber(employee.getMobileNumber());}

		if(employee.getGender()!=null){
		empModel.setGender(employee.getGender());}

		if(employee.getEmployeeDesignationId()!=null){
		empModel.setEmployeeDesignationId(employee.getEmployeeDesignationId().getId());}

		if(employee.getIsActive()!=null){
		empModel.setIsActive(employee.getIsActive());}
		if (employeeBankDetails!=null) {
			if (employeeBankDetails.getBankId() != null) {
				empModel.setBankId(employeeBankDetails.getBankId());
			}
			if (employeeBankDetails.getBankName() != null) {
				empModel.setBankName(employeeBankDetails.getBankName());
			}
			if (employeeBankDetails.getBranch() != null) {
				empModel.setBranch(employeeBankDetails.getBranch());
			}
			if (employeeBankDetails.getRoutingCode() != null) {
				empModel.setRoutingCode(employeeBankDetails.getRoutingCode());
			}
			if (employeeBankDetails.getId() != null)
				empModel.setEmployeeBankDetailsId(employeeBankDetails.getId());
			if (employeeBankDetails.getIban() != null) {
				empModel.setIban(employeeBankDetails.getIban());
			}
			if (employeeBankDetails.getAccountHolderName() != null) {
				empModel.setAccountHolderName(employeeBankDetails.getAccountHolderName());
			}

			if (employeeBankDetails.getAccountNumber() != null) {
				empModel.setAccountNumber(employeeBankDetails.getAccountNumber());
			}

			if (employeeBankDetails.getRoutingCode() != null) {
				empModel.setRoutingCode(employeeBankDetails.getRoutingCode());
			}

			if (employeeBankDetails.getSwiftCode() != null) {
				empModel.setSwiftCode(employeeBankDetails.getSwiftCode());
			}
		}
		if (employment!=null) {
			if (employment.getId() != null)
				empModel.setEmploymentId(employment.getId());
			if (employee.getEmployeeDesignationId() != null) {
				empModel.setEmployeeDsignationName(employee.getEmployeeDesignationId().getDesignationName());
			}
			if(employment.getAgentId()!=null){
				empModel.setAgentId(employment.getAgentId());
			}else
				empModel.setAgentId("");
			if (employment.getLeavesAvailed() != null) {
				empModel.setLeavesAvailed(empModel.getLeavesAvailed());
			}
			if (employment.getDepartment() != null) {
				empModel.setDepartment(employment.getDepartment());
			}
			if (employment.getEmployeeCode() != null) {
				empModel.setEmployeeCode(employment.getEmployeeCode());
			}
			if (employment.getAvailedLeaves() != null) {
				empModel.setAvailedLeaves(employment.getAvailedLeaves());
			}

			if (employment.getContractType() != null) {
				empModel.setContractType(employment.getContractType());
			}
			if (employment.getDateOfJoining() != null) {
				empModel.setDateOfJoining(dateUtil.getLocalDateTimeAsString(employment.getDateOfJoining(), CommonColumnConstants.DD_MM_YYYY));
			}

			if (employment.getLabourCard() != null) {
				empModel.setLabourCard(employment.getLabourCard());
			}
			if (employment.getLeavesAvailed() != null) {
				empModel.setLeavesAvailed(employment.getLeavesAvailed());
			}
			if (employment.getPassportNumber() != null) {
				empModel.setPassportNumber(employment.getPassportNumber());
			}
			if (employment.getPassportExpiryDate() != null) {
				empModel.setPassportExpiryDate(dateUtil.getLocalDateTimeAsString(employment.getPassportExpiryDate(), CommonColumnConstants.DD_MM_YYYY));
			}
			if (employment.getVisaExpiryDate() != null) {
				empModel.setVisaExpiryDate(dateUtil.getLocalDateTimeAsString(employment.getVisaExpiryDate(), CommonColumnConstants.DD_MM_YYYY));
			}
			if (employment.getVisaNumber() != null) {
				empModel.setVisaNumber(employment.getVisaNumber());
			}

			if (employment.getEmployee() != null) {
				empModel.setEmployee(employee.getId());
			}
			if (employment.getGrossSalary() != null) {
				empModel.setGrossSalary(employment.getGrossSalary());
				empModel.setCtcType(employment.getCtcType());
			}
			if (employment.getAvailedLeaves() != null) {
				empModel.setAvailedLeaves(employment.getAvailedLeaves());

			}
			if (employment.getContractType() != null) {
				empModel.setContractType(employment.getContractType());
			}
		}
		if(employee.getPermanentAddress() != null){
			empModel.setPermanentAddress(employee.getPermanentAddress());
		}
		if(employee.getProfileImageBinary() != null){
			empModel.setProfileImageBinary(employee.getProfileImageBinary());
		}

		if(employee.getSalaryRoleId() != null){
			empModel.setSalaryRoleId(employee.getSalaryRoleId().getId());
			empModel.setSalaryRoleName(employee.getSalaryRoleId().getRoleName());
		}

		if(employee.getState()!= null ){
			empModel.setStateName(employee.getState().getStateName());
		}
		empModel.setParentId(employee.getParentId());
		if(employeeParentRelation!=null) {
			empModel.setChildID(employeeParentRelation.getChildID().getId());
			empModel.setChildType(employeeParentRelation.getChildType());
			empModel.setChildType(employeeParentRelation.getChildType());
			empModel.setCreatedBy(employeeParentRelation.getCreatedBy());
			empModel.setLastUpdatedBy(employeeParentRelation.getLastUpdatedBy());
			empModel.setLastUpdateDate(dateUtil.getLocalDateTimeAsString(employeeParentRelation.getCreatedDate(), CommonColumnConstants.DD_MM_YYYY));
		}
		if(employee!=null){
			List<PayrollEmployee> payrollEmployeeList = payrolEmployeeRepository.findByEmployeeID(employee);
			if(payrollEmployeeList!=null && !payrollEmployeeList.isEmpty()){
				empModel.setIsEmployeeDeletable(Boolean.FALSE);
			}
			else{
				empModel.setIsEmployeeDeletable(Boolean.TRUE);
			}
		}
		/**
		 * Employees Child Activity check added for DOJ-edit
		 */
		List<PayrollEmployee> employeeChildActivityLink = payrolEmployeeRepository.findByEmployeeID(employee);
		empModel.setEmployeeChildActivitiesPresentOrNot(
				employeeChildActivityLink!=null && !employeeChildActivityLink.isEmpty()
						?Boolean.TRUE
						:Boolean.FALSE
		);
		return empModel;
	}

	@Transactional(rollbackFor = Exception.class)
	public List<SalaryComponent> createDefaultSalaryComponentListForThisEmployee(Employee employee){

		    List<SalaryComponent> defaultSalaryComponentList = salaryComponentService.getDefaultSalaryComponentList();
		    for (SalaryComponent model : defaultSalaryComponentList) {
				EmployeeSalaryComponentRelation employeeSalaryComponentRelation = new EmployeeSalaryComponentRelation();
				employeeSalaryComponentRelation.setEmployeeId(employee);
				employeeSalaryComponentRelation.setSalaryComponentId(model);
				employeeSalaryComponentRelation.setSalaryStructure(model.getSalaryStructure());
				employeeSalaryComponentRelation.setFormula(model.getFormula());
				employeeSalaryComponentRelation.setDeleteFlag(false);
				employeeSalaryComponentRelation.setFlatAmount(model.getFlatAmount());
				employeeSalaryComponentRelation.setDescription(model.getDescription());
				employeeSalaryComponentRelation.setMonthlyAmount(BigDecimal.ZERO);
				employeeSalaryComponentRelation.setYearlyAmount(BigDecimal.ZERO);
				employeeSalaryComponentRelation.setNoOfDays(BigDecimal.valueOf(30));
				employeeSalaryComponentRelationService.persist(employeeSalaryComponentRelation);

		    }

		return defaultSalaryComponentList;

	}

}
