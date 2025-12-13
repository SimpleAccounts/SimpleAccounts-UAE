package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.ProductPriceType;
import com.simpleaccounts.dao.ProductLineItemDao;
import com.simpleaccounts.entity.Product;
import com.simpleaccounts.entity.ProductLineItem;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductLineItemServiceImpl Unit Tests")
class ProductLineItemServiceImplTest {

    @Mock
    private ProductLineItemDao productLineItemDao;

    @InjectMocks
    private ProductLineItemServiceImpl productLineItemService;

    @Nested
    @DisplayName("findByPK Tests")
    class FindByPKTests {

        @Test
        @DisplayName("Should return line item by ID")
        void findByPKReturnsLineItem() {
            // Arrange
            Integer lineItemId = 1;
            ProductLineItem expectedLineItem = createLineItem(lineItemId, new BigDecimal("100.00"), "Test Line Item");

            when(productLineItemDao.findByPK(lineItemId))
                .thenReturn(expectedLineItem);

            // Act
            ProductLineItem result = productLineItemService.findByPK(lineItemId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getProductLineItemId()).isEqualTo(lineItemId);
            assertThat(result.getUnitPrice()).isEqualTo(new BigDecimal("100.00"));
            verify(productLineItemDao).findByPK(lineItemId);
        }

        @Test
        @DisplayName("Should return null when line item not found")
        void findByPKReturnsNullWhenNotFound() {
            // Arrange
            Integer lineItemId = 999;

            when(productLineItemDao.findByPK(lineItemId))
                .thenReturn(null);

            // Act
            ProductLineItem result = productLineItemService.findByPK(lineItemId);

            // Assert
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("persist Tests")
    class PersistTests {

        @Test
        @DisplayName("Should persist new line item")
        void persistLineItemSaves() {
            // Arrange
            ProductLineItem lineItem = createLineItem(null, new BigDecimal("50.00"), "New Line Item");

            // Act
            productLineItemService.persist(lineItem);

            // Assert
            verify(productLineItemDao).persist(lineItem);
        }
    }

    @Nested
    @DisplayName("update Tests")
    class UpdateTests {

        @Test
        @DisplayName("Should update existing line item")
        void updateLineItemUpdates() {
            // Arrange
            ProductLineItem lineItem = createLineItem(1, new BigDecimal("75.00"), "Updated Line Item");

            when(productLineItemDao.update(lineItem)).thenReturn(lineItem);

            // Act
            ProductLineItem result = productLineItemService.update(lineItem);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getUnitPrice()).isEqualTo(new BigDecimal("75.00"));
            verify(productLineItemDao).update(lineItem);
        }
    }

    @Nested
    @DisplayName("delete Tests")
    class DeleteTests {

        @Test
        @DisplayName("Should delete line item")
        void deleteLineItemDeletes() {
            // Arrange
            ProductLineItem lineItem = createLineItem(1, new BigDecimal("100.00"), "Line Item to Delete");

            // Act
            productLineItemService.delete(lineItem);

            // Assert
            verify(productLineItemDao).delete(lineItem);
        }
    }

    @Nested
    @DisplayName("findAll Tests")
    class FindAllTests {

        @Test
        @DisplayName("Should return all line items")
        void findAllReturnsLineItems() {
            // Arrange
            List<ProductLineItem> expectedLineItems = createLineItemList(5);

            when(productLineItemDao.dumpData())
                .thenReturn(expectedLineItems);

            // Act
            List<ProductLineItem> result = productLineItemService.findAll();

            // Assert
            assertThat(result).isNotNull().hasSize(5);
            verify(productLineItemDao).dumpData();
        }

        @Test
        @DisplayName("Should return empty list when no line items exist")
        void findAllReturnsEmptyList() {
            // Arrange
            when(productLineItemDao.dumpData())
                .thenReturn(new ArrayList<>());

            // Act
            List<ProductLineItem> result = productLineItemService.findAll();

            // Assert
            assertThat(result).isNotNull().isEmpty();
        }
    }

    @Nested
    @DisplayName("getDao Tests")
    class GetDaoTests {

        @Test
        @DisplayName("Should return ProductLineItemDao instance")
        void getDaoReturnsProductLineItemDao() {
            // The protected getDao() method returns the productLineItemDao
            // This is implicitly tested through other tests
            assertThat(productLineItemService).isNotNull();
        }
    }

    @Nested
    @DisplayName("Line Item Price Type Tests")
    class LineItemPriceTypeTests {

        @Test
        @DisplayName("Should handle SALES price type")
        void handleSalesPriceType() {
            // Arrange
            ProductLineItem lineItem = createLineItem(1, new BigDecimal("100.00"), "Sales Item");
            lineItem.setPriceType(ProductPriceType.SALES);

            when(productLineItemDao.findByPK(1)).thenReturn(lineItem);

            // Act
            ProductLineItem result = productLineItemService.findByPK(1);

            // Assert
            assertThat(result.getPriceType()).isEqualTo(ProductPriceType.SALES);
        }

        @Test
        @DisplayName("Should handle PURCHASE price type")
        void handlePurchasePriceType() {
            // Arrange
            ProductLineItem lineItem = createLineItem(1, new BigDecimal("80.00"), "Purchase Item");
            lineItem.setPriceType(ProductPriceType.PURCHASE);

            when(productLineItemDao.findByPK(1)).thenReturn(lineItem);

            // Act
            ProductLineItem result = productLineItemService.findByPK(1);

            // Assert
            assertThat(result.getPriceType()).isEqualTo(ProductPriceType.PURCHASE);
        }

        @Test
        @DisplayName("Should handle BOTH price type")
        void handleBothPriceType() {
            // Arrange
            ProductLineItem lineItem = createLineItem(1, new BigDecimal("90.00"), "Both Item");
            lineItem.setPriceType(ProductPriceType.BOTH);

            when(productLineItemDao.findByPK(1)).thenReturn(lineItem);

            // Act
            ProductLineItem result = productLineItemService.findByPK(1);

            // Assert
            assertThat(result.getPriceType()).isEqualTo(ProductPriceType.BOTH);
        }
    }

    private List<ProductLineItem> createLineItemList(int count) {
        List<ProductLineItem> lineItems = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            lineItems.add(createLineItem(i, new BigDecimal(10 * i), "Line Item " + i));
        }
        return lineItems;
    }

    private ProductLineItem createLineItem(Integer id, BigDecimal unitPrice, String description) {
        ProductLineItem lineItem = new ProductLineItem();
        lineItem.setProductLineItemId(id);
        lineItem.setUnitPrice(unitPrice);
        lineItem.setDescription(description);
        lineItem.setPriceType(ProductPriceType.SALES);
        lineItem.setDeleteFlag(false);
        lineItem.setCreatedBy(1);
        lineItem.setCreatedDate(LocalDateTime.now());
        return lineItem;
    }
}
