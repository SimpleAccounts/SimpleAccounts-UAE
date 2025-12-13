package com.simpleaccounts.rest.MailController;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
@Data
@Getter
@Setter
public class EmailContentModel {
    Integer id;
    Integer type;
    String fromEmailName;
    String fromEmailAddress;
    String billingEmail;
    String subject;
    String emailContent;
    String pdfBody;
    //extra
    List<MultipartFile> attachmentFiles;
    String[] pdfFilesData;
    Boolean attachPrimaryPdf;
    String[] to_emails;
    String[] cc_emails;
    String[] bcc_emails;
    String message;

    private BigDecimal amount;
    private String amountInWords;
    private Boolean markAsSent = Boolean.FALSE;
    private Integer postingRefId;
    private String  postingRefType;
    private String  vatInWords;
    private Boolean sendAgain;
}
