package com.simpleaccounts.rest.creditnotecontroller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.constant.*;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.helper.DateFormatHelper;
import com.simpleaccounts.model.AppliedInvoiceCreditNote;
import com.simpleaccounts.repository.*;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.PostingRequestModel;
import com.simpleaccounts.rest.customizeinvoiceprefixsuffixccontroller.CustomizeInvoiceTemplateService;
import com.simpleaccounts.rest.invoicecontroller.InvoiceDueAmountModel;
import com.simpleaccounts.rest.invoicecontroller.InvoiceLineItemModel;
import com.simpleaccounts.rest.invoicecontroller.InvoiceListModel;
import com.simpleaccounts.rest.invoicecontroller.InvoiceRestHelper;
import com.simpleaccounts.rest.receiptcontroller.ReceiptRequestModel;
import com.simpleaccounts.security.JwtTokenUtil;

import com.simpleaccounts.service.*;
import com.simpleaccounts.service.bankaccount.TransactionService;
import com.simpleaccounts.utils.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ResourceLoader;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;
import javax.xml.bind.DatatypeConverter;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

import static com.simpleaccounts.rest.invoicecontroller.HtmlTemplateConstants.REFUND_CD_TEMPLATE;

	@Service
	@SuppressWarnings({"java:S131", "java:S115", "java:S6809"})
	public class CreditNoteRestHelper {
    private final Logger logger = LoggerFactory.getLogger(InvoiceRestHelper.class);
    @Autowired
    private InvoiceService invoiceService;

    private static final String DATE_FORMAT_DD_MM_YYYY = "dd-MM-yyyy";
    private static final String DATE_FORMAT_DD_SLASH_MM_SLASH_YYYY = "dd/MM/yyyy";
    private static final String JSON_KEY_ERROR = "Error";
    private static final String JSON_KEY_CONTACT = "contact";
    private static final String JSON_KEY_CONTACT_TYPE = "contactType";
    private static final String JSON_KEY_DELETE_FLAG = "deleteFlag";
    private static final String JSON_KEY_CREDIT_NOTE = "creditNote";
    private static final String TRANSACTION_DESCRIPTION_MANUAL_CREDIT_NOTE = "Manual Transaction Created Against CreditNote No ";
    private static final String TEMPLATE_PLACEHOLDER_PAYMODE = "{paymode}";
    private static final String TEMPLATE_PLACEHOLDER_NUMBER = "{number}";
    @Autowired
    private InvoiceLineItemService invoiceLineItemService;
    @Autowired
    private DateFormatHelper dateFormatHelper;

    @Autowired
    private CustomizeInvoiceTemplateService customizeInvoiceTemplateService;
    @Autowired
    private InvoiceRestHelper invoiceRestHelper;

    @Autowired
    InvoiceNumberUtil invoiceNumberUtil;

    @Autowired
    ContactService contactService;

    @Autowired
    private DateFormatUtil dateFormtUtil;

    @Autowired
    VatCategoryService vatCategoryService;

    @Autowired
    private ProductService productService;

    @Autowired
    private TransactionCategoryService transactionCategoryService;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private InventoryHistoryService inventoryHistoryService;

    @Autowired
    private DateUtils dateUtils;

    @Autowired
    private JournalLineItemService journalLineItemService;

    @Autowired
    private ReceiptService receiptService;

    @Autowired
    private CurrencyService currencyService;

    @Autowired
    private PlaceOfSupplyService placeOfSupplyService;

    @Autowired
    private ExciseTaxService exciseTaxService;

    @Autowired
    private CreditNoteRepository creditNoteRepository;

    @Autowired
    private CreditNoteLineItemRepository creditNoteLineItemRepository;

    @Autowired
    private BankAccountService bankAccountService;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private ChartOfAccountCategoryService chartOfAccountCategoryService;

    @Autowired
    private JournalService journalService;

    @Autowired
    private CreditNoteInvoiceRelationService creditNoteInvoiceRelationService;

    @Autowired
    private UnitTypesRepository unitTypesRepository;

    @Autowired
    private DateFormatUtil dateFormatUtil;

    @Autowired
    private JournalLineItemRepository journalLineItemRepository;

    @Autowired
    private TransactionExplanationRepository transactionExplanationRepository;

    @Autowired
    private ContactTransactionCategoryService contactTransactionCategoryService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    UserService userService;

    @Autowired
    ResourceLoader resourceLoader;

    @Autowired
    EmailSender emailSender;

    @Autowired
    EmaiLogsService emaiLogsService;
    @Autowired
    private TransactionExplinationLineItemRepository transactionExplinationLineItemRepository;

    @Autowired
    private CompanyService companyService;

    @Autowired
    private FileAttachmentService fileAttachmentService;

    public CreditNote getEntity(CreditNoteRequestModel creditNoteRequestModel, Integer userId) {
        CreditNote creditNote = null;

        if (creditNoteRequestModel.getCreditNoteId() != null) {
            creditNote = creditNoteRepository.findById(creditNoteRequestModel.getCreditNoteId()).get();
            if (creditNote.getCreditNoteLineItems() != null) {
                creditNoteLineItemRepository.deleteByCreditNote(creditNote);
            }
        }
        else {
            creditNote = new CreditNote();
        }
        creditNote.setCreatedBy(userId);
        creditNote.setCreatedDate(LocalDateTime.now());
        creditNote.setLastUpdateBy(userId);
        creditNote.setLastUpdateDate(LocalDateTime.now());
        creditNote.setDeleteFlag(Boolean.FALSE);
        creditNote.setIsCNWithoutProduct(creditNoteRequestModel.getIsCreatedWIWP());
        if (creditNoteRequestModel.getPlaceOfSupplyId() != null) {
            PlaceOfSupply placeOfSupply = placeOfSupplyService.findByPK(creditNoteRequestModel.getPlaceOfSupplyId());
            creditNote.setPlaceOfSupplyId(creditNoteRequestModel.getPlaceOfSupplyId());
        }
        if (creditNoteRequestModel.getTotalAmount() != null) {
            creditNote.setTotalAmount(creditNoteRequestModel.getTotalAmount());
            creditNote.setDueAmount(creditNoteRequestModel.getTotalAmount());
        }
        if (creditNoteRequestModel.getTotalVatAmount() != null) {
            creditNote.setTotalVatAmount(creditNoteRequestModel.getTotalVatAmount());
        }
        if (creditNoteRequestModel.getTotalExciseTaxAmount() != null) {
            creditNote.setTotalExciseAmount(creditNoteRequestModel.getTotalExciseTaxAmount());
        }
        if (creditNoteRequestModel.getCurrencyCode() != null) {
            Currency currency = currencyService.findByPK(creditNoteRequestModel.getCurrencyCode());
            creditNote.setCurrency(currency);
        }
        if (creditNoteRequestModel.getVatCategoryId()!=null){
           creditNote.setVatCategory(vatCategoryService.findByPK((creditNoteRequestModel.getVatCategoryId())));
        }
        if (creditNoteRequestModel.getTaxType()!=null){
            creditNote.setTaxType(creditNoteRequestModel.getTaxType());
        }
        creditNote.setCreditNoteNumber(creditNoteRequestModel.getCreditNoteNumber());
        if (creditNoteRequestModel.getType() != null && !creditNoteRequestModel.getType().isEmpty()) {
            Integer invoiceType = Integer.parseInt(creditNoteRequestModel.getType());
            creditNote.setType(invoiceType);
            CustomizeInvoiceTemplate template = customizeInvoiceTemplateService.getInvoiceTemplate(invoiceType);
            String suffix = invoiceNumberUtil.fetchSuffixFromString(creditNoteRequestModel.getCreditNoteNumber());
            template.setSuffix(Integer.parseInt(suffix));
            String prefix = creditNote.getCreditNoteNumber().substring(0, creditNote.getCreditNoteNumber().lastIndexOf(suffix));
            template.setPrefix(prefix);
            customizeInvoiceTemplateService.persist(template);
        }
        if (creditNoteRequestModel.getContactId() != null) {
            Contact contact = contactService.findByPK(creditNoteRequestModel.getContactId());
            creditNote.setContact(contact);
        }
        if (creditNoteRequestModel.getInvoiceId()!=null){
            creditNote.setInvoiceId(creditNoteRequestModel.getInvoiceId());
        }
        if (creditNoteRequestModel.getExchangeRate()!=null){
            creditNote.setExchangeRate(creditNoteRequestModel.getExchangeRate());
        }
        if(creditNoteRequestModel.getReferenceNo()!=null){
            creditNote.setReferenceNo(creditNoteRequestModel.getReferenceNo());
        }
        List<InvoiceLineItemModel> itemModels = new ArrayList<>();
        lineItemString(creditNoteRequestModel, userId, creditNote, itemModels);
        creditNote.setNotes(creditNoteRequestModel.getNotes());
        creditNote.setDiscount(creditNoteRequestModel.getDiscount());
        creditNote.setStatus(creditNote.getCreditNoteId() == null ? CommonStatusEnum.PENDING.getValue() : creditNote.getStatus());
        creditNote.setDiscountPercentage(creditNoteRequestModel.getDiscountPercentage());
        if (creditNoteRequestModel.getCreditNoteDate() != null) {
            creditNote.setCreditNoteDate(dateFormtUtil.convertToOffsetDateTime(creditNoteRequestModel.getCreditNoteDate()));
        }

        return creditNote;
    }

    private void lineItemString(CreditNoteRequestModel creditNoteRequestModel, Integer userId, CreditNote creditNote,
                                List<InvoiceLineItemModel> itemModels) {
        if (creditNoteRequestModel.getLineItemsString() != null && !creditNoteRequestModel.getLineItemsString().isEmpty()) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                itemModels = mapper.readValue(creditNoteRequestModel.getLineItemsString(),
                        new TypeReference<List<InvoiceLineItemModel>>() {
                        });
            } catch (IOException ex) {
                logger.error(JSON_KEY_ERROR, ex);
            }
            if (!itemModels.isEmpty()) {
                List<CreditNoteLineItem> creditNoteLineItemList = getLineItems(itemModels, creditNote, userId);
                creditNote.setCreditNoteLineItems(creditNoteLineItemList);
            }
        }
    }

    public List<CreditNoteLineItem> getLineItems(List<InvoiceLineItemModel> itemModels, CreditNote creditNote, Integer userId) {
        List<CreditNoteLineItem> lineItems = new ArrayList<>();
        for (InvoiceLineItemModel model : itemModels) {
            try {
                CreditNoteLineItem lineItem = new CreditNoteLineItem();
                lineItem.setCreatedBy(userId);
                lineItem.setCreatedDate(LocalDateTime.now());
                lineItem.setLastUpdateBy(userId);
                lineItem.setLastUpdateDate(LocalDateTime.now());
                lineItem.setDeleteFlag(false);
                lineItem.setQuantity(model.getQuantity());
                lineItem.setDescription(model.getDescription());
                lineItem.setUnitPrice(model.getUnitPrice());
                lineItem.setSubTotal(model.getSubTotal());
                if(model.getUnitType()!=null)
                    lineItem.setUnitType(model.getUnitType());
                if(model.getUnitTypeId()!=null)
                    lineItem.setUnitTypeId(unitTypesRepository.findById(model.getUnitTypeId()).get());
                if (model.getVatCategoryId() != null)
                    lineItem.setVatCategory(vatCategoryService.findByPK(Integer.parseInt(model.getVatCategoryId())));
                lineItem.setCreditNote(creditNote);
                if (model.getExciseTaxId() != null) {
                    lineItem.setExciseCategory(exciseTaxService.getExciseTax(model.getExciseTaxId()));
                }
                if (model.getDiscount()!=null){
                    lineItem.setDiscount(model.getDiscount());
                }
                if (model.getDiscountType()!=null){
                    lineItem.setDiscountType(model.getDiscountType());
                }
                if (model.getProductId() != null)
                    lineItem.setProduct(productService.findByPK(model.getProductId()));
                if (model.getTransactionCategoryId() != null)
                    lineItem.setTransactionCategory(
                            transactionCategoryService.findByPK(model.getTransactionCategoryId()));
                lineItem.setQuantity(model.getQuantity());
                lineItem.setExciseAmount(model.getExciseAmount());
                lineItem.setVatAmount(model.getVatAmount());
                lineItems.add(lineItem);
            } catch (Exception e) {
                logger.error(JSON_KEY_ERROR, e);
                return new ArrayList<>();
            }
        }
        return lineItems;
    }

    public Journal creditNotePosting(PostingRequestModel postingRequestModel, Integer userId) {
        List<JournalLineItem> journalLineItemList = new ArrayList<>();

        CreditNote creditNote = creditNoteRepository.findById(postingRequestModel.getPostingRefId()).get();
        boolean isCreditNote = InvoiceTypeConstant.isCustomerCreditNote(creditNote.getType());

        Journal journal = new Journal();
        JournalLineItem journalLineItem1 = new JournalLineItem();
        Map<String, Object> map = new HashMap<>();
        map.put(JSON_KEY_CONTACT,creditNote.getContact());
        if (isCreditNote){
            map.put(JSON_KEY_CONTACT_TYPE, 2);
        }
        else {
            map.put(JSON_KEY_CONTACT_TYPE, 1);
        }
        map.put(JSON_KEY_DELETE_FLAG,Boolean.FALSE);
        List<ContactTransactionCategoryRelation> contactTransactionCategoryRelations = contactTransactionCategoryService
                .findByAttributes(map);
        TransactionCategory transactionCategory = null;
        if (contactTransactionCategoryRelations!=null && contactTransactionCategoryRelations.size()>0){
            ContactTransactionCategoryRelation contactTransactionCategoryRelation = contactTransactionCategoryRelations.get(0);
            transactionCategory = contactTransactionCategoryRelation.getTransactionCategory();
        }

        journalLineItem1.setTransactionCategory(transactionCategory);

        BigDecimal amountWithoutDiscount = creditNote.getTotalAmount();
        if (isCreditNote){
            journalLineItem1.setReferenceType(PostingReferenceTypeEnum.CREDIT_NOTE);
            journalLineItem1.setCreditAmount(amountWithoutDiscount.multiply(creditNote.getExchangeRate()));
        }
        else{
            journalLineItem1.setDebitAmount(amountWithoutDiscount.multiply(creditNote.getExchangeRate()));
            journalLineItem1.setReferenceType(PostingReferenceTypeEnum.DEBIT_NOTE);
        }
        journalLineItem1.setReferenceId(postingRequestModel.getPostingRefId());
        journalLineItem1.setExchangeRate(creditNote.getExchangeRate());
        journalLineItem1.setCreatedBy(userId);
        journalLineItem1.setJournal(journal);
        journalLineItemList.add(journalLineItem1);

        List<CreditNoteLineItem> creditNoteLineItemList = creditNoteLineItemRepository.findAllByCreditNote(creditNote);
        Map<Integer, List<CreditNoteLineItem>> tnxCatIdCnLnItemMap = new HashMap<>();
        Map<Integer, TransactionCategory> tnxCatMap = new HashMap<>();
        creditNote(isCreditNote, creditNoteLineItemList, tnxCatIdCnLnItemMap, tnxCatMap, userId);
        Boolean isEligibleForInventoryAssetJournalEntry = false;
        BigDecimal inventoryAssetValue = BigDecimal.ZERO;
        BigDecimal sumOfInventoryAssetValuePerTransactionCategory = BigDecimal.ZERO;
        Boolean isEligibleForInventoryJournalEntry = false;
        for (Integer categoryId : tnxCatIdCnLnItemMap.keySet()) {
            List<CreditNoteLineItem> sortedItemList = tnxCatIdCnLnItemMap.get(categoryId);
            BigDecimal totalAmount = BigDecimal.ZERO;
            BigDecimal lineItemDiscount = BigDecimal.ZERO;
            BigDecimal inventoryAssetValuePerTransactionCategory = BigDecimal.ZERO;
            TransactionCategory purchaseCategory = null;
            for (CreditNoteLineItem sortedLineItem : sortedItemList) {
                BigDecimal amntWithoutVat = sortedLineItem.getUnitPrice()
                        .multiply(BigDecimal.valueOf(sortedLineItem.getQuantity()));
                if (sortedLineItem.getDiscountType().equals(DiscountType.FIXED) && sortedLineItem.getDiscount()!=null){
                    amntWithoutVat = amntWithoutVat.subtract(sortedLineItem.getDiscount());
                    totalAmount = totalAmount.add(amntWithoutVat);
                    lineItemDiscount = lineItemDiscount.add(sortedLineItem.getDiscount());
                }
                else if (sortedLineItem.getDiscountType().equals(DiscountType.PERCENTAGE) && sortedLineItem.getDiscount()!=null){

                    BigDecimal discountedAmount = amntWithoutVat.multiply(sortedLineItem.getDiscount()).divide(BigDecimal.valueOf(100));
                    amntWithoutVat = amntWithoutVat.subtract(discountedAmount);
                    totalAmount = totalAmount.add(amntWithoutVat);
                    lineItemDiscount = lineItemDiscount.add(discountedAmount);
                }
                else {
                    totalAmount = totalAmount.add(amntWithoutVat);
                }
                if	(sortedLineItem.getProduct().getIsInventoryEnabled() !=null&&sortedLineItem.getProduct().getIsInventoryEnabled()  && isCreditNote){
                    List<Inventory> inventoryList = inventoryService.getInventoryByProductId(sortedLineItem.getProduct().
                            getProductID());
                    if (sortedLineItem.getProduct().getAvgPurchaseCost()!=null) {
                        inventoryAssetValuePerTransactionCategory = inventoryAssetValuePerTransactionCategory.add(BigDecimal.
                                valueOf(sortedLineItem.getQuantity()).multiply(BigDecimal.valueOf
                                        (sortedLineItem.getProduct().getAvgPurchaseCost().floatValue())));
                    }
                    else {
                        for (Inventory inventory : inventoryList) {
                            inventoryAssetValuePerTransactionCategory = inventoryAssetValuePerTransactionCategory.add(BigDecimal.
                                    valueOf(sortedLineItem.getQuantity()).multiply(BigDecimal.valueOf
                                            (inventory.getUnitCost())));

                        }
                    }
                    purchaseCategory = sortedLineItem.getTransactionCategory() != null ? sortedLineItem.getTransactionCategory()
                            : sortedLineItem.getProduct().getLineItemList().stream()
                            .filter(p -> p.getPriceType().equals(ProductPriceType.PURCHASE)).findAny().get()
                            .getTransactioncategory();
                    isEligibleForInventoryJournalEntry = true;
                }
            }if(isCreditNote && isEligibleForInventoryJournalEntry) {
                sumOfInventoryAssetValuePerTransactionCategory = sumOfInventoryAssetValuePerTransactionCategory.add
                        (inventoryAssetValuePerTransactionCategory);
            }
            //This list contains ILI which consist of excise Tax included in product price group by Transaction Category Id
            List<CreditNoteLineItem> inclusiveExciseLineItems = sortedItemList.stream().
                    filter(creditNoteLineItem -> creditNoteLineItem.
                            getProduct().getExciseStatus()!=null && creditNoteLineItem.
                            getProduct().getExciseStatus().equals(Boolean.TRUE)).filter(creditNoteLineItem ->
                            creditNoteLineItem.getCreditNote().getTaxType()!=null && creditNoteLineItem.getCreditNote().getTaxType().equals(Boolean.TRUE)).filter
                            (creditNoteLineItem -> creditNoteLineItem.getTransactionCategory()
                                    .getTransactionCategoryId().equals(categoryId)).collect(Collectors.toList());
            if (!inclusiveExciseLineItems.isEmpty()){
                for (CreditNoteLineItem invoiceLineItem:inclusiveExciseLineItems){
                    totalAmount = totalAmount.subtract(invoiceLineItem.getExciseAmount());
                }
            }
            //To handle inclusive vat journal entry
            if (creditNote.getTaxType().equals(Boolean.TRUE)){
                List<CreditNoteLineItem> inclusiveVatLineItems = sortedItemList.stream().filter(invoiceLineItem ->
                                invoiceLineItem.getCreditNote().getTaxType()!=null && invoiceLineItem.getCreditNote().getTaxType().equals(Boolean.TRUE)).
                        filter(invoiceLineItem -> invoiceLineItem.getTransactionCategory()
                                .getTransactionCategoryId().equals(categoryId)).collect(Collectors.toList());
                if (!inclusiveVatLineItems.isEmpty()){
                    for (CreditNoteLineItem invoiceLineItem:inclusiveVatLineItems){
                        totalAmount = totalAmount.subtract(invoiceLineItem.getVatAmount());
                    }
                }
            }
            JournalLineItem journalLineItem = new JournalLineItem();
            journalLineItem.setTransactionCategory(tnxCatMap.get(categoryId));
            totalAmount = totalAmount.add(lineItemDiscount);
            if (isCreditNote){
                journalLineItem.setReferenceType(PostingReferenceTypeEnum.CREDIT_NOTE);
                journalLineItem.setDebitAmount(totalAmount.multiply(creditNote.getExchangeRate()));
            }
            else{
                journalLineItem.setCreditAmount(totalAmount.multiply(creditNote.getExchangeRate()));
                journalLineItem.setReferenceType(PostingReferenceTypeEnum.DEBIT_NOTE);
            }
            journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
            journalLineItem.setExchangeRate(creditNote.getExchangeRate());
            journalLineItem.setCreatedBy(userId);
            journalLineItem.setJournal(journal);
            journalLineItemList.add(journalLineItem);

        }
        if (isCreditNote && isEligibleForInventoryJournalEntry) {
            JournalLineItem journalLineItem = new JournalLineItem();
            journalLineItem.setTransactionCategory(transactionCategoryService
                    .findTransactionCategoryByTransactionCategoryCode(
                            TransactionCategoryCodeEnum.INVENTORY_ASSET.getCode()));
            journalLineItem.setDebitAmount(sumOfInventoryAssetValuePerTransactionCategory);
            journalLineItem.setReferenceType(PostingReferenceTypeEnum.CREDIT_NOTE);
            journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
            journalLineItem.setCreatedBy(userId);
            journalLineItem.setJournal(journal);
            journalLineItemList.add(journalLineItem);
            inventoryAssetValue = inventoryAssetValue.add(sumOfInventoryAssetValuePerTransactionCategory);
            isEligibleForInventoryAssetJournalEntry = true;
        }
        //For multiple products CostOfGoodsSold entry for journal  Should be single.
        if(isCreditNote && isEligibleForInventoryAssetJournalEntry) {
            JournalLineItem	journalLineItem = new JournalLineItem();
            journalLineItem.setTransactionCategory(transactionCategoryService
                    .findTransactionCategoryByTransactionCategoryCode(
                            TransactionCategoryCodeEnum.COST_OF_GOODS_SOLD.getCode()));
            journalLineItem.setCreditAmount(inventoryAssetValue);
            journalLineItem.setReferenceType(PostingReferenceTypeEnum.CREDIT_NOTE);
            journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
            journalLineItem.setExchangeRate(creditNote.getExchangeRate());
            journalLineItem.setCreatedBy(userId);
            journalLineItem.setJournal(journal);
            journalLineItemList.add(journalLineItem);
        }
        if((creditNote.getTotalVatAmount() != null) && (creditNote.getTotalVatAmount().compareTo(BigDecimal.ZERO) != 0))
        {
            JournalLineItem journalLineItem = new JournalLineItem();
            TransactionCategory inputVatCategory = transactionCategoryService
                    .findTransactionCategoryByTransactionCategoryCode(
                            isCreditNote ? TransactionCategoryCodeEnum.OUTPUT_VAT.getCode()
                                    : TransactionCategoryCodeEnum.INPUT_VAT.getCode());
            journalLineItem.setTransactionCategory(inputVatCategory);
            if (isCreditNote) {
                journalLineItem.setDebitAmount(creditNote.getTotalVatAmount().multiply(creditNote.getExchangeRate()));
                journalLineItem.setReferenceType(PostingReferenceTypeEnum.CREDIT_NOTE);
            }
            else{
                journalLineItem.setCreditAmount(creditNote.getTotalVatAmount().multiply(creditNote.getExchangeRate()));
                journalLineItem.setReferenceType(PostingReferenceTypeEnum.DEBIT_NOTE);
            }
            journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
            journalLineItem.setExchangeRate(creditNote.getExchangeRate());
            journalLineItem.setCreatedBy(userId);
            journalLineItem.setJournal(journal);
            journalLineItemList.add(journalLineItem);
            if(creditNote.getIsReverseChargeEnabled().equals(Boolean.TRUE)){
                JournalLineItem reverseChargeJournalLineItem = new JournalLineItem();
                 transactionCategory = transactionCategoryService
                        .findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.OUTPUT_VAT.getCode());
                reverseChargeJournalLineItem.setTransactionCategory(transactionCategory);
                reverseChargeJournalLineItem.setCreditAmount(creditNote.getTotalVatAmount().multiply(creditNote.getExchangeRate()));
                reverseChargeJournalLineItem.setReferenceType(PostingReferenceTypeEnum.DEBIT_NOTE);
                reverseChargeJournalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
                reverseChargeJournalLineItem.setExchangeRate(creditNote.getExchangeRate());
                reverseChargeJournalLineItem.setCreatedBy(userId);
                reverseChargeJournalLineItem.setJournal(journal);
                journalLineItemList.add(reverseChargeJournalLineItem);
            }

        }
        if(creditNote.getDiscount().compareTo(BigDecimal.ZERO) == 1 && creditNote.getDiscount()!=null) {
            JournalLineItem journalLineItem = new JournalLineItem();
            if (creditNote.getType()==7) {
                journalLineItem.setReferenceType(PostingReferenceTypeEnum.CREDIT_NOTE);
                journalLineItem.setCreditAmount(creditNote.getDiscount().multiply(creditNote.getExchangeRate()));
                journalLineItem.setTransactionCategory(transactionCategoryService
                        .findTransactionCategoryByTransactionCategoryCode(
                                TransactionCategoryCodeEnum.SALES_DISCOUNT.getCode()));
            }
            else {
                journalLineItem.setReferenceType(PostingReferenceTypeEnum.DEBIT_NOTE);
                journalLineItem.setDebitAmount(creditNote.getDiscount().multiply(creditNote.getExchangeRate()));
                journalLineItem.setTransactionCategory(transactionCategoryService
                        .findTransactionCategoryByTransactionCategoryCode(
                                TransactionCategoryCodeEnum.PURCHASE_DISCOUNT.getCode()));
            }

            journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
            journalLineItem.setExchangeRate(creditNote.getExchangeRate());
            journalLineItem.setCreatedBy(userId);
            journalLineItem.setJournal(journal);
            journalLineItemList.add(journalLineItem);
        }
        ////////////////////
        if((creditNote.getTotalExciseAmount() != null))
        {
            if (creditNote.getTotalExciseAmount().compareTo(BigDecimal.ZERO) > 0 ) {
                JournalLineItem journalLineItem = new JournalLineItem();
                TransactionCategory inputExciseCategory = transactionCategoryService
                        .findTransactionCategoryByTransactionCategoryCode(
                                isCreditNote ? TransactionCategoryCodeEnum.OUTPUT_EXCISE_TAX.getCode()
                                        : TransactionCategoryCodeEnum.INPUT_EXCISE_TAX.getCode());
                journalLineItem.setTransactionCategory(inputExciseCategory);
                if (isCreditNote){
                    journalLineItem.setDebitAmount(creditNote.getTotalExciseAmount().multiply(creditNote.getExchangeRate()));
                    journalLineItem.setReferenceType(PostingReferenceTypeEnum.CREDIT_NOTE);
                }
                else{
                    journalLineItem.setCreditAmount(creditNote.getTotalExciseAmount().multiply(creditNote.getExchangeRate()));
                    journalLineItem.setReferenceType(PostingReferenceTypeEnum.DEBIT_NOTE);
                }
                journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
                journalLineItem.setExchangeRate(creditNote.getExchangeRate());
                journalLineItem.setCreatedBy(userId);
                journalLineItem.setJournal(journal);
                journalLineItemList.add(journalLineItem);
            }
        }
        journal.setJournalLineItems(journalLineItemList);
        journal.setCreatedBy(userId);

        if (creditNote != null) {
            journal.setJournalDate(creditNote.getCreditNoteDate().toLocalDate());
            journal.setTransactionDate(creditNote.getCreditNoteDate().toLocalDate());
        } else {
            journal.setJournalDate(LocalDate.now());
            journal.setTransactionDate(creditNote.getCreditNoteDate().toLocalDate());
        }
        journal.setJournlReferencenNo(creditNote.getCreditNoteNumber());
        if (creditNote.getType()==7){
            journal.setDescription("Credit Note");
            journal.setPostingReferenceType(PostingReferenceTypeEnum.CREDIT_NOTE);
        }
        else {
            journal.setDescription("Debit Note");
            journal.setPostingReferenceType(PostingReferenceTypeEnum.DEBIT_NOTE);
        }
            creditNote.setStatus(CommonStatusEnum.OPEN.getValue());
        creditNoteRepository.save(creditNote);
        return journal;
    }

    private void creditNote(boolean isCustomerInvoice, List<CreditNoteLineItem> creditNoteLineItemList,
                                 Map<Integer, List<CreditNoteLineItem>> tnxCatIdCnLnItemMap, Map<Integer, TransactionCategory> tnxCatMap, Integer userId) {
        TransactionCategory category;
        for (CreditNoteLineItem lineItem : creditNoteLineItemList) {
            // sales for customer
            // purchase for vendor
            Product product = productService.findByPK(lineItem.getProduct().getProductID());
            if (product.getIsInventoryEnabled()) {
                if (lineItem.getCreditNote().getType() == 7) {
                    handleCreditNoteInventory(lineItem, product, userId);
                } else {
                    handleDebitNoteInventory(lineItem, product, lineItem.getCreditNote().getContact(), userId);
                }
            }
            if (isCustomerInvoice)
                category = lineItem.getProduct().getLineItemList().stream()
                        .filter(p -> p.getPriceType().equals(ProductPriceType.SALES)).findAny().get()
                        .getTransactioncategory();
            else if (lineItem.getProduct().getIsInventoryEnabled()) {
                category = transactionCategoryService
                        .findTransactionCategoryByTransactionCategoryCode(
                                TransactionCategoryCodeEnum.INVENTORY_ASSET.getCode());
            } else {
                category = lineItem.getTransactionCategory();
            }
            tnxCatMap.put(category.getTransactionCategoryId(), category);
            if (tnxCatIdCnLnItemMap.containsKey(category.getTransactionCategoryId())) {
                tnxCatIdCnLnItemMap.get(category.getTransactionCategoryId()).add(lineItem);
            } else {
                List<CreditNoteLineItem> dummyCreditNoteLineItemList = new ArrayList<>();
                dummyCreditNoteLineItemList.add(lineItem);
                tnxCatIdCnLnItemMap.put(category.getTransactionCategoryId(), dummyCreditNoteLineItemList);
            }
        }
    }

    private void handleCreditNoteInventory(CreditNoteLineItem model, Product product, Integer userId) {
        Map<String, Object> relationMap = new HashMap<>();
        relationMap.put(JSON_KEY_CREDIT_NOTE, model.getCreditNote());
        CreditNoteInvoiceRelation creditNoteInvoiceRelation = creditNoteInvoiceRelationService.findByAttributes(relationMap).get(0);

        Map<String,Object> inventoryHistoryFilterMap = new HashMap<>();
        inventoryHistoryFilterMap.put("invoice",creditNoteInvoiceRelation.getInvoice());
        List<InventoryHistory> inventoryHistoryList = inventoryHistoryService.findByAttributes(inventoryHistoryFilterMap);
        for(InventoryHistory inventoryHistory:inventoryHistoryList)

        {
            Inventory inventory = inventoryService.findByPK(inventoryHistory.getInventory().getInventoryID());
            if (creditNoteInvoiceRelation.getInvoice().getType() == 2) {
                if (inventory.getStockOnHand() != null) {
                    inventory.setStockOnHand(inventory.getStockOnHand() + inventoryHistory.getQuantity().intValue());
                }
                if (inventory.getQuantitySold() != null) {
                    inventory.setQuantitySold(inventory.getQuantitySold() - inventoryHistory.getQuantity().intValue());
                }
                inventoryService.update(inventory);
                inventoryHistoryService.delete(inventoryHistory);
            }
            if (creditNoteInvoiceRelation.getInvoice().getType() == 1) {
                if (inventory.getPurchaseQuantity() != null) {
                    inventory.setPurchaseQuantity(inventory.getPurchaseQuantity() -inventoryHistory.getQuantity().intValue());
                }
                inventory.setStockOnHand(inventory.getStockOnHand() - inventoryHistory.getQuantity().intValue());
                //to check multiple usage of single inventory item
                Map<String,Object> map = new HashMap<>();
                map.put("inventory",inventory);
                List<InventoryHistory> list = inventoryHistoryService.findByAttributes(map);
                if (list!=null && list.size()==1){
                    inventoryHistoryService.delete(inventoryHistory);
                    inventoryService.delete(inventory);
                }
                else {
                    inventoryHistoryService.delete(inventoryHistory);
                    inventoryService.update(inventory);
                }
            }
        }
    }

    void handleDebitNoteInventory(CreditNoteLineItem model, Product product, Contact supplier, Integer userId) {
        Map<String, Object> attribute = new HashMap<String, Object>();
        attribute.put("productId", product);
        attribute.put("supplierId", supplier);

        List<Inventory> inventoryList = inventoryService.findByAttributes(attribute);
        if (inventoryList != null && inventoryList.size() > 0) {
            for (Inventory inventory : inventoryList) {
                int stockOnHand = inventory.getStockOnHand();
                int purchaseQuantity = inventory.getPurchaseQuantity();
                inventory.setStockOnHand(model.getQuantity() + stockOnHand);
                inventory.setPurchaseQuantity(model.getQuantity() + purchaseQuantity);
                inventoryService.update(inventory);
                InventoryHistory inventoryHistory = new InventoryHistory();
                inventoryHistory.setInventory(inventory);
                inventoryHistory.setProductId(inventory.getProductId());
                inventoryHistory.setUnitCost(inventory.getUnitCost());
                inventoryHistory.setQuantity(model.getQuantity().floatValue());
                inventoryHistory.setSupplierId(inventory.getSupplierId());
                inventoryHistory.setCreatedBy(userId);
                inventoryHistory.setCreatedDate(LocalDateTime.now());
                inventoryHistory.setLastUpdateBy(inventory.getLastUpdateBy());
                inventoryHistory.setLastUpdateDate(LocalDateTime.now());
                inventoryHistory.setTransactionDate(LocalDate.now());
                inventoryHistoryService.update(inventoryHistory);
            }
        } else {
            Inventory inventory = new Inventory();
            inventory.setProductId(product);
            // Check for supplier id From contact entity
            inventory.setSupplierId(supplier);
            inventory.setPurchaseQuantity(model.getQuantity());
            inventory.setStockOnHand(model.getQuantity());
            inventory.setQuantitySold(0);
            inventory.setCreatedBy(userId);
            inventory.setCreatedDate(LocalDateTime.now());
            inventory.setLastUpdateBy(inventory.getLastUpdateBy());
            inventory.setLastUpdateDate(LocalDateTime.now());
            int reOrderLevel = model.getQuantity() / 10;
            inventory.setReorderLevel(reOrderLevel);
            inventory.setUnitCost(model.getUnitPrice().floatValue());
            inventoryService.persist(inventory);
            InventoryHistory inventoryHistory = new InventoryHistory();
            inventoryHistory.setInventory(inventory);
            inventoryHistory.setProductId(inventory.getProductId());
            inventoryHistory.setUnitCost(inventory.getUnitCost());
            inventoryHistory.setSupplierId(inventory.getSupplierId());
            inventoryHistory.setQuantity((model.getQuantity().floatValue()));
            inventoryHistory.setCreatedBy(userId);
            inventoryHistory.setCreatedDate(LocalDateTime.now());
            inventoryHistory.setLastUpdateBy(inventory.getLastUpdateBy());
            inventoryHistory.setLastUpdateDate(LocalDateTime.now());
            inventoryHistoryService.update(inventoryHistory);
        }
    }

    public CreditNoteRequestModel getRequestModel(CreditNote creditNote) {
        CreditNoteRequestModel requestModel = new CreditNoteRequestModel();
        requestModel.setCreditNoteId(creditNote.getCreditNoteId());
        if (creditNote.getPlaceOfSupplyId()!=null){
            requestModel.setPlaceOfSupplyId(creditNote.getPlaceOfSupplyId());
        }

        if (creditNote.getCreditNoteDate() != null) {
            ZoneId timeZone = ZoneId.systemDefault();
            Date date = Date.from(creditNote.getCreditNoteDate().toInstant());
            requestModel.setCreditNoteDate(date);
        }
        requestModel.setExchangeRate(creditNote.getExchangeRate());
        if (creditNote.getDueAmount()!=null){
            requestModel.setDueAmount(creditNote.getDueAmount());
        }

        requestModel.setCreditNoteNumber(creditNote.getCreditNoteNumber());
        if (creditNote.getContact() != null) {
            requestModel.setContactId(creditNote.getContact().getContactId());
            requestModel.setCurrencyCode(creditNote.getCurrency().getCurrencyCode());
        }

        requestModel.setTaxTreatment(creditNote.getContact().getTaxTreatment().getTaxTreatment());
        requestModel.setTotalAmount(creditNote.getTotalAmount());
        requestModel.setContactId(creditNote.getContact().getContactId());
        if(creditNote.getContact().getOrganization() != null && !creditNote.getContact().getOrganization().isEmpty()){
            requestModel.setContactName(creditNote.getContact().getOrganization());
        }
        else {
            requestModel.setContactName(creditNote.getContact().getFirstName() + " " + creditNote.getContact().getLastName());
        }
        requestModel.setTotalVatAmount(creditNote.getTotalVatAmount());
        requestModel.setNotes(creditNote.getNotes());
        requestModel.setIsReverseChargeEnabled(creditNote.getIsReverseChargeEnabled());
        if (creditNote.getType() != null) {
            requestModel.setType(creditNote.getType().toString());
        }
        if (creditNote.getStatus() != null) {
            requestModel.setStatus(CommonStatusEnum.getInvoiceTypeByValue(creditNote.getStatus()));
        }
        if (creditNote.getTotalExciseAmount()!=null){
            requestModel.setTotalExciseTaxAmount(creditNote.getTotalExciseAmount());
        }
        Map<String, Object> attribute = new HashMap<String, Object>();
        attribute.put(JSON_KEY_CREDIT_NOTE, creditNote);
        List<CreditNoteInvoiceRelation> creditNoteInvoiceRelationList = creditNoteInvoiceRelationService.findByAttributes(attribute);
        if (!creditNoteInvoiceRelationList.isEmpty()){
            CreditNoteInvoiceRelation creditNoteInvoiceRelation = creditNoteInvoiceRelationList.get(0);
            requestModel.setInvoiceId(creditNoteInvoiceRelation.getInvoice().getId());
        }
        List<InvoiceLineItemModel> lineItemModels = new ArrayList<>();
        creditNoteLineItems(creditNote, requestModel, lineItemModels);

        requestModel.setDiscount(creditNote.getDiscount());
        requestModel.setDiscountPercentage(creditNote.getDiscountPercentage());
        if (creditNote.getContact() != null) {
            Contact contact = creditNote.getContact();
            requestModel.setEmail(contact.getBillingEmail());
        }
        if(creditNote.getReferenceNo() != null){
            requestModel.setReferenceNo(creditNote.getReferenceNo());
        }
        if(creditNote.getInvoiceId()!=null) {
            Invoice invoice = invoiceService.findByPK(creditNote.getInvoiceId());
            if(invoice.getTaxType()!=null) {
                requestModel.setTaxType(invoice.getTaxType());
            }
            requestModel.setInvoiceNumber(invoice.getReferenceNumber());
            if(invoice.getChangeShippingAddress() != null && invoice.getChangeShippingAddress())
            {
                requestModel.setChangeShippingAddress(invoice.getChangeShippingAddress());
                requestModel.setShippingAddress(invoice.getShippingAddress());
                requestModel.setShippingCountryName(invoice.getShippingCountry().getCountryName());
                requestModel.setShippingCity(invoice.getShippingCity());
                requestModel.setShippingCountry(invoice.getShippingCountry().getCountryCode());
                requestModel.setShippingFax(invoice.getShippingFax());
                requestModel.setShippingState(invoice.getShippingState().getId());
                requestModel.setShippingStateName(invoice.getShippingState().getStateName());
                requestModel.setShippingPostZipCode(invoice.getShippingPostZipCode());
                requestModel.setShippingTelephone(invoice.getShippingTelephone());

            }else
                requestModel.setChangeShippingAddress(false);

        }
        Map<String, Object> map = new HashMap<>();
        map.put(JSON_KEY_CREDIT_NOTE,creditNote);
        creditNoteInvoiceRelationList = creditNoteInvoiceRelationService.findByAttributes(map);
        if (!creditNoteInvoiceRelationList.isEmpty()){
            BigDecimal totalCreditNoteAmount = BigDecimal.ZERO;
            for (CreditNoteInvoiceRelation creditNoteInvoiceRelation:creditNoteInvoiceRelationList){
                if (!creditNoteInvoiceRelation.getCreditNote().getCreditNoteId().equals(creditNote.getCreditNoteId())){
                    totalCreditNoteAmount = totalCreditNoteAmount.add(creditNoteInvoiceRelation.getCreditNote().getTotalAmount());
                    requestModel.setRemainingInvoiceAmount(creditNoteInvoiceRelation.getInvoice().getTotalAmount().subtract(totalCreditNoteAmount));
                }
                else {
                    requestModel.setRemainingInvoiceAmount(creditNoteInvoiceRelation.getInvoice().getTotalAmount());
                }
            }
        }
        return requestModel;
    }

    private void creditNoteLineItems(CreditNote creditNote, CreditNoteRequestModel requestModel,
                                  List<InvoiceLineItemModel> lineItemModels) {
        if (creditNote.getCreditNoteLineItems() != null && !creditNote.getCreditNoteLineItems().isEmpty()) {
            for (CreditNoteLineItem lineItem : creditNote.getCreditNoteLineItems()) {
                InvoiceLineItemModel model = getLineItemModel(lineItem);
                lineItemModels.add(model);
            }
            requestModel.setInvoiceLineItems(lineItemModels);
        }
    }

    public InvoiceLineItemModel getLineItemModel(CreditNoteLineItem lineItem) {
        InvoiceLineItemModel lineItemModel = new InvoiceLineItemModel();
        lineItemModel.setId(lineItem.getId());
        lineItemModel.setDescription(lineItem.getDescription());
        lineItemModel.setQuantity(lineItem.getQuantity());
        if(lineItem.getUnitType()!=null)
           lineItemModel.setUnitType(lineItem.getUnitType());
        if(lineItem.getUnitTypeId()!=null)
            lineItemModel.setUnitTypeId(lineItem.getUnitTypeId().getUnitTypeId());
        lineItemModel.setUnitPrice(lineItem.getUnitPrice());
        lineItemModel.setSubTotal(lineItem.getSubTotal());
        lineItemModel.setExciseAmount(lineItem.getExciseAmount());
        lineItemModel.setVatAmount(lineItem.getVatAmount());
        if (lineItem.getVatCategory() != null && lineItem.getVatCategory().getId() != null) {
            lineItemModel.setVatCategoryId(lineItem.getVatCategory().getId().toString());
            lineItemModel.setVatPercentage(lineItem.getVatCategory().getVat().intValue());
        }
        if (lineItem.getExciseCategory() != null) {
            lineItemModel.setExciseTaxId(lineItem.getExciseCategory().getId());
        }
        if (lineItem.getProduct() != null) {
            lineItemModel.setProductId(lineItem.getProduct().getProductID());
            lineItemModel.setProductName(lineItem.getProduct().getProductName());
        }
        if (lineItem.getDiscount()!=null){
            lineItemModel.setDiscount(lineItem.getDiscount());
        }
        if (lineItem.getDiscountType()!=null){
            lineItemModel.setDiscountType(lineItem.getDiscountType());
        }
        if (lineItem.getTransactionCategory() != null) {
            lineItemModel.setTransactionCategoryId(lineItem.getTransactionCategory().getTransactionCategoryId());
            lineItemModel.setTransactionCategoryLabel(
                    lineItem.getTransactionCategory().getChartOfAccount().getChartOfAccountName());
        }
        if (lineItem.getProduct() != null)
            lineItemModel.setIsExciseTaxExclusive(lineItem.getProduct().getExciseType());
        return lineItemModel;
    }
    private Pageable getTCNPageableRequest(int pageNo, int pageSize, String sortOrder, String sortingCol) {
        if(sortingCol !=null && !sortingCol.isEmpty()){
            if(sortingCol.equalsIgnoreCase("invoiceNumber"))
            {
                sortingCol = "creditNoteNumber";
            }
            if(sortingCol.equalsIgnoreCase("invoiceDate"))
            {
                sortingCol = "creditNoteDate";
            }
            if(sortingCol.equalsIgnoreCase("customerName"))
            {
                sortingCol = JSON_KEY_CONTACT;
            }
            if(sortOrder!=null && sortOrder.contains("desc")) {
                return PageRequest.of(pageNo, pageSize, Sort.by(sortingCol).descending());
            }
            else {
                return PageRequest.of(pageNo, pageSize, Sort.by(sortingCol).ascending());
            }
        }
        return PageRequest.of(pageNo, pageSize,Sort.by("createdDate").descending());
    }

    public List<CreditNoteListModel> getListModel(PaginationResponseModel responseModel, Integer contact,BigDecimal amount,
                                                  int pageNo, int pageSize, boolean paginationDisable,
                                                  String sortOrder, String sortingCol,Integer userId,Integer type) {
        Pageable paging = getCreditNotePageableRequest(pageNo, pageSize, sortOrder, sortingCol);
        List<CreditNoteListModel> creditNoteListModels = new ArrayList<>();
        List<CreditNote> creditNoteList = new ArrayList<>();
        Pageable pageable =  getTCNPageableRequest(pageNo, pageSize, sortOrder,sortingCol);
        if(contact!=null){
            creditNoteList = getCreditNoteListForCustomer(contact,paging,responseModel,type);
        }
       else if(amount!=null){
            creditNoteList = getCreditNoteListByAmount(amount,paging,responseModel,type);
        }
        else {
            Page<CreditNote> creditNotePage = creditNoteRepository.findByDeleteFlagAndType(false,type, pageable);
            creditNoteList = creditNotePage.getContent();
            responseModel.setCount((int) creditNotePage.getTotalElements());
        }
            for (CreditNote creditNote : creditNoteList) {
                CreditNoteListModel  model = new CreditNoteListModel();
                model.setIsCNWithoutProduct(creditNote.getIsCNWithoutProduct());
                model.setId(creditNote.getCreditNoteId());
                if(creditNote.getContact()!=null){
                    model.setContactId(creditNote.getContact().getContactId());
                }
                model.setStatus(model.getStatus());
                model.setStatus(CommonStatusEnum.getInvoiceTypeByValue(creditNote.getStatus()));
                model.setStatusEnum(CommonStatusEnum.getInvoiceTypeByValue(creditNote.getStatus()));
                model.setCurrencyName(creditNote.getCurrency().getCurrencyIsoCode());
                Date date = Date.from(creditNote.getCreditNoteDate().toInstant());
                model.setCreditNoteDate(date);
                model.setCurrencyName(creditNote.getCurrency().getCurrencyIsoCode());
                model.setCurrencySymbol(creditNote.getCurrency().getCurrencySymbol());
                model.setCreditNoteNumber(creditNote.getCreditNoteNumber());
                if(creditNote.getContact().getOrganization() != null && !creditNote.getContact().getOrganization().isEmpty()){
                    model.setCustomerName(creditNote.getContact().getOrganization());
                }
                else {
                    model.setCustomerName(creditNote.getContact().getFirstName() + " " + creditNote.getContact().getLastName());
                }
                model.setTotalAmount(creditNote.getTotalAmount());
                if (creditNote.getTotalVatAmount() != null) {
                    model.setTotalVatAmount(creditNote.getTotalVatAmount());
                } else {
                    model.setTotalVatAmount(BigDecimal.ZERO);
                }
                if (creditNote.getInvoiceId()!=null){
                    Invoice invoice = invoiceService.findByPK(creditNote.getInvoiceId());
                    model.setInvNumber(invoice.getReferenceNumber());
                }

                model.setDueAmount(creditNote.getDueAmount());
                creditNoteListModels.add(model);
            }
        responseModel.setData(creditNoteListModels);
        return creditNoteListModels;
    }

    private void contact(Invoice invoice, InvoiceListModel model) {
        if (invoice.getContact() != null) {
            if (invoice.getContact().getFirstName() != null || invoice.getContact().getLastName() != null) {
                model.setName(invoice.getContact().getFirstName() + " " + invoice.getContact().getLastName());
            }
        }
    }

    private List<CreditNote> getCreditNoteListForCustomer(Integer contact, Pageable paging,
                                                        PaginationResponseModel responseModel,Integer type ) {
        List<CreditNote> creditNoteList = new ArrayList<>();
        Page<CreditNote> page = creditNoteRepository.findAllByContact(contact,type,paging);
        creditNoteList = page.getContent();
        responseModel.setCount((int)page.getTotalElements());
        return creditNoteList;
    }
    private List<CreditNote> getCreditNoteListByAmount(BigDecimal amount, Pageable paging,
                                                          PaginationResponseModel responseModel,Integer type ) {
        List<CreditNote> creditNoteList = new ArrayList<>();
        Page<CreditNote> page = creditNoteRepository.findAllByTotalAmount(amount,type,paging);
        creditNoteList = page.getContent();
        responseModel.setCount((int)page.getTotalElements());
        return creditNoteList;
    }
    private Pageable getCreditNotePageableRequest(int pageNo, int pageSize, String sortOrder, String sortingCol) {
        return PageRequest.of(pageNo, pageSize,Sort.by("created_date").descending());
    }

    private String getInvoceStatusLabel(Date dueDate) {
        String status = "";
        Date today = new Date();
        int dueDays = dateUtils.diff(today, dueDate);
        int dueDay = Math.abs(dueDays);
        if (dueDays > 0) {
            status = ("Over Due by " + dueDay + " Days");
        } else if (dueDays < 0) {
            status = (" Due in " + dueDay + " Days");
        } else if (dueDays == 0) {
            status = ("Due Today");
        }
        return status;
    }

    public String getInvoiceStatus(Integer status, LocalDateTime dueDate) {
        String statusLabel = "";
        if (status > 2 && status < 5) {
            statusLabel = getInvoceStatusLabel(dateUtils.get(dueDate));
        } else {
            statusLabel = CommonStatusEnum.getInvoiceTypeByValue(status);
        }
        return statusLabel;
    }

    public Receipt getEntityForRefund(ReceiptRequestModel receiptRequestModel) {
        Receipt receipt = new Receipt();
        if (receiptRequestModel.getReceiptId() != null) {
            receipt = receiptService.findByPK(receiptRequestModel.getReceiptId());
        }
        if (receiptRequestModel.getContactId() != null) {
            receipt.setContact(contactService.findByPK(receiptRequestModel.getContactId()));
        }
        //To store Invoice In reciept
        if (receiptRequestModel.getPaidInvoiceListStr() != null && !receiptRequestModel.getPaidInvoiceListStr().isEmpty()) {

            ObjectMapper mapper = new ObjectMapper();
            try {
                List<InvoiceDueAmountModel> itemModels = mapper.readValue(receiptRequestModel.getPaidInvoiceListStr(),
                        new TypeReference<List<InvoiceDueAmountModel>>() {
                        });
                receiptRequestModel.setPaidInvoiceList(itemModels);

            } catch (IOException ex) {
                logger.error(JSON_KEY_ERROR, ex);
            }
            for (InvoiceDueAmountModel invoiceDueAmountModel : receiptRequestModel.getPaidInvoiceList()) {
                Invoice invoice = invoiceService.findByPK(invoiceDueAmountModel.getId());
                if (invoice != null) {
                    receipt.setInvoice(invoice);
                }
            }
        }
        receipt.setAmount(receiptRequestModel.getAmount());
        receipt.setNotes(receiptRequestModel.getNotes());
        receipt.setReceiptNo(receiptRequestModel.getReceiptNo());
        receipt.setReferenceCode(receiptRequestModel.getReferenceCode());
        if (receiptRequestModel.getReceiptDate() != null) {
            LocalDateTime date = Instant.ofEpochMilli(receiptRequestModel.getReceiptDate().getTime())
                    .atZone(ZoneId.systemDefault()).withHour(0).withMinute(0).withSecond(0).withNano(0)
                    .toLocalDateTime();
            receipt.setReceiptDate(date);
        }
        receipt.setPayMode(receiptRequestModel.getPayMode());
        receipt.setDepositeToTransactionCategory(
                transactionCategoryService.findByPK(receiptRequestModel.getDepositeTo()));
        return receipt;
    }

    public Journal refundPosting(PostingRequestModel postingRequestModel, Integer userId,
                                 TransactionCategory depositToTransactionCategory, Boolean isCNWithoutProduct, Integer contactId,Date paymentDate) {
        List<JournalLineItem> journalLineItemList = new ArrayList<>();
        CreditNote creditNote = null;
        creditNote = creditNoteRepository.findById(postingRequestModel.getPostingRefId()).get();
        boolean isCreditNote = InvoiceTypeConstant.isCustomerCreditNote(creditNote.getType());

        Journal journal = new Journal();
        JournalLineItem journalLineItem1 = new JournalLineItem();
        journalLineItem1.setReferenceId(postingRequestModel.getPostingRefId());
        Map<String, Object> customerMap = new HashMap<>();
            customerMap.put(JSON_KEY_CONTACT,  creditNote.getContact().getContactId());
        if (isCreditNote){
            customerMap.put(JSON_KEY_CONTACT_TYPE, 2);
        }
        else {
            customerMap.put(JSON_KEY_CONTACT_TYPE, 1);
        }
        customerMap.put(JSON_KEY_DELETE_FLAG,Boolean.FALSE);
        List<ContactTransactionCategoryRelation> contactTransactionCategoryRelations = contactTransactionCategoryService
                .findByAttributes(customerMap);
        TransactionCategory transactionCategory = null;
        if (contactTransactionCategoryRelations!=null && contactTransactionCategoryRelations.size()>0){
            ContactTransactionCategoryRelation contactTransactionCategoryRelation = contactTransactionCategoryRelations.get(0);
            transactionCategory = contactTransactionCategoryRelation.getTransactionCategory();
        }
        journalLineItem1.setTransactionCategory(transactionCategory);
        if (isCreditNote){
            journalLineItem1.setDebitAmount(postingRequestModel.getAmount());
        }
        else{
            journalLineItem1.setCreditAmount(postingRequestModel.getAmount());
        }
        journalLineItem1.setReferenceType(PostingReferenceTypeEnum.REFUND);
        journalLineItem1.setCreatedBy(userId);
        journalLineItem1.setJournal(journal);
        journalLineItemList.add(journalLineItem1);

        JournalLineItem journalLineItem2 = new JournalLineItem();
        journalLineItem2.setTransactionCategory(depositToTransactionCategory);
        if (isCreditNote)
            journalLineItem2.setCreditAmount(postingRequestModel.getAmount());
        else
            journalLineItem2.setDebitAmount(postingRequestModel.getAmount());
        journalLineItem2.setReferenceType(PostingReferenceTypeEnum.REFUND);
        journalLineItem2.setReferenceId(postingRequestModel.getPostingRefId());
        journalLineItem2.setCreatedBy(userId);
        journalLineItem2.setJournal(journal);
        journalLineItemList.add(journalLineItem2);
        journal.setJournalLineItems(journalLineItemList);
        journal.setCreatedBy(userId);
        journal.setPostingReferenceType(PostingReferenceTypeEnum.REFUND);
        LocalDate date = dateFormatHelper.convertToLocalDateViaSqlDate(paymentDate);
        journal.setJournalDate(date);
        journal.setTransactionDate(creditNote.getCreditNoteDate().toLocalDate());
        journal.setDescription("Refund Against Credit Note:-"+creditNote.getCreditNoteNumber());
        return journal;
    }

    public Journal creditNotePostingForInvoice(PostingRequestModel postingRequestModel, Integer userId) {
        List<JournalLineItem> journalLineItemList = new ArrayList<>();

        Invoice creditNote = invoiceService.findByPK(postingRequestModel.getPostingRefId());
        boolean isCustomerCreditNote = InvoiceTypeConstant.isCustomerCreditNote(creditNote.getType());
        Journal journal = new Journal();
        JournalLineItem journalLineItem1 = new JournalLineItem();
        Map<String, Object> customerMap = new HashMap<>();
            customerMap.put(JSON_KEY_CONTACT,  creditNote.getContact().getContactId());
        customerMap.put(JSON_KEY_CONTACT_TYPE, 2);
        customerMap.put(JSON_KEY_DELETE_FLAG,Boolean.FALSE);
        List<ContactTransactionCategoryRelation> contactTransactionCategoryRelations = contactTransactionCategoryService
                .findByAttributes(customerMap);
        TransactionCategory transactionCategory = null;
        if (contactTransactionCategoryRelations!=null && contactTransactionCategoryRelations.size()>0){
            ContactTransactionCategoryRelation contactTransactionCategoryRelation = contactTransactionCategoryRelations.get(0);
            transactionCategory = contactTransactionCategoryRelation.getTransactionCategory();
        }
        journalLineItem1.setTransactionCategory(transactionCategory);
        if (isCustomerCreditNote)
            journalLineItem1.setCreditAmount(creditNote.getTotalAmount());
        else
            journalLineItem1.setDebitAmount(creditNote.getTotalAmount());
        journalLineItem1.setReferenceType(PostingReferenceTypeEnum.CREDIT_NOTE);
        journalLineItem1.setReferenceId(postingRequestModel.getPostingRefId());
        journalLineItem1.setCreatedBy(userId);
        journalLineItem1.setJournal(journal);
        journalLineItemList.add(journalLineItem1);
        Map<String, Object> param = new HashMap<>();
        param.put("invoice", creditNote);
        param.put("deleteFlag", false);
        List<InvoiceLineItem> invoiceLineItemList = invoiceLineItemService.findByAttributes(param);
        Map<Integer, List<InvoiceLineItem>> tnxcatIdInvLnItemMap = new HashMap<>();
        Map<Integer, TransactionCategory> tnxcatMap = new HashMap<>();
       // customerInvoice(isCustomerCreditNote, invoiceLineItemList, tnxcatIdInvLnItemMap, tnxcatMap, userId);
        Boolean isEligibleForInventoryAssetJournalEntry = false;
        BigDecimal inventoryAssetValue = BigDecimal.ZERO;
        for (Integer categoryId : tnxcatIdInvLnItemMap.keySet()) {
            List<InvoiceLineItem> sortedItemList = tnxcatIdInvLnItemMap.get(categoryId);
            BigDecimal totalAmount = BigDecimal.ZERO;
            BigDecimal inventoryAssetValuePerTransactionCategory = BigDecimal.ZERO;
            TransactionCategory purchaseCategory = null;
            Boolean isEligibleForInventoryJournalEntry = false;
            for (InvoiceLineItem sortedLineItem : sortedItemList) {
                BigDecimal amntWithoutVat = sortedLineItem.getUnitPrice()
                        .multiply(BigDecimal.valueOf(sortedLineItem.getQuantity()));
                totalAmount = totalAmount.add(amntWithoutVat);
                if (sortedLineItem.getProduct().getIsInventoryEnabled() && isCustomerCreditNote) {
                    List<Inventory> inventoryList = inventoryService.getInventoryByProductId(sortedLineItem.getProduct().getProductID());
                    for (Inventory inventory : inventoryList) {
                        inventoryAssetValuePerTransactionCategory = inventoryAssetValuePerTransactionCategory.add(BigDecimal.valueOf(sortedLineItem.getQuantity()).multiply(BigDecimal.valueOf
                                (inventory.getUnitCost())));
                    }
                    purchaseCategory = sortedLineItem.getTrnsactioncCategory() != null ? sortedLineItem.getTrnsactioncCategory()
                            : sortedLineItem.getProduct().getLineItemList().stream()
                            .filter(p -> p.getPriceType().equals(ProductPriceType.PURCHASE)).findAny().get()
                            .getTransactioncategory();
                    isEligibleForInventoryJournalEntry = true;
                }
            }
            if (isCustomerCreditNote && isEligibleForInventoryJournalEntry) {
                JournalLineItem journalLineItem = new JournalLineItem();
                journalLineItem.setTransactionCategory(transactionCategoryService
                        .findTransactionCategoryByTransactionCategoryCode(
                                TransactionCategoryCodeEnum.INVENTORY_ASSET.getCode()));
                journalLineItem.setDebitAmount(inventoryAssetValuePerTransactionCategory);
                journalLineItem.setReferenceType(PostingReferenceTypeEnum.CREDIT_NOTE);
                journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
                journalLineItem.setCreatedBy(userId);
                journalLineItem.setJournal(journal);
                journalLineItemList.add(journalLineItem);
                inventoryAssetValue = inventoryAssetValue.add(inventoryAssetValuePerTransactionCategory);
                isEligibleForInventoryAssetJournalEntry = true;
            }
            if (creditNote.getDiscount() != null) {
                totalAmount = totalAmount.subtract(creditNote.getDiscount());
            }
            JournalLineItem journalLineItem = new JournalLineItem();
            journalLineItem.setTransactionCategory(tnxcatMap.get(categoryId));
            if (isCustomerCreditNote)
                journalLineItem.setDebitAmount(totalAmount);
            else
                journalLineItem.setCreditAmount(totalAmount);
            journalLineItem.setReferenceType(PostingReferenceTypeEnum.CREDIT_NOTE);
            journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
            journalLineItem.setCreatedBy(userId);
            journalLineItem.setJournal(journal);
            journalLineItemList.add(journalLineItem);
        }
        if (isCustomerCreditNote && isEligibleForInventoryAssetJournalEntry) {
            JournalLineItem journalLineItem = new JournalLineItem();
            journalLineItem.setTransactionCategory(transactionCategoryService
                    .findTransactionCategoryByTransactionCategoryCode(
                            TransactionCategoryCodeEnum.COST_OF_GOODS_SOLD.getCode()));
            journalLineItem.setCreditAmount(inventoryAssetValue);
            journalLineItem.setReferenceType(PostingReferenceTypeEnum.CREDIT_NOTE);
            journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
            journalLineItem.setCreatedBy(userId);
            journalLineItem.setJournal(journal);
            journalLineItemList.add(journalLineItem);
        }
        if (creditNote.getTotalVatAmount().compareTo(BigDecimal.ZERO) > 0) {
            JournalLineItem journalLineItem = new JournalLineItem();
            TransactionCategory inputVatCategory = transactionCategoryService
                    .findTransactionCategoryByTransactionCategoryCode(
                            isCustomerCreditNote ? TransactionCategoryCodeEnum.OUTPUT_VAT.getCode()
                                    : TransactionCategoryCodeEnum.INPUT_VAT.getCode());
            journalLineItem.setTransactionCategory(inputVatCategory);
            if (isCustomerCreditNote)
                journalLineItem.setDebitAmount(creditNote.getTotalVatAmount());
            else
                journalLineItem.setCreditAmount(creditNote.getTotalVatAmount());
            journalLineItem.setReferenceType(PostingReferenceTypeEnum.CREDIT_NOTE);
            journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
            journalLineItem.setCreatedBy(userId);
            journalLineItem.setJournal(journal);
            journalLineItemList.add(journalLineItem);
        }
        journal.setJournalLineItems(journalLineItemList);
        journal.setCreatedBy(userId);
        journal.setPostingReferenceType(PostingReferenceTypeEnum.CREDIT_NOTE);
        if (creditNote != null) {
            journal.setJournalDate(creditNote.getInvoiceDate());
            journal.setTransactionDate(creditNote.getInvoiceDate());
        } else {
            journal.setJournalDate(LocalDate.now());
            journal.setTransactionDate(creditNote.getInvoiceDate());
        }
        return journal;
    }

    public CreditNote createCNWithoutInvoice(CreditNoteRequestModel creditNoteRequestModel, Integer userId) {
        CreditNote creditNote = null;
        if (creditNoteRequestModel.getCreditNoteId() != null) {
            creditNote = creditNoteRepository.findById(creditNoteRequestModel.getCreditNoteId()).get();
        } else {
            creditNote = new CreditNote();
        }
        creditNote.setCreatedBy(userId);
        creditNote.setCreatedDate(LocalDateTime.now());
        creditNote.setLastUpdateBy(userId);
        creditNote.setLastUpdateDate(LocalDateTime.now());
        Integer creditNoteType = Integer.parseInt(creditNoteRequestModel.getType());
        creditNote.setType(creditNoteType);
        creditNote.setStatus(CommonStatusEnum.PENDING.getValue());
        creditNote.setContact(contactService.findByPK(creditNoteRequestModel.getContactId()));
        creditNote.setDeleteFlag(Boolean.FALSE);
        creditNote.setCreditNoteDate(dateFormtUtil.convertToOffsetDateTime(creditNoteRequestModel.getCreditNoteDate()));
        creditNote.setIsCNWithoutProduct(Boolean.TRUE);
        creditNote.setCurrency(currencyService.findByPK(contactService.findByPK
                (creditNoteRequestModel.getContactId()).getCurrency().getCurrencyCode()));
        if (creditNoteRequestModel.getExchangeRate() != null) {
            creditNote.setExchangeRate(creditNoteRequestModel.getExchangeRate());
        }
        if (creditNoteRequestModel.getVatCategoryId() != null) {
            VatCategory vatCategory = vatCategoryService.findByPK(creditNoteRequestModel.getVatCategoryId());
            creditNote.setVatCategory(vatCategory);
        }
        if(creditNoteRequestModel.getNotes()!= null){
            creditNote.setNotes(creditNoteRequestModel.getNotes());
        }
        if (creditNoteRequestModel.getReferenceNo() != null) {
            creditNote.setReferenceNo(creditNoteRequestModel.getReferenceNo());
        }
        creditNote.setCreditNoteNumber(creditNoteRequestModel.getCreditNoteNumber());
        CustomizeInvoiceTemplate template = customizeInvoiceTemplateService.getInvoiceTemplate(creditNoteType);
        String suffix = invoiceNumberUtil.fetchSuffixFromString(creditNoteRequestModel.getCreditNoteNumber());
        template.setSuffix(Integer.parseInt(suffix));
        String prefix = creditNote.getCreditNoteNumber().substring(0, creditNote.getCreditNoteNumber().lastIndexOf(suffix));
        template.setPrefix(prefix);
        customizeInvoiceTemplateService.persist(template);
        creditNote.setTotalAmount(creditNoteRequestModel.getTotalAmount());
        creditNote.setTotalVatAmount(creditNoteRequestModel.getTotalVatAmount());
        creditNote.setDueAmount(creditNoteRequestModel.getTotalAmount());

        return creditNote;
    }

    public Journal cnPostingWithoutInvoiceWithoutProduct(PostingRequestModel postingRequestModel, Integer userId) {
        Journal journal = new Journal();
        List<JournalLineItem> journalLineItemList = new ArrayList<>();
        CreditNote creditNote = creditNoteRepository.findById(postingRequestModel.getPostingRefId()).get();
        boolean isCreditNote = InvoiceTypeConstant.isCustomerCreditNote(creditNote.getType());
        Map<String, Object> map = new HashMap<>();
        map.put(JSON_KEY_CONTACT,creditNote.getContact());
        if (isCreditNote){
            map.put(JSON_KEY_CONTACT_TYPE, 2);
        }
        else {
            map.put(JSON_KEY_CONTACT_TYPE, 1);
        }
        map.put(JSON_KEY_DELETE_FLAG,Boolean.FALSE);
        List<ContactTransactionCategoryRelation> contactTransactionCategoryRelations = contactTransactionCategoryService
                .findByAttributes(map);
        TransactionCategory transactionCategory = null;
        if (contactTransactionCategoryRelations!=null && contactTransactionCategoryRelations.size()>0){
            ContactTransactionCategoryRelation contactTransactionCategoryRelation = contactTransactionCategoryRelations.get(0);
            transactionCategory = contactTransactionCategoryRelation.getTransactionCategory();
        }
        JournalLineItem journalLineItem1 = new JournalLineItem();
        journalLineItem1.setTransactionCategory(transactionCategory);
        if(isCreditNote){
            journalLineItem1.setCreditAmount(creditNote.getTotalAmount());
            journalLineItem1.setReferenceType(PostingReferenceTypeEnum.CREDIT_NOTE);
        }
       else {
            journalLineItem1.setDebitAmount(creditNote.getTotalAmount());
            journalLineItem1.setReferenceType(PostingReferenceTypeEnum.DEBIT_NOTE);
        }
        journalLineItem1.setReferenceId(postingRequestModel.getPostingRefId());
        journalLineItem1.setCreatedBy(userId);
        journalLineItem1.setJournal(journal);
        journalLineItemList.add(journalLineItem1);

        JournalLineItem journalLineItem2 = new JournalLineItem();
        journalLineItem2.setTransactionCategory(transactionCategoryService
                .findTransactionCategoryByTransactionCategoryCode(isCreditNote ?
                        TransactionCategoryCodeEnum.SALE.getCode(): TransactionCategoryCodeEnum.COST_OF_GOODS_SOLD.getCode()));
        if(isCreditNote) {
            journalLineItem2.setDebitAmount(creditNote.getTotalAmount().subtract
                    (Optional.ofNullable(creditNote.getTotalVatAmount()).orElse(BigDecimal.ZERO)));
            journalLineItem2.setReferenceType(PostingReferenceTypeEnum.CREDIT_NOTE);
        }
        else {
            journalLineItem2.setCreditAmount(creditNote.getTotalAmount().subtract
                    (Optional.ofNullable(creditNote.getTotalVatAmount()).orElse(BigDecimal.ZERO)));
            journalLineItem2.setReferenceType(PostingReferenceTypeEnum.DEBIT_NOTE);
        }
        journalLineItem2.setReferenceId(postingRequestModel.getPostingRefId());
        journalLineItem2.setCreatedBy(userId);
        journalLineItem2.setJournal(journal);
        journalLineItemList.add(journalLineItem2);

        if ((creditNote.getTotalVatAmount() != null) && (creditNote.getTotalVatAmount().compareTo(BigDecimal.ZERO) != 0)) {
            JournalLineItem journalLineItem3 = new JournalLineItem();
            TransactionCategory inputVatCategory = transactionCategoryService
                    .findTransactionCategoryByTransactionCategoryCode(
                            isCreditNote ? TransactionCategoryCodeEnum.OUTPUT_VAT.getCode()
                                    : TransactionCategoryCodeEnum.INPUT_VAT.getCode());
            journalLineItem3.setTransactionCategory(inputVatCategory);
            if (isCreditNote) {
                journalLineItem3.setDebitAmount(creditNote.getTotalVatAmount());
                journalLineItem3.setReferenceType(PostingReferenceTypeEnum.CREDIT_NOTE);
            }
            else {
                journalLineItem3.setCreditAmount(creditNote.getTotalVatAmount());
                journalLineItem3.setReferenceType(PostingReferenceTypeEnum.DEBIT_NOTE);
            }
            journalLineItem3.setReferenceId(postingRequestModel.getPostingRefId());
            journalLineItem3.setCreatedBy(userId);
            journalLineItem3.setJournal(journal);
            journalLineItemList.add(journalLineItem3);
        }
        journal.setJournalLineItems(journalLineItemList);
        journal.setCreatedBy(userId);
        if (creditNote != null) {
            journal.setJournalDate(creditNote.getCreditNoteDate().toLocalDate());
        } else {
            journal.setJournalDate(LocalDate.now());
        }
        journal.setJournlReferencenNo(creditNote.getCreditNoteNumber());
        if (creditNote.getType()==7){
            journal.setDescription("Credit Note");
            journal.setPostingReferenceType(PostingReferenceTypeEnum.CREDIT_NOTE);
        }
        else {
            journal.setDescription("Debit Note");
            journal.setPostingReferenceType(PostingReferenceTypeEnum.DEBIT_NOTE);
        }
        journal.setTransactionDate(creditNote.getCreditNoteDate().toLocalDate());
        if(postingRequestModel.getSendAgain().equals(false)) {
            creditNote.setStatus(CommonStatusEnum.OPEN.getValue());
        }
        creditNoteRepository.save(creditNote);
        return journal;
    }

