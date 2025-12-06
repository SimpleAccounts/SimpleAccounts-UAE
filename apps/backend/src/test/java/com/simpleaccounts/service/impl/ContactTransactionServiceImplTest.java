package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.ContactTransactionCategoryRelationDao;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.ContactTransactionCategoryRelation;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.exceptions.ServiceException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ContactTransactionServiceImplTest {

    @Mock
    private ContactTransactionCategoryRelationDao contactTransactionCategoryRelationDao;

    @InjectMocks
    private ContactTransactionServiceImpl contactTransactionService;

    private ContactTransactionCategoryRelation testRelation;
    private Contact testContact;
    private TransactionCategory testTransactionCategory;

    @BeforeEach
    void setUp() {
        testContact = new Contact();
        testContact.setContactId(1);
        testContact.setContactName("Test Contact");

        testTransactionCategory = new TransactionCategory();
        testTransactionCategory.setTransactionCategoryId(100);
        testTransactionCategory.setTransactionCategoryName("Sales");

        testRelation = new ContactTransactionCategoryRelation();
        testRelation.setContactTransactionCategoryRelationId(1);
        testRelation.setContact(testContact);
        testRelation.setTransactionCategory(testTransactionCategory);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnContactTransactionCategoryRelationDaoWhenGetDaoCalled() {
        assertThat(contactTransactionService.getDao()).isEqualTo(contactTransactionCategoryRelationDao);
    }

    @Test
    void shouldReturnNonNullDao() {
        assertThat(contactTransactionService.getDao()).isNotNull();
    }

    // ========== addContactTransactionCategory Tests ==========

    @Test
    void shouldAddContactTransactionCategoryWhenValidParametersProvided() {
        contactTransactionService.addContactTransactionCategory(testContact, testTransactionCategory);

        verify(contactTransactionCategoryRelationDao, times(1))
                .addContactTransactionCategory(testContact, testTransactionCategory);
    }

    @Test
    void shouldAddContactTransactionCategoryWithDifferentContact() {
        Contact anotherContact = new Contact();
        anotherContact.setContactId(2);
        anotherContact.setContactName("Another Contact");

        contactTransactionService.addContactTransactionCategory(anotherContact, testTransactionCategory);

        ArgumentCaptor<Contact> contactCaptor = ArgumentCaptor.forClass(Contact.class);
        ArgumentCaptor<TransactionCategory> categoryCaptor = ArgumentCaptor.forClass(TransactionCategory.class);

        verify(contactTransactionCategoryRelationDao, times(1))
                .addContactTransactionCategory(contactCaptor.capture(), categoryCaptor.capture());

        assertThat(contactCaptor.getValue().getContactId()).isEqualTo(2);
        assertThat(contactCaptor.getValue().getContactName()).isEqualTo("Another Contact");
    }

    @Test
    void shouldAddContactTransactionCategoryWithDifferentCategory() {
        TransactionCategory anotherCategory = new TransactionCategory();
        anotherCategory.setTransactionCategoryId(200);
        anotherCategory.setTransactionCategoryName("Purchases");

        contactTransactionService.addContactTransactionCategory(testContact, anotherCategory);

        ArgumentCaptor<Contact> contactCaptor = ArgumentCaptor.forClass(Contact.class);
        ArgumentCaptor<TransactionCategory> categoryCaptor = ArgumentCaptor.forClass(TransactionCategory.class);

        verify(contactTransactionCategoryRelationDao, times(1))
                .addContactTransactionCategory(contactCaptor.capture(), categoryCaptor.capture());

        assertThat(categoryCaptor.getValue().getTransactionCategoryId()).isEqualTo(200);
        assertThat(categoryCaptor.getValue().getTransactionCategoryName()).isEqualTo("Purchases");
    }

    @Test
    void shouldHandleNullContact() {
        contactTransactionService.addContactTransactionCategory(null, testTransactionCategory);

        verify(contactTransactionCategoryRelationDao, times(1))
                .addContactTransactionCategory(null, testTransactionCategory);
    }

    @Test
    void shouldHandleNullTransactionCategory() {
        contactTransactionService.addContactTransactionCategory(testContact, null);

        verify(contactTransactionCategoryRelationDao, times(1))
                .addContactTransactionCategory(testContact, null);
    }

    @Test
    void shouldHandleBothNullParameters() {
        contactTransactionService.addContactTransactionCategory(null, null);

        verify(contactTransactionCategoryRelationDao, times(1))
                .addContactTransactionCategory(null, null);
    }

    @Test
    void shouldAddMultipleContactTransactionCategories() {
        TransactionCategory category1 = new TransactionCategory();
        category1.setTransactionCategoryId(100);

        TransactionCategory category2 = new TransactionCategory();
        category2.setTransactionCategoryId(200);

        TransactionCategory category3 = new TransactionCategory();
        category3.setTransactionCategoryId(300);

        contactTransactionService.addContactTransactionCategory(testContact, category1);
        contactTransactionService.addContactTransactionCategory(testContact, category2);
        contactTransactionService.addContactTransactionCategory(testContact, category3);

        verify(contactTransactionCategoryRelationDao, times(3))
                .addContactTransactionCategory(eq(testContact), any(TransactionCategory.class));
    }

    @Test
    void shouldAddSameCategoryToMultipleContacts() {
        Contact contact1 = new Contact();
        contact1.setContactId(1);

        Contact contact2 = new Contact();
        contact2.setContactId(2);

        Contact contact3 = new Contact();
        contact3.setContactId(3);

        contactTransactionService.addContactTransactionCategory(contact1, testTransactionCategory);
        contactTransactionService.addContactTransactionCategory(contact2, testTransactionCategory);
        contactTransactionService.addContactTransactionCategory(contact3, testTransactionCategory);

        verify(contactTransactionCategoryRelationDao, times(3))
                .addContactTransactionCategory(any(Contact.class), eq(testTransactionCategory));
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldFindRelationByPrimaryKey() {
        when(contactTransactionCategoryRelationDao.findByPK(1)).thenReturn(testRelation);

        ContactTransactionCategoryRelation result = contactTransactionService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testRelation);
        assertThat(result.getContactTransactionCategoryRelationId()).isEqualTo(1);
        verify(contactTransactionCategoryRelationDao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenRelationNotFoundByPK() {
        when(contactTransactionCategoryRelationDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> contactTransactionService.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(contactTransactionCategoryRelationDao, times(1)).findByPK(999);
    }

    @Test
    void shouldPersistNewRelation() {
        contactTransactionService.persist(testRelation);

        verify(contactTransactionCategoryRelationDao, times(1)).persist(testRelation);
    }

    @Test
    void shouldUpdateExistingRelation() {
        when(contactTransactionCategoryRelationDao.update(testRelation)).thenReturn(testRelation);

        ContactTransactionCategoryRelation result = contactTransactionService.update(testRelation);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testRelation);
        verify(contactTransactionCategoryRelationDao, times(1)).update(testRelation);
    }

    @Test
    void shouldDeleteRelation() {
        contactTransactionService.delete(testRelation);

        verify(contactTransactionCategoryRelationDao, times(1)).delete(testRelation);
    }

    @Test
    void shouldFindRelationsByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("contactId", 1);

        List<ContactTransactionCategoryRelation> expectedList = Arrays.asList(testRelation);
        when(contactTransactionCategoryRelationDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<ContactTransactionCategoryRelation> result = contactTransactionService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testRelation);
        verify(contactTransactionCategoryRelationDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("contactId", 999);

        when(contactTransactionCategoryRelationDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<ContactTransactionCategoryRelation> result = contactTransactionService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(contactTransactionCategoryRelationDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<ContactTransactionCategoryRelation> result = contactTransactionService.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(contactTransactionCategoryRelationDao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<ContactTransactionCategoryRelation> result = contactTransactionService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(contactTransactionCategoryRelationDao, never()).findByAttributes(any());
    }

    @Test
    void shouldFindMultipleRelationsByAttributes() {
        ContactTransactionCategoryRelation relation2 = new ContactTransactionCategoryRelation();
        relation2.setContactTransactionCategoryRelationId(2);
        relation2.setContact(testContact);

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("contactId", 1);

        List<ContactTransactionCategoryRelation> expectedList = Arrays.asList(testRelation, relation2);
        when(contactTransactionCategoryRelationDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<ContactTransactionCategoryRelation> result = contactTransactionService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        verify(contactTransactionCategoryRelationDao, times(1)).findByAttributes(attributes);
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleContactWithZeroId() {
        Contact contactWithZeroId = new Contact();
        contactWithZeroId.setContactId(0);

        contactTransactionService.addContactTransactionCategory(contactWithZeroId, testTransactionCategory);

        ArgumentCaptor<Contact> captor = ArgumentCaptor.forClass(Contact.class);
        verify(contactTransactionCategoryRelationDao, times(1))
                .addContactTransactionCategory(captor.capture(), any(TransactionCategory.class));

        assertThat(captor.getValue().getContactId()).isEqualTo(0);
    }

    @Test
    void shouldHandleTransactionCategoryWithZeroId() {
        TransactionCategory categoryWithZeroId = new TransactionCategory();
        categoryWithZeroId.setTransactionCategoryId(0);

        contactTransactionService.addContactTransactionCategory(testContact, categoryWithZeroId);

        ArgumentCaptor<TransactionCategory> captor = ArgumentCaptor.forClass(TransactionCategory.class);
        verify(contactTransactionCategoryRelationDao, times(1))
                .addContactTransactionCategory(any(Contact.class), captor.capture());

        assertThat(captor.getValue().getTransactionCategoryId()).isEqualTo(0);
    }

    @Test
    void shouldHandleContactWithNullName() {
        Contact contactWithNullName = new Contact();
        contactWithNullName.setContactId(5);
        contactWithNullName.setContactName(null);

        contactTransactionService.addContactTransactionCategory(contactWithNullName, testTransactionCategory);

        ArgumentCaptor<Contact> captor = ArgumentCaptor.forClass(Contact.class);
        verify(contactTransactionCategoryRelationDao, times(1))
                .addContactTransactionCategory(captor.capture(), any(TransactionCategory.class));

        assertThat(captor.getValue().getContactName()).isNull();
    }

    @Test
    void shouldHandleTransactionCategoryWithNullName() {
        TransactionCategory categoryWithNullName = new TransactionCategory();
        categoryWithNullName.setTransactionCategoryId(50);
        categoryWithNullName.setTransactionCategoryName(null);

        contactTransactionService.addContactTransactionCategory(testContact, categoryWithNullName);

        ArgumentCaptor<TransactionCategory> captor = ArgumentCaptor.forClass(TransactionCategory.class);
        verify(contactTransactionCategoryRelationDao, times(1))
                .addContactTransactionCategory(any(Contact.class), captor.capture());

        assertThat(captor.getValue().getTransactionCategoryName()).isNull();
    }

    @Test
    void shouldHandleMultiplePersistOperations() {
        ContactTransactionCategoryRelation relation1 = new ContactTransactionCategoryRelation();
        ContactTransactionCategoryRelation relation2 = new ContactTransactionCategoryRelation();
        ContactTransactionCategoryRelation relation3 = new ContactTransactionCategoryRelation();

        contactTransactionService.persist(relation1);
        contactTransactionService.persist(relation2);
        contactTransactionService.persist(relation3);

        verify(contactTransactionCategoryRelationDao, times(3)).persist(any(ContactTransactionCategoryRelation.class));
    }

    @Test
    void shouldHandleMultipleUpdateOperations() {
        when(contactTransactionCategoryRelationDao.update(any(ContactTransactionCategoryRelation.class)))
                .thenReturn(testRelation);

        contactTransactionService.update(testRelation);
        contactTransactionService.update(testRelation);

        verify(contactTransactionCategoryRelationDao, times(2)).update(testRelation);
    }

    @Test
    void shouldHandleMultipleDeleteOperations() {
        contactTransactionService.delete(testRelation);
        contactTransactionService.delete(testRelation);

        verify(contactTransactionCategoryRelationDao, times(2)).delete(testRelation);
    }

    @Test
    void shouldHandleLargeContactId() {
        Contact contactWithLargeId = new Contact();
        contactWithLargeId.setContactId(Integer.MAX_VALUE);

        contactTransactionService.addContactTransactionCategory(contactWithLargeId, testTransactionCategory);

        ArgumentCaptor<Contact> captor = ArgumentCaptor.forClass(Contact.class);
        verify(contactTransactionCategoryRelationDao, times(1))
                .addContactTransactionCategory(captor.capture(), any(TransactionCategory.class));

        assertThat(captor.getValue().getContactId()).isEqualTo(Integer.MAX_VALUE);
    }

    @Test
    void shouldHandleLargeTransactionCategoryId() {
        TransactionCategory categoryWithLargeId = new TransactionCategory();
        categoryWithLargeId.setTransactionCategoryId(Integer.MAX_VALUE);

        contactTransactionService.addContactTransactionCategory(testContact, categoryWithLargeId);

        ArgumentCaptor<TransactionCategory> captor = ArgumentCaptor.forClass(TransactionCategory.class);
        verify(contactTransactionCategoryRelationDao, times(1))
                .addContactTransactionCategory(any(Contact.class), captor.capture());

        assertThat(captor.getValue().getTransactionCategoryId()).isEqualTo(Integer.MAX_VALUE);
    }

    @Test
    void shouldVerifyDaoInteractionForAddContactTransactionCategory() {
        contactTransactionService.addContactTransactionCategory(testContact, testTransactionCategory);
        contactTransactionService.addContactTransactionCategory(testContact, testTransactionCategory);
        contactTransactionService.addContactTransactionCategory(testContact, testTransactionCategory);

        verify(contactTransactionCategoryRelationDao, times(3))
                .addContactTransactionCategory(testContact, testTransactionCategory);
    }
}
