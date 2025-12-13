package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.InventoryHistoryDao;
import com.simpleaccounts.entity.InventoryHistory;
import com.simpleaccounts.rest.InventoryController.InventoryRevenueModel;
import com.simpleaccounts.rest.InventoryController.TopInventoryRevenueModel;
import com.simpleaccounts.service.InventoryHistoryService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InventoryHistoryServiceImpl extends InventoryHistoryService {
     private final InventoryHistoryDao inventoryHistoryDao;
    @Override
    protected Dao<Integer, InventoryHistory> getDao() {
        return inventoryHistoryDao;
    }

    public InventoryHistory getHistoryByInventoryId(Integer inventoryId){
        return inventoryHistoryDao.getHistoryByInventoryId(inventoryId);
    }
    public InventoryRevenueModel getTotalRevenueForInventory(){
        return inventoryHistoryDao.getTotalRevenueForInventory();
    }
    public  InventoryRevenueModel getTotalQuantitySoldForInventory(){
        return inventoryHistoryDao.getTotalQuantitySoldForInventory();
    }
    public TopInventoryRevenueModel getTopSellingProductsForInventory(){
        return inventoryHistoryDao. getTopSellingProductsForInventory();
    }
    public  TopInventoryRevenueModel getTopProfitGeneratingProductsForInventory(){
        return inventoryHistoryDao.getTopProfitGeneratingProductsForInventory();
    }
    public TopInventoryRevenueModel getLowSellingProductsForInventory(){
        return inventoryHistoryDao.getLowSellingProductsForInventory();
    }
    public List<InventoryHistory> getHistory(Integer productId, Integer supplierId){
        return inventoryHistoryDao.getHistory(productId,supplierId);
    }
}
