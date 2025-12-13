/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.helper;

import com.simpleaccounts.constant.*;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.model.ExplainedInvoiceListModel;
import com.simpleaccounts.repository.PayrollRepository;
import com.simpleaccounts.repository.TransactionExplanationLineItemRepository;
import com.simpleaccounts.repository.TransactionExplanationRepository;
import com.simpleaccounts.rest.CorporateTax.CorporateTaxModel;
import com.simpleaccounts.rest.CorporateTax.CorporateTaxPayment;
import com.simpleaccounts.rest.CorporateTax.Repositories.CorporateTaxPaymentRepository;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.ReconsileRequestLineItemModel;
import com.simpleaccounts.rest.creditnotecontroller.CreditNoteRepository;
import com.simpleaccounts.rest.financialreport.VatPaymentRepository;
import com.simpleaccounts.rest.transactioncontroller.TransactionPresistModel;
import com.simpleaccounts.rest.transactioncontroller.TransactionViewModel;
import com.simpleaccounts.rest.vatcontroller.VatReportResponseListForBank;
import com.simpleaccounts.service.*;
import com.simpleaccounts.service.bankaccount.TransactionStatusService;
import com.simpleaccounts.utils.DateFormatUtil;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 *
 * @author Uday
 */
@Service
@RequiredArgsConstructor
public class TransactionHelper {

	private static final String INVOICE_AMOUNT_LABEL = " ,Invoice Amount: ";
	private static final String DUE_AMOUNT_LABEL = ",Due Amount: ";
	private static final String INVOICE_DETAILS_PREFIX = " (";
	private static final String INVOICE_DETAILS_SUFFIX = ")";
	private static final String CONTACT_NAME_SEPARATOR = " (";
	private static final String CONTACT_NAME_SUFFIX = ")";

	private final DateFormatUtil dateUtil;

	private final TransactionStatusService transactionStatusService;

	private final ContactService contactService;

	private final TransactionCategoryService transactionCategoryService;

	private final TransactionExpensesService transactionExpensesService;

	private final InvoiceService invoiceService;

	private final CreditNoteInvoiceRelationService creditNoteService;

	private final ExpenseService expenseService;

	private final TransactionExpensesPayrollService transactionExpensesPayrollService;

	private final TransactionExplanationLineItemRepository transactionExplanationLineItemRepository;

	private final PayrollRepository payrollRepository;

	private final TransactionExplanationRepository transactionExplanationRepository;

	private final VatPaymentRepository vatPaymentRepository;

	private final CorporateTaxPaymentRepository corporateTaxPaymentRepository;
	private final CreditNoteRepository creditNoteRepository;

	public List<TransactionViewModel> getModelList(Object trasactionList) {

		List<TransactionViewModel> transactionModelList = new ArrayList<>();
		for (Transaction transaction : (List<Transaction>) trasactionList) {
			TransactionViewModel transactionModel = new TransactionViewModel();
			List<TransactionExplanation> transactionExplanations = transactionExplanationRepository.getTransactionExplanationsByTransaction(transaction);
			//Remove deleted records
			List<TransactionExplanation> sortedList = transactionExplanations.stream().filter(transactionExplanation ->
					transactionExplanation.getDeleteFlag()!=null && transactionExplanation.getDeleteFlag()!=Boolean.TRUE).collect(Collectors.toList());
			List<Integer> explanationIdsList = new ArrayList<>();
			for (TransactionExplanation transactionExplanation:sortedList){
				explanationIdsList.add(transactionExplanation.getId());
			}
			transactionModel.setExplanationIds(explanationIdsList);
			transactionModel.setId(transaction.getTransactionId());
			transactionModel.setTransactionDate(transaction.getTransactionDate() != null
					? String.valueOf(dateUtil.getLocalDateTimeAsString(transaction.getTransactionDate(), "dd-MM-yyyy"))
					: "-");
			transactionModel.setReferenceNo(transaction.getReceiptNumber());
			transactionModel.setRunningAmount(
					transaction.getCurrentBalance() != null ? transaction.getCurrentBalance().doubleValue() : 0.0);
			if (transaction.getTransactionDueAmount()!=null) {
				transactionModel.setDueAmount(transaction.getTransactionDueAmount());
			}
			debitcreditflag(transaction, transactionModel);
			transactionModel.setTransactionTypeName(
					transaction.getChartOfAccount() != null ? transaction.getChartOfAccount().getChartOfAccountName()
							: "-");
			transactionModel.setDebitCreditFlag(transaction.getDebitCreditFlag());
			if(transaction.getTransactionDescription() !=null) {
				transactionModel.setDescription(transaction.getTransactionDescription());
			}
			else
				if(transaction.getExplainedTransactionDescription()!=null) {
					transactionModel.setDescription(transaction.getExplainedTransactionDescription());
				}
			transactionModel.setExplinationStatusEnum(transaction.getTransactionExplinationStatusEnum());
			transactionModel.setCreationMode(transaction.getCreationMode());
			transactionModel.setCurrencySymbol(transaction.getBankAccount().getBankAccountCurrency().getCurrencySymbol());
			transactionModel.setCurrencyIsoCode(transaction.getBankAccount().getBankAccountCurrency().getCurrencyIsoCode());
			transactionModelList.add(transactionModel);
		}

		return transactionModelList;
	}

