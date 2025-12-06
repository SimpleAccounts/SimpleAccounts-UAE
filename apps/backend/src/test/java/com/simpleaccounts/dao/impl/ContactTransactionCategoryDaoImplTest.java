package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.ContactTransactionCategoryRelation;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.service.ContactService;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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
    private TypedQuery<Integer> integerTypedQuery;

    @Mock
    private ContactService contactService;

    @InjectMocks
    private ContactTransactionCategoryDaoImpl dao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(dao, "entityManager", entityManager);
        ReflectionTestUtils.setField(dao, "entityClass", ContactTransactionCategoryRelation.class);
    }

    @Test
    @DisplayName("Should add contact transaction category with auto-incremented ID")
    void addContactTransactionCategorySuccessfully() {
        // Arrange
        Contact contact = createContact(1, "Test Contact");
        TransactionCategory transactionCategory = createTransactionCategory(1, "Test Category");
        Integer maxId = 5;

        when(entityManager.createQuery(anyString(), eq(Integer.class)))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult()).thenReturn(maxId);

        // Act
        dao.addContactTransactionCategory(contact, transactionCategory);

        // Assert
        ArgumentCaptor<ContactTransactionCategoryRelation> captor =
            ArgumentCaptor.forClass(ContactTransactionCategoryRelation.class);
        verify(entityManager).persist(captor.capture());
        verify(entityManager).flush();
        verify(entityManager).refresh(captor.getValue());

        ContactTransactionCategoryRelation persisted = captor.getValue();
        assertThat(persisted.getId()).isEqualTo(maxId + 1);
        assertThat(persisted.getContact()).isEqualTo(contact);
        assertThat(persisted.getTransactionCategory()).isEqualTo(transactionCategory);
    }

    @Test
    @DisplayName("Should execute correct query for max ID")
    void addContactTransactionCategoryExecutesCorrectQuery() {
        // Arrange
        Contact contact = createContact(1, "Test");
        TransactionCategory category = createTransactionCategory(1, "Category");
        String expectedQuery = "SELECT MAX(id) FROM ContactTransactionCategoryRelation ORDER BY id DESC";

        when(entityManager.createQuery(expectedQuery, Integer.class))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult()).thenReturn(1);

        // Act
        dao.addContactTransactionCategory(contact, category);

        // Assert
        verify(entityManager).createQuery(expectedQuery, Integer.class);
    }

    @Test
    @DisplayName("Should handle ID starting from 1 when max ID is 0")
    void addContactTransactionCategoryWithZeroMaxId() {
        // Arrange
        Contact contact = createContact(1, "Contact");
        TransactionCategory category = createTransactionCategory(1, "Category");

        when(entityManager.createQuery(anyString(), eq(Integer.class)))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult()).thenReturn(0);

        // Act
        dao.addContactTransactionCategory(contact, category);

        // Assert
        ArgumentCaptor<ContactTransactionCategoryRelation> captor =
            ArgumentCaptor.forClass(ContactTransactionCategoryRelation.class);
        verify(entityManager).persist(captor.capture());
        assertThat(captor.getValue().getId()).isEqualTo(1);
    }

    @Test
    @DisplayName("Should handle multiple consecutive additions")
    void addContactTransactionCategoryMultipleTimes() {
        // Arrange
        Contact contact1 = createContact(1, "Contact1");
        Contact contact2 = createContact(2, "Contact2");
        TransactionCategory category = createTransactionCategory(1, "Category");

        when(entityManager.createQuery(anyString(), eq(Integer.class)))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult()).thenReturn(1, 2);

        // Act
        dao.addContactTransactionCategory(contact1, category);
        dao.addContactTransactionCategory(contact2, category);

        // Assert
        verify(entityManager, times(2)).persist(any(ContactTransactionCategoryRelation.class));
    }

    @Test
    @DisplayName("Should set all relation properties correctly")
    void addContactTransactionCategorySetsAllProperties() {
        // Arrange
        Contact contact = createContact(10, "Contact Name");
        TransactionCategory category = createTransactionCategory(20, "Category Name");

        when(entityManager.createQuery(anyString(), eq(Integer.class)))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult()).thenReturn(100);

        // Act
        dao.addContactTransactionCategory(contact, category);

        // Assert
        ArgumentCaptor<ContactTransactionCategoryRelation> captor =
            ArgumentCaptor.forClass(ContactTransactionCategoryRelation.class);
        verify(entityManager).persist(captor.capture());

        ContactTransactionCategoryRelation relation = captor.getValue();
        assertThat(relation.getId()).isEqualTo(101);
        assertThat(relation.getContact()).isNotNull();
        assertThat(relation.getContact().getContactId()).isEqualTo(10);
        assertThat(relation.getTransactionCategory()).isNotNull();
        assertThat(relation.getTransactionCategory().getTransactionCategoryId()).isEqualTo(20);
    }

    @Test
    @DisplayName("Should flush entity manager after persist")
    void addContactTransactionCategoryFlushesAfterPersist() {
        // Arrange
        Contact contact = createContact(1, "Test");
        TransactionCategory category = createTransactionCategory(1, "Test");

        when(entityManager.createQuery(anyString(), eq(Integer.class)))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult()).thenReturn(1);

        // Act
        dao.addContactTransactionCategory(contact, category);

        // Assert
        verify(entityManager).persist(any(ContactTransactionCategoryRelation.class));
        verify(entityManager).flush();
    }

    @Test
    @DisplayName("Should refresh entity after persist")
    void addContactTransactionCategoryRefreshesEntity() {
        // Arrange
        Contact contact = createContact(1, "Test");
        TransactionCategory category = createTransactionCategory(1, "Test");

        when(entityManager.createQuery(anyString(), eq(Integer.class)))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult()).thenReturn(1);

        // Act
        dao.addContactTransactionCategory(contact, category);

        // Assert
        ArgumentCaptor<ContactTransactionCategoryRelation> captor =
            ArgumentCaptor.forClass(ContactTransactionCategoryRelation.class);
        verify(entityManager).refresh(captor.capture());
        assertThat(captor.getValue()).isNotNull();
    }

    @Test
    @DisplayName("Should handle large max ID values")
    void addContactTransactionCategoryWithLargeMaxId() {
        // Arrange
        Contact contact = createContact(1, "Contact");
        TransactionCategory category = createTransactionCategory(1, "Category");
        Integer largeMaxId = Integer.MAX_VALUE - 10;

        when(entityManager.createQuery(anyString(), eq(Integer.class)))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult()).thenReturn(largeMaxId);

        // Act
        dao.addContactTransactionCategory(contact, category);

        // Assert
        ArgumentCaptor<ContactTransactionCategoryRelation> captor =
            ArgumentCaptor.forClass(ContactTransactionCategoryRelation.class);
        verify(entityManager).persist(captor.capture());
        assertThat(captor.getValue().getId()).isEqualTo(largeMaxId + 1);
    }

    @Test
    @DisplayName("Should handle contact with null name")
    void addContactTransactionCategoryWithNullContactName() {
        // Arrange
        Contact contact = createContact(1, null);
        TransactionCategory category = createTransactionCategory(1, "Category");

        when(entityManager.createQuery(anyString(), eq(Integer.class)))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult()).thenReturn(1);

        // Act
        dao.addContactTransactionCategory(contact, category);

        // Assert
        verify(entityManager).persist(any(ContactTransactionCategoryRelation.class));
    }

    @Test
    @DisplayName("Should create new relation instance for each addition")
    void addContactTransactionCategoryCreatesNewInstance() {
        // Arrange
        Contact contact = createContact(1, "Contact");
        TransactionCategory category = createTransactionCategory(1, "Category");

        when(entityManager.createQuery(anyString(), eq(Integer.class)))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult()).thenReturn(1, 2);

        // Act
        dao.addContactTransactionCategory(contact, category);
        dao.addContactTransactionCategory(contact, category);

        // Assert
        ArgumentCaptor<ContactTransactionCategoryRelation> captor =
            ArgumentCaptor.forClass(ContactTransactionCategoryRelation.class);
        verify(entityManager, times(2)).persist(captor.capture());

        List<ContactTransactionCategoryRelation> relations = captor.getAllValues();
        assertThat(relations).hasSize(2);
        assertThat(relations.get(0)).isNotSameAs(relations.get(1));
    }

    @Test
    @DisplayName("Should call getSingleResult on query")
    void addContactTransactionCategoryCallsGetSingleResult() {
        // Arrange
        Contact contact = createContact(1, "Contact");
        TransactionCategory category = createTransactionCategory(1, "Category");

        when(entityManager.createQuery(anyString(), eq(Integer.class)))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult()).thenReturn(5);

        // Act
        dao.addContactTransactionCategory(contact, category);

        // Assert
        verify(integerTypedQuery).getSingleResult();
    }

    @Test
    @DisplayName("Should maintain contact reference in relation")
    void addContactTransactionCategoryMaintainsContactReference() {
        // Arrange
        Contact originalContact = createContact(15, "Original Contact");
        TransactionCategory category = createTransactionCategory(1, "Category");

        when(entityManager.createQuery(anyString(), eq(Integer.class)))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult()).thenReturn(1);

        // Act
        dao.addContactTransactionCategory(originalContact, category);

        // Assert
        ArgumentCaptor<ContactTransactionCategoryRelation> captor =
            ArgumentCaptor.forClass(ContactTransactionCategoryRelation.class);
        verify(entityManager).persist(captor.capture());
        assertThat(captor.getValue().getContact()).isSameAs(originalContact);
    }

    @Test
    @DisplayName("Should maintain transaction category reference in relation")
    void addContactTransactionCategoryMaintainsCategoryReference() {
        // Arrange
        Contact contact = createContact(1, "Contact");
        TransactionCategory originalCategory = createTransactionCategory(25, "Original Category");

        when(entityManager.createQuery(anyString(), eq(Integer.class)))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult()).thenReturn(1);

        // Act
        dao.addContactTransactionCategory(contact, originalCategory);

        // Assert
        ArgumentCaptor<ContactTransactionCategoryRelation> captor =
            ArgumentCaptor.forClass(ContactTransactionCategoryRelation.class);
        verify(entityManager).persist(captor.capture());
        assertThat(captor.getValue().getTransactionCategory()).isSameAs(originalCategory);
    }

    @Test
    @DisplayName("Should increment ID correctly for sequential operations")
    void addContactTransactionCategoryIncrementsIdSequentially() {
        // Arrange
        Contact contact = createContact(1, "Contact");
        TransactionCategory category = createTransactionCategory(1, "Category");

        when(entityManager.createQuery(anyString(), eq(Integer.class)))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult()).thenReturn(10);

        // Act
        dao.addContactTransactionCategory(contact, category);

        // Assert
        ArgumentCaptor<ContactTransactionCategoryRelation> captor =
            ArgumentCaptor.forClass(ContactTransactionCategoryRelation.class);
        verify(entityManager).persist(captor.capture());
        assertThat(captor.getValue().getId()).isEqualTo(11);
    }

    @Test
    @DisplayName("Should handle entity manager operations in correct order")
    void addContactTransactionCategoryCallsEntityManagerInOrder() {
        // Arrange
        Contact contact = createContact(1, "Contact");
        TransactionCategory category = createTransactionCategory(1, "Category");

        when(entityManager.createQuery(anyString(), eq(Integer.class)))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult()).thenReturn(1);

        // Act
        dao.addContactTransactionCategory(contact, category);

        // Assert
        var inOrder = org.mockito.Mockito.inOrder(entityManager);
        inOrder.verify(entityManager).createQuery(anyString(), eq(Integer.class));
        inOrder.verify(entityManager).persist(any(ContactTransactionCategoryRelation.class));
        inOrder.verify(entityManager).flush();
        inOrder.verify(entityManager).refresh(any(ContactTransactionCategoryRelation.class));
    }

    @Test
    @DisplayName("Should persist exactly once per addition")
    void addContactTransactionCategoryPersistsOnce() {
        // Arrange
        Contact contact = createContact(1, "Contact");
        TransactionCategory category = createTransactionCategory(1, "Category");

        when(entityManager.createQuery(anyString(), eq(Integer.class)))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult()).thenReturn(1);

        // Act
        dao.addContactTransactionCategory(contact, category);

        // Assert
        verify(entityManager, times(1)).persist(any(ContactTransactionCategoryRelation.class));
    }

    @Test
    @DisplayName("Should work with different contact and category combinations")
    void addContactTransactionCategoryWithDifferentCombinations() {
        // Arrange
        Contact contact1 = createContact(1, "Contact1");
        Contact contact2 = createContact(2, "Contact2");
        TransactionCategory category1 = createTransactionCategory(1, "Category1");
        TransactionCategory category2 = createTransactionCategory(2, "Category2");

        when(entityManager.createQuery(anyString(), eq(Integer.class)))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult()).thenReturn(1, 2, 3, 4);

        // Act
        dao.addContactTransactionCategory(contact1, category1);
        dao.addContactTransactionCategory(contact1, category2);
        dao.addContactTransactionCategory(contact2, category1);
        dao.addContactTransactionCategory(contact2, category2);

        // Assert
        verify(entityManager, times(4)).persist(any(ContactTransactionCategoryRelation.class));
    }

    @Test
    @DisplayName("Should create relation with correct entity type")
    void addContactTransactionCategoryCreatesCorrectEntityType() {
        // Arrange
        Contact contact = createContact(1, "Contact");
        TransactionCategory category = createTransactionCategory(1, "Category");

        when(entityManager.createQuery(anyString(), eq(Integer.class)))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult()).thenReturn(1);

        // Act
        dao.addContactTransactionCategory(contact, category);

        // Assert
        ArgumentCaptor<ContactTransactionCategoryRelation> captor =
            ArgumentCaptor.forClass(ContactTransactionCategoryRelation.class);
        verify(entityManager).persist(captor.capture());
        assertThat(captor.getValue()).isInstanceOf(ContactTransactionCategoryRelation.class);
    }

    private Contact createContact(Integer id, String name) {
        Contact contact = new Contact();
        contact.setContactId(id);
        contact.setContactName(name);
        return contact;
    }

    private TransactionCategory createTransactionCategory(Integer id, String name) {
        TransactionCategory category = new TransactionCategory();
        category.setTransactionCategoryId(id);
        category.setTransactionCategoryName(name);
        return category;
    }
}
