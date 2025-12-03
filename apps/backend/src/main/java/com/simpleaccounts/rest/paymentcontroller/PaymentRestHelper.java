package com.simpleaccounts.rest.paymentcontroller;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.constant.FileTypeEnum;
import com.simpleaccounts.constant.CommonStatusEnum;
import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.PostingRequestModel;
import com.simpleaccounts.rest.invoicecontroller.InvoiceDueAmountModel;
import com.simpleaccounts.utils.FileHelper;

@Component
public class PaymentRestHelper {

	private final Logger logger = LoggerFactory.getLogger(PaymentRestHelper.class);

	@Autowired
	private ContactService contactService;

	@Autowired
	private TransactionCategoryService transactionCategoryService;

	@Autowired
	private FileHelper fileHelper;

	@Autowired
	private JournalLineItemService journalLineItemService;

	@Autowired
	private SupplierInvoicePaymentService supplierInvoicePaymentService;

	@Autowired
	private InvoiceService invoiceService;

	@Autowired
	private PaymentService paymentService;

	@Autowired
	private  ContactTransactionCategoryService contactTransactionCategoryService;

	public Payment convertToPayment(PaymentPersistModel paymentModel) throws IOException {
		Payment payment = new Payment();
		if (paymentModel.getPaymentId() != null) {
			payment.setPaymentId(paymentModel.getPaymentId());
		}
		if (paymentModel.getPaymentDate() != null) {
			Instant instant = Instant.ofEpochMilli(paymentModel.getPaymentDate().getTime());
			LocalDateTime date = LocalDateTime.ofInstant(instant,
					ZoneId.systemDefault());
			payment.setPaymentDate(date.toLocalDate());
		}
		payment.setPaymentNo(paymentModel.getPaymentNo());
		payment.setReferenceNo(paymentModel.getReferenceNo());

		if (paymentModel.getContactId() != null) {
			payment.setSupplier(contactService.findByPK(paymentModel.getContactId()));
		}
		//This ll retriew the Invoice From Str
		ObjectMapper mapper = new ObjectMapper();
		try {
			List<InvoiceDueAmountModel> itemModels = mapper.readValue(paymentModel.getPaidInvoiceListStr(),
					new TypeReference<List<InvoiceDueAmountModel>>() {
					});
			paymentModel.setPaidInvoiceList(itemModels);
		} catch (IOException ex) {
			logger.error("Error", ex);
		}
		for (InvoiceDueAmountModel invoiceDueAmountModel:paymentModel.getPaidInvoiceList()){
			Invoice invoice=invoiceService.findByPK(invoiceDueAmountModel.getId());
			if (invoice!=null){
				payment.setInvoice(invoice);
			}
		}
		payment.setInvoiceAmount(paymentModel.getAmount());
		payment.setPayMode(paymentModel.getPayMode());
		payment.setDepositeToTransactionCategory(transactionCategoryService.findByPK(paymentModel.getDepositeTo()));
		payment.setNotes(paymentModel.getNotes());
		if (paymentModel.getAttachmentFile() != null && !paymentModel.getAttachmentFile().isEmpty()) {
			String filePath = fileHelper.saveFile(paymentModel.getAttachmentFile(), FileTypeEnum.PAYMENT);
			payment.setAttachmentFileName(paymentModel.getAttachmentFile().getOriginalFilename());
			payment.setAttachmentPath(filePath);
		}
		return payment;
	}

