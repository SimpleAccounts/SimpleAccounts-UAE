package com.simpleaccounts.service.impl;

import java.util.List;
import lombok.RequiredArgsConstructor;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.ReconcileCategoryDao;
import com.simpleaccounts.entity.bankaccount.ReconcileCategory;
import com.simpleaccounts.service.ReconcileCategoryService;

@Transactional
@Service
@RequiredArgsConstructor
public class ReconcileCategoryServiceImpl extends ReconcileCategoryService {

	private final ReconcileCategoryDao reconcileCategoryDao;

	@Override
	protected Dao<Integer, ReconcileCategory> getDao() {
		return reconcileCategoryDao;
	}

	@Override
	public List<ReconcileCategory> findByType(String reconcileCategotyCode) {
		return reconcileCategoryDao.findByType(reconcileCategotyCode);
	}

}
