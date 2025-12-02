package com.simplevat.rest.employeeDesignationController;

import com.simplevat.aop.LogRequest;
import com.simplevat.entity.Employee;
import com.simplevat.entity.EmployeeDesignation;
import com.simplevat.entity.SalaryRole;
import com.simplevat.entity.User;
import com.simplevat.model.EmployeeDesignationPersistModel;
import com.simplevat.repository.EmployeeRepository;
import com.simplevat.rest.DropdownObjectModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.rest.payroll.PayRollFilterModel;
import com.simplevat.security.JwtTokenUtil;
import com.simplevat.service.EmployeeDesignationService;
import com.simplevat.service.EmployeeService;
import com.simplevat.service.UserService;
import io.swagger.annotations.ApiOperation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.simplevat.constant.ErrorConstant.ERROR;

/**
 *
 * @author Suraj
 */
@RestController
@RequestMapping("/rest/employeeDesignation")
public class EmployeeDesignationController {

    private final Logger logger = LoggerFactory.getLogger(EmployeeDesignationController.class);

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private UserService userService;
    @Autowired
    private EmployeeDesignationRestHelper employeeDesignationRestHelper;
    @Autowired
    private EmployeeDesignationService employeeDesignationService;
    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private EmployeeRepository employeeRepository;
    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Save a Employee Designation",response = EmployeeDesignation.class)
    @PostMapping(value = "/saveEmployeeDesignation")
    public ResponseEntity<String> saveEmployeeDesignation(@ModelAttribute EmployeeDesignationPersistModel employeeDesignationPersistModel, HttpServletRequest request)
    {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);

            EmployeeDesignation employeeDesignation = employeeDesignationRestHelper.getEmployeeDesignationEntity(employeeDesignationPersistModel);

            employeeDesignationService.persist(employeeDesignation);

            return new ResponseEntity(HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Update EmployeeDesignation", response = EmployeeDesignation.class)
    @PostMapping(value = "/updateEmployeeDesignation")
    public ResponseEntity<String> updateEmployeeDesignation(@ModelAttribute EmployeeDesignationPersistModel employeeDesignationPersistModel, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);

            EmployeeDesignation employeeDesignation = employeeDesignationRestHelper.getEmployeeDesignationEntity(employeeDesignationPersistModel);

            employeeDesignationService.update(employeeDesignation);
            return new ResponseEntity(HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * This method will delete Employee-Designation
     * i.e. Soft delete
     *
     * @param id
     * @return
     */
    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Delete EmployeeDesignation By ID")
    @DeleteMapping(value = "/deleteEmployeeDesignation")
    public ResponseEntity<String> deleteEmployeeDesignation(@RequestParam(value = "id") Integer id) {
        try {
            EmployeeDesignation employeeDesignation = employeeDesignationService.findByPK(id);
            Map<String,Object> employeeDesignationMap=new HashMap<>();
            employeeDesignationMap.put("employeeDesignationId",employeeDesignation);
            List<Employee> employeeList=employeeService.findByAttributes(employeeDesignationMap);

            //filtered deleted employees for checking presence of child-activity
            employeeList=employeeList.stream()
                                     .filter(employee -> employee.getDeleteFlag()!=true)
                                     .collect(Collectors.toList());
            if (employeeDesignation != null && employeeList.size()==0) {
                employeeDesignation.setDeleteFlag(Boolean.TRUE);
                employeeDesignationService.update(employeeDesignation, employeeDesignation.getId());
                return new ResponseEntity(HttpStatus.OK);
            }else
            /**
             * “already exists http status code”
             *  The appropriate status code for "Already Exists" would be
             * '409 Conflict'
             */
                return new ResponseEntity(HttpStatus.CONFLICT);

        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @ApiOperation(value = "Get EmployeeDesignation By ID")
    @GetMapping(value = "/getEmployeeDesignationById")
    public ResponseEntity<EmployeeDesignationPersistModel> getEmployeeDesignationById(@RequestParam(value = "id") Integer id) {
        try {
            EmployeeDesignation employeeDesignation = employeeDesignationService.findByPK(id);
            if (employeeDesignation == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            } else {
                return new ResponseEntity(employeeDesignationRestHelper.getEmployeeDesignationModel(employeeDesignation), HttpStatus.OK);
            }
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @ApiOperation(value = "get Employee Designation DropdownModel ",response = EmployeeDesignation.class)
    @GetMapping(value = "/getEmployeeDesignationForDropdown")
    public ResponseEntity<List<DropdownObjectModel>> getEmployeeDesignationForDropdown()
    {
        return new ResponseEntity<>(employeeDesignationService.getEmployeeDesignationDropdown(), HttpStatus.OK);
    }

    @LogRequest
    @ApiOperation(value = "get Parent Employee Designation DropdownModel ",response = EmployeeDesignation.class)
    @GetMapping(value = "/getParentEmployeeDesignationForDropdown")
    public ResponseEntity<List<DropdownObjectModel>> getParentEmployeeDesignationForDropdown()
    {
        return new ResponseEntity<>(employeeDesignationService.getParentEmployeeDesignationForDropdown(), HttpStatus.OK);
    }

    @LogRequest
    @ApiOperation(value = "Get Employee Designation list", response = List.class)
    @GetMapping(value = "/EmployeeDesignationList")
    public ResponseEntity<PaginationResponseModel> getEmployeeDesignationList(PayRollFilterModel filterModel,
                                                                         HttpServletRequest request) {
        Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
        User user = userService.findByPK(userId);
        Map<Object, Object> filterDataMap = new HashMap<>();
        PaginationResponseModel paginationResponseModel = employeeDesignationService.getEmployeeDesignationList(filterDataMap, filterModel);
        if (paginationResponseModel != null) {
            return new ResponseEntity<>(employeeDesignationRestHelper.getEmployeeDesignationListModel(paginationResponseModel), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @GetMapping(value = "/getEmployeeDesignationCount")
    public ResponseEntity<Integer> getEmployeeDesignationCount(@RequestParam(value = "id") Integer id)
    {
        Integer count = 0;
        EmployeeDesignation employeeDesignation = employeeDesignationService.findByPK(id);
         count = employeeRepository.countEmployeesByEmployeeDesignationIdAndDeleteFlag(employeeDesignation,Boolean.FALSE);
        return new ResponseEntity<>(count, HttpStatus.OK);
    }
}
