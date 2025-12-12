package com.simpleaccounts.rest.receiptcontroller;

import java.io.IOException;
import lombok.RequiredArgsConstructor;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
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
import com.simpleaccounts.constant.CommonStatusEnum;
import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.PostingRequestModel;
import com.simpleaccounts.rest.invoicecontroller.InvoiceDueAmountModel;
import com.simpleaccounts.utils.FileHelper;

@Component
@RequiredArgsConstructor
public class ReceiptRestHelper {
	private static final String JSON_KEY_DELETE_FLAG = "deleteFlag";
	private static final String JSON_KEY_CONTACT = "contact";
	private static final String JSON_KEY_CONTACT_TYPE = "contactType";
	
	private final Logger logger = LoggerFactory.getLogger(ReceiptRestHelper.class);

	private final InvoiceService invoiceService;

	private final ContactService contactService;

	private final ReceiptService receiptService;

	private final TransactionCategoryService transactionCategoryService;

	private final FileHelper fileHelper;

	private final JournalLineItemService journalLineItemService;

	private final CustomerInvoiceReceiptService customerInvoiceReceiptService;

	private final PaymentService paymentService;

	private final  ContactTransactionCategoryService contactTransactionCategoryService;

	public List<ReceiptModel> getListModel(Object receipts) {
		List<ReceiptModel> receiptModelList = new ArrayList<ReceiptModel>();

		if (receipts != null) {
			for (Receipt receipt : (List<Receipt>) receipts) {
				ReceiptModel model = new ReceiptModel();
				model.setReceiptId(receipt.getId());
				//model.setAmount(receipt.getAmount());
				if (receipt.getInvoice().getStatus().equals(CommonStatusEnum.PARTIALLY_PAID.getValue())){
				model.setAmount(receipt.getInvoice().getTotalAmount().subtract(receipt.getInvoice().getDueAmount()));
				}
				else {
					model.setAmount(receipt.getAmount());
				}
				model.setConvertedAmount(receipt.getAmount());
				model.setUnusedAmount(BigDecimal.ZERO);
				model.setReferenceCode(receipt.getReferenceCode());

				if (receipt.getInvoice() !=null && receipt.getInvoice().getCurrency().getCurrencySymbol()!=null) {
					model.setCurrencySymbol(receipt.getInvoice().getCurrency().getCurrencySymbol());
				}
			if (receipt.getInvoice() !=null && receipt.getInvoice().getCurrency().getCurrencyIsoCode()!=null) {
					model.setCurrencyIsoCode(receipt.getInvoice().getCurrency().getCurrencyIsoCode());
				}
//				if (receipt.getInvoice().getCurrency().getCurrencyName()!=null) {
//					model.setCurrencyName(receipt.getInvoice().getCurrency().getCurrencyName());
//				}
				model.setReceiptNo(receipt.getReceiptNo());
				getContact(receipt, model);

				List<CustomerInvoiceReceipt> receiptEntryList = customerInvoiceReceiptService
						.findForReceipt(receipt.getId());
				if (receiptEntryList != null && !receiptEntryList.isEmpty()) {
					List<String> invIdlist = new ArrayList<>();
					Currency currency = new Currency();
					String currencyIsoCode = "";
					for (CustomerInvoiceReceipt receiptEntry : receiptEntryList) {
						//invIdlist.add(receiptEntry.getCustomerInvoice().getId().toString());
						invIdlist.add(receiptEntry.getCustomerInvoice().getCurrency().getCurrencyIsoCode());
                        invIdlist.add(receiptEntry.getCustomerInvoice().getCurrency().getCurrencySymbol());
						//invIdlist.add(receiptEntry.getCustomerInvoice().getCurrency().getCurrencyName());
						currencyIsoCode =receiptEntry.getCustomerInvoice().getCurrency().getCurrencyIsoCode();
					}
					model.setCurrencyIsoCode(currencyIsoCode);
				}
					if(receipt.getInvoice()!=null){
						model.setInvoiceNumber(receipt.getInvoice().getReferenceNumber());
					}

				if (receipt.getReceiptDate() != null) {
					Date date = Date.from(receipt.getReceiptDate().atZone(ZoneId.systemDefault()).toInstant());
					model.setReceiptDate(date);
				}
				receiptModelList.add(model);
			}
		}
		return receiptModelList;
	}