	private void debitcreditflag(Transaction transaction, TransactionViewModel transactionModel) {
		if (transaction.getDebitCreditFlag().equals('D')) {
			transactionModel.setWithdrawalAmount(
					transaction.getTransactionAmount() != null ? transaction.getTransactionAmount().doubleValue()
							: 0.0);
			transactionModel.setDepositeAmount(0.0);
		} else {
			transactionModel.setDepositeAmount(
					transaction.getTransactionAmount() != null ? transaction.getTransactionAmount().doubleValue()
							: 0.0);
			transactionModel.setWithdrawalAmount(0.0);
		}
	}

//

////				        && transaction.getExplainedTransactionCategory().getParentTransactionCategory().getTransactionCategoryName().equalsIgnoreCase("Salaries and Employee Wages")

//				//Expense

//			//Invoice

//
//
//

		public List<TransactionPresistModel> getModel(Transaction transaction, List<TransactionExplanation> explanationList) {
		List<TransactionPresistModel> transactionPresistModelList = new ArrayList<>();
		if (explanationList == null || explanationList.isEmpty()) {
			transactionPresistModelList.add(createBaseTransactionModel(transaction));
			return transactionPresistModelList;
		}

		for (TransactionExplanation transactionExplanation : explanationList) {
			addPartialModelIfNeeded(transactionPresistModelList, transaction);
			TransactionPresistModel model = buildTransactionModel(transaction, transactionExplanation);
			processExplanationData(model, transaction, transactionExplanation);
			transactionPresistModelList.add(model);
		}
		return transactionPresistModelList;
	}

	private void addPartialModelIfNeeded(List<TransactionPresistModel> list, Transaction transaction) {
		if (transaction.getTransactionExplinationStatusEnum().equals(TransactionExplinationStatusEnum.PARTIAL)) {
			list.add(createPartialTransactionModel(transaction));
		}
	}

	private TransactionPresistModel buildTransactionModel(Transaction transaction, TransactionExplanation transactionExplanation) {
		TransactionPresistModel model = new TransactionPresistModel();
		model.setExplanationId(transactionExplanation.getId());
		model.setBankId(transaction.getBankAccount().getBankAccountId());
		model.setTransactionId(transaction.getTransactionId());
		model.setDescription(transaction.getExplainedTransactionDescription());
		if (transaction.getExchangeRate() != null) {
			model.setExchangeRate(transaction.getExchangeRate());
		}
		setExplanationCategoryFields(model, transactionExplanation);
		setTransactionCategoryFields(model, transaction, transactionExplanation);
		setVatAndEmployeeFields(model, transactionExplanation);
		setAmountAndDateFields(model, transaction, transactionExplanation);
		return model;
	}

	private void setExplanationCategoryFields(TransactionPresistModel model, TransactionExplanation transactionExplanation) {
		if (transactionExplanation.getExplainedTransactionCategory() != null) {
			model.setExpenseCategory(transactionExplanation.getExplainedTransactionCategory().getTransactionCategoryId());
		}
		if (transactionExplanation.getExplanationUser() != null) {
			model.setEmployeeId(transactionExplanation.getExplanationUser());
		}
		if (transactionExplanation.getCoaCategory() != null) {
			model.setCoaCategoryId(transactionExplanation.getCoaCategory().getChartOfAccountCategoryId());
		}
	}

