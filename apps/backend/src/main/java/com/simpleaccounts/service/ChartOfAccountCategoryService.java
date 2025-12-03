package com.simpleaccounts.service;

import java.util.List;

import com.simpleaccounts.entity.ChartOfAccountCategory;

public abstract class ChartOfAccountCategoryService extends SimpleAccountsService<Integer, ChartOfAccountCategory> {

	public abstract List<ChartOfAccountCategory> findAll();
}
