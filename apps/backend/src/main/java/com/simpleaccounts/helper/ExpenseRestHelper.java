/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.helper;

import com.simpleaccounts.constant.*;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.repository.TransactionExplanationRepository;
import com.simpleaccounts.rest.InviceSingleLevelDropdownModel;
import com.simpleaccounts.rest.PostingRequestModel;
import com.simpleaccounts.rest.customizeinvoiceprefixsuffixccontroller.CustomizeInvoiceTemplateService;
import com.simpleaccounts.rest.expensescontroller.ExpenseListModel;
import com.simpleaccounts.rest.expensescontroller.ExpenseModel;
import com.simpleaccounts.service.*;
import com.simpleaccounts.service.bankaccount.TransactionService;
import com.simpleaccounts.utils.FileHelper;
import com.simpleaccounts.utils.InvoiceNumberUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.time.LocalDate;

/**
 *
 * @author daynil
 */
@Component
public class ExpenseRestHelper {

	private final Logger logger = LoggerFactory.getLogger(ExpenseRestHelper.class);

	@Autowired
	private VatCategoryService vatCategoryService;

	@Autowired
	private CurrencyService currencyService;

	@Autowired
	private ProjectService projectService;

	@Autowired
	private ExpenseService expenseService;

	@Autowired
	private EmployeeService employeeService;

	@Autowired
	private TransactionCategoryService transactionCategoryService;

	@Autowired
	private BankAccountService bankAccountService;

	@Autowired
	private FileHelper fileHelper;

	@Autowired
	private CustomizeInvoiceTemplateService customizeInvoiceTemplateService;

	@Autowired
	private InvoiceNumberUtil invoiceNumberUtil;

	@Autowired
	private TaxTreatmentService taxTreatmentService;

	@Autowired
	private PlaceOfSupplyService placeOfSupplyService;

	@Autowired
	private TransactionService transactionService;

	@Autowired
	private TransactionExpensesService transactionExpensesService;

	@Autowired
	private ChartOfAccountCategoryService chartOfAccountCategoryService;

	@Autowired
	private DateFormatHelper dateFormatHelper;

	@Autowired
	private TransactionExplanationRepository transactionExplanationRepository;

