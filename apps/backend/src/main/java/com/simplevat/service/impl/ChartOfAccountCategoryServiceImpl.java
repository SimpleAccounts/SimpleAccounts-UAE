package com.simplevat.service.impl;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.simplevat.dao.ChartOfAccountCategoryDao;
import com.simplevat.dao.Dao;
import com.simplevat.entity.ChartOfAccountCategory;
import com.simplevat.service.ChartOfAccountCategoryService;

@Service
@Transactional
public class ChartOfAccountCategoryServiceImpl extends ChartOfAccountCategoryService {

	@Autowired
	private ChartOfAccountCategoryDao dao;

	@Override
	protected Dao<Integer, ChartOfAccountCategory> getDao() {
		return dao;
	}

	@Override
//	@Cacheable(cacheNames = "chartOfAccountCategoryCache", key = "#chartOfAccountCategoryId")
	public ChartOfAccountCategory findByPK(Integer chartOfAccountCategoryId) {
		return dao.findByPK(chartOfAccountCategoryId);
	}

	@Override
//	@Cacheable(cacheNames = "chartOfAccountCategoryListCache", key = "'chartOfAccountCategoryList'")
    public List<ChartOfAccountCategory> findAll() {
		return  dao.getChartOfAccountCategoryList();
	}
}