	private void setTransactionCategoryFields(TransactionPresistModel model, Transaction transaction, TransactionExplanation transactionExplanation) {
		if (transactionExplanation.getExplainedTransactionCategory() == null) {
			return;
		}
		if (isBankTransferTransaction(transactionExplanation, transaction)) {
			setBankTransferFields(model, transaction, transactionExplanation);
		} else {
			setStandardTransactionCategoryFields(model, transactionExplanation);
		}
	}

	private boolean isBankTransferTransaction(TransactionExplanation transactionExplanation, Transaction transaction) {
		return transactionExplanation.getExplainedTransactionCategory().getChartOfAccount()
				.getChartOfAccountCode().equalsIgnoreCase(ChartOfAccountCategoryCodeEnum.BANK.getCode())
				&& transaction.getExplainedTransactionDescription() != null
				&& transaction.getExplainedTransactionDescription().contains("=");
	}

	private void setBankTransferFields(TransactionPresistModel model, Transaction transaction, TransactionExplanation transactionExplanation) {
		model.setTransactionCategoryLabel(transactionExplanation.getExplainedTransactionCategory().getChartOfAccount().getChartOfAccountName());
		String description = transaction.getExplainedTransactionDescription();
		model.setTransactionCategoryId(Integer.parseInt(description.substring(description.indexOf("=") + 1)));
		description = description.substring(0, description.indexOf(":"));
		model.setDescription(description);
		model.setExpenseCategory(null);
	}

	private void setStandardTransactionCategoryFields(TransactionPresistModel model, TransactionExplanation transactionExplanation) {
		model.setTransactionCategoryLabel(transactionExplanation.getExplainedTransactionCategory().getChartOfAccount().getChartOfAccountName());
		TransactionCategory parentCategory = transactionExplanation.getExplainedTransactionCategory().getParentTransactionCategory();
		if (parentCategory != null && parentCategory.getTransactionCategoryId() != null) {
			model.setTransactionCategoryId(parentCategory.getTransactionCategoryId());
			model.setEmployeeId(transactionExplanation.getExplainedTransactionCategory().getTransactionCategoryId());
		} else {
			model.setTransactionCategoryId(transactionExplanation.getExplainedTransactionCategory().getTransactionCategoryId());
		}
	}

	private void setVatAndEmployeeFields(TransactionPresistModel model, TransactionExplanation transactionExplanation) {
		if (transactionExplanation.getVatCategory() != null) {
			model.setVatId(transactionExplanation.getVatCategory());
		}
		if (transactionExplanation.getExplanationEmployee() != null) {
			model.setEmployeeId(transactionExplanation.getExplanationEmployee());
		}
	}

	private void setAmountAndDateFields(TransactionPresistModel model, Transaction transaction, TransactionExplanation transactionExplanation) {
		model.setAmount(transactionExplanation.getPaidAmount());
		model.setDueAmount(transaction.getTransactionDueAmount());
		if (transaction.getTransactionDate() != null) {
			model.setDate1(transaction.getTransactionDate());
		}
		model.setReference(transaction.getReferenceStr());
	}

	private void processExplanationData(TransactionPresistModel model, Transaction transaction, TransactionExplanation transactionExplanation) {
		List<TransactionExplinationLineItem> explinationLineItemList = transactionExplanationLineItemRepository
				.getTransactionExplinationLineItemsByTransactionExplanation(transactionExplanation);

		processExpenseData(model, transaction);
		processPayrollData(model, explinationLineItemList);
		setVendorAndEmployeeFromExplanation(model, transactionExplanation);
		processInvoiceData(model, transactionExplanation, explinationLineItemList);
		processCreditNoteData(model, transactionExplanation, explinationLineItemList);
		processCorporateTaxPayment(model, transaction);
		processVatPayment(model, transaction);
		model.setExplinationStatusEnum(transaction.getTransactionExplinationStatusEnum());
	}

	private void processExpenseData(TransactionPresistModel model, Transaction transaction) {
		Map<String, Object> map = new HashMap<>();
		map.put("transaction", transaction);
		List<TransactionExpenses> expenseList = transactionExpensesService.findByAttributes(map);
		if (expenseList != null && !expenseList.isEmpty()) {
			TransactionExpenses transactionExpenses = expenseList.get(0);
			Expense expense = expenseService.findByPK(transactionExpenses.getExpense().getExpenseId());
			model.setExpenseType(expense.getExpenseType());
			if (expense.getVatCategory() != null) {
				model.setVatId(expense.getVatCategory().getId());
			}
			if (expense.getExclusiveVat() != null) {
				model.setExclusiveVat(expense.getExclusiveVat());
			}
			if (expense.getIsReverseChargeEnabled() != null) {
				model.setIsReverseChargeEnabled(expense.getIsReverseChargeEnabled());
			}
		}
	}

