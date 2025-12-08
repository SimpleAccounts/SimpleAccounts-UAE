package com.simpleaccounts.rest.employeecontroller;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.bank.model.DeleteModel;
import com.simpleaccounts.constant.dbfilter.EmployeeFilterEnum;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.repository.EmployeeRepository;
import com.simpleaccounts.repository.EmployeeSalaryComponentRelationRepository;
import com.simpleaccounts.rest.CorporateTax.CorporateTaxFiling;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.payroll.PayrollRestHepler;
import com.simpleaccounts.rest.payroll.SalaryTemplatePersistModel;
import com.simpleaccounts.rest.payroll.dto.PayrollEmployeeDto;
import com.simpleaccounts.rest.payroll.service.EmployeeSalaryComponentRelationService;
import com.simpleaccounts.rest.payroll.service.SalaryComponentService;
import com.simpleaccounts.rest.payroll.service.SalaryTemplateService;
import com.simpleaccounts.rest.usercontroller.UserModel;
import com.simpleaccounts.rfq_po.PoQuatation;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.EmployeeBankDetailsService;
import com.simpleaccounts.service.EmployeeParentRelationService;
import com.simpleaccounts.service.EmployeeService;

import com.simpleaccounts.service.EmploymentService;
import com.simpleaccounts.utils.DateFormatUtil;
import com.simpleaccounts.utils.MessageUtil;
import com.simpleaccounts.utils.SimpleAccountsMessage;
import com.simpleaccounts.utils.TransactionCategoryCreationHelper;
import io.swagger.annotations.ApiOperation;

import java.time.LocalDateTime;
import java.util.*;
import javax.servlet.http.HttpServletRequest;

import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;

/**
 *
 * @author Sonu
 *
 * @author saurabhg 2/1/2020
 */
@RestController
@RequestMapping(value = "/rest/employee")
public class EmployeeController {

	private final Logger logger = LoggerFactory.getLogger(EmployeeController.class);

	@Autowired
	private EmployeeService employeeService;

	@Autowired
	private EmployeeHelper employeeHelper;

	@Autowired
	private JwtTokenUtil jwtTokenUtil;

	@Autowired
	private PayrollRestHepler payrollRestHepler;

	@Autowired
	private EmployeeParentRelationService employeeParentRelationService;

	@Autowired
	private EmploymentService employmentService;

	@Autowired
	private EmployeeBankDetailsService employeeBankDetailsService;

	@Autowired
	EmployeeSalaryComponentRelationService employeeSalaryComponentRelationService;

	@Autowired
	private TransactionCategoryCreationHelper transactionCategoryCreationHelper;
	@Autowired
	private EmployeeRepository employeeRepository;
	@Autowired
	private EmploymentRepository employmentRepository;
	@Autowired
	private EmployeeSalaryComponentRelationRepository employeeSalaryComponentRelationRepository;
	@Autowired
	private EmployeeBankDetailsRepository employeeBankDetailsRepository;

