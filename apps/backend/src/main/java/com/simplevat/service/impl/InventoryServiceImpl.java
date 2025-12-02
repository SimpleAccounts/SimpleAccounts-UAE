package com.simplevat.service.impl;

import com.simplevat.constant.dbfilter.InventoryFilterEnum;
import com.simplevat.dao.Dao;
import com.simplevat.dao.InventoryDao;
import com.simplevat.entity.Inventory;
import com.simplevat.entity.Product;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.rest.productcontroller.InventoryListModel;
import com.simplevat.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;


@Service("InventoryService")
public  class InventoryServiceImpl extends InventoryService {

    @Autowired
    InventoryDao inventoryDao;

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