	private void processPayrollData(TransactionPresistModel model, List<TransactionExplinationLineItem> explinationLineItemList) {
		List<TransactionExplinationLineItem> payrollList = explinationLineItemList.stream()
				.filter(item -> item.getReferenceType().equals(PostingReferenceTypeEnum.PAYROLL_EXPLAINED))
				.collect(Collectors.toList());

		if (payrollList != null && !payrollList.isEmpty()) {
			List<DropdownModel> dropDownModelList = new ArrayList<>();
			for (TransactionExplinationLineItem explinationLineItem : payrollList) {
				Payroll payroll = payrollRepository.findById(explinationLineItem.getReferenceId());
				dropDownModelList.add(new DropdownModel(payroll.getId(), payroll.getPayrollSubject()));
			}
			model.setPayrollDropdownList(dropDownModelList);
		}
	}

	private void setVendorAndEmployeeFromExplanation(TransactionPresistModel model, TransactionExplanation transactionExplanation) {
		if (transactionExplanation.getExplanationEmployee() != null) {
			model.setVendorId(transactionExplanation.getExplanationEmployee());
			model.setEmployeeId(transactionExplanation.getExplanationEmployee());
		}
	}

	private void processInvoiceData(TransactionPresistModel model,
			TransactionExplanation transactionExplanation, List<TransactionExplinationLineItem> explinationLineItemList) {
		List<TransactionExplinationLineItem> invoiceList = explinationLineItemList.stream()
				.filter(item -> item.getReferenceType().equals(PostingReferenceTypeEnum.INVOICE)
						&& Boolean.FALSE.equals(item.getDeleteFlag()))
				.collect(Collectors.toList());

		if (invoiceList.isEmpty()) {
			return;
		}

		List<ReconsileRequestLineItemModel> explainParamList = new ArrayList<>();
		List<ExplainedInvoiceListModel> explainedInvoiceListModelList = new ArrayList<>();

		for (TransactionExplinationLineItem explinationLineItem : invoiceList) {
			Invoice invoice = invoiceService.findByPK(explinationLineItem.getReferenceId());
			processInvoiceLineItem(model, transactionExplanation, invoice, explinationLineItem,
					explainParamList, explainedInvoiceListModelList);
		}

		model.setExplainParamList(explainParamList);
		model.setExplainedInvoiceList(explainedInvoiceListModelList);
	}

	private void processInvoiceLineItem(TransactionPresistModel model, TransactionExplanation transactionExplanation,
			Invoice invoice, TransactionExplinationLineItem explinationLineItem,
			List<ReconsileRequestLineItemModel> explainParamList, List<ExplainedInvoiceListModel> explainedInvoiceListModelList) {
		if (transactionExplanation.getCoaCategory() == null) {
			return;
		}

		ReconsileRequestLineItemModel lineItemModel = new ReconsileRequestLineItemModel(
				invoice.getId(), invoice.getDueAmount(), PostingReferenceTypeEnum.INVOICE,
				INVOICE_DETAILS_PREFIX + invoice.getReferenceNumber() + INVOICE_AMOUNT_LABEL + invoice.getTotalAmount()
						+ DUE_AMOUNT_LABEL + invoice.getDueAmount() + " " + invoice.getCurrency().getCurrencyName() + INVOICE_DETAILS_SUFFIX,
				explinationLineItem.getExchangeRate(), invoice.getDueAmount(), invoice.getReferenceNumber());
		explainParamList.add(lineItemModel);

		boolean isSalesCategory = transactionExplanation.getCoaCategory().getChartOfAccountCategoryId()
				.equals(ChartOfAccountCategoryIdEnumConstant.SALES.getId());
		if (isSalesCategory) {
			model.setCustomerId(invoice.getContact().getContactId());
			setContactNameFromInvoice(model, invoice);
		} else {
			model.setVendorId(invoice.getContact().getContactId());
			model.setContactName(invoice.getContact().getFirstName() + "" + invoice.getContact().getLastName());
		}

		setCurrencyFromInvoice(model, invoice);
		setCreditNoteCreatedFlag(model, invoice);

		explainedInvoiceListModelList.add(new ExplainedInvoiceListModel(
				invoice.getId(), invoice.getInvoiceDate(), invoice.getTotalAmount(), invoice.getDueAmount(),
				explinationLineItem.getConvertedAmount(), explinationLineItem.getNonConvertedInvoiceAmount(),
				explinationLineItem.getConvertedToBaseCurrencyAmount(), explinationLineItem.getExplainedAmount(),
				explinationLineItem.getExchangeRate(), explinationLineItem.getPartiallyPaid(),
				transactionExplanation.getExchangeGainOrLossAmount(), invoice.getReferenceNumber()));
	}

