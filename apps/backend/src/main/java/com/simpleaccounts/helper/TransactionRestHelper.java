package com.simpleaccounts.helper;

import com.simpleaccounts.model.TransactionViewRestModel;
import com.simpleaccounts.model.TransactionRestModel;
import com.simpleaccounts.model.BankAccountRestModel;
import com.simpleaccounts.constant.TransactionCreationMode;

import com.simpleaccounts.constant.TransactionStatusConstant;

import com.simpleaccounts.entity.bankaccount.BankAccount;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Date;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.entity.bankaccount.TransactionView;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

import org.springframework.stereotype.Component;

@Component
public class TransactionRestHelper {
	@Getter
	@Setter
	private List<TransactionViewRestModel> childTransactions = new ArrayList<>();

	// TODO : remove coented code after chceking effect of referenceId and
	// refrenceType in front end

	public Transaction getTransactionEntity(TransactionRestModel model) {
		Transaction transaction = new Transaction();
		transaction.setTransactionId(model.getTransactionId());
		if (model.getTransactionDate() != null) {
			LocalDateTime transactionDate = Instant.ofEpochMilli(model.getTransactionDate().getTime())
					.atZone(ZoneId.systemDefault()).toLocalDateTime();
			transaction.setTransactionDate(transactionDate);
		}
		transaction.setTransactionDescription(model.getTransactionDescription());
		transaction.setTransactionAmount(model.getTransactionAmount());
		transaction.setChartOfAccount(model.getChartOfAccountId());
		transaction.setReceiptNumber(model.getReceiptNumber());
		transaction.setDebitCreditFlag(model.getDebitCreditFlag());
		//transaction.setProject(model.getProject());
		transaction.setExplainedTransactionCategory(model.getExplainedTransactionCategory());
		transaction.setExplainedTransactionDescription(model.getExplainedTransactionDescription());
		transaction
				.setExplainedTransactionAttachementDescription(model.getExplainedTransactionAttachementDescription());
		transaction.setExplainedTransactionAttachement(model.getExplainedTransactionAttachement());
		transaction.setBankAccount(model.getBankAccount());
		transaction.setCurrentBalance(model.getCurrentBalance());
		transaction.setCreatedBy(model.getCreatedBy());
		transaction.setCreatedDate(model.getCreatedDate());
		transaction.setLastUpdateBy(model.getLastUpdatedBy());
		transaction.setLastUpdateDate(model.getLastUpdateDate());
		transaction.setDeleteFlag(model.getDeleteFlag());
		transaction.setVersionNumber(model.getVersionNumber());
		transaction.setEntryType(model.getEntryType());
		transaction.setParentTransaction(model.getParentTransaction());
//		transaction.setReferenceId(model.getReferenceId());
//		transaction.setReferenceType(model.getReferenceType());
		transaction.setCreationMode(TransactionCreationMode.MANUAL);
		if (model.getChildTransactionList() != null && !model.getChildTransactionList().isEmpty()) {
			model.getChildTransactionList().remove(model.getChildTransactionList().size() - 1);
		}

		transaction.setChildTransactionList(getChildTransactionList(model.getChildTransactionList()));
		return transaction;
	}

	public TransactionRestModel getTransactionModel(Transaction entity) {
		TransactionRestModel transactionModel = new TransactionRestModel();
		transactionModel.setTransactionId(entity.getTransactionId());

		if (entity.getTransactionDate() != null) {
			Date transactionDate = Date.from(entity.getTransactionDate().atZone(ZoneId.systemDefault()).toInstant());
			transactionModel.setTransactionDate(transactionDate);
		}

		transactionModel.setTransactionDescription(entity.getTransactionDescription());
		transactionModel.setTransactionAmount(entity.getTransactionAmount());
		transactionModel.setChartOfAccountId(entity.getChartOfAccount());
		transactionModel.setReceiptNumber(entity.getReceiptNumber());
		transactionModel.setDebitCreditFlag(entity.getDebitCreditFlag());
//		transactionModel.setProject(entity.getProject());
		transactionModel.setExplainedTransactionCategory(entity.getExplainedTransactionCategory());
		transactionModel.setExplainedTransactionDescription(entity.getExplainedTransactionDescription());
		transactionModel
				.setExplainedTransactionAttachementDescription(entity.getExplainedTransactionAttachementDescription());
		transactionModel.setExplainedTransactionAttachement(entity.getExplainedTransactionAttachement());
		transactionModel.setBankAccount(entity.getBankAccount());
		transactionModel.setCurrentBalance(entity.getCurrentBalance());
		transactionModel.setCreatedBy(entity.getCreatedBy());
		transactionModel.setCreatedDate(entity.getCreatedDate());
		transactionModel.setLastUpdatedBy(entity.getLastUpdateBy());
		transactionModel.setLastUpdateDate(entity.getLastUpdateDate());
		transactionModel.setDeleteFlag(entity.getDeleteFlag());
		transactionModel.setVersionNumber(entity.getVersionNumber());
		transactionModel.setEntryType(entity.getEntryType());
		transactionModel.setParentTransaction(entity.getParentTransaction());
//		transactionModel.setReferenceId(entity.getReferenceId());
//		transactionModel.setReferenceType(entity.getReferenceType());
		transactionModel.setChildTransactionList(getChildTransactionModelList(entity.getChildTransactionList()));
//		if (entity.getReferenceType() != null) {
//			if (entity.getReferenceType() == TransactionRefrenceTypeConstant.INVOICE) {
//				transactionModel.setReferenceTypeName("Invoice");
//		} else if (entity.getReferenceType() == TransactionRefrenceTypeConstant.PURCHASE) {
//				transactionModel.setReferenceTypeName("Purchase");
//				Purchase purchase = purchaseService.findByPK(entity.getReferenceId());
//				transactionModel.setRefObject(purchase);
//				transactionModel.setReferenceName("Purchase : " + purchase.getReceiptNumber());
//			}
//		}

		return transactionModel;
	}

