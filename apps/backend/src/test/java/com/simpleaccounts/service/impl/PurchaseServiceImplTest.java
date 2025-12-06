package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.PurchaseDao;
import com.simpleaccounts.entity.Purchase;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
class PurchaseServiceImplTest {

    @Mock
    private PurchaseDao purchaseDao;

    @InjectMocks
    private PurchaseServiceImpl purchaseService;

    private Purchase testPurchase;

    @BeforeEach
    void setUp() {
        testPurchase = new Purchase();
        testPurchase.setPurchaseId(1);
        testPurchase.setPurchaseNumber("PUR-001");
        testPurchase.setTotalAmount(BigDecimal.valueOf(5000.00));
        testPurchase.setDueAmount(BigDecimal.valueOf(1000.00));
        testPurchase.setContactId(100);
        testPurchase.setDueDate(LocalDate.now().plusDays(30));
        testPurchase.setCreatedBy(1);
        testPurchase.setCreatedDate(LocalDateTime.now());
        testPurchase.setDeleteFlag(false);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnPurchaseDaoWhenGetDaoCalled() {
        assertThat(purchaseService.getDao()).isEqualTo(purchaseDao);
    }

    @Test
    void shouldReturnNonNullDaoInstance() {
        assertThat(purchaseService.getDao()).isNotNull();
    }

    // ========== getAllPurchase Tests ==========

    @Test
    void shouldReturnAllPurchasesWhenPurchasesExist() {
        Purchase purchase2 = new Purchase();
        purchase2.setPurchaseId(2);
        purchase2.setPurchaseNumber("PUR-002");

        Purchase purchase3 = new Purchase();
        purchase3.setPurchaseId(3);
        purchase3.setPurchaseNumber("PUR-003");

        List<Purchase> expectedPurchases = Arrays.asList(testPurchase, purchase2, purchase3);
        when(purchaseDao.getAllPurchase()).thenReturn(expectedPurchases);

        List<Purchase> result = purchaseService.getAllPurchase();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(testPurchase, purchase2, purchase3);
        verify(purchaseDao, times(1)).getAllPurchase();
    }

    @Test
    void shouldReturnEmptyListWhenNoPurchasesExist() {
        when(purchaseDao.getAllPurchase()).thenReturn(Collections.emptyList());

        List<Purchase> result = purchaseService.getAllPurchase();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(purchaseDao, times(1)).getAllPurchase();
    }

    @Test
    void shouldReturnSinglePurchase() {
        List<Purchase> expectedPurchases = Collections.singletonList(testPurchase);
        when(purchaseDao.getAllPurchase()).thenReturn(expectedPurchases);

        List<Purchase> result = purchaseService.getAllPurchase();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPurchaseNumber()).isEqualTo("PUR-001");
        verify(purchaseDao, times(1)).getAllPurchase();
    }

    @Test
    void shouldHandleMultiplePurchases() {
        List<Purchase> expectedPurchases = new ArrayList<>();
        for (int i = 1; i <= 20; i++) {
            Purchase purchase = new Purchase();
            purchase.setPurchaseId(i);
            purchase.setPurchaseNumber("PUR-" + String.format("%03d", i));
            expectedPurchases.add(purchase);
        }

        when(purchaseDao.getAllPurchase()).thenReturn(expectedPurchases);

        List<Purchase> result = purchaseService.getAllPurchase();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(20);
        assertThat(result.get(0).getPurchaseNumber()).isEqualTo("PUR-001");
        assertThat(result.get(19).getPurchaseNumber()).isEqualTo("PUR-020");
        verify(purchaseDao, times(1)).getAllPurchase();
    }

    // ========== getClosestDuePurchaseByContactId Tests ==========