	private void setContactNameFromInvoice(TransactionPresistModel model, Invoice invoice) {
		if (invoice.getContact().getOrganization() != null && !invoice.getContact().getOrganization().isEmpty()) {
			model.setContactName(invoice.getContact().getOrganization());
		} else {
			model.setContactName(invoice.getContact().getFirstName() + " " + invoice.getContact().getLastName());
		}
	}

	private void setCurrencyFromInvoice(TransactionPresistModel model, Invoice invoice) {
		model.setCurrencyCode(invoice.getCurrency().getCurrencyCode());
		model.setCurrencyName(invoice.getCurrency().getCurrencyName());
		model.setCurruncySymbol(invoice.getCurrency().getCurrencyIsoCode());
	}

	private void setCreditNoteCreatedFlag(TransactionPresistModel model, Invoice invoice) {
		CreditNote creditNote = creditNoteRepository.findByInvoiceIdAndDeleteFlag(invoice.getId(), false);
		model.setIsCTNCreated(creditNote != null && Boolean.FALSE.equals(creditNote.getDeleteFlag()));
	}

	private void processCreditNoteData(TransactionPresistModel model,
			TransactionExplanation transactionExplanation, List<TransactionExplinationLineItem> explinationLineItemList) {
		List<TransactionExplinationLineItem> creditNoteList = explinationLineItemList.stream()
				.filter(item -> item.getReferenceType().equals(PostingReferenceTypeEnum.CREDIT_NOTE)
						&& Boolean.FALSE.equals(item.getDeleteFlag()))
				.collect(Collectors.toList());

		if (creditNoteList.isEmpty() || transactionExplanation.getCoaCategory() == null) {
			return;
		}

		List<ReconsileRequestLineItemModel> explainParamList = model.getExplainParamList() != null
				? model.getExplainParamList() : new ArrayList<>();
		List<ExplainedInvoiceListModel> explainedInvoiceListModelList = model.getExplainedInvoiceList() != null
				? model.getExplainedInvoiceList() : new ArrayList<>();
		List<Invoice> invoices = new ArrayList<>();

		for (TransactionExplinationLineItem explinationLineItem : creditNoteList) {
			processCreditNoteLineItem(model, transactionExplanation, explinationLineItem,
					explainParamList, explainedInvoiceListModelList, invoices);
		}

		model.setExplainParamList(explainParamList);
	}

	private void processCreditNoteLineItem(TransactionPresistModel model, TransactionExplanation transactionExplanation,
			TransactionExplinationLineItem explinationLineItem, List<ReconsileRequestLineItemModel> explainParamList,
			List<ExplainedInvoiceListModel> explainedInvoiceListModelList, List<Invoice> invoices) {
		CreditNote creditNote = creditNoteRepository.findById(explinationLineItem.getReferenceId()).orElse(null);
		if (creditNote == null) {
			return;
		}

		Integer creditNoteInvoiceID = creditNote.getInvoiceId();
		Invoice creditNoteInvoice = invoiceService.findByPK(creditNoteInvoiceID);
		invoices.add(creditNoteInvoice);

		boolean isSalesCategory = transactionExplanation.getCoaCategory().getChartOfAccountCategoryId()
				.equals(ChartOfAccountCategoryIdEnumConstant.SALES.getId());

		if (isSalesCategory) {
			addCreditNoteToExplainList(explainParamList, creditNote);
			setCreditNoteContactInfo(model, creditNote);
			processSalesInvoicesForCreditNote(model, invoices, explainParamList, explainedInvoiceListModelList,
					explinationLineItem, transactionExplanation);
		}
	}