	public Expense getExpenseEntity(ExpenseModel model) {
		Expense expense = new Expense();
		expense.setStatus(ExpenseStatusEnum.DRAFT.getValue());
		if (model.getExpenseId() != null) {
			expense = expenseService.findByPK(model.getExpenseId());
		}
		CustomizeInvoiceTemplate template = customizeInvoiceTemplateService.getInvoiceTemplate(10);
		expense.setExpenseNumber(model.getExpenseNumber());
		if (model.getExpenseNumber()!=null  ) {
			String suffix = invoiceNumberUtil.fetchSuffixFromString(model.getExpenseNumber());
			template.setSuffix(Integer.parseInt(suffix));
			String prefix = expense.getExpenseNumber().substring(0, expense.getExpenseNumber().lastIndexOf(suffix));
			template.setPrefix(prefix);
			customizeInvoiceTemplateService.persist(template);
		}
		if (model.getTaxTreatmentId()!=null){
			expense.setTaxTreatment(taxTreatmentService.getTaxTreatment(model.getTaxTreatmentId()));
		}
		if (model.getPlaceOfSupplyId()!=null){
			expense.setPlaceOfSupplyId(placeOfSupplyService.findByPK(model.getPlaceOfSupplyId()));
		}
		expense.setIsReverseChargeEnabled(model.getIsReverseChargeEnabled());
		expense.setExpenseType(model.getExpenseType());
		expense.setVatClaimable(model.getIsVatClaimable());

		Expense.ExpenseBuilder expenseBuilder = expense.toBuilder();
		if (model.getPayee() != null && !model.getPayee().isEmpty() && !model.getPayee().equalsIgnoreCase("undefined") ) {
			expenseBuilder.payee(model.getPayee());
		}
		expense.setExclusiveVat(model.getExclusiveVat());
		expenseBuilder.expenseAmount(model.getExpenseAmount());
		if (model.getExpenseDate() != null) {
			LocalDate date = dateFormatHelper.convertToLocalDateViaSqlDate(model.getExpenseDate());
			expenseBuilder.expenseDate(date);
		}
		expenseBuilder.bankGenerated(Boolean.FALSE);
		expenseBuilder.expenseDescription(model.getExpenseDescription())
				.receiptAttachmentDescription(model.getReceiptAttachmentDescription())
				.receiptNumber(model.getReceiptNumber());
		if (model.getCurrencyCode() != null) {
			expenseBuilder.currency(currencyService.findByPK(model.getCurrencyCode()));
		}
		if (model.getExpenseVatAmount() != null) {
			expenseBuilder.expenseVatAmount(model.getExpenseVatAmount());
		}
		if (model.getExchangeRate()!=null){
			expenseBuilder.exchangeRate(model.getExchangeRate());
		}
		if (model.getProjectId() != null) {
			expenseBuilder.project(projectService.findByPK(model.getProjectId()));
		}
		if (model.getEmployeeId() != null) {
			expenseBuilder.employee(employeeService.findByPK(model.getEmployeeId()));
		}
		if (model.getExpenseCategory() != null) {
			expenseBuilder.transactionCategory(transactionCategoryService.findByPK(model.getExpenseCategory()));
		}
		if (model.getVatCategoryId() != null) {
			VatCategory vatCategory = vatCategoryService.findByPK(model.getVatCategoryId());
			expenseBuilder.vatCategory(vatCategory);
			BigDecimal vatPercent =  vatCategory.getVat();
			BigDecimal vatAmount = BigDecimal.ZERO;
			if (Boolean.TRUE.equals(model.getExclusiveVat())){
				vatAmount = calculateVatAmount(vatPercent,model.getExpenseAmount());
			}
			else {
				vatAmount = calculateActualVatAmount(vatPercent,model.getExpenseAmount());
			}
			expenseBuilder.expenseVatAmount(vatAmount);
		}
		if(model.getPayMode()!=null){
			expenseBuilder.payMode(model.getPayMode());
		}
		if (model.getBankAccountId() != null) {
			expenseBuilder.bankAccount(bankAccountService.findByPK(model.getBankAccountId()));
		}
		if(model.getDelivaryNotes()!=null)
			expenseBuilder.notes(model.getDelivaryNotes());

		return expenseBuilder.build();
	}
	//Todo
	@Transactional(rollbackFor = Exception.class)
	public Journal expensePosting(PostingRequestModel postingRequestModel, Integer userId)
	{
		List<JournalLineItem> journalLineItemList = new ArrayList<>();
		Journal journal = new Journal();
		JournalLineItem journalLineItem1 = new JournalLineItem();
		Expense expense = expenseService.findByPK(postingRequestModel.getPostingRefId());
		if(expense.getPayMode()!=null) {
			switch (expense.getPayMode()) {
				case BANK:
					TransactionCategory transactionCategory = expense.getBankAccount().getTransactionCategory();
					journalLineItem1.setTransactionCategory(transactionCategory);
					break;
				case CASH:
					transactionCategory = transactionCategoryService
							.findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.PETTY_CASH.getCode());
					journalLineItem1.setTransactionCategory(transactionCategory);

					if (expense.getPayMode()== PayMode.CASH){
						Map<String, Object> param = new HashMap<>();
						if (transactionCategory!=null)
							param.put("transactionCategory", transactionCategory);
						param.put("deleteFlag", false);
						List<BankAccount> bankAccountList = bankAccountService.findByAttributes(param);
						BankAccount bankAccount = bankAccountList != null && !bankAccountList.isEmpty()
								? bankAccountList.get(0)
								: null;

						Transaction transaction = new Transaction();

						transaction.setCreatedBy(expense.getCreatedBy());
						transaction.setTransactionDate(expense.getExpenseDate().atStartOfDay());
						transaction.setBankAccount(bankAccount);
						if(expense.getIsReverseChargeEnabled().equals(Boolean.TRUE)){
							transaction.setTransactionAmount(expense.getExpenseAmount());
						}
						else if (expense.getExclusiveVat().equals(Boolean.TRUE)){
							if(expense.getExpenseVatAmount()!=null){
								BigDecimal transactionExpenseAmount = expense.getExpenseAmount().add(expense.getExpenseVatAmount());
								transaction.setTransactionAmount(transactionExpenseAmount.multiply(expense.getExchangeRate()));
							}
						}
						else {
							transaction.setTransactionAmount(expense.getExpenseAmount().multiply(expense.getExchangeRate()));
						}
						transaction.setTransactionExplinationStatusEnum(TransactionExplinationStatusEnum.FULL);
						transaction.setTransactionDescription(expense.getExpenseDescription());
						transaction.setDebitCreditFlag('D');
						transaction.setVatCategory(expense.getVatCategory());
						transaction.setExchangeRate(expense.getExchangeRate());
						transaction.setTransactionDueAmount(BigDecimal.ZERO);
						transaction.setTransactionDescription("Manual Transaction Created Against Expense No:-"+expense.getExpenseNumber());
						transaction.setCoaCategory(chartOfAccountCategoryService.findByPK(10));
						transaction.setExplainedTransactionCategory(transactionCategoryService
								.findByPK(postingRequestModel.getPostingChartOfAccountId()));
						transactionService.persist(transaction);
						BigDecimal currentBalance = bankAccount.getCurrentBalance();
						currentBalance = currentBalance.subtract(transaction.getTransactionAmount());
						bankAccount.setCurrentBalance(currentBalance);
						bankAccountService.update(bankAccount);
						TransactionExpenses status = new TransactionExpenses();
						status.setCreatedBy(userId);
						status.setExplinationStatus(TransactionExplinationStatusEnum.FULL);
						status.setRemainingToExplain(BigDecimal.ZERO);
						status.setTransaction(transaction);
						status.setExpense(expense);
						transactionExpensesService.persist(status);

						TransactionExplanation transactionExplanation = new TransactionExplanation();
						transactionExplanation.setCreatedBy(userId);
						transactionExplanation.setCreatedDate(LocalDateTime.now());
						transactionExplanation.setTransaction(transaction);
						transactionExplanation.setPaidAmount(transaction.getTransactionAmount());
						transactionExplanation.setCurrentBalance(transaction.getCurrentBalance());
						transactionExplanation.setExplainedTransactionCategory(transaction.getExplainedTransactionCategory());
						transactionExplanation.setCoaCategory(chartOfAccountCategoryService.findByPK(ChartOfAccountCategoryIdEnumConstant.EXPENSE.getId()));
						transactionExplanationRepository.save(transactionExplanation);
					}
					break;
				default:
					transactionCategory=transactionCategoryService.findTransactionCategoryByTransactionCategoryCode(expense.getPayee());
					journalLineItem1.setTransactionCategory(transactionCategory);
					break;
			}
		}
		else
		{
			TransactionCategory	transactionCategory=transactionCategoryService.findByPK(Integer.parseInt(expense.getPayee()));
			journalLineItem1.setTransactionCategory(transactionCategory);
		}
		if (expense.getIsReverseChargeEnabled().equals(Boolean.FALSE) && expense.getExclusiveVat().equals(Boolean.TRUE)){
			BigDecimal amount = postingRequestModel.getAmount().add(expense.getExpenseVatAmount());
			journalLineItem1.setCreditAmount( amount.multiply(expense.getExchangeRate()));
		} else if (expense.getIsReverseChargeEnabled().equals(Boolean.TRUE) && expense.getExclusiveVat().equals(Boolean.FALSE)) {
			BigDecimal amount = postingRequestModel.getAmount().subtract(expense.getExpenseVatAmount());
			journalLineItem1.setCreditAmount( amount.multiply(expense.getExchangeRate()));
		} else {
			journalLineItem1.setCreditAmount(postingRequestModel.getAmount().multiply(expense.getExchangeRate()));
		}
		journalLineItem1.setReferenceType(PostingReferenceTypeEnum.EXPENSE);
		journalLineItem1.setReferenceId(postingRequestModel.getPostingRefId());
		journalLineItem1.setExchangeRate(expense.getExchangeRate());
		journalLineItem1.setCreatedBy(userId);
		journalLineItem1.setJournal(journal);
		journalLineItemList.add(journalLineItem1);