	public PaymentViewModel convertToPaymentViewModel(Payment payment) {
		PaymentViewModel paymentModel = new PaymentViewModel();
		paymentModel.setPaymentId(payment.getPaymentId());
		if (payment.getInvoice().getStatus().equals(CommonStatusEnum.PARTIALLY_PAID.getValue())){
			paymentModel.setInvoiceAmount(payment.getInvoice().getTotalAmount().subtract(payment.getInvoice().getDueAmount()));
		}
		else {
			paymentModel.setInvoiceAmount(payment.getInvoiceAmount());
		}
		paymentModel.setConvertedInvoiceAmount(payment.getInvoiceAmount());
		if (payment.getBankAccount() != null) {
			paymentModel.setBankName(payment.getBankAccount().getBankAccountName());
		}

		getContact(payment, paymentModel);
		if (payment.getInvoice().getId()!=null && payment.getInvoice().getCurrency().getCurrencySymbol()!=null) {
			paymentModel.setCurrencySymbol(payment.getInvoice().getCurrency().getCurrencySymbol());
		}
		if(payment.getInvoice()!=null)
		{
			paymentModel.setInvoiceNumber(payment.getInvoice().getReferenceNumber());
		}
		List<SupplierInvoicePayment> receiptEntryList = supplierInvoicePaymentService
				.findForPayment(payment.getPaymentId());
		if (receiptEntryList != null && !receiptEntryList.isEmpty()) {
			List<String> invIdlist = new ArrayList<>();
			for (SupplierInvoicePayment receiptEntry : receiptEntryList) {
				invIdlist.add(receiptEntry.getSupplierInvoice().getCurrency().getCurrencyIsoCode());
			}
			paymentModel.setCurrencyIsoCode(String.join(",", invIdlist));
		}
		if (payment.getPaymentDate() != null) {
			ZoneId timeZone = ZoneId.systemDefault();
			Date date = Date.from(payment.getPaymentDate().atStartOfDay(timeZone).toInstant());
			paymentModel.setPaymentDate(date);
		}
		paymentModel.setDescription(payment.getDescription());
		paymentModel.setDeleteFlag(payment.getDeleteFlag());
		return paymentModel;
	}
	private void getContact(Payment payment, PaymentViewModel paymentModel) {
		if (payment.getSupplier() != null) {
			if (payment.getSupplier().getOrganization() != null && !payment.getSupplier().getOrganization().isEmpty() ){
				paymentModel.setSupplierId((payment.getSupplier().getContactId()));
				paymentModel.setSupplierName(payment.getSupplier().getOrganization());
			}else {
				paymentModel.setSupplierId((payment.getSupplier().getContactId()));
				paymentModel.setSupplierName(payment.getSupplier().getFirstName() + " " + payment.getSupplier().getLastName());
			}


		}
	}
	public PaymentPersistModel convertToPaymentPersistModel(Payment payment) {
		PaymentPersistModel paymentModel = new PaymentPersistModel();
		paymentModel.setPaymentId(payment.getPaymentId());

		if (payment.getPaymentDate() != null) {
			ZoneId timeZone = ZoneId.systemDefault();
			Date date = Date.from(payment.getPaymentDate().atStartOfDay(timeZone).toInstant());
			paymentModel.setPaymentDate(date);
		}
		paymentModel.setPaymentNo(payment.getPaymentNo());
		paymentModel.setReferenceNo(payment.getReferenceNo());

		if (payment.getSupplier() != null) {
			paymentModel.setContactId(payment.getSupplier().getContactId());
		}
		paymentModel.setAmount(payment.getInvoiceAmount());
		paymentModel.setPayMode(payment.getPayMode());
		paymentModel.setDepositeTo(payment.getDepositeToTransactionCategory().getTransactionCategoryId());
		paymentModel.setDepositeToLabel(
				payment.getDepositeToTransactionCategory().getChartOfAccount().getChartOfAccountName());
		paymentModel.setNotes(paymentModel.getNotes());
		paymentModel.setDeleteFlag(payment.getDeleteFlag());
		paymentModel.setFileName(payment.getAttachmentFileName());
		paymentModel.setAttachmentDescription(payment.getAttachmentDescription());
		if (payment.getAttachmentPath() != null) {
			paymentModel.setFilePath("/file/" + fileHelper.convertFilePthToUrl(payment.getAttachmentPath()));
		}
		List<SupplierInvoicePayment> receiptEntryList = supplierInvoicePaymentService
				.findForPayment(payment.getPaymentId());
		if (receiptEntryList != null) {
			paymentModel.setPaidInvoiceList(getInvoiceDueAmountList(receiptEntryList));
		}
		return paymentModel;
	}

	public List<SupplierInvoicePayment> getSupplierInvoicePaymentEntity(PaymentPersistModel paymentPersistModel) {
		if (paymentPersistModel.getPaidInvoiceListStr() != null
				&& !paymentPersistModel.getPaidInvoiceListStr().isEmpty()) {

			ObjectMapper mapper = new ObjectMapper();
			try {
				List<InvoiceDueAmountModel> itemModels = mapper.readValue(paymentPersistModel.getPaidInvoiceListStr(),
						new TypeReference<List<InvoiceDueAmountModel>>() {
						});
				paymentPersistModel.setPaidInvoiceList(itemModels);
			} catch (IOException ex) {
				logger.error("Error", ex);
			}

			List<SupplierInvoicePayment> receiptList = new ArrayList<>();
			for (InvoiceDueAmountModel dueAmountModel : paymentPersistModel.getPaidInvoiceList()) {
				SupplierInvoicePayment receipt = new SupplierInvoicePayment();
				Invoice invoice = invoiceService.findByPK(dueAmountModel.getId());
				invoice.setDueAmount(dueAmountModel.getDueAmount().subtract(paymentPersistModel.getAmount()));
				if (paymentPersistModel.getTotalAppliedDebitAmount()!=null){
					invoice.setDueAmount(invoice.getDueAmount().subtract(paymentPersistModel.getTotalAppliedDebitAmount()));
				}
				if (invoice.getDueAmount().longValue()==0)
					invoice.setStatus(CommonStatusEnum.PAID.getValue());
				else
					invoice.setStatus(CommonStatusEnum.PARTIALLY_PAID.getValue());
				if (invoice.getDueAmount().compareTo(BigDecimal.ZERO) == 0) {
					invoice.setStatus(CommonStatusEnum.PAID.getValue());
				}
				else {
					invoice.setStatus(CommonStatusEnum.PARTIALLY_PAID.getValue());
				}
				receipt.setSupplierInvoice(invoice);
				receipt.setPaidAmount(paymentPersistModel.getAmount());
				receipt.setDeleteFlag(Boolean.FALSE);
				receipt.setDueAmount(dueAmountModel.getDueAmount().subtract(paymentPersistModel.getAmount()));
				receiptList.add(receipt);
			}
			return receiptList;
		}
		return new ArrayList<>();
	}

