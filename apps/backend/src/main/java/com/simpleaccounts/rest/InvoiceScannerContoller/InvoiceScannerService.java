package com.simpleaccounts.rest.InvoiceScannerContoller;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;

import com.simpleaccounts.constant.*;
import com.simpleaccounts.dao.CurrencyDao;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.helper.DateFormatHelper;
import com.simpleaccounts.repository.UnitTypesRepository;
import com.simpleaccounts.rest.creditnotecontroller.CreditNoteRepository;
import com.simpleaccounts.rest.customizeinvoiceprefixsuffixccontroller.CustomizeInvoiceTemplateService;
import com.simpleaccounts.rest.expensescontroller.ExpenseModel;
import com.simpleaccounts.rest.invoicecontroller.InvoiceLineItemModel;
import com.simpleaccounts.rest.invoicecontroller.InvoiceRequestModel;
import com.simpleaccounts.rest.invoicecontroller.InvoiceRestHelper;
import com.simpleaccounts.service.*;
import com.simpleaccounts.utils.*;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import javax.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ServerErrorException;

import javax.persistence.EntityManager;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.*;

@Service
@RequiredArgsConstructor
public class InvoiceScannerService {

    private static final String JSON_KEY_AMOUNT_DUE = "AmountDue";
    private static final String JSON_KEY_CURRENCY_CODE = "currency_code";
    private static final String JSON_KEY_AMOUNT = "amount";
    private static final String JSON_KEY_CURRENCY_ISO_CODE = "currencyIsoCode";
    private static final String JSON_KEY_BILLING_ADDRESS = "BillingAddress";

    private final PaymentRepository paymentRepository;

    private final CurrencyConversionRepository currencyConversionRepository;

    private final ReceiptRepository receiptRepository;

    private final CreditNoteRepository creditNoteRepository;
    private final Logger logger = LoggerFactory.getLogger(InvoiceRestHelper.class);
    SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
    private final VatCategoryService vatCategoryService;

    private final EntityManager entityManager;
    private final ProjectService projectService;

    private final ResourceLoader resourceLoader;
    private final ContactService contactService;

    private final CurrencyService currencyService;

    private final InvoiceLineItemService invoiceLineItemService;

    private final InvoiceService invoiceService;

    private final FileHelper fileHelper;

    private final MailUtility mailUtility;

    private final EmaiLogsService emaiLogsService;

    private final UserService userService;

    private final DateUtils dateUtils;

    private final ProductService productService;

    private final TransactionCategoryService transactionCategoryService;

    private final DateFormatUtil dateFormtUtil;

    private final CurrencyExchangeService currencyExchangeService;

    private final PlaceOfSupplyService placeOfSupplyService;

    private final CustomizeInvoiceTemplateService customizeInvoiceTemplateService;

    private final InvoiceNumberUtil invoiceNumberUtil;

    private final InventoryService inventoryService;

    private final InventoryHistoryService inventoryHistoryService;

    private final ProductLineItemService productLineItemService;

    private final CreditNoteInvoiceRelationService creditNoteInvoiceRelationService;

    private final ExciseTaxService exciseTaxService;

    private int size;

    private final  CompanyService companyService;

    private final  CountryService countryService;

    private final StateService stateService;
    private final UnitTypesRepository unitTypesRepository;

    private final  ContactTransactionCategoryService contactTransactionCategoryService;

    private final DateFormatHelper dateFormatHelper;
    private final ExpenseService expenseService;

    private final TaxTreatmentService taxTreatmentService;
    private final EmployeeService employeeService;
    private final BankAccountService bankAccountService;

    private final CurrencyDao currencyDao;

