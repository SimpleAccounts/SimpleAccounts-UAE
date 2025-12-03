package com.simpleaccounts.rest.payroll;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.constant.CommonStatusEnum;
import com.simpleaccounts.constant.DefaultTypeConstant;
import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import com.simpleaccounts.constant.dbfilter.InvoiceFilterEnum;
import com.simpleaccounts.constant.dbfilter.PayrollFilterEnum;
import com.simpleaccounts.dao.JournalLineItemDao;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.SalaryComponent;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.model.EmployeeBankDetailsPersistModel;
import com.simpleaccounts.model.EmploymentPersistModel;
import com.simpleaccounts.repository.*;
import com.simpleaccounts.rest.*;
import com.simpleaccounts.rest.invoicecontroller.InvoiceRequestFilterModel;
import com.simpleaccounts.rest.payroll.dto.PayrollEmployeeDto;
import com.simpleaccounts.rest.payroll.model.GeneratePayrollPersistModel;
import com.simpleaccounts.rest.payroll.model.PayrolRequestModel;
import com.simpleaccounts.rest.payroll.model.PayrollEmployeeModel;
import com.simpleaccounts.rest.payroll.model.PayrollListModel;
import com.simpleaccounts.rest.payroll.payrolService.PayrolService;
import com.simpleaccounts.rest.payroll.service.SalaryComponentService;
import com.simpleaccounts.rest.payroll.service.SalaryRoleService;
import com.simpleaccounts.rest.payroll.service.SalaryStructureService;
import com.simpleaccounts.rest.payroll.service.SalaryTemplateService;
import com.simpleaccounts.rest.usercontroller.UserModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.*;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponses;
import io.swagger.annotations.ApiResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.FileWriter;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;

/**
 *
 * @author Suraj
 */
@RestController
@RequestMapping("/rest/payroll")
public class PayrollController {

    private final Logger logger = LoggerFactory.getLogger(PayrollController.class);

    @Autowired
    private JwtTokenUtil jwtTokenUtil;
    @Autowired
    private RoleModuleRelationService roleModuleRelationService;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private PayrolService payrolService;

    @Autowired
    SalaryComponentService salaryComponentService;

    @Autowired
    private UserService userService;

    @Autowired
    EmployeeBankDetailsService employeeBankDetailsService;

    @Autowired
    private PayrollRestHepler payrollRestHepler;

    @Autowired
    private EmploymentService employmentService;

    @Autowired
    private SalaryRoleService salaryRoleService;

    @Autowired
    private SalaryTemplateService salaryTemplateService;

    @Autowired
    private TransactionCategoryService transactionCategoryService;
    @Autowired
    private SalaryStructureService salaryStructureService;

    @Autowired
    PayrollRepository payrollRepository;

    @Autowired
    protected JournalService journalService;

    @Autowired
    private JournalLineItemService journalLineItemService;


    @Autowired
    private JournalLineItemRepository journalLineItemRepository;

    @Autowired
    private SalaryRepository salaryRepository;

    @Autowired
    private PayrolEmployeeRepository payrolEmployeeRepository;

    @Autowired
    private JournalLineItemDao journalLineItemDao;

    @Autowired
    private TransactionCategoryBalanceService transactionCategoryBalanceService;
    @Autowired
    private PayrollEmployeeRepository payrollEmployeeRepository;
    @Autowired
    private SalaryComponentRepository salaryComponentRepository;


    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Save a employeeBankDetails", response = EmployeeBankDetails.class)
    @PostMapping(value = "/saveEmployeeBankDetails")
    public ResponseEntity<String> save(@ModelAttribute EmployeeBankDetailsPersistModel employeeBankDetailsPersistModel, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);

            EmployeeBankDetails employeeBankDetails = payrollRestHepler.getEntity(employeeBankDetailsPersistModel);
            employeeBankDetails.setCreatedBy(user.getUserId());
            employeeBankDetails.setCreatedDate(LocalDateTime.now());

            employeeBankDetailsService.persist(employeeBankDetails);

