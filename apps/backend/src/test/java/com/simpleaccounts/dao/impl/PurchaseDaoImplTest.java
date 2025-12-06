package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.Purchase;
import java.math.BigDecimal;
import java.time.LocalDateTime;
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
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("PurchaseDaoImpl Unit Tests")
class PurchaseDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<Purchase> purchaseTypedQuery;

    @InjectMocks
    private PurchaseDaoImpl purchaseDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(purchaseDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(purchaseDao, "entityClass", Purchase.class);
    }

    @Test
    @DisplayName("Should return all purchases using named query")
    void getAllPurchaseReturnsAllPurchases() {
        // Arrange
        List<Purchase> purchases = createPurchaseList(5);
        when(entityManager.createNamedQuery("allPurchase", Purchase.class))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.getResultList())
            .thenReturn(purchases);

        // Act
        List<Purchase> result = purchaseDao.getAllPurchase();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        assertThat(result).isEqualTo(purchases);
    }

    @Test
    @DisplayName("Should return empty list when no purchases exist")
    void getAllPurchaseReturnsEmptyListWhenNoPurchases() {
        // Arrange
        when(entityManager.createNamedQuery("allPurchase", Purchase.class))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<Purchase> result = purchaseDao.getAllPurchase();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should use allPurchase named query")
    void getAllPurchaseUsesNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("allPurchase", Purchase.class))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        purchaseDao.getAllPurchase();

        // Assert
        verify(entityManager).createNamedQuery("allPurchase", Purchase.class);
    }

    @Test
    @DisplayName("Should return closest due purchase by contact ID")
    void getClosestDuePurchaseByContactIdReturnsClosestPurchase() {
        // Arrange
        Integer contactId = 1;
        List<Purchase> purchases = createPurchaseList(3);
        purchases.get(0).setPurchaseDueDate(LocalDateTime.now().plusDays(1));
        purchases.get(1).setPurchaseDueDate(LocalDateTime.now().plusDays(5));
        purchases.get(2).setPurchaseDueDate(LocalDateTime.now().plusDays(10));

        when(entityManager.createQuery(anyString(), eq(Purchase.class)))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.setParameter("contactId", contactId))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.setParameter("dueAmount", new BigDecimal(0)))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.getResultList())
            .thenReturn(purchases);

        // Act
        Purchase result = purchaseDao.getClosestDuePurchaseByContactId(contactId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(purchases.get(0));
    }

    @Test
    @DisplayName("Should return null when no purchases with due amount exist for contact")
    void getClosestDuePurchaseByContactIdReturnsNullWhenNoPurchases() {
        // Arrange
        Integer contactId = 1;
        when(entityManager.createQuery(anyString(), eq(Purchase.class)))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.setParameter("contactId", contactId))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.setParameter("dueAmount", new BigDecimal(0)))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        Purchase result = purchaseDao.getClosestDuePurchaseByContactId(contactId);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return null when purchase list is null for contact")
    void getClosestDuePurchaseByContactIdReturnsNullWhenListIsNull() {
        // Arrange
        Integer contactId = 1;
        when(entityManager.createQuery(anyString(), eq(Purchase.class)))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.setParameter("contactId", contactId))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.setParameter("dueAmount", new BigDecimal(0)))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.getResultList())
            .thenReturn(null);

        // Act
        Purchase result = purchaseDao.getClosestDuePurchaseByContactId(contactId);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should set contact ID parameter correctly")
    void getClosestDuePurchaseByContactIdSetsContactIdParameter() {
        // Arrange
        Integer contactId = 123;
        when(entityManager.createQuery(anyString(), eq(Purchase.class)))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.setParameter("contactId", contactId))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.setParameter("dueAmount", new BigDecimal(0)))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        purchaseDao.getClosestDuePurchaseByContactId(contactId);

        // Assert
        verify(purchaseTypedQuery).setParameter("contactId", contactId);
        verify(purchaseTypedQuery).setParameter("dueAmount", new BigDecimal(0));
    }

    @Test
    @DisplayName("Should return purchase list by due amount")
    void getPurchaseListByDueAmountReturnsPurchaseList() {
        // Arrange
        List<Purchase> purchases = createPurchaseList(5);
        when(entityManager.createQuery(anyString(), eq(Purchase.class)))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.setParameter("dueAmount", BigDecimal.valueOf(0)))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.getResultList())
            .thenReturn(purchases);

        // Act
        List<Purchase> result = purchaseDao.getPurchaseListByDueAmount();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        assertThat(result).isEqualTo(purchases);
    }

    @Test
    @DisplayName("Should return empty list when no purchases with due amount")
    void getPurchaseListByDueAmountReturnsEmptyListWhenNoPurchases() {
        // Arrange
        when(entityManager.createQuery(anyString(), eq(Purchase.class)))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.setParameter("dueAmount", BigDecimal.valueOf(0)))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<Purchase> result = purchaseDao.getPurchaseListByDueAmount();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return empty list when result is null")
    void getPurchaseListByDueAmountReturnsEmptyListWhenNull() {
        // Arrange
        when(entityManager.createQuery(anyString(), eq(Purchase.class)))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.setParameter("dueAmount", BigDecimal.valueOf(0)))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.getResultList())
            .thenReturn(null);

        // Act
        List<Purchase> result = purchaseDao.getPurchaseListByDueAmount();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should set due amount parameter correctly")
    void getPurchaseListByDueAmountSetsDueAmountParameter() {
        // Arrange
        when(entityManager.createQuery(anyString(), eq(Purchase.class)))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.setParameter("dueAmount", BigDecimal.valueOf(0)))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        purchaseDao.getPurchaseListByDueAmount();

        // Assert
        verify(purchaseTypedQuery).setParameter("dueAmount", BigDecimal.valueOf(0));
    }

    @Test
    @DisplayName("Should soft delete purchases by setting delete flag")
    void deleteByIdsSetsDeleteFlagOnPurchases() {
        // Arrange
        List<Integer> ids = Arrays.asList(1, 2, 3);
        Purchase purchase1 = createPurchase(1);
        Purchase purchase2 = createPurchase(2);
        Purchase purchase3 = createPurchase(3);

        when(entityManager.find(Purchase.class, 1)).thenReturn(purchase1);
        when(entityManager.find(Purchase.class, 2)).thenReturn(purchase2);
        when(entityManager.find(Purchase.class, 3)).thenReturn(purchase3);
        when(entityManager.merge(any(Purchase.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        purchaseDao.deleteByIds(ids);

        // Assert
        verify(entityManager, times(3)).merge(any(Purchase.class));
        assertThat(purchase1.getDeleteFlag()).isTrue();
        assertThat(purchase2.getDeleteFlag()).isTrue();
        assertThat(purchase3.getDeleteFlag()).isTrue();
    }

    @Test
    @DisplayName("Should not delete when IDs list is empty")
    void deleteByIdsDoesNotDeleteWhenListEmpty() {
        // Arrange
        List<Integer> emptyIds = new ArrayList<>();

        // Act
        purchaseDao.deleteByIds(emptyIds);

        // Assert
        verify(entityManager, never()).find(any(), any());
        verify(entityManager, never()).merge(any());
    }

    @Test
    @DisplayName("Should not delete when IDs list is null")
    void deleteByIdsDoesNotDeleteWhenListNull() {
        // Act
        purchaseDao.deleteByIds(null);

        // Assert
        verify(entityManager, never()).find(any(), any());
        verify(entityManager, never()).merge(any());
    }

    @Test
    @DisplayName("Should delete single purchase")
    void deleteByIdsDeletesSinglePurchase() {
        // Arrange
        List<Integer> ids = Collections.singletonList(1);
        Purchase purchase = createPurchase(1);

        when(entityManager.find(Purchase.class, 1)).thenReturn(purchase);
        when(entityManager.merge(any(Purchase.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        purchaseDao.deleteByIds(ids);

        // Assert
        verify(entityManager).merge(purchase);
        assertThat(purchase.getDeleteFlag()).isTrue();
    }

    @Test
    @DisplayName("Should find and update each purchase by ID")
    void deleteByIdsFindsAndUpdatesEachPurchase() {
        // Arrange
        List<Integer> ids = Arrays.asList(5, 10);
        Purchase purchase1 = createPurchase(5);
        Purchase purchase2 = createPurchase(10);

        when(entityManager.find(Purchase.class, 5)).thenReturn(purchase1);
        when(entityManager.find(Purchase.class, 10)).thenReturn(purchase2);
        when(entityManager.merge(any(Purchase.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        purchaseDao.deleteByIds(ids);

        // Assert
        verify(entityManager).find(Purchase.class, 5);
        verify(entityManager).find(Purchase.class, 10);
        verify(entityManager, times(2)).merge(any(Purchase.class));
    }

    @Test
    @DisplayName("Should handle delete flag properly")
    void deleteByIdsSetsDeleteFlagProperly() {
        // Arrange
        Purchase purchase = createPurchase(1);
        purchase.setDeleteFlag(Boolean.FALSE);

        when(entityManager.find(Purchase.class, 1)).thenReturn(purchase);
        when(entityManager.merge(any(Purchase.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        purchaseDao.deleteByIds(Collections.singletonList(1));

        // Assert
        assertThat(purchase.getDeleteFlag()).isTrue();
    }

    @Test
    @DisplayName("Should call merge for each purchase in deleteByIds")
    void deleteByIdsCallsMergeForEachPurchase() {
        // Arrange
        List<Integer> ids = Arrays.asList(1, 2);
        when(entityManager.find(eq(Purchase.class), any(Integer.class)))
            .thenReturn(createPurchase(1));
        when(entityManager.merge(any(Purchase.class)))
            .thenAnswer(i -> i.getArguments()[0]);

        // Act
        purchaseDao.deleteByIds(ids);

        // Assert
        verify(entityManager, times(2)).merge(any(Purchase.class));
    }

    @Test
    @DisplayName("Should handle large number of IDs for deletion")
    void deleteByIdsHandlesLargeNumberOfIds() {
        // Arrange
        List<Integer> ids = new ArrayList<>();
        for (int i = 1; i <= 100; i++) {
            ids.add(i);
            when(entityManager.find(Purchase.class, i))
                .thenReturn(createPurchase(i));
        }
        when(entityManager.merge(any(Purchase.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        purchaseDao.deleteByIds(ids);

        // Assert
        verify(entityManager, times(100)).find(eq(Purchase.class), any(Integer.class));
        verify(entityManager, times(100)).merge(any(Purchase.class));
    }

    @Test
    @DisplayName("Should verify purchase entity structure")
    void purchaseEntityHasCorrectStructure() {
        // Arrange
        Purchase purchase = createPurchase(1);
        purchase.setPurchaseAmount(new BigDecimal("1000.00"));
        purchase.setPurchaseDueAmount(new BigDecimal("500.00"));
        purchase.setPurchaseDescription("Test Purchase");
        purchase.setReceiptNumber("REC-001");

        // Assert
        assertThat(purchase.getPurchaseId()).isEqualTo(1);
        assertThat(purchase.getPurchaseAmount()).isEqualTo(new BigDecimal("1000.00"));
        assertThat(purchase.getPurchaseDueAmount()).isEqualTo(new BigDecimal("500.00"));
        assertThat(purchase.getPurchaseDescription()).isEqualTo("Test Purchase");
        assertThat(purchase.getReceiptNumber()).isEqualTo("REC-001");
        assertThat(purchase.getDeleteFlag()).isFalse();
    }

    @Test
    @DisplayName("Should filter purchases with non-zero due amount")
    void getClosestDuePurchaseByContactIdFiltersNonZeroDueAmount() {
        // Arrange
        Integer contactId = 1;
        Purchase purchase1 = createPurchase(1);
        purchase1.setPurchaseDueAmount(new BigDecimal("100.00"));
        List<Purchase> purchases = Collections.singletonList(purchase1);

        when(entityManager.createQuery(anyString(), eq(Purchase.class)))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.setParameter("contactId", contactId))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.setParameter("dueAmount", new BigDecimal(0)))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.getResultList())
            .thenReturn(purchases);

        // Act
        Purchase result = purchaseDao.getClosestDuePurchaseByContactId(contactId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getPurchaseDueAmount()).isNotEqualTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should return purchases ordered by due date ascending")
    void getClosestDuePurchaseByContactIdOrdersByDueDateAsc() {
        // Arrange
        Integer contactId = 1;
        List<Purchase> purchases = createPurchaseList(3);
        LocalDateTime now = LocalDateTime.now();
        purchases.get(0).setPurchaseDueDate(now.plusDays(1));
        purchases.get(1).setPurchaseDueDate(now.plusDays(2));
        purchases.get(2).setPurchaseDueDate(now.plusDays(3));

        when(entityManager.createQuery(anyString(), eq(Purchase.class)))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.setParameter("contactId", contactId))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.setParameter("dueAmount", new BigDecimal(0)))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.getResultList())
            .thenReturn(purchases);

        // Act
        Purchase result = purchaseDao.getClosestDuePurchaseByContactId(contactId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getPurchaseDueDate()).isEqualTo(now.plusDays(1));
    }

    @Test
    @DisplayName("Should maintain delete flag false for new purchases")
    void newPurchaseHasDeleteFlagFalse() {
        // Arrange & Act
        Purchase purchase = createPurchase(100);

        // Assert
        assertThat(purchase.getDeleteFlag()).isFalse();
    }

    @Test
    @DisplayName("Should call named query exactly once for getAllPurchase")
    void getAllPurchaseCallsNamedQueryOnce() {
        // Arrange
        when(entityManager.createNamedQuery("allPurchase", Purchase.class))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        purchaseDao.getAllPurchase();

        // Assert
        verify(entityManager, times(1)).createNamedQuery("allPurchase", Purchase.class);
    }

    @Test
    @DisplayName("Should handle multiple purchases with same due date")
    void getClosestDuePurchaseReturnsFirstWhenMultipleSameDueDate() {
        // Arrange
        Integer contactId = 1;
        List<Purchase> purchases = createPurchaseList(2);
        LocalDateTime dueDate = LocalDateTime.now().plusDays(5);
        purchases.get(0).setPurchaseDueDate(dueDate);
        purchases.get(1).setPurchaseDueDate(dueDate);

        when(entityManager.createQuery(anyString(), eq(Purchase.class)))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.setParameter("contactId", contactId))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.setParameter("dueAmount", new BigDecimal(0)))
            .thenReturn(purchaseTypedQuery);
        when(purchaseTypedQuery.getResultList())
            .thenReturn(purchases);

        // Act
        Purchase result = purchaseDao.getClosestDuePurchaseByContactId(contactId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(purchases.get(0));
    }

    private List<Purchase> createPurchaseList(int count) {
        List<Purchase> purchases = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            purchases.add(createPurchase(i + 1));
        }
        return purchases;
    }

    private Purchase createPurchase(int id) {
        Purchase purchase = new Purchase();
        purchase.setPurchaseId(id);
        purchase.setPurchaseAmount(new BigDecimal("1000.00"));
        purchase.setPurchaseDueAmount(new BigDecimal("500.00"));
        purchase.setPurchaseDate(LocalDateTime.now());
        purchase.setPurchaseDueDate(LocalDateTime.now().plusDays(30));
        purchase.setDeleteFlag(Boolean.FALSE);
        return purchase;
    }
}
