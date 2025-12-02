package com.simplevat.rest.payroll;
import com.simplevat.aop.LogRequest;
import com.simplevat.constant.EmailConstant;
import com.simplevat.constant.dbfilter.DateFormatFilterEnum;
import com.simplevat.entity.*;
import com.simplevat.model.SalaryPersistModel;
import com.simplevat.rest.detailedgeneralledgerreport.ReportRequestModel;
import com.simplevat.rest.employeecontroller.EmployeeController;
import com.simplevat.rest.employeecontroller.EmployeeListModel;
import com.simplevat.rest.payroll.model.MoneyPaidToUserModel;
import com.simplevat.rest.payroll.service.Impl.SalaryServiceImpl;
import com.simplevat.rest.payroll.service.SalaryService;
import com.simplevat.rest.payroll.service.SalaryTemplateService;
import com.simplevat.security.JwtTokenUtil;
import com.simplevat.service.EmaiLogsService;
import com.simplevat.service.EmployeeService;
import com.simplevat.service.EmploymentService;
import com.simplevat.service.UserService;
import com.simplevat.utils.EmailSender;
import com.simplevat.utils.MailUtility;
import io.swagger.annotations.ApiOperation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;
import javax.xml.bind.DatatypeConverter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import static com.simplevat.constant.ErrorConstant.ERROR;
import static com.simplevat.rest.invoicecontroller.HtmlTemplateConstants.PAYSLIP_TEMPLATE;

/**
 *
 * @author Adil
 */
@RestController
@RequestMapping("/rest/Salary")
public class SalaryController {

    private final Logger logger = LoggerFactory.getLogger(PayrollController.class);

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private UserService userService;

    @Autowired
    private SalaryRestHelper salaryRestHelper;

//    @Autowired
//    private EmployeeTransactionCategoryRelation employeeTransactionCategoryRelation;

    @Autowired
    EmploymentService employmentService;

    @Autowired
    SalaryTemplateService salaryTemplateService;

    @Autowired
    SalaryService salaryService;
    @Autowired
    SalaryServiceImpl salaryServiceImpl;



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
           if(sendMail==true && employeeId!=null) {
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



