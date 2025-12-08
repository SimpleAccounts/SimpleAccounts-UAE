package com.simpleaccounts.rfq_po;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.constant.*;
import com.simpleaccounts.dao.MailThemeTemplates;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.repository.UnitTypesRepository;
import com.simpleaccounts.rest.PostingRequestModel;
import com.simpleaccounts.rest.customizeinvoiceprefixsuffixccontroller.CustomizeInvoiceTemplateService;
import com.simpleaccounts.service.*;
import com.simpleaccounts.utils.DateFormatUtil;
import com.simpleaccounts.utils.InvoiceNumberUtil;
import com.simpleaccounts.utils.MailUtility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import javax.servlet.http.HttpServletRequest;
import javax.xml.bind.DatatypeConverter;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

import static com.simpleaccounts.rest.invoicecontroller.HtmlTemplateConstants.*;


@Component
public class PoQuatationRestHelper {
    private static final String dateFormat = "dd-MM-yyyy";
    final Logger logger = LoggerFactory.getLogger(PoQuatationRestHelper.class);
    private static final String ERROR_PROCESSING_QUOTATION = "Error processing quotation";
    @PersistenceContext
    private EntityManager entityManager;
    @Autowired
    private DateFormatUtil dateFormtUtil;
    @Autowired
    ResourceLoader resourceLoader;
    @Autowired
    private ContactService contactService;

    @Autowired
    private ProductService productService;

    @Autowired
    private VatCategoryService vatCategoryService;

    @Autowired
    private PoQuatationLineItemService poQuatationLineItemService;

    @Autowired
    private MailUtility mailUtility;

    @Autowired
    private ConfigurationService configurationService;

    @Autowired
    private UserService userService;

    @Autowired
   private CustomizeInvoiceTemplateService customizeInvoiceTemplateService;

    @Autowired
    InvoiceNumberUtil invoiceNumberUtil;

    @Autowired
    PoQuatationService poQuatationService;

    @Autowired
    private CurrencyExchangeService currencyExchangeService;

    @Autowired
    private PlaceOfSupplyService placeOfSupplyService;

    @Autowired
    private TransactionCategoryService transactionCategoryService;

    @Autowired
    private RfqPoGrnInvoiceRelationDao rfqPoGrnInvoiceRelationDao;

    @Autowired
    private CurrencyService currencyService;

    @Autowired
    private ExciseTaxService exciseTaxService;

    @Autowired
    private EmaiLogsService emaiLogsService;

