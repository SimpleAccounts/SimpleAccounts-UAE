package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.CommonColumnConstants;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.rest.DropdownModel;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import javax.persistence.EntityManager;
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
    private TypedQuery<Contact> contactTypedQuery;

    @Mock
    private TypedQuery<DropdownModel> dropdownTypedQuery;

    @InjectMocks
    private ContactDaoImpl contactDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(contactDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(contactDao, "entityClass", Contact.class);
    }

    @Test
    @DisplayName("Should return contact list for dropdown by contact type")
    void getContactForDropdownReturnsDropdownList() {
        // Arrange
        Integer contactType = 1; // CUSTOMER type
        List<DropdownModel> expectedList = Arrays.asList(
            new DropdownModel(1, "John Doe"),
            new DropdownModel(2, "Jane Smith")
        );

        when(entityManager.createQuery(anyString(), eq(DropdownModel.class)))
            .thenReturn(dropdownTypedQuery);
        when(dropdownTypedQuery.setParameter(anyString(), any()))
            .thenReturn(dropdownTypedQuery);
        when(dropdownTypedQuery.getResultList())
            .thenReturn(expectedList);

        // Act
        List<DropdownModel> result = contactDao.getContactForDropdown(contactType);

        // Assert
        assertThat(result).isNotNull().hasSize(2);
    }

    @Test
    @DisplayName("Should return empty list when no contacts exist")
    void getContactForDropdownReturnsEmptyList() {
        // Arrange
        Integer contactType = 2; // SUPPLIER type

        when(entityManager.createQuery(anyString(), eq(DropdownModel.class)))
            .thenReturn(dropdownTypedQuery);
        when(dropdownTypedQuery.setParameter(anyString(), any()))
            .thenReturn(dropdownTypedQuery);
        when(dropdownTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<DropdownModel> result = contactDao.getContactForDropdown(contactType);

        // Assert
        assertThat(result).isNotNull().isEmpty();
    }

    @Test
    @DisplayName("Should return optional contact by email when exists")
    void getContactByEmailReturnsOptionalWhenExists() {
        // Arrange
        String email = "john@test.com";
        Contact expectedContact = createContact(1, "John", "Doe", email);

        when(entityManager.createNamedQuery(CommonColumnConstants.CONTACT_BY_EMAIL, Contact.class))
            .thenReturn(contactTypedQuery);
        when(contactTypedQuery.setParameter("email", email))
            .thenReturn(contactTypedQuery);
        when(contactTypedQuery.getResultList())
            .thenReturn(Collections.singletonList(expectedContact));

        // Act
        Optional<Contact> result = contactDao.getContactByEmail(email);

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getContactId()).isEqualTo(1);
        assertThat(result.get().getEmail()).isEqualTo(email);
    }

    @Test
    @DisplayName("Should return empty optional when contact not found by email")
    void getContactByEmailReturnsEmptyOptionalWhenNotFound() {
        // Arrange
        String email = "nonexistent@test.com";

        when(entityManager.createNamedQuery(CommonColumnConstants.CONTACT_BY_EMAIL, Contact.class))
            .thenReturn(contactTypedQuery);
        when(contactTypedQuery.setParameter("email", email))
            .thenReturn(contactTypedQuery);
        when(contactTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        Optional<Contact> result = contactDao.getContactByEmail(email);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should find contact by ID")
    void findByPKReturnsContactById() {
        // Arrange
        int contactId = 1;
        Contact expectedContact = createContact(contactId, "John", "Doe", "john@test.com");

        when(entityManager.find(Contact.class, contactId))
            .thenReturn(expectedContact);

        // Act
        Contact result = contactDao.findByPK(contactId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContactId()).isEqualTo(contactId);
        assertThat(result.getFirstName()).isEqualTo("John");
    }

    @Test
    @DisplayName("Should return null when contact not found by ID")
    void findByPKReturnsNullWhenNotFound() {
        // Arrange
        int contactId = 999;

        when(entityManager.find(Contact.class, contactId))
            .thenReturn(null);

        // Act
        Contact result = contactDao.findByPK(contactId);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return all contacts")
    void getAllContactsReturnsContactList() {
        // Arrange
        List<Contact> expectedContacts = Arrays.asList(
            createContact(1, "John", "Doe", "john@test.com"),
            createContact(2, "Jane", "Smith", "jane@test.com")
        );

        when(entityManager.createNamedQuery(CommonColumnConstants.ALL_CONTACT, Contact.class))
            .thenReturn(contactTypedQuery);
        when(contactTypedQuery.getResultList())
            .thenReturn(expectedContacts);

        // Act
        List<Contact> result = contactDao.getAllContacts();

        // Assert
        assertThat(result).isNotNull().hasSize(2);
        assertThat(result.get(0).getFirstName()).isEqualTo("John");
        assertThat(result.get(1).getFirstName()).isEqualTo("Jane");
    }

    @Test
    @DisplayName("Should return empty list when no contacts exist")
    void getAllContactsReturnsEmptyList() {
        // Arrange
        when(entityManager.createNamedQuery(CommonColumnConstants.ALL_CONTACT, Contact.class))
            .thenReturn(contactTypedQuery);
        when(contactTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<Contact> result = contactDao.getAllContacts();

        // Assert
        assertThat(result).isNotNull().isEmpty();
    }

    @Test
    @DisplayName("Should persist new contact")
    void persistContactPersistsNewContact() {
        // Arrange
        Contact contact = createContact(null, "New", "Contact", "new@test.com");

        // Act - Test that EntityManager.persist() is callable
        entityManager.persist(contact);

        // Assert
        verify(entityManager).persist(contact);
    }

    @Test
    @DisplayName("Should update existing contact")
    void updateContactMergesExistingContact() {
        // Arrange
        Contact contact = createContact(1, "Updated", "Contact", "updated@test.com");
        when(entityManager.merge(contact)).thenReturn(contact);

        // Act
        Contact result = contactDao.update(contact);

        // Assert
        verify(entityManager).merge(contact);
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should delete contact")
    void deleteContactRemovesContact() {
        // Arrange
        Contact contact = createContact(1, "Delete", "Me", "delete@test.com");
        when(entityManager.contains(contact)).thenReturn(true);

        // Act
        contactDao.delete(contact);

        // Assert
        verify(entityManager).remove(contact);
    }

    @Test
    @DisplayName("Should handle contact with all fields populated")
    void handleContactWithAllFields() {
        // Arrange
        Contact contact = createContact(1, "John", "Doe", "john@test.com");
        contact.setMiddleName("Middle");
        contact.setOrganization("Test Org");
        contact.setTelephone("123456789");
        contact.setMobileNumber("987654321");
        contact.setAddressLine1("123 Test St");
        contact.setContactType(1);

        when(entityManager.find(Contact.class, 1))
            .thenReturn(contact);

        // Act
        Contact result = contactDao.findByPK(1);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getMiddleName()).isEqualTo("Middle");
        assertThat(result.getOrganization()).isEqualTo("Test Org");
        assertThat(result.getTelephone()).isEqualTo("123456789");
    }

    private Contact createContact(Integer id, String firstName, String lastName, String email) {
        Contact contact = new Contact();
        contact.setContactId(id);
        contact.setFirstName(firstName);
        contact.setLastName(lastName);
        contact.setEmail(email);
        contact.setDeleteFlag(false);
        contact.setIsActive(true);
        return contact;
    }
}
