package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.ProductWarehouseDao;
import com.simpleaccounts.entity.ProductWarehouse;
import java.util.ArrayList;
import java.util.List;
import javax.persistence.TypedQuery;
import org.springframework.stereotype.Repository;

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
