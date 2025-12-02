package com.simplevat.service.impl;

import com.simplevat.dao.Dao;
import com.simplevat.dao.InventoryHistoryDao;
import com.simplevat.entity.Inventory;
import com.simplevat.entity.InventoryHistory;
import com.simplevat.model.InventoryHistoryModel;
import com.simplevat.rest.InventoryController.InventoryRevenueModel;
import com.simplevat.rest.InventoryController.TopInventoryRevenueModel;
import com.simplevat.service.InventoryHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("InventoryHistoryService")
public class InventoryHistoryServiceImpl extends InventoryHistoryService {
    @Autowired
     InventoryHistoryDao inventoryHistoryDao;
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
