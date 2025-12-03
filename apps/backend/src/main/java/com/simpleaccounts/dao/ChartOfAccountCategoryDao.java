package com.simpleaccounts.dao;

import java.util.List;

import com.simpleaccounts.entity.ChartOfAccountCategory;

public interface ChartOfAccountCategoryDao extends Dao<Integer, ChartOfAccountCategory> {

	public List<ChartOfAccountCategory> getChartOfAccountCategoryList();

}
