package com.simplevat.dao.impl;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.ChartOfAccountCategoryDao;
import com.simplevat.entity.ChartOfAccountCategory;

@Repository
public class ChartOfAccountCategoryDaoImpl extends AbstractDao<Integer, ChartOfAccountCategory>
		implements ChartOfAccountCategoryDao {

	@Override
	public List<ChartOfAccountCategory> getChartOfAccountCategoryList() {
		return this.executeNamedQuery("allChartOfAccountCategory");
	}

}
