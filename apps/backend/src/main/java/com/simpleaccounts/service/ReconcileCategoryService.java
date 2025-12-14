package com.simpleaccounts.service;

import com.simpleaccounts.entity.bankaccount.ReconcileCategory;
import java.util.List;

public abstract class ReconcileCategoryService extends SimpleAccountsService<Integer, ReconcileCategory> {

	public abstract List<ReconcileCategory> findByType(String reconcileCategotyCode);

}
