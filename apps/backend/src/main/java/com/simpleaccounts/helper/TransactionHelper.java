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
import com.simpleaccounts.rest.creditnotecontroller.CreditNoteListModel;
import com.simpleaccounts.rest.creditnotecontroller.CreditNoteRepository;
import com.simpleaccounts.rest.financialreport.VatPaymentRepository;
import com.simpleaccounts.rest.transactioncontroller.TransactionPresistModel;
import com.simpleaccounts.rest.transactioncontroller.TransactionViewModel;
import com.simpleaccounts.rest.vatcontroller.VatReportResponseListForBank;
import com.simpleaccounts.service.*;
import com.simpleaccounts.service.bankaccount.TransactionStatusService;
import com.simpleaccounts.utils.DateFormatUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 *
 * @author Uday
 */
@Service
public class TransactionHelper {

	@Autowired
	private DateFormatUtil dateUtil;

	@Autowired
	private TransactionStatusService transactionStatusService;

	@Autowired
	private ContactService contactService;

	@Autowired
	private TransactionCategoryService transactionCategoryService;

	@Autowired
	private TransactionExpensesService transactionExpensesService;

	@Autowired
	private InvoiceService invoiceService;

	@Autowired
	private CreditNoteInvoiceRelationService creditNoteService;

	@Autowired
	private ExpenseService expenseService;

	@Autowired
	private TransactionExpensesPayrollService transactionExpensesPayrollService;

	@Autowired
	private TransactionExplanationLineItemRepository transactionExplanationLineItemRepository;

	@Autowired
	private PayrollRepository payrollRepository;

	@Autowired
	private TransactionExplanationRepository transactionExplanationRepository;

	@Autowired
	private VatPaymentRepository vatPaymentRepository;

	@Autowired
	private CorporateTaxPaymentRepository corporateTaxPaymentRepository;
	@Autowired
	private CreditNoteRepository creditNoteRepository;

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

//	public List<TransactionPresistModel> getModel2(List<TransactionExplinationLineItem> explinationLineItems , Transaction transaction){
//		List<TransactionPresistModel> transactionPresistModelList = new ArrayList<>();
//
//		for(TransactionExplinationLineItem explinationLineItem : explinationLineItems){
//				TransactionPresistModel model = new TransactionPresistModel();
//				model.setBankId(explinationLineItem.getBankAccount().getBankAccountId());
//				model.setTransactionId(transaction.getTransactionId());
//				model.setDescription(transaction.getExplainedTransactionDescription());
//				if (explinationLineItem.getExchangeRate()!=null){
//					model.setExchangeRate(explinationLineItem.getExchangeRate());
//				}
//				if (explinationLineItem.getExplainedTransactionCategory() != null) {
//					model.setExpenseCategory(explinationLineItem.getExplainedTransactionCategory().getTransactionCategoryId());
//				}
//				if (explinationLineItem.getCoaCategory() != null) {
//					model.setCoaCategoryId(explinationLineItem.getCoaCategory().getChartOfAccountCategoryId());
//				}
//				if (explinationLineItem.getExplainedTransactionCategory() != null) {
//					if(explinationLineItem.getExplainedTransactionCategory().getChartOfAccount()
//							.getChartOfAccountCode().equalsIgnoreCase(ChartOfAccountCategoryCodeEnum.BANK.getCode())
//							&& explinationLineItem.getTransactionDescription().contains("="))
//					{
//						model.setTransactionCategoryLabel(
//								explinationLineItem.getExplainedTransactionCategory().getChartOfAccount().getChartOfAccountName());
//						String description = explinationLineItem.getTransactionDescription();
//						model.setTransactionCategoryId(Integer.parseInt(description.substring(description.indexOf("=")+1,description.length())));
//						description = description.substring(0,description.indexOf(":"));
//						model.setDescription(description);
//						model.setExpenseCategory(null);
//					}
//					else {
//						model.setTransactionCategoryLabel(
//								explinationLineItem.getExplainedTransactionCategory().getChartOfAccount().getChartOfAccountName());
//						if(explinationLineItem.getExplainedTransactionCategory().getParentTransactionCategory()!=null
//								&& explinationLineItem.getExplainedTransactionCategory().getParentTransactionCategory().getTransactionCategoryId()!=null
////				        && transaction.getExplainedTransactionCategory().getParentTransactionCategory().getTransactionCategoryName().equalsIgnoreCase("Salaries and Employee Wages")
//						){
//							model.setTransactionCategoryId(explinationLineItem.getExplainedTransactionCategory().getParentTransactionCategory().getTransactionCategoryId());
//							model.setEmployeeId(explinationLineItem.getExplainedTransactionCategory().getTransactionCategoryId());
//						}else
//							model.setTransactionCategoryId(explinationLineItem.getExplainedTransactionCategory().getTransactionCategoryId());
//					}
//				}
//				model.setAmount(transaction.getTransactionDueAmount());
//				model.setDueAmount(transaction.getTransactionDueAmount());
//				if (transaction.getTransactionDate() != null) {
//					model.setDate1(transaction.getTransactionDate());
//				}
//				model.setReference(explinationLineItem.getReferenceStr());
//				//Expense
//			if (explinationLineItem.getVatCategory() != null)
//				model.setVatId(explinationLineItem.getVatCategory().getId());
//			if(explinationLineItem.getExpense()!= null) {
//				model.setExpenseType(explinationLineItem.getExpense().getExpenseType());
//			}
//			//Invoice
//			if(explinationLineItem.getContact()!= null){
//				model.setVendorId(explinationLineItem.getContact().getContactId());
//				model.setCustomerId(explinationLineItem.getContact().getContactId());
//			}
//
//
//
//			transactionPresistModelList.add(model);
//			}
//		return transactionPresistModelList;
//	};

