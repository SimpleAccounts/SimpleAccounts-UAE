package com.simpleaccounts.service;

import java.util.List;

import com.simpleaccounts.entity.bankaccount.ReconcileCategory;

public abstract class ReconcileCategoryService extends SimpleAccountsService<Integer, ReconcileCategory> {

	public abstract List<ReconcileCategory> findByType(String reconcileCategotyCode);

}
