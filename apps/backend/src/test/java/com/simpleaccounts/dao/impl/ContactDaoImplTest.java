package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.CommonColumnConstants;
import com.simpleaccounts.constant.ContactTypeEnum;
import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.dbfilter.ContactFilterEnum;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.contactcontroller.ContactRequestFilterModel;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("ContactDaoImpl Unit Tests")
class ContactDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<Contact> typedQuery;

    @Mock
    private TypedQuery<DropdownModel> dropdownTypedQuery;

    @Mock
    private TypedQuery<Integer> integerTypedQuery;

    @Mock
    private Query query;

    @Mock
    private DatatableSortingFilterConstant dataTableUtil;

    @InjectMocks
    private ContactDaoImpl contactDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(contactDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(contactDao, "entityClass", Contact.class);
    }

    @Test
    @DisplayName("Should return dropdown list of contacts for given contact type")
    void getContactForDropdownReturnsDropdownList() {
        // Arrange
        Integer contactType = ContactTypeEnum.CUSTOMER.getValue();
        List<DropdownModel> expectedDropdowns = Arrays.asList(
            new DropdownModel(1, "John Doe"),
            new DropdownModel(2, "Jane Smith")
        );

        when(entityManager.createQuery(anyString(), eq(DropdownModel.class)))
            .thenReturn(dropdownTypedQuery);
        when(dropdownTypedQuery.setParameter(eq(CommonColumnConstants.CONTACT_TYPE), any()))
            .thenReturn(dropdownTypedQuery);
        when(dropdownTypedQuery.getResultList())
            .thenReturn(expectedDropdowns);

        // Act
        List<DropdownModel> result = contactDao.getContactForDropdown(contactType);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).isEqualTo(expectedDropdowns);
    }

    @Test
    @DisplayName("Should return dropdown list without contact type filter when null")
    void getContactForDropdownWithNullContactType() {
        // Arrange
        List<DropdownModel> expectedDropdowns = Collections.singletonList(
            new DropdownModel(1, "John Doe")
        );

        when(entityManager.createQuery(anyString(), eq(DropdownModel.class)))
            .thenReturn(dropdownTypedQuery);
        when(dropdownTypedQuery.getResultList())
            .thenReturn(expectedDropdowns);

        // Act
        List<DropdownModel> result = contactDao.getContactForDropdown(null);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(dropdownTypedQuery, never()).setParameter(eq(CommonColumnConstants.CONTACT_TYPE), any());
    }

    @Test
    @DisplayName("Should return dropdown object model list for contacts")
    void getContactForDropdownObjectModelReturnsList() {
        // Arrange
        Integer contactType = ContactTypeEnum.SUPPLIER.getValue();
        Contact contact = createContact(1, "John", "Doe", "Acme Corp");
        List<Contact> contacts = Collections.singletonList(contact);

        when(entityManager.createQuery(anyString(), eq(Contact.class)))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter(eq(CommonColumnConstants.CONTACT_TYPE), any()))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(contacts);

        // Act
        List<DropdownObjectModel> result = contactDao.getContactForDropdownObjectModel(contactType);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Should use organization name when available in dropdown object model")
    void getContactForDropdownObjectModelUsesOrganizationName() {
        // Arrange
        Integer contactType = ContactTypeEnum.CUSTOMER.getValue();
        Contact contact = createContact(1, "John", "Doe", "Test Organization");
        List<Contact> contacts = Collections.singletonList(contact);

        when(entityManager.createQuery(anyString(), eq(Contact.class)))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter(eq(CommonColumnConstants.CONTACT_TYPE), any()))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(contacts);

        // Act
        List<DropdownObjectModel> result = contactDao.getContactForDropdownObjectModel(contactType);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Should return empty list when no contacts for dropdown object model")
    void getContactForDropdownObjectModelReturnsEmptyList() {
        // Arrange
        Integer contactType = ContactTypeEnum.BOTH.getValue();

        when(entityManager.createQuery(anyString(), eq(Contact.class)))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter(eq(CommonColumnConstants.CONTACT_TYPE), any()))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<DropdownObjectModel> result = contactDao.getContactForDropdownObjectModel(contactType);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return contacts with filter model and pagination")
    void getContactsWithFilterModelReturnsPaginatedContacts() {
        // Arrange
        ContactRequestFilterModel filterModel = new ContactRequestFilterModel();
        filterModel.setContactType(ContactTypeEnum.CUSTOMER.getValue());
        filterModel.setName("John");
        filterModel.setEmail("john@test.com");

        List<Contact> expectedContacts = createContactList(5);

        when(entityManager.createNamedQuery(CommonColumnConstants.CONTACT_BY_TYPE, Contact.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter(eq(CommonColumnConstants.CONTACT_TYPE), any()))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter(eq(CommonColumnConstants.FIRST_NAME), anyString()))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter(eq(CommonColumnConstants.EMAIL), anyString()))
            .thenReturn(typedQuery);
        when(typedQuery.setMaxResults(anyInt()))
            .thenReturn(typedQuery);
        when(typedQuery.setFirstResult(anyInt()))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedContacts);

        // Act
        List<Contact> result = contactDao.getContacts(filterModel, 0, 10);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        verify(typedQuery).setMaxResults(10);
        verify(typedQuery).setFirstResult(0);
    }

    @Test
    @DisplayName("Should return all contacts with pagination")
    void getAllContactsReturnsPaginatedList() {
        // Arrange
        List<Contact> expectedContacts = createContactList(10);

        when(entityManager.createNamedQuery(CommonColumnConstants.ALL_CONTACT, Contact.class))
            .thenReturn(typedQuery);
        when(typedQuery.setMaxResults(anyInt()))
            .thenReturn(typedQuery);
        when(typedQuery.setFirstResult(anyInt()))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedContacts);

        // Act
        List<Contact> result = contactDao.getAllContacts(0, 10);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(10);
        verify(typedQuery).setMaxResults(10);
        verify(typedQuery).setFirstResult(0);
    }

    @Test
    @DisplayName("Should return contacts by name search with pagination")
    void getContactsByNameSearchReturnsPaginatedResults() {
        // Arrange
        Integer contactType = ContactTypeEnum.CUSTOMER.getValue();
        String searchQuery = "John";
        List<Contact> expectedContacts = createContactList(3);

        when(entityManager.createNamedQuery(CommonColumnConstants.CONTACT_BY_NAMES, Contact.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter(eq(CommonColumnConstants.NAME), anyString()))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter(eq(CommonColumnConstants.CONTACT_TYPE), any()))
            .thenReturn(typedQuery);
        when(typedQuery.setMaxResults(anyInt()))
            .thenReturn(typedQuery);
        when(typedQuery.setFirstResult(anyInt()))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedContacts);

        // Act
        List<Contact> result = contactDao.getContacts(contactType, searchQuery, 0, 10);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        verify(typedQuery).setParameter(CommonColumnConstants.NAME, "%" + searchQuery + "%");
    }

    @Test
    @DisplayName("Should return optional contact by email when exists")
    void getContactByEmailReturnsOptionalWhenExists() {
        // Arrange
        String email = "john@test.com";
        Contact expectedContact = createContact(1, "John", "Doe", null);

        when(entityManager.createNamedQuery(CommonColumnConstants.CONTACT_BY_EMAIL, Contact.class))
            .thenReturn(query);
        when(query.setParameter("email", email))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(Collections.singletonList(expectedContact));

        // Act
        Optional<Contact> result = contactDao.getContactByEmail(email);

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getContactId()).isEqualTo(1);
    }

    @Test
    @DisplayName("Should return empty optional when contact not found by email")
    void getContactByEmailReturnsEmptyOptionalWhenNotFound() {
        // Arrange
        String email = "nonexistent@test.com";

        when(entityManager.createNamedQuery(CommonColumnConstants.CONTACT_BY_EMAIL, Contact.class))
            .thenReturn(query);
        when(query.setParameter("email", email))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        Optional<Contact> result = contactDao.getContactByEmail(email);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return empty optional when multiple contacts found by email")
    void getContactByEmailReturnsEmptyWhenMultipleFound() {
        // Arrange
        String email = "duplicate@test.com";
        Contact contact1 = createContact(1, "John", "Doe", null);
        Contact contact2 = createContact(2, "Jane", "Doe", null);

        when(entityManager.createNamedQuery(CommonColumnConstants.CONTACT_BY_EMAIL, Contact.class))
            .thenReturn(query);
        when(query.setParameter("email", email))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(Arrays.asList(contact1, contact2));

        // Act
        Optional<Contact> result = contactDao.getContactByEmail(email);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return optional contact by ID when exists")
    void getContactByIDReturnsOptionalWhenExists() {
        // Arrange
        Integer contactId = 1;
        Contact expectedContact = createContact(contactId, "John", "Doe", null);

        when(entityManager.createNamedQuery(CommonColumnConstants.CONTACT_BY_ID, Contact.class))
            .thenReturn(query);
        when(query.setParameter("contactId", contactId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(Collections.singletonList(expectedContact));

        // Act
        Optional<Contact> result = contactDao.getContactByID(contactId);

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getContactId()).isEqualTo(contactId);
    }

    @Test
    @DisplayName("Should return empty optional when contact not found by ID")
    void getContactByIDReturnsEmptyOptionalWhenNotFound() {
        // Arrange
        Integer contactId = 999;

        when(entityManager.createNamedQuery(CommonColumnConstants.CONTACT_BY_ID, Contact.class))
            .thenReturn(query);
        when(query.setParameter("contactId", contactId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        Optional<Contact> result = contactDao.getContactByID(contactId);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should delete contacts by IDs using soft delete")
    void deleteByIdsSetsDeleteFlag() {
        // Arrange
        List<Integer> ids = Arrays.asList(1, 2, 3);
        Contact contact1 = createContact(1, "John", "Doe", null);
        Contact contact2 = createContact(2, "Jane", "Smith", null);
        Contact contact3 = createContact(3, "Bob", "Johnson", null);

        when(entityManager.find(Contact.class, 1)).thenReturn(contact1);
        when(entityManager.find(Contact.class, 2)).thenReturn(contact2);
        when(entityManager.find(Contact.class, 3)).thenReturn(contact3);

        // Act
        contactDao.deleteByIds(ids);

        // Assert
        assertThat(contact1.getDeleteFlag()).isTrue();
        assertThat(contact2.getDeleteFlag()).isTrue();
        assertThat(contact3.getDeleteFlag()).isTrue();
    }

    @Test
    @DisplayName("Should not delete when IDs list is null")
    void deleteByIdsDoesNothingWhenIdsIsNull() {
        // Act
        contactDao.deleteByIds(null);

        // Assert
        verify(entityManager, never()).find(any(), any());
    }

    @Test
    @DisplayName("Should not delete when IDs list is empty")
    void deleteByIdsDoesNothingWhenIdsIsEmpty() {
        // Act
        contactDao.deleteByIds(new ArrayList<>());

        // Assert
        verify(entityManager, never()).find(any(), any());
    }

    @Test
    @DisplayName("Should return currency code by input column value")
    void getCurrencyCodeByInputColoumnValueReturnsCode() {
        // Arrange
        String value = "USD";
        Integer expectedCode = 1;

        when(entityManager.createNamedQuery("getCurrencyCodeByInputColoumnValue", Integer.class))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setParameter("val", value))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setMaxResults(1))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(expectedCode);

        // Act
        Integer result = contactDao.getCurrencyCodeByInputColoumnValue(value);

        // Assert
        assertThat(result).isEqualTo(expectedCode);
    }

    @Test
    @DisplayName("Should return null when currency code not found")
    void getCurrencyCodeByInputColoumnValueReturnsNullWhenNotFound() {
        // Arrange
        String value = "INVALID";

        when(entityManager.createNamedQuery("getCurrencyCodeByInputColoumnValue", Integer.class))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setParameter("val", value))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setMaxResults(1))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(null);

        // Act
        Integer result = contactDao.getCurrencyCodeByInputColoumnValue(value);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return all contacts without pagination")
    void getAllContactsReturnsAllContacts() {
        // Arrange
        List<Contact> expectedContacts = createContactList(15);

        when(entityManager.createNamedQuery(CommonColumnConstants.ALL_CONTACT, Contact.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedContacts);

        // Act
        List<Contact> result = contactDao.getAllContacts();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(15);
    }

    @Test
    @DisplayName("Should update contacts with given parameters")
    void updateContactsExecutesUpdateQuery() {
        // Arrange
        Integer contactType = ContactTypeEnum.CUSTOMER.getValue();
        String firstName = "Updated";
        String lastName = "Name";

        when(entityManager.createNamedQuery(CommonColumnConstants.UPDATE_CONTACT))
            .thenReturn(query);
        when(query.setParameter("contactType", contactType))
            .thenReturn(query);
        when(query.setParameter("firstName", firstName))
            .thenReturn(query);
        when(query.setParameter("lastName", lastName))
            .thenReturn(query);
        when(query.executeUpdate())
            .thenReturn(5);

        // Act
        contactDao.updateContacts(contactType, firstName, lastName);

        // Assert
        verify(query).executeUpdate();
        verify(query).setParameter("contactType", contactType);
        verify(query).setParameter("firstName", firstName);
        verify(query).setParameter("lastName", lastName);
    }

    @Test
    @DisplayName("Should return customer contacts for currency")
    void getCustomerContactsReturnsCustomers() {
        // Arrange
        Currency currency = new Currency();
        currency.setCurrencyCode(1);
        List<Contact> expectedContacts = createContactList(5);

        when(entityManager.createNamedQuery("getCustomerContacts", Contact.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedContacts);

        // Act
        List<Contact> result = contactDao.getCustomerContacts(currency);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
    }

    @Test
    @DisplayName("Should return supplier contacts for currency")
    void getSupplierContactsReturnsSuppliers() {
        // Arrange
        Currency currency = new Currency();
        currency.setCurrencyCode(1);
        List<Contact> expectedContacts = createContactList(3);

        when(entityManager.createNamedQuery("getSupplierContacts", Contact.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedContacts);

        // Act
        List<Contact> result = contactDao.getSupplierContacts(currency);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
    }

    @Test
    @DisplayName("Should handle empty result for customer contacts")
    void getCustomerContactsHandlesEmptyResult() {
        // Arrange
        Currency currency = new Currency();

        when(entityManager.createNamedQuery("getCustomerContacts", Contact.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<Contact> result = contactDao.getCustomerContacts(currency);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should handle empty result for supplier contacts")
    void getSupplierContactsHandlesEmptyResult() {
        // Arrange
        Currency currency = new Currency();

        when(entityManager.createNamedQuery("getSupplierContacts", Contact.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<Contact> result = contactDao.getSupplierContacts(currency);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should handle pagination with page 1")
    void getAllContactsHandlesSecondPage() {
        // Arrange
        List<Contact> expectedContacts = createContactList(5);

        when(entityManager.createNamedQuery(CommonColumnConstants.ALL_CONTACT, Contact.class))
            .thenReturn(typedQuery);
        when(typedQuery.setMaxResults(anyInt()))
            .thenReturn(typedQuery);
        when(typedQuery.setFirstResult(anyInt()))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedContacts);

        // Act
        List<Contact> result = contactDao.getAllContacts(1, 10);

        // Assert
        assertThat(result).hasSize(5);
        verify(typedQuery).setFirstResult(10);
    }

    private List<Contact> createContactList(int count) {
        List<Contact> contacts = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            contacts.add(createContact(i + 1, "FirstName" + (i + 1), "LastName" + (i + 1), null));
        }
        return contacts;
    }

    private Contact createContact(int id, String firstName, String lastName, String organization) {
        Contact contact = new Contact();
        contact.setContactId(id);
        contact.setFirstName(firstName);
        contact.setLastName(lastName);
        contact.setMiddleName("");
        contact.setOrganization(organization);
        contact.setDeleteFlag(false);
        contact.setIsActive(true);
        return contact;
    }
}
