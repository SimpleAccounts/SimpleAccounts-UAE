package com.simpleaccounts.dao.impl;

import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.constant.dbfilter.ProductFilterEnum;
import java.util.List;

import org.springframework.stereotype.Repository;
import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.ProductDao;
import com.simpleaccounts.entity.Product;
import com.simpleaccounts.entity.ProductLineItem;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;

import java.util.ArrayList;
import java.util.Map;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.Query;

@Repository
@RequiredArgsConstructor
public class ProductDaoImpl extends AbstractDao<Integer, Product> implements ProductDao {
	private final DatatableSortingFilterConstant dataTableUtil;

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
