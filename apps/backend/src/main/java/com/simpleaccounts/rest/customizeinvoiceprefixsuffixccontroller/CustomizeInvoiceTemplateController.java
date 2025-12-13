package com.simpleaccounts.rest.customizeinvoiceprefixsuffixccontroller;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.entity.CustomizeInvoiceTemplate;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Created By Zain Khan On 20-11-2020
 */

@RestController
@RequestMapping(value = "/rest/customizeinvoiceprefixsuffix")
@RequiredArgsConstructor
public class CustomizeInvoiceTemplateController {
    private final Logger logger = LoggerFactory.getLogger(CustomizeInvoiceTemplateController.class);

    private final CustomizeInvoiceTemplateService customizeInvoiceTemplateService;

    @LogRequest
    @ApiOperation(value = "Get Invoice Prefix List")
    @GetMapping(value = "/getListForInvoicePrefixAndSuffix")
    public ResponseEntity getListForInvoicePrefix(@RequestParam(value = "invoiceType") Integer invoiceType){

        CustomizeInvoiceTemplate customizeInvoiceTemplate=customizeInvoiceTemplateService.getCustomizeInvoiceTemplate(invoiceType);
        if (customizeInvoiceTemplate!=null){
            CustomizeInvoiceTemplateResponseModel customizeInvoiceTemplateResponseModel = new CustomizeInvoiceTemplateResponseModel();
            customizeInvoiceTemplateResponseModel.setInvoiceType(customizeInvoiceTemplate.getType());
            customizeInvoiceTemplateResponseModel.setInvoiceId(customizeInvoiceTemplate.getId());
            customizeInvoiceTemplateResponseModel.setInvoiceNo(customizeInvoiceTemplate.getPrefix()+customizeInvoiceTemplate.getSuffix());
            return new ResponseEntity (customizeInvoiceTemplateResponseModel, HttpStatus.OK);
        }

        return new ResponseEntity ("No result found for id-"+invoiceType, HttpStatus.NO_CONTENT);

    }

    @LogRequest
    @ApiOperation(value = "Next invoice No")
    @GetMapping(value = "/getNextInvoiceNo")
    public ResponseEntity<String> getNextInvoiceNo(@RequestParam(value = "invoiceType") Integer invoiceType) {
        try {
            String nxtInvoiceNo = customizeInvoiceTemplateService.getLastInvoice(invoiceType);
            if (nxtInvoiceNo == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(nxtInvoiceNo, HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
