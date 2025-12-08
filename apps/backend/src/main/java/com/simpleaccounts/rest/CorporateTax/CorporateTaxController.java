package com.simpleaccounts.rest.CorporateTax;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.aop.LogExecutionTime;
import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.constant.CommonColumnConstants;
import com.simpleaccounts.constant.CommonStatusEnum;
import com.simpleaccounts.entity.Company;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.entity.VatPayment;
import com.simpleaccounts.rest.CorporateTax.Model.CorporateTaxDateModel;
import com.simpleaccounts.rest.CorporateTax.Model.CorporateTaxPaymentModel;
import com.simpleaccounts.rest.CorporateTax.Model.PaymentHistoryModel;
import com.simpleaccounts.rest.CorporateTax.Repositories.CorporateTaxSettingRepository;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.companycontroller.CompanyRestHelper;
import com.simpleaccounts.rest.financialreport.FinancialReportRequestModel;
import com.simpleaccounts.rest.financialreport.FinancialReportRestHelper;
import com.simpleaccounts.rest.financialreport.ProfitAndLossResponseModel;
import com.simpleaccounts.rest.financialreport.RecordVatPaymentRequestModel;
import com.simpleaccounts.rfq_po.PoQuatationController;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.CompanyService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.utils.DateFormatUtil;
import com.simpleaccounts.utils.MessageUtil;
import com.simpleaccounts.utils.SimpleAccountsMessage;
import io.swagger.annotations.ApiOperation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;

@RestController
@RequestMapping(value = "/rest/corporate/tax")
public class CorporateTaxController {
    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private CompanyService companyService;
    @Autowired
    private UserService userService;

    @Autowired
    private CorporateTaxSettingRepository corporateTaxSettingRepository;

    @Autowired
    private DateFormatUtil dateFormatUtil;

    @Autowired
    private FinancialReportRestHelper financialReportRestHelper;

    @Autowired
    private CorporateTaxFilingRepository corporateTaxFilingRepository;