		public List<TransactionPresistModel> getModel(Transaction transaction, List<TransactionExplanation> explanationList) {
			List<TransactionPresistModel> transactionPresistModelList = new ArrayList<>();
            if (explanationList==null || explanationList.size()<=0){
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
               transactionPresistModelList.add(model);


			}
			for (TransactionExplanation transactionExplanation : explanationList) {
				if (transaction.getTransactionExplinationStatusEnum().equals(TransactionExplinationStatusEnum.PARTIAL)){
					TransactionPresistModel emptyModel = new TransactionPresistModel();
					emptyModel.setBankId(transaction.getBankAccount().getBankAccountId());
					emptyModel.setTransactionId(transaction.getTransactionId());
					emptyModel.setDescription(transaction.getExplainedTransactionDescription());
					if (transaction.getExchangeRate() != null) {
						emptyModel.setExchangeRate(transaction.getExchangeRate());
					}
					emptyModel.setExpenseCategory(null);
					//emptyModel.setAmount(transaction.getTransactionAmount());
					emptyModel.setAmount(transaction.getTransactionDueAmount());
					emptyModel.setDueAmount(transaction.getTransactionDueAmount());
					if (transaction.getTransactionDate() != null) {
						emptyModel.setDate1(transaction.getTransactionDate());
					}
					emptyModel.setReference(transaction.getReferenceStr());
					transactionPresistModelList.add(emptyModel);
				}
				TransactionPresistModel model = new TransactionPresistModel();
				model.setExplanationId(transactionExplanation.getId());
				model.setBankId(transaction.getBankAccount().getBankAccountId());
				model.setTransactionId(transaction.getTransactionId());
				model.setDescription(transaction.getExplainedTransactionDescription());
				if (transaction.getExchangeRate() != null) {
					model.setExchangeRate(transaction.getExchangeRate());
				}
				if (transactionExplanation.getExplainedTransactionCategory() != null)
					model.setExpenseCategory(transactionExplanation.getExplainedTransactionCategory().getTransactionCategoryId());
				if (transactionExplanation.getExplanationUser() != null)
					model.setEmployeeId(transactionExplanation.getExplanationUser());
				if (transactionExplanation.getCoaCategory() != null)
					model.setCoaCategoryId(transactionExplanation.getCoaCategory().getChartOfAccountCategoryId());
				if (transactionExplanation.getExplainedTransactionCategory() != null) {
					if (transactionExplanation.getExplainedTransactionCategory().getChartOfAccount()
							.getChartOfAccountCode().equalsIgnoreCase(ChartOfAccountCategoryCodeEnum.BANK.getCode())
							&& transaction.getExplainedTransactionDescription().contains("=")) {
						model.setTransactionCategoryLabel(
								transactionExplanation.getExplainedTransactionCategory().getChartOfAccount().getChartOfAccountName());
						String description = transaction.getExplainedTransactionDescription();
						model.setTransactionCategoryId(Integer.parseInt(description.substring(description.indexOf("=") + 1, description.length())));
						description = description.substring(0, description.indexOf(":"));
						model.setDescription(description);
						model.setExpenseCategory(null);
					} else {
						model.setTransactionCategoryLabel(
								transactionExplanation.getExplainedTransactionCategory().getChartOfAccount().getChartOfAccountName());
						if (transactionExplanation.getExplainedTransactionCategory().getParentTransactionCategory() != null
								&& transactionExplanation.getExplainedTransactionCategory().getParentTransactionCategory().getTransactionCategoryId() != null
//				        && transaction.getExplainedTransactionCategory().getParentTransactionCategory().getTransactionCategoryName().equalsIgnoreCase("Salaries and Employee Wages")
						) {
							model.setTransactionCategoryId(transactionExplanation.getExplainedTransactionCategory().getParentTransactionCategory().getTransactionCategoryId());
							model.setEmployeeId(transactionExplanation.getExplainedTransactionCategory().getTransactionCategoryId());
						} else
							model.setTransactionCategoryId(transactionExplanation.getExplainedTransactionCategory().getTransactionCategoryId());
					}
				}
                if (transactionExplanation.getVatCategory()!=null){
					model.setVatId(transactionExplanation.getVatCategory());
				}
				if (transactionExplanation.getExplanationEmployee()!=null){
					model.setEmployeeId(transactionExplanation.getExplanationEmployee());
				}
				model.setAmount(transactionExplanation.getPaidAmount());
				model.setDueAmount(transaction.getTransactionDueAmount());
				if (transaction.getTransactionDate() != null) {
					model.setDate1(transaction.getTransactionDate());
				}
				model.setReference(transaction.getReferenceStr());

//				//Invoice invoice = null;
//				if(explinationLineItem.getReferenceType().equals(ChartOfAccountCategoryIdEnumConstant.SALES) ||
//						explinationLineItem.getReferenceType().equals(ChartOfAccountCategoryIdEnumConstant.INVOICE)) {
//					//invoice = invoiceService.findByPK(Integer.valueOf(explinationLineItem.getReferenceId()));
//				}
//				Expense expense = null;
//				if(explinationLineItem.getReferenceType().equals(ChartOfAccountCategoryIdEnumConstant.EXPENSE)){
//					expense = expenseService.findByPK(Integer.valueOf(explinationLineItem.getReferenceId()));
//				}
//				// EXPENSE
//				if ((expense != null ? expense.getVatCategory() : null) != null)
//					model.setVatId(expense.getVatCategory().getId());
//				if (invoice.getContact() != null)
//					model.setVendorId(invoice.getContact().getContactId());
//
//				List<TransactionExplinationLineItem> transactionExpensesList =
//						.findAllForTransactionExpenses(transaction.getTransactionId());
//				for (TransactionExpenses transactionExpenses : transactionExpensesList) {
//					model.setExpenseType(transactionExpenses.getExpense().getExpenseType());
//				}
//				if (invoice.getContact() != null)
//					model.setCustomerId(invoice.getContact().getContactId());

//				List<TransactionExpensesPayroll> transactionExpensesPayrollList = transactionExpensesPayrollService.
//						findAllForTransactionExpenses(transaction.getTransactionId());
//
//				if (transactionExpensesPayrollList != null && transactionExpensesPayrollList.size() != 0) {
//					List<DropdownModel> dropDownModelList = new ArrayList<>();
//
//					for (TransactionExpensesPayroll transactionExpensesPayroll : transactionExpensesPayrollList)
//						dropDownModelList.add(
//								new DropdownModel(
//										transactionExpensesPayroll.getPayroll().getId(),
//										transactionExpensesPayroll.getPayroll().getPayrollSubject()
//								)
//						);
//					model.setPayrollDropdownList(dropDownModelList);
//				}

				//get all explanation line item
				List<TransactionExplinationLineItem> explinationLineItemList = transactionExplanationLineItemRepository.
						getTransactionExplinationLineItemsByTransactionExplanation(transactionExplanation);
				//expense

//				List<TransactionExplinationLineItem> expenseList = explinationLineItemList.stream().filter(transactionExplinationLineItem ->
//						transactionExplinationLineItem.getReferenceType().equals(PostingReferenceTypeEnum.EXPENSE)).collect(Collectors.toList());
				Map<String,Object> map = new HashMap<>();
				map.put("transaction",transaction);
				List<TransactionExpenses> expenseList = transactionExpensesService.findByAttributes(map);
				if (expenseList!=null && expenseList.size()>0){
					//TransactionExplinationLineItem transactionExplinationLineItem = expenseList.get(0);
					TransactionExpenses transactionExpenses = expenseList.get(0);
					Expense expense = expenseService.findByPK(Integer.valueOf(transactionExpenses.getExpense().getExpenseId()));
					model.setExpenseType(expense.getExpenseType());
					if(expense.getVatCategory()!=null)
					model.setVatId(expense.getVatCategory().getId());
					if (expense.getExclusiveVat()!=null)
					model.setExclusiveVat(expense.getExclusiveVat());
					if (expense.getIsReverseChargeEnabled()!=null)
					model.setIsReverseChargeEnabled(expense.getIsReverseChargeEnabled());
				}

				//fetch Payroll List
				List<TransactionExplinationLineItem> payrollList = explinationLineItemList.stream().filter(transactionExplinationLineItem ->
						transactionExplinationLineItem.getReferenceType().equals(PostingReferenceTypeEnum.PAYROLL_EXPLAINED)).collect(Collectors.toList());

				if (payrollList != null && payrollList.size() != 0) {
					List<DropdownModel> dropDownModelList = new ArrayList<>();

					for (TransactionExplinationLineItem explinationLineItem : payrollList){
						Payroll payroll = payrollRepository.findById(explinationLineItem.getReferenceId());
						dropDownModelList.add(
								new DropdownModel(
										payroll.getId(),
										payroll.getPayrollSubject()
								)
						);
					}

					model.setPayrollDropdownList(dropDownModelList);
				}

				// MONEY PAID TO USER
				// MONEY RECEIVED FROM OTHER
				if (transactionExplanation.getExplanationEmployee() != null)
					model.setVendorId(transactionExplanation.getExplanationEmployee());

				// Transafer To
				if (transactionExplanation.getExplanationEmployee() != null)
					model.setEmployeeId(transactionExplanation.getExplanationEmployee());

				List<Invoice> invoices = new ArrayList<>();
				List<TransactionExplinationLineItem> invoiceList = explinationLineItemList.stream().filter(transactionExplinationLineItem ->
						transactionExplinationLineItem.getReferenceType().equals(PostingReferenceTypeEnum.INVOICE) &&
								transactionExplinationLineItem.getDeleteFlag().equals(Boolean.FALSE)).collect(Collectors.toList());
				List<ReconsileRequestLineItemModel> explainParamList = new ArrayList<>();
				List<ExplainedInvoiceListModel> explainedInvoiceListModelList = new ArrayList<>();
				for (TransactionExplinationLineItem explinationLineItem:invoiceList){
					Invoice invoice = invoiceService.findByPK(explinationLineItem.getReferenceId());
					invoices.add(invoice);
					if (transactionExplanation.getCoaCategory() != null){
						if (transactionExplanation.getCoaCategory().getChartOfAccountCategoryId()
								.equals(ChartOfAccountCategoryIdEnumConstant.SALES.getId())) {
							// CUSTOMER INVOICES
						//	List<Invoice> customerInvoices = invoices.stream().filter(invoice -> invoice.getType()==2).collect(Collectors.toList());
						//	for (Invoice status : customerInvoices) {
								explainParamList.add(new ReconsileRequestLineItemModel(invoice.getId(),invoice.getDueAmount()
										, PostingReferenceTypeEnum.INVOICE, " (" + invoice.getReferenceNumber() +
										" ,Invoice Amount: " + invoice.getTotalAmount() + ",Due Amount: " + invoice.getDueAmount()
										+ " " + invoice.getCurrency().getCurrencyName() + ")",explinationLineItem.getExchangeRate(),invoice.getDueAmount(),invoice.getReferenceNumber()));
								model.setCustomerId(invoice.getContact().getContactId());
								 if (invoice.getContact().getOrganization() != null && !invoice.getContact().getOrganization().isEmpty()) {
									model.setContactName(invoice.getContact().getOrganization());
								 } else {
									model.setContactName(invoice.getContact().getFirstName() + " " + invoice.getContact().getLastName());
								 }
								model.setCurrencyCode(invoice.getCurrency().getCurrencyCode());
								model.setCurrencyName(invoice.getCurrency().getCurrencyName());
								model.setCurruncySymbol(invoice.getCurrency().getCurrencyIsoCode());
								CreditNote creditNote = creditNoteRepository.findByInvoiceIdAndDeleteFlag(invoice.getId(),false);
								if(creditNote!=null && creditNote.getDeleteFlag().equals(Boolean.FALSE)){
									model.setIsCTNCreated(Boolean.TRUE);
								}
								else {
									model.setIsCTNCreated(Boolean.FALSE);
								}
							explainedInvoiceListModelList.add(new ExplainedInvoiceListModel(invoice.getId(),invoice.getInvoiceDate(),invoice.getTotalAmount(),invoice.getDueAmount(),explinationLineItem.getConvertedAmount(),explinationLineItem.getNonConvertedInvoiceAmount(),explinationLineItem.getConvertedToBaseCurrencyAmount(),
									explinationLineItem.getExplainedAmount(),explinationLineItem.getExchangeRate(),explinationLineItem.getPartiallyPaid(),transactionExplanation.getExchangeGainOrLossAmount(),invoice.getReferenceNumber()));
							model.setExplainedInvoiceList(explainedInvoiceListModelList);


						//	}
						} else {
							// VENDOR INVOICES
							List<TransactionStatus> trnxStatusList = transactionStatusService
									.findAllTransactionStatuesByTrnxId(transaction.getTransactionId());
							//List<Invoice> supplierInvoices = invoices.stream().filter(invoice -> invoice.getType()==1).collect(Collectors.toList());

							//for (Invoice status : supplierInvoices) {
								explainParamList.add(new ReconsileRequestLineItemModel(invoice.getId(),invoice.getDueAmount()
										, PostingReferenceTypeEnum.INVOICE, " (" + invoice.getReferenceNumber() + " ,Invoice Amount: " + invoice.getTotalAmount()
										+ ",Due Amount: " + invoice.getDueAmount() + " " + invoice.getCurrency().getCurrencyName() + ")",explinationLineItem.getExchangeRate(),invoice.getDueAmount(),invoice.getReferenceNumber()));
								model.setVendorId(invoice.getContact().getContactId());
							    model.setContactName(invoice.getContact().getFirstName()+""+invoice.getContact().getLastName());
								model.setCurrencyCode(invoice.getCurrency().getCurrencyCode());
								model.setCurrencyName(invoice.getCurrency().getCurrencyName());
								model.setCurruncySymbol(invoice.getCurrency().getCurrencyIsoCode());
							CreditNote creditNote = creditNoteRepository.findByInvoiceIdAndDeleteFlag(invoice.getId(),false);
							if(creditNote!=null && creditNote.getDeleteFlag().equals(Boolean.FALSE)){
								model.setIsCTNCreated(Boolean.TRUE);
							}
							else {
								model.setIsCTNCreated(Boolean.FALSE);
							}
							explainedInvoiceListModelList.add(new ExplainedInvoiceListModel(invoice.getId(),invoice.getInvoiceDate(),invoice.getTotalAmount(),invoice.getDueAmount(),explinationLineItem.getConvertedAmount(),explinationLineItem.getNonConvertedInvoiceAmount(),explinationLineItem.getConvertedToBaseCurrencyAmount(),
									explinationLineItem.getExplainedAmount(),explinationLineItem.getExchangeRate(),explinationLineItem.getPartiallyPaid(),transactionExplanation.getExchangeGainOrLossAmount(),invoice.getReferenceNumber()));
							model.setExplainedInvoiceList(explainedInvoiceListModelList);
						//	}
						}


						model.setExplainParamList(explainParamList);

					}
//					explainParamList.add(new ReconsileRequestLineItemModel(invoice.getId(),invoice.getDueAmount()
//							, PostingReferenceTypeEnum.INVOICE, " (" + invoice.getReferenceNumber() +
//							" ,Invoice Amount: " + invoice.getTotalAmount() + ",Due Amount: " + invoice.getDueAmount() +
//							" " + invoice.getCurrency().getCurrencyName() + ")",explinationLineItem.getExchangeRate()));
//					model.setCustomerId(invoice.getContact().getContactId());
//					model.setCurrencyCode(invoice.getCurrency().getCurrencyCode());
//					model.setCurrencyName(invoice.getCurrency().getCurrencyName());
//					model.setCurruncySymbol(invoice.getCurrency().getCurrencyIsoCode());

				}
//				if (transactionExplanation.getCoaCategory() != null) {
//					List<ReconsileRequestLineItemModel> explainParamList = new ArrayList<>();
//					if (transactionExplanation.getCoaCategory().getChartOfAccountCategoryId()
//							.equals(ChartOfAccountCategoryIdEnumConstant.SALES.getId())) {
//						// CUTOMER INVOICES
////						List<TransactionStatus> trnxStatusList = transactionStatusService
////								.findAllTransactionStatuesByTrnxId(transaction.getTransactionId());
//
//						List<Invoice> customerInvoices = invoices.stream().filter(invoice -> invoice.getType()==2).collect(Collectors.toList());
//						for (Invoice status : customerInvoices) {
//							explainParamList.add(new ReconsileRequestLineItemModel(status.getId(),status.getDueAmount()
//									, PostingReferenceTypeEnum.INVOICE, " (" + status.getReferenceNumber() +
//									" ,Invoice Amount: " + status.getTotalAmount() + ",Due Amount: " + status.getDueAmount() + " " + status.getCurrency().getCurrencyName() + ")",));
//						model.setCustomerId(status.getContact().getContactId());
//                        model.setCurrencyCode(status.getCurrency().getCurrencyCode());
//						model.setCurrencyName(status.getCurrency().getCurrencyName());
//						model.setCurruncySymbol(status.getCurrency().getCurrencyIsoCode());
//
//						}
//					} else {
//						// VENDOR INVOICES
//						List<TransactionStatus> trnxStatusList = transactionStatusService
//								.findAllTransactionStatuesByTrnxId(transaction.getTransactionId());
//						List<Invoice> supplierInvoices = invoices.stream().filter(invoice -> invoice.getType()==1).collect(Collectors.toList());
//
//						for (Invoice status : supplierInvoices) {
//							explainParamList.add(new ReconsileRequestLineItemModel(status.getId(),status.getDueAmount()
//									, PostingReferenceTypeEnum.INVOICE, " (" + status.getReferenceNumber() + " ,Invoice Amount: " + status.getTotalAmount()
//									+ ",Due Amount: " + status.getDueAmount() + " " + status.getCurrency().getCurrencyName() + ")"));
//							model.setVendorId(status.getContact().getContactId());
//							model.setCurrencyCode(status.getCurrency().getCurrencyCode());
//							model.setCurrencyName(status.getCurrency().getCurrencyName());
//							model.setCurruncySymbol(status.getCurrency().getCurrencyIsoCode());
//						}
//					}
//
//					model.setExplainParamList(explainParamList);
//				}
				model.setExplinationStatusEnum(transaction.getTransactionExplinationStatusEnum());


				//for creditnote data
				List<CreditNote> creditNotes = new ArrayList<>();
				List<TransactionExplinationLineItem> creditNoteList = explinationLineItemList.stream().filter(transactionExplinationLineItem ->
						transactionExplinationLineItem.getReferenceType().equals(PostingReferenceTypeEnum.CREDIT_NOTE) &&
								transactionExplinationLineItem.getDeleteFlag().equals(Boolean.FALSE)).collect(Collectors.toList());
				List<ReconsileRequestLineItemModel> creditNoteParamList = new ArrayList<>();
				List<CreditNoteListModel> creditNoteModelList = new ArrayList<>();
				for (TransactionExplinationLineItem explinationLineItem:creditNoteList){
					CreditNote creditNote = creditNoteRepository.findById(explinationLineItem.getReferenceId()).get();
					Integer creditNoteInvoiceID = creditNoteRepository.findById(explinationLineItem.getReferenceId()).get().getInvoiceId();
					Invoice creditNoteInvoice = invoiceService.findByPK(creditNoteInvoiceID);
					invoices.add(creditNoteInvoice);
					//Optional<CreditNote> creditNote = creditNoteRepository.findById(explinationLineItem.getReferenceId());
					//creditNotes.add(creditNote);
					if (transactionExplanation.getCoaCategory() != null){
						if (transactionExplanation.getCoaCategory().getChartOfAccountCategoryId()
								.equals(ChartOfAccountCategoryIdEnumConstant.SALES.getId())) {
							// CUSTOMER INVOICES
							//	List<Invoice> customerInvoices = invoices.stream().filter(invoice -> invoice.getType()==2).collect(Collectors.toList());
							//	for (Invoice status : customerInvoices) {
							creditNoteParamList.add(new ReconsileRequestLineItemModel(creditNote.getCreditNoteId(),
									creditNote.getDueAmount()
									, PostingReferenceTypeEnum.CREDIT_NOTE,
									" (" + creditNote.getReferenceNo() +
											" ,Invoice Amount: " + creditNote.getTotalAmount() + ",Due Amount: " + creditNote.getDueAmount()
											+ " " + creditNote.getCurrency().getCurrencyName() + ")",
									creditNote.getExchangeRate(),
									creditNote.getDueAmount(),
									creditNote.getReferenceNo()));
							model.setCustomerId(creditNote.getContact().getContactId());
							model.setContactName(creditNote.getContact().getFirstName()+""+creditNote.getContact().getLastName());
							if (creditNote.getContact().getOrganization() != null && !creditNote.getContact().getOrganization().isEmpty()) {
								// If organization is not null or empty
								model.setContactName(creditNote.getContact().getFirstName() + " " + creditNote.getContact().getLastName() + " (" + creditNote.getContact().getOrganization() + ")");
							} else {
								// If organization is null or empty
								model.setContactName(creditNote.getContact().getFirstName() + " " + creditNote.getContact().getLastName());
							}
							model.setCurrencyCode(creditNote.getCurrency().getCurrencyCode());
							model.setCurrencyName(creditNote.getCurrency().getCurrencyName());
							model.setCurruncySymbol(creditNote.getCurrency().getCurrencyIsoCode());
//							CreditNote creditNote = creditNoteRepository.findByInvoiceId(creditNote.getId());
//							if(creditNote!=null){
//								model.setIsCTNCreated(Boolean.TRUE);
//							}
//							else {
//								model.setIsCTNCreated(Boolean.FALSE);
//							}
//							explainedInvoiceListModelList.add(new ExplainedInvoiceListModel(creditNote.getCreditNoteId(),creditNote.getCreditNoteDate().toLocalDate(),creditNote.getTotalAmount(),creditNote.getDueAmount(),explinationLineItem.getConvertedAmount(),explinationLineItem.getNonConvertedInvoiceAmount(),explinationLineItem.getConvertedToBaseCurrencyAmount(),
//									explinationLineItem.getExplainedAmount(),creditNote.getExchangeRate(),explinationLineItem.getPartiallyPaid(),transactionExplanation.getExchangeGainOrLossAmount(),creditNote.getReferenceNo()));
//							model.setExplainedInvoiceList(explainedInvoiceListModelList);

							//	}

							if (transactionExplanation.getCoaCategory() != null) {
								List<ReconsileRequestLineItemModel> invoiceexplainParamList = new ArrayList<>();
								if (transactionExplanation.getCoaCategory().getChartOfAccountCategoryId()
										.equals(ChartOfAccountCategoryIdEnumConstant.SALES.getId())) {
									// CUTOMER INVOICES
//						List<TransactionStatus> trnxStatusList = transactionStatusService
//								.findAllTransactionStatuesByTrnxId(transaction.getTransactionId());

									List<Invoice> customerInvoices = invoices.stream().filter(invoice -> invoice.getType() == 2).collect(Collectors.toList());
									for (Invoice status : customerInvoices) {
										explainParamList.add(new ReconsileRequestLineItemModel(status.getId(),status.getDueAmount(),
												PostingReferenceTypeEnum.CREDIT_NOTE,
												" (" + status.getReferenceNumber() +
														" ,Invoice Amount: " + status.getTotalAmount() + ",Due Amount: " + status.getDueAmount()
														+ " " + status.getCurrency().getCurrencyName() + ")",
												status.getExchangeRate(),
												status.getDueAmount(),
												status.getReferenceNumber()));
										model.setCustomerId(status.getContact().getContactId());
										model.setCurrencyCode(status.getCurrency().getCurrencyCode());
										model.setCurrencyName(status.getCurrency().getCurrencyName());
										model.setCurruncySymbol(status.getCurrency().getCurrencyIsoCode());

										explainedInvoiceListModelList.add(new ExplainedInvoiceListModel(status.getId(),status.getInvoiceDate(),status.getTotalAmount(),status.getDueAmount(),explinationLineItem.getConvertedAmount(),explinationLineItem.getNonConvertedInvoiceAmount(),explinationLineItem.getConvertedToBaseCurrencyAmount(),
								explinationLineItem.getExplainedAmount(),status.getExchangeRate(),explinationLineItem.getPartiallyPaid(),transactionExplanation.getExchangeGainOrLossAmount(),status.getReferenceNumber()));
						model.setExplainedInvoiceList(explainedInvoiceListModelList);
									}
								}
							}
						}
//						else {
//							// VENDOR INVOICES
//							List<TransactionStatus> trnxStatusList = transactionStatusService
//									.findAllTransactionStatuesByTrnxId(transaction.getTransactionId());
//							//List<Invoice> supplierInvoices = invoices.stream().filter(invoice -> invoice.getType()==1).collect(Collectors.toList());
//
//							//for (Invoice status : supplierInvoices) {
//							explainParamList.add(new ReconsileRequestLineItemModel(invoice.getId(),invoice.getDueAmount()
//									, PostingReferenceTypeEnum.INVOICE, " (" + invoice.getReferenceNumber() + " ,Invoice Amount: " + invoice.getTotalAmount()
//									+ ",Due Amount: " + invoice.getDueAmount() + " " + invoice.getCurrency().getCurrencyName() + ")",explinationLineItem.getExchangeRate(),invoice.getDueAmount(),invoice.getReferenceNumber()));
//							model.setVendorId(invoice.getContact().getContactId());
//							model.setContactName(invoice.getContact().getFirstName()+""+invoice.getContact().getLastName());
//							model.setCurrencyCode(invoice.getCurrency().getCurrencyCode());
//							model.setCurrencyName(invoice.getCurrency().getCurrencyName());
//							model.setCurruncySymbol(invoice.getCurrency().getCurrencyIsoCode());
//							CreditNote creditNote = creditNoteRepository.findByInvoiceId(invoice.getId());
//							if(creditNote!=null){
//								model.setIsCTNCreated(Boolean.TRUE);
//							}
//							else {
//								model.setIsCTNCreated(Boolean.FALSE);
//							}
//							explainedInvoiceListModelList.add(new ExplainedInvoiceListModel(invoice.getId(),invoice.getInvoiceDate(),invoice.getTotalAmount(),invoice.getDueAmount(),explinationLineItem.getConvertedAmount(),explinationLineItem.getNonConvertedInvoiceAmount(),explinationLineItem.getConvertedToBaseCurrencyAmount(),
//									explinationLineItem.getExplainedAmount(),explinationLineItem.getExchangeRate(),explinationLineItem.getPartiallyPaid(),transactionExplanation.getExchangeGainOrLossAmount(),invoice.getReferenceNumber()));
//							model.setExplainedInvoiceList(explainedInvoiceListModelList);
//							//	}
//						}


						model.setExplainParamList(explainParamList);

					}
//
				}



				//end of block for credit note

				//for corporate tax payment
				CorporateTaxPayment corporateTaxPayment = corporateTaxPaymentRepository.findCorporateTaxPaymentByTransactionAndDeleteFlag(transaction,Boolean.FALSE);
				if (corporateTaxPayment!=null){
					CorporateTaxModel corporateTaxModel = new CorporateTaxModel();
					corporateTaxModel.setId(corporateTaxPayment.getCorporateTaxFiling().getId());
					corporateTaxModel.setBalanceDue(corporateTaxPayment.getCorporateTaxFiling().getBalanceDue());
					corporateTaxModel.setTaxFiledOn(corporateTaxPayment.getCorporateTaxFiling().getTaxFiledOn().toString());
					corporateTaxModel.setTaxAmount(corporateTaxPayment.getCorporateTaxFiling().getTaxableAmount());
						model.setCoaCategoryId(18);
					model.setCorporateTaxModel(corporateTaxModel);
				}


				//for vat payment/vat claim
				VatPayment vatPayment = vatPaymentRepository.getVatPaymentByTransactionId(transaction.getTransactionId());
				if (vatPayment!=null){
					List<VatReportResponseListForBank> vatReportResponseListForBankList = new ArrayList<>();
					VatReportResponseListForBank vatReportResponseListForBank = new VatReportResponseListForBank();
					vatReportResponseListForBank.setId(vatPayment.getVatReportFiling().getId());
					vatReportResponseListForBank.setVatNumber(vatPayment.getVatReportFiling().getVatNumber());
					vatReportResponseListForBank.setDueAmount(vatPayment.getVatReportFiling().getBalanceDue());
					vatReportResponseListForBank.setTaxFiledOn(vatPayment.getVatReportFiling().getTaxFiledOn());
					if (transaction.getDebitCreditFlag().equals('D')){
						vatReportResponseListForBank.setTotalAmount(vatPayment.getVatReportFiling().getTotalTaxPayable());
						model.setCoaCategoryId(16);
					}
					else{
						vatReportResponseListForBank.setTotalAmount(vatPayment.getVatReportFiling().getTotalTaxReclaimable());
						model.setCoaCategoryId(17);
					}
					vatReportResponseListForBankList.add(vatReportResponseListForBank);
					model.setVatReportResponseModelList(vatReportResponseListForBankList);
				}

				transactionPresistModelList.add(model);
			}
			return transactionPresistModelList;
		}

	public Receipt getReceiptEntity(Contact contact, BigDecimal totalAmt,
			TransactionCategory depositeToTransationCategory) {
		Receipt receipt = new Receipt();
		receipt.setContact(contact);
		receipt.setAmount(totalAmt);
		// receipt.setNotes(receiptRequestModel.getNotes());
		receipt.setReceiptNo("1");
		// receipt.setReferenceCode(receiptRequestModel.getReferenceCode());
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

}
