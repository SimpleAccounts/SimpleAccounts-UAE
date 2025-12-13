package com.simpleaccounts.service;

import com.simpleaccounts.constant.dbfilter.InventoryFilterEnum;
import com.simpleaccounts.entity.Inventory;
import com.simpleaccounts.entity.Product;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.productcontroller.InventoryListModel;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public abstract  class InventoryService extends SimpleAccountsService<Integer, Inventory> {

    public abstract PaginationResponseModel getInventoryList(Map<InventoryFilterEnum, Object> filterMap, PaginationModel paginationModel);

    public abstract List<Inventory> getProductByProductId(Integer productId);

    public abstract List<Inventory> getInventoryByProductId(Integer productId);

    public abstract Integer getProductCountForInventory();

    public abstract Integer totalStockOnHand();

    public abstract Integer getlowStockProductCountForInventory();

    public abstract List<Product> getlowStockProductListForInventory();

    public abstract List<InventoryListModel> getTopSellingProductListForInventory();

    public abstract Inventory getInventoryByProductIdAndSupplierId(Integer productId,Integer supplierId);

    public abstract Integer getOutOfStockCountOfInventory();

    public abstract BigDecimal getTotalInventoryValue();

    public abstract Integer getTotalInventoryCountForContact(int contactId);
}
