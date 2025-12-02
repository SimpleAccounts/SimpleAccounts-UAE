package com.simplevat.dao;

import java.util.List;

import com.simplevat.entity.ChartOfAccountCategory;

public interface ChartOfAccountCategoryDao extends Dao<Integer, ChartOfAccountCategory> {

	public List<ChartOfAccountCategory> getChartOfAccountCategoryList();

}