	public BankAccount getBankAccount(BankAccountRestModel model) {
		BankAccount bankAccount = new BankAccount();
		bankAccount.setBankAccountId(model.getBankAccountId());
		bankAccount.setAccountNumber(model.getAccountNumber());
		bankAccount.setBankAccountCurrency(model.getBankAccountCurrency());
		bankAccount.setBankAccountName(model.getBankAccountName());
		bankAccount.setBankAccountStatus(model.getBankAccountStatus());
		bankAccount.setBankCountry(model.getBankCountry());
		bankAccount.setBankFeedStatusCode(model.getBankFeedStatusCode());
		bankAccount.setBankName(model.getBankName());
		bankAccount.setCreatedBy(model.getCreatedBy());
		bankAccount.setCreatedDate(model.getCreatedDate());
		bankAccount.setCurrentBalance(model.getCurrentBalance());
		bankAccount.setDeleteFlag(model.getDeleteFlag());
		bankAccount.setIfscCode(model.getIfscCode());
		bankAccount.setIsprimaryAccountFlag(model.getIsprimaryAccountFlag());
		bankAccount.setLastUpdateDate(model.getLastUpdateDate());
		bankAccount.setLastUpdatedBy(model.getLastUpdatedBy());
		bankAccount.setOpeningBalance(model.getOpeningBalance());
		bankAccount.setPersonalCorporateAccountInd(model.getPersonalCorporateAccountInd());
		bankAccount.setSwiftCode(model.getSwiftCode());
		bankAccount.setVersionNumber(model.getVersionNumber());
		return bankAccount;
	}

	private Collection<Transaction> getChildTransactionList(
			Collection<TransactionRestModel> childTransactionModelList) {
		Collection<Transaction> transactionList = new ArrayList<>();
		if (childTransactionModelList != null && !childTransactionModelList.isEmpty()) {
			for (TransactionRestModel model : childTransactionModelList) {
				Transaction transaction = new Transaction();
				transaction.setTransactionId(model.getTransactionId());
				if (model.getTransactionDate() != null) {
					LocalDateTime transactionDate = Instant.ofEpochMilli(model.getTransactionDate().getTime())
							.atZone(ZoneId.systemDefault()).toLocalDateTime();
					transaction.setTransactionDate(transactionDate);
				}
				transaction.setTransactionDescription(model.getTransactionDescription());
				transaction.setTransactionAmount(model.getTransactionAmount());
				transaction.setChartOfAccount(model.getChartOfAccountId());
				transaction.setReceiptNumber(model.getReceiptNumber());
				transaction.setDebitCreditFlag(model.getDebitCreditFlag());
//				transaction.setProject(model.getProject());
				transaction.setExplainedTransactionCategory(model.getExplainedTransactionCategory());
				transaction.setExplainedTransactionDescription(model.getExplainedTransactionDescription());
				transaction.setExplainedTransactionAttachementDescription(
						model.getExplainedTransactionAttachementDescription());
				transaction.setExplainedTransactionAttachement(model.getExplainedTransactionAttachement());
				transaction.setBankAccount(model.getBankAccount());
				transaction.setCurrentBalance(model.getCurrentBalance());
				transaction.setCreatedBy(model.getCreatedBy());
				transaction.setCreatedDate(model.getCreatedDate());
				transaction.setLastUpdateBy(model.getLastUpdatedBy());
				transaction.setLastUpdateDate(model.getLastUpdateDate());
				transaction.setDeleteFlag(model.getDeleteFlag());
				transaction.setVersionNumber(model.getVersionNumber());
				transaction.setEntryType(model.getEntryType());
				transaction.setParentTransaction(model.getParentTransaction());
//				transaction.setReferenceId(model.getReferenceId());
//				transaction.setReferenceType(model.getReferenceType());

				transactionList.add(transaction);
			}
		}
		return transactionList;
	}