	private void getContact(Receipt receipt, ReceiptModel model) {
		if (receipt.getContact() != null) {
			if (receipt.getContact().getOrganization() != null && !receipt.getContact().getOrganization().isEmpty() ){
				model.setContactId(receipt.getContact().getContactId());
				model.setCustomerName(receipt.getContact().getOrganization());
			}else {
				model.setContactId(receipt.getContact().getContactId());
				model.setCustomerName(receipt.getContact().getFirstName() + " " + receipt.getContact().getLastName());
			}


		}
	}

	public Receipt getEntity(ReceiptRequestModel receiptRequestModel) {

		Receipt receipt = new Receipt();
		if (receiptRequestModel.getReceiptId() != null) {
			receipt = receiptService.findByPK(receiptRequestModel.getReceiptId());
		}
		if (receiptRequestModel.getContactId() != null) {
			receipt.setContact(contactService.findByPK(receiptRequestModel.getContactId()));
		}
		//To store Invoice In reciept
		if (receiptRequestModel.getPaidInvoiceListStr() != null && ! receiptRequestModel.getPaidInvoiceListStr().isEmpty()) {

			ObjectMapper mapper = new ObjectMapper();
			try {
				List<InvoiceDueAmountModel> itemModels =  mapper.readValue(receiptRequestModel.getPaidInvoiceListStr(),
						new TypeReference<List<InvoiceDueAmountModel>>() {
						});
				receiptRequestModel.setPaidInvoiceList(itemModels);

			} catch (IOException ex) {
				logger.error("Error", ex);
			}
		for (InvoiceDueAmountModel invoiceDueAmountModel:receiptRequestModel.getPaidInvoiceList()){
			Invoice invoice=invoiceService.findByPK(invoiceDueAmountModel.getId());
			if (invoice!=null){
				receipt.setInvoice(invoice);
			}
		}
		}

		receipt.setAmount(receiptRequestModel.getAmount());
		receipt.setNotes(receiptRequestModel.getNotes());
		receipt.setReceiptNo(receiptRequestModel.getReceiptNo());
		receipt.setReferenceCode(receiptRequestModel.getReferenceCode());
		if (receiptRequestModel.getReceiptDate() != null) {
			LocalDateTime date = Instant.ofEpochMilli(receiptRequestModel.getReceiptDate().getTime())
					.atZone(ZoneId.systemDefault()).withHour(0).withMinute(0).withSecond(0).withNano(0)
					.toLocalDateTime();
			receipt.setReceiptDate(date);
		}
		receipt.setPayMode(receiptRequestModel.getPayMode());
		receipt.setDepositeToTransactionCategory(
				transactionCategoryService.findByPK(receiptRequestModel.getDepositeTo()));


		return receipt;

	}

	public ReceiptRequestModel getRequestModel(Receipt receipt) {
		ReceiptRequestModel model = new ReceiptRequestModel();
		if (receipt.getId() != null) {
			model.setReceiptId(receipt.getId());
		}
		model.setAmount(receipt.getAmount());
		model.setNotes(receipt.getNotes());
		if (receipt.getContact() != null) {
			model.setContactId(receipt.getContact().getContactId());
		}
		if (receipt.getReceiptDate() != null) {
			Date date = Date.from(receipt.getReceiptDate().atZone(ZoneId.systemDefault()).withHour(0).withMinute(0)
					.withSecond(0).withNano(0).toInstant());
			model.setReceiptDate(date);
		}
		model.setReferenceCode(receipt.getReferenceCode());
		model.setReceiptNo(receipt.getReceiptNo());
		model.setPayMode(receipt.getPayMode());
		if (receipt.getDepositeToTransactionCategory() != null) {
			model.setDepositeTo(receipt.getDepositeToTransactionCategory().getTransactionCategoryId());
		}
		if (receipt.getReceiptAttachmentFileName() != null) {
			model.setFileName(receipt.getReceiptAttachmentFileName());
		}
		model.setReceiptAttachmentDescription(receipt.getReceiptAttachmentDescription());
		if (receipt.getReceiptAttachmentPath() != null) {
			model.setFilePath("/file/" + fileHelper.convertFilePthToUrl(receipt.getReceiptAttachmentPath()));
		}
		List<CustomerInvoiceReceipt> receiptEntryList = customerInvoiceReceiptService.findForReceipt(receipt.getId());
		if (receiptEntryList != null) {
			model.setPaidInvoiceList(getInvoiceDueAmountList(receiptEntryList));
		}
		return model;

	}