public SimpleAccountsMessage recordPaymentForCN(RecordPaymentForCN requestModel, Integer userId, SimpleAccountsMessage message,HttpServletRequest request) {
    if (requestModel.getPayMode() == PayMode.CASH) {
        Map<String, Object> param = new HashMap<>();
        TransactionCategory transactionCategory = transactionCategoryService.findByPK(requestModel.getDepositTo());
        if (transactionCategory != null)
            param.put("transactionCategory", transactionCategory);
        param.put("deleteFlag", false);
        List<BankAccount> bankAccountList = bankAccountService.findByAttributes(param);
        BankAccount bankAccount = bankAccountList != null && bankAccountList.size() > 0 ? bankAccountList.get(0)
                : null;
        Transaction transaction = new Transaction();
        transaction.setCreatedBy(userId);
        if (requestModel.getPaymentDate() != null) {
            LocalDateTime date = Instant.ofEpochMilli(requestModel.getPaymentDate().getTime())
                    .atZone(ZoneId.systemDefault()).withHour(0).withMinute(0).withSecond(0).withNano(0)
                    .toLocalDateTime();
            transaction.setTransactionDate(date);
        }
        transaction.setBankAccount(bankAccount);
        transaction.setTransactionAmount(requestModel.getAmountReceived());
        transaction.setTransactionExplinationStatusEnum(TransactionExplinationStatusEnum.FULL);
        if (requestModel.getType().equals("7")){
            transaction.setTransactionDescription(
                    TRANSACTION_DESCRIPTION_MANUAL_CREDIT_NOTE);
            transaction.setDebitCreditFlag('D');
            transaction.setCoaCategory(
                    chartOfAccountCategoryService.findByPK(ChartOfAccountCategoryIdEnumConstant.SALES.getId()));
        }
        else{
            transaction.setTransactionDescription(
                    TRANSACTION_DESCRIPTION_MANUAL_CREDIT_NOTE);
            transaction.setDebitCreditFlag('C');
            transaction.setCoaCategory(
                    chartOfAccountCategoryService.findByPK(ChartOfAccountCategoryIdEnumConstant.EXPENSE.getId()));
        }
        transaction.setTransactionDueAmount(BigDecimal.ZERO);
        transactionService.persist(transaction);
        BigDecimal currentBalance = bankAccount.getCurrentBalance();
        if (transaction.getDebitCreditFlag() == 'C') {
            currentBalance = currentBalance.add(transaction.getTransactionAmount());
        } else {
            currentBalance = currentBalance.subtract(transaction.getTransactionAmount());
        }
        bankAccount.setCurrentBalance(currentBalance);
        bankAccountService.update(bankAccount);
        CreditNote creditNote = creditNoteRepository.findById(requestModel.getCreditNoteId()).get();
        TransactionExplanation transactionExplanation = new TransactionExplanation();
        transactionExplanation.setCreatedBy(userId);
        transactionExplanation.setCreatedDate(LocalDateTime.now());
        transactionExplanation.setTransaction(transaction);
        transactionExplanation.setPaidAmount(transaction.getTransactionAmount());
        transactionExplanation.setCurrentBalance(transaction.getCurrentBalance());
        transactionExplanation.setExplanationContact(creditNote.getContact().getContactId());
        transactionExplanation.setExplainedTransactionCategory(transaction.getExplainedTransactionCategory());
        transactionExplanation.setExchangeGainOrLossAmount(BigDecimal.ZERO);
        List<TransactionExplinationLineItem> transactionExplinationLineItems = new ArrayList<>();
        TransactionExplinationLineItem transactionExplinationLineItem = new TransactionExplinationLineItem();
        transactionExplinationLineItem.setCreatedBy(userId);
        transactionExplinationLineItem.setCreatedDate(LocalDateTime.now());

        transactionExplinationLineItem.setReferenceId(creditNote.getCreditNoteId());
        transactionExplinationLineItem.setTransactionExplanation(transactionExplanation);
        transactionExplanation.setExplanationLineItems(transactionExplinationLineItems);
        transactionExplinationLineItems.add(transactionExplinationLineItem);
        transactionExplinationLineItem.setExplainedAmount(transaction.getTransactionAmount());
        transactionExplinationLineItem.setConvertedAmount(transaction.getTransactionAmount());
        transactionExplinationLineItem.setExchangeRate(transaction.getExchangeRate());
        transactionExplinationLineItem.setPartiallyPaid(Boolean.FALSE);

        if (requestModel.getType().equals("7")) {
            transactionExplanation.setCoaCategory(chartOfAccountCategoryService.findByPK(ChartOfAccountCategoryIdEnumConstant.SALES.getId()));
            transactionExplinationLineItem.setReferenceType(PostingReferenceTypeEnum.CREDIT_NOTE);
        }
        else {
            transactionExplanation.setCoaCategory(chartOfAccountCategoryService.findByPK(ChartOfAccountCategoryIdEnumConstant.EXPENSE.getId()));
            transactionExplinationLineItem.setReferenceType(PostingReferenceTypeEnum.DEBIT_NOTE);
        }
        //sum of all explained invoices
        transactionExplanationRepository.save(transactionExplanation);
        // Post journal
        Journal journal = refundPosting(
                new PostingRequestModel(requestModel.getCreditNoteId(), requestModel.getAmountReceived()), userId,
                transactionCategory, requestModel.getIsCreatedWithoutInvoice(), requestModel.getContactId(),requestModel.getPaymentDate());
        journalService.persist(journal);

        if (requestModel.getAmountReceived().compareTo(creditNote.getDueAmount())==0){
            creditNote.setDueAmount(BigDecimal.ZERO);
            creditNote.setStatus(CommonStatusEnum.CLOSED.getValue());
        }
        else {
            creditNote.setDueAmount(creditNote.getDueAmount().subtract(requestModel.getAmountReceived()));
            creditNote.setStatus(CommonStatusEnum.PARTIALLY_PAID.getValue());
        }
        creditNoteRepository.save(creditNote);
        Contact contact = contactService.findByPK(creditNote.getContact().getContactId());
        if(creditNote.getType()!=null && creditNote.getType()== 7) {
            sendCNRefundMail(contact, 7, creditNote.getCreditNoteNumber(), requestModel.getAmountReceived().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString(),
                    dateFormtUtil.getDateAsString(requestModel.getPaymentDate(), DATE_FORMAT_DD_SLASH_MM_SLASH_YYYY).replace("/", "-"), request);
        }
    }
    message = new SimpleAccountsMessage("0082",
                        MessageUtil.getMessage("refund.created.successful.msg.0082"), false);
    return message;
}

    public String applyToInvoice(RefundAgainstInvoicesRequestModel refundAgainstInvoicesRequestModel, Integer userId, HttpServletRequest request) {
        BigDecimal totalInvoiceAmount = BigDecimal.ZERO;
        for (Integer invoiceId : refundAgainstInvoicesRequestModel.getInvoiceIds()) {
            CreditNote creditNote = new CreditNote();
            creditNote = creditNoteRepository.findById(refundAgainstInvoicesRequestModel.getCreditNoteId()).get();
            Invoice invoice = invoiceService.findByPK(invoiceId);
            CreditNoteInvoiceRelation creditDebitNoteInvoiceRelation = new CreditNoteInvoiceRelation();
            creditDebitNoteInvoiceRelation.setCreatedBy(userId);
            creditDebitNoteInvoiceRelation.setCreatedDate(LocalDateTime.now());
            creditDebitNoteInvoiceRelation.setLastUpdateBy(userId);
            creditDebitNoteInvoiceRelation.setLastUpdateDate(LocalDateTime.now());
            creditDebitNoteInvoiceRelation.setCreditNote(creditNote);
            creditDebitNoteInvoiceRelation.setInvoice(invoice);
            creditNoteInvoiceRelationService.persist(creditDebitNoteInvoiceRelation);
            if (creditNote.getDueAmount().compareTo(invoice.getDueAmount()) == -1) {
                invoice.setDueAmount(invoice.getDueAmount().subtract(creditNote.getDueAmount()));
                creditDebitNoteInvoiceRelation.setAppliedByInvoiceAmount(creditNote.getDueAmount());
                invoice.setStatus(CommonStatusEnum.PARTIALLY_PAID.getValue());
                creditNote.setDueAmount(BigDecimal.ZERO);
                creditNote.setStatus(CommonStatusEnum.CLOSED.getValue());
            }
            if (creditNote.getDueAmount().compareTo(invoice.getDueAmount()) == 1) {
                creditNote.setDueAmount(creditNote.getDueAmount().subtract(invoice.getDueAmount()));
                creditNote.setStatus(CommonStatusEnum.PARTIALLY_PAID.getValue());
                creditDebitNoteInvoiceRelation.setAppliedByInvoiceAmount(invoice.getDueAmount());
                invoice.setDueAmount(BigDecimal.ZERO);
                invoice.setStatus(CommonStatusEnum.PAID.getValue());

            }
            if (creditNote.getDueAmount().compareTo(invoice.getDueAmount()) == 0) {
                creditDebitNoteInvoiceRelation.setAppliedByInvoiceAmount(invoice.getDueAmount());
                invoice.setDueAmount(creditNote.getTotalAmount().subtract(invoice.getDueAmount()));
                invoice.setStatus(CommonStatusEnum.PAID.getValue());
                creditNote.setDueAmount(BigDecimal.ZERO);
                creditNote.setStatus(CommonStatusEnum.CLOSED.getValue());
            }
            invoiceService.update(invoice);
            totalInvoiceAmount.add(invoice.getDueAmount());
            creditNoteRepository.save(creditNote);
            PostingRequestModel postingRequestModel = new PostingRequestModel();
            contactService.sendInvoiceThankYouMail(invoice.getContact(),1,invoice.getReferenceNumber(),invoice.getTotalAmount().subtract(invoice.getDueAmount()).setScale(2, BigDecimal.ROUND_HALF_EVEN).toString(),dateFormtUtil.getLocalDateTimeAsString(LocalDateTime.now(),DATE_FORMAT_DD_SLASH_MM_SLASH_YYYY).replace("/","-"), invoice.getDueAmount(), request);
        }

        return "Credit Note Applied Against Invoice";
    }

    public List<CreditNoteRequestModel> getInvoicesByCreditNoteId(Integer id) {
        CreditNote creditNote = creditNoteRepository.findById(id).get();
        List<CreditNoteRequestModel> creditNoteRequestModelList = new ArrayList<>();
        CreditNoteRequestModel creditNoteRequestModel = new CreditNoteRequestModel();
        if(creditNote.getInvoiceId()!=null){
            Invoice invoice = invoiceService.findByPK(creditNote.getInvoiceId());
            creditNoteRequestModel.setInvoiceId(invoice.getId());
            creditNoteRequestModel.setInvoiceNumber(invoice.getReferenceNumber());
            creditNoteRequestModel.setTotalAmount(invoice.getTotalAmount());
            creditNoteRequestModel.setTotalVatAmount(invoice.getTotalVatAmount());
            if (creditNote.getCreditNoteDate() != null) {
                ZoneId timeZone = ZoneId.systemDefault();
                Date date = Date.from(creditNote.getCreditNoteDate().toInstant());
                creditNoteRequestModel.setCreditNoteDate(date);
            }
            if(invoice.getContact().getOrganization() != null && ! invoice.getContact().getOrganization().isEmpty()){
                creditNoteRequestModel.setContactName(invoice.getContact().getOrganization());
            }
            else {
                creditNoteRequestModel.setContactName(invoice.getContact().getFirstName()
                        + " " + invoice.getContact().getLastName());
            }
            creditNoteRequestModelList.add(creditNoteRequestModel);
            creditNoteRequestModel.setCreditNoteNumber(creditNote.getCreditNoteNumber());
        }
        return creditNoteRequestModelList;
    }
    public List<AppliedInvoiceCreditNote> getAppliedInvoicesByCreditNoteId(Integer id) {
        Map<String, Object> param = new HashMap<>();
        param.put(JSON_KEY_CREDIT_NOTE, id);
        List<CreditNoteInvoiceRelation> creditNoteInvoiceRelationList = creditNoteInvoiceRelationService
                .findByAttributes(param);
        CreditNote creditNote = creditNoteRepository.findById(id).get();
        String type = null;
        if(creditNote.getType()==7){
            type = "CREDIT_NOTE";
        }
        else{
            type = "DEBIT_NOTE";
        }
        List<TransactionExplinationLineItem> transactionExplinationLineItemList =
                transactionExplinationLineItemRepository.findByReferenceIdAndType(creditNote.getCreditNoteId(), type);
        List<AppliedInvoiceCreditNote> appliedInvoiceCreditNoteList = new ArrayList<>();
        if(transactionExplinationLineItemList!=null) {
            for (TransactionExplinationLineItem transactionExplinationLineItem : transactionExplinationLineItemList) {
                AppliedInvoiceCreditNote requestModel = new AppliedInvoiceCreditNote();
                requestModel.setTotalAmount(transactionExplinationLineItem.getExplainedAmount());
                requestModel.setTransactionType("Refund");
                appliedInvoiceCreditNoteList.add(requestModel);
            }
        }
        if(creditNoteInvoiceRelationList!=null){
        for (CreditNoteInvoiceRelation creditNoteInvoiceRelation : creditNoteInvoiceRelationList) {
                AppliedInvoiceCreditNote requestModel = new AppliedInvoiceCreditNote();
                requestModel.setInvoiceId(creditNoteInvoiceRelation.getInvoice().getId());
                requestModel.setInvoiceNumber(creditNoteInvoiceRelation.getInvoice().getReferenceNumber());
                requestModel.setTotalAmount(creditNoteInvoiceRelation.getAppliedByInvoiceAmount());
                requestModel.setTransactionType("Applied To Invoice");
                if (creditNoteInvoiceRelation.getInvoice().getContact().getOrganization() != null &&
                        !creditNoteInvoiceRelation.getInvoice().getContact().getOrganization().isEmpty()) {
                    requestModel.setCustomerName(creditNoteInvoiceRelation.getInvoice().getContact().getOrganization());
                } else {
                    requestModel.setCustomerName(creditNoteInvoiceRelation.getInvoice().getContact().getFirstName()
                            + " " + creditNoteInvoiceRelation.getInvoice().getContact().getLastName());
                }
                requestModel.setCreditNoteId(creditNoteInvoiceRelation.getCreditNote().getCreditNoteNumber());
                    if (creditNote.getInvoiceId()!=null && !creditNote.getInvoiceId().equals(creditNoteInvoiceRelation.getInvoice().getId())) {
                        appliedInvoiceCreditNoteList.add(requestModel);
                    }
                else if(creditNote.getInvoiceId()==null) {
                    appliedInvoiceCreditNoteList.add(requestModel);
                }
        }
    }
        return appliedInvoiceCreditNoteList;
    }

    public String recordPaymentCNWithoutInvoice(RecordPaymentAgainstCNWithoutInvoice requestModel, Integer userId,HttpServletRequest request) {
        if (requestModel.getPayMode() == PayMode.CASH) {
            Map<String, Object> param = new HashMap<>();
            TransactionCategory transactionCategory = transactionCategoryService.findByPK(requestModel.getDepositeTo());
            if (transactionCategory != null)
                param.put("transactionCategory", transactionCategory);
            param.put("deleteFlag", false);
            List<BankAccount> bankAccountList = bankAccountService.findByAttributes(param);
            BankAccount bankAccount = bankAccountList != null && bankAccountList.size() > 0 ? bankAccountList.get(0)
                    : null;
            Transaction transaction = new Transaction();
            transaction.setCreatedBy(userId);
            if (requestModel.getPaymentDate() != null) {
                LocalDateTime date = Instant.ofEpochMilli(requestModel.getPaymentDate().getTime())
                        .atZone(ZoneId.systemDefault()).withHour(0).withMinute(0).withSecond(0).withNano(0)
                        .toLocalDateTime();
                transaction.setTransactionDate(date);
            }
            transaction.setBankAccount(bankAccount);
            transaction.setTransactionAmount(requestModel.getAmountReceived());
            transaction.setTransactionExplinationStatusEnum(TransactionExplinationStatusEnum.FULL);
            transaction.setTransactionDueAmount(BigDecimal.ZERO);
            if (requestModel.getType().equals("7")){
                transaction.setTransactionDescription(
                        TRANSACTION_DESCRIPTION_MANUAL_CREDIT_NOTE);
                transaction.setDebitCreditFlag('D');
                transaction.setCoaCategory(
                        chartOfAccountCategoryService.findByPK(ChartOfAccountCategoryIdEnumConstant.SALES.getId()));
            }
            else{
                transaction.setTransactionDescription(
                        "Manual Transaction Created Against Debit No ");
                transaction.setDebitCreditFlag('C');
                transaction.setCoaCategory(
                        chartOfAccountCategoryService.findByPK(ChartOfAccountCategoryIdEnumConstant.EXPENSE.getId()));
            }
            transactionService.persist(transaction);
            BigDecimal currentBalance = bankAccount.getCurrentBalance();
            if (transaction.getDebitCreditFlag() == 'D') {
                currentBalance = currentBalance.subtract(transaction.getTransactionAmount());
            } else {
                currentBalance = currentBalance.add(transaction.getTransactionAmount());
            }
            bankAccount.setCurrentBalance(currentBalance);
            bankAccountService.update(bankAccount);
            // Post journal
            Journal journal = refundPosting(
                    new PostingRequestModel(requestModel.getCreditNoteId(), requestModel.getAmountReceived()), userId,
                    transactionCategory, requestModel.getIsCNWithoutProduct(), requestModel.getContactId(),requestModel.getPaymentDate());
            journalService.persist(journal);
            CreditNote creditNote = creditNoteRepository.findById(requestModel.getCreditNoteId()).get();
            if (requestModel.getAmountReceived().compareTo(creditNote.getDueAmount())==0){
                creditNote.setDueAmount(BigDecimal.ZERO);
                creditNote.setStatus(CommonStatusEnum.CLOSED.getValue());
            }
            else {
                creditNote.setDueAmount(creditNote.getDueAmount().subtract(requestModel.getAmountReceived()));
                creditNote.setStatus(CommonStatusEnum.PARTIALLY_PAID.getValue());
            }
            creditNoteRepository.save(creditNote);

            TransactionExplanation transactionExplanation = new TransactionExplanation();
            transactionExplanation.setCreatedBy(userId);
            transactionExplanation.setCreatedDate(LocalDateTime.now());
            transactionExplanation.setTransaction(transaction);
            transactionExplanation.setPaidAmount(transaction.getTransactionAmount());
            transactionExplanation.setCurrentBalance(transaction.getCurrentBalance());
            transactionExplanation.setExplanationContact(creditNote.getContact().getContactId());
            transactionExplanation.setExplainedTransactionCategory(transaction.getExplainedTransactionCategory());

            List<TransactionExplinationLineItem> transactionExplinationLineItems = new ArrayList<>();
            TransactionExplinationLineItem transactionExplinationLineItem = new TransactionExplinationLineItem();
            transactionExplinationLineItem.setCreatedBy(userId);
            transactionExplinationLineItem.setCreatedDate(LocalDateTime.now());
            if (requestModel.getType().equals("7")) {
                transactionExplanation.setCoaCategory(chartOfAccountCategoryService.findByPK(ChartOfAccountCategoryIdEnumConstant.SALES.getId()));
                transactionExplinationLineItem.setReferenceType(PostingReferenceTypeEnum.CREDIT_NOTE);
            }
            else {
                transactionExplanation.setCoaCategory(chartOfAccountCategoryService.findByPK(ChartOfAccountCategoryIdEnumConstant.EXPENSE.getId()));
                transactionExplinationLineItem.setReferenceType(PostingReferenceTypeEnum.DEBIT_NOTE);
            }
            transactionExplinationLineItem.setReferenceId(creditNote.getCreditNoteId());
            transactionExplinationLineItem.setTransactionExplanation(transactionExplanation);
            transactionExplinationLineItem.setExplainedAmount(requestModel.getAmountReceived());
            transactionExplanation.setExplanationLineItems(transactionExplinationLineItems);
            transactionExplinationLineItems.add(transactionExplinationLineItem);
            transactionExplanationRepository.save(transactionExplanation);
            Contact contact = contactService.findByPK(creditNote.getContact().getContactId());
            if(creditNote.getType()!=null && creditNote.getType()== 7) {
                sendCNRefundMail(contact, 7, creditNote.getCreditNoteNumber(), requestModel.getAmountReceived().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString(),
                        dateFormtUtil.getDateAsString(requestModel.getPaymentDate(), DATE_FORMAT_DD_SLASH_MM_SLASH_YYYY).replace("/", "-"), request);
            }
        }
        return "Payment Recorded Successfully";
    }

    public CreditNoteRequestModel getRequestModelforCNWithoutProduct(CreditNote creditNote) {
        CreditNoteRequestModel requestModel = new CreditNoteRequestModel();
        requestModel.setCreditNoteId(creditNote.getCreditNoteId());
        if (creditNote.getCreditNoteDate() != null) {
            ZoneId timeZone = ZoneId.systemDefault();
            Date date = Date.from(creditNote.getCreditNoteDate().toInstant());
            requestModel.setCreditNoteDate(date);
        }
        if (creditNote.getPlaceOfSupplyId()!=null){
            requestModel.setPlaceOfSupplyId(creditNote.getPlaceOfSupplyId());
        }
        requestModel.setCreditNoteNumber(creditNote.getCreditNoteNumber());
        if (creditNote.getContact() != null) {
            requestModel.setContactId(creditNote.getContact().getContactId());
            requestModel.setCurrencyCode(creditNote.getCurrency().getCurrencyCode());
        }
        requestModel.setDueAmount(creditNote.getDueAmount());
        requestModel.setTaxTreatment(creditNote.getContact().getTaxTreatment().getTaxTreatment());
        requestModel.setTotalAmount(creditNote.getTotalAmount());
        requestModel.setContactId(creditNote.getContact().getContactId());
        requestModel.setContactName(creditNote.getContact().getFirstName());
        requestModel.setTotalVatAmount(creditNote.getTotalVatAmount());
        requestModel.setNotes(creditNote.getNotes());
       requestModel.setVatCategoryId(creditNote.getVatCategory().getId());
       requestModel.setIsReverseChargeEnabled(creditNote.getIsReverseChargeEnabled());
        if (creditNote.getType() != null) {

            requestModel.setType(creditNote.getType().toString());
        }
        if (creditNote.getStatus() != null) {
            requestModel.setStatus(CommonStatusEnum.getInvoiceTypeByValue(creditNote.getStatus()));
        }

        if (creditNote.getContact() != null) {
            Contact contact = creditNote.getContact();
            requestModel.setEmail(contact.getBillingEmail());
        }
        if(creditNote.getReferenceNo() != null){
            requestModel.setReferenceNo(creditNote.getReferenceNo());
        }
        if(creditNote.getInvoiceId()!=null){
            Invoice invoice = invoiceService.findByPK(creditNote.getInvoiceId());
            if(invoice.getTaxType()!=null) {
                requestModel.setTaxType(invoice.getTaxType());
            }
            if(invoice.getExchangeRate()!=null) {
                requestModel.setExchangeRate(invoice.getExchangeRate());
            }
            if(invoice.getId()!=null) {
                requestModel.setInvoiceId(invoice.getId());
            }
            if(invoice.getReferenceNumber()!=null) {
                requestModel.setInvoiceNumber(invoice.getReferenceNumber());
            }
            Map<String, Object> attribute = new HashMap<String, Object>();
            attribute.put(JSON_KEY_CREDIT_NOTE, creditNote);
            List<CreditNoteInvoiceRelation> creditNoteInvoiceRelationList = creditNoteInvoiceRelationService.findByAttributes(attribute);
            if (!creditNoteInvoiceRelationList.isEmpty()){
                BigDecimal totalCreditNoteAmount = BigDecimal.ZERO;
                for (CreditNoteInvoiceRelation creditNoteInvoiceRelation:creditNoteInvoiceRelationList){
                    if (!creditNoteInvoiceRelation.getCreditNote().getCreditNoteId().equals(creditNote.getCreditNoteId())){
                        totalCreditNoteAmount = totalCreditNoteAmount.add(creditNoteInvoiceRelation.getCreditNote().getTotalAmount());
                        requestModel.setRemainingInvoiceAmount(creditNoteInvoiceRelation.getInvoice().getTotalAmount().subtract(totalCreditNoteAmount));
                    }
                    else {
                        requestModel.setRemainingInvoiceAmount(creditNoteInvoiceRelation.getInvoice().getTotalAmount());
                    }
                }
            }
        }
        return requestModel;
    }

    public CreditNoteRequestModel getCreditNoteByInvoiceId(Integer id) {
        CreditNote creditNote = null;
        if(id != null){
            Invoice invoice = invoiceService.findByPK(id);
            if(invoice.getId()!=null){
             creditNote = creditNoteRepository.findByInvoiceIdAndDeleteFlag(invoice.getId(),false);
            }
        }
        CreditNoteRequestModel requestModel = new CreditNoteRequestModel();
        if(creditNote!=null) {
            requestModel.setCreditNoteId(creditNote.getCreditNoteId());
            if (creditNote.getCreditNoteDate() != null) {
                ZoneId timeZone = ZoneId.systemDefault();
                Date date = Date.from(creditNote.getCreditNoteDate().toInstant());
                requestModel.setCreditNoteDate(date);
            }
            requestModel.setCreditNoteNumber(creditNote.getCreditNoteNumber());
            if (creditNote.getContact() != null) {
                requestModel.setContactId(creditNote.getContact().getContactId());
                requestModel.setCurrencyCode(creditNote.getCurrency().getCurrencyCode());
            }
            requestModel.setDueAmount(creditNote.getDueAmount());
            requestModel.setTaxTreatment(creditNote.getContact().getTaxTreatment().getTaxTreatment());
            requestModel.setTotalAmount(creditNote.getTotalAmount());
            requestModel.setContactId(creditNote.getContact().getContactId());
            requestModel.setContactName(creditNote.getContact().getFirstName());
            requestModel.setTotalVatAmount(creditNote.getTotalVatAmount());
            requestModel.setVatCategoryId(creditNote.getVatCategory().getId());
            if(creditNote.getNotes()!=null){
                requestModel.setNotes(creditNote.getNotes());
            }
            if (creditNote.getType() != null) {

                requestModel.setType(creditNote.getType().toString());
            }
            if (creditNote.getStatus() != null) {
                requestModel.setStatus(CommonStatusEnum.getInvoiceTypeByValue(creditNote.getStatus()));
            }

            if (creditNote.getContact() != null) {
                Contact contact = creditNote.getContact();
                requestModel.setEmail(contact.getBillingEmail());
            }
            if (creditNote.getReferenceNo() != null) {
                requestModel.setReferenceNo(creditNote.getReferenceNo());
            }
            if (creditNote.getInvoiceId() != null) {
                requestModel.setIsCreatedWithoutInvoice(Boolean.FALSE);
            }
            else {
                requestModel.setIsCreatedWithoutInvoice(Boolean.TRUE);
            }
        }
        return requestModel;
    }

    public Journal reverseCreditNotePosting(PostingRequestModel postingRequestModel, Integer userId) {
        //Create Reverse Journal Entries For Posted  Credit Note
        Journal newjournal = null;
        List<JournalLineItem> creditNoteJLIList = journalLineItemRepository.findAllByReferenceIdAndReferenceType
                (postingRequestModel.getPostingRefId(), PostingReferenceTypeEnum.CREDIT_NOTE);
        if (creditNoteJLIList != null && !creditNoteJLIList.isEmpty()) {
            Collection<Journal> journalList = creditNoteJLIList.stream()
                    .distinct()
                    .map(JournalLineItem::getJournal)
                    .collect(Collectors.toList());

            Set<Journal> set = new LinkedHashSet<Journal>(journalList);
            journalList.clear();
            journalList.addAll(set);

            for (Journal journal : journalList) {

                newjournal = new Journal();

                newjournal.setCreatedBy(creditNoteJLIList.get(0).getJournal().getCreatedBy());
                newjournal.setPostingReferenceType(PostingReferenceTypeEnum.REVERSE_CREDIT_NOTE);
                newjournal.setDescription("Reverse Credit Note");
                newjournal.setJournalDate(LocalDate.now());
                newjournal.setTransactionDate(LocalDateTime.now().toLocalDate());

                Collection<JournalLineItem> journalLineItems = journal.getJournalLineItems();
                Collection<JournalLineItem> newReverseJournalLineItemList = new ArrayList<>();

                for (JournalLineItem journalLineItem : journalLineItems) {

                    JournalLineItem newReverseJournalLineItemEntry = new JournalLineItem();

                    newReverseJournalLineItemEntry.setTransactionCategory(journalLineItem.getTransactionCategory());
                    newReverseJournalLineItemEntry.setReferenceType(PostingReferenceTypeEnum.REVERSE_CREDIT_NOTE);
                    newReverseJournalLineItemEntry.setReferenceId(journalLineItem.getReferenceId());
                    newReverseJournalLineItemEntry.setCreatedBy(journalLineItem.getCreatedBy());
                    newReverseJournalLineItemEntry.setCreatedDate(journalLineItem.getCreatedDate());
                    newReverseJournalLineItemEntry.setDescription(journalLineItem.getDescription());
                    newReverseJournalLineItemEntry.setDeleteFlag(journalLineItem.getDeleteFlag());

                        newReverseJournalLineItemEntry.setDebitAmount(journalLineItem.getCreditAmount());
                        newReverseJournalLineItemEntry.setCreditAmount(journalLineItem.getDebitAmount());
                    newReverseJournalLineItemEntry.setJournal(newjournal);
                    newReverseJournalLineItemList.add(newReverseJournalLineItemEntry);
                }
                newjournal.setJournalLineItems(newReverseJournalLineItemList);
            }
        }
        return newjournal;
    }

    public Journal reverseDebitNotePosting(PostingRequestModel postingRequestModel, Integer userId) {
        //Create Reverse Journal Entries For Posted  Credit Note
        Journal newjournal = null;
        List<JournalLineItem> creditNoteJLIList = journalLineItemRepository.findAllByReferenceIdAndReferenceType
                (postingRequestModel.getPostingRefId(), PostingReferenceTypeEnum.DEBIT_NOTE);
        if (creditNoteJLIList != null && !creditNoteJLIList.isEmpty()) {
            Collection<Journal> journalList = creditNoteJLIList.stream()
                    .distinct()
                    .map(JournalLineItem::getJournal)
                    .collect(Collectors.toList());

            Set<Journal> set = new LinkedHashSet<Journal>(journalList);
            journalList.clear();
            journalList.addAll(set);

            for (Journal journal : journalList) {

                newjournal = new Journal();

                newjournal.setCreatedBy(creditNoteJLIList.get(0).getJournal().getCreatedBy());
                newjournal.setPostingReferenceType(PostingReferenceTypeEnum.REVERSE_DEBIT_NOTE);
                newjournal.setDescription("Reverse Debit Note");
                newjournal.setJournalDate(LocalDate.now());
                newjournal.setTransactionDate(LocalDateTime.now().toLocalDate());

                Collection<JournalLineItem> journalLineItems = journal.getJournalLineItems();
                Collection<JournalLineItem> newReverseJournalLineItemList = new ArrayList<>();

                for (JournalLineItem journalLineItem : journalLineItems) {

                    JournalLineItem newReverseJournalLineItemEntry = new JournalLineItem();

                    newReverseJournalLineItemEntry.setTransactionCategory(journalLineItem.getTransactionCategory());
                    newReverseJournalLineItemEntry.setReferenceType(PostingReferenceTypeEnum.REVERSE_DEBIT_NOTE);
                    newReverseJournalLineItemEntry.setReferenceId(journalLineItem.getReferenceId());
                    newReverseJournalLineItemEntry.setCreatedBy(journalLineItem.getCreatedBy());
                    newReverseJournalLineItemEntry.setCreatedDate(journalLineItem.getCreatedDate());
                    newReverseJournalLineItemEntry.setDescription(journalLineItem.getDescription());
                    newReverseJournalLineItemEntry.setDeleteFlag(journalLineItem.getDeleteFlag());

                    newReverseJournalLineItemEntry.setDebitAmount(journalLineItem.getCreditAmount());
                    newReverseJournalLineItemEntry.setCreditAmount(journalLineItem.getDebitAmount());
                    newReverseJournalLineItemEntry.setJournal(newjournal);
                    newReverseJournalLineItemList.add(newReverseJournalLineItemEntry);
                }
                newjournal.setJournalLineItems(newReverseJournalLineItemList);
            }
        }
        return newjournal;
    }

    public void creditNoteReverseInventoryHandling(PostingRequestModel postingRequestModel, Integer userId){
        CreditNote creditNote = creditNoteRepository.findById(postingRequestModel.getPostingRefId()).get();
        List<CreditNoteLineItem> creditNoteLineItemList = creditNote.getCreditNoteLineItems().stream().collect(Collectors.toList());
        for (CreditNoteLineItem creditNoteLineItem:creditNoteLineItemList){
            Product product=productService.findByPK(creditNoteLineItem.getProduct().getProductID());
            if(product.getIsInventoryEnabled() != null && product.getIsInventoryEnabled() )
            {
                handleReverseCNInventory(creditNoteLineItem,product,userId);
            }
        }
    }
    private void handleReverseCNInventory(CreditNoteLineItem model,Product product,Integer userId) {
        Map<String, Object> relationMap = new HashMap<>();
        relationMap.put(JSON_KEY_CREDIT_NOTE, model.getCreditNote());
        CreditNoteInvoiceRelation creditNoteInvoiceRelation = creditNoteInvoiceRelationService.findByAttributes(relationMap).get(0);
        List<Inventory> inventoryList = inventoryService.getProductByProductId(model.getProduct().getProductID());
        int qtyUpdate=0;
        int remainingQty = model.getQuantity();
        for(Inventory inventory : inventoryList)
        {
            int stockOnHand = inventory.getStockOnHand();
            if(stockOnHand > remainingQty )
            {
                stockOnHand = stockOnHand - remainingQty ;
                qtyUpdate += remainingQty;
                inventory.setQuantitySold(inventory.getQuantitySold()+remainingQty);
                remainingQty -= remainingQty;
                inventory.setStockOnHand(stockOnHand);
            }
            else
            {
                qtyUpdate += stockOnHand;
                remainingQty -= stockOnHand;
                inventory.setStockOnHand(0);
                inventory.setQuantitySold(inventory.getQuantitySold()+stockOnHand);
            }
            inventoryService.update(inventory);
            InventoryHistory inventoryHistory = new InventoryHistory();
            inventoryHistory.setCreatedBy(inventory.getCreatedBy());
            inventoryHistory.setCreatedDate(LocalDateTime.now());
            inventoryHistory.setLastUpdateBy(inventory.getLastUpdateBy());
            inventoryHistory.setLastUpdateDate(LocalDateTime.now());
            inventoryHistory.setTransactionDate(creditNoteInvoiceRelation.getInvoice().getInvoiceDate());
            inventoryHistory.setInventory(inventory);
            inventoryHistory.setInvoice(creditNoteInvoiceRelation.getInvoice());
            inventoryHistory.setProductId(inventory.getProductId());
            inventoryHistory.setUnitCost(inventory.getUnitCost());
            inventoryHistory.setQuantity((float) stockOnHand);
            inventoryHistory.setUnitSellingPrice(model.getUnitPrice().floatValue()*creditNoteInvoiceRelation.getInvoice().getExchangeRate().floatValue());
            inventoryHistory.setSupplierId(inventory.getSupplierId());
            inventoryHistoryService.update(inventoryHistory);

            if(remainingQty==0)
                break;
        }
    }
    public void sendCNRefundMail(Contact contact, Integer invoiceType,String number, String amount, String date, HttpServletRequest request) {
        long millis=System.currentTimeMillis();
//        java.sql.Date date=new java.sql.Date(millis);
        Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
        User user=userService.findByPK(userId);
        String image="";
        String contactName = "";
        if(contact!= null && !contact.getOrganization().isEmpty()){
            contactName = contact.getOrganization();
        }
        else if (contact != null && !contact.getFirstName().isEmpty()) {
            StringBuilder sb = new StringBuilder();
            Contact c = contact;
            if (c.getFirstName() != null && !c.getFirstName().isEmpty()) {
                sb.append(c.getFirstName()).append(" ");
            }
            if (c.getMiddleName() != null && !c.getMiddleName().isEmpty()) {
                sb.append(c.getMiddleName()).append(" ");
            }
            if (c.getLastName() != null && !c.getLastName().isEmpty()) {
                sb.append(c.getLastName());
            }
            contactName = sb.toString();
        }
        if (user.getCompany() != null  && user.getCompany().getCompanyLogo() != null) {
            image = " data:image/jpg;base64," + DatatypeConverter.printBase64Binary(
                    user.getCompany().getCompanyLogo()) ;

        }
        String htmlContent="";
        try {
            byte[] contentData = Files.readAllBytes(Paths.get(resourceLoader.getResource("classpath:"+REFUND_CD_TEMPLATE).getURI()));
            htmlContent= new String(contentData, StandardCharsets.UTF_8).replace("{currency}",contact.getCurrency().getCurrencyIsoCode());
        } catch (IOException e) {
            logger.error("Error processing credit note", e);
        }
        String temp1=htmlContent.replace("{name}", contactName)
                .replace("{date}", date )
                .replace("{amount}",contact.getCurrency().getCurrencyIsoCode()+" "+amount)
                .replace("{companylogo}",image);
        String temp2="";
        switch (invoiceType){
            case 1:
                temp2=temp1.replace(TEMPLATE_PLACEHOLDER_PAYMODE,"Received")
                        .replace(TEMPLATE_PLACEHOLDER_NUMBER,number);
                break;
            case 2:
                temp2=temp1.replace(TEMPLATE_PLACEHOLDER_PAYMODE,"Done")
                        .replace(TEMPLATE_PLACEHOLDER_NUMBER,number);
                break;
            case 7:
                temp2=temp1.replace(TEMPLATE_PLACEHOLDER_PAYMODE,"Refund")
                        .replace(TEMPLATE_PLACEHOLDER_NUMBER,number);
                break;
            default:
                // Unknown invoice type - use original template
                temp2 = temp1;
                break;
        }

        try {
            emailSender.send(contact.getEmail(), "Payment refund information for "+number,temp2,
                    EmailConstant.ADMIN_SUPPORT_EMAIL,
                    EmailConstant.ADMIN_EMAIL_SENDER_NAME, true);
            logger.info("THANK YOU MAIL : "+temp2);
            EmailLogs emailLogs = new EmailLogs();
            emailLogs.setEmailDate(LocalDateTime.now());
            emailLogs.setEmailTo(contact.getEmail());
            emailLogs.setEmailFrom(user.getUserEmail());
            emailLogs.setModuleName("PAYMENT");
            String baseUrl = ServletUriComponentsBuilder.fromRequestUri(request)
                    .replacePath(null)
                    .build()
                    .toUriString();
            System.out.println(baseUrl);
            emailLogs.setBaseUrl(baseUrl);
            emaiLogsService.persist(emailLogs);
        } catch (MessagingException e) {
            logger.error(JSON_KEY_ERROR, e);

        }
    }

    @Transactional(rollbackFor = Exception.class)
    public CreditNote createOrUpdateCreditNote (CreditNoteRequestModel creditNoteRequestModel, Integer userId) {
        CreditNote creditNote = new CreditNote();
        if (Boolean.TRUE.equals(creditNoteRequestModel.getIsCreatedWithoutInvoice())) {
            creditNote = createCNWithoutInvoice(creditNoteRequestModel, userId);
            if (creditNote != null) {
                creditNoteRepository.saveAndFlush(creditNote);
            }
        } else {
            creditNote = getEntity(creditNoteRequestModel, userId);
            creditNote.setCurrency(companyService.getCompanyCurrency());
            creditNoteRepository.saveAndFlush(creditNote);
        }
        if (Boolean.TRUE.equals(creditNoteRequestModel.getCnCreatedOnPaidInvoice())) {
            creditNote.setCnCreatedOnPaidInvoice(creditNoteRequestModel.getCnCreatedOnPaidInvoice());
            Invoice invoice = invoiceService.findByPK(creditNoteRequestModel.getInvoiceId());
            if (invoice != null) {
                invoice.setCnCreatedOnPaidInvoice(creditNoteRequestModel.getCnCreatedOnPaidInvoice());
            }
        }
        return creditNote;
    }

    public void processInvoiceRelation(CreditNoteRequestModel creditNoteRequestModel, CreditNote creditNote, Integer userId) {
        Invoice invoice = invoiceService.findByPK(creditNoteRequestModel.getInvoiceId());
        if (invoice != null) {
            CreditNoteInvoiceRelation relation = new CreditNoteInvoiceRelation();
            relation.setCreatedBy(userId);
            relation.setCreatedDate(LocalDateTime.now());
            relation.setLastUpdateBy(userId);
            relation.setLastUpdateDate(LocalDateTime.now());
            relation.setCreditNote(creditNote);
            relation.setInvoice(invoice);
            creditNoteInvoiceRelationService.persist(relation);
        }
    }
    public Journal handleCreditNoteWithoutProduct(PostingRequestModel postingRequestModel, Integer userId, HttpServletRequest request) {
        Optional<CreditNote> optionalCreditNote = creditNoteRepository.findById(postingRequestModel.getPostingRefId());
        if (optionalCreditNote.isPresent()) {
            CreditNote creditNote = optionalCreditNote.get();
            Journal journal = cnPostingWithoutInvoiceWithoutProduct(postingRequestModel, userId);
            if (journal != null) {
                journalService.persist(journal);
            }
            if (creditNote.getInvoiceId() != null) {
                Invoice invoice = invoiceService.findByPK(creditNote.getInvoiceId());
                if (creditNote.getType() == 7) {
                    invoiceRestHelper.sendCN(invoice, userId, postingRequestModel, request, creditNote);
                }
            }
            return journal;
        }
        return null;
    }

    public Journal handlePostingAndUpdateStatus(PostingRequestModel postingRequestModel, Integer userId, HttpServletRequest request) {
        Journal journal = null;
        if (PostingReferenceTypeEnum.CREDIT_NOTE.name().equalsIgnoreCase(postingRequestModel.getPostingRefType()) ||
                PostingReferenceTypeEnum.DEBIT_NOTE.name().equalsIgnoreCase(postingRequestModel.getPostingRefType())) {
            journal = creditNotePosting(postingRequestModel, userId);
        }
        Optional<CreditNote> optionalCreditNote = creditNoteRepository.findById(postingRequestModel.getPostingRefId());
        if (optionalCreditNote.isPresent()) {
            CreditNote creditNote = optionalCreditNote.get();
            if (PostingReferenceTypeEnum.CREDIT_NOTE.name().equalsIgnoreCase(postingRequestModel.getPostingRefType()) ||
                    PostingReferenceTypeEnum.DEBIT_NOTE.name().equalsIgnoreCase(postingRequestModel.getPostingRefType())) {
                creditNote.setStatus(CommonStatusEnum.OPEN.getValue());
                if (Boolean.FALSE.equals(postingRequestModel.getMarkAsSent()) && creditNote.getInvoiceId() != null) {
                    Invoice invoice = invoiceService.findByPK(creditNote.getInvoiceId());
                    if (creditNote.getType() == 7) {
                        invoiceRestHelper.sendCN(invoice, userId, postingRequestModel, request, creditNote);
                    }
                }
                creditNoteRepository.save(creditNote);
            }
        }
        return journal;
    }

}
