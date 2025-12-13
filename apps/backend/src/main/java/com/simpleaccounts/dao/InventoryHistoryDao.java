package com.simpleaccounts.dao;

import com.simpleaccounts.entity.InventoryHistory;

import com.simpleaccounts.rest.InventoryController.InventoryRevenueModel;
import com.simpleaccounts.rest.InventoryController.TopInventoryRevenueModel;

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