    @Test
    void shouldReturnClosestDuePurchaseWhenContactHasPurchases() {
        when(purchaseDao.getClosestDuePurchaseByContactId(100)).thenReturn(testPurchase);

        Purchase result = purchaseService.getClosestDuePurchaseByContactId(100);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testPurchase);
        assertThat(result.getContactId()).isEqualTo(100);
        assertThat(result.getPurchaseNumber()).isEqualTo("PUR-001");
        verify(purchaseDao, times(1)).getClosestDuePurchaseByContactId(100);
    }

    @Test
    void shouldReturnNullWhenContactHasNoPurchases() {
        when(purchaseDao.getClosestDuePurchaseByContactId(999)).thenReturn(null);

        Purchase result = purchaseService.getClosestDuePurchaseByContactId(999);

        assertThat(result).isNull();
        verify(purchaseDao, times(1)).getClosestDuePurchaseByContactId(999);
    }

    @Test
    void shouldReturnClosestDuePurchaseWhenMultipleExist() {
        Purchase closestPurchase = new Purchase();
        closestPurchase.setPurchaseId(5);
        closestPurchase.setPurchaseNumber("PUR-005");
        closestPurchase.setContactId(100);
        closestPurchase.setDueDate(LocalDate.now().plusDays(5));
        closestPurchase.setDueAmount(BigDecimal.valueOf(500.00));

        when(purchaseDao.getClosestDuePurchaseByContactId(100)).thenReturn(closestPurchase);

        Purchase result = purchaseService.getClosestDuePurchaseByContactId(100);

        assertThat(result).isNotNull();
        assertThat(result.getPurchaseNumber()).isEqualTo("PUR-005");
        assertThat(result.getDueDate()).isEqualTo(LocalDate.now().plusDays(5));
        verify(purchaseDao, times(1)).getClosestDuePurchaseByContactId(100);
    }

    @Test
    void shouldHandleNullContactId() {
        when(purchaseDao.getClosestDuePurchaseByContactId(null)).thenReturn(null);

        Purchase result = purchaseService.getClosestDuePurchaseByContactId(null);

        assertThat(result).isNull();
        verify(purchaseDao, times(1)).getClosestDuePurchaseByContactId(null);
    }

    @Test
    void shouldHandleZeroContactId() {
        when(purchaseDao.getClosestDuePurchaseByContactId(0)).thenReturn(null);

        Purchase result = purchaseService.getClosestDuePurchaseByContactId(0);

        assertThat(result).isNull();
        verify(purchaseDao, times(1)).getClosestDuePurchaseByContactId(0);
    }

    @Test
    void shouldHandleNegativeContactId() {
        when(purchaseDao.getClosestDuePurchaseByContactId(-1)).thenReturn(null);

        Purchase result = purchaseService.getClosestDuePurchaseByContactId(-1);

        assertThat(result).isNull();
        verify(purchaseDao, times(1)).getClosestDuePurchaseByContactId(-1);
    }

    // ========== getPurchaseListByDueAmount Tests ==========

    @Test
    void shouldReturnPurchasesWithDueAmount() {
        Purchase purchase2 = new Purchase();
        purchase2.setPurchaseId(2);
        purchase2.setPurchaseNumber("PUR-002");
        purchase2.setDueAmount(BigDecimal.valueOf(2000.00));

        List<Purchase> expectedPurchases = Arrays.asList(testPurchase, purchase2);
        when(purchaseDao.getPurchaseListByDueAmount()).thenReturn(expectedPurchases);

        List<Purchase> result = purchaseService.getPurchaseListByDueAmount();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(testPurchase, purchase2);
        verify(purchaseDao, times(1)).getPurchaseListByDueAmount();
    }

    @Test
    void shouldReturnEmptyListWhenNoPurchasesHaveDueAmount() {
        when(purchaseDao.getPurchaseListByDueAmount()).thenReturn(Collections.emptyList());

        List<Purchase> result = purchaseService.getPurchaseListByDueAmount();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(purchaseDao, times(1)).getPurchaseListByDueAmount();
    }

    @Test
    void shouldReturnSinglePurchaseWithDueAmount() {
        List<Purchase> expectedPurchases = Collections.singletonList(testPurchase);
        when(purchaseDao.getPurchaseListByDueAmount()).thenReturn(expectedPurchases);

        List<Purchase> result = purchaseService.getPurchaseListByDueAmount();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDueAmount()).isEqualTo(BigDecimal.valueOf(1000.00));
        verify(purchaseDao, times(1)).getPurchaseListByDueAmount();
    }

    @Test
    void shouldReturnPurchasesOrderedByDueAmount() {
        Purchase lowDue = new Purchase();
        lowDue.setPurchaseId(2);
        lowDue.setDueAmount(BigDecimal.valueOf(500.00));

        Purchase highDue = new Purchase();
        highDue.setPurchaseId(3);
        highDue.setDueAmount(BigDecimal.valueOf(5000.00));

        List<Purchase> expectedPurchases = Arrays.asList(lowDue, testPurchase, highDue);
        when(purchaseDao.getPurchaseListByDueAmount()).thenReturn(expectedPurchases);

        List<Purchase> result = purchaseService.getPurchaseListByDueAmount();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        verify(purchaseDao, times(1)).getPurchaseListByDueAmount();
    }

    // ========== deleteByIds Tests ==========

    @Test
    void shouldDeleteSinglePurchaseById() {
        List<Integer> ids = Collections.singletonList(1);

        purchaseService.deleteByIds(ids);

        verify(purchaseDao, times(1)).deleteByIds(ids);
    }

    @Test
    void shouldDeleteMultiplePurchasesByIds() {
        List<Integer> ids = Arrays.asList(1, 2, 3, 4, 5);

        purchaseService.deleteByIds(ids);

        ArgumentCaptor<List<Integer>> captor = ArgumentCaptor.forClass(List.class);
        verify(purchaseDao, times(1)).deleteByIds(captor.capture());

        List<Integer> capturedIds = captor.getValue();
        assertThat(capturedIds).hasSize(5);
        assertThat(capturedIds).containsExactly(1, 2, 3, 4, 5);
    }

    @Test
    void shouldHandleEmptyIdsList() {
        List<Integer> ids = Collections.emptyList();

        purchaseService.deleteByIds(ids);

        verify(purchaseDao, times(1)).deleteByIds(ids);
    }

    @Test
    void shouldHandleLargeNumberOfIds() {
        List<Integer> ids = new ArrayList<>();
        for (int i = 1; i <= 100; i++) {
            ids.add(i);
        }

        purchaseService.deleteByIds(ids);

        ArgumentCaptor<List<Integer>> captor = ArgumentCaptor.forClass(List.class);
        verify(purchaseDao, times(1)).deleteByIds(captor.capture());

        List<Integer> capturedIds = captor.getValue();
        assertThat(capturedIds).hasSize(100);
        assertThat(capturedIds.get(0)).isEqualTo(1);
        assertThat(capturedIds.get(99)).isEqualTo(100);
    }

    @Test
    void shouldHandleNullIdsList() {
        purchaseService.deleteByIds(null);

        verify(purchaseDao, times(1)).deleteByIds(null);
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldFindPurchaseByPrimaryKey() {
        when(purchaseDao.findByPK(1)).thenReturn(testPurchase);

        Purchase result = purchaseService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testPurchase);
        assertThat(result.getPurchaseId()).isEqualTo(1);
        verify(purchaseDao, times(1)).findByPK(1);
    }

    @Test
    void shouldReturnNullWhenPurchaseNotFoundByPK() {
        when(purchaseDao.findByPK(999)).thenReturn(null);

        Purchase result = purchaseService.findByPK(999);

        assertThat(result).isNull();
        verify(purchaseDao, times(1)).findByPK(999);
    }

    @Test
    void shouldPersistNewPurchase() {
        purchaseService.persist(testPurchase);

        verify(purchaseDao, times(1)).persist(testPurchase);
    }

    @Test
    void shouldUpdateExistingPurchase() {
        when(purchaseDao.update(testPurchase)).thenReturn(testPurchase);

        Purchase result = purchaseService.update(testPurchase);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testPurchase);
        verify(purchaseDao, times(1)).update(testPurchase);
    }

    @Test
    void shouldUpdatePurchaseAndReturnUpdatedEntity() {
        testPurchase.setPurchaseNumber("PUR-999");
        testPurchase.setDueAmount(BigDecimal.valueOf(500.00));
        when(purchaseDao.update(testPurchase)).thenReturn(testPurchase);

        Purchase result = purchaseService.update(testPurchase);

        assertThat(result).isNotNull();
        assertThat(result.getPurchaseNumber()).isEqualTo("PUR-999");
        assertThat(result.getDueAmount()).isEqualTo(BigDecimal.valueOf(500.00));
        verify(purchaseDao, times(1)).update(testPurchase);
    }

    @Test
    void shouldDeletePurchase() {
        purchaseService.delete(testPurchase);

        verify(purchaseDao, times(1)).delete(testPurchase);
    }

    @Test
    void shouldFindPurchasesByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("purchaseNumber", "PUR-001");
        attributes.put("deleteFlag", false);

        List<Purchase> expectedList = Arrays.asList(testPurchase);
        when(purchaseDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<Purchase> result = purchaseService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testPurchase);
        verify(purchaseDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("purchaseNumber", "PUR-999");

        when(purchaseDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<Purchase> result = purchaseService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(purchaseDao, times(1)).findByAttributes(attributes);
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandlePurchaseWithNullDueAmount() {
        Purchase purchaseWithNullDue = new Purchase();
        purchaseWithNullDue.setPurchaseId(2);
        purchaseWithNullDue.setPurchaseNumber("PUR-002");
        purchaseWithNullDue.setDueAmount(null);

        when(purchaseDao.findByPK(2)).thenReturn(purchaseWithNullDue);

        Purchase result = purchaseService.findByPK(2);

        assertThat(result).isNotNull();
        assertThat(result.getDueAmount()).isNull();
        verify(purchaseDao, times(1)).findByPK(2);
    }

    @Test
    void shouldHandlePurchaseWithZeroDueAmount() {
        Purchase purchaseWithZeroDue = new Purchase();
        purchaseWithZeroDue.setPurchaseId(3);
        purchaseWithZeroDue.setPurchaseNumber("PUR-003");
        purchaseWithZeroDue.setDueAmount(BigDecimal.ZERO);

        when(purchaseDao.findByPK(3)).thenReturn(purchaseWithZeroDue);

        Purchase result = purchaseService.findByPK(3);

        assertThat(result).isNotNull();
        assertThat(result.getDueAmount()).isEqualTo(BigDecimal.ZERO);
        verify(purchaseDao, times(1)).findByPK(3);
    }

    @Test
    void shouldHandlePurchaseWithNullDueDate() {
        Purchase purchaseWithNullDate = new Purchase();
        purchaseWithNullDate.setPurchaseId(4);
        purchaseWithNullDate.setPurchaseNumber("PUR-004");
        purchaseWithNullDate.setDueDate(null);

        when(purchaseDao.findByPK(4)).thenReturn(purchaseWithNullDate);

        Purchase result = purchaseService.findByPK(4);

        assertThat(result).isNotNull();
        assertThat(result.getDueDate()).isNull();
        verify(purchaseDao, times(1)).findByPK(4);
    }

    @Test
    void shouldHandlePurchaseWithMinimalData() {
        Purchase minimalPurchase = new Purchase();
        minimalPurchase.setPurchaseId(99);

        when(purchaseDao.findByPK(99)).thenReturn(minimalPurchase);

        Purchase result = purchaseService.findByPK(99);

        assertThat(result).isNotNull();
        assertThat(result.getPurchaseId()).isEqualTo(99);
        assertThat(result.getPurchaseNumber()).isNull();
        assertThat(result.getDueAmount()).isNull();
        verify(purchaseDao, times(1)).findByPK(99);
    }

    @Test
    void shouldVerifyTransactionalBehavior() {
        when(purchaseDao.getAllPurchase()).thenReturn(Arrays.asList(testPurchase));

        purchaseService.getAllPurchase();
        purchaseService.getAllPurchase();

        verify(purchaseDao, times(2)).getAllPurchase();
    }

    @Test
    void shouldHandlePurchaseWithPastDueDate() {
        Purchase overduePurchase = new Purchase();
        overduePurchase.setPurchaseId(5);
        overduePurchase.setPurchaseNumber("PUR-005");
        overduePurchase.setDueDate(LocalDate.now().minusDays(30));
        overduePurchase.setDueAmount(BigDecimal.valueOf(3000.00));

        when(purchaseDao.getClosestDuePurchaseByContactId(100)).thenReturn(overduePurchase);

        Purchase result = purchaseService.getClosestDuePurchaseByContactId(100);

        assertThat(result).isNotNull();
        assertThat(result.getDueDate()).isBefore(LocalDate.now());
        verify(purchaseDao, times(1)).getClosestDuePurchaseByContactId(100);
    }

    @Test
    void shouldHandlePurchaseWithVeryLargeDueAmount() {
        Purchase largePurchase = new Purchase();
        largePurchase.setPurchaseId(6);
        largePurchase.setDueAmount(new BigDecimal("999999999999.99"));

        when(purchaseDao.findByPK(6)).thenReturn(largePurchase);

        Purchase result = purchaseService.findByPK(6);

        assertThat(result).isNotNull();
        assertThat(result.getDueAmount()).isEqualTo(new BigDecimal("999999999999.99"));
        verify(purchaseDao, times(1)).findByPK(6);
    }
}
