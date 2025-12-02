package com.simplevat.rest.CorporateTax;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simplevat.constant.*;
import com.simplevat.entity.*;
import com.simplevat.entity.bankaccount.BankAccount;
import com.simplevat.entity.bankaccount.Transaction;
import com.simplevat.entity.bankaccount.TransactionCategory;
import com.simplevat.repository.TransactionExplanationRepository;
import com.simplevat.rest.CorporateTax.Model.CorporateTaxPaymentModel;
import com.simplevat.rest.CorporateTax.Model.PaymentHistoryModel;
import com.simplevat.rest.CorporateTax.Repositories.CorporateTaxPaymentHistoryRepository;
import com.simplevat.rest.CorporateTax.Repositories.CorporateTaxPaymentRepository;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.rest.PostingRequestModel;
import com.simplevat.rest.financialreport.FinancialReportRequestModel;
import com.simplevat.rest.financialreport.FinancialReportRestHelper;
import com.simplevat.rest.financialreport.ProfitAndLossResponseModel;
import com.simplevat.rest.financialreport.RecordVatPaymentRequestModel;
import com.simplevat.service.*;
import com.simplevat.service.bankaccount.TransactionService;
import com.simplevat.utils.DateFormatUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CorporateTaxService {
    private static final String dateFormat = "dd/MM/yyyy";
    @Autowired
    private DateFormatUtil dateUtils;
    @Autowired
    private UserService userService;

    @Autowired
    private  CorporateTaxFilingRepository corporateTaxFilingRepository;

    @Autowired
    private TransactionCategoryService transactionCategoryService;

    @Autowired
    private JournalService journalService;

    @Autowired
    private CorporateTaxPaymentRepository corporateTaxPaymentRepository;

    @Autowired
    private ChartOfAccountCategoryService chartOfAccountCategoryService;

    @Autowired
    private TransactionExplanationRepository transactionExplanationRepository;

    @Autowired
    private BankAccountService bankAccountService;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private CorporateTaxPaymentHistoryRepository corporateTaxPaymentHistoryRepository;

    @Autowired
    private DateFormatUtil dateFormatUtil;

    @Autowired
    private FinancialReportRestHelper financialReportRestHelper;

    DateTimeFormatter outputFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public List<CorporateTaxModel> getCorporateTaxList(PaginationResponseModel responseModel,
                                                       int pageNo, int pageSize, boolean paginationDisable,
                                                       String sortOrder, String sortingCol, Integer userId) {
        User user = userService.findByPK(userId);
        List<CorporateTaxModel> corporateTaxModelList = new ArrayList<>();
        List<CorporateTaxFiling> corporateTaxFilingList = new ArrayList<>();
        Pageable pageable =  getCTPageableRequest(pageNo, pageSize, sortOrder,sortingCol);
        Page<CorporateTaxFiling> corporateTaxFilingPage = corporateTaxFilingRepository.findByDeleteFlag( false,pageable);
        corporateTaxFilingList = corporateTaxFilingPage.getContent();
        responseModel.setCount((int)corporateTaxFilingPage.getTotalElements());
        if(corporateTaxFilingList != null && ! corporateTaxFilingList.isEmpty()){
            for(CorporateTaxFiling corporateTaxFiling:corporateTaxFilingList){
                CorporateTaxModel corporateTaxModel= new CorporateTaxModel();
                if(corporateTaxFiling.getId()!= null)
                    corporateTaxModel.setId(corporateTaxFiling.getId());
                if(corporateTaxFiling.getStartDate() != null && corporateTaxFiling.getEndDate() != null)
                    corporateTaxModel.setStartDate(corporateTaxFiling.getStartDate().toString());
                corporateTaxModel.setEndDate(corporateTaxFiling.getEndDate().toString());
                if(corporateTaxFiling.getDueDate() != null)
                    corporateTaxModel.setDueDate(corporateTaxFiling.getDueDate().toString());
                if(corporateTaxFiling.getStatus().equals(CommonStatusEnum.UN_FILED.getValue())){
                    LocalDate sDate = LocalDate.parse(corporateTaxFiling.getStartDate().toString());
                    String startingDate = sDate.format(outputFormatter);
                    LocalDate eDate = LocalDate.parse(corporateTaxFiling.getEndDate().toString());
                    String endingDate = eDate.format(outputFormatter);
                    FinancialReportRequestModel financialReportRequestModel = new FinancialReportRequestModel();
                    financialReportRequestModel.setStartDate(startingDate);
                    financialReportRequestModel.setEndDate(endingDate);
                    ProfitAndLossResponseModel profitAndLossResponseModel = financialReportRestHelper.getProfitAndLossReport(financialReportRequestModel);
                    if (profitAndLossResponseModel!=null){
                        corporateTaxFiling.setNetIncome(profitAndLossResponseModel.getOperatingProfit());
                        BigDecimal corporateTax = new BigDecimal("375000.00");
                        if(profitAndLossResponseModel.getOperatingProfit()!=null) {
                            if (profitAndLossResponseModel.getOperatingProfit().compareTo(corporateTax) <= 0) {
                                corporateTaxFiling.setTaxableAmount(BigDecimal.ZERO);
                                corporateTaxFiling.setTaxAmount(BigDecimal.ZERO);
                                corporateTaxFiling.setBalanceDue(BigDecimal.ZERO);
                            } else {
                                BigDecimal taxableAmt = new BigDecimal(String.valueOf(profitAndLossResponseModel.getOperatingProfit().subtract(corporateTax)));
                                corporateTaxFiling.setTaxableAmount(taxableAmt);
                                corporateTaxFiling.setTaxAmount(taxableAmt.multiply(BigDecimal.valueOf(0.09)));
                                corporateTaxFiling.setBalanceDue(taxableAmt.multiply(BigDecimal.valueOf(0.09)));
                            }
                            try {
                                ObjectMapper objectMapper = new ObjectMapper();
                                String jsonString = objectMapper.writeValueAsString(profitAndLossResponseModel);
                                corporateTaxFiling.setViewCtReport(jsonString);
                            }catch (Exception e){

                            }
                            corporateTaxFilingRepository.save(corporateTaxFiling);
                        }
                    }
                }
                if(corporateTaxFiling.getNetIncome() != null)
                    corporateTaxModel.setNetIncome(corporateTaxFiling.getNetIncome());
                if(corporateTaxFiling.getTaxableAmount() != null)
                    corporateTaxModel.setTaxableAmount(corporateTaxFiling.getTaxableAmount());
                if(corporateTaxFiling.getTaxAmount() != null)
                    corporateTaxModel.setTaxAmount(corporateTaxFiling.getTaxAmount());

                if(corporateTaxFiling.getTaxFiledOn() != null)
                    corporateTaxModel.setTaxFiledOn(corporateTaxFiling.getTaxFiledOn().toString());
                if(corporateTaxFiling.getStatus() != null)
                    corporateTaxModel.setStatus(CommonStatusEnum.getInvoiceTypeByValue(corporateTaxFiling.getStatus()));
                if(corporateTaxFiling.getBalanceDue() != null)
                    corporateTaxModel.setBalanceDue(corporateTaxFiling.getBalanceDue());
                corporateTaxModelList.add(corporateTaxModel);

            }

        }
        responseModel.setData(corporateTaxModelList);
            return corporateTaxModelList;
    }
    SimpleDateFormat sdf = new SimpleDateFormat("MM/dd/yyyy hh:mm a");
    public List<PaymentHistoryModel> getCtPaymentHistory(PaginationResponseModel responseModel,
                                                       int pageNo, int pageSize, boolean paginationDisable,
                                                       String sortOrder, String sortingCol, Integer userId) {
        User user = userService.findByPK(userId);
        List<PaymentHistoryModel> paymentHistoryModelList = new ArrayList<>();
        List<CorporateTaxPaymentHistory> corporateTaxPaymentHistoryList = new ArrayList<>();
        Pageable pageable =  getCTPageableRequest(pageNo, pageSize, sortOrder,sortingCol);
        Page<CorporateTaxPaymentHistory> corporateTaxPaymentHistoryPage = corporateTaxPaymentHistoryRepository.findAll(pageable);
        corporateTaxPaymentHistoryList = corporateTaxPaymentHistoryPage.getContent();
        responseModel.setCount((int)corporateTaxPaymentHistoryPage.getTotalElements());
        if(corporateTaxPaymentHistoryList != null && ! corporateTaxPaymentHistoryList.isEmpty()){
            for(CorporateTaxPaymentHistory corporateTaxPaymentHistory:corporateTaxPaymentHistoryList){
                PaymentHistoryModel paymentHistoryModel= new PaymentHistoryModel();
                if(corporateTaxPaymentHistory.getId()!= null)
                    paymentHistoryModel.setId(corporateTaxPaymentHistory.getId());
                if(corporateTaxPaymentHistory.getStartDate() != null && corporateTaxPaymentHistory.getEndDate() != null)
                    paymentHistoryModel.setStartDate(corporateTaxPaymentHistory.getStartDate().toString());
                paymentHistoryModel.setEndDate(corporateTaxPaymentHistory.getEndDate().toString());
                if(corporateTaxPaymentHistory.getAmountPaid() != null)
                    paymentHistoryModel.setAmountPaid(corporateTaxPaymentHistory.getAmountPaid());
                if (corporateTaxPaymentHistory.getPaymentDate()!=null){
                    paymentHistoryModel.setPaymentDate(corporateTaxPaymentHistory.getPaymentDate());
                }
                paymentHistoryModelList.add(paymentHistoryModel);
            }
        }
        responseModel.setData(paymentHistoryModelList);
        return paymentHistoryModelList;
    }
    private Pageable getCTPageableRequest(int pageNo, int pageSize, String sortOrder, String sortingCol) {
        /*if(sortingCol !=null && !sortingCol.isEmpty())
            if(sortOrder!=null && sortOrder.contains("desc")) {
                return PageRequest.of(pageNo, pageSize, Sort.by(sortingCol).descending());
            }
            else {
                return PageRequest.of(pageNo, pageSize, Sort.by(sortingCol).ascending());
            }
        }*/
        return PageRequest.of(pageNo, pageSize, Sort.by("createdDate").descending());
    }

    public void createJournalForCT(CorporateTaxFiling corporateTaxFiling, Integer userId) {
        Journal journal = new Journal();
        List<JournalLineItem> journalLineItemList = new ArrayList<>();

        if (corporateTaxFiling.getTaxAmount()!=null){
            JournalLineItem journalLineItem = new JournalLineItem();
            TransactionCategory ctCategory = transactionCategoryService
                    .findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.CORPORATION_TAX.getCode());
            journalLineItem.setTransactionCategory(ctCategory);
                journalLineItem.setCreditAmount(corporateTaxFiling.getTaxAmount());
            journalLineItem.setReferenceType(PostingReferenceTypeEnum.CORPORATE_TAX_REPORT_FILED);
            journalLineItem.setReferenceId(corporateTaxFiling.getId());
            journalLineItem.setExchangeRate(BigDecimal.ONE);
            journalLineItem.setCreatedBy(userId);
            journalLineItem.setJournal(journal);
            journalLineItemList.add(journalLineItem);
        }
        if (corporateTaxFiling.getTaxAmount()!=null){
            JournalLineItem journalLineItem1 = new JournalLineItem();
            TransactionCategory retainedEarningsCategory = transactionCategoryService
                    .findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.RETAINED_EARNINGS.getCode());
            journalLineItem1.setTransactionCategory(retainedEarningsCategory);
                journalLineItem1.setDebitAmount(corporateTaxFiling.getTaxAmount());
            journalLineItem1.setReferenceType(PostingReferenceTypeEnum.CORPORATE_TAX_REPORT_FILED);
            journalLineItem1.setReferenceId(corporateTaxFiling.getId());
            journalLineItem1.setExchangeRate(BigDecimal.ONE);
            journalLineItem1.setCreatedBy(userId);
            journalLineItem1.setJournal(journal);
            journalLineItemList.add(journalLineItem1);
        }
        journal.setJournalLineItems(journalLineItemList);
        journal.setCreatedBy(userId);
        journal.setPostingReferenceType(PostingReferenceTypeEnum.CORPORATE_TAX_REPORT_FILED);
        journal.setJournalDate(corporateTaxFiling.getTaxFiledOn());
        if (corporateTaxFiling.getTaxFiledOn()!=null)
        journal.setTransactionDate(corporateTaxFiling.getTaxFiledOn());
        journalService.persist(journal);
    }

    public void createReverseJournalForCT(CorporateTaxFiling corporateTaxFiling, Integer userId) {
        Journal journal = new Journal();
        List<JournalLineItem> journalLineItemList = new ArrayList<>();

        if (corporateTaxFiling.getTaxAmount()!=null){
            JournalLineItem journalLineItem = new JournalLineItem();
            TransactionCategory ctCategory = transactionCategoryService
                    .findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.CORPORATION_TAX.getCode());
            journalLineItem.setTransactionCategory(ctCategory);
            journalLineItem.setDebitAmount(corporateTaxFiling.getTaxAmount());
            journalLineItem.setReferenceType(PostingReferenceTypeEnum.CORPORATE_TAX_REPORT_UNFILED);
            journalLineItem.setReferenceId(corporateTaxFiling.getId());
            journalLineItem.setExchangeRate(BigDecimal.ONE);
            journalLineItem.setCreatedBy(userId);
            journalLineItem.setJournal(journal);
            journalLineItemList.add(journalLineItem);
        }
        if (corporateTaxFiling.getTaxAmount()!=null){
            JournalLineItem journalLineItem1 = new JournalLineItem();
            TransactionCategory retainedEarningsCategory = transactionCategoryService
                    .findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.RETAINED_EARNINGS.getCode());
            journalLineItem1.setTransactionCategory(retainedEarningsCategory);
            journalLineItem1.setCreditAmount(corporateTaxFiling.getTaxAmount());
            journalLineItem1.setReferenceType(PostingReferenceTypeEnum.CORPORATE_TAX_REPORT_UNFILED);
            journalLineItem1.setReferenceId(corporateTaxFiling.getId());
            journalLineItem1.setExchangeRate(BigDecimal.ONE);
            journalLineItem1.setCreatedBy(userId);
            journalLineItem1.setJournal(journal);
            journalLineItemList.add(journalLineItem1);
        }
        journal.setJournalLineItems(journalLineItemList);
        journal.setCreatedBy(userId);
        journal.setPostingReferenceType(PostingReferenceTypeEnum.CORPORATE_TAX_REPORT_UNFILED);
        journal.setJournalDate(LocalDate.now());
        if (corporateTaxFiling.getTaxFiledOn()!=null)
            journal.setTransactionDate(corporateTaxFiling.getTaxFiledOn());
        journalService.persist(journal);
    }
    public CorporateTaxPayment recordCorporateTaxPayment (CorporateTaxPaymentModel corporateTaxPaymentModel, Integer userId) throws IOException {
        CorporateTaxPayment corporateTaxPayment= saveRecordToEntity( corporateTaxPaymentModel,userId);
        BigDecimal corporateTaxFilingBalanceDue = corporateTaxPayment.getCorporateTaxFiling().getBalanceDue().subtract(corporateTaxPayment.getAmountPaid());
        CorporateTaxFiling corporateTaxFiling =  corporateTaxPayment.getCorporateTaxFiling();
        if (corporateTaxFilingBalanceDue.compareTo(BigDecimal.ZERO)==0) {
            corporateTaxFiling.setBalanceDue(corporateTaxFilingBalanceDue);
        }
            if (corporateTaxFiling.getBalanceDue().compareTo(BigDecimal.ZERO)==0){
                corporateTaxFiling.setStatus(CommonStatusEnum.PAID.getValue());
            }
            else{
                corporateTaxFiling.setBalanceDue(corporateTaxFilingBalanceDue);
                corporateTaxFiling.setStatus(CommonStatusEnum.PARTIALLY_PAID.getValue());
            }
        corporateTaxFilingRepository.save(corporateTaxFiling);
        createCashTransactionForCorporatePayment(corporateTaxPayment,corporateTaxPaymentModel,userId);
        createCorporateTaxPaymentHistory(corporateTaxPayment,userId);
        return corporateTaxPayment;
    }
    private CorporateTaxPayment saveRecordToEntity(CorporateTaxPaymentModel corporateTaxPaymentModel, Integer userId) throws IOException {
        CorporateTaxPayment corporateTaxPayment = new CorporateTaxPayment();
        if (corporateTaxPaymentModel.getPaymentDate()!=null){
            LocalDateTime paymentDate = dateFormatUtil.getDateStrAsLocalDateTime(corporateTaxPaymentModel.getPaymentDate(),
                    CommonColumnConstants.DD_MM_YYYY);
            LocalDate pd = paymentDate.toLocalDate();
            corporateTaxPayment.setPaymentDate(pd);
        }
        if (corporateTaxPaymentModel.getTotalAmount()!=null){
            corporateTaxPayment.setTotalAmount(corporateTaxPaymentModel.getTotalAmount());
        }
        if (corporateTaxPaymentModel.getAmountPaid()!=null){
            corporateTaxPayment.setAmountPaid(corporateTaxPaymentModel.getAmountPaid());
        }
        if (corporateTaxPaymentModel.getTotalAmount()!=null && corporateTaxPaymentModel.getAmountPaid()!=null ){
            corporateTaxPayment.setBalanceDue(corporateTaxPaymentModel.getTotalAmount().subtract(corporateTaxPaymentModel.getAmountPaid()));
        }
        if (corporateTaxPaymentModel.getDepositToTransactionCategoryId()!=null){
            corporateTaxPayment.setDepositToTransactionCategory(transactionCategoryService.findByPK
                    (corporateTaxPaymentModel.getDepositToTransactionCategoryId()));
        }
        if (corporateTaxPaymentModel.getTransactionId()!=null){
            corporateTaxPayment.setTransaction(transactionService.findByPK
                    (corporateTaxPaymentModel.getTransactionId()));
        }
        if (corporateTaxPaymentModel.getCorporateTaxFilingId()!=null){
            corporateTaxPayment.setCorporateTaxFiling(corporateTaxFilingRepository.findById(corporateTaxPaymentModel.getCorporateTaxFilingId()).get());
        }
        if (corporateTaxPaymentModel.getReferenceNumber()!=null){
            corporateTaxPayment.setReferenceNumber(corporateTaxPaymentModel.getReferenceNumber());
        }
        corporateTaxPayment.setCreatedBy(userId);
        corporateTaxPayment.setCreatedDate(LocalDateTime.now());
        corporateTaxPayment.setDeleteFlag(Boolean.FALSE);
        corporateTaxPaymentRepository.save(corporateTaxPayment);
        return corporateTaxPayment;
    }
    private void createCashTransactionForCorporatePayment(CorporateTaxPayment corporateTaxPayment,CorporateTaxPaymentModel
            corporateTaxPaymentModel,Integer userId) {
        Map<String, Object> param = new HashMap<>();
        if (corporateTaxPayment.getDepositToTransactionCategory()!=null)
            param.put("transactionCategory", corporateTaxPayment.getDepositToTransactionCategory());
        param.put("deleteFlag", false);
        List<BankAccount> bankAccountList = bankAccountService.findByAttributes(param);
        BankAccount bankAccount =  bankAccountList!= null && bankAccountList.size() > 0
                ? bankAccountList.get(0)
                : null;
        Transaction transaction = new Transaction();
        transaction.setCreatedBy(corporateTaxPayment.getCreatedBy());
        LocalDateTime paymentDate = dateFormatUtil.getDateStrAsLocalDateTime(corporateTaxPaymentModel.getPaymentDate(),
                CommonColumnConstants.DD_MM_YYYY);
        transaction.setTransactionDate(paymentDate);
        transaction.setBankAccount(bankAccount);
        transaction.setTransactionAmount(corporateTaxPayment.getAmountPaid());
        transaction.setTransactionExplinationStatusEnum(TransactionExplinationStatusEnum.FULL);
       // transaction.setTransactionDescription("Manual Transaction Created Against ReceiptNo "+vatPayment.getVatPaymentNo());
        transaction.setTransactionDueAmount(BigDecimal.ZERO);
        TransactionExplanation transactionExplanation = new TransactionExplanation();
            transaction.setCoaCategory(chartOfAccountCategoryService.findByPK(ChartOfAccountCategoryIdEnumConstant.MONEY_SPENT_OTHERS.getId()));
            transactionExplanation.setCoaCategory(chartOfAccountCategoryService.findByPK(ChartOfAccountCategoryIdEnumConstant.MONEY_SPENT_OTHERS.getId()));
            transaction.setDebitCreditFlag('D');
            if(bankAccount!=null) {
                BigDecimal currentBalance = bankAccount.getCurrentBalance();

                currentBalance = currentBalance.subtract(transaction.getTransactionAmount());
                bankAccount.setCurrentBalance(currentBalance);
            }
        transactionService.persist(transaction);
        transactionExplanation.setCreatedBy(userId);
        transactionExplanation.setCreatedDate(LocalDateTime.now());
        transactionExplanation.setTransaction(transaction);
        transactionExplanation.setPaidAmount(transaction.getTransactionAmount());
        transactionExplanation.setCurrentBalance(transaction.getCurrentBalance());
        transactionExplanation.setExplainedTransactionCategory(transaction.getExplainedTransactionCategory());
        transactionExplanation.setExchangeGainOrLossAmount(BigDecimal.ZERO);
        transactionExplanationRepository.save(transactionExplanation);
        bankAccountService.update(bankAccount);
        corporateTaxPayment.setTransaction(transaction);
        corporateTaxPaymentRepository.save(corporateTaxPayment);
        // Post journal
        Journal journal =  corporateTaxPaymentPosting(
                new PostingRequestModel(corporateTaxPayment.getId(), corporateTaxPayment.getAmountPaid()), userId,
                corporateTaxPayment.getDepositToTransactionCategory());
        journalService.persist(journal);
    }

    private Journal corporateTaxPaymentPosting(PostingRequestModel postingRequestModel, Integer userId, TransactionCategory depositeToTransactionCategory) {
        List<JournalLineItem> journalLineItemList = new ArrayList<>();
        Journal journal = new Journal();
        JournalLineItem journalLineItem1 = new JournalLineItem();
        JournalLineItem journalLineItem2 = new JournalLineItem();
        journalLineItem1.setReferenceId(postingRequestModel.getPostingRefId());
        CorporateTaxPayment corporateTaxPayment=corporateTaxPaymentRepository.findById(postingRequestModel.getPostingRefId()).get();
        TransactionCategory transactionCategory = transactionCategoryService.
                findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.CORPORATION_TAX.getCode());
        journalLineItem1.setTransactionCategory(depositeToTransactionCategory);
            journalLineItem1.setCreditAmount(postingRequestModel.getAmount());
            journalLineItem2.setDebitAmount(postingRequestModel.getAmount());
            journalLineItem1.setReferenceType(PostingReferenceTypeEnum.CORPORATE_TAX_PAYMENT);
        journalLineItem1.setExchangeRate(BigDecimal.ONE);
        journalLineItem1.setCreatedBy(userId);
        journalLineItem1.setJournal(journal);
        journalLineItemList.add(journalLineItem1);
        journalLineItem2.setTransactionCategory(transactionCategory);
            journalLineItem2.setReferenceType(PostingReferenceTypeEnum.CORPORATE_TAX_PAYMENT);
        journalLineItem2.setReferenceId(postingRequestModel.getPostingRefId());
        journalLineItem2.setExchangeRate(BigDecimal.ONE);
        journalLineItem2.setCreatedBy(userId);
        journalLineItem2.setJournal(journal);
        journalLineItemList.add(journalLineItem2);
        //Create Journal
        journal.setJournalLineItems(journalLineItemList);
        journal.setCreatedBy(userId);
            journal.setPostingReferenceType(PostingReferenceTypeEnum.CORPORATE_TAX_PAYMENT);
        journal.setJournalDate(corporateTaxPayment.getPaymentDate());
        journal.setTransactionDate(corporateTaxPayment.getPaymentDate());
        return journal;
    }
    private void createCorporateTaxPaymentHistory(CorporateTaxPayment corporateTaxPayment, Integer userId) {
        CorporateTaxPaymentHistory corporateTaxPaymentHistory = new CorporateTaxPaymentHistory();
        corporateTaxPaymentHistory.setCreatedBy(userId);
        corporateTaxPaymentHistory.setCreatedDate(LocalDateTime.now());
        corporateTaxPaymentHistory.setLastUpdatedBy(userId);
        corporateTaxPaymentHistory.setLastUpdateDate(LocalDateTime.now());
        corporateTaxPaymentHistory.setCorporateTaxPayment(corporateTaxPayment);
        corporateTaxPaymentHistory.setAmountPaid(corporateTaxPayment.getAmountPaid());
        corporateTaxPaymentHistory.setPaymentDate(corporateTaxPayment.getPaymentDate());
        corporateTaxPaymentHistory.setStartDate(corporateTaxPayment.getCorporateTaxFiling().getStartDate());
        corporateTaxPaymentHistory.setEndDate(corporateTaxPayment.getCorporateTaxFiling().getEndDate());
        corporateTaxPaymentHistoryRepository.save(corporateTaxPaymentHistory);
    }
}