    @Autowired
    private UnitTypesRepository unitTypesRepository;
    @Transactional(rollbackFor = Exception.class)
    public PoQuatation getRfqEntity(PoQuatationRequestModel requestModel, Integer userId) {
        PoQuatation poQuatation = new PoQuatation();
        if (requestModel.getId() != null) {
            poQuatation = poQuatationService.findByPK(requestModel.getId());
        }
            if (poQuatation.getPoQuatationLineItems() != null) {
                poQuatationLineItemService.deleteByRfqId(requestModel.getId());
            }
        poQuatation.setCreatedBy(userId);
        poQuatation.setCreatedDate(LocalDateTime.now());
        poQuatation.setDeleteFlag(false);
        Integer poType =Integer.parseInt(requestModel.getType());
        poQuatation.setType(poType);
        CustomizeInvoiceTemplate template = customizeInvoiceTemplateService.getInvoiceTemplate(poType);
        String suffix=invoiceNumberUtil.fetchSuffixFromString(requestModel.getRfqNumber());
        template.setSuffix(Integer.parseInt(suffix));
        String prefix= requestModel.getRfqNumber().substring(0,requestModel.getRfqNumber().lastIndexOf(suffix));
        template.setPrefix(prefix);
        customizeInvoiceTemplateService.persist(template);
        poQuatation.setRfqNumber(requestModel.getRfqNumber());
        poQuatation.setReferenceNumber(requestModel.getReceiptNumber()!=null?requestModel.getReceiptNumber():"");
        if (requestModel.getRfqReceiveDate() != null) {
            Instant instant = Instant.ofEpochMilli(requestModel.getRfqReceiveDate().getTime());
            LocalDateTime rfqRecvDate = LocalDateTime.ofInstant(instant,
                    ZoneId.systemDefault());
           poQuatation.setRfqReceiveDate(rfqRecvDate);
        }
        if (requestModel.getRfqExpiryDate() != null) {
            Instant instant = Instant.ofEpochMilli(requestModel.getRfqExpiryDate().getTime());
            LocalDateTime rfqExpDate = LocalDateTime.ofInstant(instant,
                    ZoneId.systemDefault());
        poQuatation.setRfqExpiryDate(rfqExpDate);
        }
        if (requestModel.getCurrencyCode()!=null){
            Currency currency= currencyService.findByPK(requestModel.getCurrencyCode());
            poQuatation.setCurrency(currency);
        }
        if (requestModel.getSupplierId() != null) {
            Contact contact = contactService.findByPK(requestModel.getSupplierId());
            poQuatation.setSupplierId(contact);
        }
        if (requestModel.getTotalAmount() != null) {
            poQuatation.setTotalAmount(requestModel.getTotalAmount());
        }
        if (requestModel.getPlaceOfSupplyId() !=null){
            PlaceOfSupply placeOfSupply = placeOfSupplyService.findByPK(requestModel.getPlaceOfSupplyId());
            poQuatation.setPlaceOfSupplyId(placeOfSupply);
        }
        if (requestModel.getTotalVatAmount() != null) {
            poQuatation.setTotalVatAmount(requestModel.getTotalVatAmount());
        }
        poQuatation.setDiscount(requestModel.getDiscount()!=null?requestModel.getDiscount():BigDecimal.ZERO);
        if (requestModel.getTaxType()!=null){
          poQuatation.setTaxType(requestModel.getTaxType());
        }
        if (requestModel.getTotalExciseAmount() != null) {
            poQuatation.setTotalExciseAmount(requestModel.getTotalExciseAmount());
        }
        poQuatation.setStatus(poQuatation.getId() == null ? CommonStatusEnum.PENDING.getValue() : poQuatation.getStatus());
        poQuatation.setId(requestModel.getId());
        if (requestModel.getNotes()!=null){
            poQuatation.setNotes(requestModel.getNotes());
        }
        List<PoQuatationLineItemRequestModel> itemModels = new ArrayList<>();
        lineItemString(requestModel, userId, poQuatation, itemModels);

        return poQuatation;
    }
    private void lineItemString(PoQuatationRequestModel requestModel, Integer userId, PoQuatation poQuatation,
                                List<PoQuatationLineItemRequestModel> itemModels) {
        if (requestModel.getLineItemsString() != null && !requestModel.getLineItemsString().isEmpty()) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                itemModels = mapper.readValue(requestModel.getLineItemsString(),
                        new TypeReference<List<PoQuatationLineItemRequestModel>>() {
                        });
            } catch (IOException ex) {
               logger.error("Error", ex);
            }
            if (!itemModels.isEmpty()) {
                List<PoQuatationLineItem> poQuatationLineItemList =  getLineItems(itemModels, poQuatation);
                poQuatation.setPoQuatationLineItems(poQuatationLineItemList);
            }
        }
    }
    public PoQuatation getPoEntity(PoQuatationRequestModel requestModel, Integer userId) {
        PoQuatation poQuatation = null;
        if (requestModel.getId() != null) {
            poQuatation = poQuatationService.findByPK(requestModel.getId());
        }
        else{
            poQuatation=new PoQuatation();
        }
        if (poQuatation.getPoQuatationLineItems() != null) {
            poQuatationLineItemService.deleteByRfqId(requestModel.getId());
        }

        if (requestModel.getNotes()!=null){
            poQuatation.setNotes(requestModel.getNotes());
        }
        poQuatation.setCreatedBy(userId);
        poQuatation.setCreatedDate(LocalDateTime.now());
        poQuatation.setDeleteFlag(false);
        if (requestModel.getSupplierReferenceNumber()!=null){
            poQuatation.setReferenceNumber(requestModel.getSupplierReferenceNumber());
        }
        if (requestModel.getPoNumber() != null) {
            poQuatation.setPoNumber(requestModel.getPoNumber());
        }
        if (requestModel.getCurrencyCode()!=null){
            Currency currency = currencyService.findByPK(requestModel.getCurrencyCode());
            poQuatation.setCurrency(currency);
        }
        Integer poType =Integer.parseInt(requestModel.getType());
        poQuatation.setType(poType);
        CustomizeInvoiceTemplate template = customizeInvoiceTemplateService.getInvoiceTemplate(poType);
        String suffix=invoiceNumberUtil.fetchSuffixFromString(requestModel.getPoNumber());
        template.setSuffix(Integer.parseInt(suffix));
        String prefix= requestModel.getPoNumber().substring(0,requestModel.getPoNumber().lastIndexOf(suffix));
        template.setPrefix(prefix);
        if (requestModel.getPoApproveDate() != null) {
            Instant instant = Instant.ofEpochMilli(requestModel.getPoApproveDate().getTime());
            LocalDateTime poApproveDate = LocalDateTime.ofInstant(instant,
                    ZoneId.systemDefault());
            poQuatation.setPoApproveDate(poApproveDate);
        }
        if (requestModel.getPoReceiveDate() != null) {
            Instant instant = Instant.ofEpochMilli(requestModel.getPoReceiveDate().getTime());
            LocalDateTime poReceiveDate = LocalDateTime.ofInstant(instant,
                    ZoneId.systemDefault());
            poQuatation.setPoReceiveDate(poReceiveDate);
        }
        if (requestModel.getPlaceOfSupplyId() !=null){
            PlaceOfSupply placeOfSupply = placeOfSupplyService.findByPK(requestModel.getPlaceOfSupplyId());
            poQuatation.setPlaceOfSupplyId(placeOfSupply);
        }
        if (requestModel.getTaxType()!=null){
            poQuatation.setTaxType(requestModel.getTaxType());
        }
        poQuatation.setDiscount(requestModel.getDiscount()!=null?requestModel.getDiscount():BigDecimal.ZERO);
        if (requestModel.getTotalExciseAmount() != null) {
            poQuatation.setTotalExciseAmount(requestModel.getTotalExciseAmount());
        }
        if (requestModel.getSupplierId() != null) {
            Contact contact = contactService.findByPK(requestModel.getSupplierId());
            poQuatation.setSupplierId(contact);
        }
        if (requestModel.getTotalAmount() != null) {
            poQuatation.setTotalAmount(requestModel.getTotalAmount());
        }
        if (requestModel.getTotalVatAmount() != null) {
            poQuatation.setTotalVatAmount(requestModel.getTotalVatAmount());
        }
        poQuatation.setStatus(poQuatation.getId() == null ? CommonStatusEnum.PENDING.getValue() : poQuatation.getStatus());
        List<PoQuatationLineItemRequestModel> itemModels = new ArrayList<>();
        lineItemString(requestModel, userId, poQuatation, itemModels);

        return poQuatation;
    }
    public PoQuatation getGoodsReceiveNotesEntity(PoQuatationRequestModel poQuatationRequestModel, Integer userId) {
        PoQuatation poQuatation = new PoQuatation();
        if (poQuatationRequestModel.getId() != null) {
            poQuatation = poQuatationService.findByPK(poQuatationRequestModel.getId());
        }
        if (poQuatation.getPoQuatationLineItems() != null) {
            poQuatationLineItemService.deleteByRfqId(poQuatationRequestModel.getId());
        }
        poQuatation.setCreatedBy(userId);
        poQuatation.setCreatedDate(LocalDateTime.now());
        poQuatation.setDeleteFlag(false);
        Contact contact = contactService.findByPK(poQuatationRequestModel.getSupplierId());
        poQuatation.setSupplierId(contact);

        if (poQuatationRequestModel.getPoNumber() != null) {
            poQuatation.setPoNumber(poQuatationRequestModel.getPoNumber());
        }

        if (poQuatationRequestModel.getNotes()!=null){
            poQuatation.setNotes(poQuatationRequestModel.getNotes());
        }
        if (poQuatationRequestModel.getSupplierReferenceNumber()!=null){
            poQuatation.setReferenceNumber(poQuatationRequestModel.getSupplierReferenceNumber());
        }
        if (poQuatationRequestModel.getCurrencyCode()!=null){
            Currency currency = currencyService.findByPK(poQuatationRequestModel.getCurrencyCode());
            poQuatation.setCurrency(currency);
        }
        Instant instant = Instant.ofEpochMilli(poQuatationRequestModel.getGrnReceiveDate().getTime());
        LocalDateTime grnReceiveDate = LocalDateTime.ofInstant(instant,
                ZoneId.systemDefault());
        poQuatation.setGrnReceiveDate(grnReceiveDate);
        poQuatation.setGrnRemarks(poQuatationRequestModel.getGrnRemarks());
        poQuatation.setStatus(poQuatation.getId() == null ? CommonStatusEnum.PENDING.getValue() : poQuatation.getStatus());
        Integer poType =Integer.parseInt(poQuatationRequestModel.getType());
        poQuatation.setType(poType);
        poQuatation.setGrnNumber(poQuatationRequestModel.getGrnNumber());
        CustomizeInvoiceTemplate template = customizeInvoiceTemplateService.getInvoiceTemplate(poType);
        String suffix=invoiceNumberUtil.fetchSuffixFromString(poQuatationRequestModel.getGrnNumber());
        template.setSuffix(Integer.parseInt(suffix));
        String prefix=poQuatationRequestModel.getGrnNumber().substring(0,poQuatationRequestModel.getGrnNumber().lastIndexOf(suffix));
        template.setPrefix(prefix);
        poQuatation.setTotalAmount(poQuatationRequestModel.getTotalAmount());
        poQuatation.setTotalVatAmount(poQuatationRequestModel.getTotalVatAmount());
        poQuatation.setTotalExciseAmount(poQuatationRequestModel.getTotalExciseAmount());
        List<PoQuatationLineItemRequestModel> itemModels = new ArrayList<>();
        lineItemString(poQuatationRequestModel, userId, poQuatation, itemModels);
        return poQuatation;
    }
    public List<PoQuatationLineItem> getLineItems(List<PoQuatationLineItemRequestModel> modelList, PoQuatation poQuatation) {
        List<PoQuatationLineItem> listItems = new ArrayList<>();

        for (PoQuatationLineItemRequestModel model : modelList) {
            PoQuatationLineItem poQuatationLineItem = new PoQuatationLineItem();
            poQuatationLineItem.setCreatedBy(poQuatation.getCreatedBy());
            poQuatationLineItem.setCreatedDate(LocalDateTime.now());
            poQuatationLineItem.setDeleteFlag(false);
            switch(poQuatation.getType()){
                case 3:
                case 4:
                    poQuatationLineItem.setDiscount(BigDecimal.ZERO);
                    // fall through to case 6 for quantity setting
                case 6:
                    if (model.getQuantity() != null) {
                        poQuatationLineItem.setQuantity(model.getQuantity());
                    }
                    break;
                case 5:
                     poQuatationLineItem.setQuantity(model.getGrnReceivedQuantity());
                    poQuatationLineItem.setRemainingQuantity(model.getQuantity());
                break;
                default:
            }
            if (model.getExciseTaxId()!=null){
                poQuatationLineItem.setExciseCategory(exciseTaxService.getExciseTax(model.getExciseTaxId()));
            }
            if (model.getExciseAmount()!=null){
                poQuatationLineItem.setExciseAmount(model.getExciseAmount());
            }
            if (model.getVatAmount()!=null){
                poQuatationLineItem.setVatAmount(model.getVatAmount());
            }
            if (model.getDiscount()!=null){
                poQuatationLineItem.setDiscount(model.getDiscount());
            }
            if (model.getDiscountType()!=null){
                poQuatationLineItem.setDiscountType(model.getDiscountType());
            }
            if (model.getRemainingQuantity()!=null){
                poQuatationLineItem.setRemainingQuantity(model.getRemainingQuantity());
            }
            if (model.getUnitPrice() != null) {
                poQuatationLineItem.setUnitCost(model.getUnitPrice());
            }
            if (model.getProductId() != null) {
                Product product = productService.findByPK(model.getProductId());
                poQuatationLineItem.setProduct(product);
            }
            if (model.getDescription() != null) {
                poQuatationLineItem.setDescription(model.getDescription());
            }
            if (model.getSubTotal() != null) {
                poQuatationLineItem.setSubTotal(model.getSubTotal());
            }
            if (model.getVatCategoryId() != null) {
                VatCategory vatCategory = vatCategoryService.findByPK(Integer.parseInt(model.getVatCategoryId()));
                poQuatationLineItem.setVatCategory(vatCategory);
            }
            if (model.getTransactionCategoryId()!=null){
                poQuatationLineItem.setTrnsactioncCategory(transactionCategoryService.findByPK(model.getTransactionCategoryId()));
            }
            if(model.getUnitType() != null)
                poQuatationLineItem.setUnitType(model.getUnitType());
            if (model.getUnitTypeId() != null)
                poQuatationLineItem.setUnitTypeId(unitTypesRepository.findById(model.getUnitTypeId()).get());
            poQuatationLineItem.setPoQuatation(poQuatation);
            listItems.add(poQuatationLineItem);
        }
        //this will update the remaining quantity for Purchase Order
        if (poQuatation.getType()==4 && poQuatation.getPoQuatationLineItems()!=null) {
            int index = 0;
            for (PoQuatationLineItem poQuatationLineItem : poQuatation.getPoQuatationLineItems()) {
                PoQuatationLineItemRequestModel model = modelList.get(index++);
                poQuatationLineItem.setRemainingQuantity(poQuatationLineItem.getRemainingQuantity() - model.getGrnReceivedQuantity());
            }
            poQuatationService.update(poQuatation);
        }

        return listItems;
    }
    public void sendRfq(PoQuatation poQuatation, Integer userId,PostingRequestModel postingRequestModel,HttpServletRequest request) {
        String subject = "";
        String body = "";
        String quertStr = "SELECT m FROM MailThemeTemplates m WHERE m.moduleId=3 and m.templateEnable=true";

        Query query = entityManager.createQuery(quertStr);

        MailThemeTemplates rfqEmailBody =(MailThemeTemplates) query.getSingleResult();
        Contact contact = poQuatation.getSupplierId();

        Map<String, String> map = getRfqData(poQuatation, userId);
        String content = "";
        String htmlText="";
        String htmlContent="";
        try {
            String emailBody=rfqEmailBody.getPath();
            byte[] bodyData = Files.readAllBytes(Paths.get(resourceLoader.getResource("classpath:"+emailBody).getURI()));
            byte[] contentData = Files.readAllBytes(Paths.get(  resourceLoader.getResource("classpath:"+RFQ_TEMPLATE).getURI()));
            String amountInWords="-";
            String vatInWords="-";

            if(postingRequestModel !=null && postingRequestModel.getAmountInWords() !=null)
                amountInWords= postingRequestModel.getAmountInWords();
            if(postingRequestModel !=null && postingRequestModel.getVatInWords() !=null)
                vatInWords= postingRequestModel.getVatInWords();

            htmlText = new String(bodyData, StandardCharsets.UTF_8).replace("{amountInWords}",amountInWords).replace("{vatInWords}",vatInWords);
            htmlContent= new String(contentData, StandardCharsets.UTF_8).replace("{currency}",poQuatation.getCurrency().getCurrencyIsoCode())
                                                                        .replace("{amountInWords}",amountInWords)
                                                                        .replace("{vatInWords}",vatInWords);
        } catch (IOException e) {
            logger.error(ERROR_PROCESSING_QUOTATION, e);
        }

        if (htmlContent != null && !htmlContent.isEmpty()) {
            content = mailUtility.create(map, htmlContent);
        }

        if (rfqEmailBody != null && rfqEmailBody.getTemplateSubject() != null) {
            subject = mailUtility.create(map, rfqEmailBody.getTemplateSubject());
        }
        if (rfqEmailBody != null && !htmlText.isEmpty()) {
            if (poQuatation.getPoQuatationLineItems().size()>1){
                body = mailUtility.create(map,updatePoQuotationLineItem(poQuatation.getPoQuatationLineItems().size(),rfqEmailBody,postingRequestModel));
            }
            else {
                body = mailUtility.create(map, htmlText);
            }
        }

        if (poQuatation.getSupplierId() != null && contact.getBillingEmail() != null && !contact.getBillingEmail().isEmpty()) {
            mailUtility.triggerEmailOnBackground2(subject,content, body, null, EmailConstant.ADMIN_SUPPORT_EMAIL,
                    EmailConstant.ADMIN_EMAIL_SENDER_NAME, new String[]{poQuatation.getSupplierId().getBillingEmail()},
                    true);
            User user = userService.findByPK(userId);
            EmailLogs emailLogs = new EmailLogs();
            emailLogs.setEmailDate(LocalDateTime.now());
            emailLogs.setEmailTo(poQuatation.getSupplierId().getBillingEmail());
            emailLogs.setEmailFrom(user.getUserEmail());
            String baseUrl = ServletUriComponentsBuilder.fromRequestUri(request)
                    .replacePath(null)
                    .build()
                    .toUriString();
            logger.info(baseUrl);
            emailLogs.setBaseUrl(baseUrl);
            emailLogs.setModuleName("REQUEST FOR QUOTATION");
            emaiLogsService.persist(emailLogs);
        } else {
           logger.info("BILLING ADDRES NOT PRESENT");
        }
    }
    private Map<String, String> getRfqData(PoQuatation poQuatation, Integer userId) {
        Map<String, String> map = mailUtility.getRfqEmailParamMap();
        Map<String, String> rfqDataMap = new HashMap<>();
        User user = userService.findByPK(userId);
        for (String key : map.keySet()) {
            String value = map.get(key);
            switch (key) {
                case MailUtility.RFQ_NO:
                    getRfqNumber(poQuatation,rfqDataMap,value);
                    break;
                case MailUtility.RFQ_RECEIVE_DATE:
                    getRfqReceiveDate(poQuatation,rfqDataMap,value);
                    break;
                case MailUtility.RFQ_EXPIRY_DATE:
                    getRfqExpiryDate(poQuatation,rfqDataMap,value);
                    break;
                case MailUtility.RFQ_AMOUNT:
                    if (poQuatation.getTotalAmount() != null) {
                        rfqDataMap.put(value, poQuatation.getTotalAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
                    }
                    break;
                case MailUtility.RFQ_VAT_AMOUNT:
                    if (poQuatation.getTotalVatAmount() != null) {
                        rfqDataMap.put(value, poQuatation.getTotalVatAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
                    }
                    break;
                case MailUtility.PRODUCT:
                    getProduct(poQuatation,rfqDataMap,value);
                    break;
                case MailUtility.UNIT_PRICE:
                    getUnitPrice(poQuatation,rfqDataMap,value);
                    break;
                case MailUtility.UNIT_TYPE:
                    getUnitType(poQuatation, rfqDataMap, value);
                    break;
                case MailUtility.EXCISE_AMOUNT:
                    getExciseAmount(poQuatation,rfqDataMap,value);
                    break;
                case MailUtility.QUANTITY:
                    getQuantity(poQuatation,rfqDataMap,value);
                    break;
                case MailUtility.SENDER_NAME:
                    rfqDataMap.put(value, user.getUserEmail());
                    break;
                case MailUtility.COMPANY_NAME:
                    if (user.getCompany() != null)
                        rfqDataMap.put(value, user.getCompany().getCompanyName());
                    break;
                case MailUtility.VAT_TYPE:
                    if (MailUtility.VAT_TYPE != null)
                        getVat(poQuatation,rfqDataMap,value);
                        break;
                case MailUtility.TOTAL:
                    if (poQuatation.getTotalAmount()!=null) {
                        rfqDataMap.put(value, poQuatation.getTotalAmount().toString());
                    }else{
                            rfqDataMap.put(value, "---");
                        }
                    break;
                case MailUtility.TOTAL_NET:
                    if (poQuatation.getTotalAmount()!=null && poQuatation.getTotalVatAmount()!=null && poQuatation.getTotalExciseAmount()!=null)
                        rfqDataMap.put(value, poQuatation.getTotalAmount().subtract(poQuatation.getTotalVatAmount()).subtract(poQuatation.getTotalExciseAmount()).toString());
                    else{
                        rfqDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.SUPPLIER_NAME:
                    getContact(poQuatation,rfqDataMap,value);
                    break;
                case MailUtility.SUB_TOTAL:
                    getSubTotal(poQuatation,rfqDataMap,value);
                    break;
                case MailUtility.DESCRIPTION:
                    getProductDescription(poQuatation,rfqDataMap,value);
                    break;
                case MailUtility.COMPANYLOGO:
                    if (user.getCompany() != null  && user.getCompany().getCompanyLogo() != null) {
                        String image = " data:image/jpg;base64," + DatatypeConverter.printBase64Binary(
                                user.getCompany().getCompanyLogo()) ;
                        rfqDataMap.put(value, image);
                    } else {
                        rfqDataMap.put(value, "");
                    }
                    break;
                case MailUtility.CURRENCY:
                    rfqDataMap.put(value, poQuatation.getCurrency().getCurrencyIsoCode());
                    break;
                case MailUtility.COMPANY_ADDRESS_LINE1:
                    if (user.getCompany() != null) {
                        rfqDataMap.put(value, user.getCompany().getCompanyAddressLine1());
                    } else {
                        rfqDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.COMPANY_ADDRESS_LINE2:
                    if (user.getCompany() != null) {
                        rfqDataMap.put(value, user.getCompany().getCompanyAddressLine2());
                    } else {
                        rfqDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.COMPANY_POST_ZIP_CODE:
                    if (user.getCompany() != null) {
                        rfqDataMap.put(value, user.getCompany().getCompanyPostZipCode());
                    } else {
                        rfqDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.COMPANY_COUNTRY_CODE:
                    if (user.getCompany() != null) {
                        rfqDataMap.put(value, user.getCompany().getCompanyCountryCode().getCountryName());
                    } else {
                        rfqDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.COMPANY_STATE_REGION:
                    if (user.getCompany() != null) {
                        rfqDataMap.put(value, user.getCompany().getCompanyStateCode().getStateName());
                    } else {
                        rfqDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.VAT_NUMBER:
                    if (user.getCompany() != null) {
                        rfqDataMap.put(value, user.getCompany().getVatNumber());
                    } else {
                        rfqDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.COMPANY_MOBILE_NUMBER:
                    if (user.getCompany() != null && user.getCompany().getPhoneNumber() != null) {
                        String[] numbers=user.getCompany().getPhoneNumber().split(",");
                        String mobileNumber="";
                        if (numbers.length > 0 && numbers[0] != null) {
                            mobileNumber = mobileNumber.concat(numbers[0]);
                        }
                        rfqDataMap.put(value,mobileNumber );
                    } else {
                        rfqDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.VAT_REGISTRATION_NUMBER:
                    getVatRegistrationNumber(poQuatation,rfqDataMap,value);
                    break;
                case MailUtility.POST_ZIP_CODE:
                    getPostZipCode(poQuatation, rfqDataMap, value);
                    break;
                case MailUtility.STATUS:
                    getStatus(poQuatation, rfqDataMap, value);
                    break;
                case MailUtility.CONTACT_COUNTRY:
                    getContactCountry(poQuatation, rfqDataMap, value);
                    break;
                case MailUtility.CONTACT_STATE:
                    getContactState(poQuatation, rfqDataMap, value);
                    break;
                case MailUtility.CONTACT_ADDRESS_LINE1:
                    getContactAddress1(poQuatation, rfqDataMap, value);
                    break;
                case MailUtility.CONTACT_ADDRESS_LINE2:
                    getContactAddress2(poQuatation, rfqDataMap, value);
                    break;
                case MailUtility.MOBILE_NUMBER:
                    getMobileNumber(poQuatation, rfqDataMap, value);
                    break;
                case MailUtility.NOTES:
                    getNotes(poQuatation, rfqDataMap, value);
                    break;
                case MailUtility.EXCISE_TAX:
                    getExciseCategory(poQuatation, rfqDataMap, value);
                    break;
                case MailUtility.TOTAL_EXCISE_AMOUNT:
                    getTotalExciseAmount(poQuatation, rfqDataMap, value);
                    break;
                case MailUtility.VAT_AMOUNT:
                    getVatAmount(poQuatation,rfqDataMap,value);
                    break;
                default:
            }
        }
        return rfqDataMap;
    }

    private void getVatAmount(PoQuatation poQuatation, Map<String, String> rfqDataMap, String value) {
        int row=0;
        if (poQuatation.getPoQuatationLineItems() != null) {
            for(PoQuatationLineItem poQuatationLineItem : poQuatation.getPoQuatationLineItems()){
                if (poQuatationLineItem.getVatAmount()!=null){
                    if (row==0){
                        row++;
                        rfqDataMap.put(value,poQuatationLineItem.getVatAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
                    }
                    else {
                        rfqDataMap.put("{vatAmount"+row+"}",poQuatationLineItem.getVatAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
                        row++;
                    }
                }
                else{
                    rfqDataMap.put(value, "---");
                }
            }}
    }

    private void getExciseCategory(PoQuatation poQuatation, Map<String, String> rfqDataMap, String value) {
        int row=0;
        if (poQuatation.getPoQuatationLineItems() != null) {
            for(PoQuatationLineItem poQuatationLineItem : poQuatation.getPoQuatationLineItems()){
                if (poQuatationLineItem.getExciseCategory()!= null) {
                    if (row==0){
                        row++;
                        rfqDataMap.put(value, poQuatationLineItem.getExciseCategory().getName());
                    }
                    else {
                        rfqDataMap.put("{exciseCategory"+row+"}", poQuatationLineItem.getExciseCategory().getName());
                        row++;
                    }

                }
                else{
                    if (row==0){
                        row++;
                        rfqDataMap.put(value,  "---" );
                    }
                    else {
                        rfqDataMap.put("{exciseCategory"+row+"}", "---");
                        row++;
                    }
                }
            }}
    }

    private void getTotalExciseAmount(PoQuatation poQuatation, Map<String, String> rfqDataMap, String value) {
        if (poQuatation.getTotalExciseAmount() != null) {
            rfqDataMap.put(value, poQuatation.getTotalExciseAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
        }
        else{
            rfqDataMap.put(value, "---");
        }
    }

    private void getPostZipCode(PoQuatation poQuatation, Map<String, String> rfqDataMap, String value) {
        if (poQuatation.getSupplierId() != null && !poQuatation.getSupplierId().getPostZipCode().isEmpty()) {
            StringBuilder sb = new StringBuilder();
            Contact c = poQuatation.getSupplierId();
            if (c.getPostZipCode() != null && !c.getPostZipCode().isEmpty()) {
                sb.append(c.getPostZipCode()).append(" ");
            }
            rfqDataMap.put(value, sb.toString());
        }
        else{
            rfqDataMap.put(value, "---");
        }

    }

    private void getVatRegistrationNumber(PoQuatation poQuatation, Map<String, String> rfqDataMap, String value) {
        if (poQuatation.getSupplierId() != null && !poQuatation.getSupplierId().getVatRegistrationNumber().isEmpty()) {
            StringBuilder sb = new StringBuilder();
            Contact c = poQuatation.getSupplierId();
            if (c.getVatRegistrationNumber() != null && !c.getVatRegistrationNumber().isEmpty()) {
                sb.append(c.getVatRegistrationNumber()).append(" ");
            }
            rfqDataMap.put(value, sb.toString());
        }
        else{
            rfqDataMap.put(value, "---");
        }

    }

    private void getStatus(PoQuatation poQuatation, Map<String, String> rfqDataMap, String value) {
        if (CommonStatusEnum.getInvoiceTypeByValue(poQuatation.getStatus()) != null && !CommonStatusEnum.getInvoiceTypeByValue(poQuatation.getStatus()).isEmpty()) {
            StringBuilder sb = new StringBuilder();
            poQuatation.getStatus();
            if (CommonStatusEnum.getInvoiceTypeByValue(poQuatation.getStatus()) != null && !CommonStatusEnum.getInvoiceTypeByValue(poQuatation.getStatus()).isEmpty()) {
                sb.append(CommonStatusEnum.getInvoiceTypeByValue(poQuatation.getStatus())).append(" ");
            }
            rfqDataMap.put(value, sb.toString());
        }
        else{
            rfqDataMap.put(value, "---");
        }
    }

    private void getContactCountry(PoQuatation poQuatation, Map<String, String> rfqDataMap, String value) {
        if (poQuatation.getSupplierId() != null) {
            StringBuilder sb = new StringBuilder();
            Contact c = poQuatation.getSupplierId();
            if (c==null) {
                rfqDataMap.put(value, "N/A");
            }else if (c.getCountry() != null) {
                sb.append(c.getCountry().getCountryName()).append(" ");
                rfqDataMap.put(value, sb.toString());
            }
            else{
                rfqDataMap.put(value, "---");
            }
        }

    }

    private void getContactState(PoQuatation poQuatation, Map<String, String> rfqDataMap, String value) {
        if ( poQuatation.getSupplierId()!=null && poQuatation.getSupplierId().getState() != null ) {
            StringBuilder sb = new StringBuilder();
            Contact c = poQuatation.getSupplierId();
            if (c==null) {
                rfqDataMap.put(value, "N/A");
            }else if (c.getState().getStateName() != null) {
                sb.append(c.getState().getStateName()).append(" ");
                rfqDataMap.put(value, sb.toString());
            }
        }
        else{
            rfqDataMap.put(value, "---");
        }
    }

    private void getContactAddress1(PoQuatation poQuatation, Map<String, String> rfqDataMap, String value) {
        if (poQuatation.getSupplierId() != null || !poQuatation.getSupplierId().getAddressLine1().isEmpty()) {
            StringBuilder sb = new StringBuilder();
            Contact c = poQuatation.getSupplierId();
            if (c.getAddressLine1() != null && !c.getAddressLine1().isEmpty()) {
                sb.append(c.getAddressLine1()).append(" ");
            }
            rfqDataMap.put(value, sb.toString());
        }
        else{
            rfqDataMap.put(value, "---");
        }

    }

    private void getContactAddress2(PoQuatation poQuatation, Map<String, String> rfqDataMap, String value) {
        if (poQuatation.getSupplierId() != null || !poQuatation.getSupplierId().getAddressLine1().isEmpty()) {
            StringBuilder sb = new StringBuilder();
            Contact c = poQuatation.getSupplierId();
            if (c.getAddressLine2() != null && !c.getAddressLine2().isEmpty()) {
                sb.append(c.getAddressLine2()).append(" ");
            }
            rfqDataMap.put(value, sb.toString());
        }
        else{
            rfqDataMap.put(value, "---");
        }

    }

    private void getMobileNumber(PoQuatation poQuatation, Map<String, String> rfqDataMap, String value) {
        if (poQuatation.getSupplierId()!=null && poQuatation.getSupplierId().getMobileNumber() != null ) {
            StringBuilder sb = new StringBuilder();
            Contact c = poQuatation.getSupplierId();
            if (c.getMobileNumber() != null) {
                sb.append(c.getMobileNumber()).append(" ");
            }
            rfqDataMap.put(value, sb.toString());
        }
        else{
            rfqDataMap.put(value, "---");
        }
    }

    private void getNotes(PoQuatation poQuatation, Map<String, String> rfqDataMap, String value) {
        if (poQuatation.getNotes() != null && !poQuatation.getNotes().isEmpty()) {
            StringBuilder sb = new StringBuilder();
            poQuatation.getNotes();
            if (poQuatation.getNotes() != null && !poQuatation.getNotes().isEmpty()) {
                sb.append(poQuatation.getNotes()).append(" ");
            }
            rfqDataMap.put(value, sb.toString());
        }
        else{
            rfqDataMap.put(value, "---");
        }

    }

    private void getRfqNumber(PoQuatation poQuatation, Map<String, String> rfqDataMap, String value) {
        if (poQuatation.getRfqNumber() != null && !poQuatation.getRfqNumber().isEmpty()) {
            rfqDataMap.put(value, poQuatation.getRfqNumber());
        }
        else{
            rfqDataMap.put(value, "---");
        }
    }
    private void getRfqReceiveDate(PoQuatation poQuatation, Map<String, String> rfqDataMap, String value) {
        if (poQuatation.getRfqReceiveDate() != null) {
            rfqDataMap.put(value, dateFormtUtil.getLocalDateTimeAsString(poQuatation.getRfqReceiveDate(), dateFormat));
        }
        else{
            rfqDataMap.put(value, "---");
        }
    }
    private void getRfqExpiryDate(PoQuatation poQuatation, Map<String, String> rfqDataMap, String value) {
        if (poQuatation.getRfqExpiryDate() != null) {
            rfqDataMap.put(value, dateFormtUtil.getLocalDateTimeAsString(poQuatation.getRfqExpiryDate(), dateFormat));
        }
        else{
            rfqDataMap.put(value, "---");
        }
    }
    public static String insertSpaces(String input, int interval) {
        if (input.contains(" ") && input.length()<20) {
            return input;
        }

        StringBuilder stringBuilder = new StringBuilder(input);

        for (int i = interval; i < stringBuilder.length(); i += interval + 1) {
            stringBuilder.insert(i, ' ');
        }

        return stringBuilder.toString();
    }
    private void getProduct(PoQuatation poQuatation, Map<String, String> rfqDataMap, String value) {
        int row=0;
        if (poQuatation.getPoQuatationLineItems() != null) {

            for(PoQuatationLineItem poQuatationLineItem : poQuatation.getPoQuatationLineItems()){

                if (poQuatationLineItem.getProduct().getProductName() != null) {
                    String product = insertSpaces(poQuatationLineItem.getProduct().getProductName(), 20);
                    if (row==0){
                        row++;
                        rfqDataMap.put(value,product);
                    }
                    else {
                        rfqDataMap.put("{product"+row+"}", product);
                        row++;
                    }
                }
                else{
                    rfqDataMap.put(value, "---");
                }
            }}
    }
    private void getProductDescription(PoQuatation poQuatation, Map<String, String> rfqDataMap, String value) {
        int row = 0;
        if (poQuatation.getPoQuatationLineItems() != null) {

            for(PoQuatationLineItem poQuatationLineItem : poQuatation.getPoQuatationLineItems()){

                if (poQuatationLineItem.getDescription() != null) {
                    if (row==0){
                        row++;
                        rfqDataMap.put(value,  poQuatationLineItem.getDescription() );
                    }
                    else {
                        rfqDataMap.put("{description"+row+"}",  poQuatationLineItem.getDescription());
                        row++;
                    }
                }
                else {
                    if (row==0){
                        row++;
                        rfqDataMap.put(value,  "---" );
                    }
                    else {
                        rfqDataMap.put("{description"+row+"}", "---");
                        row++;
                    }
                }
            }}
    }
    private void getUnitPrice(PoQuatation poQuatation, Map<String, String> rfqDataMap, String value) {
        int row=0;
        if (poQuatation.getPoQuatationLineItems() != null) {
            for(PoQuatationLineItem poQuatationLineItem : poQuatation.getPoQuatationLineItems()){
                if (poQuatationLineItem.getUnitCost()!=null){
                    if (row==0){
                        row++;
                        rfqDataMap.put(value,poQuatationLineItem.getUnitCost().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
                    }
                    else {
                        rfqDataMap.put("{unitPrice"+row+"}",poQuatationLineItem.getUnitCost().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
                        row++;
                    }
                }
                else{
                    rfqDataMap.put(value, "---");
                }
            }}
    }

    private void getUnitType(PoQuatation poQuatation, Map<String, String> rfqDataMap, String value) {
        int row=0;
        if (poQuatation.getPoQuatationLineItems() != null) {
            for(PoQuatationLineItem poQuatationLineItem : poQuatation.getPoQuatationLineItems()){
                if (poQuatationLineItem.getUnitType()!= null) {
                    if (row==0){
                        row++;
                        rfqDataMap.put(value, poQuatationLineItem.getUnitType());
                    }
                    else {
                        rfqDataMap.put("{unitType"+row+"}", poQuatationLineItem.getUnitType());
                        row++;
                    }
                }
                else{
                    rfqDataMap.put(value, "---");
                }
            }}
    }

    private void getExciseAmount(PoQuatation poQuatation, Map<String, String> rfqDataMap, String value) {
        int row=0;
        if (poQuatation.getPoQuatationLineItems() != null) {
            for(PoQuatationLineItem poQuatationLineItem : poQuatation.getPoQuatationLineItems()){
                if (poQuatationLineItem.getExciseAmount()!= null) {
                    if (row==0){
                        row++;
                        rfqDataMap.put(value, poQuatationLineItem.getExciseAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
                    }
                    else {
                        rfqDataMap.put("{exciseAmount"+row+"}", poQuatationLineItem.getExciseAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
                        row++;
                    }
                }
                else{
                    rfqDataMap.put(value, "---");
                }
            }}
    }
    private void getQuantity(PoQuatation poQuatation, Map<String, String> rfqDataMap, String value) {
        int row = 0;
        if (poQuatation.getPoQuatationLineItems() != null) {

            for(PoQuatationLineItem poQuatationLineItem : poQuatation.getPoQuatationLineItems()){

                if (poQuatationLineItem.getQuantity()!= null) {
                    if (row==0){
                        row++;
                        rfqDataMap.put(value, poQuatationLineItem.getQuantity().toString() );
                    }
                    else {
                        rfqDataMap.put("{quantity"+row+"}", poQuatationLineItem.getQuantity().toString());
                        row++;
                    }
                }
                else{
                    rfqDataMap.put(value, "---");
                }
            }}
    }
    private void getVat(PoQuatation poQuatation, Map<String, String> rfqDataMap, String value) {
        int row = 0;
        if (poQuatation.getPoQuatationLineItems() != null) {

            for(PoQuatationLineItem poQuatationLineItem : poQuatation.getPoQuatationLineItems()){
                if (poQuatationLineItem.getVatCategory().getVat() != null) {
                    if (row==0){
                        row++;
                        rfqDataMap.put(value,poQuatationLineItem.getVatCategory().getVat().toString() );
                    }
                    else {
                        rfqDataMap.put("{vatType"+row+"}",poQuatationLineItem.getVatCategory().getVat().toString());
                        row++;
                    }
                }
                else{
                    rfqDataMap.put(value, "---");
                }
            }}
    }
    private void getTotal(PoQuatation poQuatation, Map<String, String> rfqDataMap, String value) {
        if (poQuatation.getTotalAmount() != null) {
            rfqDataMap.put(value, poQuatation.getTotalAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
        }
        else{
            rfqDataMap.put(value, "---");
        }
    }
    private void getContact(PoQuatation poQuatation, Map<String, String> rfqDataMap, String value) {
        if (poQuatation.getSupplierId() != null && !poQuatation.getSupplierId().getFirstName().isEmpty()) {
            StringBuilder sb = new StringBuilder();
            Contact c = poQuatation.getSupplierId();
            if (c.getFirstName() != null && !c.getFirstName().isEmpty()) {
                sb.append(c.getFirstName()).append(" ");
            }
            if (c.getMiddleName() != null && !c.getMiddleName().isEmpty()) {
                sb.append(c.getMiddleName()).append(" ");
            }
            if (c.getLastName() != null && !c.getLastName().isEmpty()) {
                sb.append(c.getLastName());
            }
            rfqDataMap.put(value, sb.toString());
        }
        else {
            rfqDataMap.put(value,"---");
        }
    }
    private void getSubTotal(PoQuatation poQuatation, Map<String, String> rfqDataMap, String value) {
        int row = 0;
        if (poQuatation.getPoQuatationLineItems() != null) {

            for(PoQuatationLineItem poQuatationLineItem : poQuatation.getPoQuatationLineItems()){
                if (poQuatationLineItem.getSubTotal() != null) {
                    if (row==0){
                        row++;
                        rfqDataMap.put(value, poQuatationLineItem.getSubTotal().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString() );
                    }
                    else {
                        rfqDataMap.put("{subTotal"+row+"}",poQuatationLineItem.getSubTotal().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
                        row++;
                    }
                }
                else{
                    rfqDataMap.put(value, "---");
                }
            }}
    }
    public List<RfqListModel> getRfqListModel(Object poQuataions) {
        List<RfqListModel> rfqListModels = new ArrayList<>();
        if (poQuataions != null) {
            for (PoQuatation poQuatation : (List<PoQuatation>) poQuataions) {
                RfqListModel model = new RfqListModel();
                model.setId(poQuatation.getId());
                model.setRfqNumber(poQuatation.getRfqNumber());
                model.setTotalAmount(poQuatation.getTotalAmount());
                model.setTotalVatAmount(poQuatation.getTotalVatAmount());
                if (poQuatation.getStatus() != null) {
                    model.setStatusEnum(poQuatation.getStatus());
                    model.setStatus(CommonStatusEnum.getInvoiceTypeByValue(poQuatation.getStatus()));
                }
                if (poQuatation.getSupplierId().getOrganization() != null && !poQuatation.getSupplierId().getOrganization().isEmpty()) {
                    model.setSupplierId(poQuatation.getSupplierId().getContactId());
                    model.setSupplierName(poQuatation.getSupplierId().getOrganization());

                }else{
                    model.setSupplierId(poQuatation.getSupplierId().getContactId());
                    model.setSupplierName(poQuatation.getSupplierId().getFirstName()+" "+poQuatation.getSupplierId().getLastName());
                }
                if (poQuatation.getRfqReceiveDate() != null) {
                    model.setRfqReceiveDate(dateFormtUtil.getLocalDateTimeAsString(poQuatation.getRfqReceiveDate(), dateFormat));
                }
                if (poQuatation.getRfqExpiryDate() != null) {
                    model.setRfqExpiryDate(dateFormtUtil.getLocalDateTimeAsString(poQuatation.getRfqExpiryDate(), dateFormat));
                }
                if (poQuatation.getCurrency()!=null){
                    model.setCurrencyCode(poQuatation.getCurrency().getCurrencyIsoCode());
                    model.setCurrencyName(poQuatation.getCurrency().getCurrencyName());
                }
                if (poQuatation.getSupplierId().getVatRegistrationNumber() != null) {
                    model.setVatRegistrationNumber(model.getVatRegistrationNumber());
                }
                Map<String, Object> param = new HashMap<>();
                param.put("parentID", poQuatation);
                List<RfqPoGrnRelation> poList = rfqPoGrnInvoiceRelationDao.findByAttributes(param);
                List<String> poNumberList= new ArrayList<>();
                if (poList!=null && !poList.isEmpty()) {
                    for (RfqPoGrnRelation poNumber : poList) {
                        poNumberList.add(poNumber.getChildID().getPoNumber());
                    }
                    model.setPoList(poNumberList);
                }
                rfqListModels.add(model);
            }
        }
        return rfqListModels;
    }
    public List<POListModel> getPOListModel(Object poQuataions,Integer type) {
        List<POListModel> poListModels = new ArrayList<>();
        if (poQuataions != null) {
            for (PoQuatation poQuatation : (List<PoQuatation>) poQuataions) {
                POListModel model = new POListModel();
                model.setId(poQuatation.getId());
                model.setPoNumber(poQuatation.getPoNumber());
                if (poQuatation.getPoApproveDate() != null) {
                    model.setPoApproveDate(dateFormtUtil.getLocalDateTimeAsString(poQuatation.getPoApproveDate(), dateFormat));
                }
                if (poQuatation.getPoReceiveDate() != null) {
                    model.setPoReceiveDate(dateFormtUtil.getLocalDateTimeAsString(poQuatation.getPoReceiveDate(), dateFormat));
                }
                if (poQuatation.getGrnNumber()!=null){
                    model.setGrnNumber(poQuatation.getGrnNumber());
                }
                if(poQuatation.getGrnReceiveDate()!=null){
                    model.setGrnReceiveDate(dateFormtUtil.getLocalDateTimeAsString(poQuatation.getGrnReceiveDate(), dateFormat));
                }
                if (poQuatation.getCurrency()!=null){
                    model.setCurrencyCode(poQuatation.getCurrency().getCurrencyIsoCode());
                    model.setCurrencyName(poQuatation.getCurrency().getCurrencyName());
                }
                if (poQuatation.getSupplierId().getVatRegistrationNumber() != null){
                    model.setVatRegistrationNumber(model.getVatRegistrationNumber());
                }
                model.setGrnRemarks(poQuatation.getGrnRemarks());
                model.setTotalAmount(poQuatation.getTotalAmount());
                model.setTotalVatAmount(poQuatation.getTotalVatAmount());
                if (poQuatation.getStatus() != null) {
                    model.setStatusEnum(poQuatation.getStatus());
                    model.setStatus(CommonStatusEnum.getInvoiceTypeByValue(poQuatation.getStatus()));
                }
                if (poQuatation.getSupplierId().getOrganization() != null && !poQuatation.getSupplierId().getOrganization().isEmpty()) {

                    model.setSupplierName(poQuatation.getSupplierId().getOrganization());
                }else{
                    model.setSupplierName(poQuatation.getSupplierId().getFirstName()+ " " + poQuatation.getSupplierId().getLastName());
                }
                if (poQuatation.getReferenceNumber()!=null){
                    model.setSupplierReferenceNumber(poQuatation.getReferenceNumber());
                }
                if (type==5) {
                    int totalGRNQuantity=0;
                    for (PoQuatationLineItem poQuatationLineItem : poQuatation.getPoQuatationLineItems()) {
                        if (poQuatationLineItem.getQuantity()!=null) {
                            totalGRNQuantity += poQuatationLineItem.getQuantity();
                        }
                    }
                    model.setGrnQuantity(totalGRNQuantity);
                    int totalPoQuantity=0;
                    Map<String, Object> param = new HashMap<>();
                    param.put("childID", poQuatation);
                    List<RfqPoGrnRelation> poList = rfqPoGrnInvoiceRelationDao.findByAttributes(param);
                    if (poList != null && !poList.isEmpty()) {
                        for (RfqPoGrnRelation rfqPoGrnRelation : poList) {
                            PoQuatation  poQuatationParent= rfqPoGrnRelation.getParentID();
                            for (PoQuatationLineItem poQuatationLineItem : poQuatationParent.getPoQuatationLineItems()) {
                                totalPoQuantity+=poQuatationLineItem.getQuantity();
                            }
                        }
                        model.setPoQuantity(totalPoQuantity);
                    }
                }
                poListModels.add(model);
            }
        }
        return poListModels;
    }
    public PoQuatationRequestModel getRfqModel(PoQuatation poQuatation) {
        PoQuatationRequestModel poQuatationRequestModel = new PoQuatationRequestModel();
        poQuatationRequestModel.setId(poQuatation.getId());
        poQuatationRequestModel.setRfqNumber(poQuatation.getRfqNumber());
        if (poQuatation.getRfqReceiveDate() != null) {
            Date date = Date.from(poQuatation.getRfqReceiveDate().atZone(ZoneId.systemDefault()).toInstant());
            poQuatationRequestModel.setRfqReceiveDate(date);
        }
        if (poQuatation.getRfqExpiryDate() != null) {
            Date date = Date.from(poQuatation.getRfqExpiryDate().atZone(ZoneId.systemDefault()).toInstant());
            poQuatationRequestModel.setRfqExpiryDate(date);
        }
        if (poQuatation.getSupplierId().getOrganization() != null && !poQuatation.getSupplierId().getOrganization().isEmpty() ) {
            poQuatationRequestModel.setSupplierName(poQuatation.getSupplierId().getOrganization());
            poQuatationRequestModel.setSupplierId(poQuatation.getSupplierId().getContactId());
            poQuatationRequestModel.setTaxtreatment(poQuatation.getSupplierId().getTaxTreatment().getTaxTreatment());
        }
        else {
            poQuatationRequestModel.setSupplierId(poQuatation.getSupplierId().getContactId());
            poQuatationRequestModel.setSupplierName(poQuatation.getSupplierId().getFirstName() + " " + poQuatation.getSupplierId().getLastName());
            poQuatationRequestModel.setTaxtreatment(poQuatation.getSupplierId().getTaxTreatment().getTaxTreatment());
        }
        if (poQuatation.getNotes()!=null){
            poQuatationRequestModel.setNotes(poQuatation.getNotes());
        }
        if (poQuatation.getCurrency()!=null){
            poQuatationRequestModel.setCurrencyCode(poQuatation.getCurrency().getCurrencyCode());
            poQuatationRequestModel.setCurrencySymbol(poQuatation.getCurrency().getCurrencySymbol());
            poQuatationRequestModel.setCurrencyName(poQuatation.getCurrency().getCurrencyName());
            poQuatationRequestModel.setCurrencyIsoCode(poQuatation.getCurrency().getCurrencyIsoCode());
        }
        if (poQuatation.getSupplierId().getVatRegistrationNumber() != null){
            poQuatationRequestModel.setVatRegistrationNumber(poQuatation.getSupplierId().getVatRegistrationNumber());
        }
        if (poQuatation.getTaxType()!=null){
           poQuatationRequestModel.setTaxType(poQuatation.getTaxType());
        }
        if(poQuatation.getTotalExciseAmount() != null){
            poQuatationRequestModel.setTotalExciseAmount(poQuatation.getTotalExciseAmount());
        }
        if (poQuatation.getPlaceOfSupplyId() !=null){
            poQuatationRequestModel.setPlaceOfSupply(poQuatation.getPlaceOfSupplyId().getPlaceOfSupply());
            poQuatationRequestModel.setPlaceOfSupplyId(poQuatation.getPlaceOfSupplyId().getId());
        }
        poQuatationRequestModel.setReceiptNumber(poQuatation.getReferenceNumber()!=null ?poQuatation.getReferenceNumber():"");
        poQuatationRequestModel.setType(poQuatation.getType().toString());
        poQuatationRequestModel.setStatus(CommonStatusEnum.getInvoiceTypeByValue(poQuatation.getStatus()));
        poQuatationRequestModel.setTotalAmount(poQuatation.getTotalAmount());
        poQuatationRequestModel.setTotalVatAmount(poQuatation.getTotalVatAmount());
        List<PoQuatationLineItemRequestModel> poQuatationLineItemRequestModelList= new ArrayList<>();
        getRfqLineItems(poQuatation, poQuatationRequestModel, poQuatationLineItemRequestModelList);
            return poQuatationRequestModel;
    }
    private void getRfqLineItems(PoQuatation poQuatation, PoQuatationRequestModel poQuatationRequestModel, List<PoQuatationLineItemRequestModel> poQuatationLineItemRequestModelList) {
        if (poQuatation.getPoQuatationLineItems() != null && !poQuatation.getPoQuatationLineItems().isEmpty()) {
            for (PoQuatationLineItem lineItem : poQuatation.getPoQuatationLineItems()) {
                PoQuatationLineItemRequestModel model = getRfqLineItemModel(lineItem);
                poQuatationLineItemRequestModelList.add(model);
            }
            poQuatationRequestModel.setPoQuatationLineItemRequestModelList(poQuatationLineItemRequestModelList);
        }
    }
    public PoQuatationLineItemRequestModel getRfqLineItemModel(PoQuatationLineItem lineItem) {
        PoQuatationLineItemRequestModel lineItemModel = new PoQuatationLineItemRequestModel();
        lineItemModel.setId(lineItem.getId());
        lineItemModel.setDescription(lineItem.getDescription());
        lineItemModel.setQuantity(lineItem.getQuantity());
        lineItemModel.setUnitPrice(lineItem.getUnitCost());
        lineItemModel.setSubTotal(lineItem.getSubTotal());
        if (lineItem.getTrnsactioncCategory()!=null){
            lineItemModel.setTransactionCategoryId(lineItem.getTrnsactioncCategory().getTransactionCategoryId());
            lineItemModel.setTransactionCategoryLabel(
                    lineItem.getTrnsactioncCategory().getChartOfAccount().getChartOfAccountName());
        }
        if(lineItem.getUnitType()!=null)
            lineItemModel.setUnitType(lineItem.getUnitType());
        if(lineItem.getUnitTypeId()!=null)
            lineItemModel.setUnitTypeId(lineItem.getUnitTypeId().getUnitTypeId());
        if (lineItem.getExciseCategory()!=null){
            lineItemModel.setExciseTaxId(lineItem.getExciseCategory().getId());
        }
        if (lineItem.getExciseAmount()!=null){
            lineItemModel.setExciseAmount(lineItem.getExciseAmount());
        }
        if (lineItem.getVatAmount()!=null){
            lineItemModel.setVatAmount(lineItem.getVatAmount());
        }
        if(lineItem.getDiscountType()!= null){
            lineItemModel.setDiscountType(lineItem.getDiscountType());
        }
        if(lineItem.getDiscount()!= null){
            lineItemModel.setDiscount(lineItem.getDiscount());
        }
        if (lineItem.getVatCategory() != null && lineItem.getVatCategory().getId() != null) {
            lineItemModel.setVatCategoryId(lineItem.getVatCategory().getId().toString());
            lineItemModel.setVatPercentage(lineItem.getVatCategory().getVat().intValue());
        }
        if (lineItem.getProduct() != null) {
            lineItemModel.setProductId(lineItem.getProduct().getProductID());
            lineItemModel.setProductName(lineItem.getProduct().getProductName());
        }
        if(lineItem.getProduct()!=null)
            lineItemModel.setIsExciseTaxExclusive(lineItem.getProduct().getExciseType());
        return lineItemModel;
    }
    public PoQuatationRequestModel getPOModel(PoQuatation poQuatation) {
        PoQuatationRequestModel poQuatationRequestModel = new PoQuatationRequestModel();
        poQuatationRequestModel.setId(poQuatation.getId());
        if (poQuatation.getRfqNumber()!=null){
            poQuatationRequestModel.setRfqNumber(poQuatation.getRfqNumber());
        }
        if (poQuatation.getNotes()!=null){
            poQuatationRequestModel.setNotes(poQuatation.getNotes());
        }
        poQuatationRequestModel.setPoNumber(poQuatation.getPoNumber());
        if (poQuatation.getPoApproveDate() != null) {
            Date date = Date.from(poQuatation.getPoApproveDate().atZone(ZoneId.systemDefault()).toInstant());
            poQuatationRequestModel.setPoApproveDate(date);
        }
        if (poQuatation.getPoReceiveDate()!=null) {
            Date date = Date.from(poQuatation.getPoReceiveDate().atZone(ZoneId.systemDefault()).toInstant());
            poQuatationRequestModel.setPoReceiveDate(date);
        }
        if (poQuatation.getSupplierId().getOrganization() != null && !poQuatation.getSupplierId().getOrganization().isEmpty() ) {
            poQuatationRequestModel.setSupplierName(poQuatation.getSupplierId().getOrganization());
            poQuatationRequestModel.setSupplierId(poQuatation.getSupplierId().getContactId());
            poQuatationRequestModel.setTaxtreatment(poQuatation.getSupplierId().getTaxTreatment().getTaxTreatment());
        }
        else {
            poQuatationRequestModel.setSupplierId(poQuatation.getSupplierId().getContactId());
            poQuatationRequestModel.setSupplierName(poQuatation.getSupplierId().getFirstName() + " " + poQuatation.getSupplierId().getLastName());
            poQuatationRequestModel.setTaxtreatment(poQuatation.getSupplierId().getTaxTreatment().getTaxTreatment());
        }
        if (poQuatation.getReferenceNumber()!=null){
            poQuatationRequestModel.setSupplierReferenceNumber(poQuatation.getReferenceNumber());
        }
        if (poQuatation.getCurrency()!=null){
            poQuatationRequestModel.setCurrencyCode(poQuatation.getCurrency().getCurrencyCode());
            poQuatationRequestModel.setCurrencySymbol(poQuatation.getCurrency().getCurrencySymbol());
            poQuatationRequestModel.setCurrencyName(poQuatation.getCurrency().getCurrencyName());
            poQuatationRequestModel.setCurrencyIsoCode(poQuatation.getCurrency().getCurrencyIsoCode());
        }
        if (poQuatation.getSupplierId().getVatRegistrationNumber() != null){
            poQuatationRequestModel.setVatRegistrationNumber(poQuatation.getSupplierId().getVatRegistrationNumber());
        }
        if (poQuatation.getTaxType()!=null){
            poQuatationRequestModel.setTaxType(poQuatation.getTaxType());
        }
        if(poQuatation.getTotalExciseAmount() != null){
            poQuatationRequestModel.setTotalExciseAmount(poQuatation.getTotalExciseAmount());
        }
        if (poQuatation.getPlaceOfSupplyId() !=null){
            poQuatationRequestModel.setPlaceOfSupplyId(poQuatation.getPlaceOfSupplyId().getId());
        }
        poQuatationRequestModel.setType(poQuatation.getType().toString());
        poQuatationRequestModel.setStatus(CommonStatusEnum.getInvoiceTypeByValue(poQuatation.getStatus()));
        poQuatationRequestModel.setTotalAmount(poQuatation.getTotalAmount());
        poQuatationRequestModel.setTotalVatAmount(poQuatation.getTotalVatAmount());
        poQuatationRequestModel.setDiscount(poQuatation.getDiscount());
        List<PoQuatationLineItemRequestModel> poQuatationLineItemRequestModelList= new ArrayList<>();
        getPOLineItems(poQuatation, poQuatationRequestModel, poQuatationLineItemRequestModelList);
        return poQuatationRequestModel;
    }
    public void getPOLineItems(PoQuatation poQuatation, PoQuatationRequestModel poQuatationRequestModel, List<PoQuatationLineItemRequestModel> poQuatationLineItemRequestModelList) {
        if (poQuatation.getPoQuatationLineItems() != null && !poQuatation.getPoQuatationLineItems().isEmpty()) {
            for (PoQuatationLineItem lineItem : poQuatation.getPoQuatationLineItems()) {
                PoQuatationLineItemRequestModel model = getPOLineItemModel(lineItem);
                poQuatationLineItemRequestModelList.add(model);
            }
            poQuatationRequestModel.setPoQuatationLineItemRequestModelList(poQuatationLineItemRequestModelList);
        }
    }
    public PoQuatationLineItemRequestModel getPOLineItemModel(PoQuatationLineItem lineItem) {
        PoQuatationLineItemRequestModel lineItemModel = new PoQuatationLineItemRequestModel();
        lineItemModel.setId(lineItem.getId());
        lineItemModel.setDescription(lineItem.getDescription());
        lineItemModel.setQuantity(lineItem.getQuantity());
        lineItemModel.setRemainingQuantity(lineItem.getRemainingQuantity());
        lineItemModel.setUnitPrice(lineItem.getUnitCost());
        lineItemModel.setSubTotal(lineItem.getSubTotal());
        if (lineItem.getTrnsactioncCategory()!=null){
            lineItemModel.setTransactionCategoryLabel(
                    lineItem.getTrnsactioncCategory().getChartOfAccount().getChartOfAccountName());
            lineItemModel.setTransactionCategoryId(lineItem.getTrnsactioncCategory().getTransactionCategoryId());
        }
        if(lineItem.getUnitType()!=null)
            lineItemModel.setUnitType(lineItem.getUnitType());
        if(lineItem.getUnitTypeId()!=null)
            lineItemModel.setUnitTypeId(lineItem.getUnitTypeId().getUnitTypeId());
        if (lineItem.getExciseCategory()!=null){
            lineItemModel.setExciseTaxId(lineItem.getExciseCategory().getId());
        }
        if(lineItem.getDiscount()!= null){
            lineItemModel.setDiscount(lineItem.getDiscount());
        }
        if(lineItem.getDiscountType()!= null){
            lineItemModel.setDiscountType(lineItem.getDiscountType());
        }
        if (lineItem.getExciseAmount()!=null){
            lineItemModel.setExciseAmount(lineItem.getExciseAmount());
        }
        if (lineItem.getVatAmount()!=null){
            lineItemModel.setVatAmount(lineItem.getVatAmount());
        }
        if (lineItem.getVatCategory() != null && lineItem.getVatCategory().getId() != null) {
            lineItemModel.setVatCategoryId(lineItem.getVatCategory().getId().toString());
            lineItemModel.setVatPercentage(lineItem.getVatCategory().getVat().intValue());
        }
        if (lineItem.getProduct() != null) {
            lineItemModel.setProductId(lineItem.getProduct().getProductID());
            lineItemModel.setProductName(lineItem.getProduct().getProductName());
        }
        if(lineItem.getProduct()!=null)
            lineItemModel.setIsExciseTaxExclusive(lineItem.getProduct().getExciseType());
        return lineItemModel;
    }
    public PoQuatationRequestModel getGRNModel(PoQuatation poQuatation) {
        PoQuatationRequestModel poQuatationRequestModel = new PoQuatationRequestModel();
        poQuatationRequestModel.setId(poQuatation.getId());
        poQuatationRequestModel.setPoNumber(poQuatation.getPoNumber());
        Date date = Date.from(poQuatation.getGrnReceiveDate().atZone(ZoneId.systemDefault()).toInstant());
        poQuatationRequestModel.setGrnReceiveDate(date);
        poQuatationRequestModel.setType(poQuatation.getType().toString());
        poQuatationRequestModel.setStatus(CommonStatusEnum.getInvoiceTypeByValue(poQuatation.getStatus()));
        poQuatationRequestModel.setTotalAmount(poQuatation.getTotalAmount());
        poQuatationRequestModel.setTotalExciseAmount(poQuatation.getTotalExciseAmount());
        poQuatationRequestModel.setTotalVatAmount(poQuatation.getTotalVatAmount());
        if (poQuatation.getSupplierId().getOrganization() != null && !poQuatation.getSupplierId().getOrganization().isEmpty() ) {
            poQuatationRequestModel.setSupplierName(poQuatation.getSupplierId().getOrganization());
            poQuatationRequestModel.setSupplierId(poQuatation.getSupplierId().getContactId());
        }
        else {
            poQuatationRequestModel.setSupplierId(poQuatation.getSupplierId().getContactId());
            poQuatationRequestModel.setSupplierName(poQuatation.getSupplierId().getFirstName() + " " + poQuatation.getSupplierId().getLastName());
        }
        poQuatationRequestModel.setGrnNumber(poQuatation.getGrnNumber());
        if (poQuatation.getCurrency()!=null){
            poQuatationRequestModel.setCurrencyCode(poQuatation.getCurrency().getCurrencyCode());
            poQuatationRequestModel.setCurrencySymbol(poQuatation.getCurrency().getCurrencySymbol());
            poQuatationRequestModel.setCurrencyName(poQuatation.getCurrency().getCurrencyName());
            poQuatationRequestModel.setCurrencyIsoCode(poQuatation.getCurrency().getCurrencyIsoCode());
        }
        if (poQuatation.getNotes()!=null){
            poQuatationRequestModel.setNotes(poQuatation.getNotes());
        }
        if (poQuatation.getReferenceNumber()!=null){
            poQuatationRequestModel.setSupplierReferenceNumber(poQuatation.getReferenceNumber());
        }
        if (poQuatation.getSupplierId().getVatRegistrationNumber() != null){
            poQuatationRequestModel.setVatRegistrationNumber(poQuatation.getSupplierId().getVatRegistrationNumber());
        }
        if (poQuatation.getGrnRemarks() != null){
            poQuatationRequestModel.setNotes(poQuatation.getGrnRemarks());
            poQuatationRequestModel.setGrnRemarks(poQuatation.getGrnRemarks());
        }
        List<PoQuatationLineItemRequestModel> poQuatationLineItemRequestModelList= new ArrayList<>();
        getGRNLineItems(poQuatation, poQuatationRequestModel, poQuatationLineItemRequestModelList);
        return poQuatationRequestModel;
    }
    private void getGRNLineItems(PoQuatation poQuatation, PoQuatationRequestModel poQuatationRequestModel, List<PoQuatationLineItemRequestModel> poQuatationLineItemRequestModelList) {
        if (poQuatation.getPoQuatationLineItems() != null && !poQuatation.getPoQuatationLineItems().isEmpty()) {
            for (PoQuatationLineItem lineItem : poQuatation.getPoQuatationLineItems()) {
                PoQuatationLineItemRequestModel model = getGRNLineItemModel(lineItem);
                poQuatationLineItemRequestModelList.add(model);
            }
            poQuatationRequestModel.setPoQuatationLineItemRequestModelList(poQuatationLineItemRequestModelList);
        }
    }
    public PoQuatationLineItemRequestModel getGRNLineItemModel(PoQuatationLineItem lineItem) {
        PoQuatationLineItemRequestModel lineItemModel = new PoQuatationLineItemRequestModel();
        lineItemModel.setId(lineItem.getId());
        lineItemModel.setDescription(lineItem.getDescription());
        lineItemModel.setGrnReceivedQuantity(lineItem.getQuantity());
        lineItemModel.setQuantity(lineItem.getRemainingQuantity());
        lineItemModel.setUnitPrice(lineItem.getUnitCost());
        lineItemModel.setSubTotal(lineItem.getSubTotal());
        if(lineItem.getUnitType()!=null)
            lineItemModel.setUnitType(lineItem.getUnitType());
        if(lineItem.getUnitTypeId()!=null)
            lineItemModel.setUnitTypeId(lineItem.getUnitTypeId().getUnitTypeId());
        if (lineItem.getVatCategory() != null && lineItem.getVatCategory().getId() != null) {
            lineItemModel.setVatCategoryId(lineItem.getVatCategory().getId().toString());
            lineItemModel.setVatPercentage(lineItem.getVatCategory().getVat().intValue());
            lineItemModel.setVatAmount(lineItem.getVatAmount());
        }
        if(lineItem.getExciseCategory() != null && lineItem.getExciseCategory().getId() != null){
            lineItemModel.setExciseTaxId(lineItem.getExciseCategory().getId());
            lineItemModel.setExciseAmount(lineItem.getExciseAmount());
        }
        if (lineItem.getProduct() != null) {
            lineItemModel.setProductId(lineItem.getProduct().getProductID());
            lineItemModel.setProductName(lineItem.getProduct().getProductName());
        }
        return lineItemModel;
    }
    //sendPO
    public void sendPO(PoQuatation poQuatation, Integer userId, PostingRequestModel postingRequestModel,HttpServletRequest request) {
        String subject = "";
        String body = "";
        Contact contact = poQuatation.getSupplierId();

        String quertStr = "SELECT m FROM MailThemeTemplates m WHERE m.moduleId=4 and m.templateEnable=true";

        Query query = entityManager.createQuery(quertStr);

        MailThemeTemplates poEmailBody =(MailThemeTemplates) query.getSingleResult();
        Map<String, String> map = getPOData(poQuatation, userId);
        String content = "";
        String htmlText="";
        String htmlContent="";
        try {
            String emailBody=poEmailBody.getPath();
            byte[] bodyData = Files.readAllBytes(Paths.get(resourceLoader.getResource("classpath:"+emailBody).getURI()));
            byte[] contentData = Files.readAllBytes(Paths.get(  resourceLoader.getResource("classpath:"+PURCHASE_ORDER_TEMPLATE).getURI()));
            String amountInWords="-";
            String vatInWords="-";

            if(postingRequestModel !=null && postingRequestModel.getAmountInWords() !=null)
                amountInWords= postingRequestModel.getAmountInWords();

            if(postingRequestModel !=null && postingRequestModel.getVatInWords() !=null)
                vatInWords= postingRequestModel.getVatInWords();

            htmlText = new String(bodyData, StandardCharsets.UTF_8).replace("{amountInWords}",amountInWords).replace("{vatInWords}",vatInWords);
            htmlContent= new String(contentData, StandardCharsets.UTF_8).replace("{currency}",poQuatation.getCurrency().getCurrencyIsoCode())
                                                                        .replace("{amountInWords}",amountInWords)
                                                                        .replace("{vatInWords}",vatInWords);
        } catch (IOException e) {
            logger.error(ERROR_PROCESSING_QUOTATION, e);
        }

        if (htmlContent !="" && htmlContent !=null ){
            content = mailUtility.create(map, htmlContent);
        }
        if (poEmailBody != null && poEmailBody.getTemplateSubject() != null) {
            subject = mailUtility.create(map, poEmailBody.getTemplateSubject());
        }
        if (poEmailBody != null && !htmlText.isEmpty()) {
            if (poQuatation.getPoQuatationLineItems().size()>1){
                body = mailUtility.create(map,updatePoQuotationLineItem(poQuatation.getPoQuatationLineItems().size(),poEmailBody,postingRequestModel));
            }
            else {
                body = mailUtility.create(map,htmlText);
            }
        }

        if (poQuatation.getSupplierId() != null && contact.getBillingEmail() != null && !contact.getBillingEmail().isEmpty()) {
            mailUtility.triggerEmailOnBackground2(subject,content, body, null, EmailConstant.ADMIN_SUPPORT_EMAIL,
                    EmailConstant.ADMIN_EMAIL_SENDER_NAME, new String[]{poQuatation.getSupplierId().getBillingEmail()},
                    true);
            User user = userService.findByPK(userId);
            EmailLogs emailLogs = new EmailLogs();
            emailLogs.setEmailDate(LocalDateTime.now());
            emailLogs.setEmailTo(poQuatation.getSupplierId().getBillingEmail());
            emailLogs.setEmailFrom(user.getUserEmail());
            String baseUrl = ServletUriComponentsBuilder.fromRequestUri(request)
                    .replacePath(null)
                    .build()
                    .toUriString();
            logger.info(baseUrl);
            emailLogs.setBaseUrl(baseUrl);
            emailLogs.setModuleName("PURCHASE ORDER");
            emaiLogsService.persist(emailLogs);
        } else {
            logger.info("BILLING ADDRESS NOT PRESENT");
        }
    }
    public Map<String, String> getPOData(PoQuatation poQuatation, Integer userId) {
        Map<String, String> map = mailUtility.getPoEmailParamMap();
        Map<String, String> poDataMap = new HashMap<>();
        User user = userService.findByPK(userId);
        for (String key : map.keySet()) {
            String value = map.get(key);
            switch (key) {
                case MailUtility.PO_NO:
                    getPONumber(poQuatation,poDataMap,value);
                    break;
                case MailUtility.PO_RECEIVE_DATE:
                    getPOReceiveDate(poQuatation,poDataMap,value);
                    break;
                case MailUtility.PO_APPROVE_DATE:
                    getPOApproveDate(poQuatation,poDataMap,value);
                    break;
                case MailUtility.PO_AMOUNT:
                    if (poQuatation.getTotalAmount() != null) {
                        poDataMap.put(value, poQuatation.getTotalAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
                    }
                    break;
                case MailUtility.PO_VAT_AMOUNT:
                    if (poQuatation.getTotalVatAmount() != null) {
                        poDataMap.put(value, poQuatation.getTotalVatAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
                    }
                    else{
                        poDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.PRODUCT:
                    getProduct(poQuatation,poDataMap,value);
                    break;
                case MailUtility.UNIT_PRICE:
                    getUnitPrice(poQuatation,poDataMap,value);
                    break;
                case MailUtility.UNIT_TYPE:
                    getUnitType(poQuatation, poDataMap, value);
                    break;
                case MailUtility.EXCISE_AMOUNT:
                    getExciseAmount(poQuatation,poDataMap,value);
                    break;
                case MailUtility.QUANTITY:
                    getQuantity(poQuatation,poDataMap,value);
                    break;
                case MailUtility.SENDER_NAME:
                    poDataMap.put(value, user.getUserEmail());
                    break;
                case MailUtility.COMPANY_NAME:
                    if (user.getCompany() != null) {
                        poDataMap.put(value, user.getCompany().getCompanyName());
                    }
                    else{
                        poDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.VAT_TYPE:
                    if (MailUtility.VAT_TYPE != null)
                        getVat(poQuatation,poDataMap,value);
                    break;
                case MailUtility.SUPPLIER_NAME:
                    getContact(poQuatation,poDataMap,value);
                    break;
                case MailUtility.SUB_TOTAL:
                    getSubTotal(poQuatation,poDataMap,value);
                    break;
                case MailUtility.DESCRIPTION:
                    getProductDescription(poQuatation,poDataMap,value);
                    break;
                case MailUtility.TOTAL:
                    if (poQuatation.getTotalAmount()!=null)
                        poDataMap.put(value, poQuatation.getTotalAmount().toString());
                    else{
                        poDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.TOTAL_NET:
                    if (poQuatation.getTotalAmount()!=null && poQuatation.getTotalVatAmount()!=null && poQuatation.getTotalExciseAmount()!=null)
                        poDataMap.put(value, poQuatation.getTotalAmount().subtract(poQuatation.getTotalVatAmount()).subtract(poQuatation.getTotalExciseAmount()).toString());
                    else{
                        poDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.DISCOUNT:
                    if (poQuatation.getDiscount()!=null)
                        poDataMap.put(value, poQuatation.getTotalAmount().subtract(poQuatation.getTotalExciseAmount().subtract(poQuatation.getTotalVatAmount())).toString());
                    else{
                        poDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.COMPANYLOGO:
                    if (user.getCompany() != null  && user.getCompany().getCompanyLogo() != null) {
                        String image = " data:image/jpg;base64," + DatatypeConverter.printBase64Binary(
                                user.getCompany().getCompanyLogo()) ;
                        poDataMap.put(value, image);
                    } else {
                        poDataMap.put(value, "");
                    }
                    break;
                case MailUtility.CURRENCY:
                    poDataMap.put(value, poQuatation.getCurrency().getCurrencyIsoCode());
                    break;
                case MailUtility.COMPANY_ADDRESS_LINE1:
                    if (user.getCompany() != null) {
                        poDataMap.put(value, user.getCompany().getCompanyAddressLine1());
                    } else {
                        poDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.COMPANY_ADDRESS_LINE2:
                    if (user.getCompany() != null) {
                        poDataMap.put(value, user.getCompany().getCompanyAddressLine2());
                    } else {
                        poDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.COMPANY_POST_ZIP_CODE:
                    if (user.getCompany() != null) {
                        poDataMap.put(value, user.getCompany().getCompanyPostZipCode());
                    } else {
                        poDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.COMPANY_COUNTRY_CODE:
                    if (user.getCompany() != null) {
                        poDataMap.put(value, user.getCompany().getCompanyCountryCode().getCountryName());
                    } else {
                        poDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.COMPANY_STATE_REGION:
                    if (user.getCompany() != null) {
                        poDataMap.put(value, user.getCompany().getCompanyStateCode().getStateName());
                    } else {
                        poDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.VAT_NUMBER:
                    if (user.getCompany() != null) {
                        poDataMap.put(value, user.getCompany().getVatNumber());
                    } else {
                        poDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.COMPANY_MOBILE_NUMBER:
                    if (user.getCompany() != null && user.getCompany().getPhoneNumber() != null){
                        String[] numbers=user.getCompany().getPhoneNumber().split(",");
                        String mobileNumber="";
                        if (numbers.length > 0 && numbers[0] != null) {
                            mobileNumber = mobileNumber.concat(numbers[0]);
                        }
                        poDataMap.put(value,mobileNumber );
                    } else {
                        poDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.VAT_REGISTRATION_NUMBER:
                    getVatRegistrationNumber(poQuatation,poDataMap,value);
                    break;
                case MailUtility.POST_ZIP_CODE:
                    getPostZipCode(poQuatation, poDataMap, value);
                    break;
                case MailUtility.STATUS:
                    getStatus(poQuatation, poDataMap, value);
                    break;
                case MailUtility.CONTACT_COUNTRY:
                    getContactCountry(poQuatation, poDataMap, value);
                    break;
                case MailUtility.CONTACT_STATE:
                    getContactState(poQuatation, poDataMap, value);
                    break;
                case MailUtility.CONTACT_ADDRESS_LINE1:
                    getContactAddress1(poQuatation, poDataMap, value);
                    break;
                case MailUtility.CONTACT_ADDRESS_LINE2:
                    getContactAddress2(poQuatation, poDataMap, value);
                    break;
                case MailUtility.MOBILE_NUMBER:
                    getMobileNumber(poQuatation, poDataMap, value);
                    break;
                case MailUtility.NOTES:
                    getNotes(poQuatation, poDataMap, value);
                    break;
                case MailUtility.EXCISE_TAX:
                    getExciseCategory(poQuatation, poDataMap, value);
                    break;
                case MailUtility.TOTAL_EXCISE_AMOUNT:
                    getTotalExciseAmount(poQuatation, poDataMap, value);
                    break;
                case MailUtility.VAT_AMOUNT:
                    getVatAmount(poQuatation,poDataMap,value);
                    break;
                default:
            }
        }
        return poDataMap;
    }
    private void getPONumber(PoQuatation poQuatation, Map<String, String> poDataMap, String value) {
        if (poQuatation.getPoNumber() != null && !poQuatation.getPoNumber().isEmpty()) {
            poDataMap.put(value, poQuatation.getPoNumber());
        }
        else{
            poDataMap.put(value, "---");
        }
    }
    private void getPOReceiveDate(PoQuatation poQuatation, Map<String, String> poDataMap, String value) {
        if (poQuatation.getPoReceiveDate() != null) {
            poDataMap.put(value, dateFormtUtil.getLocalDateTimeAsString(poQuatation.getPoReceiveDate(), dateFormat));
        }
        else{
            poDataMap.put(value, "---");
        }
    }
    private void getPOApproveDate(PoQuatation poQuatation, Map<String, String> poDataMap, String value) {
        if (poQuatation.getPoApproveDate() != null) {
            poDataMap.put(value,  dateFormtUtil.getLocalDateTimeAsString(poQuatation.getPoApproveDate(), dateFormat));
        }
        else{
            poDataMap.put(value, "---");
        }
    }
    //SendGRN
    public void sendGRN(PoQuatation poQuatation, Integer userId, HttpServletRequest request) {
        String subject = "";
        String body = "";
        Contact contact = poQuatation.getSupplierId();
        String quertStr = "SELECT m FROM MailThemeTemplates m WHERE m.moduleId=5 and m.templateEnable=true";

        Query query = entityManager.createQuery(quertStr);

        MailThemeTemplates grnEmailBody =(MailThemeTemplates) query.getSingleResult();

        Map<String, String> map = getGRNData(poQuatation, userId);
        String content = "";
        String htmlText="";
        String htmlContent="";
        try {
            String emailBody=grnEmailBody.getPath();
            byte[] bodyData = Files.readAllBytes(Paths.get(resourceLoader.getResource("classpath:"+emailBody).getURI()));
            byte[] contentData = Files.readAllBytes(Paths.get(  resourceLoader.getResource("classpath:"+GRN_TEMPLATE).getURI()));
            htmlText = new String(bodyData, StandardCharsets.UTF_8);
            htmlContent= new String(contentData, StandardCharsets.UTF_8);

        } catch (IOException e) {
            logger.error(ERROR_PROCESSING_QUOTATION, e);
        }

        if (htmlContent !="" && htmlContent !=null ){
            content = mailUtility.create(map, htmlContent);
        }
        if (grnEmailBody != null && grnEmailBody.getTemplateSubject() != null) {
            subject = mailUtility.create(map, grnEmailBody.getTemplateSubject());
        }

        if (grnEmailBody != null && !htmlText.isEmpty()) {
            if (poQuatation.getPoQuatationLineItems().size()>1){
                body = mailUtility.create(map,updatePoQuotationLineItemForGrn(poQuatation.getPoQuatationLineItems().size(),grnEmailBody));
            }
            else {
                body = mailUtility.create(map,htmlText);
            }
        }

        if (poQuatation.getSupplierId() != null && contact.getBillingEmail() != null && !contact.getBillingEmail().isEmpty()) {
            mailUtility.triggerEmailOnBackground2(subject,content, body, null, EmailConstant.ADMIN_SUPPORT_EMAIL,
                    EmailConstant.ADMIN_EMAIL_SENDER_NAME, new String[]{poQuatation.getSupplierId().getBillingEmail()},
                    true);
            User user = userService.findByPK(userId);
            EmailLogs emailLogs = new EmailLogs();
            emailLogs.setEmailDate(LocalDateTime.now());
            emailLogs.setEmailTo(poQuatation.getSupplierId().getBillingEmail());
            emailLogs.setEmailFrom(user.getUserEmail());
            String baseUrl = ServletUriComponentsBuilder.fromRequestUri(request)
                    .replacePath(null)
                    .build()
                    .toUriString();
            logger.info(baseUrl);
            emailLogs.setBaseUrl(baseUrl);
            emailLogs.setModuleName("GOODS RECEIVED NOTE");
            emaiLogsService.persist(emailLogs);
        } else {
            logger.info("BILLING ADDRESS NOT PRESENT");
        }
    }
    private Map<String, String> getGRNData(PoQuatation poQuatation, Integer userId) {
        Map<String, String> map = mailUtility.getGRNEmailParamMap();
        Map<String, String> grnDataMap = new HashMap<>();
        User user = userService.findByPK(userId);
        for (String key : map.keySet()) {
            String value = map.get(key);
            switch (key) {
                case MailUtility.GRN_NUMBER:
                    if (poQuatation.getGrnNumber()!=null){
                        grnDataMap.put(value,poQuatation.getGrnNumber());
                    }
                    break;
                case MailUtility.GRN_RECEIVE_DATE:
                    getGrnReceiveDate(poQuatation,grnDataMap,value);
                    break;
                case MailUtility.GRN_REMARKS:
                    getGrnRemarks(poQuatation,grnDataMap,value);
                    break;
                case MailUtility.PRODUCT:
                    getProduct(poQuatation,grnDataMap,value);
                    break;
                case MailUtility.UNIT_PRICE:
                    getUnitPrice(poQuatation,grnDataMap,value);
                    break;
                case MailUtility.UNIT_TYPE:
                    getUnitType(poQuatation, grnDataMap, value);
                    break;
                case MailUtility.QUANTITY:
                    getQuantity(poQuatation,grnDataMap,value);
                    break;
                case MailUtility.SENDER_NAME:
                    grnDataMap.put(value, user.getUserEmail());
                    break;
                case MailUtility.COMPANY_NAME:
                    if (user.getCompany() != null) {
                        grnDataMap.put(value, user.getCompany().getCompanyName());
                    }
                    else{
                        grnDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.VAT_TYPE:
                    if (MailUtility.VAT_TYPE != null) {
                        getVat(poQuatation, grnDataMap, value);
                    }
                    break;
                case MailUtility.DESCRIPTION:
                        getProductDescription(poQuatation,grnDataMap,value);
                    break;
                case MailUtility.SUPPLIER_NAME:
                    getContact(poQuatation,grnDataMap,value);
                    break;
                case MailUtility.COMPANYLOGO:
                    if (user.getCompany() != null  && user.getCompany().getCompanyLogo() != null) {
                        String image = " data:image/jpg;base64," + DatatypeConverter.printBase64Binary(
                                user.getCompany().getCompanyLogo()) ;
                        grnDataMap.put(value, image);
                    } else {
                        grnDataMap.put(value, "");
                    }
                    break;
                case MailUtility.CURRENCY:
                    grnDataMap.put(value, poQuatation.getCurrency().getCurrencyIsoCode());
                    break;
                case MailUtility.COMPANY_ADDRESS_LINE1:
                    if (user.getCompany() != null) {
                        grnDataMap.put(value, user.getCompany().getCompanyAddressLine1());
                    } else {
                        grnDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.COMPANY_ADDRESS_LINE2:
                    if (user.getCompany() != null) {
                        grnDataMap.put(value, user.getCompany().getCompanyAddressLine2());
                    } else {
                        grnDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.COMPANY_POST_ZIP_CODE:
                    if (user.getCompany() != null) {
                        grnDataMap.put(value, user.getCompany().getCompanyPostZipCode());
                    } else {
                        grnDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.COMPANY_COUNTRY_CODE:
                    if (user.getCompany() != null) {
                        grnDataMap.put(value, user.getCompany().getCompanyCountryCode().getCountryName());
                    } else {
                        grnDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.COMPANY_STATE_REGION:
                    if (user.getCompany() != null) {
                        grnDataMap.put(value, user.getCompany().getCompanyStateCode().getStateName());
                    } else {
                        grnDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.VAT_NUMBER:
                    if (user.getCompany() != null) {
                        grnDataMap.put(value, user.getCompany().getVatNumber());
                    } else {
                        grnDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.COMPANY_MOBILE_NUMBER:
                    if (user.getCompany() != null && user.getCompany().getPhoneNumber() != null) {
                        String[] numbers=user.getCompany().getPhoneNumber().split(",");
                        String mobileNumber="";
                        if (numbers.length > 0 && numbers[0] != null) {
                            mobileNumber = mobileNumber.concat(numbers[0]);
                        }
                        grnDataMap.put(value,mobileNumber );
                    } else {
                        grnDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.VAT_REGISTRATION_NUMBER:
                    getVatRegistrationNumber(poQuatation,grnDataMap,value);
                    break;
                case MailUtility.POST_ZIP_CODE:
                    getPostZipCode(poQuatation, grnDataMap, value);
                    break;
                case MailUtility.STATUS:
                    getStatus(poQuatation, grnDataMap, value);
                    break;
                case MailUtility.CONTACT_COUNTRY:
                    getContactCountry(poQuatation, grnDataMap, value);
                    break;
                case MailUtility.CONTACT_STATE:
                    getContactState(poQuatation, grnDataMap, value);
                    break;
                case MailUtility.CONTACT_ADDRESS_LINE1:
                    getContactAddress1(poQuatation, grnDataMap, value);
                    break;
                case MailUtility.CONTACT_ADDRESS_LINE2:
                    getContactAddress2(poQuatation, grnDataMap, value);
                    break;
                case MailUtility.MOBILE_NUMBER:
                    getMobileNumber(poQuatation, grnDataMap, value);
                    break;
                case MailUtility.NOTES:
                    getNotes(poQuatation, grnDataMap, value);
                    break;
                default:
            }
        }
        return grnDataMap;
    }
    private void getGrnRemarks(PoQuatation poQuatation, Map<String, String> grnDataMap, String value) {
        if (poQuatation.getGrnRemarks() != null && !poQuatation.getGrnRemarks().isEmpty()) {
            grnDataMap.put(value, poQuatation.getGrnRemarks());
        }
        else{
            grnDataMap.put(value, "---");
        }
    }
    private void getGrnReceiveDate(PoQuatation poQuatation, Map<String, String> grnDataMap, String value) {
        if (poQuatation.getGrnReceiveDate() != null) {
            grnDataMap.put(value, dateFormtUtil.getLocalDateTimeAsString(poQuatation.getGrnReceiveDate(), dateFormat));
        }
        else{
            grnDataMap.put(value, "---");
        }
    }
    public PoQuatation getPoEntityFromRfq(PoQuatation rfqQuatation, Integer userId) {
        PoQuatation poQuatation = new PoQuatation();
        poQuatation.setRfqNumber(rfqQuatation.getRfqNumber());
        poQuatation.setCreatedBy(userId);
        poQuatation.setCreatedDate(LocalDateTime.now());
        poQuatation.setDeleteFlag(false);
        String nxtInvoiceNo = customizeInvoiceTemplateService.getLastInvoice(4);
        poQuatation.setType(4);
        CustomizeInvoiceTemplate template = customizeInvoiceTemplateService.getInvoiceTemplate(4);
        String suffix=invoiceNumberUtil.fetchSuffixFromString(nxtInvoiceNo);
        template.setSuffix(Integer.parseInt(suffix));
        String prefix= nxtInvoiceNo.substring(0,nxtInvoiceNo.lastIndexOf(suffix));
        template.setPrefix(prefix);
        poQuatation.setPoNumber(prefix+suffix);
        poQuatation.setPoApproveDate(rfqQuatation.getRfqExpiryDate());
        poQuatation.setPoReceiveDate(rfqQuatation.getRfqReceiveDate());
        poQuatation.setSupplierId(rfqQuatation.getSupplierId());
            poQuatation.setTotalAmount(rfqQuatation.getTotalAmount());
            poQuatation.setTotalVatAmount(rfqQuatation.getTotalVatAmount());
        poQuatation.setStatus(CommonStatusEnum.PENDING.getValue());
        List<PoQuatationLineItem> itemModels = new ArrayList<>();
        for (Object lineItemObject : rfqQuatation.getPoQuatationLineItems().stream().toArray()) {
            PoQuatationLineItem rfqQuatationLineItem = (PoQuatationLineItem)lineItemObject;
            PoQuatationLineItem poQuatationLineItem = new PoQuatationLineItem();
            poQuatationLineItem.setCreatedBy(poQuatation.getCreatedBy());
            poQuatationLineItem.setCreatedDate(LocalDateTime.now());
            poQuatationLineItem.setDeleteFlag(false);
                poQuatationLineItem.setQuantity(rfqQuatationLineItem.getQuantity());
                poQuatationLineItem.setUnitType(rfqQuatationLineItem.getUnitType());
                poQuatationLineItem.setRemainingQuantity(rfqQuatationLineItem.getQuantity());
                poQuatationLineItem.setUnitCost(rfqQuatationLineItem.getUnitCost());
                poQuatationLineItem.setProduct(rfqQuatationLineItem.getProduct());
                poQuatationLineItem.setDescription(rfqQuatationLineItem.getDescription());
                poQuatationLineItem.setSubTotal(rfqQuatationLineItem.getSubTotal());
                poQuatationLineItem.setVatCategory(rfqQuatationLineItem.getVatCategory());
            poQuatationLineItem.setPoQuatation(poQuatation);
            itemModels.add(poQuatationLineItem);
        }
        poQuatation.setPoQuatationLineItems(itemModels);
        return poQuatation;
    }
    public PoQuatation getGrnEntityFromPo(PoQuatation purchaseOrderQuatation, Integer userId) {
        PoQuatation poQuatation = new PoQuatation();
        poQuatation.setPoNumber(purchaseOrderQuatation.getPoNumber());
        poQuatation.setCreatedBy(userId);
        poQuatation.setCreatedDate(LocalDateTime.now());
        poQuatation.setDeleteFlag(false);
        String nxtInvoiceNo = customizeInvoiceTemplateService.getLastInvoice(5);
        poQuatation.setType(5);
        CustomizeInvoiceTemplate template = customizeInvoiceTemplateService.getInvoiceTemplate(5);
        String suffix=invoiceNumberUtil.fetchSuffixFromString(nxtInvoiceNo);
        template.setSuffix(Integer.parseInt(suffix));
        String prefix= nxtInvoiceNo.substring(0,nxtInvoiceNo.lastIndexOf(suffix));
        template.setPrefix(prefix);
        poQuatation.setGrnNumber(prefix+suffix);
        poQuatation.setGrnReceiveDate(purchaseOrderQuatation.getPoApproveDate());
        poQuatation.setSupplierId(purchaseOrderQuatation.getSupplierId());
        poQuatation.setTotalAmount(purchaseOrderQuatation.getTotalAmount());
        poQuatation.setTotalVatAmount(purchaseOrderQuatation.getTotalVatAmount());
        poQuatation.setStatus(CommonStatusEnum.PENDING.getValue());
        List<PoQuatationLineItem> itemModels = new ArrayList<>();
        for (PoQuatationLineItem poQuatationLineItem : purchaseOrderQuatation.getPoQuatationLineItems()) {
            PoQuatationLineItem grnQuatationLineItem = new PoQuatationLineItem();
            grnQuatationLineItem.setCreatedBy(poQuatation.getCreatedBy());
            grnQuatationLineItem.setCreatedDate(LocalDateTime.now());
            grnQuatationLineItem.setDeleteFlag(false);
            grnQuatationLineItem.setQuantity(poQuatationLineItem.getQuantity());
            grnQuatationLineItem.setUnitType(poQuatationLineItem.getUnitType());
            poQuatationLineItem.setRemainingQuantity(0);
            grnQuatationLineItem.setUnitCost(poQuatationLineItem.getUnitCost());
            grnQuatationLineItem.setUnitCost(poQuatationLineItem.getUnitCost());
            grnQuatationLineItem.setProduct(poQuatationLineItem.getProduct());
            grnQuatationLineItem.setDescription(poQuatationLineItem.getDescription());
            grnQuatationLineItem.setSubTotal(poQuatationLineItem.getSubTotal());
            grnQuatationLineItem.setVatCategory(poQuatationLineItem.getVatCategory());
            grnQuatationLineItem.setPoQuatation(poQuatation);

            itemModels.add(grnQuatationLineItem);
        }
        poQuatationService.update(purchaseOrderQuatation);
        poQuatation.setPoQuatationLineItems(itemModels);
        return poQuatation;
    }
    public Invoice createSupplierInvoiceForGrn(PoQuatation poQuatation, Integer userId) {
        Invoice supplierInvoice= new Invoice();
        supplierInvoice.setType(1);
        String nxtInvoiceNo = customizeInvoiceTemplateService.getLastInvoice(1);
        CustomizeInvoiceTemplate template = customizeInvoiceTemplateService.getInvoiceTemplate(1);
        String suffix=invoiceNumberUtil.fetchSuffixFromString(nxtInvoiceNo);
        template.setSuffix(Integer.parseInt(suffix));
        String prefix= nxtInvoiceNo.substring(0,nxtInvoiceNo.lastIndexOf(suffix));
        template.setPrefix(prefix);
        supplierInvoice.setReferenceNumber(prefix+suffix);
        supplierInvoice.setCreatedBy(poQuatation.getCreatedBy());
        supplierInvoice.setCreatedDate(poQuatation.getCreatedDate());
        supplierInvoice.setContact(poQuatation.getSupplierId());
        supplierInvoice.setDeleteFlag(false);
        supplierInvoice.setEditFlag(false);
        supplierInvoice.setTaxType(false);
        supplierInvoice.setCurrency(poQuatation.getSupplierId().getCurrency());
        supplierInvoice.setStatus(CommonStatusEnum.PENDING.getValue());
        CurrencyConversion exchangeRate=currencyExchangeService.getExchangeRate(poQuatation.getSupplierId().getCurrency().getCurrencyCode());
        supplierInvoice.setExchangeRate(exchangeRate.getExchangeRate());
        PlaceOfSupply placeOfSupply = placeOfSupplyService.findByPK(2);
        supplierInvoice.setPlaceOfSupplyId(placeOfSupply);
        supplierInvoice.setInvoiceDate(poQuatation.getGrnReceiveDate().toLocalDate());
        supplierInvoice.setInvoiceDueDate(poQuatation.getGrnReceiveDate().toLocalDate());
        supplierInvoice.setDiscount(BigDecimal.ZERO);
        supplierInvoice.setDiscountType(DiscountType.FIXED);
        if (poQuatation.getTotalVatAmount()==null){
            supplierInvoice.setTotalVatAmount(BigDecimal.ZERO);
        }
        else {
            supplierInvoice.setTotalVatAmount(poQuatation.getTotalVatAmount());
        }
        supplierInvoice.setTotalAmount(poQuatation.getTotalAmount());
        supplierInvoice.setDueAmount(supplierInvoice.getTotalAmount());
        supplierInvoice.setTotalExciseAmount(poQuatation.getTotalExciseAmount());
        poQuatation.setStatus(CommonStatusEnum.POST.getValue());
        supplierInvoice.setInvoiceDuePeriod(InvoiceDuePeriodEnum.DUE_ON_RECEIPT);
        List<InvoiceLineItem> itemModels = new ArrayList<>();
        for (Object lineItemObject : poQuatation.getPoQuatationLineItems().stream().toArray()) {
            PoQuatationLineItem poQuatationLineItems = (PoQuatationLineItem)lineItemObject;
            InvoiceLineItem invoiceLineItem = new InvoiceLineItem();
            invoiceLineItem.setCreatedBy(poQuatationLineItems.getCreatedBy());
            invoiceLineItem.setCreatedDate(poQuatationLineItems.getCreatedDate());
            invoiceLineItem.setQuantity(poQuatationLineItems.getQuantity());
            invoiceLineItem.setUnitType(poQuatationLineItems.getUnitType());
            invoiceLineItem.setUnitPrice(poQuatationLineItems.getUnitCost());
            invoiceLineItem.setProduct(poQuatationLineItems.getProduct());
            invoiceLineItem.setDescription(poQuatationLineItems.getDescription());
            invoiceLineItem.setSubTotal(poQuatationLineItems.getSubTotal());
            invoiceLineItem.setVatCategory(poQuatationLineItems.getVatCategory());
            if(poQuatationLineItems.getVatCategory()!= null){
               BigDecimal vatAmount = poQuatationLineItems.getUnitCost().multiply(poQuatationLineItems.getVatCategory().getVat().divide(BigDecimal.valueOf(100)));
                invoiceLineItem.setVatAmount(vatAmount);
            }else {
                invoiceLineItem.setVatAmount(BigDecimal.ZERO);
            }
            invoiceLineItem.setExciseAmount(poQuatationLineItems.getExciseAmount());
            invoiceLineItem.setExciseCategory(poQuatationLineItems.getExciseCategory());
            invoiceLineItem.setDiscountType(DiscountType.FIXED);
            invoiceLineItem.setDiscount(BigDecimal.ZERO);
            invoiceLineItem.setTrnsactioncCategory(transactionCategoryService.findByPK(49));
            invoiceLineItem.setInvoice(supplierInvoice);
            itemModels.add(invoiceLineItem);
        }
        supplierInvoice.setInvoiceLineItems(itemModels);

       return supplierInvoice;
    }
    @Transactional(rollbackFor = Exception.class)
    public PoQuatation getQuatationEntity(PoQuatationRequestModel requestModel, Integer userId) {
        PoQuatation poQuatation = new PoQuatation();
        if (requestModel.getId() != null) {
            poQuatation = poQuatationService.findByPK(requestModel.getId());
        }
        if (poQuatation.getPoQuatationLineItems() != null) {
            poQuatationLineItemService.deleteByRfqId(requestModel.getId());
        }
        if (requestModel.getCurrencyCode()!=null){
            Currency currency = currencyService.findByPK(requestModel.getCurrencyCode());
            poQuatation.setCurrency(currency);
        }
        if (requestModel.getPlaceOfSupplyId() !=null){
            PlaceOfSupply placeOfSupply = placeOfSupplyService.findByPK(requestModel.getPlaceOfSupplyId());
            poQuatation.setPlaceOfSupplyId(placeOfSupply);
        }
        if (requestModel.getExchangeRate()!=null){
         poQuatation.setExchangeRate(requestModel.getExchangeRate());
        }
        if (requestModel.getTaxType()!=null){
            poQuatation.setTaxType(requestModel.getTaxType());
        }
        if (requestModel.getTotalExciseAmount() != null) {
            poQuatation.setTotalExciseAmount(requestModel.getTotalExciseAmount());
        }
        if (requestModel.getReceiptNumber()!=null){
            poQuatation.setReferenceNumber(requestModel.getReceiptNumber());
        }
        poQuatation.setCreatedBy(userId);
        poQuatation.setCreatedDate(LocalDateTime.now());
        poQuatation.setDeleteFlag(false);
        Integer poType =Integer.parseInt(requestModel.getType());
        poQuatation.setType(poType);
        if (requestModel.getCustomerReferenceNumber()!=null){
            poQuatation.setReferenceNumber(requestModel.getCustomerReferenceNumber());
        }
        CustomizeInvoiceTemplate template = customizeInvoiceTemplateService.getInvoiceTemplate(poType);
        String suffix=invoiceNumberUtil.fetchSuffixFromString(requestModel.getQuotationNumber());
        template.setSuffix(Integer.parseInt(suffix));
        String prefix= requestModel.getQuotationNumber().substring(0,requestModel.getQuotationNumber().lastIndexOf(suffix));
        template.setPrefix(prefix);
        customizeInvoiceTemplateService.persist(template);
        poQuatation.setQuotationNumber(requestModel.getQuotationNumber());
        if (requestModel.getCustomerId() != null) {
            Contact contact = contactService.findByPK(requestModel.getCustomerId());
            poQuatation.setCustomer(contact);
            poQuatation.setSupplierId(contact);
        }
        Instant instant = Instant.ofEpochMilli(requestModel.getQuotaionExpiration().getTime());
        LocalDateTime quotationExpirationDate = LocalDateTime.ofInstant(instant,
                ZoneId.systemDefault());
        poQuatation.setQuotaionExpiration(quotationExpirationDate);
        Instant instantQ = Instant.ofEpochMilli(requestModel.getQuotationdate().getTime());
        LocalDateTime quotationDate = LocalDateTime.ofInstant(instantQ,
                ZoneId.systemDefault());
        poQuatation.setQuotaionDate(quotationDate);
        poQuatation.setTotalAmount(requestModel.getTotalAmount());
        poQuatation.setTotalVatAmount(requestModel.getTotalVatAmount());
        poQuatation.setDiscount(requestModel.getDiscount());
        if(requestModel.getNotes()!=null){
            poQuatation.setNotes(requestModel.getNotes());
        }
        //added by shoaib for attachment description in quotation
        if(requestModel.getAttachmentDescription()!=null){
            poQuatation.setAttachmentDescription(requestModel.getAttachmentDescription());
        }
        poQuatation.setStatus(poQuatation.getId() == null ? CommonStatusEnum.PENDING.getValue() : poQuatation.getStatus());
        List<PoQuatationLineItemRequestModel> itemModels = new ArrayList<>();
        lineItemString(requestModel, userId, poQuatation, itemModels);
        return poQuatation;
    }
    public PoQuatationRequestModel getQuotationModel(PoQuatation quotation) {
        PoQuatationRequestModel poQuatationRequestModel = new PoQuatationRequestModel();
        poQuatationRequestModel.setId(quotation.getId());
        poQuatationRequestModel.setQuotationNumber(quotation.getQuotationNumber());
        if (quotation.getQuotaionExpiration() != null) {
            Date date = Date.from(quotation.getQuotaionExpiration().atZone(ZoneId.systemDefault()).toInstant());
            poQuatationRequestModel.setQuotaionExpiration(date);
        }
        if (quotation.getQuotaionDate() != null) {
            Date date = Date.from(quotation.getQuotaionDate().atZone(ZoneId.systemDefault()).toInstant());
            poQuatationRequestModel.setQuotationdate(date);
        }
        if (quotation.getCustomer().getOrganization() != null && !quotation.getCustomer().getOrganization().isEmpty() ) {
            poQuatationRequestModel.setCustomerName(quotation.getCustomer().getOrganization());
            poQuatationRequestModel.setCustomerId(quotation.getCustomer().getContactId());
            poQuatationRequestModel.setTaxtreatment(quotation.getCustomer().getTaxTreatment().getTaxTreatment());
        }
        else {
            poQuatationRequestModel.setCustomerId(quotation.getCustomer().getContactId());
            poQuatationRequestModel.setCustomerName(quotation.getCustomer().getFirstName() + " " + quotation.getCustomer().getLastName());
            poQuatationRequestModel.setTaxtreatment(quotation.getCustomer().getTaxTreatment().getTaxTreatment());
        }
        if (quotation.getReferenceNumber()!=null){
            poQuatationRequestModel.setReceiptNumber(quotation.getReferenceNumber());
        }
        if (quotation.getExchangeRate()!=null)
            poQuatationRequestModel.setExchangeRate(quotation.getExchangeRate());
        if (quotation.getCurrency()!=null){
            poQuatationRequestModel.setCurrencyCode(quotation.getCurrency().getCurrencyCode());
            poQuatationRequestModel.setCurrencySymbol(quotation.getCurrency().getCurrencySymbol());
            poQuatationRequestModel.setCurrencyName(quotation.getCurrency().getCurrencyName());
            poQuatationRequestModel.setCurrencyIsoCode(quotation.getCurrency().getCurrencyIsoCode());
        }
        if (quotation.getCustomer().getVatRegistrationNumber() != null){
            poQuatationRequestModel.setVatRegistrationNumber(quotation.getCustomer().getVatRegistrationNumber());
        }
        if(quotation.getCreatedDate()!=null){
            poQuatationRequestModel.setCreatedDate(quotation.getCreatedDate());
        }
        if (quotation.getTaxType()!=null){
            poQuatationRequestModel.setTaxType(quotation.getTaxType());
        }
        if(quotation.getTotalExciseAmount() != null){
            poQuatationRequestModel.setTotalExciseAmount(quotation.getTotalExciseAmount());
        }
        if (quotation.getPlaceOfSupplyId() !=null){
            poQuatationRequestModel.setPlaceOfSupplyId(quotation.getPlaceOfSupplyId().getId());
        }
        poQuatationRequestModel.setNotes(quotation.getNotes());
        poQuatationRequestModel.setType(quotation.getType().toString());
        poQuatationRequestModel.setStatus(CommonStatusEnum.getInvoiceTypeByValue(quotation.getStatus()));
        poQuatationRequestModel.setTotalAmount(quotation.getTotalAmount());
        poQuatationRequestModel.setTotalVatAmount(quotation.getTotalVatAmount());
        poQuatationRequestModel.setDiscount(quotation.getDiscount());
        poQuatationRequestModel.setTaxtreatment(quotation.getCustomer().getTaxTreatment().getTaxTreatment());
        //added by shoaib for setting attachment description in quotation
        poQuatationRequestModel.setAttachmentDescription(quotation.getAttachmentDescription());
        List<PoQuatationLineItemRequestModel> poQuatationLineItemRequestModelList= new ArrayList<>();
        getQuotationLineItems(quotation, poQuatationRequestModel, poQuatationLineItemRequestModelList);
        return poQuatationRequestModel;
    }
    private void getQuotationLineItems(PoQuatation quotation, PoQuatationRequestModel poQuatationRequestModel, List<PoQuatationLineItemRequestModel> poQuatationLineItemRequestModelList) {
        if (quotation.getPoQuatationLineItems() != null && !quotation.getPoQuatationLineItems().isEmpty()) {
            for (PoQuatationLineItem lineItem : quotation.getPoQuatationLineItems()) {
                PoQuatationLineItemRequestModel model = getQuotationLineItemModel(lineItem);
                poQuatationLineItemRequestModelList.add(model);
            }
            poQuatationRequestModel.setPoQuatationLineItemRequestModelList(poQuatationLineItemRequestModelList);
        }
    }
    public PoQuatationLineItemRequestModel getQuotationLineItemModel(PoQuatationLineItem lineItem) {
        PoQuatationLineItemRequestModel lineItemModel = new PoQuatationLineItemRequestModel();
        lineItemModel.setId(lineItem.getId());
        lineItemModel.setDescription(lineItem.getDescription());
        lineItemModel.setQuantity(lineItem.getQuantity());
        lineItemModel.setUnitType(lineItem.getUnitType());
        lineItemModel.setUnitTypeId(lineItem.getUnitTypeId().getUnitTypeId());
        lineItemModel.setUnitPrice(lineItem.getUnitCost());
        lineItemModel.setSubTotal(lineItem.getSubTotal());
        if (lineItem.getTrnsactioncCategory()!=null){
            lineItemModel.setTransactionCategoryLabel(
                    lineItem.getTrnsactioncCategory().getChartOfAccount().getChartOfAccountName());
            lineItemModel.setTransactionCategoryId(lineItem.getTrnsactioncCategory().getTransactionCategoryId());
        }
        if (lineItem.getExciseCategory()!=null){
            lineItemModel.setExciseTaxId(lineItem.getExciseCategory().getId());
        }
        if (lineItem.getExciseAmount()!=null){
            lineItemModel.setExciseAmount(lineItem.getExciseAmount());
        }
        if (lineItem.getVatAmount()!=null){
            lineItemModel.setVatAmount(lineItem.getVatAmount());
        }
        if (lineItem.getDiscount()!=null){
            lineItemModel.setDiscount(lineItem.getDiscount());
        }
        if (lineItem.getDiscountType()!=null){
            lineItemModel.setDiscountType(lineItem.getDiscountType());
        }
        if (lineItem.getVatCategory() != null && lineItem.getVatCategory().getId() != null) {
            lineItemModel.setVatCategoryId(lineItem.getVatCategory().getId().toString());
            lineItemModel.setVatPercentage(lineItem.getVatCategory().getVat().intValue());
        }
        if (lineItem.getProduct() != null) {
            lineItemModel.setProductId(lineItem.getProduct().getProductID());
            lineItemModel.setProductName(lineItem.getProduct().getProductName());
        }
        if(lineItem.getProduct()!=null)
            lineItemModel.setIsExciseTaxExclusive(lineItem.getProduct().getExciseType());
        return lineItemModel;
    }

    //Quotation

    public List<QuatationListModel> getQuotationListModel(Object poQuataions) {
        List<QuatationListModel> quatationListModels = new ArrayList<>();
        if (poQuataions != null) {
            for (PoQuatation poQuatation : (List<PoQuatation>) poQuataions) {
                QuatationListModel model = new QuatationListModel();
                model.setId(poQuatation.getId());
                model.setQuatationNumber(poQuatation.getQuotationNumber());
                if (poQuatation.getCustomer().getOrganization() != null && !poQuatation.getCustomer().getOrganization().isEmpty()) {
                    model.setCustomerName(poQuatation.getCustomer().getOrganization());
                }
                else{
                    model.setCustomerName(poQuatation.getCustomer().getFirstName()+" "+poQuatation.getCustomer().getLastName());
                }
                if (poQuatation.getQuotaionExpiration() != null) {
                    model.setQuotaionExpiration(dateFormtUtil.getLocalDateTimeAsString(poQuatation.getQuotaionExpiration(), dateFormat));
                }
                if (poQuatation.getQuotaionDate() != null) {
                    model.setQuotationCreatedDate(dateFormtUtil.getLocalDateTimeAsString(poQuatation.getQuotaionDate(), dateFormat));
                }
                if (poQuatation.getCurrency()!=null){
                    model.setCurrencyName(poQuatation.getCurrency().getCurrencyName());
                    model.setCurrencyIsoCode(poQuatation.getCurrency().getCurrencyIsoCode());
                }
                if (poQuatation.getTotalAmount()!= null) {
                    model.setTotalAmount(poQuatation.getTotalAmount());
                }
                if (poQuatation.getTotalVatAmount()!= null) {
                    model.setTotalVatAmount(poQuatation.getTotalVatAmount());
                }
                if (poQuatation.getStatus() != null) {
                    model.setStatus(CommonStatusEnum.getInvoiceTypeByValue(poQuatation.getStatus()));
                }
                if (poQuatation.getCustomer() != null) {
                    model.setSupplierId(poQuatation.getCustomer().getContactId());
                    model.setSupplierName(poQuatation.getCustomer().getFirstName());
                }
                if (poQuatation.getCustomer().getVatRegistrationNumber() != null){
                    model.setVatRegistrationNumber(model.getVatRegistrationNumber());
                }
                quatationListModels.add(model);
            }
        }
        return quatationListModels;
    }


    public void sendQuotation(PoQuatation poQuatation, Integer userId, PostingRequestModel postingRequestModel,HttpServletRequest request) {
        String subject = "";
        String body = "";
        Contact contact = poQuatation.getSupplierId();
        String quertStr = "SELECT m FROM MailThemeTemplates m WHERE m.moduleId=6 and m.templateEnable=true";

        Query query = entityManager.createQuery(quertStr);

        MailThemeTemplates quatationEmailBody =(MailThemeTemplates) query.getSingleResult();
        Map<String, String> map = getQuotationData(poQuatation, userId);
        //code added by mudassar for quotation email issue
        String content = "";
        String htmlText="";
        String htmlContent="";
        try {
            String emailBody=quatationEmailBody.getPath();

            byte[] bodyData = Files.readAllBytes(Paths.get(resourceLoader.getResource("classpath:"+emailBody).getURI()));
            byte[] contentData = Files.readAllBytes(Paths.get(  resourceLoader.getResource("classpath:"+ QUOTATION_TEMPLATE).getURI()));

            String amountInWords="-";
            String vatInWords="-";

            if(postingRequestModel !=null && postingRequestModel.getAmountInWords() !=null)
                amountInWords= postingRequestModel.getAmountInWords();

            if(postingRequestModel !=null && postingRequestModel.getVatInWords() !=null)
                vatInWords= postingRequestModel.getVatInWords();

            htmlText = new String(bodyData, StandardCharsets.UTF_8).replace("{amountInWords}",amountInWords).replace("{vatInWords}",vatInWords);
            htmlContent= new String(contentData, StandardCharsets.UTF_8).replace("{currency}",poQuatation.getCurrency().getCurrencyIsoCode())
                    .replace("{amountInWords}",amountInWords)
                    .replace("{vatInWords}",vatInWords);

        } catch (IOException e) {
            logger.error(ERROR_PROCESSING_QUOTATION, e);
        }
        if (htmlContent != null && !htmlContent.isEmpty()) {
            content = mailUtility.create(map, htmlContent);
        }
        if (quatationEmailBody != null && quatationEmailBody.getTemplateSubject() != null) {
            subject = mailUtility.create(map, quatationEmailBody.getTemplateSubject());
        }

        if (quatationEmailBody != null && !htmlText.isEmpty()) {
           if (poQuatation.getPoQuatationLineItems().size()>1){
                body = mailUtility.create(map,updatePoQuotationLineItem(poQuatation.getPoQuatationLineItems().size(),quatationEmailBody,postingRequestModel));
            }
            else {
                body = mailUtility.create(map,htmlText);
            }
        }

     if (poQuatation.getSupplierId() != null && contact.getBillingEmail() != null && !contact.getBillingEmail().isEmpty()) {
        mailUtility.triggerEmailOnBackground2(subject,content, body, null, EmailConstant.ADMIN_SUPPORT_EMAIL,
                EmailConstant.ADMIN_EMAIL_SENDER_NAME, new String[]{poQuatation.getSupplierId().getBillingEmail()},
                true);
        User user = userService.findByPK(userId);
        EmailLogs emailLogs = new EmailLogs();
        emailLogs.setEmailDate(LocalDateTime.now());
        emailLogs.setEmailTo(poQuatation.getSupplierId().getBillingEmail());
        emailLogs.setEmailFrom(user.getUserEmail());
        String baseUrl = ServletUriComponentsBuilder.fromRequestUri(request)
                .replacePath(null)
                .build()
                .toUriString();
        emailLogs.setBaseUrl(baseUrl);
        emailLogs.setModuleName("PURCHASE ORDER");
        emaiLogsService.persist(emailLogs);
    } else {
        logger.info("BILLING ADDRESS NOT PRESENT");
    }
}
    public Map<String, String> getQuotationData(PoQuatation poQuatation, Integer userId) {
        Map<String, String> map = mailUtility.getQuotationEmailParamMap();
        Map<String, String> quotationDataMap = new HashMap<>();
        User user = userService.findByPK(userId);
        for (String key : map.keySet()) {
            String value = map.get(key);
            switch (key) {
                case MailUtility.QUOTATION_NO:
                    getQuotationNumber(poQuatation,quotationDataMap,value);
                    break;
                case MailUtility.DISCOUNT:
                    getDiscount(poQuatation,quotationDataMap,value);
                    break;
                case MailUtility.INVOICE_DISCOUNT:
                    getDiscount(poQuatation,quotationDataMap,value);
                    break;
                case MailUtility.QUOTATION_CREATED_DATE:
                    getQuotationCreatedDate(poQuatation,quotationDataMap,value);
                    break;
                case MailUtility.QUOTATION_EXPIRATION_DATE:
                    getQuotationExpirationDate(poQuatation,quotationDataMap,value);
                    break;
                case MailUtility.QUOTATION_TOTAL_VAT_AMOUNT:
                    if (poQuatation.getTotalVatAmount() != null) {
                        quotationDataMap.put(value, poQuatation.getTotalVatAmount().toString());
                    }                    break;
                case MailUtility.TOTAL_NET:
                    if (poQuatation.getTotalAmount()!=null && poQuatation.getTotalVatAmount()!=null && poQuatation.getTotalExciseAmount()!=null)
                        quotationDataMap.put(value, poQuatation.getTotalAmount().subtract(poQuatation.getTotalVatAmount()).subtract(poQuatation.getTotalExciseAmount()).toString());
                    else{
                        quotationDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.PRODUCT:
                    getProduct(poQuatation,quotationDataMap,value);
                    break;
                case MailUtility.UNIT_PRICE:
                    getUnitPrice(poQuatation,quotationDataMap,value);
                    break;
                case MailUtility.UNIT_TYPE:
                    getUnitType(poQuatation, quotationDataMap, value);
                    break;
                case MailUtility.QUANTITY:
                    getQuantity(poQuatation,quotationDataMap,value);
                    break;
                case MailUtility.SENDER_NAME:
                    quotationDataMap.put(value, user.getUserEmail());
                    break;
                case MailUtility.COMPANYLOGO:
                    if (user.getCompany() != null  && user.getCompany().getCompanyLogo() != null) {
                        String image = " data:image/jpg;base64," + DatatypeConverter.printBase64Binary(
                                user.getCompany().getCompanyLogo()) ;
                        quotationDataMap.put(value, image);
                    } else {
                        quotationDataMap.put(value, "");
                    }
                    break;
                case MailUtility.CURRENCY:
                    quotationDataMap.put(value, poQuatation.getCurrency().getCurrencyIsoCode());
                    break;
                case MailUtility.COMPANY_NAME:
                    if (user.getCompany() != null)
                        quotationDataMap.put(value, user.getCompany().getCompanyName());
                    break;
                case MailUtility.VAT_TYPE:
                    if (MailUtility.VAT_TYPE != null)
                        getVat(poQuatation,quotationDataMap,value);
                    break;
                case MailUtility.CUSTOMER_NAME:
                    if (MailUtility.CUSTOMER_NAME != null)
                        getCustomerName(poQuatation,quotationDataMap,value);
                    break;
                case MailUtility.TOTAL:
                    if (poQuatation.getTotalAmount()!=null)
                        quotationDataMap.put(value, poQuatation.getTotalAmount().toString());
                    else{
                        quotationDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.SUPPLIER_NAME:
                    getContact(poQuatation,quotationDataMap,value);
                    break;
                case MailUtility.SUB_TOTAL:
                    getSubTotal(poQuatation,quotationDataMap,value);
                    break;
                case MailUtility.COMPANY_ADDRESS_LINE1:
                    if (user.getCompany() != null) {
                        quotationDataMap.put(value, user.getCompany().getCompanyAddressLine1());
                    } else {
                        quotationDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.COMPANY_ADDRESS_LINE2:
                    if (user.getCompany() != null) {
                        quotationDataMap.put(value,user.getCompany().getCompanyAddressLine2());
                    } else {
                        quotationDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.COMPANY_POST_ZIP_CODE:
                    if (user.getCompany() != null) {
                        quotationDataMap.put(value,user.getCompany().getCompanyPostZipCode());

                    } else {
                        quotationDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.COMPANY_COUNTRY_CODE:
                    if (user.getCompany() != null) {
                        quotationDataMap.put(value, user.getCompany().getCompanyCountryCode().getCountryName());
                    } else {
                        quotationDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.COMPANY_STATE_REGION:
                    if (user.getCompany() != null) {
                        quotationDataMap.put(value, user.getCompany().getCompanyStateCode().getStateName());
                    } else {
                        quotationDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.VAT_NUMBER:
                    if (user.getCompany() != null) {
                        quotationDataMap.put(value, user.getCompany().getVatNumber());
                    } else {
                        quotationDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.COMPANY_MOBILE_NUMBER:
                    if (user.getCompany() != null && user.getCompany().getPhoneNumber() != null){
                        String[] numbers=user.getCompany().getPhoneNumber().split(",");
                        String mobileNumber="";
                        if (numbers.length > 0 && numbers[0] != null) {
                            mobileNumber = mobileNumber.concat(numbers[0]);
                        }
                        quotationDataMap.put(value,mobileNumber );
                    } else {
                        quotationDataMap.put(value, "---");
                    }
                    break;
                case MailUtility.VAT_REGISTRATION_NUMBER:
                    getVatRegistrationNumber(poQuatation,quotationDataMap,value);
                    break;
                case MailUtility.POST_ZIP_CODE:
                    getPostZipCode(poQuatation, quotationDataMap, value);
                    break;
                case MailUtility.CONTACT_COUNTRY:
                    getContactCountry(poQuatation, quotationDataMap, value);
                    break;
                case MailUtility.CONTACT_STATE:
                    getContactState(poQuatation, quotationDataMap, value);
                    break;
                case MailUtility.CONTACT_ADDRESS_LINE1:
                    getContactAddress1(poQuatation, quotationDataMap, value);
                    break;
                case MailUtility.CONTACT_ADDRESS_LINE2:
                    getContactAddress2(poQuatation, quotationDataMap, value);
                    break;
                case MailUtility.MOBILE_NUMBER:
                    getMobileNumber(poQuatation, quotationDataMap, value);
                    break;
                case MailUtility.STATUS:
                    getStatus(poQuatation, quotationDataMap, value);
                    break;
                case MailUtility.NOTES:
                    getNotes(poQuatation, quotationDataMap, value);
                    break;
                case MailUtility.TOTAL_EXCISE_AMOUNT:
                    getTotalExciseAmount(poQuatation, quotationDataMap, value);
                    break;
                case MailUtility.VAT_AMOUNT:
                    getVatAmount(poQuatation,quotationDataMap,value);
                    break;
                case MailUtility.DESCRIPTION:
                    getProductDescription(poQuatation,quotationDataMap,value);
                    break;
                case MailUtility.EXCISE_TAX:
                    getExciseCategory(poQuatation, quotationDataMap, value);
                    break;
                case MailUtility.EXCISE_AMOUNT:
                    getExciseAmount(poQuatation,quotationDataMap,value);
                    break;
                default:
            }
        }
        return quotationDataMap;
    }
    private void getQuotationNumber(PoQuatation poQuatation, Map<String, String> dataMap, String value) {
        if (poQuatation.getQuotationNumber() != null && !poQuatation.getQuotationNumber().isEmpty()) {
            dataMap.put(value, poQuatation.getQuotationNumber());
        }
        else{
            dataMap.put(value, "---");
        }
    }

    private void getDiscount(PoQuatation poQuatation, Map<String, String> invoiceDataMap, String value) {
        int row=0;
        if (value.equals("{invoiceDiscount}")){
            invoiceDataMap.put(value, poQuatation.getDiscount().toString());
        }
        else {
            if (poQuatation.getPoQuatationLineItems() != null) {
                for(PoQuatationLineItem invoiceLineItem : poQuatation.getPoQuatationLineItems()){
                    if (invoiceLineItem.getDiscount()!= null) {
                        if (row==0){
                            row++;
                            String percentagesymbol = invoiceLineItem.getDiscountType().equals(DiscountType.PERCENTAGE) ? "%" : "";
                            invoiceDataMap.put(value, invoiceLineItem.getDiscount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString() +percentagesymbol);
                        }
                        else {
                            String percentagesymbol = invoiceLineItem.getDiscountType().equals(DiscountType.PERCENTAGE) ? "%" : "";
                            invoiceDataMap.put("{discount"+row+"}", invoiceLineItem.getDiscount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString()+percentagesymbol);
                            row++;
                        }
                    }
                    else{
                        invoiceDataMap.put(value, "---");
                    }
                }
            }
        }
    }

    private void getQuotationExpirationDate(PoQuatation poQuatation, Map<String, String> dataMap, String value) {
        if (poQuatation.getQuotaionExpiration() != null) {
            dataMap.put(value, dateFormtUtil.getLocalDateTimeAsString(poQuatation.getQuotaionExpiration(), dateFormat));
        }
        else{
            dataMap.put(value, "---");
        }
    }
    private void getQuotationCreatedDate(PoQuatation poQuatation, Map<String, String> dataMap, String value) {
        if (poQuatation.getQuotaionDate() != null) {
            dataMap.put(value, dateFormtUtil.getLocalDateTimeAsString(poQuatation.getQuotaionDate(), dateFormat));
        }
        else{
            dataMap.put(value, "---");
        }
    }

    private void getCustomerName(PoQuatation poQuatation, Map<String, String> dataMap, String value) {
        if(poQuatation.getCustomer() != null && !poQuatation.getCustomer().getOrganization().isEmpty()){
            dataMap.put(value,poQuatation.getCustomer().getOrganization());
        }
      else if (poQuatation.getCustomer() != null && !poQuatation.getCustomer().getFirstName().isEmpty()) {
            StringBuilder sb = new StringBuilder();
            Contact c = poQuatation.getCustomer();
            if (c.getFirstName() != null && !c.getFirstName().isEmpty()) {
                sb.append(c.getFirstName()).append(" ");
            }
            if (c.getMiddleName() != null && !c.getMiddleName().isEmpty()) {
                sb.append(c.getMiddleName()).append(" ");
            }
            if (c.getLastName() != null && !c.getLastName().isEmpty()) {
                sb.append(c.getLastName());
            }
            dataMap.put(value, sb.toString());
        }
        else {
            dataMap.put(value,"---");
        }
    }
    private String updatePoQuotationLineItem(int size, MailThemeTemplates invoiceEmailBody,PostingRequestModel postingRequestModel) {

        String productRow="<tr><td style=\"word-wrap: break-word; width: 25%;max-width:20px;\"><b>{product} </b><br> {description}</td><td style=\"text-align:center\">{quantity}</td><td style=\"text-align:center\">{unitType}</td><td style=\"text-align:right\">{unitPrice}</td><td style=\"text-align:right\">{discount}</td><td style=\"text-align:left\">{exciseCategory}</td><td style=\"text-align:right\">{exciseAmount}</td><td style=\"text-align:right\">{vatType}</td><td style=\"text-align:right\">{vatAmount}</td><td style=\"text-align:right\">{subTotal}</td></tr>";
        StringBuilder productRowBuilder = new StringBuilder(productRow);
        for (int row=1;row<size;row++){
            productRowBuilder.append("<tr>" +
                    "<td style=\"word-wrap: break-word; width: 25%;max-width:20px;\"><b>{product"+row+"} </b><br> {description"+row+"}</td>" +
                    "<td style=\"text-align:center\">{quantity"+row+"}</td>" +
                    "<td style=\"text-align:center\">{unitType"+row+"}</td>"+
                    "<td style=\"text-align:right\">{unitPrice"+row+"}</td>" +
                    "<td style=\"text-align:right\">{discount"+row+"}</td>" +
                    "<td style=\"text-align:left\">{exciseCategory"+row+"}</td>" +
                    "<td style=\"text-align:right\">{exciseAmount"+row+"}</td>" +
                    "<td style=\"text-align:right\">{vatType"+row+"}</td>" +
                    "<td style=\"text-align:right\">{vatAmount"+row+"}</td>" +
                    "<td style=\"text-align:right\">{subTotal"+row+"}</td>" +
                    "</tr>");
        }


        String htmlText="";
        String amountInWords="-";
        String vatInWords="-";

            if(postingRequestModel !=null && postingRequestModel.getAmountInWords() !=null)
                amountInWords= postingRequestModel.getAmountInWords();
            if(postingRequestModel !=null && postingRequestModel.getVatInWords() !=null)
                vatInWords= postingRequestModel.getVatInWords();

        try {
            byte[] bodyData = Files.readAllBytes(Paths.get(resourceLoader.getResource("classpath:"+invoiceEmailBody.getPath()).getURI()));

            htmlText = new String(bodyData, StandardCharsets.UTF_8).replace("{amountInWords}",amountInWords.concat("ONLY")).replace("{vatInWords}",vatInWords.concat("ONLY"));

        } catch (IOException e) {
            logger.error(ERROR_PROCESSING_QUOTATION, e);
        }
        StringBuilder emailBodyBuilder = new StringBuilder();
        emailBodyBuilder.append(htmlText.substring(0,htmlText.indexOf(productRow)));
        emailBodyBuilder.append(productRowBuilder.toString());
        emailBodyBuilder.append(htmlText.substring(htmlText.indexOf(productRow)+productRow.length(),htmlText.length()));
        return emailBodyBuilder.toString();
    }

    private String updatePoQuotationLineItemForGrn(int size, MailThemeTemplates invoiceEmailBody) {

        String productRow="<tr><td>{product}</td><td>{description}</td><td style=\"text-align:center\">{quantity}</td><td style=\"text-align:center\">{unitType}</td></tr>";
        StringBuilder productRowBuilder = new StringBuilder(productRow);
        for (int row=1;row<size;row++){
            productRowBuilder.append("<tr>" +
                    "                <td>{product"+row+"}</td>" +
                    "                 <td>{description"+row+"}</td>" +
                    "                 <td style=\"text-align:center\">{quantity"+row+"}</td>" +
                    "                 <td style=\"text-align:center\">{unitType"+row+"}</td>"+
                    "            </tr>");
        }


        String htmlText="";

        try {
            byte[] bodyData = Files.readAllBytes(Paths.get(resourceLoader.getResource("classpath:"+invoiceEmailBody.getPath()).getURI()));

            htmlText = new String(bodyData, StandardCharsets.UTF_8);

        } catch (IOException e) {
            logger.error(ERROR_PROCESSING_QUOTATION, e);
        }
        StringBuilder emailBodyBuilder = new StringBuilder();
        emailBodyBuilder.append(htmlText.substring(0,htmlText.indexOf(productRow)));
        emailBodyBuilder.append(productRowBuilder.toString());
        emailBodyBuilder.append(htmlText.substring(htmlText.indexOf(productRow)+productRow.length(),htmlText.length()));
        return emailBodyBuilder.toString();
    }
}

