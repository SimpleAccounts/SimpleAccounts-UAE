package com.simpleaccounts.rest.productwarehousecontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.entity.ProductWarehouse;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.service.ProductWarehouseService;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@WebMvcTest(ProductWareHouseController.class)
@AutoConfigureMockMvc(addFilters = false)
class ProductWareHouseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean private ProductWareHouseRestHelper productWareHouseRestHelper;
    @MockBean private ProductWarehouseService productWarehouseService;
    @MockBean private CustomUserDetailsService customUserDetailsService;

    @Test
    void getWareHouseShouldReturnWarehouseList() throws Exception {
        ProductWarehouse warehouse1 = new ProductWarehouse();
        warehouse1.setId(1);
        warehouse1.setWarehouseName("Main Warehouse");

        ProductWarehouse warehouse2 = new ProductWarehouse();
        warehouse2.setId(2);
        warehouse2.setWarehouseName("Secondary Warehouse");

        List<ProductWarehouse> warehouses = Arrays.asList(warehouse1, warehouse2);

        when(productWarehouseService.getProductWarehouseList()).thenReturn(warehouses);

        mockMvc.perform(get("/rest/productwarehouse/getWareHouse"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].warehouseName").value("Main Warehouse"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].warehouseName").value("Secondary Warehouse"));

        verify(productWarehouseService).getProductWarehouseList();
    }

    @Test
    void getWareHouseShouldReturnEmptyListWhenNoWarehouses() throws Exception {
        when(productWarehouseService.getProductWarehouseList()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/rest/productwarehouse/getWareHouse"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(productWarehouseService).getProductWarehouseList();
    }

    @Test
    void getWareHouseShouldReturnNotFoundWhenServiceReturnsNull() throws Exception {
        when(productWarehouseService.getProductWarehouseList()).thenReturn(null);

        mockMvc.perform(get("/rest/productwarehouse/getWareHouse"))
                .andExpect(status().isNotFound());

        verify(productWarehouseService).getProductWarehouseList();
    }

    @Test
    void getWareHouseShouldReturnSingleWarehouse() throws Exception {
        ProductWarehouse warehouse = new ProductWarehouse();
        warehouse.setId(1);
        warehouse.setWarehouseName("Single Warehouse");
        warehouse.setDeleteFlag(false);

        when(productWarehouseService.getProductWarehouseList()).thenReturn(Arrays.asList(warehouse));

        mockMvc.perform(get("/rest/productwarehouse/getWareHouse"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(1));

        verify(productWarehouseService).getProductWarehouseList();
    }

    @Test
    void saveWareHouseShouldCreateNewWarehouse() throws Exception {
        ProductWareHousePersistModel persistModel = new ProductWareHousePersistModel();
        persistModel.setWarehouseName("New Warehouse");
        persistModel.setLocation("Dubai");

        ProductWarehouse warehouse = new ProductWarehouse();
        warehouse.setWarehouseName("New Warehouse");
        warehouse.setLocation("Dubai");

        when(productWareHouseRestHelper.getEntity(any(ProductWareHousePersistModel.class))).thenReturn(warehouse);

        mockMvc.perform(post("/rest/productwarehouse/saveWareHouse")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(persistModel)))
                .andExpect(status().isOk())
                .andExpect(content().string("Saved Successfully"));

        verify(productWareHouseRestHelper).getEntity(any(ProductWareHousePersistModel.class));
        verify(productWarehouseService).persist(warehouse);
    }

    @Test
    void saveWareHouseShouldSetDeleteFlagToFalse() throws Exception {
        ProductWareHousePersistModel persistModel = new ProductWareHousePersistModel();
        persistModel.setWarehouseName("Test Warehouse");

        ProductWarehouse warehouse = new ProductWarehouse();
        warehouse.setWarehouseName("Test Warehouse");

        when(productWareHouseRestHelper.getEntity(any(ProductWareHousePersistModel.class))).thenReturn(warehouse);

        mockMvc.perform(post("/rest/productwarehouse/saveWareHouse")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(persistModel)))
                .andExpect(status().isOk());

        ArgumentCaptor<ProductWarehouse> captor = ArgumentCaptor.forClass(ProductWarehouse.class);
        verify(productWarehouseService).persist(captor.capture());

        ProductWarehouse savedWarehouse = captor.getValue();
        assert savedWarehouse.getDeleteFlag() == false;
    }

    @Test
    void saveWareHouseShouldHandleNullModel() throws Exception {
        mockMvc.perform(post("/rest/productwarehouse/saveWareHouse")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("null"))
                .andExpect(status().isOk())
                .andExpect(content().string("Saved Successfully"));

        verify(productWareHouseRestHelper, never()).getEntity(any());
        verify(productWarehouseService, never()).persist(any());
    }

    @Test
    void saveWareHouseShouldConvertModelToEntity() throws Exception {
        ProductWareHousePersistModel persistModel = new ProductWareHousePersistModel();
        persistModel.setWarehouseName("Converted Warehouse");
        persistModel.setLocation("Abu Dhabi");
        persistModel.setCapacity(1000);

        ProductWarehouse warehouse = new ProductWarehouse();
        warehouse.setWarehouseName("Converted Warehouse");
        warehouse.setLocation("Abu Dhabi");
        warehouse.setCapacity(1000);

        when(productWareHouseRestHelper.getEntity(persistModel)).thenReturn(warehouse);

        mockMvc.perform(post("/rest/productwarehouse/saveWareHouse")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(persistModel)))
                .andExpect(status().isOk());

        verify(productWareHouseRestHelper).getEntity(persistModel);
        verify(productWarehouseService).persist(warehouse);
    }

    @Test
    void saveWareHouseShouldPersistWarehouseWithAllFields() throws Exception {
        ProductWareHousePersistModel persistModel = new ProductWareHousePersistModel();
        persistModel.setWarehouseName("Full Warehouse");
        persistModel.setLocation("Sharjah");
        persistModel.setCapacity(5000);
        persistModel.setDescription("Main storage facility");

        ProductWarehouse warehouse = new ProductWarehouse();
        warehouse.setWarehouseName("Full Warehouse");
        warehouse.setLocation("Sharjah");
        warehouse.setCapacity(5000);
        warehouse.setDescription("Main storage facility");

        when(productWareHouseRestHelper.getEntity(any())).thenReturn(warehouse);

        mockMvc.perform(post("/rest/productwarehouse/saveWareHouse")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(persistModel)))
                .andExpect(status().isOk())
                .andExpect(content().string("Saved Successfully"));

        verify(productWarehouseService).persist(warehouse);
    }

    @Test
    void saveWareHouseShouldHandleEmptyModel() throws Exception {
        ProductWareHousePersistModel persistModel = new ProductWareHousePersistModel();

        ProductWarehouse warehouse = new ProductWarehouse();

        when(productWareHouseRestHelper.getEntity(any())).thenReturn(warehouse);

        mockMvc.perform(post("/rest/productwarehouse/saveWareHouse")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(persistModel)))
                .andExpect(status().isOk());

        verify(productWarehouseService).persist(warehouse);
    }

    @Test
    void getWareHouseShouldHandleMultipleWarehouses() throws Exception {
        List<ProductWarehouse> warehouses = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            ProductWarehouse warehouse = new ProductWarehouse();
            warehouse.setId(i);
            warehouse.setWarehouseName("Warehouse " + i);
            warehouses.add(warehouse);
        }

        when(productWarehouseService.getProductWarehouseList()).thenReturn(warehouses);

        mockMvc.perform(get("/rest/productwarehouse/getWareHouse"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(10));

        verify(productWarehouseService).getProductWarehouseList();
    }

    @Test
    void saveWareHouseShouldReturnSuccessMessageOnValidInput() throws Exception {
        ProductWareHousePersistModel persistModel = new ProductWareHousePersistModel();
        persistModel.setWarehouseName("Success Warehouse");

        ProductWarehouse warehouse = new ProductWarehouse();
        warehouse.setWarehouseName("Success Warehouse");

        when(productWareHouseRestHelper.getEntity(any())).thenReturn(warehouse);

        mockMvc.perform(post("/rest/productwarehouse/saveWareHouse")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(persistModel)))
                .andExpect(status().isOk())
                .andExpect(content().string("Saved Successfully"));
    }

    @Test
    void getWareHouseShouldReturnWarehousesWithAllProperties() throws Exception {
        ProductWarehouse warehouse = new ProductWarehouse();
        warehouse.setId(100);
        warehouse.setWarehouseName("Detailed Warehouse");
        warehouse.setLocation("Dubai Marina");
        warehouse.setCapacity(10000);
        warehouse.setDescription("Premium storage");
        warehouse.setDeleteFlag(false);

        when(productWarehouseService.getProductWarehouseList()).thenReturn(Arrays.asList(warehouse));

        mockMvc.perform(get("/rest/productwarehouse/getWareHouse"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(100))
                .andExpect(jsonPath("$[0].warehouseName").value("Detailed Warehouse"))
                .andExpect(jsonPath("$[0].location").value("Dubai Marina"))
                .andExpect(jsonPath("$[0].capacity").value(10000))
                .andExpect(jsonPath("$[0].description").value("Premium storage"))
                .andExpect(jsonPath("$[0].deleteFlag").value(false));
    }

    @Test
    void saveWareHouseShouldInvokeHelperAndService() throws Exception {
        ProductWareHousePersistModel persistModel = new ProductWareHousePersistModel();
        persistModel.setWarehouseName("Invoke Test");

        ProductWarehouse warehouse = new ProductWarehouse();

        when(productWareHouseRestHelper.getEntity(any())).thenReturn(warehouse);

        mockMvc.perform(post("/rest/productwarehouse/saveWareHouse")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(persistModel)))
                .andExpect(status().isOk());

        verify(productWareHouseRestHelper).getEntity(any(ProductWareHousePersistModel.class));
        verify(productWarehouseService).persist(any(ProductWarehouse.class));
    }
}