	public List<CustomerInvoiceReceipt> getCustomerInvoiceReceiptEntity(ReceiptRequestModel receiptRequestModel) {
		if (receiptRequestModel.getPaidInvoiceListStr() != null && ! receiptRequestModel.getPaidInvoiceListStr().isEmpty()) {

			ObjectMapper mapper = new ObjectMapper();
			try {
				List<InvoiceDueAmountModel> itemModels =  mapper.readValue(receiptRequestModel.getPaidInvoiceListStr(),
						new TypeReference<List<InvoiceDueAmountModel>>() {
						});
			receiptRequestModel.setPaidInvoiceList(itemModels);

			} catch (IOException ex) {
				logger.error("Error", ex);
			}

			List<CustomerInvoiceReceipt> receiptList = new ArrayList<>();
			for (InvoiceDueAmountModel dueAmountModel : receiptRequestModel.getPaidInvoiceList()) {
				CustomerInvoiceReceipt receipt = new CustomerInvoiceReceipt();
				Invoice invoice = invoiceService.findByPK(dueAmountModel.getId());
				invoice.setDueAmount(dueAmountModel.getDueAmount().subtract(receiptRequestModel.getAmount()));
				if (receiptRequestModel.getTotalAppliedCreditAmount()!=null){
					invoice.setDueAmount(invoice.getDueAmount().subtract(receiptRequestModel.getTotalAppliedCreditAmount()));
				}
//				if (invoice.getDueAmount().longValue()==0) {
//					if (invoice.getType() == 1 || invoice.getType() == 2) {
//						invoice.setStatus(CommonStatusEnum.PAID.getValue());
//					} else if (invoice.getType() == 7) {
//						invoice.setStatus(CommonStatusEnum.CLOSED.getValue());
//					}
//				}
//				else
//					invoice.setStatus(CommonStatusEnum.PARTIALLY_PAID.getValue());
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
//				invoice.setStatus(dueAmountModel.getDueAmount().subtract(receiptRequestModel.getAmount());
//				? InvoiceStatusEnum.PAID.getValue()
//						: InvoiceStatusEnum.PARTIALLY_PAID.getValue());
				receipt.setCustomerInvoice(invoice);
				receipt.setPaidAmount(receiptRequestModel.getAmount());
				receipt.setDeleteFlag(Boolean.FALSE);
				receipt.setDueAmount(dueAmountModel.getDueAmount().subtract(receiptRequestModel.getAmount()));
				receiptList.add(receipt);
			}
			return receiptList;
		}
		return new ArrayList<>();
	}

