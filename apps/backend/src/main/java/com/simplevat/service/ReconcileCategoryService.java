package com.simplevat.service;

import java.util.List;

import com.simplevat.entity.bankaccount.ReconcileCategory;

public abstract class ReconcileCategoryService extends SimpleVatService<Integer, ReconcileCategory> {

	public abstract List<ReconcileCategory> findByType(String reconcileCategotyCode);

}
