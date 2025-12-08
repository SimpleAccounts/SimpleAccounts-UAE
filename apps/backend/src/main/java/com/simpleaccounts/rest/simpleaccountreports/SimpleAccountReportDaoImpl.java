package com.simpleaccounts.rest.simpleaccountreports;
import com.simpleaccounts.constant.*;
import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.impl.TransactionCategoryClosingBalanceDaoImpl;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.repository.*;

import com.simpleaccounts.rest.creditnotecontroller.CreditNoteRepository;
import com.simpleaccounts.rest.invoicecontroller.InvoiceRestHelper;
import com.simpleaccounts.rest.payroll.PayrollRestHepler;
import com.simpleaccounts.rest.simpleaccountreports.Aging.AgingListModel;
import com.simpleaccounts.rest.simpleaccountreports.Aging.AgingRequestModel;
import com.simpleaccounts.rest.simpleaccountreports.Aging.AgingResponseModel;
import com.simpleaccounts.rest.simpleaccountreports.FTA.*;
import com.simpleaccounts.rest.simpleaccountreports.soa.StatementOfAccountRequestModel;
import com.simpleaccounts.rest.simpleaccountreports.soa.StatementOfAccountResponseModel;
import com.simpleaccounts.rest.simpleaccountreports.soa.TransactionsModel;
import com.simpleaccounts.service.*;
import com.simpleaccounts.utils.DateFormatUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import javax.persistence.Query;
import java.math.BigDecimal;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class SimpleAccountReportDaoImpl<getFtaAuditReport> extends AbstractDao<Integer, SalesByCustomerModel> implements SimpleAccountReportDao {

    @Autowired
    private DateFormatUtil dateUtil;
    private static final Logger LOGGER = LoggerFactory.getLogger(TransactionCategoryClosingBalanceDaoImpl.class);
    @Autowired
    private InvoiceRestHelper invoiceRestHelper;
    @Autowired
    private InvoiceService invoiceService;
    @Autowired
    private InvoiceLineItemService lineItemService;
    @Autowired
    private ContactTransactionCategoryService contactTransactionCategoryService;
    @Autowired
    private TransactionCategoryBalanceService transactionCategoryBalanceService;
    @Autowired
    private UserService userService;

    @Autowired
    private JournalLineItemService journalLineItemService;
    @Autowired
    private PayrollRestHepler payrollRestHepler;

    @Autowired
    private DateFormatUtil dateUtils;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private TaxAgencyRepository taxAgencyRepository;

    @Autowired
    private InvoiceLineitemRepository invoiceLineitemRepository;

    @Autowired
    private InvoiceReceiptRepository invoiceReceiptRepository;
    @Autowired
    private DateFormatUtil dateFormtUtil;

    @Autowired
    private InvoicePaymentRepository invoicePaymentRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;
    @Autowired
    private JournalLineItemRepository journalLineItemRepository;
    @Autowired
    private TransactionRepository transactionRepository;
    @Autowired
    private CreditNoteRepository creditNoteRepository;
    @Autowired
    private TransactionExplanationRepository transactionExplanationRepository;

    @Autowired
    private CreditNoteLineItemRepository creditNoteLineItemRepository ;


    public SalesByCustomerResponseModel getSalesByCustomer(ReportRequestModel requestModel,
                                                           SalesByCustomerResponseModel salesByCustomerResponseModel){

        List<SalesByCustomerModel> salesByCustomerModelList = new ArrayList<>();
        BigDecimal totalExcludingVat = BigDecimal.ZERO;
        BigDecimal total = BigDecimal.ZERO;
        String quertStr = "SELECT i.contact.contactId as ContactId, c.firstName as Name, count(DISTINCT i.id) as InvoiceCount, " +
                "Sum(i.totalAmount*i.exchangeRate) as TotalAmount, Sum(i.totalVatAmount*i.exchangeRate) as TotalVatAmount, " +
                "c.lastName as lastName, c.organization as organization " +
                "FROM Invoice i, Contact c WHERE i.contact.contactId = c.contactId and i.type = 2 " +
                "and i.status NOT IN (2) and i.deleteFlag = false " +
                "and i.invoiceDate BETWEEN :startDate and :endDate  " +
                "GROUP by i.contact.contactId, c.firstName, c.lastName, c.organization";
        Query query = getEntityManager().createQuery(quertStr);
        query.setParameter("startDate", requestModel.getStartDate().toLocalDate());
        query.setParameter("endDate", requestModel.getEndDate().toLocalDate());
        List<Object> list = query.getResultList();

        for (Object object : list) {
            Object[] objectArray = (Object[])object;
            SalesByCustomerModel salesByCustomerModel = new SalesByCustomerModel();
            salesByCustomerModel.setInvoiceId((Integer)objectArray[0]);
            String organisation = (String) objectArray[6];
            if (organisation != null && !organisation.isEmpty()) {
                salesByCustomerModel.setCustomerName(organisation);
            } else {
                salesByCustomerModel.setCustomerName((String)objectArray[1]+" "+(String)objectArray[5]);
            }
            salesByCustomerModel.setInvoiceCount((Long)objectArray[2]);
            BigDecimal sal = (BigDecimal) objectArray[3] ;
            BigDecimal vat = (BigDecimal) objectArray[4] ;

            Integer contactId = (Integer) objectArray[0];
            List<Invoice> invoiceList = invoiceRepository.getInvoicesForReport(contactId,
                    requestModel.getStartDate().toLocalDate(), requestModel.getEndDate().toLocalDate(), 2);

            for(Invoice invoice : invoiceList) {
                CreditNote creditNote = creditNoteRepository.findByInvoiceIdAndDeleteFlag(invoice.getId(), false);
                if (creditNote.getStatus() != 2) {
                    sal = sal.subtract(creditNote.getTotalAmount());
                    vat = vat.subtract(creditNote.getTotalVatAmount() != null ? creditNote.getTotalVatAmount() : BigDecimal.ZERO);
                }
            }

            salesByCustomerModel.setSalesExcludingvat(sal.subtract(vat));
            salesByCustomerModel.setGetSalesWithvat(sal);
            totalExcludingVat = totalExcludingVat.add(sal.subtract(vat));
            total = total.add(sal);
            salesByCustomerModelList.add(salesByCustomerModel);

        }
        salesByCustomerResponseModel.setSBCustomerList(salesByCustomerModelList);
        salesByCustomerResponseModel.setTotalExcludingVat(totalExcludingVat);
        salesByCustomerResponseModel.setTotalAmount(total);

        return salesByCustomerResponseModel;
    }

    public PurchseByVendorResponseModel getPurchaseByVendor(ReportRequestModel requestModel,
                                                            PurchseByVendorResponseModel purchseByVendorResponseModel) {

        List<PurchaseByVendorModel> purchaseByVendorModelList = new ArrayList<>();
        BigDecimal totalExcludingVat = BigDecimal.ZERO;
        BigDecimal total = BigDecimal.ZERO;
        String quertStr = "SELECT i.contact.contactId as ContactId, c.firstName as firstName, count(i.id) as InvoiceCount, " +
                "Sum(i.totalAmount*i.exchangeRate) as TotalAmount, Sum(i.totalVatAmount*i.exchangeRate) as TotalVatAmount, " +
                "c.lastName as lastName, c.organization as organization FROM Invoice i, Contact c " +
                "WHERE i.contact.contactId=c.contactId and i.type=1 and i.status NOT IN (2) and i.deleteFlag = false " +
                "and i.invoiceDate BETWEEN :startDate and :endDate " +
                "GROUP by i.contact.contactId, c.firstName, c.lastName, c.organization";
        Query query = getEntityManager().createQuery(quertStr);
        query.setParameter("startDate", requestModel.getStartDate().toLocalDate());
        query.setParameter("endDate", requestModel.getEndDate().toLocalDate());
        List<Object> list = query.getResultList();

        for (Object object : list) {
            Object[] objectArray = (Object[])object;
            PurchaseByVendorModel purchaseByVendorModel = new PurchaseByVendorModel();
            purchaseByVendorModel.setInvoiceId((Integer)objectArray[0]);
            String organisation = (String) objectArray[6];
            if (organisation != null && !organisation.isEmpty()) {
                purchaseByVendorModel.setVendorName(organisation);
            } else {
                purchaseByVendorModel.setVendorName(objectArray[1] +" "+ objectArray[5]);
            }
            purchaseByVendorModel.setInvoiceCount((Long)objectArray[2]);
            BigDecimal pur = (BigDecimal) objectArray[3] ;
            BigDecimal vat = (BigDecimal) objectArray[4] ;

            Integer contactId = (Integer) objectArray[0];
            List<Invoice> invoiceList = invoiceRepository.getInvoicesForReport(contactId,
                    requestModel.getStartDate().toLocalDate(), requestModel.getEndDate().toLocalDate(), 1);

            for(Invoice invoice : invoiceList) {
                CreditNote creditNote = creditNoteRepository.findByInvoiceIdAndDeleteFlag(invoice.getId(), false);
                if (creditNote.getStatus() != 2) {
                    pur = pur.subtract(creditNote.getTotalAmount());
                    vat = vat.subtract(creditNote.getTotalVatAmount() != null ? creditNote.getTotalVatAmount() : BigDecimal.ZERO);
                }
            }
            purchaseByVendorModel.setSalesExcludingvat(pur.subtract(vat));
            purchaseByVendorModel.setGetSalesWithvat(pur);
            totalExcludingVat = totalExcludingVat.add(pur.subtract(vat));
            total = total.add(pur);
            purchaseByVendorModelList.add(purchaseByVendorModel);
        }
        purchseByVendorResponseModel.setPByVendorList(purchaseByVendorModelList);
        purchseByVendorResponseModel.setTotalExcludingVat(totalExcludingVat);
        purchseByVendorResponseModel.setTotalAmount(total);
        return purchseByVendorResponseModel;
    }

    public List<SalesByProductModel> getSalesByProduct(ReportRequestModel requestModel){
        List<SalesByProductModel> salesByProductModelList = new ArrayList<>();
        String queryStr =  "select ilt.product.productID, ilt.product.productName, sum(ilt.quantity), " +
                "sum(ilt.unitPrice*ilt.quantity), avg(ilt.unitPrice) " +
                "from InvoiceLineItem ilt " +
                "where ilt.invoice.type = 2 and ilt.invoice.status not in (2) " +
                "and ilt.invoice.invoiceDate BETWEEN :startDate and :endDate " +
                "GROUP BY ilt.product.productID, ilt.product.productName " +
                "ORDER BY ilt.product.productName ASC";
        Query query = getEntityManager().createQuery(queryStr);
        query.setParameter("startDate", requestModel.getStartDate().toLocalDate());
        query.setParameter("endDate", requestModel.getEndDate().toLocalDate());
        List<Object> list = query.getResultList();

        List<CreditNoteLineItem> creditNoteLineItems = creditNoteLineItemRepository
                .findAllByDates(requestModel.getStartDate().toLocalDate(), requestModel.getEndDate().toLocalDate())
                .stream()
                .filter(item -> item.getCreditNote().getStatus() != 2 && item.getCreditNote().getType() == 7)
                .collect(Collectors.toList());

        Map<Integer, BigDecimal> creditNoteAmountMap = new HashMap<>();
        Map<Integer, Long> creditNoteQuantityMap = new HashMap<>();

        for (CreditNoteLineItem creditNoteLineItem : creditNoteLineItems) {
            Integer productId = creditNoteLineItem.getProduct().getProductID();
            BigDecimal subTotal = creditNoteLineItem.getSubTotal();
            BigDecimal vatAmount = creditNoteLineItem.getVatAmount() != null ? creditNoteLineItem.getVatAmount() : BigDecimal.ZERO;
            Long quantity = Long.valueOf(creditNoteLineItem.getQuantity());

            // Accumulate the subtotal for this product ID
            creditNoteAmountMap.put(productId, creditNoteAmountMap.getOrDefault(productId, BigDecimal.ZERO)
                    .add(subTotal.subtract(vatAmount)));

            // Accumulate the quantity for this product ID
            creditNoteQuantityMap.put(productId, creditNoteQuantityMap.getOrDefault(productId, 0L) + quantity);
        }

        for (Object object : list) {
            Object[] objectArray = (Object[]) object;

            Integer productId = (Integer) objectArray[0];
            BigDecimal totalAmountForAProduct = (BigDecimal) objectArray[3];
            Long quantitySold = (Long) objectArray[2];

            if (creditNoteAmountMap.containsKey(productId)) {
                totalAmountForAProduct = totalAmountForAProduct.subtract(creditNoteAmountMap.get(productId));
                quantitySold -= creditNoteQuantityMap.get(productId);
            }
            double averageAmount = 0;
            if (quantitySold != 0) {
               averageAmount = totalAmountForAProduct
                        .divide(BigDecimal.valueOf(quantitySold)).doubleValue();
            }

            SalesByProductModel salesByProductModel = new SalesByProductModel();
            salesByProductModel.setProductId(productId);
            salesByProductModel.setProductName((String) objectArray[1]);
            salesByProductModel.setQuantitySold(quantitySold);
            salesByProductModel.setTotalAmountForAProduct(totalAmountForAProduct);
            salesByProductModel.setAverageAmount(averageAmount);
            salesByProductModelList.add(salesByProductModel);
        }
        return salesByProductModelList;
    }

    public ResponseModelStatementOfAccounts getStatementOfAccounts(ReportRequestModel requestModel,Integer contactId){

        ResponseModelStatementOfAccounts responseModelStatementOfAccounts = new ResponseModelStatementOfAccounts();
        List<StatementOfAccountsModel> statementOfAccountsModelList = new ArrayList<>();
        List<JournalLineItem> journalLineItemList = journalLineItemRepository.findAllForCustomerAccountsStatement();
        BigDecimal balanceTotal = BigDecimal.ZERO;
        for(JournalLineItem lineItem : journalLineItemList){
            StatementOfAccountsModel model = new StatementOfAccountsModel();
            PostingReferenceTypeEnum postingType = lineItem.getReferenceType();
            switch (postingType) {
                case INVOICE:

                    Invoice invoice = invoiceRepository.findById(lineItem.getReferenceId()).get();
                    if(invoice!=null) {
                        if (invoice.getType().equals(2)) {
                            model.setContactId(invoice.getContact().getContactId());
                            model.setInvoiceId(invoice.getId());
                            model.setType("Customer Invoice");
                            model.setInvoiceNumber(invoice.getReferenceNumber());
                            model.setTotalAmount(lineItem.getDebitAmount());
                            model.setContactName(invoice.getContact().getFirstName() + " " + invoice.getContact().getLastName());
                            model.setInvoiceDate(invoice.getInvoiceDate());
                            if(contactId == null){
                                statementOfAccountsModelList.add(model);
                                balanceTotal = balanceTotal.add(lineItem.getDebitAmount());
                            }
                            else if(contactId.equals(invoice.getContact().getContactId())) {
                                statementOfAccountsModelList.add(model);
                                balanceTotal = balanceTotal.add(lineItem.getDebitAmount());
                            }

                        }
                    }

                    break;
                case RECEIPT:
                    Transaction transaction = transactionRepository.findById(lineItem.getReferenceId()).get();
                    if(transaction!=null) {
                        if (!transaction.getTransactionExplinationStatusEnum().equals(TransactionExplinationStatusEnum.NOT_EXPLAIN)) {

                            model.setContactId(transaction.getExplinationCustomer().getContactId());
                            model.setInvoiceId(transaction.getTransactionId());
                            model.setType("Customer Payment");
                            model.setInvoiceNumber(transaction.getTransactionId().toString());
                            model.setTotalAmount(lineItem.getCreditAmount().negate());
                            model.setContactName(transaction.getExplinationCustomer().getFirstName() + " " + transaction.getExplinationCustomer().getLastName());
                            model.setInvoiceDate(transaction.getTransactionDate().toLocalDate());
                            if(contactId == null){
                                statementOfAccountsModelList.add(model);
                                balanceTotal = balanceTotal.subtract(lineItem.getCreditAmount());
                            }
                            else if(contactId.equals(transaction.getExplinationCustomer().getContactId())) {
                                statementOfAccountsModelList.add(model);
                                balanceTotal = balanceTotal.subtract(lineItem.getCreditAmount());
                            }

                        }
                    }
                    break;
                case BANK_RECEIPT:
                    Transaction transaction1 = transactionRepository.findById(lineItem.getReferenceId()).get();
                    if(transaction1!=null) {
                       TransactionExplanation transactionExplanation = transactionExplanationRepository.getByTransactionAndDeleteFlag(transaction1,false);
                           if(transactionExplanation != null) {
                                   model.setContactId(transaction1.getExplinationCustomer().getContactId());
                                   model.setInvoiceId(transaction1.getTransactionId());
                                   model.setType("Bank Customer Payment");
                                   model.setInvoiceNumber(transaction1.getTransactionId().toString());
                                   model.setTotalAmount(lineItem.getCreditAmount().negate());
                                   model.setContactName(transaction1.getExplinationCustomer().getFirstName() + " " + transaction1.getExplinationCustomer().getLastName());
                                   model.setInvoiceDate(transaction1.getTransactionDate().toLocalDate());
                                   if (contactId == null) {
                                       statementOfAccountsModelList.add(model);
                                       balanceTotal = balanceTotal.subtract(lineItem.getCreditAmount());
                                   } else if (contactId.equals(transaction1.getExplinationCustomer().getContactId())) {
                                       statementOfAccountsModelList.add(model);
                                       balanceTotal = balanceTotal.subtract(lineItem.getCreditAmount());
                                   }
                       }
                    }

                    break;
                case CREDIT_NOTE:
                    try {
                        CreditNote creditNote = creditNoteRepository.findById(lineItem.getReferenceId()).get();
                        if (creditNote != null) {
                            if (creditNote.getType().equals(7)) {
                                model.setContactId(creditNote.getContact().getContactId());
                                model.setInvoiceId(creditNote.getCreditNoteId());
                                model.setType("Credit Note");
                                model.setInvoiceNumber(creditNote.getCreditNoteNumber());
                                model.setTotalAmount(lineItem.getCreditAmount().negate());
                                model.setContactName(creditNote.getContact().getFirstName() + " " + creditNote.getContact().getLastName());
                                Date date = Date.from(creditNote.getCreditNoteDate().toInstant());
                                model.setCreditNoteDate(date);
                                if (contactId == null) {
                                    statementOfAccountsModelList.add(model);
                                    balanceTotal = balanceTotal.subtract(lineItem.getCreditAmount());
                                } else if (contactId.equals(creditNote.getContact().getContactId())) {
                                    statementOfAccountsModelList.add(model);
                                    balanceTotal = balanceTotal.subtract(lineItem.getCreditAmount());
                                }

                            }
                        }
                    }
                    catch (Exception e){

                    }

                    break;

                case REFUND:
                    CreditNote creditNote1 = creditNoteRepository.findById(lineItem.getReferenceId()).get();
                    if(creditNote1!=null) {
                        if (creditNote1.getType().equals(7)) {
                            model.setContactId(creditNote1.getContact().getContactId());
                            model.setInvoiceId(creditNote1.getCreditNoteId());
                            model.setType("Credit Note Refund");
                            model.setInvoiceNumber(creditNote1.getCreditNoteNumber());
                            model.setTotalAmount(lineItem.getDebitAmount());
                            model.setContactName(creditNote1.getContact().getFirstName() + " " + creditNote1.getContact().getLastName());
                            model.setInvoiceDate(lineItem.getJournal().getTransactionDate());
                            if(contactId == null){
                                statementOfAccountsModelList.add(model);
                                balanceTotal = balanceTotal.add(lineItem.getDebitAmount());
                            }
                            else if(contactId.equals(creditNote1.getContact().getContactId())) {
                                statementOfAccountsModelList.add(model);
                                balanceTotal = balanceTotal.add(lineItem.getDebitAmount());
                            }

                        }
                    }

                    break;
            }
        }

        responseModelStatementOfAccounts.setStatementOfAccountsModels(statementOfAccountsModelList);
        responseModelStatementOfAccounts.setBalanceAmountTotal(balanceTotal);
        return responseModelStatementOfAccounts;
    }

    public ResponseModelStatementOfAccounts getsupplierStatementOfAccounts(ReportRequestModel requestModel,Integer contactId){

        ResponseModelStatementOfAccounts responseModelStatementOfAccounts = new ResponseModelStatementOfAccounts();
        List<StatementOfAccountsModel> statementOfAccountsModelList = new ArrayList<>();
        List<JournalLineItem> journalLineItemList = journalLineItemRepository.findAllForSupplierAccountsStatement();
        BigDecimal balanceTotal = BigDecimal.ZERO;
        for(JournalLineItem lineItem : journalLineItemList){
            StatementOfAccountsModel model = new StatementOfAccountsModel();
            PostingReferenceTypeEnum postingType = lineItem.getReferenceType();
            switch (postingType) {
                case INVOICE:

                    Invoice invoice = invoiceRepository.findById(lineItem.getReferenceId()).get();
                    if(invoice!=null) {
                        if (invoice.getType().equals(1)) {
                            model.setContactId(invoice.getContact().getContactId());
                            model.setInvoiceId(invoice.getId());
                            model.setType("Supplier Invoice");
                            model.setInvoiceNumber(invoice.getReferenceNumber());
                            model.setTotalAmount(lineItem.getDebitAmount());
                            model.setContactName(invoice.getContact().getFirstName() + " " + invoice.getContact().getLastName());
                            model.setInvoiceDate(invoice.getInvoiceDate());
                            if(contactId == null){
                                statementOfAccountsModelList.add(model);
                                balanceTotal = balanceTotal.add(lineItem.getDebitAmount());
                            }
                            else if(contactId.equals(invoice.getContact().getContactId())) {
                                statementOfAccountsModelList.add(model);
                                balanceTotal = balanceTotal.add(lineItem.getDebitAmount());
                            }

                        }
                    }

                    break;
                case PAYMENT:
                    Transaction transaction = transactionRepository.findById(lineItem.getReferenceId()).get();
                    if(transaction!=null) {
                        if (!transaction.getTransactionExplinationStatusEnum().equals(TransactionExplinationStatusEnum.NOT_EXPLAIN)) {

                            model.setContactId(transaction.getExplinationVendor().getContactId());
                            model.setInvoiceId(transaction.getTransactionId());
                            model.setType("Supplier Payment");
                            model.setInvoiceNumber(transaction.getTransactionId().toString());
                            model.setTotalAmount(lineItem.getCreditAmount().negate());
                            model.setContactName(transaction.getExplinationVendor().getFirstName() + " " + transaction.getExplinationVendor().getLastName());
                            model.setInvoiceDate(transaction.getTransactionDate().toLocalDate());
                            if(contactId == null){
                                statementOfAccountsModelList.add(model);
                                balanceTotal = balanceTotal.subtract(lineItem.getCreditAmount());
                            }
                            else if(contactId.equals(transaction.getExplinationVendor().getContactId())) {
                                statementOfAccountsModelList.add(model);
                                balanceTotal = balanceTotal.subtract(lineItem.getCreditAmount());
                            }

                        }
                    }
                    break;
                case BANK_PAYMENT:
                    Transaction transaction1 = transactionRepository.findById(lineItem.getReferenceId()).get();
                    if(transaction1!=null) {
                        TransactionExplanation transactionExplanation = transactionExplanationRepository.getByTransactionAndDeleteFlag(transaction1,false);
                        if(transactionExplanation != null) {
                            model.setContactId(transaction1.getExplinationVendor().getContactId());
                            model.setInvoiceId(transaction1.getTransactionId());
                            model.setType("Bank Supplier Payment");
                            model.setInvoiceNumber(transaction1.getTransactionId().toString());
                            model.setTotalAmount(lineItem.getCreditAmount().negate());
                            model.setContactName(transaction1.getExplinationVendor().getFirstName() + " " + transaction1.getExplinationVendor().getLastName());
                            model.setInvoiceDate(transaction1.getTransactionDate().toLocalDate());
                            if (contactId == null) {
                                statementOfAccountsModelList.add(model);
                                balanceTotal = balanceTotal.subtract(lineItem.getCreditAmount());
                            } else if (contactId.equals(transaction1.getExplinationVendor().getContactId())) {
                                statementOfAccountsModelList.add(model);
                                balanceTotal = balanceTotal.subtract(lineItem.getCreditAmount());
                            }
                        }
                    }

                    break;
                case DEBIT_NOTE:
                    try {
                        CreditNote creditNote = creditNoteRepository.findById(lineItem.getReferenceId()).get();
                        if (creditNote != null) {
                            if (creditNote.getType().equals(13)) {
                                model.setContactId(creditNote.getContact().getContactId());
                                model.setInvoiceId(creditNote.getCreditNoteId());
                                model.setType("Debit Note");
                                model.setInvoiceNumber(creditNote.getCreditNoteNumber());
                                model.setTotalAmount(lineItem.getCreditAmount().negate());
                                model.setContactName(creditNote.getContact().getFirstName() + " " + creditNote.getContact().getLastName());
                                Date date = Date.from(creditNote.getCreditNoteDate().toInstant());
                                model.setCreditNoteDate(date);
                                if (contactId == null) {
                                    statementOfAccountsModelList.add(model);
                                    balanceTotal = balanceTotal.subtract(lineItem.getCreditAmount());
                                } else if (contactId.equals(creditNote.getContact().getContactId())) {
                                    statementOfAccountsModelList.add(model);
                                    balanceTotal = balanceTotal.subtract(lineItem.getCreditAmount());
                                }

                            }
                        }
                    }
                    catch (Exception e){

                    }

                    break;

                case REFUND:
                    CreditNote creditNote1 = creditNoteRepository.findById(lineItem.getReferenceId()).get();
                    if(creditNote1!=null) {
                        if (creditNote1.getType().equals(13)) {
                            model.setContactId(creditNote1.getContact().getContactId());
                            model.setInvoiceId(creditNote1.getCreditNoteId());
                            model.setType("Debit Note Refund");
                            model.setInvoiceNumber(creditNote1.getCreditNoteNumber());
                            model.setTotalAmount(lineItem.getDebitAmount());
                            model.setContactName(creditNote1.getContact().getFirstName() + " " + creditNote1.getContact().getLastName());
                            model.setInvoiceDate(lineItem.getJournal().getTransactionDate());
                            if(contactId == null){
                                statementOfAccountsModelList.add(model);
                                balanceTotal = balanceTotal.add(lineItem.getDebitAmount());
                            }
                            else if(contactId.equals(creditNote1.getContact().getContactId())) {
                                statementOfAccountsModelList.add(model);
                                balanceTotal = balanceTotal.add(lineItem.getDebitAmount());
                            }

                        }
                    }

                    break;
            }
        }

        responseModelStatementOfAccounts.setStatementOfAccountsModels(statementOfAccountsModelList);
        responseModelStatementOfAccounts.setBalanceAmountTotal(balanceTotal);
        return responseModelStatementOfAccounts;
    }
    public List<PurchaseByProductModel> getPurchaseByProduct(ReportRequestModel requestModel){
        List<PurchaseByProductModel> purchaseByProductModelList = new ArrayList<>();
        String queryStr =  "select ilt.product.productID, ilt.product.productName, sum(ilt.quantity), " +
                "sum(ilt.unitPrice*ilt.quantity), avg(ilt.unitPrice) " +
                "from InvoiceLineItem ilt " +
                "where ilt.invoice.type = 1 and ilt.invoice.status not in (2) " +
                "and ilt.invoice.invoiceDate BETWEEN :startDate and :endDate " +
                "GROUP BY ilt.product.productID, ilt.product.productName " +
                "ORDER BY ilt.product.productName ASC";
        Query query = getEntityManager().createQuery(queryStr);
        query.setParameter("startDate", requestModel.getStartDate().toLocalDate());
        query.setParameter("endDate", requestModel.getEndDate().toLocalDate());
        List<Object> list = query.getResultList();

        List<CreditNoteLineItem> creditNoteLineItems = creditNoteLineItemRepository
                .findAllByDates(requestModel.getStartDate().toLocalDate(), requestModel.getEndDate().toLocalDate())
                .stream()
                .filter(item -> item.getCreditNote().getStatus() != 2 && item.getCreditNote().getType() == 13)
                .collect(Collectors.toList());

        Map<Integer, BigDecimal> creditNoteAmountMap = new HashMap<>();
        Map<Integer, Long> creditNoteQuantityMap = new HashMap<>();

        for (CreditNoteLineItem creditNoteLineItem : creditNoteLineItems) {
            Integer productId = creditNoteLineItem.getProduct().getProductID();
            BigDecimal subTotal = creditNoteLineItem.getSubTotal();
            BigDecimal vatAmount = creditNoteLineItem.getVatAmount() != null ? creditNoteLineItem.getVatAmount() : BigDecimal.ZERO;
            Long quantity = Long.valueOf(creditNoteLineItem.getQuantity());

            // Accumulate the subtotal for this product ID
            creditNoteAmountMap.put(productId, creditNoteAmountMap.getOrDefault(productId, BigDecimal.ZERO)
                    .add(subTotal.subtract(vatAmount)));

            // Accumulate the quantity for this product ID
            creditNoteQuantityMap.put(productId, creditNoteQuantityMap.getOrDefault(productId, 0L) + quantity);
        }

        for (Object object : list) {
            Object[] objectArray = (Object[]) object;

            Integer productId = (Integer) objectArray[0];
            BigDecimal totalAmountForAProduct = (BigDecimal) objectArray[3];
            Long quantitySold = (Long) objectArray[2];

            if (creditNoteAmountMap.containsKey(productId)) {
                totalAmountForAProduct = totalAmountForAProduct.subtract(creditNoteAmountMap.get(productId));
                quantitySold -= creditNoteQuantityMap.get(productId);
            }

            double averageAmount = 0;
            if (quantitySold != 0) {
                averageAmount = totalAmountForAProduct
                        .divide(BigDecimal.valueOf(quantitySold)).doubleValue();
            }

            PurchaseByProductModel purchaseByProductModel = new PurchaseByProductModel();
            purchaseByProductModel.setProductId(productId);
            purchaseByProductModel.setProductName((String) objectArray[1]);
            purchaseByProductModel.setQuantityPurchased(quantitySold);
            purchaseByProductModel.setTotalAmountForAProduct(totalAmountForAProduct);
            purchaseByProductModel.setAverageAmount(averageAmount);
            purchaseByProductModelList.add(purchaseByProductModel);

        }
        return purchaseByProductModelList;

    }

    public ReceivableInvoiceSummaryResponseModel getReceivableInvoices(ReportRequestModel requestModel,ReceivableInvoiceSummaryResponseModel receivableInvoiceSummaryResponseModel){

        List<ReceivableInvoiceSummaryModel> receivableInvoiceSummaryModelList = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal totalBalance = BigDecimal.ZERO;
        String quertStr = "SELECT i.referenceNumber as InvoiceNum,i.contact.firstName as ContactName ,i.invoiceDate as InvoiceDate, i.status as STATUS ,i.invoiceDueDate as InvoiceDueDate,(i.totalAmount * i.exchangeRate) as TotalAmount,(i.dueAmount * i.exchangeRate) as BALANCE , (i.totalAmount * i.exchangeRate) as InvoiceTotalAmount, i.contact.lastName as lastName,i.contact.organization as organization,i.id as invoiceId FROM Invoice i WHERE" +
                " i.type in (2,7) and i.status in  (3,5,6) and i.deleteFlag = false and i.invoiceDate BETWEEN :startDate and :endDate ";
        // SELECT `REFERENCE_NUMBER`,`INVOICE_DATE`,`INVOICE_DUE_DATE`,`TOTAL_AMOUNT`,`CONTACT_ID` FROM `invoice`
        //quertStr.setParameter("currentDate",dateUtil.get(new Date()));
        //i.invoiceDueDate <=:currentDate
        Query query = getEntityManager().createQuery(quertStr);
        query.setParameter("startDate", requestModel.getStartDate().toLocalDate());
        query.setParameter("endDate", requestModel.getEndDate().toLocalDate());
        List<Object> list = query.getResultList();

        for(Object object : list)
        {
            Object[] objectArray = (Object[]) object;
            ReceivableInvoiceSummaryModel receivableInvoiceSummaryModel = new ReceivableInvoiceSummaryModel();
            receivableInvoiceSummaryModel.setInvoiceNumber((String)objectArray[0]);
            String organisation = (String) objectArray[9];
            if(organisation != null && !organisation.isEmpty()){
                receivableInvoiceSummaryModel.setCustomerName(organisation);
            }else {
                receivableInvoiceSummaryModel.setCustomerName((String) objectArray[1] + " " + (String) objectArray[8]);
            }
            receivableInvoiceSummaryModel.setInvoiceId((Integer) objectArray[10]);
            receivableInvoiceSummaryModel.setInvoiceDate((LocalDate) objectArray[2]);
            receivableInvoiceSummaryModel.setInvoiceDueDate((LocalDate) objectArray[4]);
            int status = (int) objectArray[3];
            ZoneId timeZone = ZoneId.systemDefault();
            Date date = Date.from(receivableInvoiceSummaryModel.getInvoiceDueDate().atStartOfDay(timeZone).toInstant());
            if(status>2 && status<5)
                receivableInvoiceSummaryModel.setStatus(invoiceRestHelper.getInvoiceStatus(status,date));
            else
                receivableInvoiceSummaryModel.setStatus(CommonStatusEnum.getInvoiceTypeByValue(status));
            totalAmount = totalAmount.add((BigDecimal) objectArray[5]);
            totalBalance = totalBalance.add((BigDecimal) objectArray[6]);
            receivableInvoiceSummaryModel.setBalance((BigDecimal) objectArray[6]);
            receivableInvoiceSummaryModel.setInvoiceTotalAmount((BigDecimal) objectArray[7]);
            receivableInvoiceSummaryModelList.add(receivableInvoiceSummaryModel);
        }
        receivableInvoiceSummaryResponseModel.setReceivableInvoiceSummaryModelList(receivableInvoiceSummaryModelList);
        receivableInvoiceSummaryResponseModel.setTotalAmount(totalAmount);
        receivableInvoiceSummaryResponseModel.setTotalBalance(totalBalance);
        return receivableInvoiceSummaryResponseModel;
    }

    public PayableInvoiceSummaryResponseModel getPayableInvoices(ReportRequestModel requestModel, PayableInvoiceSummaryResponseModel payableInvoiceSummaryResponseModel){

        List<PayableInvoiceSummaryModel> payableInvoiceSummaryModelList = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal totalBalance = BigDecimal.ZERO;
        String quertStr = "SELECT i.referenceNumber as InvoiceNum,i.contact.firstName as ContactName ,i.invoiceDate as InvoiceDate, i.status as STATUS ,i.invoiceDueDate as InvoiceDueDate,(i.totalAmount * i.exchangeRate) as TotalAmount,(i.dueAmount * i.exchangeRate) as BALANCE , (i.totalAmount * i.exchangeRate)  as InvoiceTotalAmount ,i.contact.lastName as lastName, i.contact.organization as organization,i.id as invoiceId  FROM Invoice i WHERE" +
                " i.type=1 and i.status in  (3,5,6) and i.deleteFlag = false and i.invoiceDate BETWEEN :startDate and :endDate ";
        // SELECT `REFERENCE_NUMBER`,`INVOICE_DATE`,`INVOICE_DUE_DATE`,`TOTAL_AMOUNT`,`CONTACT_ID` FROM `invoice`
        //quertStr.setParameter("currentDate",dateUtil.get(new Date()));
        //i.invoiceDueDate <=:currentDate
        Query query = getEntityManager().createQuery(quertStr);
        query.setParameter("startDate", requestModel.getStartDate().toLocalDate());
        query.setParameter("endDate", requestModel.getEndDate().toLocalDate());
        List<Object> list = query.getResultList();

        for(Object object : list)
        {
            Object[] objectArray = (Object[]) object;
            PayableInvoiceSummaryModel payableInvoiceSummaryModel = new PayableInvoiceSummaryModel();
            payableInvoiceSummaryModel.setInvoiceNumber((String)objectArray[0]);
            String organisation = (String) objectArray[9];
            if(organisation != null && !organisation.isEmpty()){
                payableInvoiceSummaryModel.setSupplierName(organisation);
            }else {
                payableInvoiceSummaryModel.setSupplierName((String) objectArray[1] + " " + (String) objectArray[8]);
            }
            payableInvoiceSummaryModel.setInvoiceDate((LocalDate) objectArray[2]);
            payableInvoiceSummaryModel.setInvoiceDueDate((LocalDate) objectArray[4]);
            payableInvoiceSummaryModel.setInvoiceId((Integer) objectArray[10]);
            int status = (int) objectArray[3];
            ZoneId timeZone = ZoneId.systemDefault();
            Date date = Date.from(payableInvoiceSummaryModel.getInvoiceDueDate().atStartOfDay(timeZone).toInstant());
            if(status>2 && status<5)
                payableInvoiceSummaryModel.setStatus(invoiceRestHelper.getInvoiceStatus(status,date));
            else
                payableInvoiceSummaryModel.setStatus(CommonStatusEnum.getInvoiceTypeByValue(status));
            totalAmount = totalAmount.add((BigDecimal) objectArray[5]);
            totalBalance = totalBalance.add((BigDecimal) objectArray[6]);
            payableInvoiceSummaryModel.setBalance((BigDecimal) objectArray[6]);
            payableInvoiceSummaryModel.setTotalInvoiceAmount((BigDecimal) objectArray[7]);
            payableInvoiceSummaryModelList.add(payableInvoiceSummaryModel);
        }
        payableInvoiceSummaryResponseModel.setPayableInvoiceSummaryModelList(payableInvoiceSummaryModelList);
        payableInvoiceSummaryResponseModel.setTotalAmount(totalAmount);
        payableInvoiceSummaryResponseModel.setTotalBalance(totalBalance);
        return payableInvoiceSummaryResponseModel;
    }

    public ReceivableInvoiceDetailResponseModel getReceivableInvoiceDetail(ReportRequestModel requestModel, ReceivableInvoiceDetailResponseModel receivableInvoiceDetailResponseModel){

        Map<String ,List<ReceivableInvoiceDetailModel>> receivableInvoiceDetailModelMap = new HashMap<>();
        List<List<ReceivableInvoiceDetailModel>> resultObject = new ArrayList<>();
        BigDecimal[] totals = {BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO}; // totalAmount, totalBalance, totalVat

        String quertStr = "SELECT i.invoiceDate as InvoiceDate,i.referenceNumber as InvoiceNumber,i.status as STATUS,p.productCode as PRODUCTCODE , p.productDescription as DESCRIPTION , il.quantity as QUANTITY ,il.unitPrice * i.exchangeRate as UNITPRICE,i.discount as DISCOUNT ,i.invoiceDueDate as InvoiceDueDate,(i.totalVatAmount * i.exchangeRate) as TOTALVATAMOUNT,(i.totalAmount * i.exchangeRate) as TotalAmount,(i.dueAmount*i.exchangeRate) as DUEAMOUNT ,p.productName as PRODUCTNAME,i.id as invoiceId ,i.currency.currencyIsoCode as currencyName FROM Invoice i ,Product p,InvoiceLineItem il WHERE" +
                " i.id=il.invoice.id and il.product.productID=p.productID and i.type in (2,7) and i.status in (3,5,6)  and i.invoiceDate BETWEEN :startDate and :endDate order by i.id desc ";

        Query query = getEntityManager().createQuery(quertStr);
        query.setParameter("startDate", requestModel.getStartDate().toLocalDate());
        query.setParameter("endDate", requestModel.getEndDate().toLocalDate());
        List<Object> list = query.getResultList();

        for(Object object : list){
            Object[] objectArray = (Object[]) object;
            processReceivableInvoiceDetailRow(objectArray, receivableInvoiceDetailModelMap, totals);
        }

        receivableInvoiceDetailResponseModel.setResultObject(resultObject);
        processReceivableInvoiceDetailTotals(receivableInvoiceDetailModelMap, resultObject);

        receivableInvoiceDetailResponseModel.setTotalVatAmount(totals[2]);
        receivableInvoiceDetailResponseModel.setTotalAmount(totals[0]);
        receivableInvoiceDetailResponseModel.setTotalBalance(totals[1]);

        return receivableInvoiceDetailResponseModel;
    }

    private void processReceivableInvoiceDetailRow(Object[] objectArray, Map<String, List<ReceivableInvoiceDetailModel>> modelMap, BigDecimal[] totals) {
        ReceivableInvoiceDetailModel model = new ReceivableInvoiceDetailModel();
        model.setInvoiceDate((LocalDate) objectArray[0]);
        model.setInvoiceNumber((String) objectArray[1]);
        model.setCurrencyName((String) objectArray[14]);
        String invoiceNumber = (String) objectArray[1];

        List<ReceivableInvoiceDetailModel> modelList = modelMap.computeIfAbsent(invoiceNumber, k -> new ArrayList<>());

        model.setInvoiceId((Integer) objectArray[13]);
        model.setDueDate((LocalDate) objectArray[8]);
        int status = (int) objectArray[2];
        model.setStatus(calculateInvoiceStatus(status, model.getDueDate()));
        model.setProductCode((String) objectArray[3]);
        model.setProductName((String) objectArray[12]);
        String description = (String) objectArray[4];
        model.setDescription(description == null ? " -" : description);
        model.setQuantity((Integer) objectArray[5]);
        model.setUnitPrice((BigDecimal) objectArray[6]);
        model.setDiscount((BigDecimal) objectArray[7]);
        model.setVatAmount((BigDecimal) objectArray[9]);
        model.setTotalAmount(((BigDecimal) objectArray[6]).multiply(new BigDecimal(objectArray[5].toString()+".00")));
        model.setBalance((BigDecimal) objectArray[11]);

        totals[0] = totals[0].add((BigDecimal) objectArray[10]);
        totals[2] = totals[2].add((BigDecimal) objectArray[9]);
        totals[1] = totals[1].add((BigDecimal) objectArray[11]);
        modelList.add(model);
    }

    private void processReceivableInvoiceDetailTotals(Map<String, List<ReceivableInvoiceDetailModel>> modelMap, List<List<ReceivableInvoiceDetailModel>> resultObject) {
        for(Map.Entry<String, List<ReceivableInvoiceDetailModel>> entry : modelMap.entrySet()) {
            List<ReceivableInvoiceDetailModel> models = entry.getValue();
            resultObject.add(models);

            BigDecimal totalForNullRow = BigDecimal.ZERO;
            int totalQty = 0;
            ReceivableInvoiceDetailModel resultModel = new ReceivableInvoiceDetailModel();

            for (int i = 0; i < models.size(); i++) {
                ReceivableInvoiceDetailModel model = models.get(i);
                if (i == 0) {
                    resultModel.setVatAmount(model.getVatAmount());
                }
                totalForNullRow = totalForNullRow.add(model.getTotalAmount());
                totalQty += model.getQuantity();
            }

            resultModel.setTotalAmount(totalForNullRow);
            resultModel.setDescription("Total");
            resultModel.setQuantity(totalQty);
            models.add(resultModel);
        }
    }

    public PayableInvoiceDetailResponseModel getPayableInvoiceDetail(ReportRequestModel requestModel, PayableInvoiceDetailResponseModel payableInvoiceDetailResponseModel){

        Map<String ,List<PayableInvoiceDetailModel>> payableInvoiceDetailModelMap = new HashMap<>();
        List<List<PayableInvoiceDetailModel>> resultObject = new ArrayList<>();
        BigDecimal[] totals = {BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO}; // totalAmount, totalBalance, totalVat

        String quertStr = "SELECT i.invoiceDate as InvoiceDate,i.referenceNumber as InvoiceNumber,i.status as STATUS,p.productCode as PRODUCTCODE , p.productDescription as DESCRIPTION , il.quantity as QUANTITY ,(il.unitPrice * i.exchangeRate) as UNITPRICE,(i.discount * i.exchangeRate) as DISCOUNT ,i.invoiceDueDate as InvoiceDueDate,(i.totalVatAmount * i.exchangeRate) as TOTALVATAMOUNT,(i.totalAmount * i.exchangeRate) as TotalAmount,(i.dueAmount * i.exchangeRate) as DUEAMOUNT ,p.productName as PRODUCTNAME ,i.id as invoiceId FROM Invoice i ,Product p,InvoiceLineItem il WHERE" +
                " i.id=il.invoice.id and il.product.productID=p.productID and i.type=1 and i.status in (3,5,6) and i.invoiceDate BETWEEN :startDate and :endDate order by i.id desc ";

        Query query = getEntityManager().createQuery(quertStr);
        query.setParameter("startDate", requestModel.getStartDate().toLocalDate());
        query.setParameter("endDate", requestModel.getEndDate().toLocalDate());
        List<Object> list = query.getResultList();

        for(Object object : list){
            Object[] objectArray = (Object[]) object;
            processPayableInvoiceDetailRow(objectArray, payableInvoiceDetailModelMap, totals);
        }

        payableInvoiceDetailResponseModel.setResultObject(resultObject);
        processPayableInvoiceDetailTotals(payableInvoiceDetailModelMap, resultObject);

        payableInvoiceDetailResponseModel.setTotalVatAmount(totals[2]);
        payableInvoiceDetailResponseModel.setTotalAmount(totals[0]);
        payableInvoiceDetailResponseModel.setTotalBalance(totals[1]);

        return payableInvoiceDetailResponseModel;
    }

    private void processPayableInvoiceDetailRow(Object[] objectArray, Map<String, List<PayableInvoiceDetailModel>> modelMap, BigDecimal[] totals) {
        PayableInvoiceDetailModel model = new PayableInvoiceDetailModel();
        model.setInvoiceDate((LocalDate) objectArray[0]);
        model.setInvoiceNumber((String) objectArray[1]);
        model.setInvoiceId((Integer) objectArray[13]);
        String invoiceNumber = (String) objectArray[1];

        List<PayableInvoiceDetailModel> modelList = modelMap.computeIfAbsent(invoiceNumber, k -> new ArrayList<>());

        model.setDueDate((LocalDate) objectArray[8]);
        int status = (int) objectArray[2];
        model.setStatus(calculateInvoiceStatus(status, model.getDueDate()));
        model.setProductCode((String) objectArray[3]);
        model.setProductName((String) objectArray[12]);
        String description = (String) objectArray[4];
        model.setDescription(description == null ? "-" : description);
        model.setQuantity((Integer) objectArray[5]);
        model.setUnitPrice((BigDecimal) objectArray[6]);
        model.setDiscount((BigDecimal) objectArray[7]);
        model.setVatAmount((BigDecimal) objectArray[9]);
        model.setTotalAmount(((BigDecimal) objectArray[6]).multiply(new BigDecimal(objectArray[5].toString()+".00")));
        model.setBalance((BigDecimal) objectArray[11]);

        totals[0] = totals[0].add((BigDecimal) objectArray[10]);
        totals[2] = totals[2].add((BigDecimal) objectArray[9]);
        totals[1] = totals[1].add((BigDecimal) objectArray[11]);
        modelList.add(model);
    }

    private void processPayableInvoiceDetailTotals(Map<String, List<PayableInvoiceDetailModel>> modelMap, List<List<PayableInvoiceDetailModel>> resultObject) {
        for(Map.Entry<String, List<PayableInvoiceDetailModel>> entry : modelMap.entrySet()) {
            List<PayableInvoiceDetailModel> models = entry.getValue();
            resultObject.add(models);

            BigDecimal totalForNullRow = BigDecimal.ZERO;
            int totalQty = 0;
            PayableInvoiceDetailModel resultModel = new PayableInvoiceDetailModel();

            for (int i = 0; i < models.size(); i++) {
                PayableInvoiceDetailModel model = models.get(i);
                if (i == 0) {
                    resultModel.setVatAmount(model.getVatAmount());
                }
                totalForNullRow = totalForNullRow.add(model.getTotalAmount());
                totalQty += model.getQuantity();
            }

            resultModel.setTotalAmount(totalForNullRow);
            resultModel.setDescription("Total");
            resultModel.setQuantity(totalQty);
            models.add(resultModel);
        }
    }

    /**
     * Helper method to calculate invoice status based on status code and due date.
     * Reduces cognitive complexity by extracting status calculation logic.
     */
    private String calculateInvoiceStatus(int status, LocalDate dueDate) {
        if (status > 2 && status < 5) {
            ZoneId timeZone = ZoneId.systemDefault();
            Date date = Date.from(dueDate.atStartOfDay(timeZone).toInstant());
            return invoiceRestHelper.getInvoiceStatus(status, date);
        }
        return CommonStatusEnum.getInvoiceTypeByValue(status);
    }

//getcreditNoteDetails

    public CreditNoteDetailsResponseModel getcreditNoteDetails(ReportRequestModel requestModel,CreditNoteDetailsResponseModel creditNoteDetailsResponseModel){

            List<CreditNoteSummaryModel> creditNoteSummaryModelList = new ArrayList<>();
            BigDecimal totalAmount = BigDecimal.ZERO;
            BigDecimal totalBalance = BigDecimal.ZERO;
            String quertStr = "SELECT i.creditNoteNumber as creditNoteNumber,i.contact.firstName as ContactName ,i.creditNoteDate as InvoiceDate, i.status as STATUS ,(i.totalAmount*i.exchangeRate) as TotalAmount,(i.dueAmount*i.exchangeRate) as BALANCE , (i.totalAmount*i.exchangeRate) as InvoiceTotalAmount,i.contact.lastName as lastName, i.contact.organization as organization,i.type as type,i.invoiceId as invoiceId,i.isCNWithoutProduct as isCNWithoutProduct,i.creditNoteId as creditNoteId FROM CreditNote i WHERE i.creditNoteDate BETWEEN :startDate and :endDate order by creditNoteDate desc ";
            // SELECT `REFERENCE_NUMBER`,`INVOICE_DATE`,`INVOICE_DUE_DATE`,`TOTAL_AMOUNT`,`CONTACT_ID` FROM `invoice`
            //quertStr.setParameter("currentDate",dateUtil.get(new Date()));
            //i.invoiceDueDate <=:currentDate
        LocalDateTime startDate = requestModel.getStartDate();
        LocalDateTime endDate = requestModel.getEndDate();
        ZoneOffset offset = ZoneOffset.UTC;
        OffsetDateTime sDate = startDate.atOffset(offset);
        OffsetDateTime eDate = endDate.atOffset(offset);
            Query query = getEntityManager().createQuery(quertStr);
            query.setParameter("startDate",sDate);
            query.setParameter("endDate", eDate);
            List<Object> list = query.getResultList();

            for(Object object : list)
            {
                Object[] objectArray = (Object[]) object;
                CreditNoteSummaryModel creditNoteSummaryModel = new CreditNoteSummaryModel();
                creditNoteSummaryModel.setCreditNoteNumber((String)objectArray[0]);
                String organisation = (String) objectArray[8];
                if(organisation != null && !organisation.isEmpty()){
                    creditNoteSummaryModel.setCustomerName(organisation);
                }else {
                    creditNoteSummaryModel.setCustomerName((String)objectArray[1] + " " + (String)objectArray[7]);
                }
                creditNoteSummaryModel.setCreditNoteDate(((OffsetDateTime) objectArray[2]).toLocalDate());

                int status = (int) objectArray[3];
//                if(status>2 && status<5)
//                    creditNoteSummaryModel.setStatus(invoiceRestHelper.getInvoiceStatus(status,creditNoteSummaryModel.getInvoiceDueDate()));
//                else
                    creditNoteSummaryModel.setStatus(CommonStatusEnum.getInvoiceTypeByValue(status));
                    if( objectArray[4] != null ) {
                        totalAmount = totalAmount.add((BigDecimal) objectArray[4]);
                    }
                if( objectArray[5] != null ) {
                    totalBalance = totalBalance.add((BigDecimal) objectArray[5]);
                }
                if(objectArray[10]!=null){
                    Invoice invoice = invoiceService.findByPK((Integer) objectArray[10]);
                    if(invoice!=null) {
                        creditNoteSummaryModel.setInvoiceNumber(invoice.getReferenceNumber());
                        creditNoteSummaryModel.setInvoiceId(invoice.getId());
                        creditNoteSummaryModel.setInvoiceStatus(CommonStatusEnum.getInvoiceTypeByValue(invoice.getStatus()));
                    }
                }
                if( objectArray[11] != null ) {
                    creditNoteSummaryModel.setIsCNWithoutProduct((Boolean) objectArray[11]);
                }
                if( objectArray[12] != null ) {
                    creditNoteSummaryModel.setCreditNoteId((Integer) objectArray[12]);
                }
                creditNoteSummaryModel.setBalance((BigDecimal) objectArray[5]);
                creditNoteSummaryModel.setCreditNoteTotalAmount((BigDecimal) objectArray[6]);
                creditNoteSummaryModel.setType((Integer) objectArray[9]);
                creditNoteSummaryModelList.add(creditNoteSummaryModel);
            }
        creditNoteDetailsResponseModel.setCreditNoteSummaryModelList(creditNoteSummaryModelList);
        creditNoteDetailsResponseModel.setTotalAmount(totalAmount);
        creditNoteDetailsResponseModel.setTotalBalance(totalBalance);
            return creditNoteDetailsResponseModel;
        }
//    getExpenseDetails
public ExpenseDetailsResponseModel getExpenseDetails(ReportRequestModel requestModel, ExpenseDetailsResponseModel expenseDetailsResponseModel){

    List<ExpenseSummaryModel> expenseSummaryModelList = new ArrayList<>();
    BigDecimal totalAmount = BigDecimal.ZERO;
    BigDecimal totalVatAmount = BigDecimal.ZERO;
    BigDecimal totalAmountWithTax = BigDecimal.ZERO;
    String quertStr = " SELECT DISTINCT e.expenseId AS expenseId, e.status AS status, e.expenseDate AS expenseDate, e.payee AS payee, e.payMode AS payMode, tc.transactionCategoryName AS transactionCategoryName, v.name AS vatName, (e.expenseAmount * e.exchangeRate) AS expenseAmount, (e.expenseVatAmount * e.exchangeRate) AS expenseVatAmount, e.expenseNumber AS expenseNumber FROM Expense e INNER JOIN TransactionCategory tc ON e.transactionCategory.transactionCategoryId = tc.transactionCategoryId LEFT JOIN VatCategory v ON e.vatCategory.id = v.id WHERE e.status IN (3) AND e.expenseDate BETWEEN :startDate AND :endDate ORDER BY e.expenseDate ASC, tc.transactionCategoryName ASC";
//    SELECT DISTINCT
//    e.`EXPENSE_ID`,e.`STATUS`,e.EXPENSE_DATE,e.PAYEE,tc.TRANSACTION_CATEGORY_NAME,e.PAY_MODE,
//    v.NAME,e.EXPENSE_AMOUNT,e.EXPENSE_VAT_AMOUNT
//    FROM `expense` as e, `vat_category` as v, `transaction_category` as tc
//    WHERE e.VAT_ID=v.ID and
//    e.TRANSACTION_CATEGORY_CODE=tc.TRANSACTION_CATEGORY_ID and
//    e.EXPENSE_DATE BETWEEN "2021-07-01" and "2021-07-14";
//            0 e.expenseId as expenseId,
//            1 e.status as status,
//            2 e.expenseDate as expenseDate,
//            3 e.payee as payee,
//            4 e.payMode as payMode,
//            5 e.expenseAmount as expenseAmount ,
//            6 tc.transactionCategoryName as transactionCategoryName,
//            7 v.name as vatName ,
//            8 e.expenseAmount as expenseAmount,
//            9 e.expenseVatAmount as expenseVatAmount
    Query query = getEntityManager().createQuery(quertStr);
    query.setParameter("startDate", requestModel.getStartDate().toLocalDate());
    query.setParameter("endDate", requestModel.getEndDate().toLocalDate());
    List<Object> list = query.getResultList();

    for(Object object : list)
    {
        Object[] objectArray = (Object[]) object;
        ExpenseSummaryModel expenseSummaryModel = new ExpenseSummaryModel();
        expenseSummaryModel.setExpenseId((Integer) objectArray[0]);

        expenseSummaryModel.setExpenseDate((LocalDate) objectArray[2]);
        expenseSummaryModel.setPaidBy((String) objectArray[3]);
        expenseSummaryModel.setPayMode((PayMode) objectArray[4]);
        int status = (int) objectArray[1];
//                if(status>2 && status<5)
//                    creditNoteSummaryModel.setStatus(invoiceRestHelper.getInvoiceStatus(status,creditNoteSummaryModel.getInvoiceDueDate()));
//                else
        expenseSummaryModel.setTransactionCategoryName((String) objectArray[5]);
        expenseSummaryModel.setVatName((String) objectArray[6]);
        expenseSummaryModel.setStatus(ExpenseStatusEnum.getExpenseStatusByValue(status));
        BigDecimal includingVatAmount = (BigDecimal) objectArray[7];
        if(objectArray[8] == null){
            BigDecimal excludingVatAmount = includingVatAmount;
            expenseSummaryModel.setAmountWithoutTax(excludingVatAmount);
            totalAmountWithTax=totalAmountWithTax.add(excludingVatAmount);
        } else {
            BigDecimal excludingVatAmount = includingVatAmount.subtract( (BigDecimal) objectArray[8]);
            expenseSummaryModel.setAmountWithoutTax(excludingVatAmount);
            totalAmountWithTax=totalAmountWithTax.add(excludingVatAmount);
            totalVatAmount = totalVatAmount.add((BigDecimal) objectArray[8]);
            expenseSummaryModel.setExpenseVatAmount((BigDecimal) objectArray[8]);
        }

        totalAmount = totalAmount.add((BigDecimal) objectArray[7]);
        expenseSummaryModel.setExpenseAmount((BigDecimal) objectArray[7]);
        expenseSummaryModel.setExpenseNumber((String) objectArray[9]);
        expenseSummaryModelList.add(expenseSummaryModel);
    }
    expenseDetailsResponseModel.setExpenseSummaryModelModelList(expenseSummaryModelList);
    expenseDetailsResponseModel.setTotalAmount(totalAmount);
    expenseDetailsResponseModel.setTotalVatAmount(totalVatAmount);
    expenseDetailsResponseModel.setTotalAmountWithoutTax(totalAmountWithTax);
    return expenseDetailsResponseModel;
}

//    SELECT DISTINCT tc.TRANSACTION_CATEGORY_NAME,tc.TRANSACTION_CATEGORY_NAME,SUM(e.EXPENSE_AMOUNT),SUM(e.EXPENSE_VAT_AMOUNT)
//    FROM `expense` as e, `transaction_category` as tc WHERE e.TRANSACTION_CATEGORY_CODE=tc.TRANSACTION_CATEGORY_ID and
//    e.EXPENSE_DATE BETWEEN "2021-07-01" and "2021-07-14"
//    GROUP BY e.TRANSACTION_CATEGORY_CODE;

//    tc.transactionCategoryId,
//    tc.transactionCategoryName as transactionCategoryName,
//    Sum(e.expenseAmount) as TotalAmount,
//    Sum(e.expenseAmount) as TotalVatAmount

    public ExpenseByCategoryResponseModel getExpenseByCategoryDetails(ReportRequestModel requestModel,ExpenseByCategoryResponseModel expenseByCategoryResponseModel){

        List<ExpenseByCategoryModel> expenseByCategoryModelList = new ArrayList<>();
        BigDecimal totalExpenseAmount = BigDecimal.ZERO;
        BigDecimal totalExpenseVatAmount = BigDecimal.ZERO;
        BigDecimal totalAmountWithTax = BigDecimal.ZERO;
        String quertStr = "SELECT tc.transactionCategoryId,tc.transactionCategoryName as transactionCategoryName, Sum(e.expenseAmount*e.exchangeRate) as TotalAmount, Sum(e.expenseVatAmount*e.exchangeRate) as TotalVatAmount, e.exclusiveVat FROM Expense e,TransactionCategory tc,VatCategory v  WHERE e.vatCategory.id=v.id and e.transactionCategory.transactionCategoryId=tc.transactionCategoryId and e.status in (3) and e.expenseDate BETWEEN :startDate and :endDate  GROUP by tc.transactionCategoryName,tc.transactionCategoryId, e.exclusiveVat";
        Query query = getEntityManager().createQuery(quertStr);
        query.setParameter("startDate", requestModel.getStartDate().toLocalDate());
        query.setParameter("endDate", requestModel.getEndDate().toLocalDate());
        List<Object> list = query.getResultList();

        for(Object object : list)
        {
            Object[] objectArray = (Object[])object;

            ExpenseByCategoryModel expenseByCategoryModel = new ExpenseByCategoryModel();
            if(!(Boolean) objectArray[4]) {
//            expenseByCategoryModel.setTransactionCategoryId((Integer)objectArray[0]);
                expenseByCategoryModel.setTransactionCategoryName((String)objectArray[1]);
                expenseByCategoryModel.setExpensesAmountSum((BigDecimal) objectArray[2]);
                expenseByCategoryModel.setExpensesVatAmountSum((BigDecimal) objectArray[3]);

                BigDecimal includingVatAmountSum = (BigDecimal) objectArray[2];
                BigDecimal excludingVatAmountSum = includingVatAmountSum.subtract((BigDecimal) objectArray[3]);

                expenseByCategoryModel.setExpensesAmountWithoutTaxSum(excludingVatAmountSum);

                totalExpenseAmount = totalExpenseAmount.add((BigDecimal) objectArray[2]);
                totalExpenseVatAmount = totalExpenseVatAmount.add((BigDecimal) objectArray[3]);

                totalAmountWithTax = totalAmountWithTax.add(excludingVatAmountSum);
            } else{
                expenseByCategoryModel.setTransactionCategoryName((String) objectArray[1]);
                expenseByCategoryModel.setExpensesAmountSum(((BigDecimal) objectArray[2]).add((BigDecimal) objectArray[3]));
                expenseByCategoryModel.setExpensesVatAmountSum((BigDecimal) objectArray[3]);

                BigDecimal excludingVatAmountSum = (BigDecimal) objectArray[2];
                BigDecimal totalVatAmountSum = ((BigDecimal) objectArray[2]).add((BigDecimal) objectArray[3]);

                expenseByCategoryModel.setExpensesAmountWithoutTaxSum(excludingVatAmountSum);

                totalExpenseAmount = totalExpenseAmount.add(totalVatAmountSum);
                totalExpenseVatAmount = totalExpenseVatAmount.add((BigDecimal) objectArray[3]);

                totalAmountWithTax = totalAmountWithTax.add(excludingVatAmountSum);
            }

            expenseByCategoryModelList.add(expenseByCategoryModel);
        }
        expenseByCategoryResponseModel.setExpenseByCategoryList(expenseByCategoryModelList);
        expenseByCategoryResponseModel.setTotalAmount(totalExpenseAmount);
        expenseByCategoryResponseModel.setTotalVatAmount(totalExpenseVatAmount);
        expenseByCategoryResponseModel.setTotalAmountWithoutTax(totalAmountWithTax);
        return expenseByCategoryResponseModel;
    }
//Invoice Details
public InvoiceDetailsResponseModel getInvoiceDetails(ReportRequestModel requestModel,InvoiceDetailsResponseModel invoiceDetailsResponseModel){

    List<InvoiceDetailsModel> invoiceDetailsModelList = new ArrayList<>();
    BigDecimal totalAmount = BigDecimal.ZERO;
    BigDecimal totalBalance = BigDecimal.ZERO;
    String quertStr = "SELECT i.referenceNumber as InvoiceNum,i.contact.firstName as ContactName ,i.invoiceDate as InvoiceDate, i.status as STATUS ,i.invoiceDueDate as InvoiceDueDate,(i.totalAmount*i.exchangeRate) as TotalAmount,(i.dueAmount*i.exchangeRate) as BALANCE , (i.totalAmount*i.exchangeRate) as InvoiceTotalAmount, i.contact.lastName as lastName, i.contact.organization as organization,i.id as invoiceId FROM Invoice i WHERE" +
            " i.type=2and i.status in (3,5,6) and i.deleteFlag = false and i.invoiceDate BETWEEN :startDate and :endDate ";
    // SELECT `REFERENCE_NUMBER`,`INVOICE_DATE`,`INVOICE_DUE_DATE`,`TOTAL_AMOUNT`,`CONTACT_ID` FROM `invoice`
    //quertStr.setParameter("currentDate",dateUtil.get(new Date()));
    //i.invoiceDueDate <=:currentDate
    Query query = getEntityManager().createQuery(quertStr);
    query.setParameter("startDate", requestModel.getStartDate().toLocalDate());
    query.setParameter("endDate", requestModel.getEndDate().toLocalDate());
    List<Object> list = query.getResultList();

    for(Object object : list)
    {
        Object[] objectArray = (Object[]) object;
        InvoiceDetailsModel invoiceDetailsModel = new InvoiceDetailsModel();
        invoiceDetailsModel.setInvoiceNumber((String)objectArray[0]);
        String organisation = (String) objectArray[9];
        if(organisation != null && !organisation.isEmpty()){
            invoiceDetailsModel.setCustomerName(organisation);
        }else {
            invoiceDetailsModel.setCustomerName((String) objectArray[1] + " " + (String) objectArray[8]);
        }
        invoiceDetailsModel.setInvoiceId((Integer) objectArray[10]);
        invoiceDetailsModel.setInvoiceDate((LocalDate) objectArray[2]);
        invoiceDetailsModel.setInvoiceDueDate((LocalDate) objectArray[4]);
        int status = (int) objectArray[3];
        ZoneId timeZone = ZoneId.systemDefault();
        Date date = Date.from(invoiceDetailsModel.getInvoiceDueDate().atStartOfDay(timeZone).toInstant());
        if(status>2 && status<5)
            invoiceDetailsModel.setStatus(invoiceRestHelper.getInvoiceStatus(status,date));
        else
            invoiceDetailsModel.setStatus(CommonStatusEnum.getInvoiceTypeByValue(status));
        totalAmount = totalAmount.add((BigDecimal) objectArray[5]);
        totalBalance = totalBalance.add((BigDecimal) objectArray[6]);
        invoiceDetailsModel.setBalance((BigDecimal) objectArray[6]);
        invoiceDetailsModel.setInvoiceTotalAmount((BigDecimal) objectArray[7]);
        invoiceDetailsModelList.add(invoiceDetailsModel);
    }
    invoiceDetailsResponseModel.setInvoiceSummaryModelList(invoiceDetailsModelList);
    invoiceDetailsResponseModel.setTotalAmount(totalAmount);
    invoiceDetailsResponseModel.setTotalBalance(totalBalance);
    return invoiceDetailsResponseModel;
}


//getSupplierInvoiceDetails

    public SupplierInvoiceDetailsResponseModel getSupplierInvoiceDetails(ReportRequestModel requestModel,SupplierInvoiceDetailsResponseModel invoiceDetailsResponseModel){

        List<SupplierInvoiceDetailsModel> invoiceDetailsModelList = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal totalBalance = BigDecimal.ZERO;
        String quertStr = "SELECT i.referenceNumber as InvoiceNum,i.contact.firstName as ContactName ,i.invoiceDate as InvoiceDate, i.status as STATUS ,i.invoiceDueDate as InvoiceDueDate,(i.totalAmount*i.exchangeRate) as TotalAmount,(i.dueAmount*i.exchangeRate) as BALANCE , (i.totalAmount*i.exchangeRate) as InvoiceTotalAmount, i.contact.lastName as lastName FROM Invoice i WHERE" +
                " i.type=1 and i.deleteFlag = false and i.invoiceDate BETWEEN :startDate and :endDate ";
        // SELECT `REFERENCE_NUMBER`,`INVOICE_DATE`,`INVOICE_DUE_DATE`,`TOTAL_AMOUNT`,`CONTACT_ID` FROM `invoice`
        //quertStr.setParameter("currentDate",dateUtil.get(new Date()));
        //i.invoiceDueDate <=:currentDate
        Query query = getEntityManager().createQuery(quertStr);
        query.setParameter("startDate", requestModel.getStartDate().toLocalDate());
        query.setParameter("endDate", requestModel.getEndDate().toLocalDate());
        List<Object> list = query.getResultList();

        for(Object object : list)
        {
            Object[] objectArray = (Object[]) object;
            SupplierInvoiceDetailsModel invoiceDetailsModel = new SupplierInvoiceDetailsModel();
            invoiceDetailsModel.setInvoiceNumber((String)objectArray[0]);
            invoiceDetailsModel.setCustomerName((String)objectArray[1]+" "+(String)objectArray[8]);
            invoiceDetailsModel.setInvoiceDate((Date) objectArray[2]);
            invoiceDetailsModel.setInvoiceDueDate((Date) objectArray[4]);
            int status = (int) objectArray[3];
            if(status>2 && status<5)
                invoiceDetailsModel.setStatus(invoiceRestHelper.getInvoiceStatus(status,invoiceDetailsModel.getInvoiceDueDate()));
            else
                invoiceDetailsModel.setStatus(CommonStatusEnum.getInvoiceTypeByValue(status));
            totalAmount = totalAmount.add((BigDecimal) objectArray[5]);
            totalBalance = totalBalance.add((BigDecimal) objectArray[6]);
            invoiceDetailsModel.setBalance((BigDecimal) objectArray[6]);
            invoiceDetailsModel.setInvoiceTotalAmount((BigDecimal) objectArray[7]);
            invoiceDetailsModelList.add(invoiceDetailsModel);
        }
        invoiceDetailsResponseModel.setSupplierInvoiceSummaryModelList(invoiceDetailsModelList);
        invoiceDetailsResponseModel.setTotalAmount(totalAmount);
        invoiceDetailsResponseModel.setTotalBalance(totalBalance);
        return invoiceDetailsResponseModel;
    }

    @Override
    public PayrollSummaryResponseModel getPayrollSummary(ReportRequestModel requestModel, PayrollSummaryResponseModel payrollSummaryResponseModel) {
        List<PayrollSummaryModel> payrollSummaryModelList = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal totalBalance = BigDecimal.ZERO;

        List<Payroll> list = payrollRestHepler.findAllByPayrollDate(requestModel.getStartDate(),requestModel.getEndDate());

        for(Payroll payroll : list)
        {
            PayrollSummaryModel payrollSummaryModel = new PayrollSummaryModel();

            if(payroll.getPayrollDate() != null)
            payrollSummaryModel.setPayrollDate(payroll.getPayrollDate().toString());
            if(payroll.getPayrollSubject() != null)
            payrollSummaryModel.setPayrollSubject(payroll.getPayrollSubject());
            if(payroll.getPayPeriod() != null)
            payrollSummaryModel.setPayPeriod(payroll.getPayPeriod());
            if(payroll.getStatus() != null)
            payrollSummaryModel.setStatus(payroll.getStatus());
            if(payroll.getEmployeeCount() != null)
            payrollSummaryModel.setEmployeeCount(payroll.getEmployeeCount());
            payrollSummaryModel.setPayrollId(payroll.getId());

            if(payroll.getGeneratedBy() != null) {
                payrollSummaryModel.setGeneratedBy(payroll.getGeneratedBy());
                User generatedByUser = userService.findByPK(Integer.parseInt(payroll.getGeneratedBy()));
            if(generatedByUser !=null)    {
                    String payrollGeneratedName = generatedByUser.getFirstName().toString() + " " + generatedByUser.getLastName().toString();
                    payrollSummaryModel.setGeneratedByName(payrollGeneratedName);
                }
            }
            if(payroll.getApprovedBy() != null)
            {
                payrollSummaryModel.setApprovedBy(payroll.getApprovedBy());
            }
            if(payroll.getPayrollApprover() !=null){
                payrollSummaryModel.setPayrollApprover(payroll.getPayrollApprover());
                User payrollApproverUser = userService.findByPK(payroll.getPayrollApprover());
                if(payrollApproverUser != null)   {
                    String payrollApproverName = payrollApproverUser.getFirstName().toString() + " " + payrollApproverUser.getLastName().toString();
                    payrollSummaryModel.setPayrollApproverName(payrollApproverName);
                }
            }
            if(payroll.getRunDate() != null)
            payrollSummaryModel.setRunDate(payroll.getRunDate().toString());
            if(payroll.getComment() != null)
            payrollSummaryModel.setComment(payroll.getComment());
            if(payroll.getIsActive() != null)
            payrollSummaryModel.setIsActive(payroll.getIsActive());
            if(payroll.getDueAmountPayroll()!=null)
                payrollSummaryModel.setDueAmount(payroll.getDueAmountPayroll());
            if(payroll.getTotalAmountPayroll()!=null)
                payrollSummaryModel.setTotalAmount(payroll.getTotalAmountPayroll());
//            totalAmount = totalAmount.add((BigDecimal) objectArray[5]);
//            totalBalance = totalBalance.add((BigDecimal) objectArray[6]);
//            payrollSummaryModel.setBalance((BigDecimal) objectArray[6]);
//            payrollSummaryModel.setTotalInvoiceAmount((BigDecimal) objectArray[7]);
            payrollSummaryModelList.add(payrollSummaryModel);
        }
        payrollSummaryResponseModel.setPayrollSummaryModelList(payrollSummaryModelList);
        payrollSummaryResponseModel.setTotalAmount(totalAmount);
        payrollSummaryResponseModel.setTotalBalance(totalBalance);
        return payrollSummaryResponseModel;
    }

    /**
     * Statement Of Account for Customer
     * @param requestModel
     * @return
     */
    @Override
    public StatementOfAccountResponseModel getSOA(StatementOfAccountRequestModel requestModel) {
        StatementOfAccountResponseModel soa_response=new StatementOfAccountResponseModel();
        List<TransactionsModel> transactionModelList = new ArrayList<>();

        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal totalBalance = BigDecimal.ZERO;
        BigDecimal totalInvoicedAmount= BigDecimal.ZERO;

        //Opening Balance
        Map<String, Object> param = new HashMap<>();
        param.put("contact", requestModel.getCustomerId());

        soa_response.setOpeningBalance(BigDecimal.ZERO);
       List< ContactTransactionCategoryRelation> contactTransactionCategoryRelationList=contactTransactionCategoryService.findByAttributes(param);
        if(contactTransactionCategoryRelationList.size()!=0)
            for (ContactTransactionCategoryRelation contactTransactionCategoryRelation:        contactTransactionCategoryRelationList)
            {
                if(contactTransactionCategoryRelation.getTransactionCategory().getParentTransactionCategory().getTransactionCategoryId()==2){

                    Map<String, Object> transactionCategoryparam = new HashMap<>();
                    transactionCategoryparam.put("transactionCategory", contactTransactionCategoryRelation.getTransactionCategory().getTransactionCategoryId());
                    List<TransactionCategoryBalance> transactionCategoryBalanceList=transactionCategoryBalanceService.findByAttributes(transactionCategoryparam);
                   if(transactionCategoryBalanceList.size()!=0)
                    soa_response.setOpeningBalance(transactionCategoryBalanceList.get(0).getOpeningBalance());
                }

            }

        String quertStr = "SELECT cir.receipt.receiptDate as date,cir.customerInvoice.referenceNumber as details ,(cir.customerInvoice.totalAmount*cir.customerInvoice.exchangeRate) as amount,cir.paidAmount as payment,cir.dueAmount as balance,cir.customerInvoice.contact.contactId as customerId,cir.customerInvoice.type as type ,cir.customerInvoice.id as invoiceId FROM CustomerInvoiceReceipt cir WHERE" +
                " cir.receipt.receiptDate BETWEEN :startDate and :endDate ";

        Query query = getEntityManager().createQuery(quertStr);
        query.setParameter("startDate", requestModel.getStartDate());
        query.setParameter("endDate", requestModel.getEndDate());
//        query.setParameter("customerId", requestModel.getCustomerId());
        List<Object> list = query.getResultList();
        Integer id=0;
        for(Object object : list)
        {
            Object[] objectArray = (Object[]) object;
            Integer contactId=(Integer) objectArray[5];
            Invoice invoice = invoiceService.findByPK((Integer)objectArray[7]);
            if(requestModel.getCustomerId().equals(contactId) && invoice.getType() == 2)
            {
                TransactionsModel transactionModel = new TransactionsModel();

                transactionModel.setDate((LocalDateTime) objectArray[0]);
                transactionModel.setInvoiceNumber((String) objectArray[1]);
//                transactionModel.setAmount((BigDecimal) objectArray[2]);
                transactionModel.setPaymentAmount((BigDecimal) objectArray[3]);
                transactionModel.setBalanceAmount((BigDecimal) objectArray[4]);
                totalAmount = totalAmount.add((BigDecimal) objectArray[3]);




                   transactionModel.setAmount(invoice.getTotalAmount());
                    if(!id.equals(invoice.getId())) {
                        totalInvoicedAmount = totalInvoicedAmount.add(invoice.getTotalAmount()); id=invoice.getId();
                    }
                   if(!invoice.getDueAmount().equals(BigDecimal.ZERO)){
                       totalBalance = totalBalance.add(invoice.getDueAmount());
                   }



                Integer type=(Integer) objectArray[6];

                    switch (type)
                    {
                        case 2:transactionModel.setTypeName("Invoice");
//                            transactionModel.setTypeName("Customer Payment");
                                break;

                        case 7: transactionModel.setTypeName("Credit Note");
//                            transactionModel.setTypeName("Refund");
                                break;
                    }

                transactionModelList.add(transactionModel);
                soa_response.setTotalAmountPaid(totalAmount);
                soa_response.setTotalBalance(totalBalance);
                soa_response.setTotalInvoicedAmount(totalInvoicedAmount);

            }//if
        }//for

        //last row default for TOTAL
        TransactionsModel defaulttransactionModel = new TransactionsModel();
        defaulttransactionModel.setInvoiceNumber("Total Balance Due");
        defaulttransactionModel.setBalanceAmount(totalBalance);
        transactionModelList.add(defaulttransactionModel);

        //soa response
        soa_response.setTransactionsModelList(transactionModelList);


        return soa_response;
    }
    @Override
    public FtaAuditResponseModel getFtaAuditReport(FtaAuditRequestModel requestModel) {
        FtaAuditResponseModel fta_response = new FtaAuditResponseModel();
        Integer lineNo = 1;
        BigDecimal purchaseTotal = new BigDecimal(0);
        BigDecimal supplyTotal = new BigDecimal(0);
        BigDecimal supplierVATTotal = new BigDecimal(0);
        BigDecimal customerVATTotal = new BigDecimal(0);
        BigDecimal TransactionCountTotal = new BigDecimal(0);
        BigDecimal TotalDebit = new BigDecimal(0);
        BigDecimal TotalCredit =  new BigDecimal(0);
        List<SupplierSupplyListingResponseModel> supplierSupplyListingRes = new LinkedList<>();
        List<CustomerSupplyListingResponseModel> customerSupplyListingRes = new LinkedList<>();
        List<GeneralLedgerListingResponseModel> generalLedgerListingRes = new LinkedList<>();
        List<CustomerDataResponseModel> customerData = new LinkedList<>();
        List<SupplierDataResponseModel> supplierData = new LinkedList<>();

        Optional<Company> optionalCompany = companyRepository.findById(requestModel.getCompanyId());

        String CquertStr = "SELECT c  FROM Contact c WHERE c.contactType IN (2,3) AND c.deleteFlag=false ";
        Query Cquery = getEntityManager().createQuery(CquertStr);
        List<Contact> customerList = Cquery.getResultList();

        String SquertStr = "SELECT c  FROM Contact c WHERE c.contactType IN (1,3) AND c.deleteFlag=false ";
        Query Squery = getEntityManager().createQuery(SquertStr);
        List<Contact> supplierList = Squery.getResultList();



        List<InvoiceLineItem> invoiceLineItemList = invoiceLineitemRepository.findAll();

        Optional<VatTaxAgency> optionalTaxAgency = taxAgencyRepository.findById(requestModel.getTaxAgencyId());


        if (optionalCompany.isPresent()) {

            Company company = optionalCompany.get();
         VatTaxAgency vatTaxAgency = optionalTaxAgency.get();

            fta_response.setCompanyName(company.getCompanyName());
        fta_response.setTaxablePersonNameEn(vatTaxAgency.getTaxablePersonNameInEnglish());
       fta_response.setTaxablePersonNameAr(vatTaxAgency.getTaxablePersonNameInArabic());
            fta_response.setTaxRegistrationNumber(company.getVatNumber());
       fta_response.setTaxAgencyName(vatTaxAgency.getTaxAgencyName());
        fta_response.setTaxAgencyNumber(vatTaxAgency.getTaxAgencyNumber());
        fta_response.setTaxAgentName(vatTaxAgency.getTaxAgentName());
        fta_response.setTaxAgencyAgentNumber(vatTaxAgency.getTaxAgentApprovalNumber());
        fta_response.setStartDate(requestModel.getStartDate());
        fta_response.setEndDate(requestModel.getEndDate());
        fta_response.setProductVersion("-");
        fta_response.setFafVersion("-");


            fta_response.setCreationDate(vatTaxAgency.getCreatedDate());

            //  Customer Data
            for (Contact contact : customerList) {
                CustomerDataResponseModel model = new CustomerDataResponseModel();
                model.setCustomerName(getContactFullName(contact));
                model.setGlId("-");
                model.setReverseCharge("-");
                model.setCustomerCountry(contact.getCountry().getCountryName());
                model.setCustomerTRN(contact.getVatRegistrationNumber());
                customerData.add(model);
            }
            fta_response.setCustomerDataResponseModels(customerData);

            //  Supplier Data
            for (Contact contact : supplierList) {
                SupplierDataResponseModel supplierDataResponseModel = new SupplierDataResponseModel();
                supplierDataResponseModel.setSupplierName(getContactFullName(contact));
                supplierDataResponseModel.setGlId("-");
                supplierDataResponseModel.setSupplierCountry(contact.getCountry().getCountryName());
                supplierDataResponseModel.setSupplierTRN(contact.getVatRegistrationNumber());
                supplierDataResponseModel.setReverseCharge("No");
                supplierData.add(supplierDataResponseModel);
            }
            fta_response.setSupplierDataResponseModels(supplierData);

//            Purchase Data
            for (InvoiceLineItem invoiceLineItem : invoiceLineItemList) {
                SupplierSupplyListingResponseModel supplierSupplyListing = new SupplierSupplyListingResponseModel();
              if (invoiceLineItem.getInvoice().getType() == 1 && invoiceLineItem.getInvoice().getStatus() == 6) {
                    supplierSupplyListing.setSupplierName(getFullName(invoiceLineItem));
                    supplierSupplyListing.setSupplierCountry(invoiceLineItem.getInvoice().getContact().getCountry().getCountryName());
                    supplierSupplyListing.setSupplierTRN(invoiceLineItem.getInvoice().getContact().getVatRegistrationNumber());
                  ZoneId timeZone = ZoneId.systemDefault();
                  Date date = Date.from(invoiceLineItem.getInvoice().getInvoiceDate().atStartOfDay(timeZone).toInstant());
                    supplierSupplyListing.setInvoiceDate(date);
                    supplierSupplyListing.setInvoiceNo(invoiceLineItem.getInvoice().getReferenceNumber());
                  List<SupplierInvoicePayment> supplierInvoicePayments = invoicePaymentRepository.findBySupplierInvoiceId(invoiceLineItem.getInvoice().getId());
                  for(SupplierInvoicePayment supplierInvoicePayment : supplierInvoicePayments){
                      supplierSupplyListing.setTransactionID(supplierInvoicePayment.getTransaction().getTransactionId());
                  }
                    supplierSupplyListing.setLineNo(1);
                    supplierSupplyListing.setProductName(invoiceLineItem.getProduct().getProductName());
                    supplierSupplyListing.setProductType(invoiceLineItem.getProduct().getProductType());
                    supplierSupplyListing.setProductDescription(invoiceLineItem.getProduct().getProductDescription());
                    supplierSupplyListing.setPurchaseValue(invoiceLineItem.getUnitPrice());
                    supplierSupplyListing.setVATValue(invoiceLineItem.getVatAmount());
                    supplierSupplyListing.setTaxCode("-");
                    supplierSupplyListing.setPermitNo(0);
                    supplierSupplyListing.setFCYCode("-");
                    supplierSupplyListing.setVATFCY(invoiceLineItem.getVatAmount());
                    supplierSupplyListing.setPurchaseFCY(invoiceLineItem.getUnitPrice());
                    purchaseTotal = purchaseTotal.add(invoiceLineItem.getUnitPrice());
                  supplierVATTotal =  supplierVATTotal.add((invoiceLineItem.getVatAmount()));
                  supplierSupplyListingRes.add(supplierSupplyListing);

                }

            }
            fta_response.setPurchaseTotal(purchaseTotal);
            fta_response.setSupplierVATTotal(supplierVATTotal);
            fta_response.setSupplierSupplyListingResponseModels(supplierSupplyListingRes);
            fta_response.setSupplierTransactionCountTotal(supplierSupplyListingRes.size());


            // Supply Data
            for (InvoiceLineItem invoiceLineItem : invoiceLineItemList) {
                CustomerSupplyListingResponseModel customerSupplyList = new CustomerSupplyListingResponseModel();
                if(invoiceLineItem.getInvoice().getType() == 2 && invoiceLineItem.getInvoice().getStatus() == 6) {
                    customerSupplyList.setCustomerName(getFullName(invoiceLineItem));
                    customerSupplyList.setCustomerCountry(invoiceLineItem.getInvoice().getContact().getCountry().getCountryName());
                    customerSupplyList.setCustomerTRN(invoiceLineItem.getInvoice().getContact().getVatRegistrationNumber());
                    ZoneId timeZone = ZoneId.systemDefault();
                    Date date = Date.from(invoiceLineItem.getInvoice().getInvoiceDate().atStartOfDay(timeZone).toInstant());
                    customerSupplyList.setInvoiceDate(date);
                    customerSupplyList.setInvoiceNo(invoiceLineItem.getInvoice().getReferenceNumber());
                    List<CustomerInvoiceReceipt> customerInvoiceReceipts = invoiceReceiptRepository.findByCustomerInvoiceId(invoiceLineItem.getInvoice().getId());
                    for(CustomerInvoiceReceipt customerInvoiceReceipt : customerInvoiceReceipts){
                        customerSupplyList.setTransactionID(customerInvoiceReceipt.getTransaction().getTransactionId());
                    }
                    customerSupplyList.setPermitNo(0);
                    customerSupplyList.setLineNo(1);
                    customerSupplyList.setProductName(invoiceLineItem.getProduct().getProductName());
                    customerSupplyList.setProductType(invoiceLineItem.getProduct().getProductType());
                    customerSupplyList.setProductDescription(invoiceLineItem.getProduct().getProductDescription());
                    customerSupplyList.setSupplyValue(invoiceLineItem.getUnitPrice());
                    customerSupplyList.setVATValue(invoiceLineItem.getVatAmount());
                    customerSupplyList.setTaxCode("-");
                    customerSupplyList.setVATFCY(invoiceLineItem.getVatAmount());
                    customerSupplyList.setSupplyFCY(invoiceLineItem.getUnitPrice());
                    customerSupplyList.setFCYCode("-");
                    supplyTotal = supplyTotal.add(invoiceLineItem.getUnitPrice());
                    customerVATTotal = customerVATTotal.add(invoiceLineItem.getVatAmount());
                    customerSupplyListingRes.add(customerSupplyList);

                }


            }
            fta_response.setSupplyTotal(supplyTotal);
            fta_response.setCustomerVATTotal(customerVATTotal);
            fta_response.setCustomerSupplyListingResponseModel(customerSupplyListingRes);
            fta_response.setCustomerTransactionCountTotal(customerSupplyListingRes.size());

            for (InvoiceLineItem invoiceLineItem : invoiceLineItemList) {
                GeneralLedgerListingResponseModel generalLedgerListing = new GeneralLedgerListingResponseModel();
                if(invoiceLineItem.getInvoice().getType() == 2 && invoiceLineItem.getInvoice().getStatus() == 6) {
                    List<CustomerInvoiceReceipt> customerInvoiceReceipts = invoiceReceiptRepository.findByCustomerInvoiceId(invoiceLineItem.getInvoice().getId());
                    for (CustomerInvoiceReceipt customerInvoiceReceipt : customerInvoiceReceipts) {
                        generalLedgerListing.setTransactionDate(customerInvoiceReceipt.getTransaction().getTransactionDate());
                        generalLedgerListing.setAccountID(customerInvoiceReceipt.getTransaction().getBankAccount().getBankAccountId());
                        generalLedgerListing.setAccountName(customerInvoiceReceipt.getTransaction().getCoaCategory().getChartOfAccountCategoryName());
                        generalLedgerListing.setTransactionDescription(customerInvoiceReceipt.getTransaction().getTransactionDescription());
                        generalLedgerListing.setName(invoiceLineItem.getInvoice().getReferenceNumber());
                        generalLedgerListing.setTransactionID(customerInvoiceReceipt.getTransaction().getTransactionId());
                        generalLedgerListing.setSourceDocumentID("-");
                          if(customerInvoiceReceipt.getTransaction().getDebitCreditFlag() == 'C') {
                            generalLedgerListing.setSourceType("Account Receivable");
                        }else{
                            generalLedgerListing.setSourceType("Account Payable");
                        }
                        if(customerInvoiceReceipt.getTransaction().getDebitCreditFlag() == 'C'){
                            generalLedgerListing.setCredit(invoiceLineItem.getUnitPrice());
                            TotalCredit = TotalCredit.add(generalLedgerListing.getCredit());
                            generalLedgerListing.setDebit(BigDecimal.ZERO);
                        }else {
                            generalLedgerListing.setDebit(invoiceLineItem.getUnitPrice());
                            TotalDebit = TotalDebit.add(generalLedgerListing.getDebit());
                            generalLedgerListing.setCredit(BigDecimal.ZERO);
                        }
                        generalLedgerListing.setBalance(invoiceLineItem.getUnitPrice());
                    }
                    generalLedgerListingRes.add(generalLedgerListing);
                }else if(invoiceLineItem.getInvoice().getType() == 1 && invoiceLineItem.getInvoice().getStatus() == 6){
                    List<SupplierInvoicePayment> supplierInvoicePayments = invoicePaymentRepository.findBySupplierInvoiceId(invoiceLineItem.getInvoice().getId());
                    for(SupplierInvoicePayment supplierInvoicePayment : supplierInvoicePayments){
                        generalLedgerListing.setTransactionDate(supplierInvoicePayment.getTransaction().getTransactionDate());
                        generalLedgerListing.setTransactionID(supplierInvoicePayment.getTransaction().getTransactionId());
                        generalLedgerListing.setAccountID(supplierInvoicePayment.getTransaction().getBankAccount().getBankAccountId());
                        generalLedgerListing.setAccountName(supplierInvoicePayment.getTransaction().getCoaCategory().getChartOfAccountCategoryName());
                        generalLedgerListing.setTransactionDescription(supplierInvoicePayment.getTransaction().getTransactionDescription());
                        generalLedgerListing.setName(invoiceLineItem.getInvoice().getReferenceNumber());
                        generalLedgerListing.setSourceDocumentID("-");
                        if(supplierInvoicePayment.getTransaction().getDebitCreditFlag() == 'D') {
                            generalLedgerListing.setSourceType("Account Payable");
                        }else{
                            generalLedgerListing.setSourceType("Account Receivable");
                        }
                        if(supplierInvoicePayment.getTransaction().getDebitCreditFlag() == 'D'){
                            generalLedgerListing.setDebit(invoiceLineItem.getUnitPrice());
                            TotalDebit = TotalDebit.add(generalLedgerListing.getDebit());
                            generalLedgerListing.setCredit(BigDecimal.ZERO);
                        }else {
                            generalLedgerListing.setCredit(invoiceLineItem.getUnitPrice());
                            TotalCredit = TotalCredit.add(generalLedgerListing.getCredit());
                            generalLedgerListing.setDebit(BigDecimal.ZERO);
                        }
                        generalLedgerListing.setBalance(invoiceLineItem.getUnitPrice());

                    }  generalLedgerListingRes.add(generalLedgerListing);

                }


            }
            fta_response.setTotalCredit(TotalCredit);
            fta_response.setTotalDebit(TotalDebit);
            fta_response.setTransactionCountTotal(generalLedgerListingRes.size());
            fta_response.setGeneralLedgerListingResponseModels(generalLedgerListingRes);
            fta_response.setGLTCurrency(company.getCurrencyCode().getCurrencyIsoCode());
        }


        return fta_response;
    }

    @Override
    public FtaAuditResponseModel getFtaExciseAuditReport(FtaAuditRequestModel requestModel) {
        FtaAuditResponseModel   fta_Excise_response = new FtaAuditResponseModel();
        Integer lineNo = 1;
        BigDecimal purchaseTotal = new BigDecimal(0);
        BigDecimal supplyTotal = new BigDecimal(0);
        BigDecimal supplierExciseTotal = new BigDecimal(0);
        BigDecimal customerExciseTotal = new BigDecimal(0);
        BigDecimal TransactionCountTotal = new BigDecimal(0);
        BigDecimal TotalDebit = new BigDecimal(0);
        BigDecimal TotalCredit =  new BigDecimal(0);
        List<SupplierSupplyListingResponseModel> supplierSupplyListingRes = new LinkedList<>();
        List<CustomerSupplyListingResponseModel> customerSupplyListingRes = new LinkedList<>();
        List<GeneralLedgerListingResponseModel> generalLedgerListingRes = new LinkedList<>();
        List<CustomerDataResponseModel> customerData = new LinkedList<>();
        List<SupplierDataResponseModel> supplierData = new LinkedList<>();

        Optional<Company> optionalCompany = companyRepository.findById(requestModel.getCompanyId());

        String CquertStr = "SELECT c  FROM Contact c WHERE c.contactType IN (2,3) AND c.deleteFlag=false ";
        Query Cquery = getEntityManager().createQuery(CquertStr);
        List<Contact> customerList = Cquery.getResultList();

        String SquertStr = "SELECT c  FROM Contact c WHERE c.contactType IN (1,3) AND c.deleteFlag=false ";
        Query Squery = getEntityManager().createQuery(SquertStr);
        List<Contact> supplierList = Squery.getResultList();



        List<InvoiceLineItem> invoiceLineItemList = invoiceLineitemRepository.findAll();

      Optional<VatTaxAgency> optionalTaxAgency = taxAgencyRepository.findById(requestModel.getTaxAgencyId());


        if (optionalCompany.isPresent()) {

            Company company = optionalCompany.get();
         VatTaxAgency vatTaxAgency = optionalTaxAgency.get();

            fta_Excise_response.setCompanyName(company.getCompanyName());
            fta_Excise_response.setTaxablePersonNameEn(vatTaxAgency.getTaxablePersonNameInEnglish());
            fta_Excise_response.setTaxablePersonNameAr(vatTaxAgency.getTaxablePersonNameInArabic());
            fta_Excise_response.setTaxRegistrationNumber(company.getVatNumber());
            fta_Excise_response.setTaxAgencyName(vatTaxAgency.getTaxAgencyName());
            fta_Excise_response.setTaxAgencyNumber(vatTaxAgency.getTaxAgencyNumber());
            fta_Excise_response.setTaxAgentName(vatTaxAgency.getTaxAgentName());
            fta_Excise_response.setTaxAgencyAgentNumber(vatTaxAgency.getTaxAgentApprovalNumber());
            fta_Excise_response.setStartDate(requestModel.getStartDate());
            fta_Excise_response.setEndDate(requestModel.getStartDate());
            fta_Excise_response.setProductVersion("-");
            fta_Excise_response.setFafVersion("-");
            fta_Excise_response.setCreationDate(vatTaxAgency.getCreatedDate());

            //  Customer Data
            for (Contact contact : customerList) {
                CustomerDataResponseModel model = new CustomerDataResponseModel();
                model.setCustomerName(getContactFullName(contact));
                model.setGlId("-");
                model.setReverseCharge("-");
                model.setCustomerCountry(contact.getCountry().getCountryName());
                model.setCustomerTRN(contact.getVatRegistrationNumber());
                customerData.add(model);
            }
            fta_Excise_response.setCustomerDataResponseModels(customerData);

            //  Supplier Data
            for (Contact contact : supplierList) {
                SupplierDataResponseModel supplierDataResponseModel = new SupplierDataResponseModel();
                supplierDataResponseModel.setSupplierName(getContactFullName(contact));
                supplierDataResponseModel.setGlId("-");
                supplierDataResponseModel.setSupplierCountry(contact.getCountry().getCountryName());
                supplierDataResponseModel.setSupplierTRN(contact.getVatRegistrationNumber());
                supplierDataResponseModel.setReverseCharge("No");
                supplierData.add(supplierDataResponseModel);
            }
            fta_Excise_response.setSupplierDataResponseModels(supplierData);

//            Purchase Data
            for (InvoiceLineItem invoiceLineItem : invoiceLineItemList) {
                SupplierSupplyListingResponseModel supplierSupplyListing = new SupplierSupplyListingResponseModel();
                if (invoiceLineItem.getInvoice().getType() == 1 && invoiceLineItem.getInvoice().getStatus() == 6) {
                    supplierSupplyListing.setSupplierName(getFullName(invoiceLineItem));
                    supplierSupplyListing.setSupplierCountry(invoiceLineItem.getInvoice().getContact().getCountry().getCountryName());
                    supplierSupplyListing.setSupplierTRN(invoiceLineItem.getInvoice().getContact().getVatRegistrationNumber());
                    ZoneId timeZone = ZoneId.systemDefault();
                    Date date = Date.from(invoiceLineItem.getInvoice().getInvoiceDate().atStartOfDay(timeZone).toInstant());
                    supplierSupplyListing.setInvoiceDate(date);
                    supplierSupplyListing.setInvoiceNo(invoiceLineItem.getInvoice().getReferenceNumber());
                    List<SupplierInvoicePayment> supplierInvoicePayments = invoicePaymentRepository.findBySupplierInvoiceId(invoiceLineItem.getInvoice().getId());
                    for(SupplierInvoicePayment supplierInvoicePayment : supplierInvoicePayments){
                        supplierSupplyListing.setTransactionID(supplierInvoicePayment.getTransaction().getTransactionId());
                    }
                    supplierSupplyListing.setLineNo(lineNo++);
                    supplierSupplyListing.setProductName(invoiceLineItem.getProduct().getProductName());
                    supplierSupplyListing.setProductType(invoiceLineItem.getProduct().getProductType());
                    supplierSupplyListing.setProductDescription(invoiceLineItem.getProduct().getProductDescription());
                    supplierSupplyListing.setPurchaseValue(invoiceLineItem.getUnitPrice());
                    supplierSupplyListing.setExciseTaxValue(invoiceLineItem.getExciseAmount());
//                  supplierSupplyListingResponseModel.setTaxCode();
                    supplierSupplyListing.setExciseTaxFCY(invoiceLineItem.getExciseAmount());
                    supplierSupplyListing.setPurchaseFCY(invoiceLineItem.getUnitPrice());
                    purchaseTotal = purchaseTotal.add(invoiceLineItem.getUnitPrice());
                    supplierExciseTotal =  supplierExciseTotal.add((invoiceLineItem.getExciseAmount()));
                    supplierSupplyListingRes.add(supplierSupplyListing);

                }

            }
            fta_Excise_response.setPurchaseTotal(purchaseTotal);
            fta_Excise_response.setSupplierExciseTotal(supplierExciseTotal);
            fta_Excise_response.setSupplierSupplyListingResponseModels(supplierSupplyListingRes);
            fta_Excise_response.setSupplierTransactionCountTotal(supplierSupplyListingRes.size());


            // Supply Data
            for (InvoiceLineItem invoiceLineItem : invoiceLineItemList) {
                CustomerSupplyListingResponseModel customerSupplyList = new CustomerSupplyListingResponseModel();
                if(invoiceLineItem.getInvoice().getType() == 2 && invoiceLineItem.getInvoice().getStatus() == 6) {
                    customerSupplyList.setCustomerName(getFullName(invoiceLineItem));
                    customerSupplyList.setCustomerCountry(invoiceLineItem.getInvoice().getContact().getCountry().getCountryName());
                    customerSupplyList.setCustomerTRN(invoiceLineItem.getInvoice().getContact().getVatRegistrationNumber());
                    ZoneId timeZone = ZoneId.systemDefault();
                    Date date = Date.from(invoiceLineItem.getInvoice().getInvoiceDate().atStartOfDay(timeZone).toInstant());
                    customerSupplyList.setInvoiceDate(date);
                    customerSupplyList.setInvoiceNo(invoiceLineItem.getInvoice().getReferenceNumber());
                    List<CustomerInvoiceReceipt> customerInvoiceReceipts = invoiceReceiptRepository.findByCustomerInvoiceId(invoiceLineItem.getInvoice().getId());
                    for(CustomerInvoiceReceipt customerInvoiceReceipt : customerInvoiceReceipts){
                        customerSupplyList.setTransactionID(customerInvoiceReceipt.getTransaction().getTransactionId());
                    }

                    customerSupplyList.setLineNo(lineNo++);
                    customerSupplyList.setProductName(invoiceLineItem.getProduct().getProductName());
                    customerSupplyList.setProductType(invoiceLineItem.getProduct().getProductType());
                    customerSupplyList.setProductDescription(invoiceLineItem.getProduct().getProductDescription());
                    customerSupplyList.setSupplyValue(invoiceLineItem.getUnitPrice());
                    customerSupplyList.setExciseTaxValue(invoiceLineItem.getExciseAmount());
//                    supplierSupplyListingResponseModel.setTaxCode();
                    customerSupplyList.setExciseTaxFCY(invoiceLineItem.getExciseAmount());
                    customerSupplyList.setSupplyFCY(invoiceLineItem.getUnitPrice());
                    supplyTotal = supplyTotal.add(invoiceLineItem.getUnitPrice());
                    customerExciseTotal = customerExciseTotal.add(invoiceLineItem.getExciseAmount());
                    customerSupplyListingRes.add(customerSupplyList);

                }


            }
            fta_Excise_response.setSupplyTotal(supplyTotal);
            fta_Excise_response.setCustomerExciseTotal(customerExciseTotal);
            fta_Excise_response.setCustomerSupplyListingResponseModel(customerSupplyListingRes);
            fta_Excise_response.setCustomerTransactionCountTotal(customerSupplyListingRes.size());

            for (InvoiceLineItem invoiceLineItem : invoiceLineItemList) {
                GeneralLedgerListingResponseModel generalLedgerListing = new GeneralLedgerListingResponseModel();
                if(invoiceLineItem.getInvoice().getType() == 2 && invoiceLineItem.getInvoice().getStatus() == 6) {
                    List<CustomerInvoiceReceipt> customerInvoiceReceipts = invoiceReceiptRepository.findByCustomerInvoiceId(invoiceLineItem.getInvoice().getId());
                    for (CustomerInvoiceReceipt customerInvoiceReceipt : customerInvoiceReceipts) {
                        generalLedgerListing.setTransactionDate(customerInvoiceReceipt.getTransaction().getTransactionDate());
                        generalLedgerListing.setTransactionID(customerInvoiceReceipt.getTransaction().getTransactionId());
                        generalLedgerListing.setAccountID(customerInvoiceReceipt.getTransaction().getBankAccount().getBankAccountId());
                        generalLedgerListing.setAccountName(customerInvoiceReceipt.getTransaction().getCoaCategory().getChartOfAccountCategoryName());
                        generalLedgerListing.setTransactionDescription(customerInvoiceReceipt.getTransaction().getTransactionDescription());
                        generalLedgerListing.setName(invoiceLineItem.getInvoice().getReferenceNumber());
                        generalLedgerListing.setSourceDocumentID("-");
                        if(customerInvoiceReceipt.getTransaction().getDebitCreditFlag() == 'D') {
                            generalLedgerListing.setSourceType("Account Payable");
                        }else{
                            generalLedgerListing.setSourceType("Account Receivable");
                        }
                        if(customerInvoiceReceipt.getTransaction().getDebitCreditFlag() == 'C'){
                            generalLedgerListing.setCredit(invoiceLineItem.getUnitPrice());
                            TotalCredit = TotalCredit.add(generalLedgerListing.getCredit());
                            generalLedgerListing.setDebit(BigDecimal.ZERO);
                        }else {
                            generalLedgerListing.setDebit(invoiceLineItem.getUnitPrice());
                            TotalDebit = TotalDebit.add(generalLedgerListing.getDebit());
                            generalLedgerListing.setCredit(BigDecimal.ZERO);
                        }
                        generalLedgerListing.setBalance(invoiceLineItem.getUnitPrice());
                    }
                    generalLedgerListingRes.add(generalLedgerListing);
                }else if(invoiceLineItem.getInvoice().getType() == 1 && invoiceLineItem.getInvoice().getStatus() == 6){
                    List<SupplierInvoicePayment> supplierInvoicePayments = invoicePaymentRepository.findBySupplierInvoiceId(invoiceLineItem.getInvoice().getId());
                    for(SupplierInvoicePayment supplierInvoicePayment : supplierInvoicePayments){
                        generalLedgerListing.setTransactionDate(supplierInvoicePayment.getTransaction().getTransactionDate());
                        generalLedgerListing.setTransactionID(supplierInvoicePayment.getTransaction().getTransactionId());
                        generalLedgerListing.setAccountID(supplierInvoicePayment.getTransaction().getBankAccount().getBankAccountId());
                        generalLedgerListing.setAccountName(supplierInvoicePayment.getTransaction().getCoaCategory().getChartOfAccountCategoryName());
                        generalLedgerListing.setTransactionDescription(supplierInvoicePayment.getTransaction().getTransactionDescription());
                        generalLedgerListing.setName(invoiceLineItem.getInvoice().getReferenceNumber());
                        generalLedgerListing.setSourceDocumentID("-");
                        if(supplierInvoicePayment.getTransaction().getDebitCreditFlag() == 'C') {
                            generalLedgerListing.setSourceType("Account Receivable");
                        }else{
                            generalLedgerListing.setSourceType("Account Payable");
                        }
                        if(supplierInvoicePayment.getTransaction().getDebitCreditFlag() == 'D'){
                            generalLedgerListing.setDebit(invoiceLineItem.getUnitPrice());
                            TotalDebit = TotalDebit.add(generalLedgerListing.getDebit());
                            generalLedgerListing.setCredit(BigDecimal.ZERO);
                        }else {
                            generalLedgerListing.setCredit(invoiceLineItem.getUnitPrice());
                            TotalCredit = TotalCredit.add(generalLedgerListing.getCredit());
                            generalLedgerListing.setDebit(BigDecimal.ZERO);
                        }
                        generalLedgerListing.setBalance(invoiceLineItem.getUnitPrice());
                    }
                    generalLedgerListingRes.add(generalLedgerListing);
                }

            }
            fta_Excise_response.setTotalCredit(TotalCredit);
            fta_Excise_response.setTotalDebit(TotalDebit);
            fta_Excise_response.setTransactionCountTotal(generalLedgerListingRes.size());
            fta_Excise_response.setGeneralLedgerListingResponseModels(generalLedgerListingRes);
            fta_Excise_response.setGLTCurrency(company.getCurrencyCode().getCurrencyIsoCode());
        }


        return fta_Excise_response;
    }
    public String getFullName(InvoiceLineItem invoiceLineItem) {

            if(invoiceLineItem.getInvoice().getContact()!=null) {
                return getContactFullName(invoiceLineItem.getInvoice().getContact());
            }
            return " - ";
    }
    public String getContactFullName(Contact contact) {
        StringBuilder sb = new StringBuilder();
        if (contact != null ) {
            sb.append(contact.getFirstName()).append(" ");
            sb.append(contact.getMiddleName()).append(" ");
            sb.append(contact.getLastName());
        }
        return sb.toString();
    }

    @Override
    public AgingListModel getAgingReport(AgingRequestModel requestModel) {
        AgingListModel agingListModel = new AgingListModel();
        List<AgingResponseModel> agingResponseModels = new LinkedList<>();
//        AgingResponseModel agingResponseModel = new AgingResponseModel();
        Map<Integer, AgingResponseModel> agingReport = new HashMap();
        List<Invoice> queryresp = invoiceRepository.findAllByStatusAndType(3 ,2);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(CommonColumnConstants.DD_MM_YYYY);
        LocalDate endDate = LocalDate.parse(requestModel.getEndDate(), formatter);
        for (Invoice invoice : queryresp) {
  Duration daysBetween = Duration.between(invoice.getInvoiceDate().atStartOfDay(),endDate.atStartOfDay());
  Integer contact = invoice.getContact().getContactId();
            AgingResponseModel agingResponseModel = agingReport.get(contact);
            if(agingResponseModel == null){
               agingResponseModel = new AgingResponseModel();
               agingReport.put(contact,agingResponseModel);
                agingResponseModels.add(agingResponseModel);
            }
            if (invoice.getContact().getOrganization() == null || invoice.getContact().getOrganization().isEmpty()){
                agingResponseModel.setContactName(invoice.getContact().getFirstName() +" "+invoice.getContact().getLastName());
            }else {
                agingResponseModel.setContactName(invoice.getContact().getOrganization());
            }
            agingResponseModel.setOrganizationName(invoice.getContact().getOrganization());
            if (daysBetween.toDays() < 15) {
                agingResponseModel.setLessthen15(agingResponseModel.getLessthen15().add(invoice.getTotalAmount().multiply(invoice.getExchangeRate())));
                agingResponseModel.setTotalAmount(agingResponseModel.getTotalAmount().add(invoice.getTotalAmount().multiply(invoice.getExchangeRate())));
            } else if (daysBetween.toDays() > 15 && daysBetween.toDays() < 30) {
                agingResponseModel.setBetween15to30(agingResponseModel.getBetween15to30().add(invoice.getTotalAmount().multiply(invoice.getExchangeRate())));
                agingResponseModel.setTotalAmount(agingResponseModel.getTotalAmount().add(invoice.getTotalAmount().multiply(invoice.getExchangeRate())));
            } else {
                agingResponseModel.setMorethan30(agingResponseModel.getTotalAmount().add(invoice.getTotalAmount().multiply(invoice.getExchangeRate())));
                agingResponseModel.setTotalAmount(agingResponseModel.getTotalAmount().add(invoice.getTotalAmount().multiply(invoice.getExchangeRate())));
            }
         }
        agingListModel.setAgingResponseModelList(agingResponseModels);
        return agingListModel;
    }
}
