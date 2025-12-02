package com.simplevat.dao.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.simplevat.constant.DatatableSortingFilterConstant;
import com.simplevat.constant.dbfilter.DbFilter;
import com.simplevat.constant.dbfilter.ProductCategoryFilterEnum;
import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.ProductCategoryDao;
import com.simplevat.entity.ProductCategory;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

@Transactional
@Repository
public class ProductCategoryDaoImpl extends AbstractDao<Integer, ProductCategory> implements ProductCategoryDao {
	@Autowired
	private DatatableSortingFilterConstant dataTableUtil;

	@Override
	public PaginationResponseModel getProductCategoryList(Map<ProductCategoryFilterEnum, Object> filterMap,
			PaginationModel paginationModel) {
		List<DbFilter> dbFilters = new ArrayList<>();
		filterMap.forEach((productCategoryFilter, value) -> dbFilters
				.add(DbFilter.builder().dbCoulmnName(productCategoryFilter.getDbColumnName())
						.condition(productCategoryFilter.getCondition()).value(value).build()));
		paginationModel.setSortingCol(dataTableUtil.getColName(paginationModel.getSortingCol(), DatatableSortingFilterConstant.PRODUCT_CATEGORY));
		return new PaginationResponseModel(this.getResultCount(dbFilters),
				this.executeQuery(dbFilters, paginationModel));
	}

	@Override
	public void deleteByIds(List<Integer> ids) {
		if (ids != null && !ids.isEmpty()) {
			for (Integer id : ids) {
				ProductCategory productCategory = findByPK(id);
				productCategory.setDeleteFlag(Boolean.TRUE);
				update(productCategory);
			}
		}
	}

}
