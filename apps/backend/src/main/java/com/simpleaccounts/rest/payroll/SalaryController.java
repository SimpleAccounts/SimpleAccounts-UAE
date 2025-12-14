package com.simpleaccounts.rest.payroll;
import static com.simpleaccounts.constant.ErrorConstant.ERROR;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.model.SalaryPersistModel;
import com.simpleaccounts.rest.payroll.service.Impl.SalaryServiceImpl;
import com.simpleaccounts.rest.payroll.service.SalaryService;
import com.simpleaccounts.rest.payroll.service.SalaryTemplateService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.EmploymentService;
import com.simpleaccounts.service.UserService;
import io.swagger.annotations.ApiOperation;
import java.util.List;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 *
 * @author Adil
 */
@RestController
@RequestMapping("/rest/Salary")
@RequiredArgsConstructor
public class SalaryController {

    private final Logger logger = LoggerFactory.getLogger(PayrollController.class);

    private final JwtTokenUtil jwtTokenUtil;

    private final UserService userService;

    private final SalaryRestHelper salaryRestHelper;

    private final EmploymentService employmentService;

    private final SalaryTemplateService salaryTemplateService;

    private final SalaryService salaryService;
    private final SalaryServiceImpl salaryServiceImpl;

    @LogRequest
    @ApiOperation(value = "Get SalaryPerMonth  List")
    @GetMapping(value = "/getSalaryPerMonthList")
    public ResponseEntity<SalaryListPerMonthResponseModel> getSalaryPerMonthList(@ModelAttribute SalaryPerMonthRequestModel requestModel,
                                                                          HttpServletRequest request) {
        try {
            SalaryListPerMonthResponseModel salaryListPerMonthResponseModel =   salaryRestHelper.getSalaryPerMonthList(requestModel);
            return new ResponseEntity<>(salaryListPerMonthResponseModel,HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @ApiOperation(value = "Get incomplete employee  List")
    @GetMapping(value = "/getIncompleteEmployeeList")
    public ResponseEntity<IncompleteEmployeeResponseModel> getIncompleteEmployeeList() {
        try {
            IncompleteEmployeeResponseModel incompleteEmployeeResponseModel =   salaryRestHelper.getIncompleteEmployeeList();
            return new ResponseEntity<>(incompleteEmployeeResponseModel,HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @ApiOperation(value = "Generate salary")
    @PostMapping(value = "/generateSalary")
    public ResponseEntity<String> generateSalary(@ModelAttribute SalaryPersistModel salaryPersistModel, HttpServletRequest request)  {
         try {
             String salaryStatus = salaryRestHelper.generateSalary(salaryPersistModel, request);
             return new ResponseEntity<>(salaryStatus, HttpStatus.OK);
         }
         catch (Exception e) {
             logger.error(ERROR, e);
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
         }
    }

    /**
     * This method will be used for 2 things
     * this will retrun the payslip list and also will send the email
     * if sendemail parameter is equal to true
     * @param employeeId
     * @param salaryDate
     * @param sendMail
     * @return
     */
    @LogRequest
    @ApiOperation(value = "Get Salaries By EmployeeID")
    @GetMapping(value = "/getSalariesByEmployeeId")
    public ResponseEntity<SalarySlipModel> getSalariesByEmployeeId(@RequestParam(value = "id") Integer employeeId,
                                                                   @RequestParam(value = "salaryDate") String salaryDate,
                                                                   @RequestParam(required = false,value = "startDate") String startDate,
                                                                   @RequestParam(required = false,value = "endDate") String endDate,
                                                                   @RequestParam(value = "sendMail") Boolean sendMail,HttpServletRequest request) {
        try {
           SalarySlipModel salarySlipModel=   salaryService.getSalaryByEmployeeId(employeeId,salaryDate);
	           if(Boolean.TRUE.equals(sendMail) && employeeId!=null) {
	               salaryRestHelper.sendPayslipEmail(salarySlipModel, employeeId, startDate, endDate, request);
	           }
            return   new ResponseEntity<>(salarySlipModel,HttpStatus.OK);
       } catch (Exception e) {
        logger.error(ERROR, e);
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
    @LogRequest
    @ApiOperation(value = "Get Employee expense category")
    @GetMapping(value = "/getEmployeeTc")
    public ResponseEntity<List> getDateFormat(@RequestParam(required = false) Integer employeeId,
                                              @RequestParam(required = false) String startDate,
                                              @RequestParam(required = false) String endDate) {

        List list = salaryServiceImpl.getEmployeeTransactions(employeeId,startDate,endDate);
        try {
            if (list == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error(ERROR, e);
        }
        return new ResponseEntity<>(list, HttpStatus.OK);
    }
    @LogRequest
    @ApiOperation(value = "Get SalarySlip  List")
    @GetMapping(value = "/getSalarySlipList")
    public ResponseEntity<SalarySlipListtResponseModel> getInvoiceList(@RequestParam(value = "id") Integer employeeId,
                                                                          HttpServletRequest request) {
        try {
            SalarySlipListtResponseModel salarySlipListtResponseModel =   salaryRestHelper.getSalarySlipList(employeeId);
            return new ResponseEntity<>(salarySlipListtResponseModel,HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
