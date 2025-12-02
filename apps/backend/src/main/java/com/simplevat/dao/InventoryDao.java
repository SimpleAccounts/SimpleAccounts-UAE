package com.simplevat.dao;


import com.simplevat.constant.dbfilter.InventoryFilterEnum;
import com.simplevat.entity.Inventory;
import com.simplevat.entity.Product;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.rest.productcontroller.InventoryListModel;

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
