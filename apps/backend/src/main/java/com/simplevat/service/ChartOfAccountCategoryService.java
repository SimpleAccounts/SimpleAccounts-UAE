package com.simplevat.service;

import java.util.List;

import com.simplevat.entity.ChartOfAccountCategory;

public abstract class ChartOfAccountCategoryService extends SimpleVatService<Integer, ChartOfAccountCategory> {

	public abstract List<ChartOfAccountCategory> findAll();
}
