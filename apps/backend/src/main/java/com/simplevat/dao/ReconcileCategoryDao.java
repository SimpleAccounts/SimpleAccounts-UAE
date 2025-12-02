package com.simplevat.dao;

import java.util.List;

import com.simplevat.entity.bankaccount.ReconcileCategory;

public interface ReconcileCategoryDao extends Dao<Integer, ReconcileCategory> {

	public List<ReconcileCategory> findByType(String reconcileCategotyCode);
}
