package com.simpleaccounts.rest.reconsilationcontroller;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;

import com.simpleaccounts.constant.*;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.ReconcileStatus;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.transactioncontroller.TransactionPresistModel;
import com.simpleaccounts.service.*;
import com.simpleaccounts.service.bankaccount.ReconcileStatusService;
import com.simpleaccounts.utils.DateFormatUtil;
import java.math.BigDecimal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.ModelAttribute;

@Component
	@SuppressWarnings("java:S115")
	@RequiredArgsConstructor
public class ReconsilationRestHelper {

	private final Logger logger = LoggerFactory.getLogger(ReconsilationController.class);

	private final ReconcileStatusService reconcileStatusService;

	private final DateFormatUtil dateUtil;

	private final ExpenseService expenseService;

	private final InvoiceService invoiceService;

	private final TransactionCategoryService transactionCategoryService;

	private final VatCategoryService vatCategoryService;
	private final BankAccountService bankAccountService;
	private final CurrencyExchangeService currencyExchangeService;

	private static final String DATE_FORMAT_DD_MM_YYYY = "dd-MM-yyyy";

	public List<ReconsilationListModel> getList(ReconsileCategoriesEnumConstant constant) {
		Map<String, Object> attribute = new HashMap<String, Object>();

		attribute.put("deleteFlag", Boolean.FALSE);

		List<ReconsilationListModel> modelList = new ArrayList<>();
		switch (constant) {
		case EXPENSE:
			List<Expense> expenseList = expenseService.findByAttributes(attribute);
			for (Expense expense : expenseList) {
				modelList.add(new ReconsilationListModel(expense.getExpenseId(), expense.getExpenseDate().toString(),
						expense.getPayee(), expense.getExpenseAmount(),
						expense.getCurrency() != null ? expense.getCurrency().getCurrencySymbol() : ""));
			}
			break;

		case SUPPLIER_INVOICE:

			attribute.put("type", 1);
			List<Invoice> invoices = invoiceService.findByAttributes(attribute);
			for (Invoice invoice : invoices) {
				modelList.add(new ReconsilationListModel(invoice.getId(), invoice.getInvoiceDate().toString(),
						invoice.getReferenceNumber(), invoice.getTotalAmount(), invoice.getInvoiceDueDate().toString(),
						invoice.getCurrency() != null ? invoice.getCurrency().getCurrencySymbol() : ""));
			}
			break;

		default:
			break;
		}
		return modelList;
	}

	public Journal get(ChartOfAccountCategoryIdEnumConstant chartOfAccountCategoryIdEnumConstant,
			Integer transactionCategoryCode, BigDecimal amount, int userId, Transaction transaction) {

		Journal journal = null;
		switch (chartOfAccountCategoryIdEnumConstant) {
		case SALES:
			journal = invoiceReconsile(chartOfAccountCategoryIdEnumConstant, userId, transaction,
					transaction.getBankAccount().getTransactionCategory());
			break;
		case EXPENSE:
			journal = invoiceReconsile(chartOfAccountCategoryIdEnumConstant, userId, transaction,
					transaction.getBankAccount().getTransactionCategory());
			break;
		case MONEY_RECEIVED:
		case TRANSFER_FROM:
		case REFUND_RECEIVED:
		case INTEREST_RECEVIED:
		case MONEY_RECEIVED_FROM_USER:
		case DISPOSAL_OF_CAPITAL_ASSET:
		case MONEY_RECEIVED_OTHERS:
		case MONEY_SPENT:
		case TRANSFERD_TO:
		case MONEY_PAID_TO_USER:
		case PURCHASE_OF_CAPITAL_ASSET:
		case MONEY_SPENT_OTHERS:
		case INVOICE:
		case VAT_PAYMENT:
		case VAT_CLAIM:
		case CORPORATE_TAX_PAYMENT:
		case DEFAULT:
		default:
			journal = getByTransactionType(transactionCategoryCode, amount, userId, transaction, false,transaction.getExchangeRate());
			break;
		}
		return journal;

	}
//Todo
	public Journal getByTransactionType(Integer transactionCategoryCode, BigDecimal amount, int userId,
										Transaction transaction, boolean isdebitFromBank, BigDecimal exchangeRate) {

		List<JournalLineItem> journalLineItemList = new ArrayList<>();

			Journal journal = new Journal();
			JournalLineItem journalLineItem1 = new JournalLineItem();
		journalLineItem1.setTransactionCategory(transaction.getExplainedTransactionCategory());
		if (!isdebitFromBank) {
			journalLineItem1.setDebitAmount(transaction.getTransactionDueAmount().multiply(exchangeRate));
		} else {
			journalLineItem1.setCreditAmount(transaction.getTransactionDueAmount().multiply(exchangeRate));
		}
		journalLineItem1.setReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE);
		journalLineItem1.setReferenceId(transaction.getTransactionId());
		journalLineItem1.setExchangeRate(exchangeRate);
		journalLineItem1.setCreatedBy(userId);
		journalLineItem1.setJournal(journal);
		journalLineItemList.add(journalLineItem1);

