package com.simplevat.rest.taxtransactioncontroller;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.simplevat.constant.TaxTransactionStatusConstant;
import com.simplevat.constant.TransactionCreditDebitConstant;
import com.simplevat.constant.TransactionRefrenceTypeConstant;
import com.simplevat.entity.Invoice;
import com.simplevat.entity.Purchase;
import com.simplevat.entity.PurchaseLineItem;
import com.simplevat.entity.TaxTransaction;
import com.simplevat.entity.bankaccount.Transaction;
import com.simplevat.service.InvoiceService;
import com.simplevat.service.PurchaseService;
import com.simplevat.service.TaxTransactionService;
import com.simplevat.service.bankaccount.TransactionService;

@Component
public class TaxTranscationRestHelper {

	@Autowired
	private TaxTransactionService taxTransactionService;

	@Autowired
	private TransactionService transactionService;

	@Autowired
	private InvoiceService invoiceService;

	@Autowired
	private PurchaseService purchaseService;

	private BigDecimal vatIn = new BigDecimal(0);
	private BigDecimal vatOut = new BigDecimal(0);

	public boolean isTaxTransactionExist(Date startDate, Date endDate, List<TaxTransaction> taxTransactionList) {
		for (TaxTransaction tax : taxTransactionList) {
			if (tax.getStartDate().compareTo(startDate) == 0 && tax.getEndDate().compareTo(endDate) == 0) {
				return true;
			}
		}
		for (TaxTransaction tax : taxTransactionService.getClosedTaxTransactionList()) {
				if (tax.getStartDate().compareTo(startDate) == 0 && tax.getEndDate().compareTo(endDate) == 0 && tax.getDueAmount().doubleValue() == 0) {
					return true;
				}
			}

		return false;
	}

	public List<TaxTransaction> separateTransactionCrediTAndDebit(Date startDate, Date endDate) {
		List<Transaction> transactionList = transactionService.getAllTransactions();
		List<Transaction> creditList = null;
		List<Transaction> debitList = null;
		if (transactionList != null) {
			List<Transaction> parentList = new ArrayList<>();

			for (Transaction transaction : transactionList) {
				if (transaction.getParentTransaction() != null) {
					parentList.add(transaction);
				}
			}
			transactionList.removeAll(parentList);
			creditList = getCreditTransactionList(transactionList);
			debitList = getDebitTransactionList(transactionList);

		}
		return calculateTaxPerMonth(startDate, endDate, creditList, debitList);

	}

	public List<TaxTransaction> calculateTaxPerMonth(Date startDate, Date endDate,
			List<Transaction> creditTransactionList, List<Transaction> debitTransactionList) {
		List<TaxTransaction> taxTransactionList = new ArrayList<>();

		TaxTransaction taxTransaction = new TaxTransaction();

		taxTransaction.setStartDate(startDate);

		taxTransaction.setEndDate(endDate);
		for (Transaction transaction : creditTransactionList) {
			Date transDate = Date.from(transaction.getTransactionDate().atZone(ZoneId.systemDefault()).toInstant());
//				if (transDate.compareTo(startDate) >= 0 && transDate.compareTo(endDate) <= 0 && transaction.getReferenceId() != null) {
//					vatIn = vatIn.add(getVatFromTransaction(transaction));
//				}
			}
		for (Transaction transaction : debitTransactionList) {
			Date transactionDate = Date
					.from(transaction.getTransactionDate().atZone(ZoneId.systemDefault()).toInstant());
//				if (transactionDate.compareTo(startDate) >= 0 && transactionDate.compareTo(endDate) <= 0 && transaction.getReferenceId() != null) {
//					vatOut = vatOut.add(getVatFromTransaction(transaction));
//				}
			}


		taxTransaction.setVatIn(vatIn);

		taxTransaction.setVatOut(vatOut);

		taxTransaction.setStatus(TaxTransactionStatusConstant.OPEN);

		taxTransactionList.add(taxTransaction);
		return taxTransactionList;
	}

	public List<Transaction> getCreditTransactionList(List<Transaction> transactionList) {

		List<Transaction> creditTransactionList = new ArrayList<>();
		for (Transaction transaction : transactionList) {
			if (transaction.getDebitCreditFlag() == TransactionCreditDebitConstant.CREDIT) {
				creditTransactionList.add(transaction);
			}
		}
		return creditTransactionList;
	}

	private List<Transaction> getDebitTransactionList(List<Transaction> transactionList) {
		List<Transaction> debitTransactionList = new ArrayList<>();
		for (Transaction transaction : transactionList) {
			if (transaction.getDebitCreditFlag() == TransactionCreditDebitConstant.DEBIT) {
				debitTransactionList.add(transaction);
			}
		}
		return debitTransactionList;
	}

	public Date getStartDate() {
		try {
			Calendar prevYear = Calendar.getInstance();
			prevYear.set(Calendar.DAY_OF_MONTH, 1);
			prevYear.set(Calendar.HOUR_OF_DAY, 0);
			prevYear.set(Calendar.MINUTE, 0);
			prevYear.set(Calendar.SECOND, 0);
			prevYear.set(Calendar.MILLISECOND, 0);
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			return sdf.parse(sdf.format(prevYear.getTime()));

		} catch (ParseException ex) {
			Logger.getLogger(TaxTransactionController.class.getName()).log(Level.SEVERE, null, ex);
		}
		return new Date();
	}

	public Date getEndDate() {
		try {
			Calendar preMonth = Calendar.getInstance();
			preMonth.set(Calendar.DAY_OF_MONTH, 1);
			preMonth.add(Calendar.MONTH, 1);
			preMonth.add(Calendar.DAY_OF_MONTH, -1);
			preMonth.set(Calendar.HOUR_OF_DAY, 0);
			preMonth.set(Calendar.MINUTE, 0);
			preMonth.set(Calendar.SECOND, 0);
			preMonth.set(Calendar.MILLISECOND, 0);
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			return sdf.parse(sdf.format(preMonth.getTime()));

		} catch (ParseException ex) {
			Logger.getLogger(TaxTransactionController.class.getName()).log(Level.SEVERE, null, ex);
		}
		return new Date();
	}

	public BigDecimal getVatFromTransaction(Transaction transaction) {
//		Integer refId = transaction.getReferenceId();
		BigDecimal totalVat = BigDecimal.ZERO;
		BigDecimal vatPercent = BigDecimal.ZERO;
//		if (transaction.getReferenceType() == TransactionRefrenceTypeConstant.INVOICE) {
//			Invoice invoice= invoiceService.findByPK(refId);
//		}
//		if (transaction.getReferenceType() == TransactionRefrenceTypeConstant.PURCHASE) {
//			Purchase purchase = purchaseService.findByPK(refId);
//			for (PurchaseLineItem purchaseLineItem : purchase.getPurchaseLineItems()) {
//				BigDecimal totalAmount = purchaseLineItem.getPurchaseLineItemUnitPrice()
//						.multiply(new BigDecimal(purchaseLineItem.getPurchaseLineItemQuantity()));
//				if (purchaseLineItem.getPurchaseLineItemVat() != null) {
//					vatPercent = purchaseLineItem.getPurchaseLineItemVat().getVat();
//				}
//				totalVat = (totalAmount.multiply(vatPercent)).divide(new BigDecimal(100), 5, RoundingMode.HALF_UP);
//			}
//		}
		return totalVat;
	}

}