	public Journal paymentPosting(PostingRequestModel postingRequestModel, Integer userId,
			TransactionCategory depositeToTransactionCategory,Integer transactionId) {
		List<JournalLineItem> journalLineItemList;

		Map<String, Object> param = new HashMap<>();
		param.put("referenceType", PostingReferenceTypeEnum.PAYMENT);
		param.put("referenceId", postingRequestModel.getPostingRefId());
		param.put("deleteFlag", false);
		journalLineItemList = journalLineItemService.findByAttributes(param);

		Journal journal = journalLineItemList != null && !journalLineItemList.isEmpty()
				? journalLineItemList.get(0).getJournal()
				: new Journal();
		JournalLineItem journalLineItem1 = journal.getJournalLineItems() != null
				&& !journal.getJournalLineItems().isEmpty() ? journalLineItemList.get(0) : new JournalLineItem();

		Payment payment = paymentService.findByPK(postingRequestModel.getPostingRefId());
		Map<String, Object> map = new HashMap<>();
		map.put("contact",payment.getInvoice().getContact());
		map.put("contactType", payment.getInvoice().getType());
		ContactTransactionCategoryRelation contactTransactionCategoryRelation = contactTransactionCategoryService.findByAttributes(map).get(0);
		journalLineItem1.setTransactionCategory(contactTransactionCategoryRelation.getTransactionCategory());
		BigDecimal invoiceExchangeRate = payment.getInvoice().getExchangeRate();
		journalLineItem1.setDebitAmount(postingRequestModel.getAmount().multiply(invoiceExchangeRate));
		journalLineItem1.setReferenceType(PostingReferenceTypeEnum.PAYMENT);
		journalLineItem1.setReferenceId(transactionId);
		journalLineItem1.setExchangeRate(invoiceExchangeRate);
		journalLineItem1.setCreatedBy(userId);
		journalLineItem1.setJournal(journal);
		journalLineItemList.add(journalLineItem1);

		JournalLineItem journalLineItem2 = journal.getJournalLineItems() != null
				&& !journal.getJournalLineItems().isEmpty() ? journalLineItemList.get(1) : new JournalLineItem();
		journalLineItem2.setTransactionCategory(depositeToTransactionCategory);
		journalLineItem2.setCreditAmount(postingRequestModel.getAmount().multiply(invoiceExchangeRate));
		journalLineItem2.setReferenceType(PostingReferenceTypeEnum.PAYMENT);
		journalLineItem2.setReferenceId(transactionId);
		journalLineItem2.setExchangeRate(invoiceExchangeRate);
		journalLineItem2.setCreatedBy(userId);
		journalLineItem2.setJournal(journal);
		journalLineItemList.add(journalLineItem2);

		journal.setJournalLineItems(journalLineItemList);
		journal.setCreatedBy(userId);
		journal.setPostingReferenceType(PostingReferenceTypeEnum.PAYMENT);
		journal.setJournalDate(payment.getPaymentDate());
		journal.setTransactionDate(payment.getPaymentDate());
		if (payment.getPaymentId()!=null){
			journal.setJournlReferencenNo(payment.getPaymentId().toString());
		}
		journal.setDescription("Supplier Payment Against Invoice No:-"+payment.getInvoice().getReferenceNumber());
		return journal;
	}

	private List<InvoiceDueAmountModel> getInvoiceDueAmountList(List<SupplierInvoicePayment> receiptList) {

		if (receiptList != null && !receiptList.isEmpty()) {
			List<InvoiceDueAmountModel> modelList = new ArrayList<>();
			for (SupplierInvoicePayment supplierInvoiceReceipt : receiptList) {
				Invoice invoice = supplierInvoiceReceipt.getSupplierInvoice();
				InvoiceDueAmountModel model = new InvoiceDueAmountModel();

				model.setId(invoice.getId());
				model.setDueAmount(invoice.getDueAmount() != null ? invoice.getDueAmount() : invoice.getTotalAmount());
				if (invoice.getInvoiceDate() != null) {
					ZoneId timeZone = ZoneId.systemDefault();
					Date date = Date.from(invoice.getInvoiceDate().atStartOfDay(timeZone).toInstant());
					model.setDate(date);
				}
				if (invoice.getInvoiceDueDate() != null) {
					ZoneId timeZone = ZoneId.systemDefault();
					Date date = Date.from(invoice.getInvoiceDueDate().atStartOfDay(timeZone).toInstant());
					model.setDueDate(date);
				}
				model.setReferenceNo(invoice.getReferenceNumber());
				model.setTotalAount(invoice.getTotalAmount());

				modelList.add(model);
			}
			return modelList;
		}

		return new ArrayList<>();
	}
}
