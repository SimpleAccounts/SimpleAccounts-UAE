package com.simpleaccounts.service.impl;

import java.util.List;
import lombok.RequiredArgsConstructor;

import javax.transaction.Transactional;

import org.springframework.stereotype.Service;

import com.simpleaccounts.dao.ChartOfAccountCategoryDao;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.ChartOfAccountCategory;
import com.simpleaccounts.service.ChartOfAccountCategoryService;

@Service
@Transactional
@RequiredArgsConstructor
public class ChartOfAccountCategoryServiceImpl extends ChartOfAccountCategoryService {

	private final ChartOfAccountCategoryDao dao;

	@Override
	protected Dao<Integer, ChartOfAccountCategory> getDao() {
		return dao;
	}

	@Override

	public ChartOfAccountCategory findByPK(Integer chartOfAccountCategoryId) {
		return dao.findByPK(chartOfAccountCategoryId);
	}

	@Override

    public List<ChartOfAccountCategory> findAll() {
		return  dao.getChartOfAccountCategoryList();
	}
}
