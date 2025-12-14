package com.simpleaccounts.service.impl;

import static com.simpleaccounts.rest.invoicecontroller.HtmlTemplateConstants.THANK_YOU_TEMPLATE;

import com.simpleaccounts.constant.EmailConstant;
import com.simpleaccounts.constant.dbfilter.ContactFilterEnum;
import com.simpleaccounts.dao.ContactDao;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.EmailLogs;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.contactcontroller.ContactRequestFilterModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.ContactService;
import com.simpleaccounts.service.EmaiLogsService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.utils.EmailSender;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;
import javax.xml.bind.DatatypeConverter;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/**
 * Created by mohsin on 3/3/2017.
 */
@Service("contactService")
@Transactional
@RequiredArgsConstructor
public class ContactServiceImpl extends ContactService {
    private static final String TEMPLATE_VAR_PAYMODE = "{paymode}";
    private static final String TEMPLATE_VAR_NUMBER = "{number}";
    
    private final Logger logger = LoggerFactory.getLogger(ContactService.class);
    private final ResourceLoader resourceLoader;
    private final ContactDao contactDao;
    private final UserService userService;
    private final EmailSender emailSender;
    private final EmaiLogsService emaiLogsService;

    private final JwtTokenUtil jwtTokenUtil;
    @Override
    public List<DropdownModel> getContactForDropdown(Integer contactType) {
        return this.contactDao.getContactForDropdown(contactType);
    }

    public List<DropdownObjectModel> getContactForDropdownObjectModel(Integer contactType)
    {
        return this.contactDao.getContactForDropdownObjectModel(contactType);
    }

    @Override
    public PaginationResponseModel getContactList(Map<ContactFilterEnum, Object> filterDataMap,PaginationModel paginationModel) {
        return this.contactDao.getContactList(filterDataMap,paginationModel);
    }

    @Override
    public List<Contact> getAllContacts(Integer pageNo, Integer pageSize) {
        return this.contactDao.getAllContacts(pageNo, pageSize);
    }

    @Override
    public List<Contact> getContacts(ContactRequestFilterModel filterModel, Integer pageNo, Integer pageSize) {
        return this.contactDao.getContacts(filterModel, pageNo, pageSize);
    }

    @Override
    public List<Contact> getContacts(Integer contactType, final String searchQuery, Integer pageNo, Integer pageSize) {
        return contactDao.getContacts(contactType, searchQuery, pageNo, pageSize);
    }

    @Override
    public Dao<Integer, Contact> getDao() {
        return this.contactDao;
    }

    @Override
    public Optional<Contact> getContactByEmail(String Email) {
        return contactDao.getContactByEmail(Email);
    }

    @Override
    public Optional<Contact> getContactByID(Integer contactId)
    {
        return contactDao.getContactByID(contactId);
    }

    @Override
    public void deleleByIds(List<Integer> ids) {
        contactDao.deleteByIds(ids);
    }
    //CSI
    @Override
    public boolean sendInvoiceThankYouMail(Contact contact, Integer invoiceType, String number, String amount, String date, BigDecimal dueAmount, HttpServletRequest request) {
        long millis=System.currentTimeMillis();

        Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
        User user=userService.findByPK(userId);
        String image="";
        if (user.getCompany() != null  && user.getCompany().getCompanyLogo() != null) {
            image = " data:image/jpg;base64," + DatatypeConverter.printBase64Binary(
                    user.getCompany().getCompanyLogo()) ;

        }
        String htmlContent="";
        try {
        byte[] contentData = Files.readAllBytes(Paths.get(resourceLoader.getResource("classpath:"+THANK_YOU_TEMPLATE).getURI()));
            htmlContent= new String(contentData, StandardCharsets.UTF_8).replace("{currency}",contact.getCurrency().getCurrencyIsoCode());
        } catch (IOException e) {
            logger.error("Error processing contact", e);
        }
        String temp1 = htmlContent.replace("{name}", contact.getOrganization() != null && !contact.getOrganization().isEmpty() ?
                contact.getOrganization() :
                (contact.getFirstName() + " " + contact.getLastName()))
                .replace("{date}", date )
                .replace("{amount}",contact.getCurrency().getCurrencyIsoCode()+" "+amount)
                .replace("{companylogo}",image)
                .replace("{dueAmount}", dueAmount.toPlainString());
        String temp2="";
        switch (invoiceType){
            case 1:
                temp2=temp1.replace(TEMPLATE_VAR_PAYMODE,"Received")
                        .replace(TEMPLATE_VAR_NUMBER,number);
                break;
            case 2:
                temp2=temp1.replace(TEMPLATE_VAR_PAYMODE,"Done")
                        .replace(TEMPLATE_VAR_NUMBER,number);
                break;
            case 7:
                temp2=temp1.replace(TEMPLATE_VAR_PAYMODE,"Refunded")
                        .replace(TEMPLATE_VAR_NUMBER,number);
                break;
            default:
                // Unknown invoice type - use original template
                temp2 = temp1;
                break;
        }

        try {
            emailSender.send(contact.getEmail(), "Payment receipt information for "+number,temp2,
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
            logger.error("Error", e);

            return false;
        }
        return true;
    }
    public  Integer getCurrencyCodeByInputColoumnValue(String val){
        return contactDao.getCurrencyCodeByInputColoumnValue(val);
    }
    
    @Override
    public List<Contact> getAllContacts() {
        return this.contactDao.getAllContacts();
    }
    
    @Override
    public void updateContacts(Integer contactType, String firstName, String lastName) {
    	
        contactDao.updateContacts(contactType, firstName, lastName);
    }
    @Override
    public  List<Contact> getCustomerContacts(Currency currency){
        return contactDao.getCustomerContacts(currency);
    }
    @Override
    public List<Contact> getSupplierContacts(Currency currency){
       return contactDao.getSupplierContacts(currency);
    }
}