            return new ResponseEntity(HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Update EmployeeBankDetails", response = EmployeeBankDetails.class)
    @PostMapping(value = "/updateEmployeeBankDetails")
    public ResponseEntity<String> update(@ModelAttribute EmployeeBankDetailsPersistModel employeeBankDetailsPersistModel, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);

            EmployeeBankDetails employeeBankDetails = payrollRestHepler.getEntity(employeeBankDetailsPersistModel);

            employeeBankDetails.setCreatedBy(user.getUserId());
            employeeBankDetails.setCreatedDate(LocalDateTime.now());

            employeeBankDetailsService.update(employeeBankDetails);
            return new ResponseEntity(HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Delete EmployeeBankDetails By ID")
    @DeleteMapping(value = "/delete")
    public ResponseEntity<String> delete(@RequestParam(value = "id") Integer id) {
        try {
            EmployeeBankDetails employeeBankDetails = employeeBankDetailsService.findByPK(id);
            if (employeeBankDetails != null) {
                employeeBankDetails.setDeleteFlag(Boolean.TRUE);
                employeeBankDetailsService.update(employeeBankDetails, employeeBankDetails.getId());
            }
            return new ResponseEntity(HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @LogRequest
    @ApiOperation(value = "Get EmployeeBankDetails By ID")
    @GetMapping(value = "/getById")
    public ResponseEntity<EmployeeBankDetailsPersistModel> getById(@RequestParam(value = "id") Integer id) {
        try {
            EmployeeBankDetails employeeBankDetails = employeeBankDetailsService.findByPK(id);
            if (employeeBankDetails == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            } else {
                return new ResponseEntity(payrollRestHepler.getModel(employeeBankDetails), HttpStatus.OK);
            }
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

//Employment

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Save a Employment", response = Employment.class)
    @PostMapping(value = "/saveEmployment")
    public ResponseEntity<String> saveEmployment(@ModelAttribute EmploymentPersistModel employmentPersistModel, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);

            Employment employment = payrollRestHepler.getEmploymentEntity(employmentPersistModel);

            employmentService.persist(employment);

            return new ResponseEntity(HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Update Employment", response = Employment.class)
    @PostMapping(value = "/updateEmployment")
    public ResponseEntity<String> updateEmployment(@ModelAttribute EmploymentPersistModel employmentPersistModel, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);
            Employment employment = payrollRestHepler.getEmploymentEntity(employmentPersistModel);

            employmentService.update(employment);
            return new ResponseEntity(HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Delete Employment By ID")
    @DeleteMapping(value = "/deleteEmployment")
    public ResponseEntity<String> deleteEmployment(@RequestParam(value = "id") Integer id) {
        try {
            Employment employment = employmentService.findByPK(id);
            if (employment != null) {
                employment.setDeleteFlag(Boolean.TRUE);
                employmentService.update(employment, employment.getId());
            }
            return new ResponseEntity(HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    ////#################################################################################################################################################################################
////SalaryRole
    @LogRequest
    @ApiOperation(value = "get SalaryRole DropdownModel ", response = SalaryRole.class)
    @GetMapping(value = "/getSalaryRolesForDropdown")
    public ResponseEntity<List<DropdownObjectModel>> getSalaryRolesForDropdown() {
        return new ResponseEntity<>(salaryRoleService.getSalaryRolesForDropdownObjectModel(), HttpStatus.OK);
    }

    @LogRequest
    @ApiOperation(value = "get SalaryComponent DropdownModel ", response = SalaryComponent.class)
    @GetMapping(value = "/getSalaryComponentForDropdown")
    public ResponseEntity<List<DropdownObjectModel>> getSalaryComponentForDropdown(@RequestParam(value = "id") Integer id) {
        return new ResponseEntity<>(salaryComponentService.getSalaryComponentForDropdownObjectModel(id), HttpStatus.OK);
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Save a SalaryRole", response = SalaryRole.class)
    @PostMapping(value = "/saveSalaryRole")
    public ResponseEntity<String> saveSalaryRole(@ModelAttribute SalaryRolePersistModel salaryRolePersistModel, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);
            SalaryRole salaryRole = payrollRestHepler.getSalaryRoleEntity(salaryRolePersistModel);
            salaryRoleService.persist(salaryRole);
            return new ResponseEntity("Salary Role Saved Successfully ", HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Update SalaryRole", response = SalaryRole.class)
    @PostMapping(value = "/updateSalaryRole")
    public ResponseEntity<String> updateSalaryRole(@ModelAttribute SalaryRolePersistModel salaryRolePersistModel, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);

            SalaryRole salaryRole = payrollRestHepler.getSalaryRoleEntity(salaryRolePersistModel);

            salaryRoleService.update(salaryRole);
            return new ResponseEntity(HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Delete SalaryRole By ID")
    @DeleteMapping(value = "/deleteSalaryRole")
    public ResponseEntity<String> deleteSalaryRole(@RequestParam(value = "id") Integer id) {
        try {
            SalaryRole salaryRole = salaryRoleService.findByPK(id);
            if (salaryRole != null) {
                salaryRole.setDeleteFlag(Boolean.TRUE);
                salaryRoleService.update(salaryRole, salaryRole.getId());
            }
            return new ResponseEntity(HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @ApiOperation(value = "Get Salary Role By ID")
    @GetMapping(value = "/getSalaryRoleById")
    public ResponseEntity<SalaryRolePersistModel> getSalaryRoleById(@RequestParam(value = "id") Integer id) {
        try {
            SalaryRole salaryRole = salaryRoleService.findByPK(id);
            if (salaryRole == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            } else {
                return new ResponseEntity(payrollRestHepler.getSalaryRoleModel(salaryRole), HttpStatus.OK);
            }
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @ApiOperation(value = "Get Salary Roles", response = List.class)
    @GetMapping(value = "/salaryRoleList")
    public ResponseEntity<PaginationResponseModel> getSalaryRoleList(PayRollFilterModel filterModel,
                                                                     HttpServletRequest request) {
        Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
        User user = userService.findByPK(userId);
        Map<Object, Object> filterDataMap = new HashMap<>();
        PaginationResponseModel paginationResponseModel = salaryRoleService.getSalaryRoleList(filterDataMap, filterModel);
        if (paginationResponseModel != null) {
            return new ResponseEntity<>(payrollRestHepler.getSalaryRoleListModel(paginationResponseModel), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //#################################################################################################################################################################################
    //Salary Structure : Update

    @LogRequest
    @ApiOperation(value = "Get Salary Structure list", response = List.class)
    @GetMapping(value = "/salaryStructureList")
    public ResponseEntity<PaginationResponseModel> getSalaryStructureList(PayRollFilterModel filterModel,
                                                                          HttpServletRequest request) {
        Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
        User user = userService.findByPK(userId);
        Map<Object, Object> filterDataMap = new HashMap<>();
        PaginationResponseModel paginationResponseModel = salaryStructureService.getSalaryStructureList(filterDataMap, filterModel);
        if (paginationResponseModel != null) {
            return new ResponseEntity<>(payrollRestHepler.getSalaryStructureListModel(paginationResponseModel), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Save a Salary Structure", response = SalaryRole.class)
    @PostMapping(value = "/saveSalaryStructure")
    public ResponseEntity<String> saveSalaryStructure(@ModelAttribute SalaryStructurePersistModel salaryStructurePersistModel, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);
            SalaryStructure salaryStructure = payrollRestHepler.getSalaryStructureEntity(salaryStructurePersistModel);
            salaryStructureService.persist(salaryStructure);
            return new ResponseEntity("Salary Structure Saved Successfully ", HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Update SalaryStructure", response = SalaryStructure.class)
    @PostMapping(value = "/updateSalaryStructure")
    public ResponseEntity<String> updateSalaryStructure(@ModelAttribute SalaryStructurePersistModel salaryStructurePersistModel,
                                                        HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);
            SalaryStructure salaryStructure = payrollRestHepler.getSalaryStructureEntity(salaryStructurePersistModel);
            salaryStructureService.update(salaryStructure);
            return new ResponseEntity(HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @ApiOperation(value = "Get Salary Structure By ID")
    @GetMapping(value = "/getSalaryStructureById")
    public ResponseEntity<SalaryStructurePersistModel> getSalaryStructureById(@RequestParam(value = "id") Integer id) {
        try {
            SalaryStructure salaryStructure = salaryStructureService.findByPK(id);
            if (salaryStructure == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            } else {
                return new ResponseEntity(payrollRestHepler.getSalaryStructureModel(salaryStructure), HttpStatus.OK);
            }
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @ApiOperation(value = "get Salary Structure DropdownModel ", response = SalaryRole.class)
    @GetMapping(value = "/getSalaryStructureForDropdown")
    public ResponseEntity<List<DropdownObjectModel>> getSalaryStructureForDropdown() {
        return new ResponseEntity<>(salaryStructureService.getSalaryStructureDropdown(), HttpStatus.OK);
    }

//#################################################################################################################################################################################
    //Salary Template :

    @LogRequest
    @ApiOperation(value = "Get Salary Template list", response = List.class)
    @GetMapping(value = "/salaryTemplatePaginationList")
    public ResponseEntity<PaginationResponseModel> getSalaryTemplateList(PayRollFilterModel filterModel,
                                                                         HttpServletRequest request) {
        Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
        User user = userService.findByPK(userId);
        Map<Object, Object> filterDataMap = new HashMap<>();
        PaginationResponseModel paginationResponseModel = salaryTemplateService.getSalaryTemplateList(filterDataMap, filterModel);
        if (paginationResponseModel != null) {
            return new ResponseEntity<>(payrollRestHepler.getSalaryTemplateListModel(paginationResponseModel), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @ApiOperation(value = "Get Salary Component list", response = List.class)
    @GetMapping(value = "/getSalaryComponentList")
    public ResponseEntity<PaginationResponseModel> getSalaryComponentList(PayRollFilterModel filterModel,
                                                                          HttpServletRequest request) {
        Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
        User user = userService.findByPK(userId);
        Map<Object, Object> filterDataMap = new HashMap<>();
        PaginationResponseModel paginationResponseModel = salaryComponentService.getSalaryComponentList(filterDataMap, filterModel);
        if (paginationResponseModel != null) {
            return new ResponseEntity<>(payrollRestHepler.getSalaryComponentListModel(paginationResponseModel), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Save a Salary Template", response = SalaryRole.class)
    @PostMapping(value = "/saveSalaryTemplate")
    public ResponseEntity<String> saveSalaryTemplate(@ModelAttribute SalaryTemplatePersistModel salaryTemplatePersistModel, HttpServletRequest request) {
        try {
            Map<String, Object> param = new HashMap<>();
            param.put("salaryComponentId", salaryTemplatePersistModel.getSalaryComponentId());
            List<com.simpleaccounts.entity.SalaryTemplate> existingComponentId = salaryTemplateService.findByAttributes(param);
            if (existingComponentId != null && !existingComponentId.isEmpty()) {
                return new ResponseEntity("existingComponentId Already exists.", HttpStatus.BAD_REQUEST);
            }
            List<SalaryTemplatePersistModel> salaryTemplatePersistModels = new ArrayList<>();
            payrollRestHepler.getSalaryAllTemplate(salaryTemplatePersistModel, salaryTemplatePersistModels);
            return new ResponseEntity(HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Update Salary Template")
    @PostMapping(value = "/updateSalaryTemplate")
    public ResponseEntity<String> updateSalaryTemplate(@ModelAttribute SalaryTemplatePersistModel salaryTemplatePersistModel, HttpServletRequest request) {
        try {
            Map<String, Object> param = new HashMap<>();
            param.put("salaryComponentId", salaryTemplatePersistModel.getSalaryComponentId());
            List<com.simpleaccounts.entity.SalaryTemplate> existingComponentId = salaryTemplateService.findByAttributes(param);

            List<SalaryTemplatePersistModel> salaryTemplatePersistModels = new ArrayList<>();
            payrollRestHepler.getUpdatedSalaryAllTemplate(salaryTemplatePersistModel, salaryTemplatePersistModels);
            return new ResponseEntity("Updated", HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Save a Salary Component", response = SalaryRole.class)
    @PostMapping(value = "/saveSalaryComponent")
    public ResponseEntity<String> saveSalaryComponent(@ModelAttribute SalaryComponentPersistModel salaryComponentPersistModel, HttpServletRequest request) {
        try {
            List<SalaryComponentPersistModel> salaryComponentPersistModels = new ArrayList<>();
            payrollRestHepler.saveAllSalaryComponent(salaryComponentPersistModel, salaryComponentPersistModels);

            return new ResponseEntity(" Saved ", HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Delete Salary Component row for a employee ")
    @DeleteMapping(value = "/deleteSalaryComponentRow")
    public ResponseEntity<String> deleteSalaryComponentRow(@RequestParam(value = "id") Integer employeeId, @RequestParam(value = "componentId") Integer componentId, HttpServletRequest request) {
        try {

            payrollRestHepler.deleteSalaryComponentRow(employeeId, componentId);

            return new ResponseEntity("Deleted a component row", HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>("Deleted a component row", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Update Salary Component")
    @PostMapping(value = "/updateSalaryComponent")
    public ResponseEntity<String> updateSalaryComponent(@ModelAttribute SalaryComponentPersistModel salaryComponentPersistModel, HttpServletRequest request) {
        try {
            List<SalaryComponentPersistModel> salaryComponentPersistModels = new ArrayList<>();
            payrollRestHepler.updateAllSalaryComponent(salaryComponentPersistModel, salaryComponentPersistModels);

            return new ResponseEntity("Updated", HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Update Salary Component")
    @PostMapping(value = "/updateSalaryComponentAsNoOfDays")
    public ResponseEntity<String> updateSalaryComponentAsNoOfDays(@RequestParam(value = "id") Integer id, @RequestParam(value = "noOfDays") BigDecimal noOfDays, HttpServletRequest request) {
        try {

            payrollRestHepler.updateSalaryComponentAsNoOfDays(id, noOfDays);
            return new ResponseEntity("Updated", HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //    @ApiOperation(value = "Delete Salary Template By ID")
//    @DeleteMapping(value = "/deleteSalaryTemplate")
//    public ResponseEntity<String> deleteSalaryTemplate(@RequestParam(value = "id") Integer id) {
//        try {
//            SalaryTemplate salaryTemplate = salaryTemplateService.findByPK(id);
//            if (salaryTemplate!= null) {
//
//                salaryTemplateService.update(salaryTemplate, salaryTemplate.getId());
//            }
//            return new ResponseEntity(HttpStatus.OK);
//        } catch (Exception e) {
//            logger.error(ERROR, e);
//            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
//        }
//    }
//
////##############################################################################################################################################################
//
    @LogRequest
    @ApiOperation(value = "Get Employment By ID")
    @GetMapping(value = "/getEmploymentById")
    public ResponseEntity<EmploymentPersistModel> getEmploymentById(@RequestParam(value = "id") Integer id) {
        try {
            Employment employment = employmentService.findByPK(id);
            if (employment == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            } else {
                return new ResponseEntity(payrollRestHepler.getEmploymentModel(employment), HttpStatus.OK);
            }
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @ApiOperation(value = "Get Salary Template By ID")
    @GetMapping(value = "/getSalaryTemplateById")
    public ResponseEntity<SalaryTemplatePersistModel> getSalaryTemplateById(@RequestParam(value = "id") Integer id) {
        try {
            com.simpleaccounts.entity.SalaryTemplate salaryTemplate = salaryTemplateService.findByPK(id);
            if (salaryTemplate == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            } else {
                return new ResponseEntity(payrollRestHepler.getSalaryTemplateModel(salaryTemplate), HttpStatus.OK);
            }
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @ApiOperation(value = "Get Default Salary Templates")
    @GetMapping(value = "/getDefaultSalaryTemplates")
    public ResponseEntity<SalaryTemplateModel> getSalaryTemplates() {

        try {
            return new ResponseEntity(salaryTemplateService.getDefaultSalaryTemplates(), HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // This below method will fetch the SalaryComponents from EmployeeSalaryComponentRelation
    @LogRequest
    @ApiOperation(value = "Get Salary Component By employeeID")
    @GetMapping(value = "/getSalaryComponentByEmployeeId")
    public ResponseEntity<EmployeeSalaryComponentRelationModel> getSalaryComponentByEmployeeId(@RequestParam(value = "id") Integer id) {
        try {

            return new ResponseEntity(payrollRestHepler.getSalaryComponentByEmployeeId(id), HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @ApiOperation(value = "Get Salary Detail By employeeID and NoOfDays")
    @GetMapping(value = "/getSalaryDetailByEmployeeIdNoOfDays")
    public ResponseEntity<SalaryDeatilByEmployeeIdNoOfDaysModel> getSalaryDeatilByEmployeeIdNoOfDays(@RequestParam(value = "id") Integer id) {
        try {

            return new ResponseEntity(payrollRestHepler.getSalaryDeatilByEmployeeIdNoOfDays(id), HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @ApiOperation(value = "Generate Sif File")
    @GetMapping(value = "/generteSifFile")
    public ResponseEntity<List<String>> generteSifFile(@RequestParam(value = "payrollId") Integer payrollId, @RequestParam(value = "id") List<Integer> ids,@RequestParam (value = "currentTime") String currentTime) {
        try {

            List<String> file = payrollRestHepler.getSIF(payrollId, ids,currentTime);
            return new ResponseEntity<>(file, HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @ApiOperation(value = "Get Salary Component By Id")
    @GetMapping(value = "/getSalaryComponentById")
    public ResponseEntity<SalaryComponentPersistModel> getSalaryComponentById(@RequestParam(value = "id") Integer id) {
        try {
            SalaryComponent salaryComponent = salaryComponentService.findByPK(id);
            if (salaryComponent == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            } else {
                return new ResponseEntity(payrollRestHepler.getSalaryComponentModel(salaryComponent), HttpStatus.OK);
            }
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
//    @ApiOperation(value = "get a salary Sleep")
//    @PostMapping(value = "/getSalaryCalculations")
//    public ResponseEntity<SalaryCalculationModel> getSalaryCalculations(@RequestParam BigDecimal grossSalary, @RequestParam Integer designationId , HttpServletRequest request)
//    {
//        try {
//            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
//            User user = userService.findByPK(userId);
//
//            SalaryCalculationModel salaryCalculationModel = payrollRestHepler.getSalaryCalculations(designationId,grossSalary);
//
//            return new ResponseEntity(salaryCalculationModel, HttpStatus.OK);
//
//        } catch (Exception e) {
//            logger.error(ERROR, e);
//            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
//        }
//    }

    @LogRequest
    @ApiOperation(value = "Get Unpaid Payroll list")
    @GetMapping(value = "/getUnpaidPayrollList")
    public ResponseEntity<List<SingleLevelDropDownModel>> getUnpaidPayrollList(HttpServletRequest request) {
        try {
            List<PayrollDropdownModel> response = new ArrayList<>();

            List<Payroll> payrollList = payrollRestHepler.getPayrollList();

            response = payrollRestHepler.getUnpaidPayrollList(payrollList);

            return new ResponseEntity(response, HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
        }
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }


    /**
     * This API is used to get all the payroll list.
     *
     * @param
     * @return Payroll List
     */
    @LogRequest
    @ApiOperation(value = "Get All Payroll List", notes = "Getting all payroll list data")
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Successful"), @ApiResponse(code = 500, message = "Internal Server Error")})
    @GetMapping(value = "/getPayrollList")
    public ResponseEntity<List<PayrollListModel>> getPayrollList(HttpServletRequest request) {
        try {
            logger.info("PayrollController:: getPayrollList method started ");
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);
            List<Payroll> response = new ArrayList<Payroll>();

            response = payrollRestHepler.getPayrollList();

            List<PayrollListModel> payrollListModelList = new ArrayList<PayrollListModel>();
            for (Payroll res : response) {
                PayrollListModel payrollListModel = new PayrollListModel();

                User generatedByUser = userService.findByPK(Integer.parseInt(res.getGeneratedBy()));
                String generatedByName = generatedByUser.getFirstName().toString() + " " + generatedByUser.getLastName().toString();
                String payrollApproverName = null;
                if (res.getPayrollApprover() != null) {
                    User payrollApproverUser = userService.findByPK(res.getPayrollApprover());
                    payrollApproverName = payrollApproverUser.getFirstName().toString() + " " + payrollApproverUser.getLastName().toString();
                }
                payrollListModel.setId(res.getId());
                payrollListModel.setPayrollDate(res.getPayrollDate().toString());
                payrollListModel.setPayrollSubject(res.getPayrollSubject());
                payrollListModel.setPayPeriod(res.getPayPeriod());
                payrollListModel.setEmployeeCount(res.getEmployeeCount());
                payrollListModel.setGeneratedBy(res.getGeneratedBy());
                payrollListModel.setApprovedBy(res.getApprovedBy());
                payrollListModel.setStatus(res.getStatus());
                if (res.getRunDate() != null) {
                    payrollListModel.setRunDate(res.getRunDate().toString());
                } else {
                    payrollListModel.setRunDate("");
                }
                payrollListModel.setComment(res.getComment());
                payrollListModel.setDeleteFlag(res.getDeleteFlag());
                payrollListModel.setIsActive(res.getIsActive());
                payrollListModel.setPayrollApprover(res.getPayrollApprover());
                payrollListModel.setPayrollApproverName(payrollApproverName);
                payrollListModel.setGeneratedByName(generatedByName);
                payrollListModel.setDueAmountPayroll(res.getDueAmountPayroll());
                payrollListModel.setTotalAmountPayroll(res.getTotalAmountPayroll());

                // get the list of employeeID
                List<Integer> empIdList = payrolService.getEmployeeList(res.getId());
                payrollListModel.setExistEmpList(empIdList);

                payrollListModelList.add(payrollListModel);


            }
            if (payrollListModelList == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(payrollListModelList, HttpStatus.OK);

        } catch (Exception e) {
            logger.error("PayrollController:: Exception in getPayrollList: ", e);
            return (new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @LogRequest
    @ApiOperation(value = "Get Payroll List")
    @GetMapping(value = "/getList")
    public ResponseEntity<PaginationResponseModel> getPayrollList(PayRollFilterModel filterModel,
                                                                  HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);
            Map<PayrollFilterEnum, Object> filterDataMap = new EnumMap<>(PayrollFilterEnum.class);

            PaginationResponseModel responseModel = payrolService.getList(filterDataMap, filterModel);
            if (responseModel == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            responseModel.setData(payrollRestHepler.getListModel(responseModel.getData()));
            return new ResponseEntity<>(responseModel, HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * This API is used to get all the payroll.
     *
     * @param id
     * @return Payroll
     */
    @LogRequest
    @ApiOperation(value = "GetPayroll ", notes = "Getting payroll data")
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Successful"), @ApiResponse(code = 500, message = "Internal Server Error")})
    @GetMapping(value = "/getPayroll")
    public ResponseEntity<PayrollListModel> getPayroll(@RequestParam(value = "id") Integer id) {
        try {
            logger.info("PayrollController:: getPayroll method started ");

            Payroll response = payrollRestHepler.getPayroll(id);

            PayrollListModel payrollListModel = new PayrollListModel();

            User generatedByUser = userService.findByPK(Integer.parseInt(response.getGeneratedBy()));
            String generatedByName = generatedByUser.getFirstName().toString() + " " + generatedByUser.getLastName().toString();
            String payrollApproverName = null;
            if (response.getPayrollApprover() != null) {
                User payrollApproverUser = userService.findByPK(response.getPayrollApprover());
                payrollApproverName = payrollApproverUser.getFirstName().toString() + " " + payrollApproverUser.getLastName().toString();
            }
            payrollListModel.setId(response.getId());
            payrollListModel.setPayrollDate(response.getPayrollDate().toString());
            payrollListModel.setPayrollSubject(response.getPayrollSubject());
            payrollListModel.setPayPeriod(response.getPayPeriod());
            payrollListModel.setEmployeeCount(response.getEmployeeCount());
            payrollListModel.setGeneratedBy(response.getGeneratedBy());
            payrollListModel.setApprovedBy(response.getApprovedBy());
            payrollListModel.setStatus(response.getStatus());
            if (response.getRunDate() != null) {
                payrollListModel.setRunDate(response.getRunDate().toString());
            } else {
                payrollListModel.setRunDate("");
            }
            payrollListModel.setComment(response.getComment());
            payrollListModel.setDeleteFlag(response.getDeleteFlag());
            payrollListModel.setIsActive(response.getIsActive());
            payrollListModel.setPayrollApprover(response.getPayrollApprover());
            payrollListModel.setPayrollApproverName(payrollApproverName);
            payrollListModel.setGeneratedByName(generatedByName);

            // get the list of employeeID
            List<Integer> empIdList = payrolService.getEmployeeList(response.getId());
            payrollListModel.setExistEmpList(empIdList);

            if (payrollListModel == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            return new ResponseEntity(payrollListModel, HttpStatus.OK);

        } catch (Exception e) {
            logger.error("PayrollController:: Exception in getPayroll: ", e);
            return (new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * This API is used create a  payroll.
     *
     * @param payrolRequestModel
     */

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Save a payroll", response = Payroll.class)
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Successful"), @ApiResponse(code = 500, message = "Internal Server Error")})
    @PostMapping(value = "/createPayroll")
    public ResponseEntity<String> createPayroll(@ModelAttribute PayrolRequestModel payrolRequestModel, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);

            Payroll payroll = payrolService.createNewPayrol(user, payrolRequestModel, userId);

            return new ResponseEntity(payroll.getId(), HttpStatus.OK);
        } catch (Exception e) {
            logger.error("PayrollController:: Exception in /createPayroll:", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * This API is used create a  payroll Employee relation.
     *
     * @param payrollId,List<Integer> employeeListIds
     */
    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Save payroll employee relation", response = Payroll.class)
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Successful"), @ApiResponse(code = 500, message = "Internal Server Error")})
    @PostMapping(value = "/savePayrollEmployeeRelation ")
    public ResponseEntity<String> createPayrollEmployeeRelation(@RequestParam(value = "payrollId") Integer payrollId, @RequestParam(value = "employeeListIds") List<Integer> employeeListIds, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);
            payrolService.savePayrollEmployeeRelation(payrollId, user, employeeListIds);
            return new ResponseEntity(HttpStatus.OK);
        } catch (Exception e) {
            logger.error("PayrollController:: Exception in /savePayrollEmployeeRelation:", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    /**
     * This API is used to get List of approved user.
     *
     * @param
     * @return Payroll
     */
    @LogRequest
    @ApiOperation(value = "getAproverUsers ", notes = "Getting Aprovered Users data")
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Successful"), @ApiResponse(code = 500, message = "Internal Server Error")})
    @GetMapping(value = "/getAproverUsers")
    public ResponseEntity<List<UserDto>> getAproverUsers(HttpServletRequest request) {
        try {
            logger.info("PayrollController:: getAproverUsers method started ");

            List<UserDto> response = payrolService.getAprovedUserList();

            if (response == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            logger.error("PayrollController:: Exception in getAproverUsers: ", e);
            return (new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "removeEmployee ", notes = "remove Employee")
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Successful"), @ApiResponse(code = 500, message = "Internal Server Error")})
    @DeleteMapping(value = "/removeEmployee")
    public ResponseEntity<List<PayrollEmployee>> removeEmployee(@RequestParam(value = "payEmpListIds") List<Integer> payEmpListIds) {
        try {
            logger.info("PayrollController:: removeEmployee method started ");

            payrolService.deleteByIds(payEmpListIds);

            return new ResponseEntity<>(HttpStatus.NO_CONTENT);

        } catch (Exception e) {
            e.printStackTrace();
            logger.error("PayrollController:: Exception in removeEmployee: ", e);
            return (new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }


    @LogRequest
    @ApiOperation(value = "getAllPayrollEmployee ", notes = "Getting Aprovered Users data")
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Successful"), @ApiResponse(code = 500, message = "Internal Server Error")})
    @GetMapping(value = "/getAllPayrollEmployee")
    public ResponseEntity<List<PayrollEmployeeDto>> getAllPayrollEmployee(@RequestParam(value = "payrollid") Integer payrollid, @RequestParam(value = "payrollDate") String payrollDate, HttpServletRequest request) {
        try {
            logger.info("PayrollController:: getAllPayrollEmployee method started ");

            List<PayrollEmployeeDto> response = payrolService.getAllPayrollEmployee(payrollid, payrollDate);

            if (response == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            logger.error("PayrollController:: Exception in getAllPayrollEmployee: ", e);
            return (new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }



    @LogRequest
    @ApiOperation(value = "Generate a payroll")
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Successful"), @ApiResponse(code = 500, message = "Internal Server Error")})
    @PostMapping(value = "/generatePayroll")
    public ResponseEntity<String> generatePayroll(@ModelAttribute GeneratePayrollPersistModel generatePayrollPersistModel, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);
            List<GeneratePayrollPersistModel> generatePayrollPersistModels = new ArrayList<>();
            //   payrollRestHepler.generatePayroll(generatePayrollPersistModel, generatePayrollPersistModels,user);

            return new ResponseEntity(" Payroll generated ", HttpStatus.OK);
        } catch (Exception e) {
            logger.error("PayrollController:: Exception in /generatePayroll:", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @ApiOperation(value = "Approve and run")
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Successful"), @ApiResponse(code = 500, message = "Internal Server Error")})
    @PostMapping(value = "/approveRunPayroll")
    public ResponseEntity<String> approveRunPayroll(PayrolRequestModel payrolRequestModel, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);
            payrollRestHepler.generatePayroll(user, payrolRequestModel.getPayrollId(),payrolRequestModel.getStartDate(),payrolRequestModel.getEndDate(),request,payrolRequestModel.getPayrollEmployeesIdsListToSendMail());

            return new ResponseEntity(" Approved and Run ", HttpStatus.OK);
        } catch (Exception e) {
            logger.error("PayrollController:: Exception in /approveRunPayroll:", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    /**
     * Payroll Void Journal Reverse Entry
     *
     * @param postingRequestModel
     * @param request
     * @return
     */
    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Void Journal Entry")
    @PostMapping(value = "/voidJournalEntry")
    public ResponseEntity<String> voidJournalEntry(@RequestBody PostingRequestModel postingRequestModel, String comment , HttpServletRequest request) {
        try {
            payrollRestHepler.voidPayroll(postingRequestModel,comment,request);
            return new ResponseEntity("Payroll Voided Successfully", HttpStatus.OK);
        } catch (Exception e) {
            logger.error("PayrollController:: Exception in /voidJournalEntry:", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @LogRequest
    @ApiOperation(value = "Convert payroll to paid")
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Successful"), @ApiResponse(code = 500, message = "Internal Server Error")})
    @PostMapping(value = "/convertPayrollToPaid")
    public ResponseEntity<String> convertPayrollToPaid(@RequestParam(value = "payEmpListIds") List<Integer> payEmpListIds, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);

            payrollRestHepler.convertPayrollToPaid(payEmpListIds, user);

            return new ResponseEntity("", HttpStatus.OK);
        } catch (Exception e) {
            logger.error("PayrollController:: Exception in /convertPayrollToPaid:", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    /**
     * This API is used to get user and role.
     *
     * @param
     */

    @LogRequest
    @ApiOperation(value = "Get User and role")
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Successful"), @ApiResponse(code = 500, message = "Internal Server Error")})
    @GetMapping(value = "/getUserAndRole")
    public ResponseEntity<List<DropdownModel>> getUserAndRole(HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            return new ResponseEntity<>(userService.getUserForPayrollDropdown(userId), HttpStatus.OK);
        } catch (Exception e) {
            logger.error("PayrollController:: Exception in /getUserAndRole:", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @LogRequest
    @ApiOperation(value = "getAllPayrollEmployeeForApprover ", notes = "Getting getAllPayrollEmployeeforApprover ")
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Successful"), @ApiResponse(code = 500, message = "Internal Server Error")})
    @GetMapping(value = "/getAllPayrollEmployeeForApprover")
    public ResponseEntity<List<PayrollEmployeeDto>> getAllPayrollEmployeeForApprover(@RequestParam(value = "payrollid") Integer payrollid, HttpServletRequest request) {
        try {
            logger.info("PayrollController:: getAllPayrollEmployeeforGenerator method started ");

            List<PayrollEmployeeDto> response = payrolService.getAllPayrollEmployeeForApprover(payrollid);

            if (response == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            logger.error("PayrollController:: Exception in getAllPayrollEmployeeApprover: ", e);
            return (new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * This API is used to change payroll status.
     *
     * @param payrollId,List<Integer> employeeListIds
     */
    @LogRequest
    @ApiOperation(value = "Change payroll status", response = Payroll.class)
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Successful"), @ApiResponse(code = 500, message = "Internal Server Error")})
    @PostMapping(value = "/changePayrollStatus ")
    public ResponseEntity<String> changePayrollStatus(@RequestParam(value = "payrollId") Integer payrollId, @RequestParam(value = "approverId") Integer approverId, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);
            payrollRestHepler.updatePayrollStatus(payrollId, approverId, request);
            return new ResponseEntity(HttpStatus.OK);
        } catch (Exception e) {
            logger.error("PayrollController:: Exception in /changePayrollStatus:", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    /**
     * This API is used to reject a payroll and convert to draft.
     *
     * @param payrollId
     */
    @LogRequest
    @ApiOperation(value = "Reject and make it draft")
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Successful"), @ApiResponse(code = 500, message = "Internal Server Error")})
    @PostMapping(value = "/rejectPayroll")
    public ResponseEntity<String> rejectPayroll(Integer payrollId, String comment, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);
            payrollRestHepler.rejectPayroll(user, payrollId, comment,request);

            return new ResponseEntity(" Reject payroll ", HttpStatus.OK);
        } catch (Exception e) {
            logger.error("PayrollController:: Exception in /rejectPayroll:", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    /**
     * This API is used create and submit payroll.
     *
     * @param payrolRequestModel
     */

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "create And Submit Payroll", response = Payroll.class)
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Successful"), @ApiResponse(code = 500, message = "Internal Server Error")})
    @PostMapping(value = "/createAndSubmitPayroll")
    public ResponseEntity<String> createAndSubmitPayroll(@ModelAttribute PayrolRequestModel payrolRequestModel, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);

            Payroll payroll = payrolService.createNewPayrol(user, payrolRequestModel, userId);

            payrollRestHepler.updatePayrollStatus(payroll.getId(), payroll.getPayrollApprover(), request);

            return new ResponseEntity(payroll.getId(), HttpStatus.OK);

        } catch (Exception e) {
            logger.error("PayrollController:: Exception in /createAndSubmitPayroll:", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * This API is used Update a  payroll.
     *
     * @param payrolRequestModel
     */

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Update a payroll", response = Payroll.class)
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Successful"), @ApiResponse(code = 500, message = "Internal Server Error")})
    @PostMapping(value = "/updatePayroll")
    public ResponseEntity<String> updatePayroll(@ModelAttribute PayrolRequestModel payrolRequestModel, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);

            Payroll payroll = payrolService.updatePayrol(user, payrolRequestModel, userId);

            return new ResponseEntity(payroll.getId(), HttpStatus.OK);
        } catch (Exception e) {
            logger.error("PayrollController:: Exception in /updatePayroll:", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * This API is used Update and Submit a  payroll.
     *
     * @param payrolRequestModel
     */

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Update and Submit payroll", response = Payroll.class)
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Successful"), @ApiResponse(code = 500, message = "Internal Server Error")})
    @PostMapping(value = "/updateAndSubmitPayroll")
    public ResponseEntity<String> updateAndSubmitPayroll(@ModelAttribute PayrolRequestModel payrolRequestModel, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);

            Payroll payroll = payrolService.updatePayrol(user, payrolRequestModel, userId);
            payrollRestHepler.updatePayrollStatus(payroll.getId(), payroll.getPayrollApprover(), request);

            return new ResponseEntity(payroll.getId(), HttpStatus.OK);
        } catch (Exception e) {
            logger.error("PayrollController:: Exception in /updateAndSubmitPayroll:", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Delete Payroll By ID")
    @DeleteMapping(value = "/deletePayroll")
    public ResponseEntity<String> deletePayroll(@RequestParam(value = "payrollId") Integer id) {

        try {

            payrolService.deletePayroll(id);
            return new ResponseEntity<>("Payroll Deleted Successfully", HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Employee Payroll list")
    @GetMapping(value = "/payrollemployee/list")
    public ResponseEntity<?> getPayrollEmployee(HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            List<PayrollEmployeeModel> response = getPayrollEmployeeList(userId);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private List<PayrollEmployeeModel> getPayrollEmployeeList(Integer userId) {
        List<PayrollEmployeeModel> payrollEmployeeModelList = new ArrayList<>();
        List<PayrollEmployee> payrollEmployeeList = new ArrayList<>();
        List<PayrollEmployee> payrollEmployees = payrollEmployeeRepository.findByDeleteFlag(false);
        if (payrollEmployees != null) {
            for (PayrollEmployee payrollEmployee : payrollEmployees) {
                if (!payrollEmployee.getPayrollId().getStatus().equalsIgnoreCase("Voided")) {
                    PayrollEmployeeModel payrollEmployeeModel = new PayrollEmployeeModel();
                    payrollEmployeeModel.setEmployeeId(payrollEmployee.getEmployeeID().getId());
                    payrollEmployeeModel.setPayrollId(payrollEmployee.getPayrollId().getId());
                    if (payrollEmployee.getPayrollId().getPayrollDate() != null) {
                        payrollEmployeeModel.setPayrollDate(payrollEmployee.getPayrollId().getPayrollDate());

                    }
                    if (payrollEmployee.getPayrollId().getPayPeriod() != null) {
                        payrollEmployeeModel.setPayPeriod(payrollEmployee.getPayrollId().getPayPeriod());
                    }
                    if (payrollEmployee.getPayrollId().getPayrollSubject() != null) {
                        payrollEmployeeModel.setPayrollSubject(payrollEmployee.getPayrollId().getPayrollSubject());
                    }
                    if (payrollEmployee.getEmployeeID().getFirstName() != null) {
                        payrollEmployeeModel.setEmployeeName(payrollEmployee.getEmployeeID().getFirstName() + " " + payrollEmployee.getEmployeeID().getLastName());
                    }
                    payrollEmployeeModelList.add(payrollEmployeeModel);
                }
            }
        }
        return payrollEmployeeModelList;
    }
    @LogRequest
    @ApiOperation(value = "Get Payroll Count For User")
    @GetMapping(value = "/getPayrollCountByUserId")
    public ResponseEntity<Integer> getExplainedTransactionCount(@RequestParam Integer userId){
        String generatedBy = userId.toString();
        List<Payroll> payrollList = payrollRepository.getPayrollCountByUserId(generatedBy,userId);
        Integer response = payrollList.size();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @LogRequest
    @ApiOperation(value = "Get Salary components")
    @GetMapping(value = "/getSalaryList")
    public ResponseEntity<?> getSalaryComponent(@RequestParam(defaultValue = "0") int pageNo,
                                                @RequestParam(defaultValue = "10") int pageSize,
                                                @RequestParam(required = false, defaultValue = "true") boolean paginationDisable,
                                                @RequestParam(required = false) String order,
                                                @RequestParam(required = false) String sortingCol,
                                                HttpServletRequest request){
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            PaginationResponseModel responseModel = new PaginationResponseModel();
            List<SalaryComponentPersistModel> response = getListSalaryComponent(responseModel,pageNo,pageSize,paginationDisable,order,sortingCol);
            return new ResponseEntity<>(responseModel, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @ApiOperation(value = "Delete Salary components")
    @DeleteMapping(value = "/deleteSalaryComponent")
    public ResponseEntity<?> deleteSalaryComponent(@RequestParam(value = "id") Integer id,
                                                HttpServletRequest request){
        try {
          SalaryComponent salaryComponent = salaryComponentRepository.findById(id).get();
          if(salaryComponent!=null){
              salaryComponent.setDeleteFlag(Boolean.TRUE);
              salaryComponentRepository.save(salaryComponent);
          }
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    private List<SalaryComponentPersistModel> getListSalaryComponent(PaginationResponseModel responseModel,int pageNo, int pageSize,
                                                                     boolean paginationDisable, String sortOrder, String sortingCol){
        Pageable paging = getSalaryComponentPageableRequest(pageNo, pageSize, sortOrder, sortingCol);
        List<SalaryComponent> salaryComponentList = new ArrayList<>();
        List<SalaryComponentPersistModel> salaryComponentPersistModelList = new ArrayList<>();
        Page<SalaryComponent> salaryComponentPage = salaryComponentRepository.findByDeleteFlag(false,paging);
        salaryComponentList = salaryComponentPage.getContent();
        responseModel.setCount((int) salaryComponentPage.getTotalElements());
        if (salaryComponentList != null && salaryComponentList.size() > 0) {
            for (SalaryComponent salaryComponent : salaryComponentList) {
                SalaryComponentPersistModel salaryComponentPersistModel = new SalaryComponentPersistModel();
               salaryComponentPersistModel.setId(salaryComponent.getId());
               if(salaryComponent.getDescription()!=null && !salaryComponent.getDescription().isEmpty()){
                   salaryComponentPersistModel.setDescription(salaryComponent.getDescription());
               }
               if(salaryComponent.getFlatAmount()!=null){
                   salaryComponentPersistModel.setFlatAmount(salaryComponent.getFlatAmount());
               }
                if(salaryComponent.getFormula()!=null){
                    salaryComponentPersistModel.setFormula(salaryComponent.getFormula());
                }
                if(salaryComponent.getComponentCode()!=null){
                    salaryComponentPersistModel.setComponentCode(salaryComponent.getComponentCode());
                }
                if(salaryComponent.getComponentType()!=null){
                    salaryComponentPersistModel.setComponentType(salaryComponent.getComponentType());
                }
                if(salaryComponent.getCalculationType()!=null){
                    salaryComponentPersistModel.setCalculationType(salaryComponent.getCalculationType());
                }
                salaryComponentPersistModelList.add(salaryComponentPersistModel);
            }
            responseModel.setData(salaryComponentPersistModelList);
        }
        return salaryComponentPersistModelList;
    }
    private Pageable getSalaryComponentPageableRequest(int pageNo, int pageSize, String sortOrder, String sortingCol) {
        if(sortingCol !=null && !sortingCol.isEmpty()){
            if(sortOrder!=null && sortOrder.contains("desc")) {
                return PageRequest.of(pageNo, pageSize, Sort.by(sortingCol).descending());
            }
            else {
                return PageRequest.of(pageNo, pageSize, Sort.by(sortingCol).ascending());
            }
        }
        return PageRequest.of(pageNo, pageSize, Sort.by("createdDate").descending());
    }
}