    @Autowired
     CorporateTaxService corporateTaxService;
    private final Logger log = LoggerFactory.getLogger(PoQuatationController.class);
    DateTimeFormatter outputFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @LogRequest
    @ApiOperation(value = "Add Corporate Tax settings")
    @PostMapping(value = "/save")
    public ResponseEntity<Object> save(@RequestBody CorporateTaxDateModel model, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            Company company = new Company();
            if (userId != null) {
                User user = userService.findByPK(userId);
                company = user.getCompany();
            }
            if(model.getIsEligibleForCP()!=null) {
                company.setIsEligibleForCp(model.getIsEligibleForCP());
            }
            companyService.persist(company);
            CorporateTaxSettings corporateTaxSettings = new CorporateTaxSettings();
            if (model.getCorporateTaxSettingId()!=null){
                List<CorporateTaxSettings> corporateTaxSettingsList =corporateTaxSettingRepository.findAll();
                for(CorporateTaxSettings corporateTaxSettings1:corporateTaxSettingsList){
                    corporateTaxSettings1.setSelectedFlag(Boolean.FALSE);
                }
                corporateTaxSettings = corporateTaxSettingRepository.findById(model.getCorporateTaxSettingId()).get();
                corporateTaxSettings.setSelectedFlag(Boolean.TRUE);
            }
            corporateTaxSettingRepository.save(corporateTaxSettings);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            log.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @LogRequest
    @ApiOperation(value = "Get Corporate Tax settings")
    @GetMapping(value = "/get/setting")
    public ResponseEntity<Object> getsetting(HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            Company company = null;
            List<CorporateTaxSettings> corporateTaxSettingsList =new ArrayList<>();
            List<CorporateTaxDateModel> corporateTaxDateModelList = new ArrayList<>();
            corporateTaxSettingsList = corporateTaxSettingRepository.findAll();
            for(CorporateTaxSettings corporateTaxSettings:corporateTaxSettingsList) {
                CorporateTaxDateModel model = new CorporateTaxDateModel();
                model.setCorporateTaxSettingId(corporateTaxSettings.getId());
                model.setFiscalYear(corporateTaxSettings.getFiscalYear());
                model.setDeleteFlag(corporateTaxSettings.getDeleteFlag());
                model.setSelectedFlag(corporateTaxSettings.getSelectedFlag());
                if (userId != null) {
                    User user = userService.findByPK(userId);
                    company = user.getCompany();
                }
                model.setIsEligibleForCP(company.getIsEligibleForCp());
                corporateTaxDateModelList.add(model);
            }
            return new ResponseEntity<>(corporateTaxDateModelList,HttpStatus.OK);
        } catch (Exception e) {
            log.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @LogExecutionTime
    @ApiOperation(value = "Generate Corporate Tax settings")
    @PostMapping(value = "/generatect")
    public ResponseEntity<String> generatect(@RequestBody CorporateTaxModel corporateTaxModel, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            CorporateTaxFiling corporateTaxFiling = new CorporateTaxFiling();
            LocalDateTime startDate = dateFormatUtil.getDateStrAsLocalDateTime(corporateTaxModel.getStartDate(),
                    CommonColumnConstants.DD_MM_YYYY);
            LocalDate sd = startDate.toLocalDate();
            LocalDateTime endDate =dateFormatUtil.getDateStrAsLocalDateTime(corporateTaxModel.getEndDate(),
                    CommonColumnConstants.DD_MM_YYYY);
            LocalDate ed = endDate.toLocalDate();
            LocalDateTime dueDate =dateFormatUtil.getDateStrAsLocalDateTime(corporateTaxModel.getDueDate(),
                    CommonColumnConstants.DD_MM_YYYY);
            LocalDate dd = dueDate.toLocalDate();
            if(corporateTaxModel.getTaxFiledOn()!=null) {
                LocalDateTime filedOn = dateFormatUtil.getDateStrAsLocalDateTime(corporateTaxModel.getTaxFiledOn(),
                        CommonColumnConstants.DD_MM_YYYY);
                LocalDate fo = filedOn.toLocalDate();
                corporateTaxFiling.setTaxFiledOn(fo);
            }
            corporateTaxFiling.setCreatedBy(userId);
            corporateTaxFiling.setCreatedDate(LocalDateTime.now());
            corporateTaxFiling.setLastUpdateBy(userId);
            corporateTaxFiling.setLastUpdateDate(LocalDateTime.now());
            corporateTaxFiling.setStartDate(sd);
            corporateTaxFiling.setEndDate(ed);
            corporateTaxFiling.setDueDate(dd);
            corporateTaxFiling.setReportingForYear(corporateTaxModel.getReportingForYear());
            corporateTaxFiling.setReportingPeriod(corporateTaxModel.getReportingPeriod());
            FinancialReportRequestModel financialReportRequestModel = new FinancialReportRequestModel();
            financialReportRequestModel.setStartDate(corporateTaxModel.getStartDate().toString());
            financialReportRequestModel.setEndDate(corporateTaxModel.getEndDate().toString());
            ProfitAndLossResponseModel profitAndLossResponseModel = financialReportRestHelper.getProfitAndLossReport(financialReportRequestModel);
            if (profitAndLossResponseModel!=null){
                corporateTaxFiling.setNetIncome(profitAndLossResponseModel.getOperatingProfit());
                BigDecimal corporateTax = new BigDecimal("375000.00");
                if(profitAndLossResponseModel.getOperatingProfit()!=null) {
                    if (profitAndLossResponseModel.getOperatingProfit().compareTo(corporateTax) <= 0) {
                        corporateTaxFiling.setTaxableAmount(BigDecimal.ZERO);
                        corporateTaxFiling.setTaxAmount(BigDecimal.ZERO);
                        corporateTaxFiling.setBalanceDue(BigDecimal.ZERO);
                    } else {
                        BigDecimal taxableAmt = new BigDecimal(String.valueOf(profitAndLossResponseModel.getOperatingProfit().subtract(corporateTax)));
                        corporateTaxFiling.setTaxableAmount(taxableAmt);
                        corporateTaxFiling.setTaxAmount(taxableAmt.multiply(BigDecimal.valueOf(0.09)));
                        corporateTaxFiling.setBalanceDue(taxableAmt.multiply(BigDecimal.valueOf(0.09)));
                    }
                }
                }
            corporateTaxFiling.setStatus(CommonStatusEnum.UN_FILED.getValue());
            corporateTaxFilingRepository.save(corporateTaxFiling);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            log.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @LogExecutionTime
    @ApiOperation(value = "View Corporate Tax settings")
    @GetMapping(value = "/viewct")
    public ResponseEntity<Object> viewct(@RequestParam(value = "id") Integer id, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            CorporateTaxFiling corporateTaxFiling = corporateTaxFilingRepository.findById(id).get();
//            CorporateTaxModel corporateTaxModel = new CorporateTaxModel();
//            corporateTaxModel.setId(corporateTaxFiling.getId());
//            corporateTaxModel.setStartDate(corporateTaxFiling.getStartDate().toString());
//            corporateTaxModel.setEndDate(corporateTaxFiling.getEndDate().toString());
//            corporateTaxModel.setReportingPeriod(corporateTaxFiling.getReportingPeriod());
//            corporateTaxModel.setReportingForYear(corporateTaxFiling.getReportingForYear());
//            corporateTaxModel.setViewCtReport(corporateTaxFiling.getViewCtReport());
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(corporateTaxFiling.getViewCtReport());
            return new ResponseEntity<>(rootNode,HttpStatus.OK);
        } catch (Exception e) {
            log.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @LogExecutionTime
    @ApiOperation(value = "File Corporate Tax")
    @PostMapping(value = "/filect")
    public ResponseEntity<String> filect(@RequestBody CorporateTaxModel corporateTaxModel, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            CorporateTaxFiling corporateTaxFiling = corporateTaxFilingRepository.findById(corporateTaxModel.getId()).get();
            LocalDateTime filedOn = dateFormatUtil.getDateStrAsLocalDateTime(corporateTaxModel.getTaxFiledOn(),
                    CommonColumnConstants.DD_MM_YYYY);
            LocalDate fo = filedOn.toLocalDate();
            corporateTaxFiling.setTaxFiledOn(fo);
            FinancialReportRequestModel financialReportRequestModel = new FinancialReportRequestModel();
            LocalDate sDate = LocalDate.parse(corporateTaxFiling.getStartDate().toString());
            String startingDate = sDate.format(outputFormatter);
            financialReportRequestModel.setStartDate(startingDate);
            financialReportRequestModel.setEndDate(corporateTaxModel.getTaxFiledOn());
            ProfitAndLossResponseModel profitAndLossResponseModel = financialReportRestHelper.getProfitAndLossReport(financialReportRequestModel);
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                String jsonString = objectMapper.writeValueAsString(profitAndLossResponseModel);
                corporateTaxFiling.setViewCtReport(jsonString);
            }catch (Exception e){

            }
            if(corporateTaxFiling.getTaxableAmount().compareTo(BigDecimal.ZERO) > 0) {
                corporateTaxService.createJournalForCT(corporateTaxFiling, userId);
            }
            corporateTaxFiling.setStatus(CommonStatusEnum.FILED.getValue());
            corporateTaxFilingRepository.save(corporateTaxFiling);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            log.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @LogExecutionTime
    @ApiOperation(value = "Un File Corporate Tax")
    @PostMapping(value = "/unfilect")
    public ResponseEntity<String> unfilect(@RequestBody CorporateTaxModel corporateTaxModel, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            CorporateTaxFiling corporateTaxFiling = corporateTaxFilingRepository.findById(corporateTaxModel.getId()).get();
            corporateTaxFiling.setTaxFiledOn(null);
            if(corporateTaxFiling.getTaxableAmount().compareTo(BigDecimal.ZERO) > 0) {
                corporateTaxService.createReverseJournalForCT(corporateTaxFiling, userId);
            }
            corporateTaxFiling.setStatus(CommonStatusEnum.UN_FILED.getValue());
            corporateTaxFilingRepository.save(corporateTaxFiling);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            log.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Record CT Payment")
    @PostMapping(value = "/recordctpayment")
    public ResponseEntity<Object> recordctpayment(@RequestBody CorporateTaxPaymentModel corporateTaxPaymentModel, HttpServletRequest
            request){
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            CorporateTaxPayment corporateTaxPayment = corporateTaxService.recordCorporateTaxPayment(corporateTaxPaymentModel,userId);
            return new ResponseEntity<>("message",HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>("message",HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @LogRequest
    @ApiOperation(value = "Corporate tax list")
    @GetMapping(value = "/Corporate/list")
    public ResponseEntity<Object> getList(HttpServletRequest request,
                                     @RequestParam(defaultValue = "0") int pageNo,
                                     @RequestParam(defaultValue = "10") int pageSize,
                                     @RequestParam(required = false, defaultValue = "true") boolean paginationDisable,
                                     @RequestParam(required = false) String order,
                                     @RequestParam(required = false) String sortingCol){
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            PaginationResponseModel responseModel = new PaginationResponseModel();
            List<CorporateTaxModel> response = corporateTaxService.getCorporateTaxList(responseModel,pageNo,pageSize,paginationDisable,order,sortingCol,userId);
            return new ResponseEntity<>(responseModel,HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @LogRequest
    @ApiOperation(value = "Corporate tax payment history")
    @GetMapping(value = "/payment/history")
    public ResponseEntity<Object> getPaymentHistoryList(HttpServletRequest request,
                                     @RequestParam(defaultValue = "0") int pageNo,
                                     @RequestParam(defaultValue = "10") int pageSize,
                                     @RequestParam(required = false, defaultValue = "true") boolean paginationDisable,
                                     @RequestParam(required = false) String order,
                                     @RequestParam(required = false) String sortingCol){
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            PaginationResponseModel responseModel = new PaginationResponseModel();
            List<PaymentHistoryModel> response = corporateTaxService.getCtPaymentHistory(responseModel,pageNo,pageSize,paginationDisable,order,sortingCol,userId);
            return new ResponseEntity<>(responseModel,HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Delete Corporate Tax Report By ID")
    @DeleteMapping(value = "/delete")
    public ResponseEntity<Object> delete(@RequestParam(value = "id") Integer id) {
        try {
            SimpleAccountsMessage message= null;
            CorporateTaxFiling corporateTaxFiling = corporateTaxFilingRepository.findById(id).get();
            corporateTaxFiling.setDeleteFlag(Boolean.TRUE);
            corporateTaxFilingRepository.save(corporateTaxFiling);
            message = new SimpleAccountsMessage("0091",
                    MessageUtil.getMessage("corporateTaxReport.deleted.successful.msg.0091"), false);
            return new ResponseEntity<>(message,HttpStatus.OK);
        }catch (Exception e){
            SimpleAccountsMessage message= null;
            message = new SimpleAccountsMessage("",
                    MessageUtil.getMessage("delete.unsuccessful.msg"), true);
            return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