	private List<TransactionRestModel> getChildTransactionModelList(Collection<Transaction> childTransactionList) {
		List<TransactionRestModel> transactionModelList = new ArrayList<>();
		if (childTransactionList != null && !childTransactionList.isEmpty()) {
			for (Transaction transaction : childTransactionList) {
				TransactionRestModel transactionModel = new TransactionRestModel();
				transactionModel.setTransactionId(transaction.getTransactionId());

				if (transaction.getTransactionDate() != null) {
					Date transactionDate = Date
							.from(transaction.getTransactionDate().atZone(ZoneId.systemDefault()).toInstant());
					transactionModel.setTransactionDate(transactionDate);
				}

				transactionModel.setTransactionDescription(transaction.getTransactionDescription());
				transactionModel.setTransactionAmount(transaction.getTransactionAmount());
				transactionModel.setChartOfAccountId(transaction.getChartOfAccount());
				transactionModel.setReceiptNumber(transaction.getReceiptNumber());
				transactionModel.setDebitCreditFlag(transaction.getDebitCreditFlag());
//				transactionModel.setProject(transaction.getProject());
				transactionModel.setExplainedTransactionCategory(transaction.getExplainedTransactionCategory());
				transactionModel.setExplainedTransactionDescription(transaction.getExplainedTransactionDescription());
				transactionModel.setExplainedTransactionAttachementDescription(
						transaction.getExplainedTransactionAttachementDescription());
				transactionModel.setExplainedTransactionAttachement(transaction.getExplainedTransactionAttachement());
				transactionModel.setBankAccount(transaction.getBankAccount());
				transactionModel.setCurrentBalance(transaction.getCurrentBalance());
				transactionModel.setCreatedBy(transaction.getCreatedBy());
				transactionModel.setCreatedDate(transaction.getCreatedDate());
				transactionModel.setLastUpdatedBy(transaction.getLastUpdateBy());
				transactionModel.setLastUpdateDate(transaction.getLastUpdateDate());
				transactionModel.setDeleteFlag(transaction.getDeleteFlag());
				transactionModel.setVersionNumber(transaction.getVersionNumber());
				transactionModel.setEntryType(transaction.getEntryType());
				transactionModel.setParentTransaction(transaction.getParentTransaction());
//				transactionModel.setReferenceId(transaction.getReferenceId());
//				transactionModel.setReferenceType(transaction.getReferenceType());
//				if (transaction.getReferenceType() != null) {
//					if (transaction.getReferenceType() == TransactionRefrenceTypeConstant.INVOICE) {
//						transactionModel.setReferenceTypeName("Invoice");
//						Invoice invoice = invoiceService.findByPK(transaction.getReferenceId());
//						transactionModel.setRefObject(invoice);
//						transactionModel.setReferenceName("Invoice : " + invoice.getReferenceNumber());
//					} else if (transaction.getReferenceType() == TransactionRefrenceTypeConstant.PURCHASE) {
//						transactionModel.setReferenceTypeName("Purchase");
//						Purchase purchase = purchaseService.findByPK(transaction.getReferenceId());
//						transactionModel.setRefObject(purchase);
//						transactionModel.setReferenceName("Purchase : " + purchase.getReceiptNumber());
//					}
//				}
				transactionModelList.add(transactionModel);
			}
		}
		return transactionModelList;
	}

	public TransactionView getTransactionView(TransactionViewRestModel transactionViewModel) {
		TransactionView transactionView = new TransactionView();
		transactionView.setTransactionId(transactionViewModel.getTransactionId());
		transactionView.setTransactionDate(transactionViewModel.getTransactionDate());
		transactionView.setTransactionDescription(transactionViewModel.getTransactionDescription());
		transactionView.setTransactionAmount(transactionViewModel.getTransactionAmount());
		transactionView.setTransactionTypeName(transactionViewModel.getTransactionTypeName());
		transactionView.setDebitCreditFlag(transactionViewModel.getDebitCreditFlag());
		transactionView.setTransactionCategoryName(transactionViewModel.getTransactionCategoryName());
//		transactionView.setExplanationStatusCode(transactionViewModel.getExplanationStatusCode());
		transactionView.setExplanationStatusName(transactionViewModel.getExplanationStatusName());
		transactionView.setBankAccountId(transactionViewModel.getBankAccountId());
		transactionView.setCurrentBalance(transactionViewModel.getCurrentBalance());
		transactionView.setEntryType(transactionViewModel.getEntryType());
		transactionView.setParentTransaction(transactionViewModel.getParentTransaction());
		transactionView.setReferenceId(transactionViewModel.getReferenceId());
		transactionView.setReferenceType(transactionViewModel.getReferenceType());
		transactionView.setContactName(transactionViewModel.getContactName());
		transactionView.setReferenceName(transactionViewModel.getReferenceName());
		transactionView.setDueAmount(transactionViewModel.getDueAmount());
		transactionView.setCurrencySymbol(transactionViewModel.getCurrencySymbol());
		transactionView.setDueOn(transactionViewModel.getDueOn());
		return transactionView;
	}

