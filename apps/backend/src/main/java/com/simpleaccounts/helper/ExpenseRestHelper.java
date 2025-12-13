/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.helper;

import com.simpleaccounts.constant.*;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class ExpenseRestHelper {

	private final Logger logger = LoggerFactory.getLogger(ExpenseRestHelper.class);

	private final VatCategoryService vatCategoryService;

	private final CurrencyService currencyService;

	private final ProjectService projectService;

	private final ExpenseService expenseService;

	private final EmployeeService employeeService;

	private final TransactionCategoryService transactionCategoryService;

	private final BankAccountService bankAccountService;

	private final FileHelper fileHelper;

	private final CustomizeInvoiceTemplateService customizeInvoiceTemplateService;

	private final InvoiceNumberUtil invoiceNumberUtil;

	private final TaxTreatmentService taxTreatmentService;

	private final PlaceOfSupplyService placeOfSupplyService;

	private final TransactionService transactionService;

	private final TransactionExpensesService transactionExpensesService;

	private final ChartOfAccountCategoryService chartOfAccountCategoryService;

	private final DateFormatHelper dateFormatHelper;

	private final TransactionExplanationRepository transactionExplanationRepository;

	public Expense getExpenseEntity(ExpenseModel model) {
		Expense expense = initializeExpense(model);
		updateInvoiceTemplateIfNeeded(model, expense);
		setTaxAndSupplyInfo(expense, model);

		Expense.ExpenseBuilder expenseBuilder = expense.toBuilder();
		setBasicExpenseFields(expenseBuilder, model, expense);
		setOptionalExpenseFields(expenseBuilder, model);
		setVatCategoryFields(expenseBuilder, model);
		setPaymentFields(expenseBuilder, model);

		return expenseBuilder.build();
	}

	private Expense initializeExpense(ExpenseModel model) {
		Expense expense = new Expense();
		expense.setStatus(ExpenseStatusEnum.DRAFT.getValue());
		if (model.getExpenseId() != null) {
			expense = expenseService.findByPK(model.getExpenseId());
		}
		return expense;
	}

	private void updateInvoiceTemplateIfNeeded(ExpenseModel model, Expense expense) {
		CustomizeInvoiceTemplate template = customizeInvoiceTemplateService.getInvoiceTemplate(10);
		expense.setExpenseNumber(model.getExpenseNumber());
		if (model.getExpenseNumber() != null) {
			String suffix = invoiceNumberUtil.fetchSuffixFromString(model.getExpenseNumber());
			template.setSuffix(Integer.parseInt(suffix));
			String prefix = expense.getExpenseNumber().substring(0, expense.getExpenseNumber().lastIndexOf(suffix));
			template.setPrefix(prefix);
			customizeInvoiceTemplateService.persist(template);
		}
	}

	private void setTaxAndSupplyInfo(Expense expense, ExpenseModel model) {
		if (model.getTaxTreatmentId() != null) {
			expense.setTaxTreatment(taxTreatmentService.getTaxTreatment(model.getTaxTreatmentId()));
		}
		if (model.getPlaceOfSupplyId() != null) {
			expense.setPlaceOfSupplyId(placeOfSupplyService.findByPK(model.getPlaceOfSupplyId()));
		}
		expense.setIsReverseChargeEnabled(model.getIsReverseChargeEnabled());
		expense.setExpenseType(model.getExpenseType());
		expense.setVatClaimable(model.getIsVatClaimable());
	}

	private void setBasicExpenseFields(Expense.ExpenseBuilder expenseBuilder, ExpenseModel model, Expense expense) {
		if (model.getPayee() != null && !model.getPayee().isEmpty() && !model.getPayee().equalsIgnoreCase("undefined")) {
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
	}

	private void setOptionalExpenseFields(Expense.ExpenseBuilder expenseBuilder, ExpenseModel model) {
		if (model.getCurrencyCode() != null) {
			expenseBuilder.currency(currencyService.findByPK(model.getCurrencyCode()));
		}
		if (model.getExpenseVatAmount() != null) {
			expenseBuilder.expenseVatAmount(model.getExpenseVatAmount());
		}
		if (model.getExchangeRate() != null) {
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
	}

	private void setVatCategoryFields(Expense.ExpenseBuilder expenseBuilder, ExpenseModel model) {
		if (model.getVatCategoryId() != null) {
			VatCategory vatCategory = vatCategoryService.findByPK(model.getVatCategoryId());
			expenseBuilder.vatCategory(vatCategory);
			BigDecimal vatPercent = vatCategory.getVat();
			BigDecimal vatAmount = Boolean.TRUE.equals(model.getExclusiveVat())
					? calculateVatAmount(vatPercent, model.getExpenseAmount())
					: calculateActualVatAmount(vatPercent, model.getExpenseAmount());
			expenseBuilder.expenseVatAmount(vatAmount);
		}
	}

	private void setPaymentFields(Expense.ExpenseBuilder expenseBuilder, ExpenseModel model) {
		if (model.getPayMode() != null) {
			expenseBuilder.payMode(model.getPayMode());
		}
		if (model.getBankAccountId() != null) {
			expenseBuilder.bankAccount(bankAccountService.findByPK(model.getBankAccountId()));
		}
		if (model.getDelivaryNotes() != null) {
			expenseBuilder.notes(model.getDelivaryNotes());
		}
	}
	@Transactional(rollbackFor = Exception.class)
	public Journal expensePosting(PostingRequestModel postingRequestModel, Integer userId) {
		List<JournalLineItem> journalLineItemList = new ArrayList<>();
		Journal journal = new Journal();
		Expense expense = expenseService.findByPK(postingRequestModel.getPostingRefId());

		JournalLineItem creditLineItem = createCreditLineItem(postingRequestModel, expense, userId, journal);
		journalLineItemList.add(creditLineItem);

		JournalLineItem debitLineItem = createDebitLineItem(postingRequestModel, expense, userId, journal);
		journalLineItemList.add(debitLineItem);

		addVatLineItems(journalLineItemList, expense, postingRequestModel, debitLineItem, userId, journal);

		configureJournal(journal, journalLineItemList, expense, userId);
		return journal;
	}

	private JournalLineItem createCreditLineItem(PostingRequestModel postingRequestModel, Expense expense,
			Integer userId, Journal journal) {
		JournalLineItem journalLineItem = new JournalLineItem();
		setTransactionCategoryForExpense(journalLineItem, expense, postingRequestModel, userId);
		journalLineItem.setCreditAmount(calculateCreditAmount(expense, postingRequestModel));
		setCommonLineItemFields(journalLineItem, PostingReferenceTypeEnum.EXPENSE, postingRequestModel.getPostingRefId(),
				expense.getExchangeRate(), userId, journal);
		return journalLineItem;
	}

	private BigDecimal calculateCreditAmount(Expense expense, PostingRequestModel postingRequestModel) {
		BigDecimal amount = postingRequestModel.getAmount();
		if (Boolean.FALSE.equals(expense.getIsReverseChargeEnabled()) && Boolean.TRUE.equals(expense.getExclusiveVat())) {
			amount = amount.add(expense.getExpenseVatAmount());
		} else if (Boolean.TRUE.equals(expense.getIsReverseChargeEnabled()) && Boolean.FALSE.equals(expense.getExclusiveVat())) {
			amount = amount.subtract(expense.getExpenseVatAmount());
		}
		return amount.multiply(expense.getExchangeRate());
	}

	private JournalLineItem createDebitLineItem(PostingRequestModel postingRequestModel, Expense expense,
			Integer userId, Journal journal) {
		JournalLineItem journalLineItem = new JournalLineItem();
		TransactionCategory saleTransactionCategory = transactionCategoryService.findByPK(postingRequestModel.getPostingChartOfAccountId());
		journalLineItem.setTransactionCategory(saleTransactionCategory);
		setCommonLineItemFields(journalLineItem, PostingReferenceTypeEnum.EXPENSE, postingRequestModel.getPostingRefId(),
				expense.getExchangeRate(), userId, journal);
		return journalLineItem;
	}

	private void setCommonLineItemFields(JournalLineItem lineItem, PostingReferenceTypeEnum refType,
			Integer refId, BigDecimal exchangeRate, Integer userId, Journal journal) {
		lineItem.setReferenceType(refType);
		lineItem.setReferenceId(refId);
		lineItem.setExchangeRate(exchangeRate);
		lineItem.setCreatedBy(userId);
		lineItem.setJournal(journal);
	}

	private void addVatLineItems(List<JournalLineItem> journalLineItemList, Expense expense,
			PostingRequestModel postingRequestModel, JournalLineItem debitLineItem, Integer userId, Journal journal) {
		if (expense.getVatCategory() == null) {
			debitLineItem.setDebitAmount(postingRequestModel.getAmount().multiply(expense.getExchangeRate()));
			return;
		}

		setDebitAmountForVatExpense(debitLineItem, expense, postingRequestModel);
		journalLineItemList.add(createInputVatLineItem(expense, postingRequestModel, userId, journal));

		if (Boolean.TRUE.equals(expense.getIsReverseChargeEnabled())) {
			journalLineItemList.add(createReverseChargeLineItem(expense, postingRequestModel, userId, journal));
		}
	}

	private void setDebitAmountForVatExpense(JournalLineItem debitLineItem, Expense expense, PostingRequestModel postingRequestModel) {
		if (Boolean.FALSE.equals(expense.getExclusiveVat()) && Boolean.FALSE.equals(expense.getIsReverseChargeEnabled())) {
			BigDecimal actualDebitAmount = postingRequestModel.getAmount().subtract(expense.getExpenseVatAmount());
			debitLineItem.setDebitAmount(actualDebitAmount.multiply(expense.getExchangeRate()));
		} else {
			debitLineItem.setDebitAmount(postingRequestModel.getAmount().multiply(expense.getExchangeRate()));
		}
	}

	private JournalLineItem createInputVatLineItem(Expense expense, PostingRequestModel postingRequestModel,
			Integer userId, Journal journal) {
		JournalLineItem journalLineItem = new JournalLineItem();
		TransactionCategory inputVatCategory = transactionCategoryService
				.findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.INPUT_VAT.getCode());
		journalLineItem.setTransactionCategory(inputVatCategory);
		journalLineItem.setDebitAmount(expense.getExpenseVatAmount().multiply(expense.getExchangeRate()));
		setCommonLineItemFields(journalLineItem, PostingReferenceTypeEnum.EXPENSE, postingRequestModel.getPostingRefId(),
				expense.getExchangeRate(), userId, journal);
		return journalLineItem;
	}

	private JournalLineItem createReverseChargeLineItem(Expense expense, PostingRequestModel postingRequestModel,
			Integer userId, Journal journal) {
		JournalLineItem reverseChargeLineItem = new JournalLineItem();
		TransactionCategory outputVatCategory = transactionCategoryService
				.findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.OUTPUT_VAT.getCode());
		reverseChargeLineItem.setTransactionCategory(outputVatCategory);
		reverseChargeLineItem.setCreditAmount(expense.getExpenseVatAmount().multiply(expense.getExchangeRate()));
		setCommonLineItemFields(reverseChargeLineItem, PostingReferenceTypeEnum.EXPENSE, postingRequestModel.getPostingRefId(),
				expense.getExchangeRate(), userId, journal);
		return reverseChargeLineItem;
	}

	private void configureJournal(Journal journal, List<JournalLineItem> journalLineItemList, Expense expense, Integer userId) {
		journal.setJournalLineItems(journalLineItemList);
		journal.setCreatedBy(userId);
		journal.setPostingReferenceType(PostingReferenceTypeEnum.EXPENSE);
		journal.setJournlReferencenNo(expense.getExpenseNumber());
		journal.setJournalDate(expense.getExpenseDate());
		journal.setTransactionDate(expense.getExpenseDate());
		journal.setDescription(getJournalDescription(expense));
	}

	private String getJournalDescription(Expense expense) {
		if (expense.getBankAccount() != null || expense.getPayMode() == PayMode.CASH) {
			return CommonColumnConstants.COMPANY_EXPENSE;
		}
		TransactionCategory transactionCategory = transactionCategoryService.findByPK(Integer.parseInt(expense.getPayee()));
		return transactionCategory.getTransactionCategoryName();
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
			setBasicExpenseModelFields(expenseModel, entity);
			setCurrencyFields(expenseModel, entity);
			setFileAttachmentFields(expenseModel, entity);
			setAmountAndStatusFields(expenseModel, entity);
			setPayeeField(expenseModel, entity);
			setDateAndDescriptionFields(expenseModel, entity);
			setProjectAndEmployeeFields(expenseModel, entity);
			setCategoryAndVatFields(expenseModel, entity);
			setAdditionalExpenseModelFields(expenseModel, entity);
			return expenseModel;
		} catch (Exception e) {
			logger.error("Error = ", e);
		}
		return null;
	}

	private void setBasicExpenseModelFields(ExpenseModel expenseModel, Expense entity) {
		expenseModel.setExpenseId(entity.getExpenseId());
		expenseModel.setCreatedBy(entity.getCreatedBy());
		expenseModel.setDelivaryNotes(entity.getNotes());
		expenseModel.setCreatedDate(entity.getCreatedDate());
		if (entity.getExpenseNumber() != null) {
			expenseModel.setExpenseNumber(entity.getExpenseNumber());
		}
		expenseModel.setIsVatClaimable(entity.getVatClaimable());
	}

	private void setCurrencyFields(ExpenseModel expenseModel, Expense entity) {
		if (entity.getCurrency() != null) {
			expenseModel.setCurrencyCode(entity.getCurrency().getCurrencyCode());
			expenseModel.setCurrencyName(entity.getCurrency().getCurrencyIsoCode());
			expenseModel.setCurrencySymbol(entity.getCurrency().getCurrencySymbol());
		}
	}

	private void setFileAttachmentFields(ExpenseModel expenseModel, Expense entity) {
		if (entity.getReceiptAttachmentFileName() != null) {
			expenseModel.setFileName(entity.getFileAttachment().getFileName());
			expenseModel.setFileAttachmentId(entity.getFileAttachment().getId());
		}
	}

	private void setAmountAndStatusFields(ExpenseModel expenseModel, Expense entity) {
		expenseModel.setExchangeRate(entity.getExchangeRate());
		expenseModel.setDeleteFlag(entity.getDeleteFlag());
		expenseModel.setExpenseAmount(entity.getExpenseAmount());
		expenseModel.setExpenseVatAmount(entity.getExpenseVatAmount());
		expenseModel.setExpenseStatus(ExpenseStatusEnum.getExpenseStatusByValue(entity.getStatus()));
	}

	private void setPayeeField(ExpenseModel expenseModel, Expense entity) {
		if (entity.getBankAccount() != null) {
			expenseModel.setPayee(CommonColumnConstants.COMPANY_EXPENSE);
		} else if (entity.getPayMode() == PayMode.CASH && entity.getPayee().equals(CommonColumnConstants.COMPANY_EXPENSE)) {
			expenseModel.setPayee(CommonColumnConstants.COMPANY_EXPENSE);
		} else {
			TransactionCategory transactionCategory = transactionCategoryService.findByPK(Integer.parseInt(entity.getPayee()));
			expenseModel.setPayee(transactionCategory.getTransactionCategoryName());
		}
	}

	private void setDateAndDescriptionFields(ExpenseModel expenseModel, Expense entity) {
		if (entity.getExpenseDate() != null) {
			ZoneId timeZone = ZoneId.systemDefault();
			Date date = Date.from(entity.getExpenseDate().atStartOfDay(timeZone).toInstant());
			expenseModel.setExpenseDate(date);
		}
		expenseModel.setExpenseDescription(entity.getExpenseDescription());
		expenseModel.setLastUpdateDate(entity.getLastUpdateDate());
		expenseModel.setLastUpdatedBy(entity.getLastUpdateBy());
		expenseModel.setReceiptAttachmentDescription(entity.getReceiptAttachmentDescription());
		expenseModel.setReceiptNumber(entity.getReceiptNumber());
		expenseModel.setVersionNumber(entity.getVersionNumber());
		if (entity.getReceiptAttachmentPath() != null) {
			expenseModel.setReceiptAttachmentPath("/file/" + fileHelper.convertFilePthToUrl(entity.getReceiptAttachmentPath()));
		}
	}

	private void setProjectAndEmployeeFields(ExpenseModel expenseModel, Expense entity) {
		if (entity.getProject() != null) {
			expenseModel.setProjectId(entity.getProject().getProjectId());
		}
		if (entity.getEmployee() != null) {
			expenseModel.setEmployeeId(entity.getEmployee().getId());
		}
	}

	private void setCategoryAndVatFields(ExpenseModel expenseModel, Expense entity) {
		if (entity.getTransactionCategory() != null) {
			expenseModel.setExpenseCategory(entity.getTransactionCategory().getTransactionCategoryId());
			expenseModel.setTransactionCategoryName(entity.getTransactionCategory().getTransactionCategoryName());
		}
		if (entity.getVatCategory() != null) {
			expenseModel.setVatCategoryId(entity.getVatCategory().getId());
			expenseModel.setVatCategoryName(entity.getVatCategory().getName());
		}
		expenseModel.setPayMode(entity.getPayMode());
		if (entity.getBankAccount() != null) {
			expenseModel.setBankAccountId(entity.getBankAccount().getBankAccountId());
		}
	}

	private void setAdditionalExpenseModelFields(ExpenseModel expenseModel, Expense entity) {
		if (entity.getExclusiveVat() != null) {
			expenseModel.setExclusiveVat(entity.getExclusiveVat());
		}
		if (entity.getExpenseType() != null) {
			expenseModel.setExpenseType(entity.getExpenseType());
		}
		if (entity.getIsReverseChargeEnabled() != null) {
			expenseModel.setIsReverseChargeEnabled(entity.getIsReverseChargeEnabled());
		}
		if (entity.getPlaceOfSupplyId() != null) {
			expenseModel.setPlaceOfSupplyId(entity.getPlaceOfSupplyId().getId());
			expenseModel.setPlaceOfSupplyName(entity.getPlaceOfSupplyId().getPlaceOfSupply());
		}
		if (entity.getTaxTreatment() != null) {
			expenseModel.setTaxTreatmentId(entity.getTaxTreatment().getId());
		}
	}

	public List<ExpenseListModel> getExpenseList(Object expenseList, User user) {
		if (expenseList == null) {
			return new ArrayList<>();
		}

		List<ExpenseListModel> expenseDtoList = new ArrayList<>();
		for (Expense expense : (List<Expense>) expenseList) {
			expenseDtoList.add(createExpenseListModel(expense, user));
		}
		return expenseDtoList;
	}

	private ExpenseListModel createExpenseListModel(Expense expense, User user) {
		ExpenseListModel expenseModel = new ExpenseListModel();
		setBasicListModelFields(expenseModel, expense);
		setPayeeForListModel(expenseModel, expense);
		setCurrencyForListModel(expenseModel, expense);
		setDateAndCategoryForListModel(expenseModel, expense);
		setAmountsForListModel(expenseModel, expense, user);
		return expenseModel;
	}

	private void setBasicListModelFields(ExpenseListModel expenseModel, Expense expense) {
		expenseModel.setReceiptNumber(expense.getReceiptNumber());
		expenseModel.setExpenseId(expense.getExpenseId());
		expenseModel.setBankGenerated(expense.getBankGenerated());
		expenseModel.setExpenseDescription(expense.getExpenseDescription());
		expenseModel.setEditFlag(expense.getEditFlag());
		if (expense.getBankAccount() != null) {
			expenseModel.setBankAccountId(expense.getBankAccount().getBankAccountId());
		}
	}

	private void setPayeeForListModel(ExpenseListModel expenseModel, Expense expense) {
		if (expense.getPayee() != null) {
			if (expense.getPayee().equalsIgnoreCase(CommonColumnConstants.COMPANY_EXPENSE)) {
				expenseModel.setPayee(CommonColumnConstants.COMPANY_EXPENSE);
			} else {
				TransactionCategory payeeTransactionCategory = transactionCategoryService.findByPK(Integer.parseInt(expense.getPayee()));
				expenseModel.setPayee(payeeTransactionCategory.getTransactionCategoryName());
			}
		}
	}

	private void setCurrencyForListModel(ExpenseListModel expenseModel, Expense expense) {
		expenseModel.setCurrencyName(expense.getCurrency() != null ? expense.getCurrency().getCurrencyIsoCode() : "-");
		if (expense.getCurrency() != null) {
			expenseModel.setCurrencySymbol(expense.getCurrency().getCurrencySymbol());
		}
	}

	private void setDateAndCategoryForListModel(ExpenseListModel expenseModel, Expense expense) {
		if (expense.getExpenseDate() != null) {
			ZoneId timeZone = ZoneId.systemDefault();
			Date date = Date.from(expense.getExpenseDate().atStartOfDay(timeZone).toInstant());
			expenseModel.setExpenseDate(date);
		}
		if (expense.getTransactionCategory() != null && expense.getTransactionCategory().getTransactionCategoryName() != null) {
			expenseModel.setTransactionCategoryName(expense.getTransactionCategory().getTransactionCategoryName());
			expenseModel.setChartOfAccountId(expense.getTransactionCategory().getTransactionCategoryId());
		}
	}

	private void setAmountsForListModel(ExpenseListModel expenseModel, Expense expense, User user) {
		Company company = user.getCompany();
		if (expense.getCurrency() != company.getCurrencyCode()) {
			expenseModel.setBaseCurrencyAmount(expense.getExpenseAmount().add(expense.getExpenseVatAmount()).multiply(expense.getExchangeRate()));
		}
		expenseModel.setExclusiveVat(expense.getExclusiveVat());
		if (expense.getExpenseType() != null) {
			expenseModel.setExpenseType(expense.getExpenseType());
		}
		expenseModel.setExpenseAmount(expense.getExpenseAmount());
		expenseModel.setExpenseVatAmount(expense.getExpenseVatAmount());
		expenseModel.setExpenseStatus(ExpenseStatusEnum.getExpenseStatusByValue(expense.getStatus()));
		if (expense.getExpenseNumber() != null) {
			expenseModel.setExpenseNumber(expense.getExpenseNumber());
		}
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

	@Transactional(rollbackFor = Exception.class)
	public Journal reverseExpensePosting(PostingRequestModel postingRequestModel, Integer userId) {
		List<JournalLineItem> journalLineItemList = new ArrayList<>();
		Journal journal = new Journal();
		Expense expense = expenseService.findByPK(postingRequestModel.getPostingRefId());

		JournalLineItem debitLineItem = createReverseDebitLineItem(postingRequestModel, expense, userId, journal);
		journalLineItemList.add(debitLineItem);

		JournalLineItem creditLineItem = createReverseCreditLineItem(postingRequestModel, expense, userId, journal);
		journalLineItemList.add(creditLineItem);

		addReverseVatLineItems(journalLineItemList, expense, postingRequestModel, debitLineItem, creditLineItem, userId, journal);

		configureReverseJournal(journal, journalLineItemList, expense, userId);
		return journal;
	}

	private JournalLineItem createReverseDebitLineItem(PostingRequestModel postingRequestModel, Expense expense,
			Integer userId, Journal journal) {
		JournalLineItem journalLineItem = new JournalLineItem();
		setReverseTransactionCategory(journalLineItem, expense);
		journalLineItem.setDebitAmount(postingRequestModel.getAmount().multiply(expense.getExchangeRate()));
		setCommonLineItemFields(journalLineItem, PostingReferenceTypeEnum.REVERSE_EXPENSE, postingRequestModel.getPostingRefId(),
				expense.getExchangeRate(), userId, journal);
		return journalLineItem;
	}

	private void setReverseTransactionCategory(JournalLineItem journalLineItem, Expense expense) {
		if (expense.getPayMode() == null) {
			TransactionCategory transactionCategory = transactionCategoryService.findByPK(Integer.parseInt(expense.getPayee()));
			journalLineItem.setTransactionCategory(transactionCategory);
			return;
		}
		switch (expense.getPayMode()) {
			case BANK:
				journalLineItem.setTransactionCategory(expense.getBankAccount().getTransactionCategory());
				break;
			case CASH:
				TransactionCategory transactionCategory = transactionCategoryService
						.findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.PETTY_CASH.getCode());
				journalLineItem.setTransactionCategory(transactionCategory);
				break;
			default:
				transactionCategory = transactionCategoryService.findTransactionCategoryByTransactionCategoryCode(expense.getPayee());
				journalLineItem.setTransactionCategory(transactionCategory);
				break;
		}
	}

	private JournalLineItem createReverseCreditLineItem(PostingRequestModel postingRequestModel, Expense expense,
			Integer userId, Journal journal) {
		JournalLineItem journalLineItem = new JournalLineItem();
		TransactionCategory saleTransactionCategory = transactionCategoryService.findByPK(postingRequestModel.getPostingChartOfAccountId());
		journalLineItem.setTransactionCategory(saleTransactionCategory);
		journalLineItem.setCreditAmount(postingRequestModel.getAmount().multiply(expense.getExchangeRate()));
		setCommonLineItemFields(journalLineItem, PostingReferenceTypeEnum.REVERSE_EXPENSE, postingRequestModel.getPostingRefId(),
				expense.getExchangeRate(), userId, journal);
		return journalLineItem;
	}

	private void addReverseVatLineItems(List<JournalLineItem> journalLineItemList, Expense expense,
			PostingRequestModel postingRequestModel, JournalLineItem debitLineItem, JournalLineItem creditLineItem,
			Integer userId, Journal journal) {
		if (expense.getVatCategory() == null) {
			return;
		}

		BigDecimal vatAmount = expense.getExpenseVatAmount();
		adjustReverseDebitCreditAmounts(expense, vatAmount, debitLineItem, creditLineItem);
		journalLineItemList.add(createReverseInputVatLineItem(expense, postingRequestModel, vatAmount, userId, journal));

		if (Boolean.TRUE.equals(expense.getIsReverseChargeEnabled())) {
			journalLineItemList.add(createReverseOutputVatLineItem(expense, postingRequestModel, vatAmount, userId, journal));
		}
	}

	private void adjustReverseDebitCreditAmounts(Expense expense, BigDecimal vatAmount,
			JournalLineItem debitLineItem, JournalLineItem creditLineItem) {
		BigDecimal actualDebitAmount;
		if (Boolean.TRUE.equals(expense.getIsReverseChargeEnabled())) {
			actualDebitAmount = BigDecimal.valueOf(expense.getExpenseAmount().floatValue());
			debitLineItem.setDebitAmount(actualDebitAmount.multiply(expense.getExchangeRate()));
		} else if (Boolean.TRUE.equals(expense.getExclusiveVat())) {
			actualDebitAmount = BigDecimal.valueOf(expense.getExpenseAmount().floatValue() + vatAmount.floatValue());
			debitLineItem.setDebitAmount(actualDebitAmount.multiply(expense.getExchangeRate()));
		} else {
			actualDebitAmount = BigDecimal.valueOf(expense.getExpenseAmount().floatValue() - vatAmount.floatValue());
			creditLineItem.setCreditAmount(actualDebitAmount.multiply(expense.getExchangeRate()));
		}
	}

	private JournalLineItem createReverseInputVatLineItem(Expense expense, PostingRequestModel postingRequestModel,
			BigDecimal vatAmount, Integer userId, Journal journal) {
		JournalLineItem journalLineItem = new JournalLineItem();
		TransactionCategory inputVatCategory = transactionCategoryService
				.findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.INPUT_VAT.getCode());
		journalLineItem.setTransactionCategory(inputVatCategory);
		journalLineItem.setCreditAmount(vatAmount.multiply(expense.getExchangeRate()));
		setCommonLineItemFields(journalLineItem, PostingReferenceTypeEnum.REVERSE_EXPENSE, postingRequestModel.getPostingRefId(),
				expense.getExchangeRate(), userId, journal);
		return journalLineItem;
	}

	private JournalLineItem createReverseOutputVatLineItem(Expense expense, PostingRequestModel postingRequestModel,
			BigDecimal vatAmount, Integer userId, Journal journal) {
		JournalLineItem reverseChargeLineItem = new JournalLineItem();
		TransactionCategory outputVatCategory = transactionCategoryService
				.findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.OUTPUT_VAT.getCode());
		reverseChargeLineItem.setTransactionCategory(outputVatCategory);
		reverseChargeLineItem.setDebitAmount(vatAmount.multiply(expense.getExchangeRate()));
		setCommonLineItemFields(reverseChargeLineItem, PostingReferenceTypeEnum.REVERSE_EXPENSE, postingRequestModel.getPostingRefId(),
				expense.getExchangeRate(), userId, journal);
		return reverseChargeLineItem;
	}

	private void configureReverseJournal(Journal journal, List<JournalLineItem> journalLineItemList, Expense expense, Integer userId) {
		journal.setJournalLineItems(journalLineItemList);
		journal.setCreatedBy(userId);
		journal.setPostingReferenceType(PostingReferenceTypeEnum.REVERSE_EXPENSE);
		journal.setJournalDate(expense.getExpenseDate());
		journal.setTransactionDate(expense.getExpenseDate());
		journal.setDescription(CommonColumnConstants.REVERSAL_JOURNAL_EXPENSE_PREFIX + expense.getExpenseNumber());
	}

	private void setTransactionCategoryForExpense(JournalLineItem journalLineItem, Expense expense,
			PostingRequestModel postingRequestModel, Integer userId) {
		if (expense.getPayMode() == null) {
			TransactionCategory transactionCategory = transactionCategoryService.findByPK(Integer.parseInt(expense.getPayee()));
			journalLineItem.setTransactionCategory(transactionCategory);
			return;
		}
		switch (expense.getPayMode()) {
			case BANK:
				journalLineItem.setTransactionCategory(expense.getBankAccount().getTransactionCategory());
				break;
			case CASH:
				TransactionCategory transactionCategory = transactionCategoryService
						.findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.PETTY_CASH.getCode());
				journalLineItem.setTransactionCategory(transactionCategory);
				processCashExpenseTransaction(expense, transactionCategory, postingRequestModel, userId);
				break;
			default:
				transactionCategory = transactionCategoryService.findTransactionCategoryByTransactionCategoryCode(expense.getPayee());
				journalLineItem.setTransactionCategory(transactionCategory);
				break;
		}
	}

	private void processCashExpenseTransaction(Expense expense, TransactionCategory transactionCategory,
			PostingRequestModel postingRequestModel, Integer userId) {
		Map<String, Object> param = new HashMap<>();
		if (transactionCategory != null) {
			param.put("transactionCategory", transactionCategory);
		}
		param.put("deleteFlag", false);
		List<BankAccount> bankAccountList = bankAccountService.findByAttributes(param);
		BankAccount bankAccount = bankAccountList != null && !bankAccountList.isEmpty() ? bankAccountList.get(0) : null;

		Transaction transaction = createCashTransaction(expense, bankAccount, postingRequestModel);
		transactionService.persist(transaction);
		if (bankAccount != null) {
			updateBankAccountBalance(bankAccount, transaction.getTransactionAmount());
		}
		createTransactionExpenses(transaction, expense, userId);
		createTransactionExplanation(transaction, userId);
	}

	private Transaction createCashTransaction(Expense expense, BankAccount bankAccount, PostingRequestModel postingRequestModel) {
		Transaction transaction = new Transaction();
		transaction.setCreatedBy(expense.getCreatedBy());
		transaction.setTransactionDate(expense.getExpenseDate().atStartOfDay());
		transaction.setBankAccount(bankAccount);
		transaction.setTransactionAmount(calculateCashTransactionAmount(expense));
		transaction.setTransactionExplinationStatusEnum(TransactionExplinationStatusEnum.FULL);
		transaction.setTransactionDescription("Manual Transaction Created Against Expense No:-" + expense.getExpenseNumber());
		transaction.setDebitCreditFlag('D');
		transaction.setVatCategory(expense.getVatCategory());
		transaction.setExchangeRate(expense.getExchangeRate());
		transaction.setTransactionDueAmount(BigDecimal.ZERO);
		transaction.setCoaCategory(chartOfAccountCategoryService.findByPK(10));
		transaction.setExplainedTransactionCategory(transactionCategoryService.findByPK(postingRequestModel.getPostingChartOfAccountId()));
		return transaction;
	}

	private BigDecimal calculateCashTransactionAmount(Expense expense) {
		if (Boolean.TRUE.equals(expense.getIsReverseChargeEnabled())) {
			return expense.getExpenseAmount();
		}
		if (Boolean.TRUE.equals(expense.getExclusiveVat()) && expense.getExpenseVatAmount() != null) {
			BigDecimal transactionExpenseAmount = expense.getExpenseAmount().add(expense.getExpenseVatAmount());
			return transactionExpenseAmount.multiply(expense.getExchangeRate());
		}
		return expense.getExpenseAmount().multiply(expense.getExchangeRate());
	}

	private void updateBankAccountBalance(BankAccount bankAccount, BigDecimal amount) {
		BigDecimal currentBalance = bankAccount.getCurrentBalance();
		if (currentBalance == null) {
			currentBalance = BigDecimal.ZERO;
		}
		if (amount != null) {
			currentBalance = currentBalance.subtract(amount);
		}
		bankAccount.setCurrentBalance(currentBalance);
		bankAccountService.update(bankAccount);
	}

	private void createTransactionExpenses(Transaction transaction, Expense expense, Integer userId) {
		TransactionExpenses status = new TransactionExpenses();
		status.setCreatedBy(userId);
		status.setExplinationStatus(TransactionExplinationStatusEnum.FULL);
		status.setRemainingToExplain(BigDecimal.ZERO);
		status.setTransaction(transaction);
		status.setExpense(expense);
		transactionExpensesService.persist(status);
	}

	private void createTransactionExplanation(Transaction transaction, Integer userId) {
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

}
