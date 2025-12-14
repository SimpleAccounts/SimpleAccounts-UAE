package com.simpleaccounts.dao;

import com.simpleaccounts.entity.bankaccount.ReconcileCategory;
import java.util.List;

public interface ReconcileCategoryDao extends Dao<Integer, ReconcileCategory> {

	public List<ReconcileCategory> findByType(String reconcileCategotyCode);
}