	public Journal receiptPosting(PostingRequestModel postingRequestModel, Integer userId,
			TransactionCategory depositeToTransactionCategory,BigDecimal exchangeGainOrLoss,Integer id,Integer transactionId) {
		List<JournalLineItem> journalLineItemList = new ArrayList<>();
		Map<String, Object> param = new HashMap<>();
		param.put("referenceType", PostingReferenceTypeEnum.RECEIPT);
		param.put("referenceId", postingRequestModel.getPostingRefId());
		param.put(JSON_KEY_DELETE_FLAG, false);
		journalLineItemList = journalLineItemService.findByAttributes(param);

		Journal journal = journalLineItemList != null && journalLineItemList.size() > 0
				? journalLineItemList.get(0).getJournal()
				: new Journal();
		JournalLineItem journalLineItem1 = journal.getJournalLineItems() != null
				&& journal.getJournalLineItems().size() > 0 ? journalLineItemList.get(0) : new JournalLineItem();
//		TransactionCategory transactionCategory = transactionCategoryService
//				.findTransactionCategoryByTransactionCategoryCode(
//						TransactionCategoryCodeEnum.ACCOUNT_RECEIVABLE.getCode());
		//Reference Id similar to Invoice Id
		journalLineItem1.setReferenceId(transactionId);
		Receipt receipt=receiptService.findByPK(postingRequestModel.getPostingRefId());
	BigDecimal	invoiceExchangeRate =  receipt.getInvoice().getExchangeRate();
//		TransactionCategory transactionCategory = receipt.getInvoice().getContact().getTransactionCategory();
//		journalLineItem1.setTransactionCategory(transactionCategory);
		Map<String, Object> map = new HashMap<>();
		map.put(JSON_KEY_CONTACT,receipt.getInvoice().getContact());
		map.put(JSON_KEY_CONTACT_TYPE, receipt.getInvoice().getType());
		ContactTransactionCategoryRelation contactTransactionCategoryRelation = contactTransactionCategoryService.findByAttributes(map).get(0);
		journalLineItem1.setTransactionCategory(contactTransactionCategoryRelation.getTransactionCategory());
		//For multiCurrency Conversion Of diff currency Invoice to Base Currency
		journalLineItem1.setCreditAmount(postingRequestModel.getAmount().multiply(invoiceExchangeRate));
		journalLineItem1.setReferenceType(PostingReferenceTypeEnum.RECEIPT);
		journalLineItem1.setExchangeRate(invoiceExchangeRate);
		journalLineItem1.setCreatedBy(userId);
		journalLineItem1.setJournal(journal);
		journalLineItemList.add(journalLineItem1);

		JournalLineItem journalLineItem2 = journal.getJournalLineItems() != null
				&& journal.getJournalLineItems().size() > 0 ? journalLineItemList.get(1) : new JournalLineItem();
		journalLineItem2.setTransactionCategory(depositeToTransactionCategory);
		journalLineItem2.setDebitAmount(postingRequestModel.getAmount().multiply(invoiceExchangeRate));
		journalLineItem2.setReferenceType(PostingReferenceTypeEnum.RECEIPT);
		journalLineItem2.setReferenceId(transactionId);
		journalLineItem2.setExchangeRate(invoiceExchangeRate);
		journalLineItem2.setCreatedBy(userId);
		journalLineItem2.setJournal(journal);
		journalLineItemList.add(journalLineItem2);

		if (exchangeGainOrLoss!=null && (exchangeGainOrLoss.compareTo(BigDecimal.ZERO)==1 || exchangeGainOrLoss.compareTo(BigDecimal.ZERO)==-1)){
			JournalLineItem journalLineItem = new JournalLineItem();
			TransactionCategory transactionCategory = transactionCategoryService.findByPK(id);
			journalLineItem.setTransactionCategory(transactionCategory);
			if (id.equals(79)){
				journalLineItem.setCreditAmount(exchangeGainOrLoss);
			}
			else {
				journalLineItem.setDebitAmount(exchangeGainOrLoss.negate());
			}
			journalLineItem.setReferenceType(PostingReferenceTypeEnum.RECEIPT);
			journalLineItem.setReferenceId(transactionId);
			journalLineItem.setExchangeRate(invoiceExchangeRate);
			journalLineItem.setCreatedBy(userId);
			journalLineItem.setJournal(journal);
			journalLineItemList.add(journalLineItem);
		}

		journal.setJournalLineItems(journalLineItemList);
		journal.setCreatedBy(userId);
		journal.setPostingReferenceType(PostingReferenceTypeEnum.RECEIPT);
		journal.setJournalDate(receipt.getReceiptDate().toLocalDate());
		journal.setTransactionDate(receipt.getReceiptDate().toLocalDate());
		if (receipt.getReceiptNo()!=null){
			journal.setJournlReferencenNo(receipt.getId().toString());
		}
		journal.setDescription("Customer Payment Against Invoice No:-"+receipt.getInvoice().getReferenceNumber());
		return journal;
	}

