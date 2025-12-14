package com.simpleaccounts.dao;

import com.simpleaccounts.constant.dbfilter.ContactFilterEnum;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.contactcontroller.ContactRequestFilterModel;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Created by mohsin on 3/3/2017.
 */
public interface ContactDao extends Dao<Integer, Contact> {

    public List<DropdownModel> getContactForDropdown(Integer contactType);

    public List<DropdownObjectModel> getContactForDropdownObjectModel(Integer contactType);

    public List<Contact> getAllContacts(Integer pageNo, Integer pageSize);
    
    public List<Contact> getAllContacts();
    
    public void updateContacts(Integer contactType, String firstName, String lastName);
    
    public PaginationResponseModel getContactList(Map<ContactFilterEnum, Object> filterDataMap,PaginationModel paginationModel);

    public List<Contact> getContacts(ContactRequestFilterModel filterModel, Integer pageNo, Integer pageSize);

    public List<Contact> getContacts(Integer contactType, final String searchQuery, Integer pageNo, Integer pageSize);

    public Optional<Contact> getContactByEmail(String email);
    public Optional<Contact> getContactByID(Integer contactId);

    public void deleteByIds(List<Integer> ids);

    Integer getCurrencyCodeByInputColoumnValue(String val);

    List<Contact> getCustomerContacts(Currency currency);

    public List<Contact> getSupplierContacts(Currency currency);
}
