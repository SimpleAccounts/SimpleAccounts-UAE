package com.simpleaccounts.rest.financialreport;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.constant.CommonColumnConstants;
import com.simpleaccounts.constant.dbfilter.VatReportFilterEnum;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.model.VatReportRequestFilterModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.PostingRequestModel;

import com.simpleaccounts.rest.vatcontroller.VatReportResponseListForBank;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.*;
import com.simpleaccounts.utils.DateFormatUtil;
import com.simpleaccounts.utils.MessageUtil;
import com.simpleaccounts.utils.SimpleAccountsMessage;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import javax.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping(value = "/rest/vatReport")
@RequiredArgsConstructor
public class VatReportFilingRestController {
    private final JwtTokenUtil jwtTokenUtil;

    private final UserService userService;

    private final VatReportFilingService vatReportFilingService;

    private final VatReportService vatReportService;

    private final VatRecordPaymentHistoryService vatRecordPaymentHistoryService;
    private final JournalService journalService;

    private final DateFormatUtil dateFormatUtil;

    private final VatReportFilingRepository vatReportFilingRepository;

    @LogRequest
    @ApiOperation(value = "Get Vat Report Filing List")
    @GetMapping(value = "/getVatReportFilingList")
    public ResponseEntity<PaginationResponseModel> getList(VatReportRequestFilterModel filterModel, HttpServletRequest request) {
        try {
            Map<VatReportFilterEnum, Object> filterDataMap = new EnumMap<>(VatReportFilterEnum.class);
            filterDataMap.put(VatReportFilterEnum.DELETE_FLAG, false);

            PaginationResponseModel response = vatReportService.getVatReportList(filterDataMap, filterModel);
            if (response == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            } else {
                response.setData( vatReportFilingService.getVatReportFilingList2((List<VatReportFiling>) response.getData()));
                return new ResponseEntity<>(response, HttpStatus.OK);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @LogRequest
    @ApiOperation(value = "Get Vat Report Filing List")
    @GetMapping(value = "/getVatPaymentHistoryList")
    public ResponseEntity<PaginationResponseModel> getVatPaymentRecordList(VatReportRequestFilterModel filterModel, HttpServletRequest request) {
        try {
            Map<VatReportFilterEnum, Object> filterDataMap = new EnumMap<>(VatReportFilterEnum.class);
            filterDataMap.put(VatReportFilterEnum.DELETE_FLAG, false);
            PaginationResponseModel response = vatRecordPaymentHistoryService.getVatReportList(filterDataMap, filterModel);
            if (response == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            } else {
                response.setData( vatReportFilingService.getVatPaymentRecordList2((List<VatRecordPaymentHistory>) response.getData()));
                return new ResponseEntity<>(response, HttpStatus.OK);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

	@LogRequest
	@ApiOperation(value = "Get Vat Report Filing List For Bank")
	@GetMapping(value = "/getVatReportListForBank")
	public ResponseEntity<Object> getVatReportListForBank(Integer id) {
        try {
            List<VatReportResponseListForBank> vatReportResponseListForBanks = new ArrayList<>();
            List<VatReportFiling> vatReportFilingListForPaymentOrClaim = new ArrayList<>();
            List<VatReportFiling> vatReportFilingList = vatReportFilingRepository.findAll();
            if (id.equals(1)){
                vatReportFilingListForPaymentOrClaim = vatReportFilingList.stream().filter(vatReportFiling -> vatReportFiling.getIsVatReclaimable().equals(Boolean.FALSE)
                        && vatReportFiling.getDeleteFlag().equals(Boolean.FALSE) && (vatReportFiling.getStatus().equals(11) || vatReportFiling.getStatus().equals(5))).collect(Collectors.toList());
            }
            else {
                vatReportFilingListForPaymentOrClaim = vatReportFilingList.stream().filter(vatReportFiling -> vatReportFiling.getIsVatReclaimable().equals(Boolean.TRUE)
                        && vatReportFiling.getDeleteFlag().equals(Boolean.FALSE) && (vatReportFiling.getStatus().equals(11) || vatReportFiling.getStatus().equals(5))).collect(Collectors.toList());
            }
            for (VatReportFiling vatReportFiling:vatReportFilingListForPaymentOrClaim){
                VatReportResponseListForBank vatReportResponseListForBank = new VatReportResponseListForBank();
                vatReportResponseListForBank.setId(vatReportFiling.getId());
                vatReportResponseListForBank.setVatNumber(vatReportFiling.getVatNumber());
                vatReportResponseListForBank.setDueAmount(vatReportFiling.getBalanceDue());
                vatReportResponseListForBank.setTaxFiledOn(vatReportFiling.getTaxFiledOn());
                if (id.equals(1))
                    vatReportResponseListForBank.setTotalAmount(vatReportFiling.getTotalTaxPayable());
                else
                    vatReportResponseListForBank.setTotalAmount(vatReportFiling.getTotalTaxReclaimable());
                vatReportResponseListForBanks.add(vatReportResponseListForBank);
            }

            return new ResponseEntity<>(vatReportResponseListForBanks, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional
    @ApiOperation(value = "Generate Vat Report")
    @PostMapping(value = "/generateVatReport")
    public ResponseEntity<Object> generateVatReport(@RequestBody VatReportFilingRequestModel vatReportFilingRequestModel,
                                               HttpServletRequest httpServletRequest){
     try{
         SimpleAccountsMessage message = null;
         Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(httpServletRequest);
         User user = userService.findByPK(userId);

         //validation
         LocalDateTime startDate = dateFormatUtil.getDateStrAsLocalDateTime(vatReportFilingRequestModel.getStartDate(),
                 CommonColumnConstants.DD_MM_YYYY);
         LocalDate sd = startDate.toLocalDate();
         LocalDateTime endDate =dateFormatUtil.getDateStrAsLocalDateTime(vatReportFilingRequestModel.getEndDate(),
                 CommonColumnConstants.DD_MM_YYYY);
         LocalDate ed = endDate.toLocalDate();
         List<VatReportFiling> vatReportFilingList = vatReportFilingRepository.findAll();

         boolean datesAlreadyExist=false;
         if (!vatReportFilingList.isEmpty()){
             for (VatReportFiling vatReportFilingfordateValidation:vatReportFilingList){
                 //
                 if((sd.isAfter( vatReportFilingfordateValidation.getStartDate()) &&
                         ed.isBefore(  vatReportFilingfordateValidation.getEndDate()))||
                         sd.equals(vatReportFilingfordateValidation.getStartDate())  ||
                         ed.equals( vatReportFilingfordateValidation.getEndDate()))
                     datesAlreadyExist=true;

             }
         }

        if(datesAlreadyExist==true){
            message = new SimpleAccountsMessage("",
                    MessageUtil.getMessage("vatreport.ExistingDates.msg"), true);
            return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
        }

     //Processing
         boolean vatRecorded=  vatReportFilingService.processVatReport(vatReportFilingRequestModel,user);
         if(vatRecorded==true)
         {       message = new SimpleAccountsMessage("0084",
                        MessageUtil.getMessage("vatreport.created.successful.msg.0084"), false);
             return new ResponseEntity<>(message,HttpStatus.OK);
         }else
         {
                 message = new SimpleAccountsMessage("",
                         MessageUtil.getMessage("vatreport.Record.msg"), true);
             return new ResponseEntity<>( message,HttpStatus.OK);
         }
     }catch (Exception e){
         SimpleAccountsMessage message= null;
         message = new SimpleAccountsMessage("",
                 MessageUtil.getMessage("create.unsuccessful.msg"), true);
         return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
     }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "File Vat Report")
    @PostMapping(value = "/fileVatReport")
    public ResponseEntity<Object> fileReport(@ModelAttribute FileTheVatReportRequestModel fileTheVatReportRequestModel,HttpServletRequest request ){
        try {
            SimpleAccountsMessage message= null;
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);
            vatReportFilingService.fileVatReport(fileTheVatReportRequestModel,user);
            message = new SimpleAccountsMessage("0086",
                    MessageUtil.getMessage("vatreport.filed.successful.msg.0086"), false);
            return new ResponseEntity<>(message,HttpStatus.OK);

        }catch (Exception e){
            SimpleAccountsMessage message= null;
            message = new SimpleAccountsMessage("",
                    MessageUtil.getMessage("filed.unsuccessful.msg"), true);
            return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Undo Filed Vat Report")
    @PostMapping(value = "/undoFiledVatReport")
    public ResponseEntity<Object> undoFiledVatReport(@RequestBody PostingRequestModel postingRequestModel,HttpServletRequest request){
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
           Journal journal =  vatReportFilingService.undoFiledVatReport(postingRequestModel,userId);
           if (journal!=null){
               journalService.persist(journal);
           }
           return new ResponseEntity<>( "undo posting",HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>( "undo posting",HttpStatus.OK);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Record Vat Payment")
    @PostMapping(value = "/recordVatPayment")
    public ResponseEntity<Object> recordVatPayment(RecordVatPaymentRequestModel recordVatPaymentRequestModel,HttpServletRequest
            request){
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            VatPayment vatPayment = vatReportFilingService.recordVatPayment(recordVatPaymentRequestModel,userId);
            return new ResponseEntity<>("message",HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>("message",HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Delete Vat Report By ID")
    @DeleteMapping(value = "/delete")
    public ResponseEntity<Object> delete(@RequestParam(value = "id") Integer id) {
        try {
            SimpleAccountsMessage message= null;

            vatReportFilingService.deleteVatReportFiling(id);
            message = new SimpleAccountsMessage("0085",
                    MessageUtil.getMessage("vatreport.deleted.successful.msg.0085"), false);
            return new ResponseEntity<>(message,HttpStatus.OK);
        }catch (Exception e){
            SimpleAccountsMessage message= null;
            message = new SimpleAccountsMessage("",
                    MessageUtil.getMessage("delete.unsuccessful.msg"), true);
            return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
