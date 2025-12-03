package com.simpleaccounts.rest.receiptcontroller;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.simpleaccounts.constant.PayMode;
import com.simpleaccounts.rest.invoicecontroller.InvoiceDueAmountModel;
import org.json.JSONArray;
import lombok.Data;

@Data
public class ReceiptRequestModel {

	private Integer receiptId;
	private Date receiptDate;
	private String receiptNo; // payment filed from ui
	private String referenceCode; // reference number
	private Integer contactId; // customer details
	private BigDecimal amount;
	private BigDecimal totalAppliedCreditAmount;
	private Boolean appliedCredits;

	// New
	private PayMode payMode;
	private Integer depositeTo;// transaction category Id
	private String notes;
	private MultipartFile attachmentFile;
	private String fileName;
	private String filePath;
	private String receiptAttachmentDescription;
	/** @see InvoiceDueAmountModel */
	private String paidInvoiceListStr;
	private List<InvoiceDueAmountModel> paidInvoiceList;
	private String invoiceNumber;
	private String invoiceAmount;

	//for apply to credits
	private JSONArray listOfCreditNotes;

}
