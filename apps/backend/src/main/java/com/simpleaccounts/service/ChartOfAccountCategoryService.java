package com.simpleaccounts.service;

import com.simpleaccounts.entity.ChartOfAccountCategory;
import java.util.List;

public abstract class ChartOfAccountCategoryService extends SimpleAccountsService<Integer, ChartOfAccountCategory> {

	public abstract List<ChartOfAccountCategory> findAll();
}