	private List<InvoiceDueAmountModel> getInvoiceDueAmountList(List<CustomerInvoiceReceipt> receiptList) {

		if (receiptList != null && !receiptList.isEmpty()) {
			List<InvoiceDueAmountModel> modelList = new ArrayList<>();
			for (CustomerInvoiceReceipt customerInvoiceReceipt : receiptList) {
				Invoice invoice = customerInvoiceReceipt.getCustomerInvoice();
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
	
	public Journal paymentPosting(PostingRequestModel postingRequestModel, Integer userId,
			TransactionCategory depositeToTransactionCategory,BigDecimal exchangeGainOrLoss,Integer id) {
		List<JournalLineItem> journalLineItemList = new ArrayList<>();

		Map<String, Object> param = new HashMap<>();
		param.put("referenceType", PostingReferenceTypeEnum.PAYMENT);
		param.put("referenceId", postingRequestModel.getPostingRefId());
		param.put(JSON_KEY_DELETE_FLAG, false);
		journalLineItemList = journalLineItemService.findByAttributes(param);

		Journal journal = journalLineItemList != null && journalLineItemList.size() > 0
				? journalLineItemList.get(0).getJournal()
				: new Journal();
		JournalLineItem journalLineItem1 = journal.getJournalLineItems() != null
				&& journal.getJournalLineItems().size() > 0 ? journalLineItemList.get(0) : new JournalLineItem();
//		TransactionCategory transactionCategory = transactionCategoryService
//				.findTransactionCategoryByTransactionCategoryCode(
//						TransactionCategoryCodeEnum.ACCOUNT_PAYABLE.getCode());
		Payment payment = paymentService.findByPK(postingRequestModel.getPostingRefId());
		Map<String, Object> supplierMap = new HashMap<>();
		supplierMap.put(JSON_KEY_CONTACT, payment.getInvoice().getContact().getContactId());
		supplierMap.put(JSON_KEY_CONTACT_TYPE, 1);
		supplierMap.put(JSON_KEY_DELETE_FLAG,Boolean.FALSE);
		List<ContactTransactionCategoryRelation> contactTransactionCategoryRelations = contactTransactionCategoryService
				.findByAttributes(supplierMap);
		TransactionCategory transactionCategory;
		if (contactTransactionCategoryRelations!=null && contactTransactionCategoryRelations.size()>0){
			ContactTransactionCategoryRelation contactTransactionCategoryRelation = contactTransactionCategoryRelations.get(0);
			journalLineItem1.setTransactionCategory(contactTransactionCategoryRelation.getTransactionCategory());
			transactionCategory = contactTransactionCategoryRelation.getTransactionCategory();
		}
		journalLineItem1.setDebitAmount(postingRequestModel.getAmount());
		journalLineItem1.setReferenceType(PostingReferenceTypeEnum.PAYMENT);
		journalLineItem1.setReferenceId(postingRequestModel.getPostingRefId());
		journalLineItem1.setCreatedBy(userId);
		journalLineItem1.setJournal(journal);
		journalLineItemList.add(journalLineItem1);
		BigDecimal	invoiceExchangeRate =  payment.getInvoice().getExchangeRate();
		JournalLineItem journalLineItem2 = journal.getJournalLineItems() != null
				&& journal.getJournalLineItems().size() > 0 ? journalLineItemList.get(1) : new JournalLineItem();
		journalLineItem2.setTransactionCategory(depositeToTransactionCategory);
		journalLineItem2.setCreditAmount(postingRequestModel.getAmount());
		journalLineItem2.setReferenceType(PostingReferenceTypeEnum.PAYMENT);
		journalLineItem2.setReferenceId(postingRequestModel.getPostingRefId());
		journalLineItem2.setCreatedBy(userId);
		journalLineItem2.setJournal(journal);
		journalLineItemList.add(journalLineItem2);

		if (exchangeGainOrLoss!=null && (exchangeGainOrLoss.compareTo(BigDecimal.ZERO)==1 || exchangeGainOrLoss.compareTo(BigDecimal.ZERO)==-1)){
			JournalLineItem journalLineItem = new JournalLineItem();
			 transactionCategory = transactionCategoryService.findByPK(id);
			journalLineItem.setTransactionCategory(transactionCategory);
			if (id.equals(79)){
				journalLineItem.setDebitAmount(exchangeGainOrLoss);
			}
			else {
				journalLineItem.setCreditAmount(exchangeGainOrLoss);
			}
			journalLineItem.setReferenceType(PostingReferenceTypeEnum.RECEIPT);
			journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
			journalLineItem.setCreatedBy(userId);
			journalLineItem.setJournal(journal);
			journalLineItemList.add(journalLineItem);
		}
		journal.setJournalLineItems(journalLineItemList);
		journal.setCreatedBy(userId);
		journal.setPostingReferenceType(PostingReferenceTypeEnum.PAYMENT);
		journal.setJournalDate(LocalDate.now());
		if (payment.getPaymentNo()!=null){
			journal.setJournlReferencenNo(payment.getPaymentNo());
		}
		journal.setDescription("Supplier Payment Against Invoice No:-"+payment.getInvoice().getReferenceNumber());

		return journal;
	}

	public Journal supplierPaymentFromBank(PostingRequestModel postingRequestModel, Integer userId,
								  TransactionCategory depositeToTransactionCategory,BigDecimal exchangeGainOrLoss,Integer id,Integer referenceId,BigDecimal exchangeRate) {
		List<JournalLineItem> journalLineItemList = new ArrayList<>();
		Journal journal = journalLineItemList != null && journalLineItemList.size() > 0
				? journalLineItemList.get(0).getJournal()
				: new Journal();

		Map<String, Object> supplierMap = new HashMap<>();
		supplierMap.put(JSON_KEY_CONTACT, postingRequestModel.getPostingRefId());
		supplierMap.put(JSON_KEY_CONTACT_TYPE, 1);
		supplierMap.put(JSON_KEY_DELETE_FLAG,Boolean.FALSE);
		List<ContactTransactionCategoryRelation> contactTransactionCategoryRelations = contactTransactionCategoryService
				.findByAttributes(supplierMap);
		TransactionCategory transactionCategory;
		if (!id.equals(79)){
			exchangeGainOrLoss = exchangeGainOrLoss.negate();
		}
		JournalLineItem journalLineItem1 = new JournalLineItem();
		if (contactTransactionCategoryRelations!=null && contactTransactionCategoryRelations.size()>0){
			ContactTransactionCategoryRelation contactTransactionCategoryRelation = contactTransactionCategoryRelations.get(0);
			journalLineItem1.setTransactionCategory(contactTransactionCategoryRelation.getTransactionCategory());
			transactionCategory = contactTransactionCategoryRelation.getTransactionCategory();
		}
			journalLineItem1.setDebitAmount(postingRequestModel.getAmount());
		journalLineItem1.setReferenceType(PostingReferenceTypeEnum.BANK_PAYMENT);
		journalLineItem1.setReferenceId(referenceId);
		journalLineItem1.setExchangeRate(exchangeRate);
		journalLineItem1.setCreatedBy(userId);
		journalLineItem1.setJournal(journal);
		journalLineItemList.add(journalLineItem1);

		JournalLineItem journalLineItem2 = new JournalLineItem();
		journalLineItem2.setTransactionCategory(depositeToTransactionCategory);
		if(id.equals(79)){
			journalLineItem2.setCreditAmount(postingRequestModel.getAmount().add(exchangeGainOrLoss));
		}
		else {
			journalLineItem2.setCreditAmount(postingRequestModel.getAmount().subtract(exchangeGainOrLoss));
		}
		journalLineItem2.setReferenceType(PostingReferenceTypeEnum.BANK_PAYMENT);
		journalLineItem2.setReferenceId(referenceId);
		journalLineItem2.setExchangeRate(exchangeRate);
		journalLineItem2.setCreatedBy(userId);
		journalLineItem2.setJournal(journal);
		journalLineItemList.add(journalLineItem2);

		if (exchangeGainOrLoss!=null && (exchangeGainOrLoss.compareTo(BigDecimal.ZERO)==1 || exchangeGainOrLoss.compareTo(BigDecimal.ZERO)==-1)){
			JournalLineItem journalLineItem = new JournalLineItem();
			transactionCategory = transactionCategoryService.findByPK(id);
			journalLineItem.setTransactionCategory(transactionCategory);
			if (id.equals(79)){
				journalLineItem.setDebitAmount(exchangeGainOrLoss);
			}
			else {
				journalLineItem.setCreditAmount(exchangeGainOrLoss);
			}
			journalLineItem.setReferenceType(PostingReferenceTypeEnum.BANK_PAYMENT);
			journalLineItem.setReferenceId(referenceId);
			journalLineItem.setExchangeRate(exchangeRate);
			journalLineItem.setCreatedBy(userId);
			journalLineItem.setJournal(journal);
			journalLineItemList.add(journalLineItem);
		}
		journal.setJournalLineItems(journalLineItemList);
		journal.setCreatedBy(userId);
		journal.setPostingReferenceType(PostingReferenceTypeEnum.BANK_PAYMENT);
		journal.setJournalDate(LocalDate.now());
		return journal;
	}

	public Journal customerPaymentFromBank(PostingRequestModel postingRequestModel, Integer userId,
										   TransactionCategory depositeToTransactionCategory,BigDecimal exchangeGainOrLoss,
										   Integer id,Integer referenceId,Receipt receipt,BigDecimal exchangeRate) {
		List<JournalLineItem> journalLineItemList = new ArrayList<>();
		Journal journal = journalLineItemList != null && journalLineItemList.size() > 0
				? journalLineItemList.get(0).getJournal()
				: new Journal();

		Map<String, Object> supplierMap = new HashMap<>();
		supplierMap.put(JSON_KEY_CONTACT, postingRequestModel.getPostingRefId());
		supplierMap.put(JSON_KEY_CONTACT_TYPE, 2);
		supplierMap.put(JSON_KEY_DELETE_FLAG, Boolean.FALSE);
		List<ContactTransactionCategoryRelation> contactTransactionCategoryRelations = contactTransactionCategoryService
				.findByAttributes(supplierMap);
		TransactionCategory transactionCategory;
		if (!id.equals(79)) {
			exchangeGainOrLoss = exchangeGainOrLoss.negate();
		}
		Map<String, Object> map = new HashMap<>();
		map.put(JSON_KEY_CONTACT,receipt.getInvoice().getContact());
		map.put(JSON_KEY_CONTACT_TYPE, receipt.getInvoice().getType());
		ContactTransactionCategoryRelation contactTransactionCategoryRelation = contactTransactionCategoryService.findByAttributes(map).get(0);
		JournalLineItem journalLineItem1 = new JournalLineItem();
		if (contactTransactionCategoryRelations != null && contactTransactionCategoryRelations.size() > 0) {
			journalLineItem1.setTransactionCategory(contactTransactionCategoryRelation.getTransactionCategory());
			transactionCategory = contactTransactionCategoryRelation.getTransactionCategory();
		}
			journalLineItem1.setCreditAmount(postingRequestModel.getAmount());
		journalLineItem1.setReferenceType(PostingReferenceTypeEnum.BANK_RECEIPT);
		journalLineItem1.setReferenceId(referenceId);
		journalLineItem1.setCreatedBy(userId);
		journalLineItem1.setExchangeRate(exchangeRate);
		journalLineItem1.setJournal(journal);
		journalLineItemList.add(journalLineItem1);

		JournalLineItem journalLineItem2 = new JournalLineItem();
		journalLineItem2.setTransactionCategory(depositeToTransactionCategory);
		if (id.equals(79)) {
			journalLineItem2.setDebitAmount(postingRequestModel.getAmount().add(exchangeGainOrLoss));
		} else {
			journalLineItem2.setDebitAmount(postingRequestModel.getAmount().subtract(exchangeGainOrLoss));
		}
		journalLineItem2.setReferenceType(PostingReferenceTypeEnum.BANK_RECEIPT);
		journalLineItem2.setReferenceId(referenceId);
		journalLineItem2.setExchangeRate(exchangeRate);
		journalLineItem2.setCreatedBy(userId);
		journalLineItem2.setJournal(journal);
		journalLineItemList.add(journalLineItem2);

		if (exchangeGainOrLoss != null && (exchangeGainOrLoss.compareTo(BigDecimal.ZERO) == 1 || exchangeGainOrLoss.compareTo(BigDecimal.ZERO) == -1)) {
			JournalLineItem journalLineItem = new JournalLineItem();
			transactionCategory = transactionCategoryService.findByPK(id);
			journalLineItem.setTransactionCategory(transactionCategory);
			if (id.equals(79)) {
				journalLineItem.setCreditAmount(exchangeGainOrLoss);
			} else {
				journalLineItem.setDebitAmount(exchangeGainOrLoss);
			}
			journalLineItem.setReferenceType(PostingReferenceTypeEnum.BANK_RECEIPT);
			journalLineItem.setReferenceId(referenceId);
			journalLineItem.setExchangeRate(exchangeRate);
			journalLineItem.setCreatedBy(userId);
			journalLineItem.setJournal(journal);
			journalLineItemList.add(journalLineItem);
		}
		journal.setJournalLineItems(journalLineItemList);
		journal.setCreatedBy(userId);
		journal.setPostingReferenceType(PostingReferenceTypeEnum.BANK_RECEIPT);
		journal.setJournalDate(LocalDate.now());
		return journal;
	}

}
