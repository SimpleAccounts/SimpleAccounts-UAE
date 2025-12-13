package com.simpleaccounts.service;

import com.simpleaccounts.entity.InventoryHistory;
import com.simpleaccounts.rest.InventoryController.InventoryRevenueModel;
import com.simpleaccounts.rest.InventoryController.TopInventoryRevenueModel;
import java.util.List;

public abstract class InventoryHistoryService extends SimpleAccountsService<Integer, InventoryHistory>{
    public abstract InventoryHistory getHistoryByInventoryId(Integer inventoryId);

    public abstract InventoryRevenueModel getTotalRevenueForInventory();

    public abstract InventoryRevenueModel getTotalQuantitySoldForInventory();

    public abstract TopInventoryRevenueModel getTopSellingProductsForInventory();

    public abstract TopInventoryRevenueModel getTopProfitGeneratingProductsForInventory();

    public abstract TopInventoryRevenueModel getLowSellingProductsForInventory();

    public abstract  List<InventoryHistory> getHistory(Integer productId, Integer supplierId);
}
