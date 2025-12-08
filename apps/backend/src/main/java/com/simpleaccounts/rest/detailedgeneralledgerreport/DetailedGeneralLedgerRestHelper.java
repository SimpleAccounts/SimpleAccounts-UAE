package com.simpleaccounts.rest.detailedgeneralledgerreport;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.exceptions.ServiceException;
import com.simpleaccounts.repository.PayrollRepository;
import com.simpleaccounts.rest.creditnotecontroller.CreditNoteRepository;
import com.simpleaccounts.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.simpleaccounts.constant.CommonColumnConstants;
import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.service.bankaccount.TransactionService;
import com.simpleaccounts.utils.DateFormatUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class DetailedGeneralLedgerRestHelper {

	private static final Logger logger = LoggerFactory.getLogger(DetailedGeneralLedgerRestHelper.class);

	@Autowired
	private JournalLineItemService journalLineItemService;

	@Autowired
	private TransactionService transactionalService;

	@Autowired
	private BankAccountService bankAccountService;

	@Autowired
	private ExpenseService expenseService;

	@Autowired
	private InvoiceService invoiceService;

	@Autowired
	private PaymentService paymentService;

	@Autowired
	private ReceiptService receiptService;

	@Autowired
	private DateFormatUtil dateUtil;
	@Autowired
	TransactionCategoryService transactionCategoryService;

	@Autowired
	PayrollRepository payrollRepository;

	@Autowired
	private CreditNoteRepository creditNoteRepository;

	@Autowired
	TransactionCategoryClosingBalanceService transactionCategoryClosingBalanceService;

	@Autowired
	CustomerInvoiceReceiptService customerInvoiceReceiptService;

	@Autowired
	SupplierInvoicePaymentService supplierInvoicePaymentService;

	public Map<Integer, Expense> findOrGetFromDbEx(Map<Integer, Expense> expenseMap, Integer id) {

		if (!expenseMap.containsKey(id)) {
			try{
			Expense expense = expenseService.findByPK(id);
			expenseMap.put(expense.getExpenseId(), expense);
			}
			catch (Exception e){
				logger.error("Error processing general ledger report", e);
			}
		}
		return expenseMap;
	}

	public Map<Integer, Invoice> findOrGetFromDbIn(Map<Integer, Invoice> invoiceMap, Integer id) {

		if (!invoiceMap.containsKey(id)) {
			Invoice invoice = invoiceService.findByPK(id);
			invoiceMap.put(invoice.getId(), invoice);
		}
		return invoiceMap;
	}

	public Map<Integer, CreditNote> findOrGetFromDbCn(Map<Integer, CreditNote> creditNoteMap, Integer id) {

		if (!creditNoteMap.containsKey(id)) {
			try {
				CreditNote creditNote = creditNoteRepository.findById(id).get();
				creditNoteMap.put(creditNote.getCreditNoteId(), creditNote);
			}catch (NoSuchElementException  e){
			}
		}
		return creditNoteMap;
	}

	public Map<Integer, Transaction> findOrGetFromDbTr(Map<Integer, Transaction> transactionMap, Integer id) {

		if (!transactionMap.containsKey(id)) {
			Transaction transaction = transactionalService.findByPK(id);
			transactionMap.put(transaction.getTransactionId(), transaction);
		}
		return transactionMap;
	}

	public Map<Integer, BankAccount> findOrGetFromDbBn(Map<Integer, BankAccount> bankAccountMap, Integer id) {

		if (!bankAccountMap.containsKey(id)) {
			BankAccount bankAccount = bankAccountService.findByPK(id);
			bankAccountMap.put(bankAccount.getBankAccountId(), bankAccount);
		}
		return bankAccountMap;
	}

	public Map<Integer, Payment> findOrGetFromDbPaymnt(Map<Integer, Payment> paymentMap, Integer id) {

		if (!paymentMap.containsKey(id)) {
			try {
				Payment payment = paymentService.findByPK(id);
				paymentMap.put(payment.getPaymentId(), payment);
			}catch (Exception e){
					logger.error("Error processing general ledger report", e);
				}
		}
		return paymentMap;
	}

	public Map<Integer, Receipt> findOrGetFromDbReceipt(Map<Integer, Receipt> receiptMap, Integer id) {

		if (!receiptMap.containsKey(id)) {
			Receipt receipt = null;
			try {
				receipt = receiptService.findByPK(id);
				receiptMap.put(receipt.getId(), receipt);
			} catch (ServiceException exception){

			}
		}
		return receiptMap;
	}

	public List<Object> getDetailedGeneralLedgerReport(ReportRequestModel reportRequestModel) {

		List<Object> resposneList = new ArrayList<>();

		List<JournalLineItem> itemList = journalLineItemService.getList(reportRequestModel);
		List<TransactionCategoryClosingBalance> closingBalanceList = transactionCategoryClosingBalanceService.getList(reportRequestModel);
	    if (itemList != null && !itemList.isEmpty()) {
			Map<Integer,TransactionCategoryClosingBalance> transactionCategoryClosingBalanceMap = processTransactionCategoryClosingBalance(closingBalanceList);
			Map<Integer, List<JournalLineItem>> map = new HashMap<>();
			Map<Integer, Expense> expenseMap = new HashMap<>();
			Map<Integer, Transaction> transactionMap = new HashMap<>();
			Map<Integer, BankAccount> bankAccountMap = new HashMap<>();
			Map<Integer, Invoice> invoiceMap = new HashMap<>();
			Map<Integer, Receipt> receiptMap = new HashMap<>();
			Map<Integer, Payment> paymentMap = new HashMap<>();
			Map<Integer, CreditNote> creditNoteMap = new HashMap<>();
			for (JournalLineItem item : itemList) {
				if (item.getTransactionCategory() != null) {
					if (map.containsKey(item.getTransactionCategory().getTransactionCategoryId())) {
						map.get(item.getTransactionCategory().getTransactionCategoryId()).add(item);
					} else {
						List<JournalLineItem> jlList = new ArrayList<>();
						jlList.add(item);
						map.put(item.getTransactionCategory().getTransactionCategoryId(), jlList);
					}
				}
			}

			for (Integer item : map.keySet()) {
				List<DetailedGeneralLedgerReportListModel> dataList = new LinkedList<>();
				List<JournalLineItem> journalLineItemList = map.get(item);

				Comparator<JournalLineItem> dateComparator = Comparator.comparing(j -> j.getJournal().getJournalDate());

				Collections.sort(journalLineItemList, dateComparator);

				for (JournalLineItem lineItem : journalLineItemList) 	{

					DetailedGeneralLedgerReportListModel model = new DetailedGeneralLedgerReportListModel();

					Journal journal = lineItem.getJournal();
					LocalDateTime date = journal.getJournalDate().atStartOfDay();
					if (lineItem == null)
						date = LocalDateTime.now();
					model.setDate(dateUtil.getLocalDateTimeAsString(date, "dd-MM-yyyy"));
					model.setTransactionTypeName(lineItem.getTransactionCategory().getTransactionCategoryName());

					PostingReferenceTypeEnum postingType = lineItem.getReferenceType();
					model.setPostingReferenceTypeEnum(postingType.getDisplayName());
					model.setPostingReferenceType(postingType);
					model.setReferenceId(lineItem.getReferenceId());
					boolean isDebit = lineItem.getDebitAmount() != null || (lineItem.getDebitAmount() != null
							&& new BigDecimal(0).equals(lineItem.getDebitAmount())) ? Boolean.TRUE : Boolean.FALSE;

					switch (postingType) {
						case BANK_ACCOUNT:
							//bankAccountMap = findOrGetFromDbBn(bankAccountMap, lineItem.getReferenceId());
							//BankAccount bn = bankAccountMap.get(lineItem.getReferenceId());
							model.setAmount(lineItem.getDebitAmount() != null ? lineItem.getDebitAmount() : lineItem.getCreditAmount());
							model.setDebitAmount(lineItem.getDebitAmount());
							model.setCreditAmount(lineItem.getCreditAmount());
							//model.setName( bn.getBankName()+"-"+bn.getBankAccountName());
							break;

						case TRANSACTION_RECONSILE:
						case TRANSACTION_RECONSILE_INVOICE:
						case REVERSE_TRANSACTION_RECONSILE:
							transactionMap = findOrGetFromDbTr(transactionMap, lineItem.getReferenceId());
							Transaction tr = transactionMap.get(lineItem.getReferenceId());
							model.setAmount(lineItem.getDebitAmount() != null ? lineItem.getDebitAmount() : lineItem.getCreditAmount());

							model.setDebitAmount(lineItem.getDebitAmount());
							DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
							if (tr.getTransactionDate()!=null){
								String d = tr.getTransactionDate().format(formatter);
								model.setDate(d);
							}
							// model.setCreditAmount(lineItem.getCreditAmount());
							// DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
							// if (tr.getTransactionDate()!=null){
							// 	String d = tr.getTransactionDate().format(formatter);
							// 	model.setDate(d);
							// }
							model.setCreditAmount(lineItem.getCreditAmount());
							// DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
							if (tr.getTransactionDate()!=null){
								String d = tr.getTransactionDate().format(formatter);
								model.setDate(d);
							}
							model.setCreditAmount(lineItem.getCreditAmount());
							model.setName(tr.getBankAccount() != null ? tr.getBankAccount().getBankName() + "-" + tr.getBankAccount().getBankAccountName() : "-");
							break;

						case EXPENSE:
						case REVERSE_EXPENSE:
							expenseMap = findOrGetFromDbEx(expenseMap, lineItem.getReferenceId());
							Expense expense = expenseMap.get(lineItem.getReferenceId());
							if (expense != null) {
								//model.setPostingReferenceTypeEnum(PostingReferenceTypeEnum.EXPENSE.getDisplayName());
//								model.setAmount(isDebit ? lineItem.getDebitAmount() : lineItem.getCreditAmount());
//								model.setDebitAmount(isDebit ? lineItem.getDebitAmount() : new BigDecimal(0));
//								model.setCreditAmount(isDebit ? new BigDecimal(0) : lineItem.getCreditAmount());
								model.setCreditAmount(lineItem.getCreditAmount());
								model.setDebitAmount(lineItem.getDebitAmount());
								if (lineItem.getCreditAmount().compareTo(BigDecimal.ZERO)==1){
									model.setAmount(lineItem.getCreditAmount());
								}
								else {
									model.setAmount(lineItem.getDebitAmount());
								}
								if (expense.getUserId() != null) {
									model.setName(expense.getUserId().getFirstName() + " " + expense.getUserId().getLastName());
								} else if (expense.getEmployee() != null) {
									model.setName(expense.getEmployee().getFirstName() + " " + expense.getEmployee().getLastName());
								} else {
									if (expense.getPayee() != null && expense.getPayee().equalsIgnoreCase(CommonColumnConstants.COMPANY_EXPENSE))
										model.setName(expense.getPayee());
									else {
										TransactionCategory transactionCategory = transactionCategoryService.findByPK(Integer.parseInt(expense.getPayee()));
										StringBuilder payeeName = new StringBuilder();
										payeeName.append(transactionCategory.getParentTransactionCategory().getTransactionCategoryName()).append("-")
												.append(transactionCategory.getTransactionCategoryName());
										model.setName(payeeName.toString());
									}
								}
								DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
								if (expense.getExpenseDate()!=null){
									String d = expense.getExpenseDate().format(dateFormatter);
									model.setDate(d);
								}
								model.setTransactonRefNo(expense.getExpenseNumber());
							}
							break;

						case INVOICE:
						case REVERSE_INVOICE:
							invoiceMap = findOrGetFromDbIn(invoiceMap, lineItem.getReferenceId());
							Invoice invoice = invoiceMap.get(lineItem.getReferenceId());

//							model.setReferenceNo(journal.getJournlReferencenNo());
							//model.setAmount(invoice.getTotalAmount());
							BigDecimal amount = BigDecimal.ZERO;
//							if (isDebit) {
//								model.setCreditAmount(BigDecimal.ZERO);
//								model.setDebitAmount(lineItem.getDebitAmount());
//								amount = lineItem.getDebitAmount();
//							} else {
//								model.setCreditAmount(lineItem.getCreditAmount());
//								model.setDebitAmount(BigDecimal.ZERO);
//								amount = lineItem.getCreditAmount();
//							}
//							model.setAmount(amount);

							model.setCreditAmount(lineItem.getCreditAmount());
							model.setDebitAmount(lineItem.getDebitAmount());
							if (lineItem.getCreditAmount().compareTo(BigDecimal.ZERO)==1){
								model.setAmount(lineItem.getCreditAmount());
							}
							else {
								model.setAmount(lineItem.getDebitAmount());
							}
						/*BigDecimal amountCredit = !isDebit ? lineItem.getCreditAmount() : BigDecimal.ZERO;
						BigDecimal amountDebit = isDebit ? lineItem.getDebitAmount() : BigDecimal.ZERO;
						model.setCreditAmount(amountCredit);
						model.setDebitAmount(amountDebit);
						model.setAmount(amountDebit.intValue()!=0?amountDebit:amountCredit);*/
							//model.setCreditAmount(!isDebit ? lineItem.getCreditAmount() : BigDecimal.ZERO);
							//model.setDebitAmount(isDebit ? lineItem.getDebitAmount() : BigDecimal.ZERO);

							if (invoice.getContact().getOrganization() != null && !invoice.getContact().getOrganization().isEmpty()){
								model.setName(invoice.getContact().getOrganization());
							}else{
								model.setName(invoice.getContact().getFirstName() + " " + invoice.getContact().getLastName());
							}
							model.setTransactonRefNo(invoice.getReferenceNumber());
							model.setInvoiceType(invoice.getType());
							DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
							if (invoice.getInvoiceDate()!=null){
								String d = invoice.getInvoiceDate().format(dateFormatter);
								model.setDate(d);
							}
							break;
						case CREDIT_NOTE:
						case REVERSE_CREDIT_NOTE:
						case DEBIT_NOTE:
						case REVERSE_DEBIT_NOTE:
							creditNoteMap = findOrGetFromDbCn(creditNoteMap, lineItem.getReferenceId());
							CreditNote creditNote = creditNoteMap.get(lineItem.getReferenceId());

							model.setReferenceNo(journal.getJournlReferencenNo());
							//model.setAmount(invoice.getTotalAmount());
							 amount = BigDecimal.ZERO;
							if (isDebit) {
								model.setDebitAmount(lineItem.getDebitAmount());
								model.setCreditAmount(lineItem.getCreditAmount());
								amount = lineItem.getCreditAmount();
							} else {
								model.setCreditAmount(lineItem.getCreditAmount());
								model.setDebitAmount(lineItem.getDebitAmount());
								amount = lineItem.getDebitAmount();
							}
							model.setAmount(amount);
						/*BigDecimal amountCredit = !isDebit ? lineItem.getCreditAmount() : BigDecimal.ZERO;
						BigDecimal amountDebit = isDebit ? lineItem.getDebitAmount() : BigDecimal.ZERO;
						model.setCreditAmount(amountCredit);
						model.setDebitAmount(amountDebit);
						model.setAmount(amountDebit.intValue()!=0?amountDebit:amountCredit);*/
							//model.setCreditAmount(!isDebit ? lineItem.getCreditAmount() : BigDecimal.ZERO);
							//model.setDebitAmount(isDebit ? lineItem.getDebitAmount() : BigDecimal.ZERO);

							if (creditNote.getContact().getOrganization() != null && !creditNote.getContact().getOrganization().isEmpty()){
								model.setName(creditNote.getContact().getOrganization());
							}else{
								model.setName(creditNote.getContact().getFirstName() + " " + creditNote.getContact().getLastName());
							}
							model.setTransactonRefNo(creditNote.getCreditNoteNumber());
							model.setInvoiceType(creditNote.getType());
							break;


						case MANUAL:
						case BALANCE_ADJUSTMENT:
							model.setReferenceNo(journal.getJournlReferencenNo());
							model.setAmount(isDebit ? lineItem.getDebitAmount() : lineItem.getCreditAmount());
							model.setCreditAmount(lineItem.getCreditAmount());
							model.setDebitAmount(lineItem.getDebitAmount());
							model.setName(lineItem.getContact() != null
									? lineItem.getContact().getFirstName() + " " + lineItem.getContact().getLastName()
									: "");
							break;
						case PAYROLL:
						case PAYROLL_APPROVED:
						case PAYROLL_EXPLAINED:
						case REVERSE_PAYROLL_EXPLAINED:
							model.setName(journal.getDescription());
							model.setAmount(isDebit ? lineItem.getDebitAmount() : lineItem.getCreditAmount());
							model.setCreditAmount(lineItem.getCreditAmount());
							model.setDebitAmount(lineItem.getDebitAmount());
							break;
						case RECEIPT:
						case PAYMENT:
						case REVERSE_PAYMENT:
						case REVERSE_RECEIPT:
							model.setReferenceNo(journal.getJournlReferencenNo());

							model.setAmount(isDebit ? lineItem.getDebitAmount() : lineItem.getCreditAmount());
							model.setCreditAmount(lineItem.getCreditAmount());
							model.setDebitAmount(lineItem.getDebitAmount());
							Contact contact = null;
							if (postingType.equals(PostingReferenceTypeEnum.RECEIPT)) {
								receiptMap = findOrGetFromDbReceipt(receiptMap, Integer.valueOf(journal.getJournlReferencenNo()));
								Receipt receipt = receiptMap.get(Integer.valueOf(journal.getJournlReferencenNo()));
								if(receipt!=null){
									contact = receipt.getContact();
									model.setTransactonRefNo(receipt.getInvoice().getReferenceNumber());
									invoice = receipt.getInvoice();
									model.setInvoiceType(invoice.getType());
								}
							} else {
								paymentMap = findOrGetFromDbPaymnt(paymentMap, lineItem.getReferenceId());
								Payment payment = paymentMap.get(lineItem.getReferenceId());
								if(payment!=null){
									contact = payment.getSupplier();
									model.setTransactonRefNo(payment.getInvoice().getReferenceNumber());
								}

							}
							if(contact != null){
							if (contact.getOrganization() != null && !contact.getOrganization().isEmpty()){
								model.setName(contact.getOrganization());
							}else{
								model.setName(contact.getFirstName() + " " + contact.getLastName());
							}}

							break;

						case REFUND:
						case CANCEL_REFUND:
							model.setAmount(isDebit ? lineItem.getDebitAmount() : lineItem.getCreditAmount());
							model.setDebitAmount(lineItem.getDebitAmount());
							model.setCreditAmount(lineItem.getCreditAmount());
							break;
						case PURCHASE:
						case PETTY_CASH:

							model.setAmount(lineItem.getDebitAmount() != null ? lineItem.getDebitAmount() : lineItem.getCreditAmount());
							model.setDebitAmount(lineItem.getDebitAmount());
							model.setCreditAmount(lineItem.getCreditAmount());
							break;
						case VAT_REPORT_FILED:
						case VAT_REPORT_UNFILED:
						case VAT_PAYMENT:
						case VAT_PENALTY_AMOUNT:
						case VAT_CLAIM:
						case REVERSE_VAT_PAYMENT:
							if(lineItem.getDebitAmount()!=null && lineItem.getDebitAmount().compareTo(BigDecimal.ZERO)>0){
								model.setAmount(lineItem.getDebitAmount());
							}
							else {
								model.setAmount(lineItem.getCreditAmount());
							}
							model.setDebitAmount(lineItem.getDebitAmount());
							model.setCreditAmount(lineItem.getCreditAmount());
							break;

						case BANK_PAYMENT:
						case BANK_RECEIPT:
						case REVERSE_BANK_PAYMENT:
						case REVERSE_BANK_RECEIPT:
							model.setReferenceNo(journal.getJournlReferencenNo());
							model.setAmount(isDebit ? lineItem.getDebitAmount() : lineItem.getCreditAmount());
							model.setCreditAmount(lineItem.getCreditAmount());
							model.setDebitAmount(lineItem.getDebitAmount());
							 contact = null;
							 Receipt receipt = null;
							 Payment payment = null;
							Map<String, Object> objectMap =new HashMap<>();
							objectMap.put("deleteFlag",Boolean.FALSE);
							 if (postingType.equals(PostingReferenceTypeEnum.BANK_RECEIPT)){
								CustomerInvoiceReceipt customerInvoiceReceipts = null;
								try {
									customerInvoiceReceipts = customerInvoiceReceiptService.findByAttributes(objectMap).get(0);
									receipt = customerInvoiceReceipts.getReceipt();
								} catch (Exception exception){

								}

							 }

								if(receipt!=null){
									contact = receipt.getContact();
									model.setTransactonRefNo(receipt.getInvoice().getReferenceNumber());
								}

								if (postingType.equals(PostingReferenceTypeEnum.BANK_PAYMENT)){
									SupplierInvoicePayment supplierInvoicePayment = supplierInvoicePaymentService.findByAttributes(objectMap).get(0);
									payment = supplierInvoicePayment.getPayment();
								}
								if(payment!=null){
									contact = payment.getSupplier();
									model.setTransactonRefNo(payment.getInvoice().getReferenceNumber());
								}

							if(contact != null){
								if (contact.getOrganization() != null && !contact.getOrganization().isEmpty()){
									model.setName(contact.getOrganization());
								}else{
									model.setName(contact.getFirstName() + " " + contact.getLastName());
								}}
							break;

					}
					model.setAmount(model.getAmount());

					dataList.add(model);
				}

				if(transactionCategoryClosingBalanceMap.get(item)!=null)
				{
					TransactionCategoryClosingBalance transactionCategoryClosingBalance = transactionCategoryClosingBalanceMap.get(item);
					updateOpeningClosingBalance(dataList,reportRequestModel,transactionCategoryClosingBalance);
				}
				resposneList.add(dataList);
			}

		}

		return resposneList;
	}

	private void updateOpeningClosingBalance(List<DetailedGeneralLedgerReportListModel> dataList, ReportRequestModel reportRequestModel,
											 TransactionCategoryClosingBalance transactionCategoryClosingBalance) {
		BigDecimal creditAmount = BigDecimal.ZERO;
		BigDecimal debitAmount = BigDecimal.ZERO;
		String transactionTypeName = dataList.get(0).getTransactionTypeName();
		for(DetailedGeneralLedgerReportListModel model : dataList )
		{
			creditAmount = creditAmount.add(model.getCreditAmount()!=null?model.getCreditAmount():BigDecimal.ZERO);
			debitAmount = debitAmount.add(model.getDebitAmount()!=null?model.getDebitAmount():BigDecimal.ZERO);
		}
		boolean isCredit = creditAmount.longValue() >= debitAmount.longValue() ;
		DetailedGeneralLedgerReportListModel openingBalanceModel = new DetailedGeneralLedgerReportListModel();
		DetailedGeneralLedgerReportListModel closingBalanceModel = new DetailedGeneralLedgerReportListModel();
		DetailedGeneralLedgerReportListModel tempopeningBalanceModel = dataList.get(0);
		openingBalanceModel.setDate("As on "+reportRequestModel.getStartDate());
		BigDecimal openingBalance = transactionCategoryClosingBalance.getOpeningBalance();
		if(transactionCategoryClosingBalance.getOpeningBalance().longValue()<=0) {
			openingBalanceModel.setCreditAmount(transactionCategoryClosingBalance.getOpeningBalance().negate());
			//openingBalanceModel.setDebitAmount(BigDecimal.ZERO);
		}else {
			//openingBalanceModel.setCreditAmount(BigDecimal.ZERO);
			openingBalanceModel.setDebitAmount(transactionCategoryClosingBalance.getOpeningBalance());
		}openingBalanceModel.setAmount(transactionCategoryClosingBalance.getOpeningBalance());
		openingBalanceModel.setTransactionTypeName(transactionTypeName);
		openingBalanceModel.setPostingReferenceTypeEnum("Opening Balance");
		dataList.add(0,openingBalanceModel);

		closingBalanceModel.setDate("As on "+reportRequestModel.getEndDate());

		BigDecimal closingBalance = transactionCategoryClosingBalance.getClosingBalance();
		if(closingBalance.longValue()<0)
			closingBalance= closingBalance.negate();
		if(isCredit) {
			closingBalanceModel.setCreditAmount(closingBalance);
			//closingBalanceModel.setDebitAmount(BigDecimal.ZERO);
		}
		else {
			//closingBalanceModel.setCreditAmount(BigDecimal.ZERO);
			closingBalanceModel.setDebitAmount(closingBalance);
		}
		closingBalanceModel.setPostingReferenceTypeEnum("Closing Balance");
		dataList.add(closingBalanceModel);
	}

	private Map<Integer, TransactionCategoryClosingBalance> processTransactionCategoryClosingBalance(List<TransactionCategoryClosingBalance> closingBalanceList) {
		Map<Integer, TransactionCategoryClosingBalance> transactionCategoryClosingBalanceMap = new HashMap<>();
		for(TransactionCategoryClosingBalance transactionCategoryClosingBalance :closingBalanceList)
		{
			if(transactionCategoryClosingBalance.getTransactionCategory()== null )
			continue;
			TransactionCategoryClosingBalance tempTransactionCategoryClosingBalance = transactionCategoryClosingBalanceMap.get(transactionCategoryClosingBalance.getTransactionCategory().getTransactionCategoryId());

			if(tempTransactionCategoryClosingBalance==null)
			{
				tempTransactionCategoryClosingBalance = new TransactionCategoryClosingBalance();
				tempTransactionCategoryClosingBalance.setOpeningBalance(transactionCategoryClosingBalance.getOpeningBalance());
				tempTransactionCategoryClosingBalance.setClosingBalance(transactionCategoryClosingBalance.getClosingBalance());
				tempTransactionCategoryClosingBalance.setClosingBalanceDate(transactionCategoryClosingBalance.getClosingBalanceDate());
				transactionCategoryClosingBalanceMap.put(transactionCategoryClosingBalance.getTransactionCategory().getTransactionCategoryId(),tempTransactionCategoryClosingBalance);
			}
			else
				tempTransactionCategoryClosingBalance.setOpeningBalance(transactionCategoryClosingBalance.getOpeningBalance());
			tempTransactionCategoryClosingBalance.setCreatedDate(Date.from(transactionCategoryClosingBalance.getClosingBalanceDate().atZone(ZoneId.systemDefault()).toInstant()));
		}
		return transactionCategoryClosingBalanceMap;
	}

}
