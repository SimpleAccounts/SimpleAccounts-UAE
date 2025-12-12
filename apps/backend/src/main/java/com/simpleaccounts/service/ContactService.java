package com.simpleaccounts.service;

import com.simpleaccounts.constant.dbfilter.ContactFilterEnum;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.contactcontroller.ContactRequestFilterModel;

import javax.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Created by mohsin on 3/3/2017.
 */
public abstract class ContactService extends SimpleAccountsService<Integer, Contact> {

    public abstract List<DropdownModel> getContactForDropdown(Integer contactType);

    public abstract List<DropdownObjectModel> getContactForDropdownObjectModel(Integer contactType);

    public abstract PaginationResponseModel getContactList(Map<ContactFilterEnum, Object> filterDataMap,PaginationModel paginationModel);

    public abstract List<Contact> getAllContacts(Integer pageNo, Integer pageSize);
    
    public abstract List<Contact> getAllContacts();
    
    public abstract void updateContacts(Integer contactType, String firstName, String lastName);

    public abstract List<Contact> getContacts(ContactRequestFilterModel filterModel, Integer pageIndex, Integer noOfRecorgs);

    public abstract List<Contact> getContacts(Integer contactType, final String searchQuery, Integer pageNo, Integer pageSize);

    public abstract Optional<Contact> getContactByEmail(String Email);

    public abstract Optional<Contact> getContactByID(Integer contactId);

    public abstract void deleleByIds(List<Integer> ids);

    /**Contact Service
     * Created by Suraj Rahade on 29/7/2021.
     */
    public abstract boolean sendInvoiceThankYouMail(Contact contact, Integer invoiceType, String number, String amount, String date, BigDecimal dueAmount, HttpServletRequest request);

    public abstract Integer getCurrencyCodeByInputColoumnValue(String val);

    public abstract List<Contact> getCustomerContacts(Currency currency);

    public abstract List<Contact> getSupplierContacts(Currency currency);
}
