package com.simpleaccounts.rest.taxescontroller;

import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.service.ExpenseService;
import com.simpleaccounts.service.InvoiceService;
import com.simpleaccounts.service.PaymentService;
import com.simpleaccounts.service.ReceiptService;
import com.simpleaccounts.service.bankaccount.TransactionService;

import com.simpleaccounts.utils.DateFormatUtil;
import com.simpleaccounts.utils.DateUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

import java.util.ArrayList;

import java.util.List;
	@Service
	@SuppressWarnings("java:S115")
	public class TaxesRestHelper {
    private static final String DATE_FORMAT_DD_SLASH_MM_SLASH_YYYY = "dd/MM/yyyy";

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private ReceiptService receiptService;

    @Autowired
    private TransactionService transactionService;
    @Autowired
    private DateUtils dateUtils;
    @Autowired
    private DateFormatUtil dateFormtUtil;

    public  List<VatListModel> getListModel(Object vatTransation) {
        List<VatListModel> vatListModels = new ArrayList<>();
        if (vatTransation != null) {
            for (JournalLineItem journalLineItem : (List<JournalLineItem>) vatTransation) {
                VatListModel model = new VatListModel();
                model.setId(journalLineItem.getId());
                model.setVatType(journalLineItem.getTransactionCategory().getTransactionCategoryName());
                model.setReferenceType(journalLineItem.getReferenceType().getDisplayName());
                model.setDate(dateFormtUtil.getLocalDateTimeAsString(journalLineItem.getCreatedDate(), DATE_FORMAT_DD_SLASH_MM_SLASH_YYYY));
                switch (journalLineItem.getReferenceType()) {
                    case INVOICE:
                        Invoice invoice = invoiceService.findByPK(journalLineItem.getReferenceId());
                        if (invoice != null){
                            model.setAmount(BigDecimal.valueOf(invoice.getTotalAmount().floatValue()-invoice.getTotalVatAmount().floatValue()));
                            model.setVatAmount(invoice.getTotalVatAmount());
                            model.setCustomerName(invoice.getContact().getFirstName());
                            if (invoice.getInvoiceDate() != null) {
                                model.setInvoiceDate(dateFormtUtil.getLocalDateTimeAsString(invoice.getInvoiceDate().atStartOfDay(), DATE_FORMAT_DD_SLASH_MM_SLASH_YYYY));
                            }
                            if(invoice.getContact().getCountry()!=null) {
                                model.setCountryName(invoice.getContact().getCountry().getCountryName());
                            }
                            model.setInvoiceNumber(invoice.getReferenceNumber());
                            model.setTaxRegistrationNo(invoice.getContact().getVatRegistrationNumber());
                        }
                        break;
                    case EXPENSE:
                        Expense expense = expenseService.findByPK(journalLineItem.getReferenceId());
                        if(expense != null){

                            model.setAmount(expense.getExpenseAmount());
                            model.setVatAmount(expense.getExpenseVatAmount());

                        }
                        break;
                        case PAYMENT:
                        Payment payment = paymentService.findByPK(journalLineItem.getReferenceId());
                        if (payment != null){
                            model.setAmount(payment.getInvoiceAmount());
                            model.setVatAmount(
                                    journalLineItem.getDebitAmount() != null ? journalLineItem.getDebitAmount() :
                                            journalLineItem.getCreditAmount());
                            model.setTaxRegistrationNo(payment.getInvoice().getContact().getVatRegistrationNumber());
                            model.setInvoiceNumber(payment.getInvoice().getReferenceNumber());
                           //model.setInvoiceDate(payment.getInvoice().getInvoiceDate());
                        }
                          break;
                    case RECEIPT:
                        Receipt receipt = receiptService.findByPK(journalLineItem.getReferenceId());
                        if (receipt != null){
                            model.setAmount(receipt.getAmount());
                            model.setVatAmount(
                                    journalLineItem.getDebitAmount() != null ? journalLineItem.getDebitAmount() :
                                            journalLineItem.getCreditAmount());
                        }
                        break;
                    case TRANSACTION_RECONSILE:
                        Transaction transaction = transactionService.findByPK(journalLineItem.getReferenceId());
                        if(transaction != null){
                            model.setAmount(transaction.getTransactionAmount());
                            model.setVatAmount( journalLineItem.getDebitAmount() != null ? journalLineItem.getDebitAmount() :
                                    journalLineItem.getCreditAmount());
                        }
                        break;
                    default:
                        break;
                }
                vatListModels.add(model);

            }
        }
        return vatListModels;
    }

}