	private void addCreditNoteToExplainList(List<ReconsileRequestLineItemModel> explainParamList, CreditNote creditNote) {
		explainParamList.add(new ReconsileRequestLineItemModel(
				creditNote.getCreditNoteId(), creditNote.getDueAmount(), PostingReferenceTypeEnum.CREDIT_NOTE,
				INVOICE_DETAILS_PREFIX + creditNote.getReferenceNo() + INVOICE_AMOUNT_LABEL + creditNote.getTotalAmount()
						+ DUE_AMOUNT_LABEL + creditNote.getDueAmount() + " " + creditNote.getCurrency().getCurrencyName() + INVOICE_DETAILS_SUFFIX,
				creditNote.getExchangeRate(), creditNote.getDueAmount(), creditNote.getReferenceNo()));
	}

	private void setCreditNoteContactInfo(TransactionPresistModel model, CreditNote creditNote) {
		model.setCustomerId(creditNote.getContact().getContactId());
		if (creditNote.getContact().getOrganization() != null && !creditNote.getContact().getOrganization().isEmpty()) {
			model.setContactName(creditNote.getContact().getFirstName() + " " + creditNote.getContact().getLastName()
					+ CONTACT_NAME_SEPARATOR + creditNote.getContact().getOrganization() + CONTACT_NAME_SUFFIX);
		} else {
			model.setContactName(creditNote.getContact().getFirstName() + " " + creditNote.getContact().getLastName());
		}
		model.setCurrencyCode(creditNote.getCurrency().getCurrencyCode());
		model.setCurrencyName(creditNote.getCurrency().getCurrencyName());
		model.setCurruncySymbol(creditNote.getCurrency().getCurrencyIsoCode());
	}

	private void processSalesInvoicesForCreditNote(TransactionPresistModel model, List<Invoice> invoices,
			List<ReconsileRequestLineItemModel> explainParamList, List<ExplainedInvoiceListModel> explainedInvoiceListModelList,
			TransactionExplinationLineItem explinationLineItem, TransactionExplanation transactionExplanation) {
		List<Invoice> customerInvoices = invoices.stream()
				.filter(invoice -> invoice.getType() == 2)
				.collect(Collectors.toList());

		for (Invoice status : customerInvoices) {
			explainParamList.add(new ReconsileRequestLineItemModel(
					status.getId(), status.getDueAmount(), PostingReferenceTypeEnum.CREDIT_NOTE,
					INVOICE_DETAILS_PREFIX + status.getReferenceNumber() + INVOICE_AMOUNT_LABEL + status.getTotalAmount()
							+ DUE_AMOUNT_LABEL + status.getDueAmount() + " " + status.getCurrency().getCurrencyName() + INVOICE_DETAILS_SUFFIX,
					status.getExchangeRate(), status.getDueAmount(), status.getReferenceNumber()));
			model.setCustomerId(status.getContact().getContactId());
			model.setCurrencyCode(status.getCurrency().getCurrencyCode());
			model.setCurrencyName(status.getCurrency().getCurrencyName());
			model.setCurruncySymbol(status.getCurrency().getCurrencyIsoCode());

			explainedInvoiceListModelList.add(new ExplainedInvoiceListModel(
					status.getId(), status.getInvoiceDate(), status.getTotalAmount(), status.getDueAmount(),
					explinationLineItem.getConvertedAmount(), explinationLineItem.getNonConvertedInvoiceAmount(),
					explinationLineItem.getConvertedToBaseCurrencyAmount(), explinationLineItem.getExplainedAmount(),
					status.getExchangeRate(), explinationLineItem.getPartiallyPaid(),
					transactionExplanation.getExchangeGainOrLossAmount(), status.getReferenceNumber()));
			model.setExplainedInvoiceList(explainedInvoiceListModelList);
		}
	}

	private void processCorporateTaxPayment(TransactionPresistModel model, Transaction transaction) {
		CorporateTaxPayment corporateTaxPayment = corporateTaxPaymentRepository
				.findCorporateTaxPaymentByTransactionAndDeleteFlag(transaction, Boolean.FALSE);
		if (corporateTaxPayment != null) {
			CorporateTaxModel corporateTaxModel = new CorporateTaxModel();
			corporateTaxModel.setId(corporateTaxPayment.getCorporateTaxFiling().getId());
			corporateTaxModel.setBalanceDue(corporateTaxPayment.getCorporateTaxFiling().getBalanceDue());
			corporateTaxModel.setTaxFiledOn(corporateTaxPayment.getCorporateTaxFiling().getTaxFiledOn().toString());
			corporateTaxModel.setTaxAmount(corporateTaxPayment.getCorporateTaxFiling().getTaxableAmount());
			model.setCoaCategoryId(18);
			model.setCorporateTaxModel(corporateTaxModel);
		}
	}

