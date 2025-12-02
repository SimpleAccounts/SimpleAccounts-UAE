package com.simplevat.service.impl;

import com.simplevat.constant.EmailConstant;
import com.simplevat.constant.dbfilter.ContactFilterEnum;
import com.simplevat.dao.ContactDao;
import com.simplevat.dao.Dao;
import com.simplevat.entity.Contact;
import com.simplevat.entity.Currency;
import com.simplevat.entity.EmailLogs;
import com.simplevat.entity.User;
import com.simplevat.rest.DropdownModel;
import com.simplevat.rest.DropdownObjectModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.rest.contactcontroller.ContactRequestFilterModel;
import com.simplevat.security.JwtTokenUtil;
import com.simplevat.service.ContactService;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.simplevat.service.EmaiLogsService;
import com.simplevat.service.UserService;
import com.simplevat.utils.EmailSender;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;
import javax.xml.bind.DatatypeConverter;

import static com.simplevat.rest.invoicecontroller.HtmlTemplateConstants.THANK_YOU_TEMPLATE;

/**
 * Created by mohsin on 3/3/2017.
 */
@Service("contactService")
@Transactional
public class ContactServiceImpl extends ContactService {
    private final Logger logger = LoggerFactory.getLogger(ContactService.class);
    @Autowired
    ResourceLoader resourceLoader;
    @Autowired
    private ContactDao contactDao;
    @Autowired
    UserService userService;
    @Autowired
    EmailSender emailSender;
    @Autowired
    EmaiLogsService emaiLogsService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;
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
//        java.sql.Date date=new java.sql.Date(millis);
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
            e.printStackTrace();
        }
        String temp1 = htmlContent.replace("{name}", contact.getOrganization() != null && !contact.getOrganization().isEmpty() ?
                contact.getOrganization() :
                (contact.getFirstName() + " " + contact.getLastName()))
                .replace("{date}", date.toString() )
                .replace("{amount}",contact.getCurrency().getCurrencyIsoCode()+" "+amount)
                .replace("{companylogo}",image)
                .replace("{dueAmount}", dueAmount.toPlainString());
        String temp2="";
        switch (invoiceType){
            case 1:
                temp2=temp1.replace("{paymode}","Received")
                        .replace("{number}",number);
                break;
            case 2:
                temp2=temp1.replace("{paymode}","Done")
                        .replace("{number}",number);
                break;
            case 7:
                temp2=temp1.replace("{paymode}","Refunded")
                        .replace("{number}",number);
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