	public TransactionViewRestModel getTransactionViewModel(TransactionView transactionView) {
		TransactionViewRestModel transactionViewModel = new TransactionViewRestModel();
		transactionViewModel.setTransactionId(transactionView.getTransactionId());
		transactionViewModel.setTransactionDate(transactionView.getTransactionDate());
		transactionViewModel.setTransactionDescription(transactionView.getTransactionDescription());
		transactionViewModel.setTransactionAmount(transactionView.getTransactionAmount());
		transactionViewModel.setTransactionTypeName(transactionView.getTransactionTypeName());
		transactionViewModel.setDebitCreditFlag(transactionView.getDebitCreditFlag());
		transactionViewModel.setTransactionCategoryName(transactionView.getTransactionCategoryName());
//		transactionViewModel.setExplanationStatusCode(transactionView.getExplanationStatusCode());
		transactionViewModel.setExplanationStatusName(transactionView.getExplanationStatusName());
		transactionViewModel.setBankAccountId(transactionView.getBankAccountId());
		transactionViewModel.setCurrentBalance(transactionView.getCurrentBalance());
		transactionViewModel.setEntryType(transactionView.getEntryType());
		transactionViewModel.setParentTransaction(transactionView.getParentTransaction());
		transactionViewModel.setReferenceId(transactionView.getReferenceId());
		transactionViewModel.setReferenceType(transactionView.getReferenceType());
		transactionViewModel.setContactName(transactionView.getContactName());
		transactionViewModel.setReferenceName(transactionView.getReferenceName());
		transactionViewModel.setDueAmount(transactionView.getDueAmount());
		transactionViewModel.setCurrencySymbol(transactionView.getCurrencySymbol());
		transactionViewModel.setDueOn(transactionView.getDueOn());
		if (transactionViewModel.isParent()) {
			transactionViewModel.setChildTransactionList(
					getChildTransactionViewModelList(childTransactions, transactionView.getTransactionId()));
		}
		BigDecimal remainingUnExplainedAmount = transactionViewModel.getTransactionAmount();
		for (TransactionViewRestModel childTransactionViewModel : transactionViewModel.getChildTransactionList()) {
			remainingUnExplainedAmount = remainingUnExplainedAmount
					.subtract(childTransactionViewModel.getTransactionAmount());
		}
		if (remainingUnExplainedAmount.doubleValue() > 0.00 && (transactionViewModel.getChildTransactionList() != null
				&& !transactionViewModel.getChildTransactionList().isEmpty())) {
			TransactionViewRestModel remainingUnExplainedTransactionModel = new TransactionViewRestModel();
			remainingUnExplainedTransactionModel.setTransactionId(0);
			remainingUnExplainedTransactionModel.setDebitCreditFlag(transactionView.getDebitCreditFlag());
			remainingUnExplainedTransactionModel.setExplanationStatusCode(TransactionStatusConstant.UNEXPLAINED);
			remainingUnExplainedTransactionModel.setExplanationStatusName("UNEXPLAINED");
			remainingUnExplainedTransactionModel.setTransactionAmount(remainingUnExplainedAmount);
			remainingUnExplainedTransactionModel.setParentTransaction(transactionView.getTransactionId());
			transactionViewModel.getChildTransactionList().add(remainingUnExplainedTransactionModel);

		}
		return transactionViewModel;
	}

	private List<TransactionViewRestModel> getChildTransactionViewModelList(
			Collection<TransactionViewRestModel> childTransactionList, Integer parentTransactionViewModelId) {
		List<TransactionViewRestModel> transactionModelList = new ArrayList<>();
		if (childTransactionList != null && !childTransactionList.isEmpty()) {
			childTransactionList.stream()
					.filter(transactionViewModel -> (transactionViewModel.getParentTransaction()
							.equals(parentTransactionViewModelId)))
					.forEachOrdered(transactionViewModel -> transactionModelList.add(transactionViewModel));
		}
		return transactionModelList;
	}

}
