package com.simpleaccounts.rest.productwarehousecontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.entity.ProductWarehouse;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.ProductWarehouseService;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductWareHouseController Unit Tests")
class ProductWareHouseControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private ProductWarehouseService productWarehouseService;

    @Mock
    private JwtTokenUtil jwtTokenUtil;

    @InjectMocks
    private ProductWareHouseController productWareHouseController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(productWareHouseController).build();
        objectMapper = new ObjectMapper();
    }

    @Nested
    @DisplayName("getWarehouseList Tests")
    class GetWarehouseListTests {

        @Test
        @DisplayName("Should return warehouse list successfully")
        void getWarehouseListReturnsWarehouses() throws Exception {
            // Arrange
            List<ProductWarehouse> warehouses = createWarehouseList(5);

            when(productWarehouseService.getProductWarehouseList()).thenReturn(warehouses);

            // Act & Assert
            mockMvc.perform(get("/rest/productwarehouse/getList"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return not found when no warehouses exist")
        void getWarehouseListReturnsNotFound() throws Exception {
            // Arrange
            when(productWarehouseService.getProductWarehouseList()).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/productwarehouse/getList"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should handle empty list correctly")
        void getWarehouseListHandlesEmptyList() throws Exception {
            // Arrange
            when(productWarehouseService.getProductWarehouseList()).thenReturn(new ArrayList<>());

            // Act & Assert
            mockMvc.perform(get("/rest/productwarehouse/getList"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("getWarehouseById Tests")
    class GetWarehouseByIdTests {

        @Test
        @DisplayName("Should return warehouse by ID")
        void getWarehouseByIdReturnsWarehouse() throws Exception {
            // Arrange
            ProductWarehouse warehouse = createWarehouse(1, "Main Warehouse");

            when(productWarehouseService.findByPK(1)).thenReturn(warehouse);

            // Act & Assert
            mockMvc.perform(get("/rest/productwarehouse/getById")
                            .param("productWarehouseId", "1"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return not found when warehouse does not exist")
        void getWarehouseByIdReturnsNotFound() throws Exception {
            // Arrange
            when(productWarehouseService.findByPK(999)).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/productwarehouse/getById")
                            .param("productWarehouseId", "999"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("saveWarehouse Tests")
    class SaveWarehouseTests {

        @Test
        @DisplayName("Should save new warehouse successfully")
        void saveWarehouseSucceeds() throws Exception {
            // Arrange
            ProductWareHousePersistModel model = createWarehouseModel("New Warehouse");

            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);

            // Act & Assert
            mockMvc.perform(post("/rest/productwarehouse/save")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(model)))
                    .andExpect(status().isOk());

            verify(productWarehouseService).persist(any(ProductWarehouse.class));
        }
    }

    @Nested
    @DisplayName("updateWarehouse Tests")
    class UpdateWarehouseTests {

        @Test
        @DisplayName("Should update warehouse successfully")
        void updateWarehouseSucceeds() throws Exception {
            // Arrange
            ProductWareHousePersistModel model = createWarehouseModel("Updated Warehouse");
            model.setWarehouseId(1);

            ProductWarehouse existingWarehouse = createWarehouse(1, "Old Warehouse");

            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(productWarehouseService.findByPK(1)).thenReturn(existingWarehouse);

            // Act & Assert
            mockMvc.perform(post("/rest/productwarehouse/update")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(model)))
                    .andExpect(status().isOk());

            verify(productWarehouseService).update(any(ProductWarehouse.class));
        }

        @Test
        @DisplayName("Should return not found when updating non-existent warehouse")
        void updateWarehouseReturnsNotFound() throws Exception {
            // Arrange
            ProductWareHousePersistModel model = createWarehouseModel("Updated Warehouse");
            model.setWarehouseId(999);

            when(productWarehouseService.findByPK(999)).thenReturn(null);

            // Act & Assert
            mockMvc.perform(post("/rest/productwarehouse/update")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(model)))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("deleteWarehouse Tests")
    class DeleteWarehouseTests {

        @Test
        @DisplayName("Should delete warehouse successfully")
        void deleteWarehouseSucceeds() throws Exception {
            // Arrange
            ProductWarehouse warehouse = createWarehouse(1, "Test Warehouse");

            when(productWarehouseService.findByPK(1)).thenReturn(warehouse);

            // Act & Assert
            mockMvc.perform(delete("/rest/productwarehouse/delete")
                            .param("productWarehouseId", "1"))
                    .andExpect(status().isOk());

            verify(productWarehouseService).update(any(ProductWarehouse.class));
        }

        @Test
        @DisplayName("Should return not found when deleting non-existent warehouse")
        void deleteWarehouseReturnsNotFound() throws Exception {
            // Arrange
            when(productWarehouseService.findByPK(999)).thenReturn(null);

            // Act & Assert
            mockMvc.perform(delete("/rest/productwarehouse/delete")
                            .param("productWarehouseId", "999"))
                    .andExpect(status().isNotFound());
        }
    }

    private List<ProductWarehouse> createWarehouseList(int count) {
        List<ProductWarehouse> warehouses = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            warehouses.add(createWarehouse(i, "Warehouse " + i));
        }
        return warehouses;
    }

    private ProductWarehouse createWarehouse(Integer id, String name) {
        ProductWarehouse warehouse = new ProductWarehouse();
        warehouse.setWarehouseId(id);
        warehouse.setWarehouseName(name);
        warehouse.setDeleteFlag(false);
        warehouse.setCreatedBy(1);
        warehouse.setCreatedDate(LocalDateTime.now());
        return warehouse;
    }

    private ProductWareHousePersistModel createWarehouseModel(String name) {
        ProductWareHousePersistModel model = new ProductWareHousePersistModel();
        model.setWarehouseName(name);
        return model;
    }
}