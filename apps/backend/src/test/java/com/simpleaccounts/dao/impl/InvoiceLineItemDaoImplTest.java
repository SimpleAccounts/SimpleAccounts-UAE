package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.InvoiceLineItem;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
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
@DisplayName("InvoiceLineItemDaoImpl Unit Tests")
class InvoiceLineItemDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private Query query;

    @Mock
    private TypedQuery<InvoiceLineItem> typedQuery;

    @InjectMocks
    private InvoiceLineItemDaoImpl invoiceLineItemDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(invoiceLineItemDao, "entityManager", entityManager);
    }

    @Test
    @DisplayName("Should delete invoice line items by invoice ID successfully")
    void deleteByInvoiceIdDeletesItemsSuccessfully() {
        // Arrange
        Integer invoiceId = 1;
        int expectedDeleteCount = 5;

        when(entityManager.createQuery("DELETE FROM InvoiceLineItem i WHERE i.invoice.id = :invoiceId "))
            .thenReturn(query);
        when(query.setParameter("invoiceId", invoiceId))
            .thenReturn(query);
        when(query.executeUpdate())
            .thenReturn(expectedDeleteCount);

        // Act
        invoiceLineItemDao.deleteByInvoiceId(invoiceId);

        // Assert
        verify(entityManager).createQuery("DELETE FROM InvoiceLineItem i WHERE i.invoice.id = :invoiceId ");
        verify(query).setParameter("invoiceId", invoiceId);
        verify(query).executeUpdate();
    }

    @Test
    @DisplayName("Should use correct delete query")
    void deleteByInvoiceIdUsesCorrectQuery() {
        // Arrange
        Integer invoiceId = 1;

        when(entityManager.createQuery("DELETE FROM InvoiceLineItem i WHERE i.invoice.id = :invoiceId "))
            .thenReturn(query);
        when(query.setParameter("invoiceId", invoiceId))
            .thenReturn(query);
        when(query.executeUpdate())
            .thenReturn(0);

        // Act
        invoiceLineItemDao.deleteByInvoiceId(invoiceId);

        // Assert
        verify(entityManager).createQuery("DELETE FROM InvoiceLineItem i WHERE i.invoice.id = :invoiceId ");
    }

    @Test
    @DisplayName("Should set correct invoice ID parameter for delete")
    void deleteByInvoiceIdSetsCorrectParameter() {
        // Arrange
        Integer invoiceId = 42;

        when(entityManager.createQuery("DELETE FROM InvoiceLineItem i WHERE i.invoice.id = :invoiceId "))
            .thenReturn(query);
        when(query.setParameter("invoiceId", invoiceId))
            .thenReturn(query);
        when(query.executeUpdate())
            .thenReturn(0);

        // Act
        invoiceLineItemDao.deleteByInvoiceId(invoiceId);

        // Assert
        verify(query).setParameter("invoiceId", 42);
    }

    @Test
    @DisplayName("Should handle delete when no items exist for invoice")
    void deleteByInvoiceIdHandlesNoItems() {
        // Arrange
        Integer invoiceId = 1;

        when(entityManager.createQuery("DELETE FROM InvoiceLineItem i WHERE i.invoice.id = :invoiceId "))
            .thenReturn(query);
        when(query.setParameter("invoiceId", invoiceId))
            .thenReturn(query);
        when(query.executeUpdate())
            .thenReturn(0);

        // Act
        invoiceLineItemDao.deleteByInvoiceId(invoiceId);

        // Assert
        verify(query).executeUpdate();
    }

    @Test
    @DisplayName("Should handle null invoice ID for delete")
    void deleteByInvoiceIdHandlesNullInvoiceId() {
        // Arrange
        Integer invoiceId = null;

        when(entityManager.createQuery("DELETE FROM InvoiceLineItem i WHERE i.invoice.id = :invoiceId "))
            .thenReturn(query);
        when(query.setParameter("invoiceId", invoiceId))
            .thenReturn(query);
        when(query.executeUpdate())
            .thenReturn(0);

        // Act
        invoiceLineItemDao.deleteByInvoiceId(invoiceId);

        // Assert
        verify(query).setParameter("invoiceId", null);
    }

    @Test
    @DisplayName("Should return total invoice count by product ID when invoices exist")
    void getTotalInvoiceCountByProductIdReturnsCountWhenInvoicesExist() {
        // Arrange
        Integer productId = 1;
        Long expectedCount = 10L;
        List<Object> countList = Collections.singletonList(expectedCount);

        when(entityManager.createQuery(
            "SELECT COUNT(i) FROM InvoiceLineItem i WHERE i.product.productID =:productId AND i.invoice.deleteFlag=false"))
            .thenReturn(query);
        when(query.setParameter("productId", productId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(countList);

        // Act
        Integer result = invoiceLineItemDao.getTotalInvoiceCountByProductId(productId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(10);
    }

    @Test
    @DisplayName("Should return null when count list is empty")
    void getTotalInvoiceCountByProductIdReturnsNullWhenCountListEmpty() {
        // Arrange
        Integer productId = 1;

        when(entityManager.createQuery(
            "SELECT COUNT(i) FROM InvoiceLineItem i WHERE i.product.productID =:productId AND i.invoice.deleteFlag=false"))
            .thenReturn(query);
        when(query.setParameter("productId", productId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        Integer result = invoiceLineItemDao.getTotalInvoiceCountByProductId(productId);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return null when count list is null")
    void getTotalInvoiceCountByProductIdReturnsNullWhenCountListNull() {
        // Arrange
        Integer productId = 1;

        when(entityManager.createQuery(
            "SELECT COUNT(i) FROM InvoiceLineItem i WHERE i.product.productID =:productId AND i.invoice.deleteFlag=false"))
            .thenReturn(query);
        when(query.setParameter("productId", productId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(null);

        // Act
        Integer result = invoiceLineItemDao.getTotalInvoiceCountByProductId(productId);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should convert Long count to Integer correctly")
    void getTotalInvoiceCountByProductIdConvertsLongToInteger() {
        // Arrange
        Integer productId = 1;
        Long expectedCount = 999L;
        List<Object> countList = Collections.singletonList(expectedCount);

        when(entityManager.createQuery(
            "SELECT COUNT(i) FROM InvoiceLineItem i WHERE i.product.productID =:productId AND i.invoice.deleteFlag=false"))
            .thenReturn(query);
        when(query.setParameter("productId", productId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(countList);

        // Act
        Integer result = invoiceLineItemDao.getTotalInvoiceCountByProductId(productId);

        // Assert
        assertThat(result).isEqualTo(999);
    }

    @Test
    @DisplayName("Should set correct product ID parameter for count query")
    void getTotalInvoiceCountByProductIdSetsCorrectParameter() {
        // Arrange
        Integer productId = 123;
        List<Object> countList = Collections.singletonList(5L);

        when(entityManager.createQuery(
            "SELECT COUNT(i) FROM InvoiceLineItem i WHERE i.product.productID =:productId AND i.invoice.deleteFlag=false"))
            .thenReturn(query);
        when(query.setParameter("productId", productId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(countList);

        // Act
        invoiceLineItemDao.getTotalInvoiceCountByProductId(productId);

        // Assert
        verify(query).setParameter("productId", 123);
    }

    @Test
    @DisplayName("Should exclude deleted invoices from count")
    void getTotalInvoiceCountByProductIdExcludesDeletedInvoices() {
        // Arrange
        Integer productId = 1;
        List<Object> countList = Collections.singletonList(5L);

        when(entityManager.createQuery(
            "SELECT COUNT(i) FROM InvoiceLineItem i WHERE i.product.productID =:productId AND i.invoice.deleteFlag=false"))
            .thenReturn(query);
        when(query.setParameter("productId", productId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(countList);

        // Act
        invoiceLineItemDao.getTotalInvoiceCountByProductId(productId);

        // Assert
        verify(entityManager).createQuery(
            "SELECT COUNT(i) FROM InvoiceLineItem i WHERE i.product.productID =:productId AND i.invoice.deleteFlag=false");
    }

    @Test
    @DisplayName("Should return zero when count is zero")
    void getTotalInvoiceCountByProductIdReturnsZeroWhenCountIsZero() {
        // Arrange
        Integer productId = 1;
        List<Object> countList = Collections.singletonList(0L);

        when(entityManager.createQuery(
            "SELECT COUNT(i) FROM InvoiceLineItem i WHERE i.product.productID =:productId AND i.invoice.deleteFlag=false"))
            .thenReturn(query);
        when(query.setParameter("productId", productId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(countList);

        // Act
        Integer result = invoiceLineItemDao.getTotalInvoiceCountByProductId(productId);

        // Assert
        assertThat(result).isEqualTo(0);
    }

    @Test
    @DisplayName("Should return invoice line item by invoice ID when item exists")
    void getInvoiceLineItemByInvoiceIdReturnsItemWhenExists() {
        // Arrange
        Integer invoiceId = 1;
        InvoiceLineItem expectedItem = createInvoiceLineItem(1);

        when(entityManager.createQuery(
            "SELECT i FROM InvoiceLineItem  i WHERE i.invoice.id=:invoiceId AND i.deleteFlag=false",
            InvoiceLineItem.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("invoiceId", invoiceId))
            .thenReturn(typedQuery);
        when(typedQuery.getSingleResult())
            .thenReturn(expectedItem);

        // Act
        InvoiceLineItem result = invoiceLineItemDao.getInvoiceLneItemByInvoiceId(invoiceId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(expectedItem);
    }

    @Test
    @DisplayName("Should set correct invoice ID parameter for get item query")
    void getInvoiceLineItemByInvoiceIdSetsCorrectParameter() {
        // Arrange
        Integer invoiceId = 42;
        InvoiceLineItem expectedItem = createInvoiceLineItem(1);

        when(entityManager.createQuery(
            "SELECT i FROM InvoiceLineItem  i WHERE i.invoice.id=:invoiceId AND i.deleteFlag=false",
            InvoiceLineItem.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("invoiceId", invoiceId))
            .thenReturn(typedQuery);
        when(typedQuery.getSingleResult())
            .thenReturn(expectedItem);

        // Act
        invoiceLineItemDao.getInvoiceLneItemByInvoiceId(invoiceId);

        // Assert
        verify(typedQuery).setParameter("invoiceId", 42);
    }

    @Test
    @DisplayName("Should exclude deleted line items from result")
    void getInvoiceLineItemByInvoiceIdExcludesDeletedItems() {
        // Arrange
        Integer invoiceId = 1;
        InvoiceLineItem expectedItem = createInvoiceLineItem(1);

        when(entityManager.createQuery(
            "SELECT i FROM InvoiceLineItem  i WHERE i.invoice.id=:invoiceId AND i.deleteFlag=false",
            InvoiceLineItem.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("invoiceId", invoiceId))
            .thenReturn(typedQuery);
        when(typedQuery.getSingleResult())
            .thenReturn(expectedItem);

        // Act
        invoiceLineItemDao.getInvoiceLneItemByInvoiceId(invoiceId);

        // Assert
        verify(entityManager).createQuery(
            "SELECT i FROM InvoiceLineItem  i WHERE i.invoice.id=:invoiceId AND i.deleteFlag=false",
            InvoiceLineItem.class);
    }

    @Test
    @DisplayName("Should throw exception when no result found for invoice ID")
    void getInvoiceLineItemByInvoiceIdThrowsExceptionWhenNoResult() {
        // Arrange
        Integer invoiceId = 1;

        when(entityManager.createQuery(
            "SELECT i FROM InvoiceLineItem  i WHERE i.invoice.id=:invoiceId AND i.deleteFlag=false",
            InvoiceLineItem.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("invoiceId", invoiceId))
            .thenReturn(typedQuery);
        when(typedQuery.getSingleResult())
            .thenThrow(new NoResultException());

        // Act & Assert
        assertThatThrownBy(() -> invoiceLineItemDao.getInvoiceLneItemByInvoiceId(invoiceId))
            .isInstanceOf(NoResultException.class);
    }

    @Test
    @DisplayName("Should handle null invoice ID for get item query")
    void getInvoiceLineItemByInvoiceIdHandlesNullInvoiceId() {
        // Arrange
        Integer invoiceId = null;
        InvoiceLineItem expectedItem = createInvoiceLineItem(1);

        when(entityManager.createQuery(
            "SELECT i FROM InvoiceLineItem  i WHERE i.invoice.id=:invoiceId AND i.deleteFlag=false",
            InvoiceLineItem.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("invoiceId", invoiceId))
            .thenReturn(typedQuery);
        when(typedQuery.getSingleResult())
            .thenReturn(expectedItem);

        // Act
        invoiceLineItemDao.getInvoiceLneItemByInvoiceId(invoiceId);

        // Assert
        verify(typedQuery).setParameter("invoiceId", null);
    }

    @Test
    @DisplayName("Should create typed query for get item method")
    void getInvoiceLineItemByInvoiceIdCreatesTypedQuery() {
        // Arrange
        Integer invoiceId = 1;
        InvoiceLineItem expectedItem = createInvoiceLineItem(1);

        when(entityManager.createQuery(
            "SELECT i FROM InvoiceLineItem  i WHERE i.invoice.id=:invoiceId AND i.deleteFlag=false",
            InvoiceLineItem.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("invoiceId", invoiceId))
            .thenReturn(typedQuery);
        when(typedQuery.getSingleResult())
            .thenReturn(expectedItem);

        // Act
        invoiceLineItemDao.getInvoiceLneItemByInvoiceId(invoiceId);

        // Assert
        verify(entityManager).createQuery(anyString(), eq(InvoiceLineItem.class));
    }

    @Test
    @DisplayName("Should call getSingleResult for get item query")
    void getInvoiceLineItemByInvoiceIdCallsGetSingleResult() {
        // Arrange
        Integer invoiceId = 1;
        InvoiceLineItem expectedItem = createInvoiceLineItem(1);

        when(entityManager.createQuery(
            "SELECT i FROM InvoiceLineItem  i WHERE i.invoice.id=:invoiceId AND i.deleteFlag=false",
            InvoiceLineItem.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("invoiceId", invoiceId))
            .thenReturn(typedQuery);
        when(typedQuery.getSingleResult())
            .thenReturn(expectedItem);

        // Act
        invoiceLineItemDao.getInvoiceLneItemByInvoiceId(invoiceId);

        // Assert
        verify(typedQuery).getSingleResult();
    }

    @Test
    @DisplayName("Should handle different product IDs for count query")
    void getTotalInvoiceCountByProductIdHandlesDifferentProductIds() {
        // Arrange
        Integer productId1 = 1;
        Integer productId2 = 2;
        List<Object> countList1 = Collections.singletonList(5L);
        List<Object> countList2 = Collections.singletonList(10L);

        when(entityManager.createQuery(
            "SELECT COUNT(i) FROM InvoiceLineItem i WHERE i.product.productID =:productId AND i.invoice.deleteFlag=false"))
            .thenReturn(query);
        when(query.setParameter("productId", productId1))
            .thenReturn(query);
        when(query.setParameter("productId", productId2))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(countList1)
            .thenReturn(countList2);

        // Act
        Integer result1 = invoiceLineItemDao.getTotalInvoiceCountByProductId(productId1);
        Integer result2 = invoiceLineItemDao.getTotalInvoiceCountByProductId(productId2);

        // Assert
        assertThat(result1).isEqualTo(5);
        assertThat(result2).isEqualTo(10);
    }

    @Test
    @DisplayName("Should execute update exactly once for delete")
    void deleteByInvoiceIdExecutesUpdateOnce() {
        // Arrange
        Integer invoiceId = 1;

        when(entityManager.createQuery("DELETE FROM InvoiceLineItem i WHERE i.invoice.id = :invoiceId "))
            .thenReturn(query);
        when(query.setParameter("invoiceId", invoiceId))
            .thenReturn(query);
        when(query.executeUpdate())
            .thenReturn(0);

        // Act
        invoiceLineItemDao.deleteByInvoiceId(invoiceId);

        // Assert
        verify(query, times(1)).executeUpdate();
    }

    @Test
    @DisplayName("Should call getResultList exactly once for count query")
    void getTotalInvoiceCountByProductIdCallsGetResultListOnce() {
        // Arrange
        Integer productId = 1;
        List<Object> countList = Collections.singletonList(5L);

        when(entityManager.createQuery(
            "SELECT COUNT(i) FROM InvoiceLineItem i WHERE i.product.productID =:productId AND i.invoice.deleteFlag=false"))
            .thenReturn(query);
        when(query.setParameter("productId", productId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(countList);

        // Act
        invoiceLineItemDao.getTotalInvoiceCountByProductId(productId);

        // Assert
        verify(query, times(1)).getResultList();
    }

    @Test
    @DisplayName("Should call getSingleResult exactly once for get item query")
    void getInvoiceLineItemByInvoiceIdCallsGetSingleResultOnce() {
        // Arrange
        Integer invoiceId = 1;
        InvoiceLineItem expectedItem = createInvoiceLineItem(1);

        when(entityManager.createQuery(
            "SELECT i FROM InvoiceLineItem  i WHERE i.invoice.id=:invoiceId AND i.deleteFlag=false",
            InvoiceLineItem.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("invoiceId", invoiceId))
            .thenReturn(typedQuery);
        when(typedQuery.getSingleResult())
            .thenReturn(expectedItem);

        // Act
        invoiceLineItemDao.getInvoiceLneItemByInvoiceId(invoiceId);

        // Assert
        verify(typedQuery, times(1)).getSingleResult();
    }

    private InvoiceLineItem createInvoiceLineItem(int id) {
        InvoiceLineItem item = new InvoiceLineItem();
        item.setInvoiceLineItemID(id);
        return item;
    }
}
