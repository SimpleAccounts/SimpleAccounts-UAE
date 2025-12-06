package com.simpleaccounts.dao.impl;

import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.dbfilter.ProductFilterEnum;
import com.simpleaccounts.entity.Product;
import com.simpleaccounts.entity.ProductLineItem;
import com.simpleaccounts.entity.VatCategory;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private DatatableSortingFilterConstant dataTableUtil;

    @Mock
    private Query query;

    @InjectMocks
    private ProductDaoImpl productDao;

    private Product testProduct;
    private ProductLineItem testLineItem1;
    private ProductLineItem testLineItem2;
    private VatCategory testVatCategory;

    @BeforeEach
    void setUp() {
        testVatCategory = new VatCategory();
        testVatCategory.setId(1);
        testVatCategory.setDescription("Standard VAT");

        testProduct = new Product();
        testProduct.setId(1);
        testProduct.setProductCode("PROD-001");
        testProduct.setProductName("Test Product");
        testProduct.setDeleteFlag(false);
        testProduct.setVatCategory(testVatCategory);

        testLineItem1 = new ProductLineItem();
        testLineItem1.setId(1);
        testLineItem1.setProductName("Line Item 1");
        testLineItem1.setDeleteFlag(false);

        testLineItem2 = new ProductLineItem();
        testLineItem2.setId(2);
        testLineItem2.setProductName("Line Item 2");
        testLineItem2.setDeleteFlag(false);

        List<ProductLineItem> lineItems = new ArrayList<>();
        lineItems.add(testLineItem1);
        lineItems.add(testLineItem2);
        testProduct.setLineItemList(lineItems);
    }

    @Test
    void testGetProductList_Success() {
        // Arrange
        Map<ProductFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(ProductFilterEnum.PRODUCT_ID, 1);

        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("productName");
        paginationModel.setPageNo(0);
        paginationModel.setPageSize(10);

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.PRODUCT)))
                .thenReturn("p.productName");

        // Act
        PaginationResponseModel result = productDao.getProductList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        verify(dataTableUtil).getColName("productName", DatatableSortingFilterConstant.PRODUCT);
    }

    @Test
    void testGetProductList_EmptyFilterMap() {
        // Arrange
        Map<ProductFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("id");

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.PRODUCT)))
                .thenReturn("p.id");

        // Act
        PaginationResponseModel result = productDao.getProductList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        verify(dataTableUtil).getColName("id", DatatableSortingFilterConstant.PRODUCT);
    }

    @Test
    void testGetProductList_NullPaginationModel() {
        // Arrange
        Map<ProductFilterEnum, Object> filterMap = new HashMap<>();

        // Act
        PaginationResponseModel result = productDao.getProductList(filterMap, null);

        // Assert
        assertThat(result).isNotNull();
        verify(dataTableUtil, never()).getColName(anyString(), anyString());
    }

    @Test
    void testGetProductList_WithMultipleFilters() {
        // Arrange
        Map<ProductFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(ProductFilterEnum.PRODUCT_ID, 1);
        filterMap.put(ProductFilterEnum.USER_ID, 10);
        filterMap.put(ProductFilterEnum.PRODUCT_NAME, "Test");

        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("productCode");

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.PRODUCT)))
                .thenReturn("p.productCode");

        // Act
        PaginationResponseModel result = productDao.getProductList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    void testGetProductList_CountLessThanTen() {
        // Arrange
        Map<ProductFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("productName");
        paginationModel.setPageNo(1);

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.PRODUCT)))
                .thenReturn("p.productName");

        // Act
        PaginationResponseModel result = productDao.getProductList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    void testDeleteByIds_Success() {
        // Arrange
        List<Integer> ids = Arrays.asList(1);
        when(entityManager.find(Product.class, 1)).thenReturn(testProduct);

        // Act
        productDao.deleteByIds(ids);

        // Assert
        assertThat(testProduct.getDeleteFlag()).isTrue();
        assertThat(testLineItem1.getDeleteFlag()).isTrue();
        assertThat(testLineItem2.getDeleteFlag()).isTrue();
    }

    @Test
    void testDeleteByIds_MultipleProducts() {
        // Arrange
        Product product2 = new Product();
        product2.setId(2);
        product2.setProductCode("PROD-002");
        product2.setDeleteFlag(false);
        product2.setLineItemList(new ArrayList<>());

        List<Integer> ids = Arrays.asList(1, 2);
        when(entityManager.find(Product.class, 1)).thenReturn(testProduct);
        when(entityManager.find(Product.class, 2)).thenReturn(product2);

        // Act
        productDao.deleteByIds(ids);

        // Assert
        assertThat(testProduct.getDeleteFlag()).isTrue();
        assertThat(product2.getDeleteFlag()).isTrue();
    }

    @Test
    void testDeleteByIds_EmptyList() {
        // Arrange
        List<Integer> ids = Collections.emptyList();

        // Act
        productDao.deleteByIds(ids);

        // Assert
        verify(entityManager, never()).find(any(), any());
    }

    @Test
    void testDeleteByIds_NullList() {
        // Arrange
        List<Integer> ids = null;

        // Act
        productDao.deleteByIds(ids);

        // Assert
        verify(entityManager, never()).find(any(), any());
    }

    @Test
    void testDeleteByIds_ProductWithNoLineItems() {
        // Arrange
        Product productNoItems = new Product();
        productNoItems.setId(3);
        productNoItems.setDeleteFlag(false);
        productNoItems.setLineItemList(new ArrayList<>());

        List<Integer> ids = Arrays.asList(3);
        when(entityManager.find(Product.class, 3)).thenReturn(productNoItems);

        // Act
        productDao.deleteByIds(ids);

        // Assert
        assertThat(productNoItems.getDeleteFlag()).isTrue();
    }

    @Test
    void testDeleteByIds_ProductWithSingleLineItem() {
        // Arrange
        Product productOneItem = new Product();
        productOneItem.setId(4);
        productOneItem.setDeleteFlag(false);
        ProductLineItem singleItem = new ProductLineItem();
        singleItem.setId(10);
        singleItem.setDeleteFlag(false);
        productOneItem.setLineItemList(Arrays.asList(singleItem));

        List<Integer> ids = Arrays.asList(4);
        when(entityManager.find(Product.class, 4)).thenReturn(productOneItem);

        // Act
        productDao.deleteByIds(ids);

        // Assert
        assertThat(productOneItem.getDeleteFlag()).isTrue();
        assertThat(singleItem.getDeleteFlag()).isTrue();
    }

    @Test
    void testGetTotalProductCountByVatId_Success() {
        // Arrange
        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter("vatId", 1)).thenReturn(query);
        when(query.getResultList()).thenReturn(Collections.singletonList(10L));

        // Act
        Integer result = productDao.getTotalProductCountByVatId(1);

        // Assert
        assertThat(result).isEqualTo(10);
        verify(query).setParameter("vatId", 1);
    }

    @Test
    void testGetTotalProductCountByVatId_NoResults() {
        // Arrange
        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter("vatId", 1)).thenReturn(query);
        when(query.getResultList()).thenReturn(Collections.emptyList());

        // Act
        Integer result = productDao.getTotalProductCountByVatId(1);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    void testGetTotalProductCountByVatId_ZeroCount() {
        // Arrange
        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter("vatId", 99)).thenReturn(query);
        when(query.getResultList()).thenReturn(Collections.singletonList(0L));

        // Act
        Integer result = productDao.getTotalProductCountByVatId(99);

        // Assert
        assertThat(result).isEqualTo(0);
    }

    @Test
    void testGetTotalProductCountByVatId_LargeCount() {
        // Arrange
        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter("vatId", 1)).thenReturn(query);
        when(query.getResultList()).thenReturn(Collections.singletonList(1000L));

        // Act
        Integer result = productDao.getTotalProductCountByVatId(1);

        // Assert
        assertThat(result).isEqualTo(1000);
    }

    @Test
    void testGetTotalProductCountByVatId_NullResultList() {
        // Arrange
        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter("vatId", 1)).thenReturn(query);
        when(query.getResultList()).thenReturn(null);

        // Act
        Integer result = productDao.getTotalProductCountByVatId(1);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    void testDeleteByIds_MultipleLineItems() {
        // Arrange
        ProductLineItem lineItem3 = new ProductLineItem();
        lineItem3.setId(3);
        lineItem3.setDeleteFlag(false);
        testProduct.getLineItemList().add(lineItem3);

        List<Integer> ids = Arrays.asList(1);
        when(entityManager.find(Product.class, 1)).thenReturn(testProduct);

        // Act
        productDao.deleteByIds(ids);

        // Assert
        assertThat(testProduct.getDeleteFlag()).isTrue();
        assertThat(testLineItem1.getDeleteFlag()).isTrue();
        assertThat(testLineItem2.getDeleteFlag()).isTrue();
        assertThat(lineItem3.getDeleteFlag()).isTrue();
    }

    @Test
    void testGetProductList_DifferentSortingColumns() {
        // Arrange
        Map<ProductFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("vatCategory");

        when(dataTableUtil.getColName("vatCategory", DatatableSortingFilterConstant.PRODUCT))
                .thenReturn("v.description");

        // Act
        PaginationResponseModel result = productDao.getProductList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        verify(dataTableUtil).getColName("vatCategory", DatatableSortingFilterConstant.PRODUCT);
    }

    @Test
    void testDeleteByIds_VerifyAllLineItemsMarkedDeleted() {
        // Arrange
        List<Integer> ids = Arrays.asList(1);
        when(entityManager.find(Product.class, 1)).thenReturn(testProduct);

        // Act
        productDao.deleteByIds(ids);

        // Assert
        for (ProductLineItem lineItem : testProduct.getLineItemList()) {
            assertThat(lineItem.getDeleteFlag()).isTrue();
        }
    }

    @Test
    void testGetProductList_WithSearchFilter() {
        // Arrange
        Map<ProductFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(ProductFilterEnum.SEARCH, "Test Product");

        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("productName");

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.PRODUCT)))
                .thenReturn("p.productName");

        // Act
        PaginationResponseModel result = productDao.getProductList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    void testDeleteByIds_ThreeProducts() {
        // Arrange
        Product product2 = new Product();
        product2.setId(2);
        product2.setDeleteFlag(false);
        product2.setLineItemList(new ArrayList<>());

        Product product3 = new Product();
        product3.setId(3);
        product3.setDeleteFlag(false);
        product3.setLineItemList(new ArrayList<>());

        List<Integer> ids = Arrays.asList(1, 2, 3);
        when(entityManager.find(Product.class, 1)).thenReturn(testProduct);
        when(entityManager.find(Product.class, 2)).thenReturn(product2);
        when(entityManager.find(Product.class, 3)).thenReturn(product3);

        // Act
        productDao.deleteByIds(ids);

        // Assert
        assertThat(testProduct.getDeleteFlag()).isTrue();
        assertThat(product2.getDeleteFlag()).isTrue();
        assertThat(product3.getDeleteFlag()).isTrue();
    }

    @Test
    void testGetTotalProductCountByVatId_DifferentVatIds() {
        // Arrange
        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter("vatId", 5)).thenReturn(query);
        when(query.getResultList()).thenReturn(Collections.singletonList(25L));

        // Act
        Integer result = productDao.getTotalProductCountByVatId(5);

        // Assert
        assertThat(result).isEqualTo(25);
        verify(query).setParameter("vatId", 5);
    }
}
