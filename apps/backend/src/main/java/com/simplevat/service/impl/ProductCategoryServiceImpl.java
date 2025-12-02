package com.simplevat.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.simplevat.constant.dbfilter.DbFilter;
import com.simplevat.constant.dbfilter.ProductCategoryFilterEnum;
import com.simplevat.dao.Dao;
import com.simplevat.dao.ProductCategoryDao;
import com.simplevat.entity.Activity;
import com.simplevat.entity.ProductCategory;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.service.ProductCategoryService;

@Service("ProductCategoryService")
public class ProductCategoryServiceImpl extends ProductCategoryService {

	private static final String PRODUCT_CATEGORY = "PRODUCT_CATEGORY";

	@Autowired
	private ProductCategoryDao productCategoryDao;
	@Autowired
	private CacheManager cacheManager;

	@Override
	public List<ProductCategory> findAllProductCategoryByUserId(Integer userId, boolean isDeleted) {
		Map<String, Object> parameterDataMap = new HashMap<>();
		parameterDataMap.put("createdBy", userId);

		List<DbFilter> filterList = new ArrayList<>();
		filterList.add(DbFilter.builder().dbCoulmnName("createdBy").condition(" = :createdBy").value(userId).build());
		filterList.add(
				DbFilter.builder().dbCoulmnName("deleteFlag").condition(" = :deleteFlag").value(isDeleted).build());

		return getDao().executeQuery(filterList);
	}

	@Override
	protected Dao<Integer, ProductCategory> getDao() {
		return productCategoryDao;
	}
	@Override
	public void persist(ProductCategory productCategory) {
		super.persist(productCategory, null, getActivity(productCategory, "CREATED"));
	}
	@Override
	public ProductCategory update(ProductCategory productCategory) {
		ProductCategory productCategoryUpdated =  super.update(productCategory, null, getActivity(productCategory, "UPDATED"));
		deleteFromCache(Collections.singletonList(productCategoryUpdated.getId()));
		return productCategoryUpdated;
	}

	private Activity getActivity(ProductCategory productCategory, String activityCode) {
		Activity activity = new Activity();
		activity.setActivityCode(activityCode);
		activity.setModuleCode(PRODUCT_CATEGORY);
		activity.setField3("Transaction Category " + activityCode.charAt(0)
				+ activityCode.substring(1, activityCode.length()).toLowerCase());
		activity.setField1(productCategory.getProductCategoryCode());
		activity.setField2(productCategory.getProductCategoryName());
		activity.setLastUpdateDate(LocalDateTime.now());
		activity.setLoggingRequired(true);
		return activity;
	}

	@Override
	public void deleteByIds(ArrayList<Integer> ids) {
		productCategoryDao.deleteByIds(ids);
		deleteFromCache(ids);
	}

	private void deleteFromCache(List<Integer> ids) {
		Cache productCache = cacheManager.getCache("productCategoryCache");
		for (Integer id : ids ) {
			productCache.evict(id);
		}
	}

	@Override
	public PaginationResponseModel getProductCategoryList(Map<ProductCategoryFilterEnum, Object> filterList,PaginationModel paginationModel){
		return productCategoryDao.getProductCategoryList(filterList,paginationModel);
			
	}
	@Override
	@Cacheable(cacheNames = "productCategoryCache", key = "#categoryId")
	public ProductCategory findByPK(Integer categoryId) {
		return productCategoryDao.findByPK(categoryId);
	}
}
