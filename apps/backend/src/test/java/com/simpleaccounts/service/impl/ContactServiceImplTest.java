package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.ContactDao;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.exceptions.ServiceException;
import com.simpleaccounts.rest.DropdownModel;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("ContactServiceImpl Unit Tests")
class ContactServiceImplTest {

    @Mock
    private ContactDao contactDao;

    @InjectMocks
    private ContactServiceImpl contactService;

    @Test
    @DisplayName("Should return contact dropdown list")
    void getContactForDropdownReturnsDropdownList() {
        // Arrange
        Integer contactType = 1;
        List<DropdownModel> expectedList = Arrays.asList(
            new DropdownModel(1, "John Doe"),
            new DropdownModel(2, "Jane Smith")
        );

        when(contactDao.getContactForDropdown(contactType))
            .thenReturn(expectedList);

        // Act
        List<DropdownModel> result = contactService.getContactForDropdown(contactType);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        verify(contactDao).getContactForDropdown(contactType);
    }

    @Test
    @DisplayName("Should return all contacts")
    void getAllContactsReturnsContactList() {
        // Arrange
        List<Contact> expectedContacts = Arrays.asList(
            createContact(1, "John", "Doe", "john@test.com"),
            createContact(2, "Jane", "Smith", "jane@test.com")
        );

        when(contactDao.getAllContacts())
            .thenReturn(expectedContacts);

        // Act
        List<Contact> result = contactService.getAllContacts();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        verify(contactDao).getAllContacts();
    }

    @Test
    @DisplayName("Should find contact by ID")
    void findByIdReturnsContact() {
        // Arrange
        int contactId = 1;
        Contact expectedContact = createContact(contactId, "John", "Doe", "john@test.com");

        when(contactDao.findByPK(contactId))
            .thenReturn(expectedContact);

        // Act
        Contact result = contactService.findByPK(contactId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContactId()).isEqualTo(contactId);
        verify(contactDao).findByPK(contactId);
    }

    @Test
    @DisplayName("Should throw exception when contact not found")
    void findByIdThrowsExceptionWhenNotFound() {
        // Arrange
        int contactId = 999;

        when(contactDao.findByPK(contactId))
            .thenReturn(null);

        // Act & Assert
        assertThatThrownBy(() -> contactService.findByPK(contactId))
            .isInstanceOf(ServiceException.class);
    }

    @Test
    @DisplayName("Should return optional contact by email when exists")
    void getContactByEmailReturnsOptionalWhenExists() {
        // Arrange
        String email = "john@test.com";
        Contact expectedContact = createContact(1, "John", "Doe", email);

        when(contactDao.getContactByEmail(email))
            .thenReturn(Optional.of(expectedContact));

        // Act
        Optional<Contact> result = contactService.getContactByEmail(email);

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo(email);
    }

    @Test
    @DisplayName("Should return empty optional when contact not found by email")
    void getContactByEmailReturnsEmptyWhenNotFound() {
        // Arrange
        String email = "nonexistent@test.com";

        when(contactDao.getContactByEmail(email))
            .thenReturn(Optional.empty());

        // Act
        Optional<Contact> result = contactService.getContactByEmail(email);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should handle empty contact list")
    void getAllContactsReturnsEmptyList() {
        // Arrange
        when(contactDao.getAllContacts())
            .thenReturn(new ArrayList<>());

        // Act
        List<Contact> result = contactService.getAllContacts();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
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
