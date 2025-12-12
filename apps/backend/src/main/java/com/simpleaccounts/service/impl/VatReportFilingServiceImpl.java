package com.simpleaccounts.service.impl;

import com.simpleaccounts.constant.*;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.helper.DateFormatHelper;
import com.simpleaccounts.repository.JournalLineItemRepository;
import com.simpleaccounts.repository.TransactionExplanationRepository;
import com.simpleaccounts.rest.PostingRequestModel;
import com.simpleaccounts.constant.CommonColumnConstants;
import com.simpleaccounts.constant.CommonStatusEnum;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.entity.VatRecordPaymentHistory;
import com.simpleaccounts.entity.VatReportFiling;
import com.simpleaccounts.entity.VatTaxAgency;
import com.simpleaccounts.rest.customizeinvoiceprefixsuffixccontroller.CustomizeInvoiceTemplateService;
import com.simpleaccounts.rest.financialreport.*;
import com.simpleaccounts.service.*;
import com.simpleaccounts.service.bankaccount.TransactionService;
import com.simpleaccounts.utils.DateFormatUtil;
import com.simpleaccounts.utils.FileHelper;
import com.simpleaccounts.utils.InvoiceNumberUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

	@Service
	@SuppressWarnings("java:S3973")
	@RequiredArgsConstructor
public class VatReportFilingServiceImpl implements VatReportFilingService {
    private static final String DATE_FORMAT_DD_SLASH_MM_SLASH_YYYY = "dd/MM/yyyy";
    private final DateFormatUtil dateUtils;
    private final DateFormatHelper dateFormatHelper;

    private final VatReportFilingRepository vatReportFilingRepository;

    private final DateFormatUtil dateFormatUtil;

    private final CompanyService companyService;

    private final VatTaxAgencyRepository vatTaxAgencyRepository;

    private final TransactionCategoryService transactionCategoryService;

    private final JournalLineItemService journalLineItemService;

    private final JournalService journalService;

    private final FileHelper fileHelper;

    private final VatPaymentRepository vatPaymentRepository;

    private final BankAccountService bankAccountService;

    private final TransactionService transactionService;

    private final ChartOfAccountCategoryService chartOfAccountCategoryService;

    private final VatRecordPaymentHistoryRepository vatRecordPaymentHistoryRepository;

    private final UserService userService;

    private final InvoiceService invoiceService;
    private final ExpenseService expenseService;

    private final JournalLineItemRepository journalLineItemRepository;

    private final TransactionExplanationRepository transactionExplanationRepository;

    private final CustomizeInvoiceTemplateService customizeInvoiceTemplateService;