	private void processVatPayment(TransactionPresistModel model, Transaction transaction) {
		VatPayment vatPayment = vatPaymentRepository.getVatPaymentByTransactionId(transaction.getTransactionId());
		if (vatPayment != null) {
			List<VatReportResponseListForBank> vatReportResponseListForBankList = new ArrayList<>();
			VatReportResponseListForBank vatReportResponseListForBank = new VatReportResponseListForBank();
			vatReportResponseListForBank.setId(vatPayment.getVatReportFiling().getId());
			vatReportResponseListForBank.setVatNumber(vatPayment.getVatReportFiling().getVatNumber());
			vatReportResponseListForBank.setDueAmount(vatPayment.getVatReportFiling().getBalanceDue());
			vatReportResponseListForBank.setTaxFiledOn(vatPayment.getVatReportFiling().getTaxFiledOn());
			if (transaction.getDebitCreditFlag().equals('D')) {
				vatReportResponseListForBank.setTotalAmount(vatPayment.getVatReportFiling().getTotalTaxPayable());
				model.setCoaCategoryId(16);
			} else {
				vatReportResponseListForBank.setTotalAmount(vatPayment.getVatReportFiling().getTotalTaxReclaimable());
				model.setCoaCategoryId(17);
			}
			vatReportResponseListForBankList.add(vatReportResponseListForBank);
			model.setVatReportResponseModelList(vatReportResponseListForBankList);
		}
	}

	public Receipt getReceiptEntity(Contact contact, BigDecimal totalAmt,
			TransactionCategory depositeToTransationCategory) {
		Receipt receipt = new Receipt();
		receipt.setContact(contact);
		receipt.setAmount(totalAmt);

		receipt.setReceiptNo("1");

		receipt.setReceiptDate(LocalDateTime.now());
		receipt.setPayMode(PayMode.BANK);
		receipt.setDepositeToTransactionCategory(
				// bank transacton category id
				depositeToTransationCategory);
		return receipt;
	}

	public Payment getPaymentEntity(Contact contact, BigDecimal totalAmt, TransactionCategory transactionCategory,
			Invoice invoice) {
		Payment payment = new Payment();
		payment.setSupplier(contact);
		payment.setInvoiceAmount(totalAmt);
		payment.setCurrency(invoice.getCurrency());
		payment.setDepositeToTransactionCategory(transactionCategory);
		payment.setPaymentDate(LocalDate.now());
		return payment;
	}

	private TransactionPresistModel createBaseTransactionModel(Transaction transaction) {
		TransactionPresistModel model = new TransactionPresistModel();
		model.setBankId(transaction.getBankAccount().getBankAccountId());
		model.setTransactionId(transaction.getTransactionId());
		model.setDescription(transaction.getExplainedTransactionDescription());
		if (transaction.getExchangeRate() != null) {
			model.setExchangeRate(transaction.getExchangeRate());
		}
		model.setExpenseCategory(null);
		model.setAmount(transaction.getTransactionAmount());
		model.setDueAmount(transaction.getTransactionDueAmount());
		if (transaction.getTransactionDate() != null) {
			model.setDate1(transaction.getTransactionDate());
		}
		model.setReference(transaction.getReferenceStr());
		model.setExplinationStatusEnum(transaction.getTransactionExplinationStatusEnum());
		return model;
	}

	private TransactionPresistModel createPartialTransactionModel(Transaction transaction) {
		TransactionPresistModel emptyModel = new TransactionPresistModel();
		emptyModel.setBankId(transaction.getBankAccount().getBankAccountId());
		emptyModel.setTransactionId(transaction.getTransactionId());
		emptyModel.setDescription(transaction.getExplainedTransactionDescription());
		if (transaction.getExchangeRate() != null) {
			emptyModel.setExchangeRate(transaction.getExchangeRate());
		}
		emptyModel.setExpenseCategory(null);
		emptyModel.setAmount(transaction.getTransactionDueAmount());
		emptyModel.setDueAmount(transaction.getTransactionDueAmount());
		if (transaction.getTransactionDate() != null) {
			emptyModel.setDate1(transaction.getTransactionDate());
		}
		emptyModel.setReference(transaction.getReferenceStr());
		return emptyModel;
	}

}
