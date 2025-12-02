package com.simplevat.dao.impl;

import org.springframework.stereotype.Repository;
import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.ProductWarehouseDao;
import com.simplevat.entity.ProductWarehouse;

import java.util.ArrayList;
import java.util.List;
import javax.persistence.TypedQuery;

@Repository
public class ProductWarehouseDaoImpl extends AbstractDao<Integer, ProductWarehouse> implements ProductWarehouseDao {

	@Override
	public List<ProductWarehouse> getProductWarehouseList() {
		TypedQuery<ProductWarehouse> query = getEntityManager().createNamedQuery("allProductWarehouse",
				ProductWarehouse.class);
		List<ProductWarehouse> productWarehouseList = query.getResultList();
		if (productWarehouseList != null && !productWarehouseList.isEmpty()) {
			return productWarehouseList;
		}
		return new ArrayList<>();
	}

}
