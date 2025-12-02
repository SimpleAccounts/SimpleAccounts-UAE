package com.simplevat.service;

import com.simplevat.entity.InventoryHistory;
import com.simplevat.model.InventoryHistoryModel;
import com.simplevat.rest.InventoryController.InventoryRevenueModel;
import com.simplevat.rest.InventoryController.TopInventoryRevenueModel;

import java.util.List;

public abstract class InventoryHistoryService extends SimpleVatService<Integer, InventoryHistory>{
    public abstract InventoryHistory getHistoryByInventoryId(Integer inventoryId);

    public abstract InventoryRevenueModel getTotalRevenueForInventory();

    public abstract InventoryRevenueModel getTotalQuantitySoldForInventory();

    public abstract TopInventoryRevenueModel getTopSellingProductsForInventory();

    public abstract TopInventoryRevenueModel getTopProfitGeneratingProductsForInventory();

    public abstract TopInventoryRevenueModel getLowSellingProductsForInventory();

    public abstract  List<InventoryHistory> getHistory(Integer productId, Integer supplierId);
}
