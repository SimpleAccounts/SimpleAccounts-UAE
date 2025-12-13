package com.simpleaccounts.service.impl;

import java.util.ArrayList;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;

import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

import org.springframework.stereotype.Service;

import com.simpleaccounts.constant.dbfilter.VatCategoryFilterEnum;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.VatCategoryDao;
import com.simpleaccounts.entity.Activity;
import com.simpleaccounts.entity.VatCategory;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.VatCategoryService;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

@Service("vatCategoryService")

@RequiredArgsConstructor
public class VatCategoryServiceImpl extends VatCategoryService {

	private final VatCategoryDao vatCategoryDao;

	private final CacheManager cacheManager;

	private static final String VAT_CATEGORY = "VAT_CATEGORY";

	public List<VatCategory> getVatCategoryList() {
		return vatCategoryDao.getVatCategoryList();
	}

	@Override

	public List<VatCategory> getVatCategorys(String name) {
		return vatCategoryDao.getVatCategorys(name);
	}

	@Override
	protected Dao<Integer, VatCategory> getDao() {
		return vatCategoryDao;
	}

	@Override

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