		JournalLineItem journalLineItem2 = new JournalLineItem();
		TransactionCategory saleTransactionCategory = transactionCategoryService
				.findByPK(postingRequestModel.getPostingChartOfAccountId());
		journalLineItem2.setTransactionCategory(saleTransactionCategory);
		journalLineItem2.setReferenceType(PostingReferenceTypeEnum.EXPENSE);
		journalLineItem2.setReferenceId(postingRequestModel.getPostingRefId());
		journalLineItem2.setExchangeRate(expense.getExchangeRate());
		journalLineItem2.setCreatedBy(userId);
		journalLineItem2.setJournal(journal);
		journalLineItemList.add(journalLineItem2);
		if (expense.getVatCategory()!=null) {
			BigDecimal vatAmount = expense.getExpenseVatAmount();
			BigDecimal actualDebitAmount=BigDecimal.ZERO;
            if (expense.getExclusiveVat().equals(Boolean.FALSE && expense.getIsReverseChargeEnabled().equals(Boolean.FALSE))){
				actualDebitAmount = postingRequestModel.getAmount().subtract(expense.getExpenseVatAmount());
				journalLineItem2.setDebitAmount(actualDebitAmount.multiply(expense.getExchangeRate()));
			}
			else {
				journalLineItem2.setDebitAmount(postingRequestModel.getAmount().multiply(expense.getExchangeRate()));
			}
			JournalLineItem journalLineItem = new JournalLineItem();
			TransactionCategory inputVatCategory = transactionCategoryService
					.findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.INPUT_VAT.getCode());
			journalLineItem.setTransactionCategory(inputVatCategory);
			journalLineItem.setDebitAmount(vatAmount.multiply(expense.getExchangeRate()));
			journalLineItem.setReferenceType(PostingReferenceTypeEnum.EXPENSE);
			journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
			journalLineItem.setExchangeRate(expense.getExchangeRate());
			journalLineItem.setCreatedBy(userId);
			journalLineItem.setJournal(journal);
			journalLineItemList.add(journalLineItem);
			//Reverse Charge Enabled JLi
			if(expense.getIsReverseChargeEnabled().equals(Boolean.TRUE)){
				JournalLineItem reverseChargejournalLineItem = new JournalLineItem();
				TransactionCategory outputVatCategory = transactionCategoryService
						.findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.OUTPUT_VAT.getCode());
				reverseChargejournalLineItem.setTransactionCategory(outputVatCategory);
				reverseChargejournalLineItem.setCreditAmount(vatAmount.multiply(expense.getExchangeRate()));
				reverseChargejournalLineItem.setReferenceType(PostingReferenceTypeEnum.EXPENSE);
				reverseChargejournalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
				reverseChargejournalLineItem.setExchangeRate(expense.getExchangeRate());
				reverseChargejournalLineItem.setCreatedBy(userId);
				reverseChargejournalLineItem.setJournal(journal);
				journalLineItemList.add(reverseChargejournalLineItem);
			}
		}
		else {
			journalLineItem2.setDebitAmount(postingRequestModel.getAmount().multiply(expense.getExchangeRate()));
		}

		journal.setJournalLineItems(journalLineItemList);
		journal.setCreatedBy(userId);
		journal.setPostingReferenceType(PostingReferenceTypeEnum.EXPENSE);
		journal.setJournlReferencenNo(expense.getExpenseNumber());
		journal.setJournalDate(expense.getExpenseDate());
		journal.setTransactionDate(expense.getExpenseDate());
		if (expense.getBankAccount()!=null){
			journal.setDescription("Company Expense");
		}
		else {
			if(expense.getPayMode() == PayMode.CASH) {
				journal.setDescription("Company Expense");
			}else {
				TransactionCategory transactionCategory = transactionCategoryService.findByPK(Integer.parseInt(expense.getPayee()));
				journal.setDescription(transactionCategory.getTransactionCategoryName());
			}
		}
		return journal;
	}

	private BigDecimal calculateActualVatAmount(BigDecimal vatPercent, BigDecimal expenseAmount) {
		float vatPercentFloat = vatPercent.floatValue();
		float expenseAmountFloat = expenseAmount.floatValue()*vatPercentFloat /(100+vatPercentFloat);
		return BigDecimal.valueOf(expenseAmountFloat);
	}

	public Boolean doesInvoiceNumberExist(String referenceNumber){
		Map<String, Object> attribute = new HashMap<String, Object>();
		attribute.put("expenseNumber", referenceNumber);
		attribute.put("deleteFlag",false);
		List<Expense> expenseList = expenseService.findByAttributes(attribute);
		return !expenseList.isEmpty();
	}

	public BigDecimal calculateVatAmount(BigDecimal vatPercent, BigDecimal expenseAmount) {
		float vatPercentFloat = vatPercent.floatValue();
		return BigDecimal.valueOf(expenseAmount.floatValue() * (vatPercentFloat/100));
	}
	public ExpenseModel getExpenseModel(Expense entity) {
		try {
			ExpenseModel expenseModel = new ExpenseModel();
			expenseModel.setExpenseId(entity.getExpenseId());
			expenseModel.setCreatedBy(entity.getCreatedBy());
			expenseModel.setDelivaryNotes(entity.getNotes());
			expenseModel.setCreatedDate(entity.getCreatedDate());
			if (entity.getExpenseNumber()!=null){
				expenseModel.setExpenseNumber(entity.getExpenseNumber());
			}
			expenseModel.setIsVatClaimable(entity.getVatClaimable());
			if (entity.getCurrency() != null) {
				expenseModel.setCurrencyCode(entity.getCurrency().getCurrencyCode());
				expenseModel.setCurrencyName(entity.getCurrency().getCurrencyIsoCode());
			}
			if (entity.getCurrency() != null) {
				expenseModel.setCurrencySymbol(entity.getCurrency().getCurrencySymbol());
			}
			if (entity.getReceiptAttachmentFileName() != null) {
				expenseModel.setFileName(entity.getFileAttachment().getFileName());
				expenseModel.setFileAttachmentId(entity.getFileAttachment().getId());

			}
			expenseModel.setExchangeRate(entity.getExchangeRate());
			expenseModel.setDeleteFlag(entity.getDeleteFlag());
			expenseModel.setExpenseAmount(entity.getExpenseAmount());
			expenseModel.setExpenseVatAmount(entity.getExpenseVatAmount());
			expenseModel.setExpenseStatus(ExpenseStatusEnum.getExpenseStatusByValue(entity.getStatus()));
			if (entity.getBankAccount()!=null){
				expenseModel.setPayee("Company Expense");
			}
			else if (entity.getPayMode() == PayMode.CASH && entity.getPayee().equals("Company Expense")){
					expenseModel.setPayee("Company Expense");
				}
		else {
					TransactionCategory transactionCategory = transactionCategoryService.findByPK(Integer.parseInt(entity.getPayee()));
					expenseModel.setPayee(transactionCategory.getTransactionCategoryName());
				}
			if (entity.getExpenseDate() != null) {
					ZoneId timeZone = ZoneId.systemDefault();
					Date date = Date.from(entity.getExpenseDate().atStartOfDay(timeZone).toInstant());
					expenseModel.setExpenseDate(date);
			}
			expenseModel.setExpenseDescription(entity.getExpenseDescription());
			expenseModel.setLastUpdateDate(entity.getLastUpdateDate());
			expenseModel.setLastUpdatedBy(entity.getLastUpdateBy());
			if (entity.getProject() != null) {
				expenseModel.setProjectId(entity.getProject().getProjectId());
			}
			if (entity.getEmployee() != null) {
				expenseModel.setEmployeeId(entity.getEmployee().getId());
			}
			expenseModel.setReceiptAttachmentDescription(entity.getReceiptAttachmentDescription());
			expenseModel.setReceiptNumber(entity.getReceiptNumber());
			if (entity.getTransactionCategory() != null) {
				expenseModel.setExpenseCategory(entity.getTransactionCategory().getTransactionCategoryId());
			}
			expenseModel.setVersionNumber(entity.getVersionNumber());
			if (entity.getReceiptAttachmentPath() != null) {
				expenseModel.setReceiptAttachmentPath(
						"/file/" + fileHelper.convertFilePthToUrl(entity.getReceiptAttachmentPath()));
			}

			if (entity.getVatCategory() != null) {
				expenseModel.setVatCategoryId(entity.getVatCategory().getId());
			}
			expenseModel.setPayMode(entity.getPayMode());

			if (entity.getBankAccount() != null) {
				expenseModel.setBankAccountId(entity.getBankAccount().getBankAccountId());
			}
			if (entity.getTransactionCategory() != null) {
				expenseModel.setTransactionCategoryName(entity.getTransactionCategory().getTransactionCategoryName());
			}
			if (entity.getVatCategory() != null) {
				expenseModel.setVatCategoryName(entity.getVatCategory().getName());
			}
			if (entity.getExclusiveVat() != null) {
				expenseModel.setExclusiveVat(entity.getExclusiveVat());
			}
			if (entity.getExpenseType() != null) {
				expenseModel.setExpenseType(entity.getExpenseType());
			}
			if (entity.getIsReverseChargeEnabled() != null) {
				expenseModel.setIsReverseChargeEnabled(entity.getIsReverseChargeEnabled());
			}
			if (entity.getPlaceOfSupplyId()!= null) {
				expenseModel.setPlaceOfSupplyId(entity.getPlaceOfSupplyId().getId());
				expenseModel.setPlaceOfSupplyName(entity.getPlaceOfSupplyId().getPlaceOfSupply());
			}
			if (entity.getTaxTreatment()!= null) {
				expenseModel.setTaxTreatmentId(entity.getTaxTreatment().getId());
			}

			return expenseModel;
		} catch (Exception e) {
			logger.error("Error = ", e);
		}
		return null;
	}

	public List<ExpenseListModel> getExpenseList(Object expenseList, User user) {

		if (expenseList != null) {

			List<ExpenseListModel> expenseDtoList = new ArrayList<>();

			for (Expense expense : (List<Expense>) expenseList) {

				ExpenseListModel expenseModel = new ExpenseListModel();
				expenseModel.setReceiptNumber(expense.getReceiptNumber());
				expenseModel.setExpenseId(expense.getExpenseId());
				expenseModel.setBankGenerated(expense.getBankGenerated());
				if (expense.getPayee()!=null){
					if(expense.getPayee() != null && expense.getPayee().equalsIgnoreCase("Company Expense")){
						expenseModel.setPayee("Company Expense");
					}
					else {
						TransactionCategory payeeTransactionCategory=transactionCategoryService.findByPK(Integer.parseInt(expense.getPayee()));
						expenseModel.setPayee(payeeTransactionCategory.getTransactionCategoryName());
					}
				}
				expenseModel.setCurrencyName(
						expense.getCurrency() != null ? expense.getCurrency().getCurrencyIsoCode() : "-");
				expenseModel.setExpenseDescription(expense.getExpenseDescription());
				if (expense.getBankAccount()!=null){
					expenseModel.setBankAccountId(expense.getBankAccount().getBankAccountId());
				}
				if (expense.getExpenseDate() != null) {
					ZoneId timeZone = ZoneId.systemDefault();
					Date date = Date.from(expense.getExpenseDate().atStartOfDay(timeZone).toInstant());
					expenseModel.setExpenseDate(date);
				}
				if (expense.getTransactionCategory() != null
						&& expense.getTransactionCategory().getTransactionCategoryName() != null) {
					expenseModel
							.setTransactionCategoryName(expense.getTransactionCategory().getTransactionCategoryName());
					expenseModel.setChartOfAccountId(expense.getTransactionCategory().getTransactionCategoryId());
				}
				Company company = user.getCompany();
				if (expense.getCurrency() != company.getCurrencyCode()) {
					expenseModel.setBaseCurrencyAmount(expense.getExpenseAmount().add(expense.getExpenseVatAmount()).multiply(expense.getExchangeRate()));
				}
				expenseModel.setExclusiveVat(expense.getExclusiveVat());
				if(expense.getExpenseType()!=null){
					expenseModel.setExpenseType(expense.getExpenseType());
				}
				expenseModel.setExpenseAmount(expense.getExpenseAmount());
				expenseModel.setExpenseVatAmount(expense.getExpenseVatAmount());
				expenseModel.setExpenseStatus(ExpenseStatusEnum.getExpenseStatusByValue(expense.getStatus()));
				if (expense.getCurrency()!=null) {
					expenseModel.setCurrencySymbol(expense.getCurrency().getCurrencySymbol());
				}
				if(expense.getExpenseNumber()!=null){
					expenseModel.setExpenseNumber(expense.getExpenseNumber());
				}
				expenseModel.setEditFlag(expense.getEditFlag());
				expenseDtoList.add(expenseModel);
			}
			return expenseDtoList;
		}
		return new ArrayList<>();

	}

	public List<InviceSingleLevelDropdownModel> getDropDoenModelList(List<Expense> expenseList) {

		if (expenseList != null && !expenseList.isEmpty()) {
			List<InviceSingleLevelDropdownModel> modelList = new ArrayList<>();
			for (Expense expense : expenseList) {
				InviceSingleLevelDropdownModel model = new InviceSingleLevelDropdownModel(expense.getExpenseId(),
						" (" + expense.getExpenseAmount() + " " + expense.getCurrency().getCurrencyName() + ")",
						expense.getExpenseAmount(), PostingReferenceTypeEnum.EXPENSE,expense.getCurrency().getCurrencyCode(),expense.getExpenseDate().toString(),expense.getExpenseAmount(),expense.getExpenseNumber());
				modelList.add(model);
			}
			return modelList;
		}

		return new ArrayList<>();

	}

	//Reverse Expense Journal Entires
	//Todo
	@Transactional(rollbackFor = Exception.class)
	public Journal reverseExpensePosting(PostingRequestModel postingRequestModel, Integer userId)
	{
		List<JournalLineItem> journalLineItemList = new ArrayList<>();
		Journal journal = new Journal();
		JournalLineItem journalLineItem1 = new JournalLineItem();
		Expense expense = expenseService.findByPK(postingRequestModel.getPostingRefId());
		if(expense.getPayMode()!=null) {
			switch (expense.getPayMode()) {
				case BANK:
					TransactionCategory transactionCategory = expense.getBankAccount().getTransactionCategory();
					journalLineItem1.setTransactionCategory(transactionCategory);
					break;
				case CASH:
					transactionCategory = transactionCategoryService
							.findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.PETTY_CASH.getCode());
					journalLineItem1.setTransactionCategory(transactionCategory);
					break;
				default:
					transactionCategory=transactionCategoryService.findTransactionCategoryByTransactionCategoryCode(expense.getPayee());
					journalLineItem1.setTransactionCategory(transactionCategory);
					break;
			}
		}
		else
		{
			TransactionCategory	transactionCategory=transactionCategoryService.findByPK(Integer.parseInt(expense.getPayee()));
			journalLineItem1.setTransactionCategory(transactionCategory);
		}

			journalLineItem1.setDebitAmount(postingRequestModel.getAmount().multiply(expense.getExchangeRate()));

		journalLineItem1.setReferenceType(PostingReferenceTypeEnum.REVERSE_EXPENSE);
		journalLineItem1.setReferenceId(postingRequestModel.getPostingRefId());
		journalLineItem1.setExchangeRate(expense.getExchangeRate());
		journalLineItem1.setCreatedBy(userId);
		journalLineItem1.setJournal(journal);
		journalLineItemList.add(journalLineItem1);

		JournalLineItem journalLineItem2 = new JournalLineItem();
		TransactionCategory saleTransactionCategory = transactionCategoryService
				.findByPK(postingRequestModel.getPostingChartOfAccountId());
		journalLineItem2.setTransactionCategory(saleTransactionCategory);
		journalLineItem2.setCreditAmount(postingRequestModel.getAmount().multiply(expense.getExchangeRate()));
		journalLineItem2.setReferenceType(PostingReferenceTypeEnum.REVERSE_EXPENSE);
		journalLineItem2.setReferenceId(postingRequestModel.getPostingRefId());
		journalLineItem2.setExchangeRate(expense.getExchangeRate());
		journalLineItem2.setCreatedBy(userId);
		journalLineItem2.setJournal(journal);
		journalLineItemList.add(journalLineItem2);
		if (expense.getVatCategory()!=null) {
			VatCategory vatCategory = expense.getVatCategory();
			BigDecimal vatAmount = expense.getExpenseVatAmount();
			BigDecimal actualDebitAmount=BigDecimal.ZERO;
			if(expense.getIsReverseChargeEnabled().equals(Boolean.TRUE)){
				actualDebitAmount = BigDecimal.valueOf(expense.getExpenseAmount().floatValue());
				journalLineItem1.setDebitAmount(actualDebitAmount.multiply(expense.getExchangeRate()));
			}
			else if(Boolean.TRUE.equals(expense.getExclusiveVat())){
				actualDebitAmount = BigDecimal.valueOf(expense.getExpenseAmount().floatValue()+vatAmount.floatValue());
				journalLineItem1.setDebitAmount(actualDebitAmount.multiply(expense.getExchangeRate()));
			}else
			{ actualDebitAmount = BigDecimal.valueOf(expense.getExpenseAmount().floatValue()-vatAmount.floatValue());
				journalLineItem2.setCreditAmount(actualDebitAmount.multiply(expense.getExchangeRate()));
			}
			JournalLineItem journalLineItem = new JournalLineItem();
			TransactionCategory inputVatCategory = transactionCategoryService
					.findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.INPUT_VAT.getCode());
			journalLineItem.setTransactionCategory(inputVatCategory);
			journalLineItem.setCreditAmount(vatAmount.multiply(expense.getExchangeRate()));
			journalLineItem.setReferenceType(PostingReferenceTypeEnum.REVERSE_EXPENSE);
			journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
			journalLineItem.setExchangeRate(expense.getExchangeRate());
			journalLineItem.setCreatedBy(userId);
			journalLineItem.setJournal(journal);
			journalLineItemList.add(journalLineItem);
			//Reverse Charge Enabled JLi
			if(expense.getIsReverseChargeEnabled().equals(Boolean.TRUE)){
				JournalLineItem reverseChargejournalLineItem = new JournalLineItem();
				TransactionCategory outputVatCategory = transactionCategoryService
						.findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.OUTPUT_VAT.getCode());
				reverseChargejournalLineItem.setTransactionCategory(outputVatCategory);
				reverseChargejournalLineItem.setDebitAmount(vatAmount.multiply(expense.getExchangeRate()));
				reverseChargejournalLineItem.setReferenceType(PostingReferenceTypeEnum.REVERSE_EXPENSE);
				reverseChargejournalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
				reverseChargejournalLineItem.setExchangeRate(expense.getExchangeRate());
				reverseChargejournalLineItem.setCreatedBy(userId);
				reverseChargejournalLineItem.setJournal(journal);
				journalLineItemList.add(reverseChargejournalLineItem);
			}
		}
		journal.setJournalLineItems(journalLineItemList);
		journal.setCreatedBy(userId);
		journal.setPostingReferenceType(PostingReferenceTypeEnum.REVERSE_EXPENSE);
		journal.setJournalDate(expense.getExpenseDate());
		journal.setTransactionDate(expense.getExpenseDate());
		journal.setTransactionDate(expense.getExpenseDate());
		journal.setDescription("Reversal of journal entry against Expense No:-"+expense.getExpenseNumber());
		if (expense.getBankAccount()!=null){
			journal.setDescription("Reversal of journal entry against Expense No:-"+expense.getExpenseNumber());
		}
		else {
			if(expense.getPayMode() == PayMode.CASH) {
				journal.setDescription("Reversal of journal entry against Expense No:-"+expense.getExpenseNumber());
			}else {
				journal.setDescription("Reversal of journal entry against Expense No:-"+expense.getExpenseNumber());
			}
		}
		return journal;
	}

}
