package com.simplevat.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.simplevat.dao.Dao;
import com.simplevat.dao.ProductWarehouseDao;
import com.simplevat.entity.ProductWarehouse;
import com.simplevat.service.ProductWarehouseService;

/**
 * Created by Utkarsh Bhavsar on 21/03/17.
 */
@Service("warehouseService")

public class ProductWarehouseServiceImpl extends ProductWarehouseService {

    @Autowired
    private ProductWarehouseDao productWarehouseDao;

    @Override
    protected Dao<Integer, ProductWarehouse> getDao() {
        return productWarehouseDao;
    }

    @Override
    public List<ProductWarehouse> getProductWarehouseList() {
        return productWarehouseDao.getProductWarehouseList();
    }
}
