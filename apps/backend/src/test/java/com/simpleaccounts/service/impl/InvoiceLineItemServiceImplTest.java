package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.InvoiceLineItemDao;
import com.simpleaccounts.entity.Invoice;
import com.simpleaccounts.entity.InvoiceLineItem;
import com.simpleaccounts.entity.Product;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class InvoiceLineItemServiceImplTest {

    @Mock
    private InvoiceLineItemDao invoiceLineItemDao;

    @InjectMocks
    private InvoiceLineItemServiceImpl invoiceLineItemService;

    private InvoiceLineItem testInvoiceLineItem;
    private Invoice testInvoice;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        testProduct = new Product();
        testProduct.setProductId(1);
        testProduct.setProductName("Test Product");
        testProduct.setProductPrice(BigDecimal.valueOf(100.00));

        testInvoice = new Invoice();
        testInvoice.setInvoiceId(1);
        testInvoice.setInvoiceNumber("INV-001");
        testInvoice.setCreatedDate(LocalDateTime.now());

        testInvoiceLineItem = new InvoiceLineItem();
        testInvoiceLineItem.setInvoiceLineItemId(1);
        testInvoiceLineItem.setInvoiceId(testInvoice);
        testInvoiceLineItem.setProductId(testProduct);
        testInvoiceLineItem.setQuantity(5);
        testInvoiceLineItem.setUnitPrice(BigDecimal.valueOf(100.00));
        testInvoiceLineItem.setAmount(BigDecimal.valueOf(500.00));
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnInvoiceLineItemDaoWhenGetDaoCalled() {
        assertThat(invoiceLineItemService.getDao()).isEqualTo(invoiceLineItemDao);
    }

    @Test
    void shouldReturnNonNullDao() {
        assertThat(invoiceLineItemService.getDao()).isNotNull();
    }

    // ========== deleteByInvoiceId Tests ==========

    @Test
    void shouldDeleteLineItemsWhenValidInvoiceIdProvided() {
        doNothing().when(invoiceLineItemDao).deleteByInvoiceId(1);

        invoiceLineItemService.deleteByInvoiceId(1);

        verify(invoiceLineItemDao, times(1)).deleteByInvoiceId(1);
    }

    @Test
    void shouldHandleDeleteWithZeroInvoiceId() {
        doNothing().when(invoiceLineItemDao).deleteByInvoiceId(0);

        invoiceLineItemService.deleteByInvoiceId(0);

        verify(invoiceLineItemDao, times(1)).deleteByInvoiceId(0);
    }

    @Test
    void shouldHandleDeleteWithNullInvoiceId() {
        doNothing().when(invoiceLineItemDao).deleteByInvoiceId(null);

        invoiceLineItemService.deleteByInvoiceId(null);

        verify(invoiceLineItemDao, times(1)).deleteByInvoiceId(null);
    }

    @Test
    void shouldHandleDeleteWithNegativeInvoiceId() {
        doNothing().when(invoiceLineItemDao).deleteByInvoiceId(-1);

        invoiceLineItemService.deleteByInvoiceId(-1);

        verify(invoiceLineItemDao, times(1)).deleteByInvoiceId(-1);
    }

    @Test
    void shouldHandleMultipleDeleteOperations() {
        doNothing().when(invoiceLineItemDao).deleteByInvoiceId(anyInt());

        invoiceLineItemService.deleteByInvoiceId(1);
        invoiceLineItemService.deleteByInvoiceId(2);
        invoiceLineItemService.deleteByInvoiceId(3);

        verify(invoiceLineItemDao, times(1)).deleteByInvoiceId(1);
        verify(invoiceLineItemDao, times(1)).deleteByInvoiceId(2);
        verify(invoiceLineItemDao, times(1)).deleteByInvoiceId(3);
    }

    @Test
    void shouldHandleDeleteWithLargeInvoiceId() {
        doNothing().when(invoiceLineItemDao).deleteByInvoiceId(999999);

        invoiceLineItemService.deleteByInvoiceId(999999);

        verify(invoiceLineItemDao, times(1)).deleteByInvoiceId(999999);
    }

    // ========== getTotalInvoiceCountByProductId Tests ==========

    @Test
    void shouldReturnCountWhenProductHasInvoices() {
        when(invoiceLineItemDao.getTotalInvoiceCountByProductId(1)).thenReturn(10);

        Integer result = invoiceLineItemService.getTotalInvoiceCountByProductId(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(10);
        verify(invoiceLineItemDao, times(1)).getTotalInvoiceCountByProductId(1);
    }

    @Test
    void shouldReturnZeroWhenProductHasNoInvoices() {
        when(invoiceLineItemDao.getTotalInvoiceCountByProductId(999)).thenReturn(0);

        Integer result = invoiceLineItemService.getTotalInvoiceCountByProductId(999);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(0);
        verify(invoiceLineItemDao, times(1)).getTotalInvoiceCountByProductId(999);
    }

    @Test
    void shouldReturnNullWhenProductIdIsNull() {
        when(invoiceLineItemDao.getTotalInvoiceCountByProductId(null)).thenReturn(null);

        Integer result = invoiceLineItemService.getTotalInvoiceCountByProductId(null);

        assertThat(result).isNull();
        verify(invoiceLineItemDao, times(1)).getTotalInvoiceCountByProductId(null);
    }

    @Test
    void shouldHandleZeroProductId() {
        when(invoiceLineItemDao.getTotalInvoiceCountByProductId(0)).thenReturn(0);

        Integer result = invoiceLineItemService.getTotalInvoiceCountByProductId(0);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(0);
        verify(invoiceLineItemDao, times(1)).getTotalInvoiceCountByProductId(0);
    }

    @Test
    void shouldHandleNegativeProductId() {
        when(invoiceLineItemDao.getTotalInvoiceCountByProductId(-1)).thenReturn(0);

        Integer result = invoiceLineItemService.getTotalInvoiceCountByProductId(-1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(0);
        verify(invoiceLineItemDao, times(1)).getTotalInvoiceCountByProductId(-1);
    }

    @Test
    void shouldReturnLargeCountWhenProductIsPopular() {
        when(invoiceLineItemDao.getTotalInvoiceCountByProductId(1)).thenReturn(1000);

        Integer result = invoiceLineItemService.getTotalInvoiceCountByProductId(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(1000);
        verify(invoiceLineItemDao, times(1)).getTotalInvoiceCountByProductId(1);
    }

    @Test
    void shouldHandleMultipleProductIdQueries() {
        when(invoiceLineItemDao.getTotalInvoiceCountByProductId(1)).thenReturn(10);
        when(invoiceLineItemDao.getTotalInvoiceCountByProductId(2)).thenReturn(20);
        when(invoiceLineItemDao.getTotalInvoiceCountByProductId(3)).thenReturn(30);

        Integer result1 = invoiceLineItemService.getTotalInvoiceCountByProductId(1);
        Integer result2 = invoiceLineItemService.getTotalInvoiceCountByProductId(2);
        Integer result3 = invoiceLineItemService.getTotalInvoiceCountByProductId(3);

        assertThat(result1).isEqualTo(10);
        assertThat(result2).isEqualTo(20);
        assertThat(result3).isEqualTo(30);
        verify(invoiceLineItemDao, times(1)).getTotalInvoiceCountByProductId(1);
        verify(invoiceLineItemDao, times(1)).getTotalInvoiceCountByProductId(2);
        verify(invoiceLineItemDao, times(1)).getTotalInvoiceCountByProductId(3);
    }

    // ========== getInvoiceLneItemByInvoiceId Tests ==========

    @Test
    void shouldReturnInvoiceLineItemWhenValidInvoiceIdProvided() {
        when(invoiceLineItemDao.getInvoiceLneItemByInvoiceId(1)).thenReturn(testInvoiceLineItem);

        InvoiceLineItem result = invoiceLineItemService.getInvoiceLneItemByInvoiceId(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testInvoiceLineItem);
        assertThat(result.getInvoiceLineItemId()).isEqualTo(1);
        assertThat(result.getInvoiceId().getInvoiceId()).isEqualTo(1);
        verify(invoiceLineItemDao, times(1)).getInvoiceLneItemByInvoiceId(1);
    }

    @Test
    void shouldReturnNullWhenInvoiceIdNotFound() {
        when(invoiceLineItemDao.getInvoiceLneItemByInvoiceId(999)).thenReturn(null);

        InvoiceLineItem result = invoiceLineItemService.getInvoiceLneItemByInvoiceId(999);

        assertThat(result).isNull();
        verify(invoiceLineItemDao, times(1)).getInvoiceLneItemByInvoiceId(999);
    }

    @Test
    void shouldHandleNullInvoiceIdInGetLineItem() {
        when(invoiceLineItemDao.getInvoiceLneItemByInvoiceId(null)).thenReturn(null);

        InvoiceLineItem result = invoiceLineItemService.getInvoiceLneItemByInvoiceId(null);

        assertThat(result).isNull();
        verify(invoiceLineItemDao, times(1)).getInvoiceLneItemByInvoiceId(null);
    }

    @Test
    void shouldHandleZeroInvoiceIdInGetLineItem() {
        when(invoiceLineItemDao.getInvoiceLneItemByInvoiceId(0)).thenReturn(null);

        InvoiceLineItem result = invoiceLineItemService.getInvoiceLneItemByInvoiceId(0);

        assertThat(result).isNull();
        verify(invoiceLineItemDao, times(1)).getInvoiceLneItemByInvoiceId(0);
    }

    @Test
    void shouldHandleNegativeInvoiceIdInGetLineItem() {
        when(invoiceLineItemDao.getInvoiceLneItemByInvoiceId(-1)).thenReturn(null);

        InvoiceLineItem result = invoiceLineItemService.getInvoiceLneItemByInvoiceId(-1);

        assertThat(result).isNull();
        verify(invoiceLineItemDao, times(1)).getInvoiceLneItemByInvoiceId(-1);
    }

    @Test
    void shouldReturnLineItemWithAllPropertiesPopulated() {
        testInvoiceLineItem.setDiscount(BigDecimal.valueOf(50.00));
        testInvoiceLineItem.setTaxAmount(BigDecimal.valueOf(25.00));

        when(invoiceLineItemDao.getInvoiceLneItemByInvoiceId(1)).thenReturn(testInvoiceLineItem);

        InvoiceLineItem result = invoiceLineItemService.getInvoiceLneItemByInvoiceId(1);

        assertThat(result).isNotNull();
        assertThat(result.getDiscount()).isEqualTo(BigDecimal.valueOf(50.00));
        assertThat(result.getTaxAmount()).isEqualTo(BigDecimal.valueOf(25.00));
        verify(invoiceLineItemDao, times(1)).getInvoiceLneItemByInvoiceId(1);
    }

    @Test
    void shouldHandleMultipleGetLineItemCalls() {
        when(invoiceLineItemDao.getInvoiceLneItemByInvoiceId(1)).thenReturn(testInvoiceLineItem);

        InvoiceLineItem result1 = invoiceLineItemService.getInvoiceLneItemByInvoiceId(1);
        InvoiceLineItem result2 = invoiceLineItemService.getInvoiceLneItemByInvoiceId(1);

        assertThat(result1).isEqualTo(testInvoiceLineItem);
        assertThat(result2).isEqualTo(testInvoiceLineItem);
        verify(invoiceLineItemDao, times(2)).getInvoiceLneItemByInvoiceId(1);
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldPersistNewInvoiceLineItem() {
        invoiceLineItemService.persist(testInvoiceLineItem);

        verify(invoiceLineItemDao, times(1)).persist(testInvoiceLineItem);
    }

    @Test
    void shouldUpdateExistingInvoiceLineItem() {
        when(invoiceLineItemDao.update(testInvoiceLineItem)).thenReturn(testInvoiceLineItem);

        InvoiceLineItem result = invoiceLineItemService.update(testInvoiceLineItem);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testInvoiceLineItem);
        verify(invoiceLineItemDao, times(1)).update(testInvoiceLineItem);
    }

    @Test
    void shouldDeleteInvoiceLineItem() {
        invoiceLineItemService.delete(testInvoiceLineItem);

        verify(invoiceLineItemDao, times(1)).delete(testInvoiceLineItem);
    }

    @Test
    void shouldFindInvoiceLineItemByPrimaryKey() {
        when(invoiceLineItemDao.findByPK(1)).thenReturn(testInvoiceLineItem);

        InvoiceLineItem result = invoiceLineItemService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testInvoiceLineItem);
        verify(invoiceLineItemDao, times(1)).findByPK(1);
    }

    @Test
    void shouldUpdateLineItemQuantity() {
        testInvoiceLineItem.setQuantity(10);
        testInvoiceLineItem.setAmount(BigDecimal.valueOf(1000.00));

        when(invoiceLineItemDao.update(testInvoiceLineItem)).thenReturn(testInvoiceLineItem);

        InvoiceLineItem result = invoiceLineItemService.update(testInvoiceLineItem);

        assertThat(result).isNotNull();
        assertThat(result.getQuantity()).isEqualTo(10);
        assertThat(result.getAmount()).isEqualTo(BigDecimal.valueOf(1000.00));
        verify(invoiceLineItemDao, times(1)).update(testInvoiceLineItem);
    }

    @Test
    void shouldPersistLineItemWithMinimalData() {
        InvoiceLineItem minimalLineItem = new InvoiceLineItem();
        minimalLineItem.setInvoiceLineItemId(2);

        invoiceLineItemService.persist(minimalLineItem);

        verify(invoiceLineItemDao, times(1)).persist(minimalLineItem);
    }

    @Test
    void shouldHandleNullLineItemInUpdate() {
        when(invoiceLineItemDao.update(null)).thenReturn(null);

        InvoiceLineItem result = invoiceLineItemService.update(null);

        assertThat(result).isNull();
        verify(invoiceLineItemDao, times(1)).update(null);
    }

    @Test
    void shouldFindByAttributesWithProductId() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("productId", testProduct);

        invoiceLineItemService.findByAttributes(attributes);

        verify(invoiceLineItemDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldFindByAttributesWithInvoiceId() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("invoiceId", testInvoice);

        invoiceLineItemService.findByAttributes(attributes);

        verify(invoiceLineItemDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        invoiceLineItemService.findByAttributes(attributes);

        verify(invoiceLineItemDao, times(1)).findByAttributes(attributes);
    }
}
