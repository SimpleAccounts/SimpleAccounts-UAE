package com.simpleaccounts.rest.currencyconversioncontroller;

import com.simpleaccounts.aop.LogRequest;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.CompanyService;
import com.simpleaccounts.service.CurrencyExchangeService;
import com.simpleaccounts.service.CurrencyService;
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
import java.time.LocalDateTime;
import java.util.ArrayList;

import java.util.List;

@RestController
@RequestMapping(value = "/rest/currencyConversion")
@RequiredArgsConstructor
public class CurrencyConversionController{
    private final Logger logger = LoggerFactory.getLogger(CurrencyConversionController.class);

    private final JwtTokenUtil jwtTokenUtil;

    private final CompanyService companyService;

    private final CurrencyExchangeService currencyExchangeService;

    private final CurrencyConversionHelper currencyConversionHelper;

    private final CurrencyService currencyService;

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Save Currency Conversion", response = CurrencyConversion.class)
    @PostMapping(value = "/save")

    public ResponseEntity<Object> saveConvertedCurrency(@RequestBody CurrencyConversionRequestModel currencyConversionRequestModel
            , HttpServletRequest request){
        Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);

        CurrencyConversion currencyConversion = new CurrencyConversion();
        Currency currency=currencyService.findByPK(currencyConversionRequestModel.getCurrencyCode());
        currencyConversion.setCurrencyCode(currency);
        Company company=companyService.getCompany();
        if (currencyConversionRequestModel.getIsActive()!=null) {
            currencyConversion.setIsActive(currencyConversionRequestModel.getIsActive());
        }
        currencyConversion.setCurrencyCodeConvertedTo(company.getCurrencyCode());
        currencyConversion.setExchangeRate(currencyConversionRequestModel.getExchangeRate());
        currencyConversion.setCreatedDate(LocalDateTime.now());
        currencyExchangeService.persist(currencyConversion);
        SimpleAccountsMessage message = null;
              message = new SimpleAccountsMessage("0032",
                        MessageUtil.getMessage("currency.conversion.created.successful.msg.0032"), false);
                return new ResponseEntity<>(message,HttpStatus.OK);
//        return new ResponseEntity<>("Saved Successfully..", HttpStatus.OK);
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "update Currency Conversion", response = CurrencyConversion.class)
    @PostMapping("/update")
    public ResponseEntity<Object> updateConvertedCurrency(@RequestBody CurrencyConversionRequestModel
                                                                      currencyConversionRequestModel,HttpServletRequest request){
        try {
            SimpleAccountsMessage message = null;
            CurrencyConversion existingCurrency = currencyExchangeService.findByPK(currencyConversionRequestModel.getId());
            if (existingCurrency != null) {
                Currency currency = currencyService.findByPK(currencyConversionRequestModel.getCurrencyCode());
                existingCurrency.setCurrencyCode(currency);
                Company company = companyService.getCompany();
                if (currencyConversionRequestModel.getIsActive()!=null) {
                    existingCurrency.setIsActive(currencyConversionRequestModel.getIsActive());
                }
                existingCurrency.setCurrencyCodeConvertedTo(company.getCurrencyCode());
                existingCurrency.setExchangeRate(currencyConversionRequestModel.getExchangeRate());
                existingCurrency.setCreatedDate(LocalDateTime.now());
                currencyExchangeService.update(existingCurrency);
                message = new SimpleAccountsMessage("0034",
                        MessageUtil.getMessage("currency.conversion.updated.successful.msg.0034"), false);
                return new ResponseEntity<>(message,HttpStatus.OK);
//                return new ResponseEntity<>("Updated Successfully.", HttpStatus.OK);
            }
            else{
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            SimpleAccountsMessage message= null;
            message = new SimpleAccountsMessage("",
                    MessageUtil.getMessage("update.unsuccessful.msg"), true);
            return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @LogRequest
    @ApiOperation(value = "Get Currency List")
    @GetMapping(value = "/getCurrencyConversionList")
    public ResponseEntity getCurrencyConversionList(){
        List<CurrencyConversionResponseModel> response  = new ArrayList<>();
        List<CurrencyConversion> currencyList = currencyExchangeService.getCurrencyConversionList();
        if (currencyList != null) {
            response = currencyConversionHelper.getListOfConvertedCurrency(currencyList);
        }
        return new ResponseEntity (response, HttpStatus.OK);
    }
    @LogRequest
    @ApiOperation(value = "Get Currency List")
    @GetMapping(value = "/getActiveCurrencyConversionList")
    public ResponseEntity getActiveCurrencyConversionList(){
        List<CurrencyConversionResponseModel> response  = new ArrayList<>();
        List<CurrencyConversion> currencyList = currencyExchangeService.getActiveCurrencyConversionList();
        if (currencyList != null) {
            response = currencyConversionHelper.getListOfConvertedCurrency(currencyList);
        }
        return new ResponseEntity (response, HttpStatus.OK);
    }

    @LogRequest
    @ApiOperation(value = "Get Currency List")
    @GetMapping(value = "/getCurrencyConversionById")
    public ResponseEntity getCurrencyConversionById(@RequestParam int id)  {
        CurrencyConversion currencyConversion = currencyExchangeService.findByPK(id);
        if (currencyConversion != null) {
           CurrencyConversionResponseModel currencyConversionResponseModel = new CurrencyConversionResponseModel();
           currencyConversionResponseModel.setCurrencyConversionId(currencyConversion.getCurrencyConversionId());
           currencyConversionResponseModel.setCurrencyCode(currencyConversion.getCurrencyCode().getCurrencyCode());
           currencyConversionResponseModel.setCurrencyCodeConvertedTo(currencyConversion.getCurrencyCodeConvertedTo().getCurrencyCode());
           currencyConversionResponseModel.setDescription(currencyConversion.getCurrencyCodeConvertedTo().getDescription());
           currencyConversionResponseModel.setCurrencyName(currencyConversion.getCurrencyCode().getCurrencyName());
           currencyConversionResponseModel.setExchangeRate(currencyConversion.getExchangeRate());
           currencyConversionResponseModel.setIsActive(currencyConversion.getIsActive());
           currencyConversionResponseModel.setCurrencyIsoCode(currencyConversion.getCurrencyCode().getCurrencyIsoCode());
           return new ResponseEntity (currencyConversionResponseModel, HttpStatus.OK);
        }
        return new ResponseEntity ("No result found for id-"+id, HttpStatus.NO_CONTENT);
    }
    
    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Delete Currency by Currency Code", response = CurrencyConversion.class)
    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Object> deleteCurrency(@RequestParam("id") int id,
                                                   HttpServletRequest request) {
        try {
            SimpleAccountsMessage message = null;
            CurrencyConversion currencyConversion = currencyExchangeService.findByPK(id);
            if (currencyConversion != null) {
                Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
                currencyConversion.setCreatedDate(LocalDateTime.now());
                currencyConversion.setDeleteFlag(true);
                currencyExchangeService.update(currencyConversion);
                message = new SimpleAccountsMessage("0033",
                        MessageUtil.getMessage("currency.conversion.deleted.successful.msg.0033"), false);
                return new ResponseEntity<>(message,HttpStatus.OK);
//                return new ResponseEntity<>(currencyConversion, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
        } catch (Exception e) {
            SimpleAccountsMessage message= null;
            message = new SimpleAccountsMessage("",
                    MessageUtil.getMessage("delete.unsuccessful.msg"), true);
            return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }
//    @LogRequest
//    @ApiOperation(value = "Get Users Count For Role")
//    @GetMapping(value = "/getUsersCountForRole")
//    public ResponseEntity<Integer> getUsersCountForRole(@RequestParam int roleId){
//
//        Role role = roleService.findByPK(roleId);
//        Map<String,Object> param=new HashMap<>();
//        param.put("role", role);
//        param.put("isActive", true);
//        param.put("deleteFlag", false);
//        List<User> userList = userService.findByAttributes(param);
////        if (!userList.isEmpty()) {
//        Integer response = userList.size();
//        return new ResponseEntity<>(response, HttpStatus.OK);
////        }
////        return new ResponseEntity("unable to fetch the user information",HttpStatus.OK);
//
//    }
}
