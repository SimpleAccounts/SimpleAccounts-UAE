package com.simpleaccounts.dao;

import com.simpleaccounts.constant.dbfilter.InventoryFilterEnum;
import com.simpleaccounts.entity.Inventory;
import com.simpleaccounts.entity.Product;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.productcontroller.InventoryListModel;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface InventoryDao  extends Dao<Integer, Inventory> {

  public PaginationResponseModel getInventoryList(Map<InventoryFilterEnum, Object> filterMap, PaginationModel paginationModel);
  public List<Inventory> getProductByProductId(Integer productId);

   public List<Inventory> getInventoryByProductId(Integer productId);

    Integer getProductCountForInventory();
   public Integer totalStockOnHand();

    Integer getlowStockProductCountForInventory();

    List<Product> getlowStockProductListForInventory();

    List<InventoryListModel> getTopSellingProductListForInventory();

    Inventory getInventoryByProductIdAndSupplierId(Integer productId, Integer supplierId);

    public Integer getOutOfStockCountOfInventory();

    public BigDecimal getTotalInventoryValue();

 Integer getTotalInventoryCountForContact(int contactId);
}