    private final InvoiceNumberUtil invoiceNumberUtil;
    @Override
    public boolean processVatReport(VatReportFilingRequestModel vatReportFilingRequestModel, User user){
        VatReportFiling vatReportFiling = new VatReportFiling();
        if (vatReportFilingRequestModel.getId()!=null){
            vatReportFiling = vatReportFilingRepository.findById(vatReportFilingRequestModel.getId()).get();
        }
        else {
            //added vatNumber
            String nxtExpenseNo = customizeInvoiceTemplateService.getLastInvoice(12);
            vatReportFiling.setVatNumber(nxtExpenseNo);
            if (vatReportFiling.getVatNumber()!=null) {
                CustomizeInvoiceTemplate template = customizeInvoiceTemplateService.getInvoiceTemplate(12);
                String suffix = invoiceNumberUtil.fetchSuffixFromString(vatReportFiling.getVatNumber());
                template.setSuffix(Integer.parseInt(suffix));
                String prefix = vatReportFiling.getVatNumber().substring(0,vatReportFiling.getVatNumber().lastIndexOf(suffix));
                template.setPrefix(prefix);
                customizeInvoiceTemplateService.persist(template);
            }
        }
        BigDecimal totalVatPayable = BigDecimal.ZERO;
        BigDecimal totalInputVatAmount = BigDecimal.ZERO;
        BigDecimal totalOutputVatAmount = BigDecimal.ZERO;
        BigDecimal totalAmount = BigDecimal.ZERO;

//       List<Object[]> totalInputVatAmountAndOutputVatAmountList=journalLineItemService.totalInputVatAmountAndOutputVatAmount(vatReportFilingRequestModel);

         totalInputVatAmount=journalLineItemService.totalInputVatAmount(vatReportFiling,vatReportFilingRequestModel,88) !=null?
                 journalLineItemService.totalInputVatAmount(vatReportFiling,vatReportFilingRequestModel,88)
                 :BigDecimal.ZERO;
         totalOutputVatAmount=journalLineItemService.totalOutputVatAmount(vatReportFiling,vatReportFilingRequestModel,94) !=null?
        journalLineItemService.totalOutputVatAmount(vatReportFiling,vatReportFilingRequestModel,94)
                 :BigDecimal.ZERO;

         if (totalInputVatAmount!=null && totalOutputVatAmount !=null){
             totalAmount = totalOutputVatAmount.subtract(totalInputVatAmount);
         }
        vatReportFiling.setCreatedBy(user.getUserId());
        vatReportFiling.setUserId(user);
        vatReportFiling.setCreatedDate(LocalDateTime.now());
        vatReportFiling.setLastUpdateDate(LocalDateTime.now());
        vatReportFiling.setLastUpdateBy(user.getUserId());
        vatReportFiling.setDeleteFlag(Boolean.FALSE);
        vatReportFiling.setStartDate(getStartDateAsLocalDatetime(vatReportFilingRequestModel.getStartDate()).toLocalDate());
        vatReportFiling.setEndDate(getEndDateAsLocalDatetime(vatReportFilingRequestModel.getEndDate()).toLocalDate());
        vatReportFiling.setStatus(CommonStatusEnum.UN_FILED.getValue());
//        vatReportFiling.setTaxFiledOn(LocalDateTime.now());
        if (totalAmount.compareTo(BigDecimal.ZERO)==-1){
            vatReportFiling.setTotalTaxReclaimable(totalAmount.negate());
            vatReportFiling.setBalanceDue(totalAmount.negate());
            vatReportFiling.setTotalTaxPayable(BigDecimal.ZERO);
            vatReportFiling.setIsVatReclaimable(Boolean.TRUE);
        }
        else {
            vatReportFiling.setTotalTaxPayable(totalAmount);
            vatReportFiling.setBalanceDue(totalAmount);
            vatReportFiling.setTotalTaxReclaimable(BigDecimal.ZERO);
            vatReportFiling.setIsVatReclaimable(Boolean.FALSE);
        }
        vatReportFilingRepository.save(vatReportFiling);
        return true;
    }
    private LocalDateTime getStartDateAsLocalDatetime(String startDateOfVatFiling) {
        LocalDateTime startDate = dateUtils.getDateStrAsLocalDateTime(startDateOfVatFiling,
                CommonColumnConstants.DD_MM_YYYY);
        return startDate;
    }
    private LocalDateTime getEndDateAsLocalDatetime(String endDateOfVatFiling) {
        LocalDateTime endDate = dateUtils.getDateStrAsLocalDateTime(endDateOfVatFiling,
                CommonColumnConstants.DD_MM_YYYY);
        return endDate;
    }
    public List<VatReportResponseModel> getVatReportFilingList(){
        String startDate = "";
        String endDate = "";
        List<VatReportResponseModel> vatReportResponseModels = new ArrayList<>();
     List<VatReportFiling> vatReportFilingList = vatReportFilingRepository.findAll();
     if (!vatReportFilingList.isEmpty()){
         for (VatReportFiling vatReportFiling:vatReportFilingList){
             User user=userService.findByPK(vatReportFiling.getCreatedBy());
             if (vatReportFiling.getStartDate()!=null){
                  startDate =DateTimeFormatter.ofPattern(DATE_FORMAT_DD_SLASH_MM_SLASH_YYYY).format(vatReportFiling.getStartDate());
             }
            if (vatReportFiling.getEndDate()!=null){
                 endDate =DateTimeFormatter.ofPattern(DATE_FORMAT_DD_SLASH_MM_SLASH_YYYY).format(vatReportFiling.getEndDate());
            }

             if (vatReportFiling.getStatus().equals(CommonStatusEnum.UN_FILED.getValue())){
                 VatReportFilingRequestModel vatReportFilingRequestModel = new VatReportFilingRequestModel();
                 vatReportFilingRequestModel.setId(vatReportFiling.getId());
                 vatReportFilingRequestModel.setStartDate(startDate);
                 vatReportFilingRequestModel.setEndDate(endDate);
                // processVatReport(vatReportFilingRequestModel,user);
             }
             VatReportResponseModel vatReportResponseModel = new VatReportResponseModel();
             vatReportResponseModel.setId(vatReportFiling.getId());
             if (vatReportFiling.getTaxFiledOn()!=null)
             vatReportResponseModel.setFiledOn(vatReportFiling.getTaxFiledOn().atStartOfDay());

             vatReportResponseModel.setTaxReturns(startDate+"-"+endDate);
             if (vatReportFiling.getTotalTaxPayable().compareTo(BigDecimal.ZERO)==1){
                 vatReportResponseModel.setBalanceDue(vatReportFiling.getBalanceDue());
             }
             vatReportResponseModel.setTotalTaxPayable(vatReportFiling.getTotalTaxPayable());
             vatReportResponseModel.setTotalTaxReclaimable(vatReportFiling.getTotalTaxReclaimable());
             vatReportResponseModel.setStatus(CommonStatusEnum.getInvoiceTypeByValue(vatReportFiling.getStatus()));
             vatReportResponseModel.setAction(Boolean.TRUE);
             vatReportResponseModel.setCurrency(companyService.getCompanyCurrency().getCurrencyIsoCode());
             vatReportResponseModel.setVatNumber(vatReportFiling.getVatNumber());
            if(user !=null) {
                 vatReportResponseModel.setUserId(user.getUserId());
                 vatReportResponseModel.setCreatedBy(user.getFirstName() + " " + user.getLastName());
             }
             vatReportResponseModel.setCreatedDate(vatReportFiling.getCreatedDate());
             List<VatTaxAgency> vatTaxAgencyList=vatTaxAgencyRepository.findVatTaxAgencyByVatReportFillingId(vatReportFiling.getId());
             if(vatTaxAgencyList!=null&& !vatTaxAgencyList.isEmpty() && vatTaxAgencyList.size()!=0)
             {
                 vatReportResponseModel.setTaxAgencyId(vatTaxAgencyList.get(0).getId());
             }
             vatReportResponseModels.add(vatReportResponseModel);
         }
     }
        return vatReportResponseModels;
    }

