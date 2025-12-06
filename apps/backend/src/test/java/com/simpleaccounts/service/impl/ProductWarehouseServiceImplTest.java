package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.ProductWarehouseDao;
import com.simpleaccounts.entity.ProductWarehouse;
import com.simpleaccounts.exceptions.ServiceException;
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
class ProductWarehouseServiceImplTest {

    @Mock
    private ProductWarehouseDao productWarehouseDao;

    @InjectMocks
    private ProductWarehouseServiceImpl productWarehouseService;

    private ProductWarehouse testProductWarehouse;

    @BeforeEach
    void setUp() {
        testProductWarehouse = new ProductWarehouse();
        testProductWarehouse.setId(1);
        testProductWarehouse.setWarehouseCode("WH-001");
        testProductWarehouse.setWarehouseName("Main Warehouse");
        testProductWarehouse.setWarehouseAddress("123 Warehouse Street");
        testProductWarehouse.setCity("Dubai");
        testProductWarehouse.setCountry("UAE");
        testProductWarehouse.setContactPerson("John Doe");
        testProductWarehouse.setContactNumber("+971-50-1234567");
        testProductWarehouse.setCreatedBy(1);
        testProductWarehouse.setCreatedDate(LocalDateTime.now());
        testProductWarehouse.setDeleteFlag(false);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnProductWarehouseDaoWhenGetDaoCalled() {
        assertThat(productWarehouseService.getDao()).isEqualTo(productWarehouseDao);
    }

    @Test
    void shouldReturnNonNullDao() {
        assertThat(productWarehouseService.getDao()).isNotNull();
    }

    // ========== getProductWarehouseList Tests ==========

    @Test
    void shouldReturnProductWarehouseListWhenWarehousesExist() {
        List<ProductWarehouse> expectedList = Arrays.asList(testProductWarehouse);
        when(productWarehouseDao.getProductWarehouseList()).thenReturn(expectedList);

        List<ProductWarehouse> result = productWarehouseService.getProductWarehouseList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testProductWarehouse);
        assertThat(result.get(0).getWarehouseName()).isEqualTo("Main Warehouse");
        verify(productWarehouseDao, times(1)).getProductWarehouseList();
    }

    @Test
    void shouldReturnEmptyListWhenNoWarehousesExist() {
        when(productWarehouseDao.getProductWarehouseList()).thenReturn(Collections.emptyList());

        List<ProductWarehouse> result = productWarehouseService.getProductWarehouseList();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(productWarehouseDao, times(1)).getProductWarehouseList();
    }

    @Test
    void shouldReturnMultipleProductWarehouses() {
        ProductWarehouse warehouse2 = new ProductWarehouse();
        warehouse2.setId(2);
        warehouse2.setWarehouseCode("WH-002");
        warehouse2.setWarehouseName("Secondary Warehouse");

        ProductWarehouse warehouse3 = new ProductWarehouse();
        warehouse3.setId(3);
        warehouse3.setWarehouseCode("WH-003");
        warehouse3.setWarehouseName("Tertiary Warehouse");

        List<ProductWarehouse> expectedList = Arrays.asList(testProductWarehouse, warehouse2, warehouse3);
        when(productWarehouseDao.getProductWarehouseList()).thenReturn(expectedList);

        List<ProductWarehouse> result = productWarehouseService.getProductWarehouseList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(testProductWarehouse, warehouse2, warehouse3);
        assertThat(result.get(0).getWarehouseName()).isEqualTo("Main Warehouse");
        assertThat(result.get(1).getWarehouseName()).isEqualTo("Secondary Warehouse");
        assertThat(result.get(2).getWarehouseName()).isEqualTo("Tertiary Warehouse");
        verify(productWarehouseDao, times(1)).getProductWarehouseList();
    }

    @Test
    void shouldHandleMultipleWarehouseListCalls() {
        List<ProductWarehouse> expectedList = Arrays.asList(testProductWarehouse);
        when(productWarehouseDao.getProductWarehouseList()).thenReturn(expectedList);

        List<ProductWarehouse> result1 = productWarehouseService.getProductWarehouseList();
        List<ProductWarehouse> result2 = productWarehouseService.getProductWarehouseList();

        assertThat(result1).isEqualTo(result2);
        verify(productWarehouseDao, times(2)).getProductWarehouseList();
    }