	@LogRequest
	@ApiOperation(value = "Get Employee List")
	@GetMapping(value = "/getList")
	public ResponseEntity<PaginationResponseModel> getEmployeeList(EmployeeRequestFilterModel filterModel){

		try {

			Map<EmployeeFilterEnum, Object> filterDataMap = new EnumMap<>(EmployeeFilterEnum.class);
			filterDataMap.put(EmployeeFilterEnum.FIRST_NAME, filterModel.getName());
			filterDataMap.put(EmployeeFilterEnum.EMAIL, filterModel.getEmail());
			filterDataMap.put(EmployeeFilterEnum.DELETE_FLAG, false);

			PaginationResponseModel response = employeeService.getEmployeeList(filterDataMap, filterModel);
			if (response == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			} else {
				response.setData(employeeHelper.getListModel(response.getData()));
				return new ResponseEntity<>(response, HttpStatus.OK);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}
	@LogRequest
	@ApiOperation(value = "Get Employee List")
	@GetMapping(value = "/getListForActiveEmployees")
	public ResponseEntity<PaginationResponseModel> getEmployeeList1(EmployeeRequestFilterModel filterModel){

		try {

			Map<EmployeeFilterEnum, Object> filterDataMap = new EnumMap<>(EmployeeFilterEnum.class);
			filterDataMap.put(EmployeeFilterEnum.FIRST_NAME, filterModel.getName());
			filterDataMap.put(EmployeeFilterEnum.EMAIL, filterModel.getEmail());
			filterDataMap.put(EmployeeFilterEnum.DELETE_FLAG, false);
			filterDataMap.put(EmployeeFilterEnum.IS_ACTIVE, true);
			PaginationResponseModel response = employeeService.getEmployeeList(filterDataMap, filterModel);
			if (response == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			} else {
				response.setData(employeeHelper.getListModelForProfileCompleted(response.getData()));
				return new ResponseEntity<>(response, HttpStatus.OK);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}
	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete Employee By ID")
	@DeleteMapping(value = "/delete")
	public ResponseEntity<?> deleteEmployee(@RequestParam(value = "id") Integer id) {
		try {
			Employee employee = employeeRepository.findById(id).get();
			if(employee!=null){
				employee.setDeleteFlag(Boolean.TRUE);
				employeeRepository.save(employee);
			}
			Employment employment = employmentRepository.findByemployeeId(id);
			if(employment!=null){
				employment.setDeleteFlag(Boolean.TRUE);
				employmentRepository.save(employment);
			}
			List<EmployeeSalaryComponentRelation> employeeSalaryComponentRelationList = employeeSalaryComponentRelationRepository.findByemployeeId(id);
			if(employeeSalaryComponentRelationList!=null){
				for(EmployeeSalaryComponentRelation employeeSalaryComponentRelation : employeeSalaryComponentRelationList){
					employeeSalaryComponentRelation.setDeleteFlag(Boolean.TRUE);
					employeeSalaryComponentRelationRepository.save(employeeSalaryComponentRelation);
				}
			}
			EmployeeBankDetails employeeBankDetails = employeeBankDetailsRepository.findByEmployeeId(id);{
				if(employeeBankDetails!=null){
					employeeBankDetails.setDeleteFlag(Boolean.TRUE);
					employeeBankDetailsRepository.save(employeeBankDetails);
				}
			}
			SimpleAccountsMessage message = null;
			message = new SimpleAccountsMessage("0073",
					MessageUtil.getMessage("employee.deleted.successful.msg.0073"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {
			SimpleAccountsMessage message= null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("delete.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete Employee in Bulk")
	@DeleteMapping(value = "/deletes")
	public ResponseEntity deleteProducts(@RequestBody DeleteModel ids) {
		try {
			employeeService.deleteByIds(ids.getIds());
			return new ResponseEntity(HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@ApiOperation(value = "Get Employee By ID")
	@GetMapping(value = "/getById")
	public ResponseEntity<EmployeeListModel> getEmployeeById(@RequestParam(value = "id") Integer id) {
		try {
			Employee employee = employeeService.findByPK(id);
			Map<String, Object> param = new HashMap<>();
			param.put("employee", employee);
			List<EmployeeBankDetails> employeeBankDetailsList = employeeBankDetailsService.findByAttributes(param);
			EmployeeBankDetails employeeBankDetails = null;
			if (employeeBankDetailsList!=null&&!employeeBankDetailsList.isEmpty()){
				 employeeBankDetails = employeeBankDetailsList.get(0);
			}
			Map<String, Object> param1 = new HashMap<>();
			param1.put("employee", employee);
			List<Employment> employmentList = employmentService.findByAttributes(param1);
			Employment employment = null;
			if (employmentList!=null&&!employmentList.isEmpty()){
			 employment = employmentList.get(0);}
			Map<String, Object> param2 = new HashMap<>();
			param2.put("childID", employee);
			List<EmployeeParentRelation> employeeParentRelationList = employeeParentRelationService.findByAttributes(param2);
			EmployeeParentRelation employeeParentRelation =null;
			if(employeeParentRelationList!=null && !employeeParentRelationList.isEmpty()) {
				employeeParentRelation = employeeParentRelationList.get(0);
			}

			if (employee == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			} else {
				return new ResponseEntity<>(employeeHelper.getModel(employee,employment,employeeBankDetails,employeeParentRelation), HttpStatus.OK);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Save new Employee")
	@PostMapping(value = "/save")
	public ResponseEntity<?> save(@ModelAttribute EmployeePersistModel employeePersistModel, HttpServletRequest request) {
		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
		try {
			SimpleAccountsMessage message = null;
			Map<String, Object> param = new HashMap<>();
			param.put("email", employeePersistModel.getEmail());
			param.put("deleteFlag", false);
			List<Employee> existingEmployee = employeeService.findByAttributes(param);
			if (existingEmployee != null && !existingEmployee.isEmpty()) {
				message = new SimpleAccountsMessage("0012",
						MessageUtil.getMessage("email.alreadyexists.0012"), true);
				logger.info(message.getMessage());
				return new ResponseEntity<>(message, HttpStatus.BAD_REQUEST);
			}
				Employee employee = employeeHelper.getEntity(employeePersistModel, userId);
				employee.setCreatedBy(userId);
				employee.setCreatedDate(LocalDateTime.now());
				employee.setDeleteFlag(Boolean.FALSE);
				employeeService.persist(employee);
			employeeService.sendInvitationMail(employee, request);
//			EmployeeBankDetails employeeBankDetails = payrollRestHepler.getEntity(employeePersistModel);
//			employeeBankDetails.setEmployee(employee);
//			employeeBankDetails.setCreatedBy(userId);
//			employeeBankDetails.setCreatedDate(LocalDateTime.now());
//			employeeBankDetailsService.persist(employeeBankDetails);
//			Employment employment = payrollRestHepler.getEmploymentEntity(employeePersistModel);
//			employment.setEmployee(employee);
//			employmentService.persist(employment);
			if(employee.getParentId()!=null) {
				Employee parentId = employeeService.findByPK(employee.getParentId());
				Employee childId = employee;
				employeeParentRelationService.addEmployeeParentRelation(parentId, childId, userId);
			}
			transactionCategoryCreationHelper.createTransactionCategoryForEmployee(employee);
			employeeHelper.createDefaultSalaryComponentListForThisEmployee(employee);

			message = new SimpleAccountsMessage("0071",
					MessageUtil.getMessage("employee.created.successful.msg.0071"), false);
			return new ResponseEntity<>(employee.getId().toString(),HttpStatus.OK);
		} catch (Exception e) {
			SimpleAccountsMessage message = null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("create.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Update Employee")
	@PostMapping(value = "/update")
	public ResponseEntity<?> update(@ModelAttribute EmployeePersistModel employeePersistModel, HttpServletRequest request) {
		try {
			SimpleAccountsMessage message = null;
			if (employeePersistModel.getId() != null && employeePersistModel.getId() > 0) {
				Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
				Employee employee = employeeHelper.getEntity(employeePersistModel, userId);
				employee.setLastUpdateDate(LocalDateTime.now());
				employee.setLastUpdatedBy(userId);
				employee.setCreatedBy(userId);
				employee.setCreatedDate(LocalDateTime.now());
				employeeService.update(employee);

//			EmployeeBankDetails employeeBankDetails = payrollRestHepler.getEmployeeBankDetailsEntity(employeePersistModel,employee,userId);
//			employeeBankDetails.setEmployee(employee);
//			employeeBankDetails.setCreatedBy(userId);
//			employeeBankDetails.setCreatedDate(LocalDateTime.now());
//			employeeBankDetailsService.update(employeeBankDetails);
//			Employment employment = payrollRestHepler.getEmploymentsEntity(employeePersistModel,employee,userId);
//			employment.setEmployee(employee);
//			employmentService.update(employment);
/**
 * added for Update employee Transaction category
 */
				transactionCategoryCreationHelper.updateEmployeeTransactionCategory(employee);
				if (employee.getParentId() != null) {
					EmployeeParentRelation employeeParentRelation = payrollRestHepler.getEmployeeParentRelationEntity(employeePersistModel, employee, userId);
					employeeParentRelationService.update(employeeParentRelation);

				}
				List<SalaryTemplatePersistModel> salaryTemplatePersistModels = new ArrayList<>();
				payrollRestHepler.getUpdatedSalaryAllTemplate(employeePersistModel,employee,salaryTemplatePersistModels);
			}

			message = new SimpleAccountsMessage("0072",
					MessageUtil.getMessage("employee.updated.successful.msg.0072"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {
			SimpleAccountsMessage message= null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("update.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@GetMapping(value = "/getEmployeesForDropdown")
	public ResponseEntity<List<DropdownModel>> getEmployeesForDropdown() {
		return new ResponseEntity<>(employeeService.getEmployeesForDropdown(), HttpStatus.OK);
	}

	/**
	 * added by suraj rahade
	 * @return
	 */
	@LogRequest
	@ApiOperation(value = "get Employees DropdownModel ",response = SalaryRole.class)
	@GetMapping(value = "/getEmployeesNotInUserForDropdown")
	public ResponseEntity<List<DropdownObjectModel>> getEmployeesNotInUserForDropdown() {
		return new ResponseEntity<>(employeeService.getEmployeesNotInUserForDropdown(), HttpStatus.OK);
	}
	@LogRequest
	@ApiOperation(value = "getAllActiveCompleteEmployee", notes = "Getting getAllEmployeeforpayroll ")
	@ApiResponses(value = {@ApiResponse(code = 200, message = "Successful"), @ApiResponse(code = 500, message = "Internal Server Error")})
	@GetMapping(value = "/getAllActiveCompleteEmployee")
	public ResponseEntity<List<PayrollEmployeeDto>> getAllActiveCompleteEmployee(@RequestParam(value = "payrollDate") String payrollDate) {
		try {
			logger.info("PayrollController:: getAllActiveCompleteEmployee method started ");
//
			List<PayrollEmployeeDto> response = employeeService.getAllActiveCompleteEmployee(payrollDate);

			if (response == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}

			return new ResponseEntity<>(response, HttpStatus.OK);

		} catch (Exception e) {
			logger.error("PayrollController:: Exception in getAllActiveCompleteEmployee: ", e);
			return (new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
		}
	}

	/**
	 *
	 * This Method will Send Invitation-mail to Employee
	 *
	 * @param employeeId
	 * @param request
	 * @return
	 */
	@LogRequest
	@ApiOperation(value = "Employee Invite Email")
	@GetMapping(value = "/getEmployeeInviteEmail")
	public ResponseEntity<?> getEmployeeInviteEmail(@RequestParam(value = "id") Integer employeeId , HttpServletRequest request){
		try {
			SimpleAccountsMessage message= null;
			Employee employee=employeeService.findByPK(employeeId);
			employeeService.sendInvitationMail(employee, request);
			message = new SimpleAccountsMessage("","Employee Invite Mail Sent Successfully", true);
			return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {
			SimpleAccountsMessage message= null;
			message = new SimpleAccountsMessage("","Employee Invite Mail Sent UnSuccessfully", true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
