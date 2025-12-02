package com.simplevat.rest.financialreport;

import com.simplevat.constant.PayMode;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class RecordVatPaymentRequestModel {
    private Integer id;
    private Date vatPaymentDate;
    private String vatPaymentNo; // payment filed from ui
    private String referenceCode; // reference number
    private BigDecimal amount;
    private String vatFiledNumber;
    private Boolean isVatReclaimed;
    // New
    private PayMode payMode;
    private Integer depositeTo;// transaction category Id
    private String notes;
    private MultipartFile attachmentFile;
    private String fileName;
    private String filePath;
    private String receiptAttachmentDescription;
}
