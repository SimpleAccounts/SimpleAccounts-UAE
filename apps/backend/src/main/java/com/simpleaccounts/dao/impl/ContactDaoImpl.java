package com.simpleaccounts.dao.impl;

import com.simpleaccounts.constant.CommonColumnConstants;
import com.simpleaccounts.constant.CommonConstant;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.constant.ContactTypeEnum;
import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.dbfilter.ContactFilterEnum;
import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.ContactDao;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.model.ContactModel;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.contactcontroller.ContactRequestFilterModel;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

/**
 * Created by mohsin on 3/3/2017.
 */
@Repository(value = "contactDao")
@RequiredArgsConstructor
public class ContactDaoImpl extends AbstractDao<Integer, Contact> implements ContactDao {
	
	private final Logger logger = LoggerFactory.getLogger(ContactDaoImpl.class);

	private final DatatableSortingFilterConstant dataTableUtil;

	@Override
	public List<DropdownModel> getContactForDropdown(Integer contactType) {
		String query = "SELECT new " + CommonConstant.DROPDOWN_MODEL_PACKAGE
				+ "(c.contactId , CONCAT(c.firstName, ' ', c.middleName, ' ', c.lastName)) "
				+ " FROM Contact c where c.deleteFlag = FALSE ";
		if (contactType != null && !contactType.toString().isEmpty()) {
			query += " and c.contactType in :contactType ";
		}
		query += " order by c.firstName, c.lastName ";
		TypedQuery<DropdownModel> typedQuery = getEntityManager().createQuery(query, DropdownModel.class);
		if (contactType != null && !contactType.toString().isEmpty()) {
			typedQuery.setParameter(CommonColumnConstants.CONTACT_TYPE,
					Arrays.asList(new Integer[] { contactType, ContactTypeEnum.BOTH.getValue() }));
		}
		return typedQuery.getResultList();
	}

	@Override
	public List<DropdownObjectModel> getContactForDropdownObjectModel(Integer contactType) {
		String query = "SELECT c FROM Contact c where c.deleteFlag = FALSE and c.isActive = true ";
		if (contactType != null && !contactType.toString().isEmpty()) {
			query += " and c.contactType in :contactType ";
		}
		query += " order by c.firstName, c.lastName ";
		TypedQuery<Contact> typedQuery = getEntityManager().createQuery(query, Contact.class);
		if (contactType != null && !contactType.toString().isEmpty()) {
			typedQuery.setParameter(CommonColumnConstants.CONTACT_TYPE,
					Arrays.asList(new Integer[] { contactType, ContactTypeEnum.BOTH.getValue() }));
		}
		List<Contact> contactList = typedQuery.getResultList();
		List<DropdownObjectModel> dropdownObjectModelList = new ArrayList<>();
		if(contactList!=null && contactList.size()>0)
		{
			for(Contact contact : contactList) {
				ContactModel contactModel = new ContactModel();
				if(contact.getOrganization() != null && !contact.getOrganization().isEmpty()){
					contactModel.setContactName(contact.getOrganization());
				}else {
					contactModel.setContactName(contact.getFirstName()+" "+contact.getMiddleName()+" "+contact.getLastName());
				}
				contactModel.setContactId(contact.getContactId());
				contactModel.setCurrency(contact.getCurrency());
				contactModel.setTaxTreatment(contact.getTaxTreatment());
				DropdownObjectModel dropdownObjectModel = new DropdownObjectModel(contact.getContactId(),contactModel);
				dropdownObjectModelList.add(dropdownObjectModel);
			}

		}
		return dropdownObjectModelList;
	}

	@Override
	public List<Contact> getContacts(ContactRequestFilterModel filterModel, Integer pageNo, Integer pageSize) {
		TypedQuery<Contact> typedQuery = getEntityManager().createNamedQuery(CommonColumnConstants.CONTACT_BY_TYPE,
				Contact.class);
		if (filterModel.getContactType() != null) {
			typedQuery.setParameter(CommonColumnConstants.CONTACT_TYPE, filterModel.getContactType());
		}
		if (filterModel.getName() != null) {
			typedQuery.setParameter(CommonColumnConstants.FIRST_NAME, filterModel.getName());
		}
		if (filterModel.getEmail() != null) {
			typedQuery.setParameter(CommonColumnConstants.EMAIL, filterModel.getEmail());
		}
		typedQuery.setMaxResults(pageSize);
		typedQuery.setFirstResult(pageNo * pageSize);
		return typedQuery.getResultList();
	}