    public List<VatReportResponseModel> getVatReportFilingList2(List<VatReportFiling> vatReportFilingList){
        String startDate = "";
        String endDate = "";
        List<VatReportResponseModel> vatReportResponseModels = new ArrayList<>();
//        List<VatReportFiling> vatReportFilingList = vatReportFilingRepository.findAll();
        if (!vatReportFilingList.isEmpty()){
            for (VatReportFiling vatReportFiling:vatReportFilingList){
                User user=userService.findByPK(vatReportFiling.getCreatedBy());
                if (vatReportFiling.getStartDate()!=null){
                    startDate =DateTimeFormatter.ofPattern(DATE_FORMAT_DD_SLASH_MM_SLASH_YYYY).format(vatReportFiling.getStartDate());
                }
                if (vatReportFiling.getEndDate()!=null){
                    endDate =DateTimeFormatter.ofPattern(DATE_FORMAT_DD_SLASH_MM_SLASH_YYYY).format(vatReportFiling.getEndDate());
                }

                if (vatReportFiling.getStatus().equals(CommonStatusEnum.UN_FILED.getValue())){
                    VatReportFilingRequestModel vatReportFilingRequestModel = new VatReportFilingRequestModel();
                    vatReportFilingRequestModel.setId(vatReportFiling.getId());
                    vatReportFilingRequestModel.setStartDate(startDate);
                    vatReportFilingRequestModel.setEndDate(endDate);
                    processVatReport(vatReportFilingRequestModel,user);
                }
                VatReportResponseModel vatReportResponseModel = new VatReportResponseModel();
                vatReportResponseModel.setId(vatReportFiling.getId());
                if (vatReportFiling.getTaxFiledOn()!=null)
                    vatReportResponseModel.setFiledOn(vatReportFiling.getTaxFiledOn().atStartOfDay());

                vatReportResponseModel.setTaxReturns(startDate+"-"+endDate);
                vatReportResponseModel.setStartDate(startDate);
                vatReportResponseModel.setEndDate(endDate);
                if (vatReportFiling.getTotalTaxPayable().compareTo(BigDecimal.ZERO)==1){
                    vatReportResponseModel.setBalanceDue(vatReportFiling.getBalanceDue());
                }
                vatReportResponseModel.setTotalTaxPayable(vatReportFiling.getTotalTaxPayable());
                vatReportResponseModel.setTotalTaxReclaimable(vatReportFiling.getTotalTaxReclaimable());
                vatReportResponseModel.setStatus(CommonStatusEnum.getInvoiceTypeByValue(vatReportFiling.getStatus()));
                vatReportResponseModel.setAction(Boolean.TRUE);
                vatReportResponseModel.setCurrency(companyService.getCompanyCurrency().getCurrencyIsoCode());
                vatReportResponseModel.setVatNumber(vatReportFiling.getVatNumber());
                if(user !=null) {
                    vatReportResponseModel.setUserId(user.getUserId());
                    vatReportResponseModel.setCreatedBy(user.getFirstName() + " " + user.getLastName());
                }
                vatReportResponseModel.setCreatedDate(vatReportFiling.getCreatedDate());
                List<VatTaxAgency> vatTaxAgencyList=vatTaxAgencyRepository.findVatTaxAgencyByVatReportFillingId(vatReportFiling.getId());
                if(vatTaxAgencyList!=null&& !vatTaxAgencyList.isEmpty() && vatTaxAgencyList.size()!=0)
                {
                    vatReportResponseModel.setTaxAgencyId(vatTaxAgencyList.get(0).getId());
                }
                vatReportResponseModels.add(vatReportResponseModel);
            }
        }
        return vatReportResponseModels;
    }
   public void deleteVatReportFiling(Integer id){
        vatReportFilingRepository.deleteById(id);
   }

    public void fileVatReport(FileTheVatReportRequestModel fileTheVatReportRequestModel,User user){
        VatTaxAgency vatTaxAgency = new VatTaxAgency();
        vatTaxAgency.setCreatedBy(user.getUserId());
        vatTaxAgency.setUserId(user);
        vatTaxAgency.setCreatedDate(LocalDateTime.now());
        vatTaxAgency.setLastUpdateDate(LocalDateTime.now());
        vatTaxAgency.setLastUpdateBy(user.getUserId());
        vatTaxAgency.setTaxablePersonNameInEnglish(fileTheVatReportRequestModel.getTaxablePersonNameInEnglish());
        vatTaxAgency.setTaxablePersonNameInArabic(fileTheVatReportRequestModel.getTaxablePersonNameInArabic());
        vatTaxAgency.setTaxAgencyName(fileTheVatReportRequestModel.getTaxAgencyName());
        vatTaxAgency.setTaxAgentName(fileTheVatReportRequestModel.getTaxAgentName());
        vatTaxAgency.setTaxAgencyNumber(fileTheVatReportRequestModel.getTaxAgencyNumber());
        vatTaxAgency.setTaxAgentApprovalNumber(fileTheVatReportRequestModel.getTaxAgentApprovalNumber());
        Optional<VatReportFiling> optional =  vatReportFilingRepository.findById(fileTheVatReportRequestModel.getVatReportFiling());
        VatReportFiling vatReportFiling=optional.get();
        Instant instant = Instant.ofEpochMilli(fileTheVatReportRequestModel.getTaxFiledOn().getTime());
        LocalDateTime taxFiledOn = LocalDateTime.ofInstant(instant,
                ZoneId.systemDefault());
        vatReportFiling.setTaxFiledOn(taxFiledOn.toLocalDate());
        postFiledVat(vatReportFiling, user.getUserId(),fileTheVatReportRequestModel.getTaxFiledOn());
        vatReportFiling.setStatus(CommonStatusEnum.FILED.getValue());

        vatReportFiling.setTaxFiledOn(taxFiledOn.toLocalDate());
        vatReportFilingRepository.save(vatReportFiling);
        vatTaxAgency.setVatReportFiling(vatReportFiling);
        vatTaxAgency.setTaxFiledOn(taxFiledOn.toLocalDate());
        vatTaxAgency.setVatRegistrationNumber(fileTheVatReportRequestModel.getVatRegistrationNumber());
        vatTaxAgencyRepository.save(vatTaxAgency);
    }

