/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.dao;

import com.simplevat.entity.ProductWarehouse;
import java.util.List;

/**
 *
 * @author daynil
 */
public interface ProductWarehouseDao extends Dao<Integer, ProductWarehouse> {
     public List<ProductWarehouse> getProductWarehouseList();

}
