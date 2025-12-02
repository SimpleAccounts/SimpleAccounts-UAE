package com.simplevat.service.impl;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.simplevat.constant.dbfilter.VatCategoryFilterEnum;
import com.simplevat.dao.Dao;
import com.simplevat.dao.VatCategoryDao;
import com.simplevat.entity.Activity;
import com.simplevat.entity.VatCategory;
import com.simplevat.rest.DropdownModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.service.VatCategoryService;
import java.time.LocalDateTime;

@Service("vatCategoryService")

public class VatCategoryServiceImpl extends VatCategoryService {

	@Autowired
	private VatCategoryDao vatCategoryDao;

	@Autowired
	private CacheManager cacheManager;

	private static final String VAT_CATEGORY = "VAT_CATEGORY";

	public List<VatCategory> getVatCategoryList() {
		return vatCategoryDao.getVatCategoryList();
	}

	@Override
	//@Cacheable(cacheNames = "vatCategoryCache", key = "#name")
	public List<VatCategory> getVatCategorys(String name) {
		return vatCategoryDao.getVatCategorys(name);
	}

	@Override
	protected Dao<Integer, VatCategory> getDao() {
		return vatCategoryDao;
	}

	@Override
//	@Cacheable(cacheNames = "vatCategoryCache", key = "'default'")
	public VatCategory getDefaultVatCategory() {
		return vatCategoryDao.getDefaultVatCategory();
	}

	@Override
	public void persist(VatCategory vatCategory) {
		super.persist(vatCategory, null, getActivity(vatCategory, "CREATED"));
	}
	@Override
	public VatCategory update(VatCategory vatCategory) {
		VatCategory vatCategoryUpdated =  super.update(vatCategory, null, getActivity(vatCategory, "UPDATED"));
		//deleteFromCache(Collections.singletonList(vatCategoryUpdated.getId()));
		return vatCategoryUpdated;
	}

	private Activity getActivity(VatCategory vatCategory, String activityCode) {
		Activity activity = new Activity();
		activity.setActivityCode(activityCode);
		activity.setModuleCode(VAT_CATEGORY);
		activity.setField3("Vat Category" + activityCode.charAt(0)
				+ activityCode.substring(1, activityCode.length()).toLowerCase());
		activity.setField1(vatCategory.getVat().toString());
		activity.setField2(vatCategory.getName());
		activity.setLastUpdateDate(LocalDateTime.now());
		activity.setLoggingRequired(true);
		return activity;
	}

	@Override
	public void deleteByIds(List<Integer> ids) {
		vatCategoryDao.deleteByIds(ids);
		//deleteFromCache(ids);
	}

	@Override
	public PaginationResponseModel getVatCategoryList(Map<VatCategoryFilterEnum, Object> filterDataMap,
			PaginationModel pagiantionModel) {
		return vatCategoryDao.getVatCategoryList(filterDataMap, pagiantionModel);
	}

	@Override
	public List<DropdownModel> getVatCategoryForDropDown() {
		List<VatCategory> list = vatCategoryDao.getVatCategoryList();

		List<DropdownModel> modelList = new ArrayList<>();
		for (VatCategory vat : list) {
			modelList.add(new DropdownModel(vat.getId(), vat.getVatLabel()));
		}
		return modelList;
	}

	@Override
	//@Cacheable(cacheNames = "vatCategoryCache", key = "#id")
	public VatCategory findByPK(Integer id) {
		return vatCategoryDao.findByPK(id);
	}
	private void deleteFromCache(List<Integer> ids) {
		Cache vatCategoryCache = cacheManager.getCache("vatCategoryCache");
		for (Integer id : ids ) {
			vatCategoryCache.evict(id);
		}
	}
}
