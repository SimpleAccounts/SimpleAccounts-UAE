package com.simplevat.dao;

import com.simplevat.entity.InventoryHistory;
import com.simplevat.model.InventoryHistoryModel;
import com.simplevat.rest.InventoryController.InventoryRevenueModel;
import com.simplevat.rest.InventoryController.TopInventoryRevenueModel;
import org.springframework.stereotype.Repository;

import java.util.List;


public interface InventoryHistoryDao extends Dao<Integer, InventoryHistory> {

    InventoryHistory getHistoryByInventoryId(Integer inventoryId);

    public InventoryRevenueModel getTotalRevenueForInventory();

   public InventoryRevenueModel getTotalQuantitySoldForInventory();

   public TopInventoryRevenueModel getTopSellingProductsForInventory();

   public TopInventoryRevenueModel getTopProfitGeneratingProductsForInventory();

    public TopInventoryRevenueModel getLowSellingProductsForInventory();

    List<InventoryHistory> getHistory(Integer productId, Integer supplierId);
}