    @Test
    void shouldReturnWarehousesWithAllFieldsPopulated() {
        testProductWarehouse.setEmail("warehouse@example.com");
        testProductWarehouse.setCapacity(10000);
        testProductWarehouse.setIsActive(true);

        List<ProductWarehouse> expectedList = Arrays.asList(testProductWarehouse);
        when(productWarehouseDao.getProductWarehouseList()).thenReturn(expectedList);

        List<ProductWarehouse> result = productWarehouseService.getProductWarehouseList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmail()).isEqualTo("warehouse@example.com");
        assertThat(result.get(0).getCapacity()).isEqualTo(10000);
        assertThat(result.get(0).getIsActive()).isTrue();
        verify(productWarehouseDao, times(1)).getProductWarehouseList();
    }

    @Test
    void shouldReturnLargeListOfWarehouses() {
        List<ProductWarehouse> largeList = new ArrayList<>();
        for (int i = 1; i <= 50; i++) {
            ProductWarehouse warehouse = new ProductWarehouse();
            warehouse.setId(i);
            warehouse.setWarehouseCode("WH-" + String.format("%03d", i));
            warehouse.setWarehouseName("Warehouse " + i);
            largeList.add(warehouse);
        }

        when(productWarehouseDao.getProductWarehouseList()).thenReturn(largeList);

        List<ProductWarehouse> result = productWarehouseService.getProductWarehouseList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(50);
        assertThat(result.get(0).getWarehouseName()).isEqualTo("Warehouse 1");
        assertThat(result.get(49).getWarehouseName()).isEqualTo("Warehouse 50");
        verify(productWarehouseDao, times(1)).getProductWarehouseList();
    }

    @Test
    void shouldHandleNullReturnFromWarehouseList() {
        when(productWarehouseDao.getProductWarehouseList()).thenReturn(null);

        List<ProductWarehouse> result = productWarehouseService.getProductWarehouseList();

        assertThat(result).isNull();
        verify(productWarehouseDao, times(1)).getProductWarehouseList();
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldFindProductWarehouseByPrimaryKey() {
        when(productWarehouseDao.findByPK(1)).thenReturn(testProductWarehouse);

        ProductWarehouse result = productWarehouseService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testProductWarehouse);
        assertThat(result.getId()).isEqualTo(1);
        assertThat(result.getWarehouseName()).isEqualTo("Main Warehouse");
        verify(productWarehouseDao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenProductWarehouseNotFoundByPK() {
        when(productWarehouseDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> productWarehouseService.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(productWarehouseDao, times(1)).findByPK(999);
    }

    @Test
    void shouldFindWarehouseWithNullPK() {
        when(productWarehouseDao.findByPK(null)).thenReturn(null);

        assertThatThrownBy(() -> productWarehouseService.findByPK(null))
                .isInstanceOf(ServiceException.class);

        verify(productWarehouseDao, times(1)).findByPK(null);
    }

    @Test
    void shouldFindWarehouseWithZeroPK() {
        when(productWarehouseDao.findByPK(0)).thenReturn(null);

        assertThatThrownBy(() -> productWarehouseService.findByPK(0))
                .isInstanceOf(ServiceException.class);

        verify(productWarehouseDao, times(1)).findByPK(0);
    }

    @Test
    void shouldFindMultipleWarehousesByDifferentPKs() {
        ProductWarehouse warehouse2 = new ProductWarehouse();
        warehouse2.setId(2);

        when(productWarehouseDao.findByPK(1)).thenReturn(testProductWarehouse);
        when(productWarehouseDao.findByPK(2)).thenReturn(warehouse2);

        ProductWarehouse result1 = productWarehouseService.findByPK(1);
        ProductWarehouse result2 = productWarehouseService.findByPK(2);

        assertThat(result1.getId()).isEqualTo(1);
        assertThat(result2.getId()).isEqualTo(2);
        verify(productWarehouseDao, times(1)).findByPK(1);
        verify(productWarehouseDao, times(1)).findByPK(2);
    }

    // ========== persist Tests ==========

    @Test
    void shouldPersistNewProductWarehouse() {
        productWarehouseService.persist(testProductWarehouse);

        verify(productWarehouseDao, times(1)).persist(testProductWarehouse);
    }

    @Test
    void shouldPersistWarehouseWithMinimalData() {
        ProductWarehouse minimalWarehouse = new ProductWarehouse();
        minimalWarehouse.setWarehouseCode("WH-MIN");

        productWarehouseService.persist(minimalWarehouse);

        verify(productWarehouseDao, times(1)).persist(minimalWarehouse);
    }

    @Test
    void shouldPersistWarehouseWithAllFields() {
        testProductWarehouse.setEmail("test@warehouse.com");
        testProductWarehouse.setCapacity(50000);
        testProductWarehouse.setIsActive(true);
        testProductWarehouse.setPostalCode("12345");

        productWarehouseService.persist(testProductWarehouse);

        verify(productWarehouseDao, times(1)).persist(testProductWarehouse);
    }

    @Test
    void shouldPersistMultipleWarehouses() {
        ProductWarehouse warehouse2 = new ProductWarehouse();
        warehouse2.setId(2);

        productWarehouseService.persist(testProductWarehouse);
        productWarehouseService.persist(warehouse2);

        verify(productWarehouseDao, times(1)).persist(testProductWarehouse);
        verify(productWarehouseDao, times(1)).persist(warehouse2);
    }

    // ========== update Tests ==========

    @Test
    void shouldUpdateExistingProductWarehouse() {
        when(productWarehouseDao.update(testProductWarehouse)).thenReturn(testProductWarehouse);

        ProductWarehouse result = productWarehouseService.update(testProductWarehouse);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testProductWarehouse);
        verify(productWarehouseDao, times(1)).update(testProductWarehouse);
    }

    @Test
    void shouldUpdateWarehouseAndReturnUpdatedEntity() {
        testProductWarehouse.setWarehouseName("Updated Warehouse Name");
        testProductWarehouse.setCity("Abu Dhabi");
        when(productWarehouseDao.update(testProductWarehouse)).thenReturn(testProductWarehouse);

        ProductWarehouse result = productWarehouseService.update(testProductWarehouse);

        assertThat(result).isNotNull();
        assertThat(result.getWarehouseName()).isEqualTo("Updated Warehouse Name");
        assertThat(result.getCity()).isEqualTo("Abu Dhabi");
        verify(productWarehouseDao, times(1)).update(testProductWarehouse);
    }

    @Test
    void shouldUpdateWarehouseWithNullFields() {
        testProductWarehouse.setEmail(null);
        testProductWarehouse.setContactNumber(null);
        when(productWarehouseDao.update(testProductWarehouse)).thenReturn(testProductWarehouse);

        ProductWarehouse result = productWarehouseService.update(testProductWarehouse);

        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isNull();
        assertThat(result.getContactNumber()).isNull();
        verify(productWarehouseDao, times(1)).update(testProductWarehouse);
    }

    @Test
    void shouldHandleSequentialUpdates() {
        when(productWarehouseDao.update(any(ProductWarehouse.class))).thenReturn(testProductWarehouse);

        productWarehouseService.update(testProductWarehouse);
        testProductWarehouse.setWarehouseName("Version 2");
        productWarehouseService.update(testProductWarehouse);
        testProductWarehouse.setWarehouseName("Version 3");
        productWarehouseService.update(testProductWarehouse);

        verify(productWarehouseDao, times(3)).update(testProductWarehouse);
    }

    // ========== delete Tests ==========

    @Test
    void shouldDeleteProductWarehouse() {
        productWarehouseService.delete(testProductWarehouse);

        verify(productWarehouseDao, times(1)).delete(testProductWarehouse);
    }

    @Test
    void shouldDeleteMultipleWarehouses() {
        ProductWarehouse warehouse2 = new ProductWarehouse();
        warehouse2.setId(2);

        productWarehouseService.delete(testProductWarehouse);
        productWarehouseService.delete(warehouse2);

        verify(productWarehouseDao, times(1)).delete(testProductWarehouse);
        verify(productWarehouseDao, times(1)).delete(warehouse2);
    }

    @Test
    void shouldDeleteWarehouseWithMinimalData() {
        ProductWarehouse minimalWarehouse = new ProductWarehouse();
        minimalWarehouse.setId(99);

        productWarehouseService.delete(minimalWarehouse);

        verify(productWarehouseDao, times(1)).delete(minimalWarehouse);
    }

    // ========== findByAttributes Tests ==========

    @Test
    void shouldFindProductWarehousesByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("city", "Dubai");
        attributes.put("deleteFlag", false);

        List<ProductWarehouse> expectedList = Arrays.asList(testProductWarehouse);
        when(productWarehouseDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<ProductWarehouse> result = productWarehouseService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testProductWarehouse);
        verify(productWarehouseDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("city", "NonExistentCity");

        when(productWarehouseDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<ProductWarehouse> result = productWarehouseService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(productWarehouseDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<ProductWarehouse> result = productWarehouseService.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(productWarehouseDao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<ProductWarehouse> result = productWarehouseService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(productWarehouseDao, never()).findByAttributes(any());
    }

    @Test
    void shouldFindMultipleWarehousesByAttributes() {
        ProductWarehouse warehouse2 = new ProductWarehouse();
        warehouse2.setId(2);
        warehouse2.setCity("Dubai");

        ProductWarehouse warehouse3 = new ProductWarehouse();
        warehouse3.setId(3);
        warehouse3.setCity("Dubai");

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("city", "Dubai");

        List<ProductWarehouse> expectedList = Arrays.asList(testProductWarehouse, warehouse2, warehouse3);
        when(productWarehouseDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<ProductWarehouse> result = productWarehouseService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(testProductWarehouse, warehouse2, warehouse3);
        verify(productWarehouseDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldFindByComplexAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("city", "Dubai");
        attributes.put("country", "UAE");
        attributes.put("isActive", true);
        attributes.put("deleteFlag", false);

        List<ProductWarehouse> expectedList = Arrays.asList(testProductWarehouse);
        when(productWarehouseDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<ProductWarehouse> result = productWarehouseService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(productWarehouseDao, times(1)).findByAttributes(attributes);
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleWarehouseWithMinimalData() {
        ProductWarehouse minimalWarehouse = new ProductWarehouse();
        minimalWarehouse.setId(99);

        when(productWarehouseDao.findByPK(99)).thenReturn(minimalWarehouse);

        ProductWarehouse result = productWarehouseService.findByPK(99);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(99);
        assertThat(result.getWarehouseName()).isNull();
        verify(productWarehouseDao, times(1)).findByPK(99);
    }

    @Test
    void shouldHandleWarehousesInDifferentCities() {
        ProductWarehouse warehouse2 = new ProductWarehouse();
        warehouse2.setId(2);
        warehouse2.setCity("Abu Dhabi");

        ProductWarehouse warehouse3 = new ProductWarehouse();
        warehouse3.setId(3);
        warehouse3.setCity("Sharjah");

        List<ProductWarehouse> expectedList = Arrays.asList(testProductWarehouse, warehouse2, warehouse3);
        when(productWarehouseDao.getProductWarehouseList()).thenReturn(expectedList);

        List<ProductWarehouse> result = productWarehouseService.getProductWarehouseList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result.stream().map(ProductWarehouse::getCity))
                .containsExactly("Dubai", "Abu Dhabi", "Sharjah");
        verify(productWarehouseDao, times(1)).getProductWarehouseList();
    }

    @Test
    void shouldVerifyDaoInteractionForGetWarehouseList() {
        List<ProductWarehouse> expectedList = Arrays.asList(testProductWarehouse);
        when(productWarehouseDao.getProductWarehouseList()).thenReturn(expectedList);

        productWarehouseService.getProductWarehouseList();
        productWarehouseService.getProductWarehouseList();
        productWarehouseService.getProductWarehouseList();

        verify(productWarehouseDao, times(3)).getProductWarehouseList();
    }

    @Test
    void shouldPersistAndFindProductWarehouse() {
        when(productWarehouseDao.findByPK(1)).thenReturn(testProductWarehouse);

        productWarehouseService.persist(testProductWarehouse);
        ProductWarehouse found = productWarehouseService.findByPK(1);

        assertThat(found).isNotNull();
        assertThat(found).isEqualTo(testProductWarehouse);
        verify(productWarehouseDao, times(1)).persist(testProductWarehouse);
        verify(productWarehouseDao, times(1)).findByPK(1);
    }

    @Test
    void shouldHandleWarehouseWithSpecialCharactersInAddress() {
        testProductWarehouse.setWarehouseAddress("Street #123, Building @456, Floor ^7");
        when(productWarehouseDao.update(testProductWarehouse)).thenReturn(testProductWarehouse);

        ProductWarehouse result = productWarehouseService.update(testProductWarehouse);

        assertThat(result).isNotNull();
        assertThat(result.getWarehouseAddress()).contains("#", "@", "^");
        verify(productWarehouseDao, times(1)).update(testProductWarehouse);
    }

    @Test
    void shouldHandleWarehouseWithLongAddress() {
        String longAddress = "A".repeat(500);
        testProductWarehouse.setWarehouseAddress(longAddress);

        when(productWarehouseDao.update(testProductWarehouse)).thenReturn(testProductWarehouse);

        ProductWarehouse result = productWarehouseService.update(testProductWarehouse);

        assertThat(result).isNotNull();
        assertThat(result.getWarehouseAddress()).hasSize(500);
        verify(productWarehouseDao, times(1)).update(testProductWarehouse);
    }

    @Test
    void shouldHandleWarehouseWithInternationalPhoneNumber() {
        testProductWarehouse.setContactNumber("+971-4-123-4567");
        when(productWarehouseDao.update(testProductWarehouse)).thenReturn(testProductWarehouse);

        ProductWarehouse result = productWarehouseService.update(testProductWarehouse);

        assertThat(result).isNotNull();
        assertThat(result.getContactNumber()).isEqualTo("+971-4-123-4567");
        verify(productWarehouseDao, times(1)).update(testProductWarehouse);
    }

    @Test
    void shouldHandleWarehouseWithZeroCapacity() {
        testProductWarehouse.setCapacity(0);
        when(productWarehouseDao.update(testProductWarehouse)).thenReturn(testProductWarehouse);

        ProductWarehouse result = productWarehouseService.update(testProductWarehouse);

        assertThat(result).isNotNull();
        assertThat(result.getCapacity()).isEqualTo(0);
        verify(productWarehouseDao, times(1)).update(testProductWarehouse);
    }

    @Test
    void shouldHandleWarehouseWithLargeCapacity() {
        testProductWarehouse.setCapacity(1000000);
        when(productWarehouseDao.update(testProductWarehouse)).thenReturn(testProductWarehouse);

        ProductWarehouse result = productWarehouseService.update(testProductWarehouse);

        assertThat(result).isNotNull();
        assertThat(result.getCapacity()).isEqualTo(1000000);
        verify(productWarehouseDao, times(1)).update(testProductWarehouse);
    }

    @Test
    void shouldHandleWarehouseWithInactiveStatus() {
        testProductWarehouse.setIsActive(false);
        when(productWarehouseDao.update(testProductWarehouse)).thenReturn(testProductWarehouse);

        ProductWarehouse result = productWarehouseService.update(testProductWarehouse);

        assertThat(result).isNotNull();
        assertThat(result.getIsActive()).isFalse();
        verify(productWarehouseDao, times(1)).update(testProductWarehouse);
    }

    @Test
    void shouldFindByAttributesWithWarehouseCode() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("warehouseCode", "WH-001");

        List<ProductWarehouse> expectedList = Arrays.asList(testProductWarehouse);
        when(productWarehouseDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<ProductWarehouse> result = productWarehouseService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getWarehouseCode()).isEqualTo("WH-001");
        verify(productWarehouseDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldVerifyDaoInteractionForFindByPK() {
        when(productWarehouseDao.findByPK(1)).thenReturn(testProductWarehouse);

        productWarehouseService.findByPK(1);
        productWarehouseService.findByPK(1);

        verify(productWarehouseDao, times(2)).findByPK(1);
    }

    @Test
    void shouldHandleWarehouseWithEmailAddress() {
        testProductWarehouse.setEmail("main.warehouse@company.com");
        when(productWarehouseDao.update(testProductWarehouse)).thenReturn(testProductWarehouse);

        ProductWarehouse result = productWarehouseService.update(testProductWarehouse);

        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("main.warehouse@company.com");
        verify(productWarehouseDao, times(1)).update(testProductWarehouse);
    }

    @Test
    void shouldHandleWarehouseListWithMixedActiveStatus() {
        ProductWarehouse activeWarehouse = new ProductWarehouse();
        activeWarehouse.setId(2);
        activeWarehouse.setIsActive(true);

        ProductWarehouse inactiveWarehouse = new ProductWarehouse();
        inactiveWarehouse.setId(3);
        inactiveWarehouse.setIsActive(false);

        List<ProductWarehouse> expectedList = Arrays.asList(activeWarehouse, inactiveWarehouse);
        when(productWarehouseDao.getProductWarehouseList()).thenReturn(expectedList);

        List<ProductWarehouse> result = productWarehouseService.getProductWarehouseList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getIsActive()).isTrue();
        assertThat(result.get(1).getIsActive()).isFalse();
        verify(productWarehouseDao, times(1)).getProductWarehouseList();
    }
}