    public void postFiledVat(VatReportFiling vatReportFiling,Integer userId,Date filedDate){
        String startDate = dateFormatUtil.getLocalDateTimeAsString(vatReportFiling.getStartDate().atStartOfDay(),DATE_FORMAT_DD_SLASH_MM_SLASH_YYYY);
        String endDate = dateFormatUtil.getLocalDateTimeAsString(vatReportFiling.getEndDate().atStartOfDay(),DATE_FORMAT_DD_SLASH_MM_SLASH_YYYY);

        VatReportFilingRequestModel vatReportFilingRequestModel=new VatReportFilingRequestModel();
        vatReportFilingRequestModel.setEndDate(endDate);
        vatReportFilingRequestModel.setStartDate(startDate);

        BigDecimal totalInputVatAmount =  journalLineItemService.totalInputVatAmount(vatReportFiling,vatReportFilingRequestModel,88);
        BigDecimal totalOutputVatAmount = journalLineItemService.totalOutputVatAmount(vatReportFiling,vatReportFilingRequestModel,94);

        List<Object> inputlistOfIds= journalLineItemService.getIdsAndTypeInTotalInputVat(vatReportFiling,vatReportFilingRequestModel,88);
        List<Object> outputlistOfIds= journalLineItemService.getIdsAndTypeInTotalOutputVat(vatReportFiling,vatReportFilingRequestModel,94);

        enableDisableEditForIds(inputlistOfIds,false);
        enableDisableEditForIds(outputlistOfIds,false);
        Journal journal = new Journal();
        List<JournalLineItem> journalLineItemList = new ArrayList<>();

        if (totalInputVatAmount!=null){
            JournalLineItem journalLineItem = new JournalLineItem();
            TransactionCategory inputVatCategory = transactionCategoryService
                    .findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.INPUT_VAT.getCode());

            journalLineItem.setTransactionCategory(inputVatCategory);
            if (totalInputVatAmount.compareTo(BigDecimal.ZERO)==1){
                journalLineItem.setCreditAmount(totalInputVatAmount);
            }
            else {
                journalLineItem.setDebitAmount(totalInputVatAmount);
            }
            journalLineItem.setReferenceType(PostingReferenceTypeEnum.VAT_REPORT_FILED);
            journalLineItem.setReferenceId(vatReportFiling.getId());
            journalLineItem.setExchangeRate(BigDecimal.ONE);
            journalLineItem.setCreatedBy(userId);
            journalLineItem.setJournal(journal);
            journalLineItemList.add(journalLineItem);
        }
        if (totalOutputVatAmount!=null){
            JournalLineItem journalLineItem1 = new JournalLineItem();
            TransactionCategory inputVatCategory = transactionCategoryService
                    .findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.OUTPUT_VAT.getCode());
            journalLineItem1.setTransactionCategory(inputVatCategory);
            if (totalOutputVatAmount.compareTo(BigDecimal.ZERO)==1){
                journalLineItem1.setDebitAmount(totalOutputVatAmount);
            }
            else {
                journalLineItem1.setCreditAmount(totalOutputVatAmount);
            }
            journalLineItem1.setReferenceType(PostingReferenceTypeEnum.VAT_REPORT_FILED);
            journalLineItem1.setReferenceId(vatReportFiling.getId());
            journalLineItem1.setExchangeRate(BigDecimal.ONE);
            journalLineItem1.setCreatedBy(userId);
            journalLineItem1.setJournal(journal);
            journalLineItemList.add(journalLineItem1);
        }

        if(totalOutputVatAmount==null) totalOutputVatAmount=BigDecimal.ZERO;
        if(totalInputVatAmount==null) totalInputVatAmount=BigDecimal.ZERO;

        if (totalOutputVatAmount.compareTo(totalInputVatAmount)==1){
            JournalLineItem journalLineItem1 = new JournalLineItem();
            TransactionCategory inputVatCategory = transactionCategoryService
                    .findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.GCC_VAT_PAYABLE.getCode());
            journalLineItem1.setTransactionCategory(inputVatCategory);
            journalLineItem1.setCreditAmount(totalOutputVatAmount.subtract(totalInputVatAmount));
            journalLineItem1.setReferenceType(PostingReferenceTypeEnum.VAT_REPORT_FILED);
            journalLineItem1.setReferenceId(vatReportFiling.getId());
            journalLineItem1.setExchangeRate(BigDecimal.ONE);
            journalLineItem1.setCreatedBy(userId);
            journalLineItem1.setJournal(journal);
            journalLineItemList.add(journalLineItem1);
        }
        if (totalInputVatAmount.compareTo(totalOutputVatAmount)==1){
            JournalLineItem journalLineItem1 = new JournalLineItem();
            TransactionCategory inputVatCategory = transactionCategoryService
                    .findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.GCC_VAT_PAYABLE.getCode());
            journalLineItem1.setTransactionCategory(inputVatCategory);
            journalLineItem1.setDebitAmount(totalInputVatAmount.subtract(totalOutputVatAmount));
            journalLineItem1.setReferenceType(PostingReferenceTypeEnum.VAT_REPORT_FILED);
            journalLineItem1.setReferenceId(vatReportFiling.getId());
            journalLineItem1.setExchangeRate(BigDecimal.ONE);
            journalLineItem1.setCreatedBy(userId);
            journalLineItem1.setJournal(journal);
            journalLineItemList.add(journalLineItem1);
        }
        journal.setJournalLineItems(journalLineItemList);
        journal.setCreatedBy(userId);
        journal.setPostingReferenceType(PostingReferenceTypeEnum.VAT_REPORT_FILED);
        LocalDate date = dateFormatHelper.convertToLocalDateViaSqlDate(filedDate);
        journal.setJournalDate(date);
        journal.setTransactionDate(vatReportFiling.getTaxFiledOn());
        journalService.persist(journal);
    }

   public VatPayment recordVatPayment (RecordVatPaymentRequestModel recordVatPaymentRequestModel,Integer userId) throws IOException {
      VatPayment vatPayment= saveRecordToEntity( recordVatPaymentRequestModel,userId);
       BigDecimal vatReportFilingBalanceDue = vatPayment.getVatReportFiling().getBalanceDue().subtract(vatPayment.getAmount());
       VatReportFiling vatReportFiling = vatPayment.getVatReportFiling();
       if (vatReportFilingBalanceDue.compareTo(BigDecimal.ZERO)==0){
           vatReportFiling.setBalanceDue(vatReportFilingBalanceDue);
           if (vatReportFiling.getTotalTaxReclaimable().compareTo(BigDecimal.ZERO)==1){
               vatReportFiling.setStatus(CommonStatusEnum.CLAIMED.getValue());
           }
           else
           vatReportFiling.setStatus(CommonStatusEnum.PAID.getValue());
       }
      else if (vatReportFilingBalanceDue.compareTo(BigDecimal.ZERO)==1){
           vatReportFiling.setBalanceDue(vatReportFilingBalanceDue);
           vatReportFiling.setStatus(CommonStatusEnum.PARTIALLY_PAID.getValue());
       }

       vatReportFilingRepository.save(vatReportFiling);
       createCashTransactionForVatPayment(vatPayment,recordVatPaymentRequestModel,userId);
       createVatRecordPaymentHistory(vatPayment,userId);
       return vatPayment;

    }

    private void createVatRecordPaymentHistory(VatPayment vatPayment, Integer userId) {
        VatRecordPaymentHistory vatRecordPaymentHistory = new VatRecordPaymentHistory();
        vatRecordPaymentHistory.setCreatedBy(userId);
        vatRecordPaymentHistory.setCreatedDate(LocalDateTime.now());
        vatRecordPaymentHistory.setDeleteFlag(Boolean.FALSE);
        vatRecordPaymentHistory.setLastUpdateBy(userId);
        vatRecordPaymentHistory.setLastUpdateDate(LocalDateTime.now());
        vatRecordPaymentHistory.setStartDate(vatPayment.getVatReportFiling().getStartDate().atStartOfDay());
        vatRecordPaymentHistory.setEndDate(vatPayment.getVatReportFiling().getEndDate().atStartOfDay());
        vatRecordPaymentHistory.setDateOfFiling(vatPayment.getVatReportFiling().getTaxFiledOn().atStartOfDay());
        vatRecordPaymentHistory.setVatPayment(vatPayment);
        if (vatPayment.getIsVatReclaimable()==Boolean.TRUE){
            vatRecordPaymentHistory.setAmountReclaimed(vatPayment.getAmount());
            vatRecordPaymentHistory.setAmountPaid(BigDecimal.ZERO);
        }
        else {
            vatRecordPaymentHistory.setAmountPaid(vatPayment.getAmount());
            vatRecordPaymentHistory.setAmountReclaimed(BigDecimal.ZERO);
        }
        vatRecordPaymentHistoryRepository.save(vatRecordPaymentHistory);
    }

    private VatPayment saveRecordToEntity(RecordVatPaymentRequestModel recordVatPaymentRequestModel, Integer userId) throws IOException {
        VatPayment vatPayment = new VatPayment();
        // save Attachment
        if (recordVatPaymentRequestModel.getAttachmentFile() != null && !recordVatPaymentRequestModel.
                getAttachmentFile().isEmpty()) {
            String fileName = fileHelper.saveFile(recordVatPaymentRequestModel.getAttachmentFile(), FileTypeEnum.VAT_PAYMENT);
            vatPayment.setReceiptAttachmentFileName(recordVatPaymentRequestModel.getAttachmentFile().getOriginalFilename());
            vatPayment.setReceiptAttachmentPath(fileName);
        }
        if (recordVatPaymentRequestModel.getVatPaymentDate()!=null){
            vatPayment.setVatPaymentDate(dateUtils.getDateStrAsLocalDateTime(recordVatPaymentRequestModel.getVatPaymentDate(),DATE_FORMAT_DD_SLASH_MM_SLASH_YYYY));
        }
        if (recordVatPaymentRequestModel.getAmount()!=null){
            vatPayment.setAmount(recordVatPaymentRequestModel.getAmount());
        }
        if (recordVatPaymentRequestModel.getDepositeTo()!=null){
            vatPayment.setDepositToTransactionCategory(transactionCategoryService.findByPK
                    (recordVatPaymentRequestModel.getDepositeTo()));
        }
        if (recordVatPaymentRequestModel.getId()!=null){
            vatPayment.setVatReportFiling(vatReportFilingRepository.findById(recordVatPaymentRequestModel.getId()).get());
        }
        vatPayment.setCreatedBy(userId);
        vatPayment.setCreatedDate(LocalDateTime.now());
        vatPayment.setDeleteFlag(Boolean.FALSE);
        vatPayment.setIsVatReclaimable(recordVatPaymentRequestModel.getIsVatReclaimed());
        vatPaymentRepository.save(vatPayment);
        return vatPayment;
    }

    private void createCashTransactionForVatPayment(VatPayment vatPayment,RecordVatPaymentRequestModel
            recordVatPaymentRequestModel,Integer userId) {
            Map<String, Object> param = new HashMap<>();
            if (vatPayment.getDepositToTransactionCategory()!=null)
            param.put("transactionCategory", vatPayment.getDepositToTransactionCategory());
            param.put("deleteFlag", false);
            List<BankAccount> bankAccountList = bankAccountService.findByAttributes(param);
            BankAccount bankAccount =  bankAccountList!= null && bankAccountList.size() > 0
                    ? bankAccountList.get(0)
                    : null;
            Transaction transaction = new Transaction();
            transaction.setCreatedBy(vatPayment.getCreatedBy());
            transaction.setTransactionDate(vatPayment.getVatPaymentDate());
            transaction.setBankAccount(bankAccount);
            transaction.setTransactionAmount(vatPayment.getAmount());
            transaction.setTransactionExplinationStatusEnum(TransactionExplinationStatusEnum.FULL);
            transaction.setTransactionDescription("Manual Transaction Created Against ReceiptNo "+vatPayment.getVatPaymentNo());
            transaction.setTransactionDueAmount(BigDecimal.ZERO);
        TransactionExplanation transactionExplanation = new TransactionExplanation();
            if (vatPayment.getIsVatReclaimable().equals(Boolean.TRUE)){
                transaction.setCoaCategory(chartOfAccountCategoryService.findByPK(ChartOfAccountCategoryIdEnumConstant.MONEY_RECEIVED_OTHERS.getId()));
                transactionExplanation.setCoaCategory(chartOfAccountCategoryService.findByPK(ChartOfAccountCategoryIdEnumConstant.MONEY_RECEIVED_OTHERS.getId()));
                transaction.setDebitCreditFlag('C');
                BigDecimal currentBalance = bankAccount.getCurrentBalance();
                currentBalance = currentBalance.add(transaction.getTransactionAmount());
                bankAccount.setCurrentBalance(currentBalance);
            }
            else {
                transaction.setCoaCategory(chartOfAccountCategoryService.findByPK(ChartOfAccountCategoryIdEnumConstant.MONEY_SPENT_OTHERS.getId()));
                transactionExplanation.setCoaCategory(chartOfAccountCategoryService.findByPK(ChartOfAccountCategoryIdEnumConstant.MONEY_SPENT_OTHERS.getId()));
                transaction.setDebitCreditFlag('D');
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
        //transactionExplanation.setExplanationContact(receipt.getContact().getContactId());
        transactionExplanation.setExplainedTransactionCategory(transaction.getExplainedTransactionCategory());
        transactionExplanation.setExchangeGainOrLossAmount(BigDecimal.ZERO);
        transactionExplanationRepository.save(transactionExplanation);
        bankAccountService.update(bankAccount);
            vatPayment.setTransaction(transaction);
            vatPaymentRepository.save(vatPayment);
        // Post journal
        Journal journal =  vatPaymentPosting(
                new PostingRequestModel(vatPayment.getId(), vatPayment.getAmount()), userId,
                vatPayment.getDepositToTransactionCategory(),recordVatPaymentRequestModel.getVatPaymentDate());
        journalService.persist(journal);
    }

    private Journal vatPaymentPosting(PostingRequestModel postingRequestModel, Integer userId, TransactionCategory depositeToTransactionCategory,Date paymentDate) {
        List<JournalLineItem> journalLineItemList = new ArrayList<>();
        Journal journal = new Journal();
        JournalLineItem journalLineItem1 = new JournalLineItem();
        JournalLineItem journalLineItem2 = new JournalLineItem();
        journalLineItem1.setReferenceId(postingRequestModel.getPostingRefId());
        VatPayment vatPayment=vatPaymentRepository.findById(postingRequestModel.getPostingRefId()).get();
        TransactionCategory transactionCategory = transactionCategoryService.
                findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.GCC_VAT_PAYABLE.getCode());
        journalLineItem1.setTransactionCategory(transactionCategory);
        if (vatPayment.getIsVatReclaimable().equals(Boolean.FALSE)){
            journalLineItem1.setDebitAmount(postingRequestModel.getAmount());
            journalLineItem2.setCreditAmount(postingRequestModel.getAmount());
            journalLineItem1.setReferenceType(PostingReferenceTypeEnum.VAT_PAYMENT);
        }
       else {
            journalLineItem1.setCreditAmount(postingRequestModel.getAmount());
            journalLineItem2.setDebitAmount(postingRequestModel.getAmount());
            journalLineItem1.setReferenceType(PostingReferenceTypeEnum.VAT_CLAIM);
        }
        journalLineItem1.setExchangeRate(BigDecimal.ONE);
        journalLineItem1.setCreatedBy(userId);
        journalLineItem1.setJournal(journal);
        journalLineItemList.add(journalLineItem1);

        journalLineItem2.setTransactionCategory(depositeToTransactionCategory);
        if (vatPayment.getIsVatReclaimable().equals(Boolean.FALSE)) {
            journalLineItem2.setReferenceType(PostingReferenceTypeEnum.VAT_PAYMENT);
        }
        else {
            journalLineItem2.setReferenceType(PostingReferenceTypeEnum.VAT_CLAIM);
        }
        journalLineItem2.setReferenceId(postingRequestModel.getPostingRefId());
        journalLineItem2.setExchangeRate(BigDecimal.ONE);
        journalLineItem2.setCreatedBy(userId);
        journalLineItem2.setJournal(journal);
        journalLineItemList.add(journalLineItem2);
        //Create Journal
        journal.setJournalLineItems(journalLineItemList);
        journal.setCreatedBy(userId);
        if (vatPayment.getIsVatReclaimable().equals(Boolean.FALSE)) {
            journal.setPostingReferenceType(PostingReferenceTypeEnum.VAT_PAYMENT);
        }
        else {
            journal.setPostingReferenceType(PostingReferenceTypeEnum.VAT_CLAIM);
        }
        LocalDate date = dateFormatHelper.convertToLocalDateViaSqlDate(paymentDate);
        journal.setJournalDate(date);
        journal.setTransactionDate(vatPayment.getVatPaymentDate().toLocalDate());
        return journal;
    }

   public Journal undoFiledVatReport(PostingRequestModel postingRequestModel, Integer userId){
       //Create Reverse Journal Entries For Filed Vat
       Journal newjournal = null;
       List<JournalLineItem> filedVatJliList = journalLineItemRepository.findAllByReferenceIdAndReferenceType
               (postingRequestModel.getPostingRefId(), PostingReferenceTypeEnum.VAT_REPORT_FILED);
       if (filedVatJliList != null && !filedVatJliList.isEmpty()) {
           Collection<Journal> journalList = filedVatJliList.stream()
                   .distinct()
                   .map(JournalLineItem::getJournal)
                   .collect(Collectors.toList());

           Set<Journal> set = new LinkedHashSet<Journal>(journalList);
           journalList.clear();
           journalList.addAll(set);

           for (Journal journal : journalList) {

               newjournal = new Journal();

               newjournal.setCreatedBy(filedVatJliList.get(0).getJournal().getCreatedBy());
               newjournal.setPostingReferenceType(PostingReferenceTypeEnum.VAT_REPORT_UNFILED);
               newjournal.setDescription("Reverse Published Vat");
               //newjournal.setJournlReferencenNo();
               newjournal.setJournalDate(LocalDate.now());
               newjournal.setTransactionDate(LocalDateTime.now().toLocalDate());

               Collection<JournalLineItem> journalLineItems = journal.getJournalLineItems();
               Collection<JournalLineItem> newReverseJournalLineItemList = new ArrayList<>();

               for (JournalLineItem journalLineItem : journalLineItems) {

                   JournalLineItem newReverseJournalLineItemEntry = new JournalLineItem();

                   newReverseJournalLineItemEntry.setTransactionCategory(journalLineItem.getTransactionCategory());
                   newReverseJournalLineItemEntry.setReferenceType(PostingReferenceTypeEnum.VAT_REPORT_UNFILED);
                   newReverseJournalLineItemEntry.setReferenceId(journalLineItem.getReferenceId());
                   newReverseJournalLineItemEntry.setExchangeRate(journalLineItem.getExchangeRate());
                   newReverseJournalLineItemEntry.setCreatedBy(journalLineItem.getCreatedBy());
                   newReverseJournalLineItemEntry.setCreatedDate(journalLineItem.getCreatedDate());
                   newReverseJournalLineItemEntry.setDescription(journalLineItem.getDescription());
                   newReverseJournalLineItemEntry.setDeleteFlag(journalLineItem.getDeleteFlag());

                   if (journalLineItem.getCreditAmount() != null && journalLineItem.getCreditAmount() != BigDecimal.ZERO) {
                       newReverseJournalLineItemEntry.setDebitAmount(journalLineItem.getCreditAmount());
                       newReverseJournalLineItemEntry.setCreditAmount(journalLineItem.getDebitAmount());
                   } else {
                       newReverseJournalLineItemEntry.setCreditAmount(journalLineItem.getDebitAmount());
                       newReverseJournalLineItemEntry.setDebitAmount(journalLineItem.getCreditAmount());
                   }
                   newReverseJournalLineItemEntry.setJournal(newjournal);
                   newReverseJournalLineItemList.add(newReverseJournalLineItemEntry);
               }
               newjournal.setJournalLineItems(newReverseJournalLineItemList);
           }
       }
       if (postingRequestModel.getPostingRefType().equalsIgnoreCase(PostingReferenceTypeEnum.VAT_REPORT_FILED.name())){
           VatReportFiling vatReportFiling = vatReportFilingRepository.findById(postingRequestModel.getPostingRefId()).get();
           vatReportFiling.setStatus(CommonStatusEnum.UN_FILED.getValue());
           vatReportFiling.setTaxFiledOn(null);
           vatReportFilingRepository.save(vatReportFiling);

           List<VatTaxAgency> vatTaxAgencyList=vatTaxAgencyRepository.findVatTaxAgencyByVatReportFillingId(vatReportFiling.getId());
           if(vatTaxAgencyList!=null&& !vatTaxAgencyList.isEmpty() && vatTaxAgencyList.size()!=0)
           {
               vatTaxAgencyRepository.deleteById(vatTaxAgencyList.get(0).getId());
           }
           //enable edit For Invoices
           String startDate = dateFormatUtil.getLocalDateTimeAsString(vatReportFiling.getStartDate().atStartOfDay(),DATE_FORMAT_DD_SLASH_MM_SLASH_YYYY);
           String endDate = dateFormatUtil.getLocalDateTimeAsString(vatReportFiling.getEndDate().atStartOfDay(),DATE_FORMAT_DD_SLASH_MM_SLASH_YYYY);

           VatReportFilingRequestModel vatReportFilingRequestModel=new VatReportFilingRequestModel();
           vatReportFilingRequestModel.setEndDate(endDate);
           vatReportFilingRequestModel.setStartDate(startDate);
           List<Object> inputlistOfIds= journalLineItemService.getIdsAndTypeInTotalInputVat(vatReportFiling,vatReportFilingRequestModel,88);
           List<Object> outputlistOfIds= journalLineItemService.getIdsAndTypeInTotalOutputVat(vatReportFiling,vatReportFilingRequestModel,94);

           enableDisableEditForIds(inputlistOfIds,true);
           enableDisableEditForIds(outputlistOfIds,true);
       }
       return newjournal;
   }

    private void enableDisableEditForIds(List<Object> listOfIds,boolean set) {
        for(Object object : listOfIds)
           {
               Object[] objectArray = (Object[]) object;
               //Invoices
               if(objectArray[1]==PostingReferenceTypeEnum.INVOICE)
               {
                   Invoice invoice=invoiceService.findByPK((Integer) objectArray[0]);
                   invoice.setEditFlag(set);
                   invoiceService.update(invoice);
               }
               //Expenses
               if(objectArray[1]==PostingReferenceTypeEnum.EXPENSE)
               {
                   Expense expense=expenseService.findByPK((Integer) objectArray[0]);
                   if (expense.getVatClaimable().equals(Boolean.TRUE)){
                       expense.setEditFlag(set);
                       expenseService.update(expense);
                   }
               }
           }
    }

   /*
   This method will revert the payment as well as journal entries back
    */

