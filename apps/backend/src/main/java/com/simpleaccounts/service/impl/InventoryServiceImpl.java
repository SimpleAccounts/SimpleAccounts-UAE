package com.simpleaccounts.service.impl;


import com.simpleaccounts.constant.dbfilter.InventoryFilterEnum;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.InventoryDao;
import com.simpleaccounts.entity.Inventory;
import com.simpleaccounts.entity.Product;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.productcontroller.InventoryListModel;
import com.simpleaccounts.service.InventoryService;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service("InventoryService")
@RequiredArgsConstructor
public  class InventoryServiceImpl extends InventoryService {

    private final InventoryDao inventoryDao;

    public  PaginationResponseModel getInventoryList(Map<InventoryFilterEnum, Object> filterMap, PaginationModel paginationModel){
        return  inventoryDao.getInventoryList(filterMap,paginationModel);
    }
    @Override
    public List<Inventory> getProductByProductId(Integer productId){
        return inventoryDao.getProductByProductId(productId);
    }
    @Override
    protected Dao<Integer, Inventory> getDao() {
        return inventoryDao;
    }

    public List<Inventory> getInventoryByProductId(Integer productId)
    {
        return inventoryDao.getInventoryByProductId(productId);
    }
    public  Integer getProductCountForInventory(){
        return inventoryDao.getProductCountForInventory();
    }
    public Integer totalStockOnHand(){
        return inventoryDao.totalStockOnHand();
    }
    public Integer getlowStockProductCountForInventory(){
        return inventoryDao.getlowStockProductCountForInventory();
    }
    public List<Product> getlowStockProductListForInventory(){
        return inventoryDao.getlowStockProductListForInventory();
    }
    public  List<InventoryListModel> getTopSellingProductListForInventory(){
        return inventoryDao.getTopSellingProductListForInventory();
    }
    public  Inventory getInventoryByProductIdAndSupplierId(Integer productId,Integer supplierId){
        return inventoryDao.getInventoryByProductIdAndSupplierId(productId,supplierId);
    }
    public Integer getOutOfStockCountOfInventory(){
        return inventoryDao.getOutOfStockCountOfInventory();
    }
    public BigDecimal getTotalInventoryValue(){
        return inventoryDao.getTotalInventoryValue();
    }
    public  Integer getTotalInventoryCountForContact(int contactId){
        return inventoryDao.getTotalInventoryCountForContact(contactId);
    }
}
