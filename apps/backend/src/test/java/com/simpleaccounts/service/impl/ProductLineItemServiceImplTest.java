package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.ProductLineItemDao;
import com.simpleaccounts.entity.ProductLineItem;
import com.simpleaccounts.exceptions.ServiceException;
import java.math.BigDecimal;
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
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProductLineItemServiceImplTest {

    @Mock
    private ProductLineItemDao productLineItemDao;

    @InjectMocks
    private ProductLineItemServiceImpl productLineItemService;

    private ProductLineItem testProductLineItem;

    @BeforeEach
    void setUp() {
        testProductLineItem = new ProductLineItem();
        testProductLineItem.setId(1);
        testProductLineItem.setProductId(101);
        testProductLineItem.setQuantity(BigDecimal.valueOf(10));
        testProductLineItem.setUnitPrice(BigDecimal.valueOf(99.99));
        testProductLineItem.setTotalAmount(BigDecimal.valueOf(999.90));
        testProductLineItem.setDescription("Product line item description");
        testProductLineItem.setCreatedBy(1);
        testProductLineItem.setCreatedDate(LocalDateTime.now());
        testProductLineItem.setDeleteFlag(false);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnProductLineItemDaoWhenGetDaoCalled() {
        assertThat(productLineItemService.getDao()).isEqualTo(productLineItemDao);
    }

    @Test
    void shouldReturnNonNullDao() {
        assertThat(productLineItemService.getDao()).isNotNull();
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldFindProductLineItemByPrimaryKey() {
        when(productLineItemDao.findByPK(1)).thenReturn(testProductLineItem);

        ProductLineItem result = productLineItemService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testProductLineItem);
        assertThat(result.getId()).isEqualTo(1);
        assertThat(result.getProductId()).isEqualTo(101);
        assertThat(result.getQuantity()).isEqualTo(BigDecimal.valueOf(10));
        verify(productLineItemDao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenProductLineItemNotFoundByPK() {
        when(productLineItemDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> productLineItemService.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(productLineItemDao, times(1)).findByPK(999);
    }

    @Test
    void shouldFindProductLineItemWithNullPK() {
        when(productLineItemDao.findByPK(null)).thenReturn(null);

        assertThatThrownBy(() -> productLineItemService.findByPK(null))
                .isInstanceOf(ServiceException.class);

        verify(productLineItemDao, times(1)).findByPK(null);
    }

    @Test
    void shouldFindProductLineItemWithZeroPK() {
        when(productLineItemDao.findByPK(0)).thenReturn(null);

        assertThatThrownBy(() -> productLineItemService.findByPK(0))
                .isInstanceOf(ServiceException.class);

        verify(productLineItemDao, times(1)).findByPK(0);
    }

    @Test
    void shouldFindMultipleProductLineItemsByDifferentPKs() {
        ProductLineItem item2 = new ProductLineItem();
        item2.setId(2);

        when(productLineItemDao.findByPK(1)).thenReturn(testProductLineItem);
        when(productLineItemDao.findByPK(2)).thenReturn(item2);

        ProductLineItem result1 = productLineItemService.findByPK(1);
        ProductLineItem result2 = productLineItemService.findByPK(2);

        assertThat(result1.getId()).isEqualTo(1);
        assertThat(result2.getId()).isEqualTo(2);
        verify(productLineItemDao, times(1)).findByPK(1);
        verify(productLineItemDao, times(1)).findByPK(2);
    }

    // ========== persist Tests ==========

    @Test
    void shouldPersistNewProductLineItem() {
        productLineItemService.persist(testProductLineItem);

        verify(productLineItemDao, times(1)).persist(testProductLineItem);
    }

    @Test
    void shouldPersistProductLineItemWithMinimalData() {
        ProductLineItem minimalItem = new ProductLineItem();
        minimalItem.setProductId(200);

        productLineItemService.persist(minimalItem);

        verify(productLineItemDao, times(1)).persist(minimalItem);
    }

    @Test
    void shouldPersistProductLineItemWithAllFields() {
        testProductLineItem.setDiscount(BigDecimal.valueOf(10.00));
        testProductLineItem.setTaxAmount(BigDecimal.valueOf(89.99));
        testProductLineItem.setNetAmount(BigDecimal.valueOf(1079.89));

        productLineItemService.persist(testProductLineItem);

        verify(productLineItemDao, times(1)).persist(testProductLineItem);
    }

    @Test
    void shouldPersistMultipleProductLineItems() {
        ProductLineItem item2 = new ProductLineItem();
        item2.setId(2);

        productLineItemService.persist(testProductLineItem);
        productLineItemService.persist(item2);

        verify(productLineItemDao, times(1)).persist(testProductLineItem);
        verify(productLineItemDao, times(1)).persist(item2);
    }

    // ========== update Tests ==========

    @Test
    void shouldUpdateExistingProductLineItem() {
        when(productLineItemDao.update(testProductLineItem)).thenReturn(testProductLineItem);

        ProductLineItem result = productLineItemService.update(testProductLineItem);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testProductLineItem);
        verify(productLineItemDao, times(1)).update(testProductLineItem);
    }

    @Test
    void shouldUpdateProductLineItemAndReturnUpdatedEntity() {
        testProductLineItem.setQuantity(BigDecimal.valueOf(20));
        testProductLineItem.setTotalAmount(BigDecimal.valueOf(1999.80));
        when(productLineItemDao.update(testProductLineItem)).thenReturn(testProductLineItem);

        ProductLineItem result = productLineItemService.update(testProductLineItem);

        assertThat(result).isNotNull();
        assertThat(result.getQuantity()).isEqualTo(BigDecimal.valueOf(20));
        assertThat(result.getTotalAmount()).isEqualTo(BigDecimal.valueOf(1999.80));
        verify(productLineItemDao, times(1)).update(testProductLineItem);
    }

    @Test
    void shouldUpdateProductLineItemWithNullFields() {
        testProductLineItem.setDescription(null);
        testProductLineItem.setDiscount(null);
        when(productLineItemDao.update(testProductLineItem)).thenReturn(testProductLineItem);

        ProductLineItem result = productLineItemService.update(testProductLineItem);

        assertThat(result).isNotNull();
        assertThat(result.getDescription()).isNull();
        assertThat(result.getDiscount()).isNull();
        verify(productLineItemDao, times(1)).update(testProductLineItem);
    }

    @Test
    void shouldHandleSequentialUpdates() {
        when(productLineItemDao.update(any(ProductLineItem.class))).thenReturn(testProductLineItem);

        productLineItemService.update(testProductLineItem);
        testProductLineItem.setQuantity(BigDecimal.valueOf(15));
        productLineItemService.update(testProductLineItem);
        testProductLineItem.setQuantity(BigDecimal.valueOf(25));
        productLineItemService.update(testProductLineItem);

        verify(productLineItemDao, times(3)).update(testProductLineItem);
    }

    // ========== delete Tests ==========

    @Test
    void shouldDeleteProductLineItem() {
        productLineItemService.delete(testProductLineItem);

        verify(productLineItemDao, times(1)).delete(testProductLineItem);
    }

    @Test
    void shouldDeleteMultipleProductLineItems() {
        ProductLineItem item2 = new ProductLineItem();
        item2.setId(2);

        productLineItemService.delete(testProductLineItem);
        productLineItemService.delete(item2);

        verify(productLineItemDao, times(1)).delete(testProductLineItem);
        verify(productLineItemDao, times(1)).delete(item2);
    }

    @Test
    void shouldDeleteProductLineItemWithMinimalData() {
        ProductLineItem minimalItem = new ProductLineItem();
        minimalItem.setId(99);

        productLineItemService.delete(minimalItem);

        verify(productLineItemDao, times(1)).delete(minimalItem);
    }

    // ========== findByAttributes Tests ==========

    @Test
    void shouldFindProductLineItemsByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("productId", 101);
        attributes.put("deleteFlag", false);

        List<ProductLineItem> expectedList = Arrays.asList(testProductLineItem);
        when(productLineItemDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<ProductLineItem> result = productLineItemService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testProductLineItem);
        verify(productLineItemDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("productId", 999);

        when(productLineItemDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<ProductLineItem> result = productLineItemService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(productLineItemDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<ProductLineItem> result = productLineItemService.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(productLineItemDao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<ProductLineItem> result = productLineItemService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(productLineItemDao, never()).findByAttributes(any());
    }

    @Test
    void shouldFindMultipleProductLineItemsByAttributes() {
        ProductLineItem item2 = new ProductLineItem();
        item2.setId(2);
        item2.setProductId(101);

        ProductLineItem item3 = new ProductLineItem();
        item3.setId(3);
        item3.setProductId(101);

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("productId", 101);

        List<ProductLineItem> expectedList = Arrays.asList(testProductLineItem, item2, item3);
        when(productLineItemDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<ProductLineItem> result = productLineItemService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(testProductLineItem, item2, item3);
        verify(productLineItemDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldFindByComplexAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("productId", 101);
        attributes.put("createdBy", 1);
        attributes.put("deleteFlag", false);

        List<ProductLineItem> expectedList = Arrays.asList(testProductLineItem);
        when(productLineItemDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<ProductLineItem> result = productLineItemService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(productLineItemDao, times(1)).findByAttributes(attributes);
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleProductLineItemWithMinimalData() {
        ProductLineItem minimalItem = new ProductLineItem();
        minimalItem.setId(99);

        when(productLineItemDao.findByPK(99)).thenReturn(minimalItem);

        ProductLineItem result = productLineItemService.findByPK(99);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(99);
        assertThat(result.getDescription()).isNull();
        verify(productLineItemDao, times(1)).findByPK(99);
    }

    @Test
    void shouldHandleProductLineItemWithZeroQuantity() {
        testProductLineItem.setQuantity(BigDecimal.ZERO);
        when(productLineItemDao.update(testProductLineItem)).thenReturn(testProductLineItem);

        ProductLineItem result = productLineItemService.update(testProductLineItem);

        assertThat(result).isNotNull();
        assertThat(result.getQuantity()).isEqualTo(BigDecimal.ZERO);
        verify(productLineItemDao, times(1)).update(testProductLineItem);
    }

    @Test
    void shouldHandleProductLineItemWithNegativeQuantity() {
        testProductLineItem.setQuantity(BigDecimal.valueOf(-5));
        when(productLineItemDao.update(testProductLineItem)).thenReturn(testProductLineItem);

        ProductLineItem result = productLineItemService.update(testProductLineItem);

        assertThat(result).isNotNull();
        assertThat(result.getQuantity()).isEqualTo(BigDecimal.valueOf(-5));
        verify(productLineItemDao, times(1)).update(testProductLineItem);
    }

    @Test
    void shouldHandleProductLineItemWithLargeQuantity() {
        BigDecimal largeQuantity = BigDecimal.valueOf(999999.99);
        testProductLineItem.setQuantity(largeQuantity);
        when(productLineItemDao.update(testProductLineItem)).thenReturn(testProductLineItem);

        ProductLineItem result = productLineItemService.update(testProductLineItem);

        assertThat(result).isNotNull();
        assertThat(result.getQuantity()).isEqualTo(largeQuantity);
        verify(productLineItemDao, times(1)).update(testProductLineItem);
    }

    @Test
    void shouldHandleProductLineItemWithZeroPrice() {
        testProductLineItem.setUnitPrice(BigDecimal.ZERO);
        testProductLineItem.setTotalAmount(BigDecimal.ZERO);
        when(productLineItemDao.update(testProductLineItem)).thenReturn(testProductLineItem);

        ProductLineItem result = productLineItemService.update(testProductLineItem);

        assertThat(result).isNotNull();
        assertThat(result.getUnitPrice()).isEqualTo(BigDecimal.ZERO);
        assertThat(result.getTotalAmount()).isEqualTo(BigDecimal.ZERO);
        verify(productLineItemDao, times(1)).update(testProductLineItem);
    }

    @Test
    void shouldHandleProductLineItemWithHighPrecisionDecimals() {
        testProductLineItem.setUnitPrice(BigDecimal.valueOf(99.999));
        testProductLineItem.setQuantity(BigDecimal.valueOf(10.555));
        when(productLineItemDao.update(testProductLineItem)).thenReturn(testProductLineItem);

        ProductLineItem result = productLineItemService.update(testProductLineItem);

        assertThat(result).isNotNull();
        assertThat(result.getUnitPrice()).isEqualTo(BigDecimal.valueOf(99.999));
        assertThat(result.getQuantity()).isEqualTo(BigDecimal.valueOf(10.555));
        verify(productLineItemDao, times(1)).update(testProductLineItem);
    }

    @Test
    void shouldPersistAndFindProductLineItem() {
        when(productLineItemDao.findByPK(1)).thenReturn(testProductLineItem);

        productLineItemService.persist(testProductLineItem);
        ProductLineItem found = productLineItemService.findByPK(1);

        assertThat(found).isNotNull();
        assertThat(found).isEqualTo(testProductLineItem);
        verify(productLineItemDao, times(1)).persist(testProductLineItem);
        verify(productLineItemDao, times(1)).findByPK(1);
    }

    @Test
    void shouldVerifyDaoInteractionForFindByPK() {
        when(productLineItemDao.findByPK(1)).thenReturn(testProductLineItem);

        productLineItemService.findByPK(1);
        productLineItemService.findByPK(1);
        productLineItemService.findByPK(1);

        verify(productLineItemDao, times(3)).findByPK(1);
    }

    @Test
    void shouldHandleProductLineItemWithLongDescription() {
        String longDescription = "A".repeat(1000);
        testProductLineItem.setDescription(longDescription);

        when(productLineItemDao.update(testProductLineItem)).thenReturn(testProductLineItem);

        ProductLineItem result = productLineItemService.update(testProductLineItem);

        assertThat(result).isNotNull();
        assertThat(result.getDescription()).hasSize(1000);
        verify(productLineItemDao, times(1)).update(testProductLineItem);
    }

    @Test
    void shouldHandleProductLineItemWithMaxIntegerProductId() {
        testProductLineItem.setProductId(Integer.MAX_VALUE);
        when(productLineItemDao.update(testProductLineItem)).thenReturn(testProductLineItem);

        ProductLineItem result = productLineItemService.update(testProductLineItem);

        assertThat(result).isNotNull();
        assertThat(result.getProductId()).isEqualTo(Integer.MAX_VALUE);
        verify(productLineItemDao, times(1)).update(testProductLineItem);
    }

    @Test
    void shouldHandleUpdateWithAllFieldsNull() {
        ProductLineItem itemWithNulls = new ProductLineItem();
        itemWithNulls.setId(5);
        when(productLineItemDao.update(itemWithNulls)).thenReturn(itemWithNulls);

        ProductLineItem result = productLineItemService.update(itemWithNulls);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(5);
        verify(productLineItemDao, times(1)).update(itemWithNulls);
    }

    @Test
    void shouldFindByAttributesWithSingleAttribute() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("id", 1);

        List<ProductLineItem> expectedList = Arrays.asList(testProductLineItem);
        when(productLineItemDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<ProductLineItem> result = productLineItemService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(productLineItemDao, times(1)).findByAttributes(attributes);
    }
}
