package com.simplevat.service;

import com.simplevat.constant.dbfilter.ContactFilterEnum;
import com.simplevat.entity.Contact;
import com.simplevat.entity.Currency;
import com.simplevat.rest.DropdownModel;
import com.simplevat.rest.DropdownObjectModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.rest.contactcontroller.ContactRequestFilterModel;

import javax.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Created by mohsin on 3/3/2017.
 */
public abstract class ContactService extends SimpleVatService<Integer, Contact> {

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