		JournalLineItem journalLineItem2 = new JournalLineItem();
		journalLineItem2.setTransactionCategory(transaction.getBankAccount().getTransactionCategory());
		if (isdebitFromBank) {
			journalLineItem2.setDebitAmount(transaction.getTransactionDueAmount().multiply(exchangeRate));
		} else {
			journalLineItem2.setCreditAmount(transaction.getTransactionDueAmount().multiply(exchangeRate));
		}
		journalLineItem2.setReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE);
		journalLineItem2.setReferenceId(transaction.getTransactionId());
		journalLineItem2.setExchangeRate(exchangeRate);
		journalLineItem2.setCreatedBy(transaction.getCreatedBy());
		journalLineItem2.setJournal(journal);
		journalLineItemList.add(journalLineItem2);

		journal.setJournalLineItems(journalLineItemList);
		journal.setCreatedBy(transaction.getCreatedBy());
		journal.setPostingReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE);
		journal.setJournalDate(LocalDate.now());

		journal.setTransactionDate(transaction.getTransactionDate().toLocalDate());
		transaction.setTransactionDueAmount(BigDecimal.ZERO);
		transaction.setTransactionExplinationStatusEnum(TransactionExplinationStatusEnum.FULL);
		return journal;
	}
//Todo
	public Journal getByTransactionType(@ModelAttribute TransactionPresistModel transactionPresistModel,
										Integer transactionCategoryCode, int userId,
										Transaction transaction, Expense expense) {

				BigDecimal exchangeRate;
				if (transactionPresistModel.getExchangeRate() == null){
					 exchangeRate =  currencyExchangeService.getExchangeRate(transactionPresistModel.getCurrencyCode()).getExchangeRate();
				}
				else {
					exchangeRate = transactionPresistModel.getExchangeRate();
				}
			List<JournalLineItem> journalLineItemList = new ArrayList<>();

			Journal journal = new Journal();
			JournalLineItem journalLineItem1 = new JournalLineItem();
		journalLineItem1.setTransactionCategory(transaction.getExplainedTransactionCategory());
		journalLineItem1.setReferenceType(PostingReferenceTypeEnum.EXPENSE);
		journalLineItem1.setReferenceId(expense.getExpenseId());
		journalLineItem1.setCreatedBy(userId);
		journalLineItem1.setExchangeRate(transaction.getExchangeRate());
		journalLineItem1.setJournal(journal);

		JournalLineItem journalLineItem2 = new JournalLineItem();
		TransactionCategory saleTransactionCategory = transactionCategoryService
				.findByPK(transaction.getBankAccount().getTransactionCategory().getTransactionCategoryId());
		journalLineItem2.setTransactionCategory(saleTransactionCategory);
		if (expense.getIsReverseChargeEnabled().equals(Boolean.FALSE) && expense.getExclusiveVat().equals(Boolean.TRUE)){
			BigDecimal amount = expense.getExpenseAmount().add(expense.getExpenseVatAmount());
			journalLineItem2.setCreditAmount( amount.multiply(exchangeRate));
		} else if (expense.getIsReverseChargeEnabled().equals(Boolean.TRUE) && expense.getExclusiveVat().equals(Boolean.FALSE)) {
			BigDecimal amount = expense.getExpenseAmount().subtract(expense.getExpenseVatAmount());
			journalLineItem2.setCreditAmount( amount.multiply(exchangeRate));
		} else {
			journalLineItem2.setCreditAmount(expense.getExpenseAmount().multiply(exchangeRate));
		}
		journalLineItem2.setReferenceType(PostingReferenceTypeEnum.EXPENSE);
		journalLineItem2.setReferenceId(expense.getExpenseId());
		journalLineItem2.setCreatedBy(userId);
		journalLineItem2.setExchangeRate(transaction.getExchangeRate());
		journalLineItem2.setJournal(journal);
			journalLineItemList.add(journalLineItem2);
			if (transactionPresistModel.getVatId()!=null) {
				BigDecimal vatAmount = expense.getExpenseVatAmount();
				if (Boolean.FALSE.equals(expense.getExclusiveVat())){
					BigDecimal actualDebitAmount = expense.getExpenseAmount().subtract(expense.getExpenseVatAmount());
					journalLineItem1.setDebitAmount(actualDebitAmount.multiply(exchangeRate));
				}
				else {
					journalLineItem1.setDebitAmount(expense.getExpenseAmount().multiply(exchangeRate));
				}
			JournalLineItem journalLineItem = new JournalLineItem();
			TransactionCategory inputVatCategory = transactionCategoryService
					.findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.INPUT_VAT.getCode());
			journalLineItem.setTransactionCategory(inputVatCategory);
			journalLineItem.setDebitAmount(vatAmount.multiply(exchangeRate));
			journalLineItem.setReferenceType(PostingReferenceTypeEnum.EXPENSE);
			journalLineItem.setReferenceId(expense.getExpenseId());
			journalLineItem.setExchangeRate(transaction.getExchangeRate());
			journalLineItem.setCreatedBy(userId);
			journalLineItem.setJournal(journal);
			journalLineItemList.add(journalLineItem);
			//Reverse Charge Enabled JLi
			if(expense.getIsReverseChargeEnabled().equals(Boolean.TRUE)){
				JournalLineItem reverseChargejournalLineItem = new JournalLineItem();
				TransactionCategory outputVatCategory = transactionCategoryService
						.findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.OUTPUT_VAT.getCode());
				reverseChargejournalLineItem.setTransactionCategory(outputVatCategory);
				reverseChargejournalLineItem.setCreditAmount(vatAmount.multiply(exchangeRate));
				reverseChargejournalLineItem.setReferenceType(PostingReferenceTypeEnum.EXPENSE);
				reverseChargejournalLineItem.setReferenceId(expense.getExpenseId());
				reverseChargejournalLineItem.setCreatedBy(userId);
				reverseChargejournalLineItem.setExchangeRate(transaction.getExchangeRate());
				reverseChargejournalLineItem.setJournal(journal);
				journalLineItemList.add(reverseChargejournalLineItem);
			}
		}
		journalLineItemList.add(journalLineItem1);
		journal.setJournalLineItems(journalLineItemList);
		journal.setCreatedBy(transaction.getCreatedBy());
		journal.setPostingReferenceType(PostingReferenceTypeEnum.EXPENSE);
		journal.setJournalDate(LocalDate.now());
		journal.setTransactionDate(transaction.getTransactionDate().toLocalDate());
		journal.setJournlReferencenNo(expense.getExpenseNumber());
		journal.setDescription(expense.getPayee());
		return journal;
	}
	//Todo
	public Journal getByTransactionTypeForPayroll(@ModelAttribute TransactionPresistModel transactionPresistModel,
										Integer transactionCategoryCode, int userId,
										Transaction transaction, Expense expense,BigDecimal amount) {

		BigDecimal exchangeRate = transactionPresistModel.getExchangeRate();
		List<JournalLineItem> journalLineItemList = new ArrayList<>();

			Journal journal = new Journal();
			JournalLineItem journalLineItem1 = new JournalLineItem();
		journalLineItem1.setTransactionCategory(transaction.getExplainedTransactionCategory());

		journalLineItem1.setDebitAmount(amount.multiply(transactionPresistModel.getExchangeRate()));
		journalLineItem1.setReferenceType(PostingReferenceTypeEnum.EXPENSE);
		journalLineItem1.setReferenceId(expense.getExpenseId());
		journalLineItem1.setExchangeRate(exchangeRate);
		journalLineItem1.setCreatedBy(userId);
		journalLineItem1.setJournal(journal);
		journalLineItemList.add(journalLineItem1);

		JournalLineItem journalLineItem2 = new JournalLineItem();
		journalLineItem2.setTransactionCategory(transaction.getBankAccount().getTransactionCategory());

		journalLineItem2.setCreditAmount(amount.multiply(transactionPresistModel.getExchangeRate()));
		journalLineItem2.setReferenceType(PostingReferenceTypeEnum.EXPENSE);
		journalLineItem2.setReferenceId(expense.getExpenseId());
		journalLineItem2.setExchangeRate(exchangeRate);
		journalLineItem2.setCreatedBy(transaction.getCreatedBy());
		journalLineItem2.setJournal(journal);

		if (transactionPresistModel.getVatId()!=null) {
			VatCategory vatCategory = vatCategoryService.findByPK(transactionPresistModel.getVatId());
			BigDecimal vatPercent =  vatCategory.getVat();
			BigDecimal vatAmount = calculateActualVatAmount(vatPercent,amount);
			BigDecimal actualDebitAmount = BigDecimal.valueOf(amount.floatValue()-vatAmount.floatValue());
			journalLineItem1.setDebitAmount(actualDebitAmount.multiply(transaction.getExchangeRate()));
			JournalLineItem journalLineItem = new JournalLineItem();
			TransactionCategory inputVatCategory = transactionCategoryService
					.findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.INPUT_VAT.getCode());
			journalLineItem.setTransactionCategory(inputVatCategory);
			journalLineItem.setDebitAmount(vatAmount);
			journalLineItem.setReferenceType(PostingReferenceTypeEnum.EXPENSE);
			journalLineItem.setReferenceId(expense.getExpenseId());
			journalLineItem.setExchangeRate(exchangeRate);
			journalLineItem.setCreatedBy(userId);
			journalLineItem.setJournal(journal);
			journalLineItemList.add(journalLineItem);
		}
		journalLineItemList.add(journalLineItem2);
		journal.setJournalLineItems(journalLineItemList);
		journal.setCreatedBy(transaction.getCreatedBy());
		journal.setPostingReferenceType(PostingReferenceTypeEnum.EXPENSE);
		journal.setJournalDate(LocalDate.now());
		journal.setTransactionDate(transaction.getTransactionDate().toLocalDate());
		return journal;
	}
	private BigDecimal calculateActualVatAmount(BigDecimal vatPercent, BigDecimal expenseAmount) {
		float vatPercentFloat = vatPercent.floatValue()+100;
		float expenseAmountFloat = expenseAmount.floatValue()/vatPercentFloat * 100;
		return BigDecimal.valueOf(expenseAmount.floatValue()-expenseAmountFloat);
	}
	public Journal invoiceReconsile(ChartOfAccountCategoryIdEnumConstant ChartOfAccountCategoryIdEnumConstant,
			Integer userId, Transaction transaction,TransactionCategory bankTransactionCategory ) {
		List<JournalLineItem> journalLineItemList = new ArrayList<>();

		Journal journal = new Journal();
		BigDecimal totalAmount = transaction.getTransactionAmount();
		// Considered invoice belongs to single type
		boolean isCustomerInvoice = false;

		isCustomerInvoice = ChartOfAccountCategoryIdEnumConstant.equals(ChartOfAccountCategoryIdEnumConstant.SALES);

		JournalLineItem journalLineItem1 = new JournalLineItem();
		TransactionCategory transactionCategory = transactionCategoryService
				.findTransactionCategoryByTransactionCategoryCode(
						isCustomerInvoice ? TransactionCategoryCodeEnum.ACCOUNT_RECEIVABLE.getCode()
								: TransactionCategoryCodeEnum.ACCOUNT_PAYABLE.getCode());
		journalLineItem1.setTransactionCategory(transactionCategory);
		// Reverse flow as invoice creation
		if (!isCustomerInvoice)
			journalLineItem1.setDebitAmount(transaction.getTransactionAmount());
		else
			journalLineItem1.setCreditAmount(transaction.getTransactionAmount());

		journalLineItem1.setReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE_INVOICE);
		journalLineItem1.setReferenceId(transaction.getTransactionId());
		journalLineItem1.setCreatedBy(userId);
		journalLineItem1.setJournal(journal);
		journalLineItemList.add(journalLineItem1);

		JournalLineItem journalLineItem2 = new JournalLineItem();
		journalLineItem2.setTransactionCategory(bankTransactionCategory);
		if (isCustomerInvoice)
			journalLineItem2.setDebitAmount(totalAmount);
		else
			journalLineItem2.setCreditAmount(totalAmount);
		journalLineItem2.setReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE_INVOICE);
		journalLineItem2.setReferenceId(transaction.getTransactionId());
		journalLineItem2.setCreatedBy(userId);
		journalLineItem2.setJournal(journal);
		journalLineItemList.add(journalLineItem2);
		journal.setJournalLineItems(journalLineItemList);

		journal.setCreatedBy(userId);
		journal.setPostingReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE_INVOICE);
		journal.setJournalDate(LocalDate.now());
		journal.setTransactionDate(transaction.getTransactionDate().toLocalDate());
		return journal;
	}
	//Todo
	public Journal invoiceReconsile(Integer userId, Transaction transaction,boolean isCustomerInvoice ) {
		List<JournalLineItem> journalLineItemList = new ArrayList<>();
		Journal journal = new Journal();
		BigDecimal totalAmount = transaction.getTransactionAmount();

		JournalLineItem journalLineItem1 = new JournalLineItem();
		TransactionCategory transactionCategory = transactionCategoryService
				.findTransactionCategoryByTransactionCategoryCode(
						isCustomerInvoice ? TransactionCategoryCodeEnum.ACCOUNT_RECEIVABLE.getCode()
								: TransactionCategoryCodeEnum.ACCOUNT_PAYABLE.getCode());
		journalLineItem1.setTransactionCategory(transactionCategory);
		// Reverse flow as invoice creation
		if (!isCustomerInvoice)
			journalLineItem1.setDebitAmount(transaction.getTransactionAmount().multiply(transaction.getExchangeRate()));
		else
			journalLineItem1.setCreditAmount(transaction.getTransactionAmount().multiply(transaction.getExchangeRate()));

		journalLineItem1.setReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE_INVOICE);
		journalLineItem1.setReferenceId(transaction.getTransactionId());
		journalLineItem1.setCreatedBy(userId);
		journalLineItem1.setJournal(journal);
		journalLineItemList.add(journalLineItem1);

		JournalLineItem journalLineItem2 = new JournalLineItem();
		journalLineItem2.setTransactionCategory(transaction.getBankAccount().getTransactionCategory());
		if (isCustomerInvoice)
			journalLineItem2.setDebitAmount(totalAmount.multiply(transaction.getExchangeRate()));
		else
			journalLineItem2.setCreditAmount(totalAmount.multiply(transaction.getExchangeRate()));
		journalLineItem2.setReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE_INVOICE);
		journalLineItem2.setReferenceId(transaction.getTransactionId());
		journalLineItem2.setCreatedBy(userId);
		journalLineItem2.setJournal(journal);
		journalLineItemList.add(journalLineItem2);
		journal.setJournalLineItems(journalLineItemList);

		journal.setCreatedBy(userId);
		journal.setPostingReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE_INVOICE);
		journal.setJournalDate(LocalDate.now());
		journal.setTransactionDate(transaction.getTransactionDate().toLocalDate());
		return journal;
	}

	public List<ReconcileStatusListModel> getModelList(Object reconcileStatusList) {

		List<ReconcileStatusListModel> reconcileStatusModelList = new ArrayList<>();
		for (ReconcileStatus reconcileStatus : (List<ReconcileStatus>) reconcileStatusList) {
			ReconcileStatusListModel reconcileStatusListModel = new ReconcileStatusListModel();
			reconcileStatusListModel.setReconcileId(reconcileStatus.getReconcileId());

			SimpleDateFormat simpleDateFormat = new SimpleDateFormat(DATE_FORMAT_DD_MM_YYYY);
			ZoneId timeZone = ZoneId.systemDefault();
			Date date = Date.from(reconcileStatus.getReconciledDate().toLocalDate().atStartOfDay(timeZone).toInstant());
			String reconcileDate = simpleDateFormat.format(date);
			reconcileStatusListModel.setReconciledDate(reconcileDate);
			LocalDateTime bankOpeningDate=bankAccountService.findByPK(reconcileStatus.getBankAccount().getBankAccountId()).getOpeningDate();
			reconcileStatusListModel.setClosingBalance(reconcileStatus.getClosingBalance());
			date = Date.from(bankOpeningDate.toLocalDate().atStartOfDay(timeZone).toInstant());
			String openingDate = simpleDateFormat.format(date);
			date = Date.from(reconcileStatus.getReconciledDate().toLocalDate().atStartOfDay(timeZone).toInstant());
			String reconsileDate = simpleDateFormat.format(date);
			reconcileStatusListModel.setReconciledDuration(openingDate+ " - "+reconsileDate);

			reconcileStatusModelList.add(reconcileStatusListModel);
		}
		return reconcileStatusModelList;
}

	public LocalDateTime getDateFromRequest(ReconcilationPersistModel reconcilationPersistModel) {
		SimpleDateFormat dateFormat = new SimpleDateFormat(DATE_FORMAT_DD_MM_YYYY);
		LocalDateTime dateTime = null;
		try {
			dateTime = Instant.ofEpochMilli(dateFormat.parse(reconcilationPersistModel.getDate()).getTime())
					.atZone(ZoneId.systemDefault()).toLocalDateTime();
			return dateTime;
		} catch (ParseException e) {
			logger.error(ERROR, e);
		}
		return null;
	}

	public ReconcileStatus getReconcileStatus(@ModelAttribute ReconcilationPersistModel reconcilationPersistModel) {
		ReconcileStatus status = null;
		if (reconcilationPersistModel.getDate() != null && reconcilationPersistModel.getBankId()!=null) {

			SimpleDateFormat dateFormat = new SimpleDateFormat(DATE_FORMAT_DD_MM_YYYY);
			LocalDateTime dateTime = null;
			try {
				dateTime = Instant.ofEpochMilli(dateFormat.parse(reconcilationPersistModel.getDate()).getTime())
						.atZone(ZoneId.systemDefault()).toLocalDateTime();
			} catch (ParseException e) {
				logger.error(ERROR, e);
			}
			status = reconcileStatusService.getAllReconcileStatusByBankAccountId(reconcilationPersistModel.getBankId(),dateTime);
		}
		return status;
	}

}