	@Override
	public PaginationResponseModel getContactList(Map<ContactFilterEnum, Object> filterDataMap,
			PaginationModel paginationModel) {
		List<DbFilter> dbFilters = new ArrayList<>();
		filterDataMap.forEach(
				(productFilter, value) -> dbFilters.add(DbFilter.builder().dbCoulmnName(productFilter.getDbColumnName())
						.condition(productFilter.getCondition()).value(value).build()));
		paginationModel.setSortingCol(
				dataTableUtil.getColName(paginationModel.getSortingCol(), DatatableSortingFilterConstant.CONTACT));
		return new PaginationResponseModel(this.getResultCount(dbFilters),
				this.executeQuery(dbFilters, paginationModel));
	}

	@Override
	public List<Contact> getAllContacts(Integer pageNo, Integer pageSize) {
		return getEntityManager().createNamedQuery(CommonColumnConstants.ALL_CONTACT, Contact.class)
				.setMaxResults(pageSize).setFirstResult(pageNo * pageSize).getResultList();
	}

	@Override
	public List<Contact> getContacts(Integer contactType, final String searchQuery, Integer pageNo, Integer pageSize) {
		return getEntityManager().createNamedQuery(CommonColumnConstants.CONTACT_BY_NAMES, Contact.class)
				.setParameter(CommonColumnConstants.NAME, "%" + searchQuery + "%")
				.setParameter(CommonColumnConstants.CONTACT_TYPE, contactType).setMaxResults(pageSize)
				.setFirstResult(pageNo * pageSize).getResultList();
	}

	@Override
	public Optional<Contact> getContactByEmail(String email) {
		Query query = getEntityManager().createNamedQuery(CommonColumnConstants.CONTACT_BY_EMAIL, Contact.class)
				.setParameter("email", email);
		List resultList = query.getResultList();
		if (CollectionUtils.isNotEmpty(resultList) && resultList.size() == 1) {
			return Optional.of((Contact) resultList.get(0));
		}
		return Optional.empty();
	}

	@Override
	public Optional<Contact> getContactByID(Integer contactId) {
		Query query = getEntityManager().createNamedQuery(CommonColumnConstants.CONTACT_BY_ID, Contact.class)
				.setParameter("contactId", contactId);
		List resultList = query.getResultList();
		if (CollectionUtils.isNotEmpty(resultList) && resultList.size() == 1) {
			return Optional.of((Contact) resultList.get(0));
		}
		return Optional.empty();
	}
	@Override
	public void deleteByIds(List<Integer> ids) {
		if (ids != null && !ids.isEmpty()) {
			for (Integer id : ids) {
				Contact contact = findByPK(id);
				contact.setDeleteFlag(Boolean.TRUE);
				update(contact);
			}
		}
	}
	public Integer getCurrencyCodeByInputColoumnValue(String val){
		TypedQuery<Integer> query = getEntityManager().createNamedQuery("getCurrencyCodeByInputColoumnValue", Integer.class);
		query.setParameter("val", val);
		query.setMaxResults(1);
		if (query.getSingleResult()!=null){
			return query.getSingleResult();
		}
		return null;
	}
	
	@Override
	public List<Contact> getAllContacts() {
		 TypedQuery<Contact> typedQuery = getEntityManager().createNamedQuery(CommonColumnConstants.ALL_CONTACT, Contact.class);
		 return typedQuery.getResultList();
		
	}
	
	@Override
	public void updateContacts(Integer contactType, String firstName, String lastName) {
		 Query query = getEntityManager().createNamedQuery(CommonColumnConstants.UPDATE_CONTACT)
				 .setParameter("contactType", contactType)
			     .setParameter("firstName", firstName)
			     .setParameter("lastName", lastName);
	        int result = query.executeUpdate();
	        
	        logger.info("updateContacts result {}",result);
		
	}
	@Override
	public List<Contact> getCustomerContacts(Currency currency){
		TypedQuery<Contact> query = getEntityManager().createNamedQuery(
				"getCustomerContacts", Contact.class);

		List<Contact> contactList = query.getResultList();
		return contactList;
	}
	@Override
	public List<Contact> getSupplierContacts(Currency currency){
		TypedQuery<Contact> query = getEntityManager().createNamedQuery(
				"getSupplierContacts", Contact.class);

		List<Contact> contactList = query.getResultList();
		return contactList;
	}

}