    @Transactional(rollbackFor = Exception.class)
    public Invoice getEntity(InvoiceRequestModel invoiceModel, Integer userId,  List<InvoiceLineItemModel> itemModels) {
        Invoice invoice = new Invoice();

        if (invoiceModel.getInvoiceId() != null) {
            invoice = invoiceService.findByPK(invoiceModel.getInvoiceId());
            if (invoice.getInvoiceLineItems() != null) {
                invoiceLineItemService.deleteByInvoiceId(invoiceModel.getInvoiceId());
            }
            // If invoice is paid cannot update
            if (invoice.getStatus() > CommonStatusEnum.APPROVED.getValue())
                throw new ServerErrorException("Cannot Update Paid Invoice.");
        }

        if (invoiceModel.getPlaceOfSupplyId() !=null){
            PlaceOfSupply placeOfSupply = placeOfSupplyService.findByPK(invoiceModel.getPlaceOfSupplyId());
            invoice.setPlaceOfSupplyId(placeOfSupply);
        }
        if(invoiceModel.getFootNote()!=null){
            invoice.setFootNote(invoiceModel.getFootNote());
        }
        if (invoiceModel.getTotalAmount() != null) {
            invoice.setTotalAmount(invoiceModel.getTotalAmount());
        }
        if (invoiceModel.getReceiptNumber() != null) {
            invoice.setReceiptNumber(invoiceModel.getReceiptNumber());
        }
        if (invoiceModel.getExchangeRate()!=null){
            invoice.setExchangeRate(invoiceModel.getExchangeRate());
        }
        if (invoiceModel.getTotalVatAmount() != null) {
            invoice.setTotalVatAmount(invoiceModel.getTotalVatAmount());
        }
        if (invoiceModel.getTaxType()!=null){
            invoice.setTaxType(invoiceModel.getTaxType());
        }
        if (invoiceModel.getTotalExciseAmount()!=null){
            invoice.setTotalExciseAmount(invoiceModel.getTotalExciseAmount());
        }
        if (invoiceModel.getIsReverseChargeEnabled()!=null) {
            invoice.setIsReverseChargeEnabled(invoiceModel.getIsReverseChargeEnabled());
        }
        invoice.setReferenceNumber(invoiceModel.getReferenceNumber());
        if(Boolean.TRUE.equals(invoiceModel.getChangeShippingAddress())){
            invoice.setChangeShippingAddress(invoiceModel.getChangeShippingAddress());
            invoice.setShippingAddress(invoiceModel.getShippingAddress());
            invoice.setShippingCountry(countryService.getCountry(invoiceModel.getShippingCountry()));
            invoice.setShippingState(stateService.findByPK(invoiceModel.getShippingState()));
            invoice.setShippingCity(invoiceModel.getShippingCity());
            invoice.setShippingPostZipCode(invoiceModel.getShippingPostZipCode());
            invoice.setShippingTelephone(invoiceModel.getShippingTelephone());
            invoice.setShippingFax(invoiceModel.getShippingFax());
        }else
            invoice.setChangeShippingAddress(invoiceModel.getChangeShippingAddress());
        if (invoiceModel.getDueAmount()==null){
            invoice.setDueAmount(invoiceModel.getTotalAmount());
        }
        else invoice.setDueAmount(invoiceModel.getTotalAmount());

        /**
         * @see ContactTypeEnum
         */
        if (invoiceModel.getType() != null && !invoiceModel.getType().isEmpty()) {
            Integer invoiceType=Integer.parseInt(invoiceModel.getType());
            invoice.setType(invoiceType);
            CustomizeInvoiceTemplate template = customizeInvoiceTemplateService.getInvoiceTemplate(invoiceType);

            String suffix=invoiceNumberUtil.fetchSuffixFromString(invoiceModel.getReferenceNumber());
            template.setSuffix(Integer.parseInt(suffix));
            String prefix= invoice.getReferenceNumber().substring(0,invoice.getReferenceNumber().lastIndexOf(suffix));
            template.setPrefix(prefix);
            customizeInvoiceTemplateService.persist(template);

        }
        if (invoiceModel.getProjectId() != null) {
            Project project = projectService.findByPK(invoiceModel.getProjectId());
            invoice.setProject(project);
        }
        if (invoiceModel.getContactId() != null) {
            Contact contact = contactService.findByPK(invoiceModel.getContactId());
            invoice.setContact(contact);
        }
        try {

            Date date = dateFormat.parse(invoiceModel.getDate());
            LocalDate invoiceDate = dateFormatHelper.convertToLocalDateViaSqlDate(date);
            invoice.setInvoiceDate(invoiceDate);

            Date dueDate = dateFormat.parse(invoiceModel.getDueDate());
            LocalDate invoiceDueDate = dateFormatHelper.convertToLocalDateViaSqlDate(dueDate);
            invoice.setInvoiceDueDate(invoiceDueDate);

        }
        catch (Exception e){
            logger.error("Error parsing date", e);
        }

        if (invoiceModel.getCurrencyCode() != null) {
            Currency currency = currencyService.findByPK(invoiceModel.getCurrencyCode());
            invoice.setCurrency(currency);
        }
        lineItemString(userId, invoice, itemModels);
        if (invoiceModel.getTaxIdentificationNumber() != null) {
            invoice.setTaxIdentificationNumber(invoiceModel.getTaxIdentificationNumber());
        }
        invoice.setContactPoNumber(invoiceModel.getContactPoNumber());
        invoice.setReceiptAttachmentDescription(invoiceModel.getReceiptAttachmentDescription());
        invoice.setNotes(invoiceModel.getNotes());
        invoice.setDiscountType(invoiceModel.getDiscountType());
        invoice.setDiscount(invoiceModel.getDiscount());
        invoice.setStatus(invoice.getId() == null ? CommonStatusEnum.PENDING.getValue() : invoice.getStatus());
        if (invoiceModel.getDiscountPercentage() != null){
            invoice.setDiscountPercentage(invoiceModel.getDiscountPercentage());
        }

        invoice.setInvoiceDuePeriod(invoiceModel.getTerm());
        invoice.setGeneratedByScan(Boolean.TRUE);

        return invoice;
    }
    private void lineItemString( Integer userId, Invoice invoice,
                                List<InvoiceLineItemModel> itemModels) {
            if (!itemModels.isEmpty()) {
                List<InvoiceLineItem> invoiceLineItemList = getLineItems(itemModels, invoice, userId);
                invoice.setInvoiceLineItems(invoiceLineItemList);
            }
        }
    public List<InvoiceLineItem>
    getLineItems(List<InvoiceLineItemModel> itemModels, Invoice invoice, Integer userId) {
        List<InvoiceLineItem> lineItems = new ArrayList<>();
        for (InvoiceLineItemModel model : itemModels) {
            try {
                InvoiceLineItem lineItem = new InvoiceLineItem();
                lineItem.setCreatedBy(userId);
                lineItem.setCreatedDate(LocalDateTime.now());
                lineItem.setDeleteFlag(false);
                lineItem.setQuantity(model.getQuantity());
                lineItem.setDescription(model.getDescription());
                lineItem.setUnitPrice(model.getUnitPrice());
                lineItem.setSubTotal(model.getSubTotal());
                if(model.getUnitType()!=null)
                    lineItem.setUnitType(model.getUnitType());
                if(model.getUnitTypeId()!=null)
                    lineItem.setUnitTypeId(unitTypesRepository.findById(model.getUnitTypeId()).orElse(null));
                if (model.getExciseTaxId()!=null){
                    lineItem.setExciseCategory(exciseTaxService.getExciseTax(model.getExciseTaxId()));
                }
                if (model.getExciseAmount()!=null){
                    lineItem.setExciseAmount(model.getExciseAmount());
                }
                if (model.getVatCategoryId() != null) {
                    lineItem.setVatCategory(vatCategoryService.findByPK(Integer.parseInt(model.getVatCategoryId())));
                }
                if (model.getVatAmount()!=null){
                    lineItem.setVatAmount(model.getVatAmount());
                }
                if (model.getDiscount()!=null){
                    lineItem.setDiscount(model.getDiscount());
                }
                if (model.getDiscountType()!=null){
                    lineItem.setDiscountType(model.getDiscountType());
                }
                lineItem.setInvoice(invoice);
                if (model.getProductId() != null)
                    lineItem.setProduct(productService.findByPK(model.getProductId()));
                Map<String, Object> attribute = new HashMap<String, Object>();
                attribute.put("product", lineItem.getProduct());
                if (invoice.getType()==2) {
                    attribute.put("priceType", ProductPriceType.SALES);
                }
                else {
                    attribute.put("priceType",ProductPriceType.PURCHASE);
                }
                if (invoice.getType().equals(2)) {
                    List<ProductLineItem> productLineItemList = productLineItemService.findByAttributes(attribute);
                    for (ProductLineItem productLineItem : productLineItemList) {
                        if (productLineItemList != null) {
                            lineItem.setTrnsactioncCategory(productLineItem.getTransactioncategory());
                        }
                    }
                }
                else {
                    lineItem.setTrnsactioncCategory(transactionCategoryService.findByPK(model.getTransactionCategoryId()));
                }

                lineItems.add(lineItem);
            } catch (Exception e) {
                logger.error("Error", e);
                return new ArrayList<>();
            }
        }
        return lineItems;
    }