//            //if (vatReportFiling.getBalanceDue().compareTo()){}

    @Override
    public List<VatPaymentHistoryModel> getVatPaymentRecordList() {
        String startDate =null;
        String endDate =null;
        List<VatPaymentHistoryModel> vatPaymentHistoryResponseModelList=new ArrayList<>();
        List<VatRecordPaymentHistory> vatRecordPaymentHistoryList=vatRecordPaymentHistoryRepository.findAll();
        List<VatRecordPaymentHistory> list= vatRecordPaymentHistoryList.stream().filter(vatRecordPaymentHistory -> vatRecordPaymentHistory.getDeleteFlag().equals(Boolean.FALSE)).collect(Collectors.toList());
        if(vatRecordPaymentHistoryList !=null && vatRecordPaymentHistoryList.size()!=0)
            for (VatRecordPaymentHistory vatRecordPaymentHistory:
                    list ) {
                VatPaymentHistoryModel vatPaymentHistoryModel=new VatPaymentHistoryModel();
                if (vatRecordPaymentHistory.getDateOfFiling()!=null){
                    vatPaymentHistoryModel.setDateOfFiling(vatRecordPaymentHistory.getDateOfFiling());
                }
                if (vatRecordPaymentHistory.getAmountPaid()!=null){
                    vatPaymentHistoryModel.setAmountPaid(vatRecordPaymentHistory.getAmountPaid());
                }
               if (vatRecordPaymentHistory.getAmountReclaimed()!=null){
                   vatPaymentHistoryModel.setAmountReclaimed(vatRecordPaymentHistory.getAmountReclaimed());
               }
               if (vatRecordPaymentHistory.getStartDate()!=null){
                    startDate =DateTimeFormatter.ofPattern(DATE_FORMAT_DD_SLASH_MM_SLASH_YYYY).format(vatRecordPaymentHistory.getStartDate());
               }
               if (vatRecordPaymentHistory.getEndDate()!=null){
                    endDate =DateTimeFormatter.ofPattern(DATE_FORMAT_DD_SLASH_MM_SLASH_YYYY).format(vatRecordPaymentHistory.getEndDate());
               }
                vatPaymentHistoryModel.setCurrency(companyService.getCompanyCurrency().getCurrencyIsoCode());
                vatPaymentHistoryModel.setTaxReturns(startDate +" "+endDate);
                vatPaymentHistoryResponseModelList.add(vatPaymentHistoryModel);
            }
        return vatPaymentHistoryResponseModelList;
    }

    @Override
    public List<VatPaymentHistoryModel> getVatPaymentRecordList2( List<VatRecordPaymentHistory> vatRecordPaymentHistoryList){
        String startDate =null;
        String endDate =null;
        List<VatPaymentHistoryModel> vatPaymentHistoryResponseModelList=new ArrayList<>();
//        List<VatRecordPaymentHistory> vatRecordPaymentHistoryList=vatRecordPaymentHistoryRepository.findAll();
        List<VatRecordPaymentHistory> list= vatRecordPaymentHistoryList.stream().filter(vatRecordPaymentHistory -> vatRecordPaymentHistory.getDeleteFlag().equals(Boolean.FALSE)).collect(Collectors.toList());
        if(vatRecordPaymentHistoryList !=null && vatRecordPaymentHistoryList.size()!=0)
            for (VatRecordPaymentHistory vatRecordPaymentHistory:
                    list ) {
                VatPaymentHistoryModel vatPaymentHistoryModel=new VatPaymentHistoryModel();
                if (vatRecordPaymentHistory.getDateOfFiling()!=null){
                    vatPaymentHistoryModel.setDateOfFiling(vatRecordPaymentHistory.getDateOfFiling());
                }
                if (vatRecordPaymentHistory.getAmountPaid()!=null){
                    vatPaymentHistoryModel.setAmountPaid(vatRecordPaymentHistory.getAmountPaid());
                }
                if (vatRecordPaymentHistory.getAmountReclaimed()!=null){
                    vatPaymentHistoryModel.setAmountReclaimed(vatRecordPaymentHistory.getAmountReclaimed());
                }
                if (vatRecordPaymentHistory.getStartDate()!=null){
                    startDate =DateTimeFormatter.ofPattern(DATE_FORMAT_DD_SLASH_MM_SLASH_YYYY).format(vatRecordPaymentHistory.getStartDate());
                }
                if (vatRecordPaymentHistory.getEndDate()!=null){
                    endDate =DateTimeFormatter.ofPattern(DATE_FORMAT_DD_SLASH_MM_SLASH_YYYY).format(vatRecordPaymentHistory.getEndDate());
                }
                if(vatRecordPaymentHistory.getVatPayment().getVatReportFiling().getVatNumber()!=null){
                    vatPaymentHistoryModel.setVatNumber(vatRecordPaymentHistory.getVatPayment().getVatReportFiling().getVatNumber());
                }
                vatPaymentHistoryModel.setCurrency(companyService.getCompanyCurrency().getCurrencyIsoCode());
                vatPaymentHistoryModel.setTaxReturns(startDate +" "+endDate);
                vatPaymentHistoryResponseModelList.add(vatPaymentHistoryModel);
            }
        return vatPaymentHistoryResponseModelList;
    }
}
