package com.simpleaccounts.dao;

import com.simpleaccounts.entity.ChartOfAccountCategory;
import java.util.List;

public interface ChartOfAccountCategoryDao extends Dao<Integer, ChartOfAccountCategory> {

	public List<ChartOfAccountCategory> getChartOfAccountCategoryList();

}
