package com.simplevat.dao.impl;

import com.simplevat.constant.DatatableSortingFilterConstant;
import com.simplevat.constant.dbfilter.DbFilter;
import com.simplevat.constant.dbfilter.ProductFilterEnum;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.ProductDao;
import com.simplevat.entity.Product;
import com.simplevat.entity.ProductLineItem;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

import java.util.ArrayList;
import java.util.Map;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.Query;

@Repository
public class ProductDaoImpl extends AbstractDao<Integer, Product> implements ProductDao {
	@Autowired
	private DatatableSortingFilterConstant dataTableUtil;

	@Override
	public PaginationResponseModel getProductList(Map<ProductFilterEnum, Object> filterMap,
			PaginationModel paginationModel) {
		List<DbFilter> dbFilters = new ArrayList<>();
		filterMap.forEach(
				(productFilter, value) -> dbFilters.add(DbFilter.builder().dbCoulmnName(productFilter.getDbColumnName())
						.condition(productFilter.getCondition()).value(value).build()));
		if (paginationModel != null)
			paginationModel.setSortingCol(
					dataTableUtil.getColName(paginationModel.getSortingCol(), DatatableSortingFilterConstant.PRODUCT));
		Integer count =this.getResultCount(dbFilters);
		//To solve pagination issue for search , reset the page No. to 0
		if(count<10 && paginationModel != null) paginationModel.setPageNo(0);
		return new PaginationResponseModel(count,
				this.executeQuery(dbFilters, paginationModel));
	}

	@Override
	@Transactional
	public void deleteByIds(List<Integer> ids) {
		if (ids != null && !ids.isEmpty()) {
			for (Integer id : ids) {
				Product product = findByPK(id);
				product.setDeleteFlag(Boolean.TRUE);
				for (ProductLineItem lineItem : product.getLineItemList())
					lineItem.setDeleteFlag(Boolean.TRUE);
				update(product);
			}
		}
	}
	@Override
	public Integer getTotalProductCountByVatId(Integer vatId){
		Query query = getEntityManager().createQuery(
				"SELECT COUNT(p) FROM Product p WHERE p.vatCategory.id =:vatId AND p.deleteFlag=false" );
		query.setParameter("vatId",vatId);
		List<Object> countList = query.getResultList();
		if (countList != null && !countList.isEmpty()) {
			return ((Long) countList.get(0)).intValue();
		}
		return null;
	}
}
