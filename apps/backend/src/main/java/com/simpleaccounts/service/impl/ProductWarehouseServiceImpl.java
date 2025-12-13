package com.simpleaccounts.service.impl;

import java.util.List;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.ProductWarehouseDao;
import com.simpleaccounts.entity.ProductWarehouse;
import com.simpleaccounts.service.ProductWarehouseService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Created by Utkarsh Bhavsar on 21/03/17.
 */
@Service("warehouseService")

@RequiredArgsConstructor
public class ProductWarehouseServiceImpl extends ProductWarehouseService {

    private final ProductWarehouseDao productWarehouseDao;

    @Override
    protected Dao<Integer, ProductWarehouse> getDao() {
        return productWarehouseDao;
    }

    @Override
    public List<ProductWarehouse> getProductWarehouseList() {
        return productWarehouseDao.getProductWarehouseList();
    }
}
