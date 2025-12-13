package com.simpleaccounts.rest.paymentcontroller;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.simpleaccounts.constant.PayMode;
import com.simpleaccounts.rest.invoicecontroller.InvoiceDueAmountModel;

import lombok.Getter;
import lombok.Setter;
import org.json.JSONArray;

@Getter
@Setter
public class PaymentPersistModel {
	private Boolean deleteFlag;

	private Integer paymentId;
	private Date paymentDate;
	private String paymentNo; // payment filed from ui
	private String referenceNo; // reference number
	private Integer contactId; // customer details
	private BigDecimal amount;
	private BigDecimal totalAppliedDebitAmount;
	private Boolean appliedDebits;

// New
	private PayMode payMode;
	private Integer depositeTo;// transaction category Id
	private String depositeToLabel;
	private String notes;
	private MultipartFile attachmentFile;
	private String fileName;
	private String filePath;
	private String attachmentDescription;
	/** {@see InvoiceDueAmountModel} */
	private String paidInvoiceListStr;
	private List<InvoiceDueAmountModel> paidInvoiceList;
	private String invoiceNumber;
	private String invoiceAmount;

	private JSONArray listOfDebitNotes;
}
