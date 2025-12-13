package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.ContactTransactionCategoryRelation;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.service.ContactService;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("ContactTransactionCategoryDaoImpl Unit Tests")
class ContactTransactionCategoryDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private ContactService contactService;

    @Mock
    private TypedQuery<Integer> integerTypedQuery;

    @InjectMocks
    private ContactTransactionCategoryDaoImpl contactTransactionCategoryDao;

    @Captor
    private ArgumentCaptor<ContactTransactionCategoryRelation> relationCaptor;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(contactTransactionCategoryDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(contactTransactionCategoryDao, "entityClass", ContactTransactionCategoryRelation.class);
    }

    @Test
    @DisplayName("Should add contact transaction category with new ID")
    void addContactTransactionCategoryCreatesNewRelation() {
        // Arrange
        Contact contact = createContact(1, "John", "Doe");
        TransactionCategory transactionCategory = createTransactionCategory(1, "Test Category");

        when(entityManager.createQuery(anyString(), eq(Integer.class)))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(10);

        // Act
        contactTransactionCategoryDao.addContactTransactionCategory(contact, transactionCategory);

        // Assert
        verify(entityManager).persist(relationCaptor.capture());
        ContactTransactionCategoryRelation capturedRelation = relationCaptor.getValue();
        assertThat(capturedRelation.getId()).isEqualTo(11);
        assertThat(capturedRelation.getContact()).isEqualTo(contact);
        assertThat(capturedRelation.getTransactionCategory()).isEqualTo(transactionCategory);
    }

    @Test
    @DisplayName("Should increment ID from max existing ID")
    void addContactTransactionCategoryIncrementsMaxId() {
        // Arrange
        Contact contact = createContact(2, "Jane", "Smith");
        TransactionCategory transactionCategory = createTransactionCategory(2, "Another Category");

        when(entityManager.createQuery(anyString(), eq(Integer.class)))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(50);

        // Act
        contactTransactionCategoryDao.addContactTransactionCategory(contact, transactionCategory);

        // Assert
        verify(entityManager).persist(relationCaptor.capture());
        assertThat(relationCaptor.getValue().getId()).isEqualTo(51);
    }

    @Test
    @DisplayName("Should set contact on new relation")
    void addContactTransactionCategorySetsContact() {
        // Arrange
        Contact contact = createContact(3, "Test", "Contact");
        TransactionCategory transactionCategory = createTransactionCategory(3, "Category");

        when(entityManager.createQuery(anyString(), eq(Integer.class)))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(100);

        // Act
        contactTransactionCategoryDao.addContactTransactionCategory(contact, transactionCategory);

        // Assert
        verify(entityManager).persist(relationCaptor.capture());
        assertThat(relationCaptor.getValue().getContact()).isNotNull();
        assertThat(relationCaptor.getValue().getContact().getContactId()).isEqualTo(3);
    }

    @Test
    @DisplayName("Should set transaction category on new relation")
    void addContactTransactionCategorySetsTransactionCategory() {
        // Arrange
        Contact contact = createContact(4, "Another", "Contact");
        TransactionCategory transactionCategory = createTransactionCategory(4, "Special Category");

        when(entityManager.createQuery(anyString(), eq(Integer.class)))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(200);

        // Act
        contactTransactionCategoryDao.addContactTransactionCategory(contact, transactionCategory);

        // Assert
        verify(entityManager).persist(relationCaptor.capture());
        assertThat(relationCaptor.getValue().getTransactionCategory()).isNotNull();
        assertThat(relationCaptor.getValue().getTransactionCategory().getTransactionCategoryId()).isEqualTo(4);
    }

    @Test
    @DisplayName("Should use MAX query to find next ID")
    void addContactTransactionCategoryUsesMaxQuery() {
        // Arrange
        Contact contact = createContact(5, "Query", "Test");
        TransactionCategory transactionCategory = createTransactionCategory(5, "Query Category");

        when(entityManager.createQuery(anyString(), eq(Integer.class)))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(1);

        // Act
        contactTransactionCategoryDao.addContactTransactionCategory(contact, transactionCategory);

        // Assert
        verify(entityManager).createQuery("SELECT MAX(id) FROM ContactTransactionCategoryRelation ORDER BY id DESC", Integer.class);
    }

    @Test
    @DisplayName("Should persist relation entity")
    void addContactTransactionCategoryPersistsEntity() {
        // Arrange
        Contact contact = createContact(6, "Persist", "Test");
        TransactionCategory transactionCategory = createTransactionCategory(6, "Persist Category");

        when(entityManager.createQuery(anyString(), eq(Integer.class)))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(0);

        // Act
        contactTransactionCategoryDao.addContactTransactionCategory(contact, transactionCategory);

        // Assert
        verify(entityManager).persist(any(ContactTransactionCategoryRelation.class));
    }

    @Test
    @DisplayName("Should handle contact with organization")
    void addContactTransactionCategoryHandlesContactWithOrganization() {
        // Arrange
        Contact contact = createContact(7, "Org", "Contact");
        contact.setOrganization("Test Organization LLC");
        TransactionCategory transactionCategory = createTransactionCategory(7, "Org Category");

        when(entityManager.createQuery(anyString(), eq(Integer.class)))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(300);

        // Act
        contactTransactionCategoryDao.addContactTransactionCategory(contact, transactionCategory);

        // Assert
        verify(entityManager).persist(relationCaptor.capture());
        assertThat(relationCaptor.getValue().getContact().getOrganization()).isEqualTo("Test Organization LLC");
    }

    @Test
    @DisplayName("Should handle customer type contact")
    void addContactTransactionCategoryHandlesCustomerContact() {
        // Arrange
        Contact contact = createContact(8, "Customer", "One");
        contact.setContactType(1); // Customer type
        TransactionCategory transactionCategory = createTransactionCategory(8, "Customer Category");

        when(entityManager.createQuery(anyString(), eq(Integer.class)))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(400);

        // Act
        contactTransactionCategoryDao.addContactTransactionCategory(contact, transactionCategory);

        // Assert
        verify(entityManager).persist(relationCaptor.capture());
        assertThat(relationCaptor.getValue().getContact().getContactType()).isEqualTo(1);
    }

    @Test
    @DisplayName("Should handle supplier type contact")
    void addContactTransactionCategoryHandlesSupplierContact() {
        // Arrange
        Contact contact = createContact(9, "Supplier", "One");
        contact.setContactType(2); // Supplier type
        TransactionCategory transactionCategory = createTransactionCategory(9, "Supplier Category");

        when(entityManager.createQuery(anyString(), eq(Integer.class)))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(500);

        // Act
        contactTransactionCategoryDao.addContactTransactionCategory(contact, transactionCategory);

        // Assert
        verify(entityManager).persist(relationCaptor.capture());
        assertThat(relationCaptor.getValue().getContact().getContactType()).isEqualTo(2);
    }

    @Test
    @DisplayName("Should find relation by primary key")
    void findByPKReturnsRelation() {
        // Arrange
        Integer relationId = 1;
        ContactTransactionCategoryRelation expectedRelation = new ContactTransactionCategoryRelation();
        expectedRelation.setId(relationId);

        when(entityManager.find(ContactTransactionCategoryRelation.class, relationId))
            .thenReturn(expectedRelation);

        // Act
        ContactTransactionCategoryRelation result = contactTransactionCategoryDao.findByPK(relationId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(relationId);
    }

    @Test
    @DisplayName("Should return null when relation not found")
    void findByPKReturnsNullWhenNotFound() {
        // Arrange
        Integer relationId = 999;

        when(entityManager.find(ContactTransactionCategoryRelation.class, relationId))
            .thenReturn(null);

        // Act
        ContactTransactionCategoryRelation result = contactTransactionCategoryDao.findByPK(relationId);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should update existing relation")
    void updateRelationMergesEntity() {
        // Arrange
        ContactTransactionCategoryRelation relation = new ContactTransactionCategoryRelation();
        relation.setId(1);

        when(entityManager.merge(relation))
            .thenReturn(relation);

        // Act
        ContactTransactionCategoryRelation result = contactTransactionCategoryDao.update(relation);

        // Assert
        verify(entityManager).merge(relation);
        assertThat(result).isNotNull();
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
