package com.simpleaccounts.rest.employeeDesignationController;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeDesignation;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.model.EmployeeDesignationPersistModel;
import com.simpleaccounts.repository.EmployeeRepository;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.payroll.PayRollFilterModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.EmployeeDesignationService;
import com.simpleaccounts.service.EmployeeService;
import com.simpleaccounts.service.UserService;
import io.swagger.annotations.ApiOperation;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import static com.simpleaccounts.constant.ErrorConstant.ERROR;

/**
 *
 * @author Suraj
 */
@RestController
@RequestMapping("/rest/employeeDesignation")
@RequiredArgsConstructor
public class EmployeeDesignationController {

    private final Logger logger = LoggerFactory.getLogger(EmployeeDesignationController.class);

    private final JwtTokenUtil jwtTokenUtil;

    private final UserService userService;
    private final EmployeeDesignationRestHelper employeeDesignationRestHelper;
    private final EmployeeDesignationService employeeDesignationService;
    private final EmployeeService employeeService;

    private final EmployeeRepository employeeRepository;
    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Save a Employee Designation",response = EmployeeDesignation.class)
    @PostMapping(value = "/saveEmployeeDesignation")
    public ResponseEntity<String> saveEmployeeDesignation(@ModelAttribute EmployeeDesignationPersistModel employeeDesignationPersistModel, HttpServletRequest request)
    {
        try {
            jwtTokenUtil.getUserIdFromHttpRequest(request);

            EmployeeDesignation employeeDesignation = employeeDesignationRestHelper.getEmployeeDesignationEntity(employeeDesignationPersistModel);

            employeeDesignationService.persist(employeeDesignation);

            return new ResponseEntity<>(HttpStatus.OK);
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
            jwtTokenUtil.getUserIdFromHttpRequest(request);

            EmployeeDesignation employeeDesignation = employeeDesignationRestHelper.getEmployeeDesignationEntity(employeeDesignationPersistModel);

            employeeDesignationService.update(employeeDesignation);
            return new ResponseEntity<>(HttpStatus.OK);
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
                return new ResponseEntity<>(HttpStatus.OK);
            }else
            /**
             * “already exists http status code”
             *  The appropriate status code for "Already Exists" would be
             * '409 Conflict'
             */
                return new ResponseEntity<>(HttpStatus.CONFLICT);

        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
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
                return new ResponseEntity<>(
                        employeeDesignationRestHelper.getEmployeeDesignationModel(employeeDesignation),
                        HttpStatus.OK);
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
        jwtTokenUtil.getUserIdFromHttpRequest(request);
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
