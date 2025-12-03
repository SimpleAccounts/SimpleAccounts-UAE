package com.simpleaccounts.dao.impl;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.ChartOfAccountCategoryDao;
import com.simpleaccounts.entity.ChartOfAccountCategory;

@Repository
public class ChartOfAccountCategoryDaoImpl extends AbstractDao<Integer, ChartOfAccountCategory>
		implements ChartOfAccountCategoryDao {

	@Override
	public List<ChartOfAccountCategory> getChartOfAccountCategoryList() {
		return this.executeNamedQuery("allChartOfAccountCategory");
	}

}
