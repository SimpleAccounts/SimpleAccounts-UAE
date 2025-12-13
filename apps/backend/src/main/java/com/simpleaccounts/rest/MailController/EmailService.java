package com.simpleaccounts.rest.MailController;

import static com.simpleaccounts.rest.invoicecontroller.HtmlTemplateConstants.*;

import com.simpleaccounts.constant.ConfigurationConstants;
import com.simpleaccounts.constant.EmailConstant;
import com.simpleaccounts.dao.MailThemeTemplates;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.repository.InvoiceRepository;
import com.simpleaccounts.rest.creditnotecontroller.CreditNoteRepository;
import com.simpleaccounts.rest.invoicecontroller.InvoiceRestHelper;
import com.simpleaccounts.rfq_po.PoQuatation;
import com.simpleaccounts.rfq_po.PoQuatationLineItem;
import com.simpleaccounts.rfq_po.PoQuatationRepository;
import com.simpleaccounts.rfq_po.PoQuatationRestHelper;
import com.simpleaccounts.service.ConfigurationService;
import com.simpleaccounts.service.EmaiLogsService;
import com.simpleaccounts.service.MailThemeTemplatesService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.utils.MailUtility;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import java.io.File;
import java.io.IOException;
import java.io.StringWriter;

import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.servlet.http.HttpServletRequest;
import javax.xml.bind.DatatypeConverter;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import static com.simpleaccounts.rest.invoicecontroller.HtmlTemplateConstants.*;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private static final String ERROR_PROCESSING_EMAIL = "Error processing email";
    private static final String MODEL_KEY_EMAIL_CONTENT_REQUEST = "emailContentRequestModel";
    private static final String MODEL_KEY_LINE_ITEM_LIST = "lineItemList";
    private static final String DATA_IMAGE_JPG_BASE64 = " data:image/jpg;base64,";
    private static final String PRODUCT_ROW_TEMPLATE = "<tr><td>{product}</td><td>{description}</td><td style=\"text-align:center\">{quantity}</td><td style=\"text-align:center\">{unitType}</td><td style=\"text-align:right\">{unitPrice}</td><td style=\"text-align:right\">{discount}</td><td style=\"text-align:center\">{invoiceLineItemExciseTax}</td><td style=\"text-align:right\">{exciseAmount}</td><td style=\"text-align:center\">{vatType}</td><td style=\"text-align:right\">{invoiceLineItemVatAmount}</td><td style=\"text-align:right\">{subTotal}</td></tr>";
    private static final String MODEL_KEY_USER = "user";
    private static final String MODEL_KEY_INVOICE = "invoice";
    private static final String MODEL_KEY_INVOICE_LABEL = "invoiceLabel";
    private static final String MODEL_KEY_COMPANY_LOGO = "companylogo";
    private static final String MODEL_KEY_CONTACT_NAME = "contactName";
    private static final String MODEL_KEY_TOTAL_NET = "totalNet";
    private static final String MODEL_KEY_TOTAL_TAX = "totalTax";
    private static final String MODEL_KEY_COMPANY_NAME = "companyName";
    private static final String MODEL_KEY_QUOTATION = "quotation";
    private static final String MODEL_KEY_CREDIT_NOTE = "creditNote";
    private static final String CLASSPATH_PREFIX = "classpath:";
    private static final String TEMPLATE_PLACEHOLDER_AMOUNT_IN_WORDS = "{amountInWords}";
    private static final String TEMPLATE_PLACEHOLDER_VAT_IN_WORDS = "{vatInWords}";
    private static final String TEMPLATE_PLACEHOLDER_CURRENCY = "{currency}";

    private final ResourceLoader resourceLoader;
    private final EmaiLogsService emaiLogsService;
    private final UserService userService;

    private final freemarker.template.Configuration configuration;

    private final InvoiceRepository invoiceRepository;

    private final PoQuatationRestHelper poQuatationRestHelper;
    private final MailUtility mailUtility;
    private final ConfigurationService configurationService;

    private final InvoiceRestHelper invoiceRestHelper;

    private final MailThemeTemplatesService mailThemeTemplatesService;
    private final PoQuatationRepository poQuatationRepository;
    private final CreditNoteRepository creditNoteRepository;
    public EmailContentModel getEmailContent(EmailContentRequestModel emailContentRequestModel, Integer userId) throws TemplateException, IOException {
        EmailContentModel emailContentModel = new EmailContentModel();
        Integer id = emailContentRequestModel.getId();
        Integer type = emailContentRequestModel.getType();
        switch (type) {
            case 1: // Invoice
                return getInvoiceContent(id, type, userId, emailContentRequestModel, emailContentModel);
            case 7: // Credit Note
                return getCreditNoteContent(id, type, userId, emailContentRequestModel, emailContentModel);
            case 6: // Quotation
                return getQuotationContent(id, type, userId, emailContentRequestModel, emailContentModel);
            case 4: // Purchase Order
                return getPurchaseOrderContent(id, type, userId, emailContentRequestModel, emailContentModel);
            default:
                break;
        }
        return null;
    }
    public void sendCustomizedEmail(EmailContentModel emailContentModel, Integer userId, HttpServletRequest request) {
        //To save the uploaded file in
        List<FileAttachment> fileAttachments=new ArrayList<>();
        List<MultipartFile> files = emailContentModel.getAttachmentFiles();

        List<File> fileNames = new ArrayList<>();
        Map<String,byte[]> fileMetaData = new HashMap<>();

        // read and write the file to the local folder
        if( files != null )
            files.stream().forEach(file -> {
                byte[] bytes = new byte[0];
                try {
                    bytes = file.getBytes();
                    fileMetaData.put(file.getOriginalFilename(),bytes);
                } catch (IOException e) {
                    logger.error(ERROR_PROCESSING_EMAIL, e);
                }
            });

        mailUtility.triggerEmailOnBackground3(
                emailContentModel.getSubject(),
                emailContentModel.getEmailContent(),
                emailContentModel.getPdfBody(),
                files,
                emailContentModel.getFromEmailAddress(),
                EmailConstant.ADMIN_EMAIL_SENDER_NAME,
                new String[]{emailContentModel.getBillingEmail()},
                true,
                emailContentModel.getPdfFilesData(),
                fileNames,fileMetaData,
                emailContentModel
        );
    }
    private EmailContentModel getInvoiceContent(Integer id, Integer moduleId, int userId,
                                                       EmailContentRequestModel emailContentRequestModel, EmailContentModel emailContentModel) throws TemplateException, IOException {
        String subject = "";
        String body = "";
        User user = userService.findByPK(userId);
        Optional<Invoice> optionalInvoice = invoiceRepository.findById(id);
        if (!optionalInvoice.isPresent()) {
            logger.error("Invoice not found for id: {}", id);
            return null;
        }
        Invoice invoice = optionalInvoice.get();
        MailThemeTemplates invoiceEmailBody = mailThemeTemplatesService.getMailThemeTemplate(moduleId);
        Map<String, String> map = invoiceRestHelper.getInvoiceData(invoice, userId);
        String content = "";
        String htmlText = "";
        String htmlContent = "";
        String freeMakerHtmlContent = "";
        //FreeMaker

        String fileName = invoiceEmailBody.getPath();
        Map<String, Object> model = new HashMap<>();
        model.put(MODEL_KEY_USER, user);
        model.put(MODEL_KEY_INVOICE, invoice);
        model.put(MODEL_KEY_INVOICE_LABEL, getInvoiceLabel(user));
        model.put(MODEL_KEY_EMAIL_CONTENT_REQUEST, emailContentRequestModel);
        model.put(MODEL_KEY_LINE_ITEM_LIST, invoice.getInvoiceLineItems());
        if (user.getCompany() != null && user.getCompany().getCompanyLogo() != null) {
            String image = DATA_IMAGE_JPG_BASE64 + DatatypeConverter.printBase64Binary(
                    user.getCompany().getCompanyLogo());
            model.put(MODEL_KEY_COMPANY_LOGO, image);
        }
        model.put(MODEL_KEY_CONTACT_NAME,getContactName(invoice));
        model.put(MODEL_KEY_TOTAL_NET,invoice.getTotalAmount().subtract(invoice.getTotalVatAmount()).setScale(2, RoundingMode.HALF_EVEN).toString());
        model.put("notes",getnotes(invoice));
        model.put("invoiceDiscount",getInvoiceDiscount(invoice));
        model.put(MODEL_KEY_TOTAL_TAX, getTotalTax(invoice));
        model.put(MODEL_KEY_COMPANY_NAME,user.getCompany().getCompanyName());
        freeMakerHtmlContent = getTemplateToHtmlString(model, fileName);
        logger.info(freeMakerHtmlContent);
//        //End of FreeMakerx
//
//
          try {
            String emailBody=invoiceEmailBody.getPath();
//
            byte[] bodyData = Files.readAllBytes(Paths.get(resourceLoader.getResource(CLASSPATH_PREFIX+emailBody).getURI()));
            byte[] contentData = Files.readAllBytes(Paths.get(  resourceLoader.getResource(CLASSPATH_PREFIX+ INVOICE_TEMPLATE).getURI()));
//
            String amountInWords= emailContentRequestModel.getAmountInWords();
            String vatInWords= emailContentRequestModel.getTaxInWords();

            htmlText = new String(bodyData, StandardCharsets.UTF_8);
            htmlText =htmlText.replace(TEMPLATE_PLACEHOLDER_AMOUNT_IN_WORDS,amountInWords).replace(TEMPLATE_PLACEHOLDER_VAT_IN_WORDS,vatInWords);

            htmlContent= new String(contentData, StandardCharsets.UTF_8)
                    .replace(TEMPLATE_PLACEHOLDER_CURRENCY,invoice.getCurrency().getCurrencyIsoCode());
        } catch (IOException e) {
            logger.error(ERROR_PROCESSING_EMAIL, e);
        }
        if (htmlContent !="" && htmlContent !=null ){
            content = mailUtility.create(map, htmlContent);
        }
        if (invoiceEmailBody != null && invoiceEmailBody.getTemplateSubject() != null) {
            subject = mailUtility.create(map, invoiceEmailBody.getTemplateSubject());
        }
        if (invoiceEmailBody != null && !htmlText.isEmpty()) {
            if (invoice.getInvoiceLineItems().size()>1){
                body = mailUtility.create(map,updateInvoiceLineItem(invoice.getInvoiceLineItems().size()
                        ,invoiceEmailBody,emailContentRequestModel));
            }
            else {
                body = mailUtility.create(map,htmlText);
            }
        }
        Configuration fromEmailConfiguration = configurationService.getConfigurationByName(ConfigurationConstants.FROM_EMAIL_ADDRESS);
        Configuration configuration = configurationService.getConfigurationByName(ConfigurationConstants.LOGGED_IN_USER_FLAG);

         if (configuration.getValue().equals("true")) {
            emailContentModel.setFromEmailAddress(user.getUserEmail());
        }
         else if (fromEmailConfiguration!= null && fromEmailConfiguration.getValue()!= null && !fromEmailConfiguration.getValue().isEmpty()) {
            emailContentModel.setFromEmailAddress(fromEmailConfiguration.getValue());
        }
        else {
            User user1 = userService.findByPK(10000);
            emailContentModel.setFromEmailAddress(user1.getUserEmail());
        }
        emailContentModel.setFromEmailName(EmailConstant.ADMIN_EMAIL_SENDER_NAME);
        emailContentModel.setBillingEmail(invoice.getContact().getBillingEmail());
        emailContentModel.setSubject(subject);
        emailContentModel.setEmailContent(content);
        emailContentModel.setPdfBody(freeMakerHtmlContent);
        emailContentModel.setType(emailContentRequestModel.getType());
        return emailContentModel;
    }
    private EmailContentModel getCreditNoteContent(Integer id, Integer moduleId, int userId,
                                                EmailContentRequestModel emailContentRequestModel, EmailContentModel emailContentModel) throws TemplateException, IOException {
        String subject = "";
        String body = "";
        User user = userService.findByPK(userId);
        Optional<CreditNote> optionalCreditNote = creditNoteRepository.findById(id);
        if (!optionalCreditNote.isPresent()) {
            logger.error("CreditNote not found for id: {}", id);
            return null;
        }
        CreditNote creditNote = optionalCreditNote.get();
        Optional<Invoice> optionalInvoice = invoiceRepository.findById(creditNote.getInvoiceId());
        if (!optionalInvoice.isPresent()) {
            logger.error("Invoice not found for CreditNote id: {}", id);
            return null;
        }
        Invoice invoice = optionalInvoice.get();
        MailThemeTemplates creditNoteEmailBody = mailThemeTemplatesService.getMailThemeTemplate(moduleId);
        Map<String, String> map = invoiceRestHelper.getInvoiceData(invoice, userId);
        String content = "";
        String htmlText = "";
        String htmlContent = "";
        String freeMakerHtmlContent = "";
        //FreeMaker

        String fileName = creditNoteEmailBody.getPath();
        Map<String, Object> model = new HashMap<>();
        model.put(MODEL_KEY_USER, user);
        model.put(MODEL_KEY_INVOICE, invoice);
        model.put(MODEL_KEY_CREDIT_NOTE, creditNote);
        model.put(MODEL_KEY_INVOICE_LABEL, getInvoiceLabel(user));
        model.put(MODEL_KEY_EMAIL_CONTENT_REQUEST, emailContentRequestModel);
        model.put(MODEL_KEY_LINE_ITEM_LIST, creditNote.getCreditNoteLineItems());
        if (user.getCompany() != null && user.getCompany().getCompanyLogo() != null) {
            String image = DATA_IMAGE_JPG_BASE64 + DatatypeConverter.printBase64Binary(
                    user.getCompany().getCompanyLogo());
            model.put(MODEL_KEY_COMPANY_LOGO, image);
        }
        model.put(MODEL_KEY_CONTACT_NAME,getContactName(invoice));
        model.put(MODEL_KEY_TOTAL_NET,invoice.getTotalAmount().subtract(invoice.getTotalVatAmount()).setScale(2, RoundingMode.HALF_EVEN).toString());
        model.put("notes",getnotes(invoice));
        model.put("invoiceDiscount",getInvoiceDiscount(invoice));
        model.put(MODEL_KEY_TOTAL_TAX, getTotalTax(invoice));
        model.put(MODEL_KEY_COMPANY_NAME,user.getCompany().getCompanyName());
        freeMakerHtmlContent = getTemplateToHtmlString(model, fileName);
        logger.info(freeMakerHtmlContent);
//        //End of FreeMakerx
//
//
        try {
            String emailBody=creditNoteEmailBody.getPath();
//
            byte[] bodyData = Files.readAllBytes(Paths.get(resourceLoader.getResource(CLASSPATH_PREFIX+emailBody).getURI()));
            byte[] contentData = Files.readAllBytes(Paths.get(  resourceLoader.getResource(CLASSPATH_PREFIX+ CN_TEMPLATE).getURI()));
//
            String amountInWords= emailContentRequestModel.getAmountInWords();
            String vatInWords= emailContentRequestModel.getTaxInWords();

            htmlText = new String(bodyData, StandardCharsets.UTF_8);
            htmlText =htmlText.replace(TEMPLATE_PLACEHOLDER_AMOUNT_IN_WORDS,amountInWords).replace(TEMPLATE_PLACEHOLDER_VAT_IN_WORDS,vatInWords);

            htmlContent= new String(contentData, StandardCharsets.UTF_8)
                    .replace(TEMPLATE_PLACEHOLDER_CURRENCY,invoice.getCurrency().getCurrencyIsoCode());
        } catch (IOException e) {
            logger.error(ERROR_PROCESSING_EMAIL, e);
        }
        if (htmlContent !="" && htmlContent !=null ){
            content = mailUtility.create(map, htmlContent);
        }
        if (creditNoteEmailBody != null && creditNoteEmailBody.getTemplateSubject() != null) {
            subject = mailUtility.create(map, creditNoteEmailBody.getTemplateSubject());
        }
        if (creditNoteEmailBody != null && !htmlText.isEmpty()) {
            if (invoice.getInvoiceLineItems().size()>1){
                body = mailUtility.create(map,updateInvoiceLineItem(invoice.getInvoiceLineItems().size()
                        ,creditNoteEmailBody,emailContentRequestModel));
            }
            else {
                body = mailUtility.create(map,htmlText);
            }
        }
        Configuration fromEmailConfiguration = configurationService.getConfigurationByName(ConfigurationConstants.FROM_EMAIL_ADDRESS);
        Configuration configuration = configurationService.getConfigurationByName(ConfigurationConstants.LOGGED_IN_USER_FLAG);

        if (configuration.getValue().equals("true")) {
            emailContentModel.setFromEmailAddress(user.getUserEmail());
        }
        else if (fromEmailConfiguration!= null && fromEmailConfiguration.getValue()!= null && !fromEmailConfiguration.getValue().isEmpty()) {
            emailContentModel.setFromEmailAddress(fromEmailConfiguration.getValue());
        }
        else {
            User user1 = userService.findByPK(10000);
            emailContentModel.setFromEmailAddress(user1.getUserEmail());
        }
        emailContentModel.setFromEmailName(EmailConstant.ADMIN_EMAIL_SENDER_NAME);
        emailContentModel.setBillingEmail(invoice.getContact().getBillingEmail());
        emailContentModel.setSubject(subject);
        emailContentModel.setEmailContent(content);
        emailContentModel.setPdfBody(freeMakerHtmlContent);
        emailContentModel.setType(emailContentRequestModel.getType());
        return emailContentModel;
    }
    private EmailContentModel getQuotationContent(Integer id, Integer moduleId, int userId,
                                                   EmailContentRequestModel emailContentRequestModel, EmailContentModel emailContentModel) throws TemplateException, IOException {
        String subject = "";
        String body = "";
        User user = userService.findByPK(userId);
        Optional<PoQuatation> optionalQuotation = poQuatationRepository.findById(id);
        if (!optionalQuotation.isPresent()) {
            logger.error("Quotation not found for id: {}", id);
            return null;
        }
        PoQuatation quotation = optionalQuotation.get();
        MailThemeTemplates quotationEmailBody = mailThemeTemplatesService.getMailThemeTemplate(moduleId);
        Map<String, String> map = poQuatationRestHelper.getQuotationData(quotation, userId);
        String content = "";
        String htmlText = "";
        String htmlContent = "";
        String freeMakerHtmlContent = "";

        String fileName = quotationEmailBody.getPath();
        Map<String, Object> model = new HashMap<>();
        model.put(MODEL_KEY_USER, user);
        model.put(MODEL_KEY_QUOTATION, quotation);
        model.put(MODEL_KEY_EMAIL_CONTENT_REQUEST, emailContentRequestModel);
        model.put(MODEL_KEY_LINE_ITEM_LIST, quotation.getPoQuatationLineItems());
        if (user.getCompany() != null && user.getCompany().getCompanyLogo() != null) {
            String image = DATA_IMAGE_JPG_BASE64 + DatatypeConverter.printBase64Binary(
                    user.getCompany().getCompanyLogo());
            model.put(MODEL_KEY_COMPANY_LOGO, image);
        }
        model.put(MODEL_KEY_CONTACT_NAME, getQuotationContactName(quotation));
        model.put("contactAddressLine1", quotation.getCustomer().getAddressLine1());
        model.put("contactCity", quotation.getCustomer().getCity());
        model.put("contactState", quotation.getCustomer().getState().getStateName());
        model.put("postZipCode", quotation.getCustomer().getPostZipCode());
        model.put("contactEmail", quotation.getCustomer().getEmail());
        model.put("currency", quotation.getCustomer().getCurrency().getCurrencyIsoCode());
        model.put("currencySymbol", quotation.getCustomer().getCurrency().getCurrencySymbol());
        model.put("referenceNumber", quotation.getReferenceNumber());
        model.put(MODEL_KEY_TOTAL_TAX, getTotalTax(quotation));
        model.put(MODEL_KEY_COMPANY_NAME, user.getCompany().getCompanyName());
        model.put(MODEL_KEY_TOTAL_NET,quotation.getTotalAmount().subtract(quotation.getTotalVatAmount()).setScale(2, RoundingMode.HALF_EVEN).toString());
        freeMakerHtmlContent = getTemplateToHtmlString(model, fileName);
        logger.info(freeMakerHtmlContent);
        //End of FreeMaker

        try {
            String emailBody = quotationEmailBody.getPath();

            byte[] bodyData = Files.readAllBytes(Paths.get(resourceLoader.getResource(CLASSPATH_PREFIX + emailBody).getURI()));
            byte[] contentData = Files.readAllBytes(Paths.get(resourceLoader.getResource(CLASSPATH_PREFIX + QUOTATION_TEMPLATE).getURI()));

            String amountInWords = emailContentRequestModel.getAmountInWords();
            String vatInWords = emailContentRequestModel.getTaxInWords();

          Currency quotationCurrencyRelation = quotation.getCurrency();
            htmlText = new String(bodyData, StandardCharsets.UTF_8);
            htmlText = htmlText.replace("{amountInWords}", amountInWords).replace("{vatInWords}", vatInWords);

            htmlContent = new String(contentData, StandardCharsets.UTF_8)
                    .replace(TEMPLATE_PLACEHOLDER_CURRENCY, quotationCurrencyRelation.getCurrencyIsoCode());
        } catch (IOException e) {
            logger.error(ERROR_PROCESSING_EMAIL, e);
        }
        if (htmlContent != "" && htmlContent != null) {
            content = mailUtility.create(map, htmlContent);
        }
        if (quotationEmailBody != null && quotationEmailBody.getTemplateSubject() != null) {
            subject = mailUtility.create(map, quotationEmailBody.getTemplateSubject());
        }
        if (quotationEmailBody != null && !htmlText.isEmpty()) {
            if (quotation.getPoQuatationLineItems().size() > 1) {
                body = mailUtility.create(map, updatePoQuotationLineItem(quotation.getPoQuatationLineItems().size()
                        , quotationEmailBody, emailContentRequestModel));
            } else {
                body = mailUtility.create(map, htmlText);
            }
        }

        Configuration fromEmailConfiguration = configurationService.getConfigurationByName(ConfigurationConstants.FROM_EMAIL_ADDRESS);
        Configuration configuration = configurationService.getConfigurationByName(ConfigurationConstants.LOGGED_IN_USER_FLAG);

        if (configuration.getValue().equals("true")) {
            emailContentModel.setFromEmailAddress(user.getUserEmail());
        }
        else if (fromEmailConfiguration!= null && fromEmailConfiguration.getValue()!= null && !fromEmailConfiguration.getValue().isEmpty()) {
            emailContentModel.setFromEmailAddress(fromEmailConfiguration.getValue());
        }
        else {
            User user1 = userService.findByPK(10000);
            emailContentModel.setFromEmailAddress(user1.getUserEmail());
        }

        emailContentModel.setFromEmailName(EmailConstant.ADMIN_EMAIL_SENDER_NAME);
        emailContentModel.setBillingEmail(quotation.getCustomer().getBillingEmail());
        emailContentModel.setSubject(subject);
        emailContentModel.setEmailContent(content);
        emailContentModel.setPdfBody(freeMakerHtmlContent);
        emailContentModel.setType(emailContentRequestModel.getType());
        return emailContentModel;
    }
    private EmailContentModel getPurchaseOrderContent(Integer id, Integer moduleId, int userId,
                                                  EmailContentRequestModel emailContentRequestModel, EmailContentModel emailContentModel) throws TemplateException, IOException {
        String subject = "";
        String body = "";
        User user = userService.findByPK(userId);
        Optional<PoQuatation> optionalQuotation = poQuatationRepository.findById(id);
        if (!optionalQuotation.isPresent()) {
            logger.error("Purchase Order not found for id: {}", id);
            return null;
        }
        PoQuatation quotation = optionalQuotation.get();
        MailThemeTemplates quotationEmailBody = mailThemeTemplatesService.getMailThemeTemplate(moduleId);
        Map<String, String> map = poQuatationRestHelper.getPOData(quotation, userId);
        String content = "";
        String htmlText = "";
        String htmlContent = "";
        String freeMakerHtmlContent = "";

        String fileName = quotationEmailBody.getPath();
        Map<String, Object> model = new HashMap<>();
        model.put(MODEL_KEY_USER, user);
        model.put(MODEL_KEY_QUOTATION, quotation);
        model.put(MODEL_KEY_EMAIL_CONTENT_REQUEST, emailContentRequestModel);
        model.put(MODEL_KEY_LINE_ITEM_LIST, quotation.getPoQuatationLineItems());
        if (user.getCompany() != null && user.getCompany().getCompanyLogo() != null) {
            String image = DATA_IMAGE_JPG_BASE64 + DatatypeConverter.printBase64Binary(
                    user.getCompany().getCompanyLogo());
            model.put(MODEL_KEY_COMPANY_LOGO, image);
        }
        model.put(MODEL_KEY_CONTACT_NAME, getPoQuotationContactName(quotation));
        model.put("contactAddressLine1", quotation.getSupplierId().getAddressLine1());
        model.put("contactCity", quotation.getSupplierId().getCity());
        model.put("contactState", quotation.getSupplierId().getState().getStateName());
        model.put("postZipCode", quotation.getSupplierId().getPostZipCode());
        model.put("contactEmail", quotation.getSupplierId().getEmail());
        model.put("currency", quotation.getSupplierId().getCurrency().getCurrencyIsoCode());
        model.put("currencySymbol", quotation.getSupplierId().getCurrency().getCurrencySymbol());
        model.put("referenceNumber", quotation.getReferenceNumber());
        model.put(MODEL_KEY_TOTAL_TAX, getTotalTax(quotation));
        model.put(MODEL_KEY_COMPANY_NAME, user.getCompany().getCompanyName());
        freeMakerHtmlContent = getTemplateToHtmlString(model, fileName);
        logger.info(freeMakerHtmlContent);
        //End of FreeMaker

        try {
            String emailBody = quotationEmailBody.getPath();

            byte[] bodyData = Files.readAllBytes(Paths.get(resourceLoader.getResource(CLASSPATH_PREFIX + emailBody).getURI()));
            byte[] contentData = Files.readAllBytes(Paths.get(resourceLoader.getResource(CLASSPATH_PREFIX + PURCHASE_ORDER_TEMPLATE).getURI()));

            String amountInWords = emailContentRequestModel.getAmountInWords();
            String vatInWords = emailContentRequestModel.getTaxInWords();

            Currency quotationCurrencyRelation = quotation.getCurrency();
            htmlText = new String(bodyData, StandardCharsets.UTF_8);
            htmlText = htmlText.replace("{amountInWords}", amountInWords).replace("{vatInWords}", vatInWords);

            htmlContent = new String(contentData, StandardCharsets.UTF_8)
                    .replace(TEMPLATE_PLACEHOLDER_CURRENCY, quotationCurrencyRelation.getCurrencyIsoCode());
        } catch (IOException e) {
            logger.error(ERROR_PROCESSING_EMAIL, e);
        }
        if (htmlContent != "" && htmlContent != null) {
            content = mailUtility.create(map, htmlContent);
        }
        if (quotationEmailBody != null && quotationEmailBody.getTemplateSubject() != null) {
            subject = mailUtility.create(map, quotationEmailBody.getTemplateSubject());
        }
        if (quotationEmailBody != null && !htmlText.isEmpty()) {
            if (quotation.getPoQuatationLineItems().size() > 1) {
                body = mailUtility.create(map, updatePoQuotationLineItem(quotation.getPoQuatationLineItems().size()
                        , quotationEmailBody, emailContentRequestModel));
            } else {
                body = mailUtility.create(map, htmlText);
            }
        }

        Configuration fromEmailConfiguration = configurationService.getConfigurationByName(ConfigurationConstants.FROM_EMAIL_ADDRESS);
        Configuration configuration = configurationService.getConfigurationByName(ConfigurationConstants.LOGGED_IN_USER_FLAG);

        if (configuration.getValue().equals("true")) {
            emailContentModel.setFromEmailAddress(user.getUserEmail());
        }
        else if (fromEmailConfiguration!= null && fromEmailConfiguration.getValue()!= null && !fromEmailConfiguration.getValue().isEmpty()) {
            emailContentModel.setFromEmailAddress(fromEmailConfiguration.getValue());
        }
        else {
            User user1 = userService.findByPK(10000);
            emailContentModel.setFromEmailAddress(user1.getUserEmail());
        }

        emailContentModel.setFromEmailName(EmailConstant.ADMIN_EMAIL_SENDER_NAME);
        emailContentModel.setBillingEmail(quotation.getSupplierId().getBillingEmail());
        emailContentModel.setSubject(subject);
        emailContentModel.setEmailContent(content);
        emailContentModel.setPdfBody(freeMakerHtmlContent);
        emailContentModel.setType(emailContentRequestModel.getType());
        return emailContentModel;
    }
    public String getTemplateToHtmlString(Map<String, Object> model,String fileName)
            throws IOException, TemplateException {
        String freeMakerHtmlContent;
        StringWriter stringWriter = new StringWriter();

            configuration.setDirectoryForTemplateLoading(
                new File(Paths.get(resourceLoader.getResource(CLASSPATH_PREFIX)
                        .getURI()).toUri()));
        Template template = configuration.getTemplate(fileName);
        template.process(model, stringWriter);
        freeMakerHtmlContent= stringWriter.getBuffer().toString();
        return freeMakerHtmlContent;
    }
    private String getContactName(Invoice invoice) {
        if (invoice.getContact() != null && !invoice.getContact().getFirstName().isEmpty()) {
            StringBuilder sb = new StringBuilder();
            Contact c = invoice.getContact();
            if (c.getFirstName() != null && !c.getFirstName().isEmpty()) {
                sb.append(c.getFirstName()).append(" ");
            }
            if (c.getMiddleName() != null && !c.getMiddleName().isEmpty()) {
                sb.append(c.getMiddleName()).append(" ");
            }
            if (c.getLastName() != null && !c.getLastName().isEmpty()) {
                sb.append(c.getLastName());
            }
            return sb.toString();
        }
        return "";
    }
    private String getInvoiceLabel(User user) {
        if (user.getCompany().getIsRegisteredVat().equals(Boolean.TRUE)) {
            return "Tax Invoice";
        } else {
            return "Customer Invoice";
        }
    }
    private Object getnotes(Invoice invoice) {
        if (invoice.getNotes() != null && !invoice.getNotes().isEmpty()) {
            StringBuilder sb = new StringBuilder();
            invoice.getNotes();
            if (invoice.getNotes() != null && !invoice.getNotes().isEmpty()) {
                sb.append(invoice.getNotes()).append(" ");
            }
            return sb.toString();
        }
        return null;
    }
    private Object getInvoiceDiscount(Invoice invoice) {
        if (invoice.getDiscount() != null){
            return invoice.getDiscount().toString();
        }
        return "--";
    }
    private Object getTotalTax(Invoice invoice) {
        if (invoice.getInvoiceLineItems() != null) {
            for (InvoiceLineItem invoiceLineItem : invoice.getInvoiceLineItems()) {
                if (invoiceLineItem.getVatCategory() != null) {
                    DecimalFormat decimalFormat = new DecimalFormat("0.#####");
                    String vatAmount = decimalFormat.format(Double.valueOf(String.valueOf(invoiceLineItem.getVatCategory().getVat())));
                    return "("+invoiceLineItem.getVatCategory().getName()+")"+" "+vatAmount;
                }
            }
        }
        return null;
    }
    public String updateInvoiceLineItem(int size, MailThemeTemplates invoiceEmailBody, EmailContentRequestModel postingRequestModel)  {
        StringBuilder productRowBuilder = new StringBuilder();
        String productRowTemplate = PRODUCT_ROW_TEMPLATE;

        for (int row = 0; row < size; row++) {
            String updatedProductRow = productRowTemplate
                    .replace("{product}", "{product" + row + "}")
                    .replace("{description}", "{description" + row + "}")
                    .replace("{quantity}", "{quantity" + row + "}")
                    .replace("{unitType}", "{unitType" + row + "}")
                    .replace("{unitPrice}", "{unitPrice" + row + "}")
                    .replace("{discount}", "{discount" + row + "}")
                    .replace("{invoiceLineItemExciseTax}", "{invoiceLineItemExciseTax" + row + "}")
                    .replace("{exciseAmount}", "{exciseAmount" + row + "}")
                    .replace("{vatType}", "{vatType" + row + "}")
                    .replace("{invoiceLineItemVatAmount}", "{invoiceLineItemVatAmount" + row + "}")
                    .replace("{subTotal}", "{subTotal" + row + "}");
            productRowBuilder.append(updatedProductRow);
        }

        String htmlText = "";
        try {
            byte[] bodyData = Files.readAllBytes(Paths.get(resourceLoader.getResource(CLASSPATH_PREFIX + invoiceEmailBody.getPath()).getURI()));
            htmlText = new String(bodyData, StandardCharsets.UTF_8);
        } catch (IOException e) {
            logger.error(ERROR_PROCESSING_EMAIL, e);
        }

        StringBuilder emailBodyBuilder = new StringBuilder();
        int productRowStartIndex = htmlText.indexOf(productRowTemplate);
        int productRowEndIndex = productRowStartIndex + productRowTemplate.length();
        emailBodyBuilder.append(htmlText, 0, productRowEndIndex);
        emailBodyBuilder.append(productRowBuilder.toString());
        emailBodyBuilder.append(htmlText.substring(productRowEndIndex));

        return emailBodyBuilder.toString();
    }
    public String updateCreditNoteLineItem(int size, MailThemeTemplates invoiceEmailBody, EmailContentRequestModel postingRequestModel)  {
        StringBuilder productRowBuilder = new StringBuilder();
        String productRowTemplate = PRODUCT_ROW_TEMPLATE;

        for (int row = 0; row < size; row++) {
            String updatedProductRow = productRowTemplate
                    .replace("{product}", "{product" + row + "}")
                    .replace("{description}", "{description" + row + "}")
                    .replace("{quantity}", "{quantity" + row + "}")
                    .replace("{unitType}", "{unitType" + row + "}")
                    .replace("{unitPrice}", "{unitPrice" + row + "}")
                    .replace("{discount}", "{discount" + row + "}")
                    .replace("{invoiceLineItemExciseTax}", "{invoiceLineItemExciseTax" + row + "}")
                    .replace("{exciseAmount}", "{exciseAmount" + row + "}")
                    .replace("{vatType}", "{vatType" + row + "}")
                    .replace("{invoiceLineItemVatAmount}", "{invoiceLineItemVatAmount" + row + "}")
                    .replace("{subTotal}", "{subTotal" + row + "}");
            productRowBuilder.append(updatedProductRow);
        }

        String htmlText = "";
        try {
            byte[] bodyData = Files.readAllBytes(Paths.get(resourceLoader.getResource(CLASSPATH_PREFIX + invoiceEmailBody.getPath()).getURI()));
            htmlText = new String(bodyData, StandardCharsets.UTF_8);
        } catch (IOException e) {
            logger.error(ERROR_PROCESSING_EMAIL, e);
        }

        StringBuilder emailBodyBuilder = new StringBuilder();
        int productRowStartIndex = htmlText.indexOf(productRowTemplate);
        int productRowEndIndex = productRowStartIndex + productRowTemplate.length();
        emailBodyBuilder.append(htmlText, 0, productRowEndIndex);
        emailBodyBuilder.append(productRowBuilder.toString());
        emailBodyBuilder.append(htmlText.substring(productRowEndIndex));

        return emailBodyBuilder.toString();
    }
    private Object getQuotationContactName(PoQuatation quotation) {
        if (quotation.getCustomer() != null && !quotation.getCustomer().getFirstName().isEmpty()) {
            StringBuilder sb = new StringBuilder();
            Contact c = quotation.getCustomer();

            if (c.getFirstName() != null && !c.getFirstName().isEmpty()) {
                sb.append(c.getFirstName()).append(" ");
            }
            if (c.getMiddleName() != null && !c.getMiddleName().isEmpty()) {
                sb.append(c.getMiddleName()).append(" ");
            }
            if (c.getLastName() != null && !c.getLastName().isEmpty()) {
                sb.append(c.getLastName());
            }

            return sb.toString();
        }
        return "";
    }
    private Object getPoQuotationContactName(PoQuatation quotation) {
        if (quotation.getSupplierId() != null && !quotation.getSupplierId().getFirstName().isEmpty()) {
            StringBuilder sb = new StringBuilder();
            Contact c = quotation.getSupplierId();

            if (c.getFirstName() != null && !c.getFirstName().isEmpty()) {
                sb.append(c.getFirstName()).append(" ");
            }
            if (c.getMiddleName() != null && !c.getMiddleName().isEmpty()) {
                sb.append(c.getMiddleName()).append(" ");
            }
            if (c.getLastName() != null && !c.getLastName().isEmpty()) {
                sb.append(c.getLastName());
            }

            return sb.toString();
        }
        return "";
    }
    private Object getTotalTax(PoQuatation quotation) {
        if (quotation.getPoQuatationLineItems() != null) {
            for (PoQuatationLineItem quotationLineItem : quotation.getPoQuatationLineItems()) {
                if (quotationLineItem.getVatCategory() != null) {
                    DecimalFormat decimalFormat = new DecimalFormat("0.#####");
                    String vatAmount = decimalFormat.format(Double.valueOf(String.valueOf(quotationLineItem.getVatCategory().getVat())));
                    return "("+quotationLineItem.getVatCategory().getName()+")"+" "+vatAmount;
                }
            }
        }
        return null;
    }
    public String updatePoQuotationLineItem(int size, MailThemeTemplates invoiceEmailBody, EmailContentRequestModel postingRequestModel)  {
        StringBuilder productRowBuilder = new StringBuilder();
        String productRowTemplate = PRODUCT_ROW_TEMPLATE;

        for (int row = 0; row < size; row++) {
            String updatedProductRow = productRowTemplate
                    .replace("{product}", "{product" + row + "}")
                    .replace("{description}", "{description" + row + "}")
                    .replace("{quantity}", "{quantity" + row + "}")
                    .replace("{unitType}", "{unitType" + row + "}")
                    .replace("{unitPrice}", "{unitPrice" + row + "}")
                    .replace("{discount}", "{discount" + row + "}")
                    .replace("{invoiceLineItemExciseTax}", "{invoiceLineItemExciseTax" + row + "}")
                    .replace("{exciseAmount}", "{exciseAmount" + row + "}")
                    .replace("{vatType}", "{vatType" + row + "}")
                    .replace("{invoiceLineItemVatAmount}", "{invoiceLineItemVatAmount" + row + "}")
                    .replace("{subTotal}", "{subTotal" + row + "}");
            productRowBuilder.append(updatedProductRow);
        }

        String htmlText = "";
        try {
            byte[] bodyData = Files.readAllBytes(Paths.get(resourceLoader.getResource(CLASSPATH_PREFIX + invoiceEmailBody.getPath()).getURI()));
            htmlText = new String(bodyData, StandardCharsets.UTF_8);
        } catch (IOException e) {
            logger.error(ERROR_PROCESSING_EMAIL, e);
        }

        StringBuilder emailBodyBuilder = new StringBuilder();
        int productRowStartIndex = htmlText.indexOf(productRowTemplate);
        int productRowEndIndex = productRowStartIndex + productRowTemplate.length();
        emailBodyBuilder.append(htmlText, 0, productRowEndIndex);
        emailBodyBuilder.append(productRowBuilder.toString());
        emailBodyBuilder.append(htmlText.substring(productRowEndIndex));

        return emailBodyBuilder.toString();
    }
}
