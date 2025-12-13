package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.ChartOfAccountCategoryDao;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.ChartOfAccountCategory;
import com.simpleaccounts.service.ChartOfAccountCategoryService;
import java.util.List;
import javax.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
