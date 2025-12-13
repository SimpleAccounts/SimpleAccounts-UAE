package com.simpleaccounts.rest.taxescontroller;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.JournalLineItemService;
import com.simpleaccounts.service.TransactionCategoryService;
import io.swagger.annotations.ApiOperation;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import static com.simpleaccounts.constant.ErrorConstant.ERROR;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import static com.simpleaccounts.constant.ErrorConstant.ERROR;

@RestController
@RequestMapping(value = "/rest/taxes")
@RequiredArgsConstructor
public class TaxesRestController {
    private final Logger logger = LoggerFactory.getLogger(TaxesRestController.class);

    private final TransactionCategoryService transactionCategoryService;
    private final JwtTokenUtil jwtTokenUtil;

    private final JournalLineItemService journalLineItemService;

    private final TaxesRestHelper taxesRestHelper;

    @LogRequest
    @ApiOperation(value = "Get Vat Transation list")
    @GetMapping(value = "/getVatTransationList")
    public ResponseEntity<PaginationResponseModel> getVatTransactionList (TaxesFilterModel filterModel, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            Map<TaxesFilterEnum, Object> filterDataMap = new EnumMap<>(TaxesFilterEnum.class);

            filterDataMap.put(TaxesFilterEnum.SOURCE, filterModel.getReferenceType());
            if (filterModel.getAmount() != null) {
                filterDataMap.put(TaxesFilterEnum.VAT_AMOUNT, filterModel.getAmount());
            }
            if (filterModel.getTransactionDate() != null && !filterModel.getTransactionDate().isEmpty()) {
                SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
                LocalDateTime dateTime = Instant.ofEpochMilli(dateFormat.parse(filterModel.getTransactionDate()).getTime())
                        .atZone(ZoneId.systemDefault()).toLocalDateTime();
                filterDataMap.put(TaxesFilterEnum.TRANSACTION_DATE, dateTime);
            }
            filterDataMap.put(TaxesFilterEnum.STATUS, filterModel.getStatus());
            filterDataMap.put(TaxesFilterEnum.USER_ID, userId);
            filterDataMap.put(TaxesFilterEnum.DELETE_FLAG, false);

            List<TransactionCategory> transactionCategoryList = new ArrayList<>();
            transactionCategoryList.add(transactionCategoryService.findByPK(88));
            transactionCategoryList.add(transactionCategoryService.findByPK(94));
            PaginationResponseModel responseModel = journalLineItemService.getVatTransactionList(filterDataMap,filterModel,transactionCategoryList);
            if (responseModel == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            responseModel.setData(taxesRestHelper.getListModel(responseModel.getData()));
            return new ResponseEntity<>(responseModel, HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }
}
