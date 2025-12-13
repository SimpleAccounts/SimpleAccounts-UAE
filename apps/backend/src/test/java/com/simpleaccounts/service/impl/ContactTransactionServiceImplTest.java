package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.ContactTransactionCategoryRelationDao;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.ContactTransactionCategoryRelation;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("ContactTransactionServiceImpl Unit Tests")
class ContactTransactionServiceImplTest {

    @Mock
    private ContactTransactionCategoryRelationDao contactTransactionCategoryRelationDao;

    @InjectMocks
    private ContactTransactionServiceImpl contactTransactionService;

    @Test
    @DisplayName("Should return DAO instance")
    void getDaoReturnsContactTransactionCategoryRelationDao() {
        // Act
        var result = contactTransactionService.getDao();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(contactTransactionCategoryRelationDao);
    }

    @Test
    @DisplayName("Should add contact transaction category")
    void addContactTransactionCategoryCallsDao() {
        // Arrange
        Contact contact = createContact(1, "John", "Doe");
        TransactionCategory transactionCategory = createTransactionCategory(1, "Test Category");

        // Act
        contactTransactionService.addContactTransactionCategory(contact, transactionCategory);

        // Assert
        verify(contactTransactionCategoryRelationDao)
            .addContactTransactionCategory(contact, transactionCategory);
    }

    @Test
    @DisplayName("Should add contact transaction category with different contact")
    void addContactTransactionCategoryWithDifferentContact() {
        // Arrange
        Contact contact = createContact(2, "Jane", "Smith");
        TransactionCategory transactionCategory = createTransactionCategory(2, "Another Category");

        // Act
        contactTransactionService.addContactTransactionCategory(contact, transactionCategory);

        // Assert
        verify(contactTransactionCategoryRelationDao)
            .addContactTransactionCategory(contact, transactionCategory);
    }

    @Test
    @DisplayName("Should handle contact with organization name")
    void addContactTransactionCategoryWithOrganization() {
        // Arrange
        Contact contact = createContact(3, "Contact", "Person");
        contact.setOrganization("Test Organization LLC");
        TransactionCategory transactionCategory = createTransactionCategory(3, "Org Category");

        // Act
        contactTransactionService.addContactTransactionCategory(contact, transactionCategory);

        // Assert
        verify(contactTransactionCategoryRelationDao)
            .addContactTransactionCategory(contact, transactionCategory);
    }

    @Test
    @DisplayName("Should add contact transaction category for customer type contact")
    void addContactTransactionCategoryForCustomer() {
        // Arrange
        Contact contact = createContact(4, "Customer", "One");
        contact.setContactType(1); // Customer type
        TransactionCategory transactionCategory = createTransactionCategory(4, "Customer Category");

        // Act
        contactTransactionService.addContactTransactionCategory(contact, transactionCategory);

        // Assert
        verify(contactTransactionCategoryRelationDao)
            .addContactTransactionCategory(contact, transactionCategory);
    }

    @Test
    @DisplayName("Should add contact transaction category for supplier type contact")
    void addContactTransactionCategoryForSupplier() {
        // Arrange
        Contact contact = createContact(5, "Supplier", "One");
        contact.setContactType(2); // Supplier type
        TransactionCategory transactionCategory = createTransactionCategory(5, "Supplier Category");

        // Act
        contactTransactionService.addContactTransactionCategory(contact, transactionCategory);

        // Assert
        verify(contactTransactionCategoryRelationDao)
            .addContactTransactionCategory(contact, transactionCategory);
    }

    @Test
    @DisplayName("Should verify DAO is the correct type")
    void getDaoReturnsCorrectType() {
        // Act
        var result = contactTransactionService.getDao();

        // Assert
        assertThat(result).isInstanceOf(ContactTransactionCategoryRelationDao.class);
    }

    @Test
    @DisplayName("Should handle transaction category with chart of account")
    void addContactTransactionCategoryWithChartOfAccount() {
        // Arrange
        Contact contact = createContact(6, "Test", "Contact");
        TransactionCategory transactionCategory = createTransactionCategory(6, "Chart Category");

        // Act
        contactTransactionService.addContactTransactionCategory(contact, transactionCategory);

        // Assert
        verify(contactTransactionCategoryRelationDao)
            .addContactTransactionCategory(contact, transactionCategory);
    }

    @Test
    @DisplayName("Should call DAO exactly once per add operation")
    void addContactTransactionCategoryCallsDaoOnce() {
        // Arrange
        Contact contact = createContact(7, "Single", "Call");
        TransactionCategory transactionCategory = createTransactionCategory(7, "Single Category");

        // Act
        contactTransactionService.addContactTransactionCategory(contact, transactionCategory);

        // Assert
        verify(contactTransactionCategoryRelationDao, org.mockito.Mockito.times(1))
            .addContactTransactionCategory(any(Contact.class), any(TransactionCategory.class));
    }

    private Contact createContact(Integer id, String firstName, String lastName) {
        Contact contact = new Contact();
        contact.setContactId(id);
        contact.setFirstName(firstName);
        contact.setLastName(lastName);
        contact.setDeleteFlag(false);
        contact.setIsActive(true);
        return contact;
    }

    private TransactionCategory createTransactionCategory(Integer id, String name) {
        TransactionCategory category = new TransactionCategory();
        category.setTransactionCategoryId(id);
        category.setTransactionCategoryName(name);
        category.setDeleteFlag(false);
        return category;
    }
}