    public Expense getExpenseEntity(ExpenseModel model) {
        Expense expense = new Expense();
        expense.setStatus(ExpenseStatusEnum.DRAFT.getValue());
        if (model.getExpenseId() != null) {
            expense = expenseService.findByPK(model.getExpenseId());
        }
        CustomizeInvoiceTemplate template = customizeInvoiceTemplateService.getInvoiceTemplate(10);
        expense.setExpenseNumber(model.getExpenseNumber());
        if (model.getExpenseNumber()!=null  ) {
            String suffix = invoiceNumberUtil.fetchSuffixFromString(model.getExpenseNumber());
            template.setSuffix(Integer.parseInt(suffix));
            String prefix = expense.getExpenseNumber().substring(0, expense.getExpenseNumber().lastIndexOf(suffix));
            template.setPrefix(prefix);
            customizeInvoiceTemplateService.persist(template);
        }
        if (model.getTaxTreatmentId()!=null){
            expense.setTaxTreatment(taxTreatmentService.getTaxTreatment(model.getTaxTreatmentId()));
        }
        if (model.getPlaceOfSupplyId()!=null){
            expense.setPlaceOfSupplyId(placeOfSupplyService.findByPK(model.getPlaceOfSupplyId()));
        }
        expense.setIsReverseChargeEnabled(model.getIsReverseChargeEnabled());
        expense.setExpenseType(model.getExpenseType());
        expense.setVatClaimable(model.getIsVatClaimable());

        Expense.ExpenseBuilder expenseBuilder = expense.toBuilder();
        if (model.getPayee() != null && !model.getPayee().isEmpty() && !model.getPayee().equalsIgnoreCase("undefined") ) {
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
        if (model.getCurrencyCode() != null) {
            expenseBuilder.currency(currencyService.findByPK(model.getCurrencyCode()));
        }
        if (model.getExpenseVatAmount() != null) {
            expenseBuilder.expenseVatAmount(model.getExpenseVatAmount());
        }
        if (model.getExchangeRate()!=null){
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
        if (model.getVatCategoryId() != null) {
            VatCategory vatCategory = vatCategoryService.findByPK(model.getVatCategoryId());
            expenseBuilder.vatCategory(vatCategory);
            BigDecimal vatPercent =  vatCategory.getVat();
            BigDecimal vatAmount = BigDecimal.ZERO;
            if (Boolean.TRUE.equals(model.getExclusiveVat())){
                vatAmount = calculateVatAmount(vatPercent,model.getExpenseAmount());
            }
            else {
                vatAmount = calculateActualVatAmount(vatPercent,model.getExpenseAmount());
            }
            expenseBuilder.expenseVatAmount(vatAmount);
        }
        if(model.getPayMode()!=null){
            expenseBuilder.payMode(model.getPayMode());
        }

        if (model.getBankAccountId() != null) {
            expenseBuilder.bankAccount(bankAccountService.findByPK(model.getBankAccountId()));
        }
        if(model.getDelivaryNotes()!=null)
            expenseBuilder.notes(model.getDelivaryNotes());

        return expenseBuilder.build();
    }
    public BigDecimal calculateVatAmount(BigDecimal vatPercent, BigDecimal expenseAmount) {
        float vatPercentFloat = vatPercent.floatValue();
        return BigDecimal.valueOf(expenseAmount.floatValue() * (vatPercentFloat/100));
    }
    private BigDecimal calculateActualVatAmount(BigDecimal vatPercent, BigDecimal expenseAmount) {
        float vatPercentFloat = vatPercent.floatValue();
        float expenseAmountFloat = expenseAmount.floatValue()*vatPercentFloat /(100+vatPercentFloat);
        return BigDecimal.valueOf(expenseAmountFloat);
    }
    public InvoiceRequestModel getModel(InvoiceRequestModel model, JsonNode json){

        if(json.get(0) != null) {
            if (json.get(0).get(JSON_KEY_AMOUNT_DUE) != null) {
                if(json.get(0).get(JSON_KEY_AMOUNT_DUE).get(JSON_KEY_AMOUNT) != null) {
                    model.setDueAmount(json.get(0).get(JSON_KEY_AMOUNT_DUE).get(JSON_KEY_AMOUNT).decimalValue());
                }
                if(json.get(0).get(JSON_KEY_AMOUNT_DUE).get(JSON_KEY_CURRENCY_CODE) != null) {
                    model.setCurrencyIsoCode(json.get(0).get(JSON_KEY_AMOUNT_DUE).get(JSON_KEY_CURRENCY_CODE).textValue());
                }
                Map<String, Object> param = new HashMap<>();
                param.put(JSON_KEY_CURRENCY_ISO_CODE,json.get(0).get(JSON_KEY_AMOUNT_DUE).get(JSON_KEY_CURRENCY_CODE).textValue());
                List<Currency> currencyList = currencyDao.findByAttributes(param);
                if( currencyList != null && !currencyList.isEmpty()){
                    model.setCurrencyCode(currencyList.get(0).getCurrencyCode());
                }
            }
        }
        return model;
    }

}
