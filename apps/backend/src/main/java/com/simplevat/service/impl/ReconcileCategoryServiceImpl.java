package com.simplevat.service.impl;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.simplevat.dao.Dao;
import com.simplevat.dao.ReconcileCategoryDao;
import com.simplevat.entity.bankaccount.ReconcileCategory;
import com.simplevat.service.ReconcileCategoryService;

@Transactional
@Service
public class ReconcileCategoryServiceImpl extends ReconcileCategoryService {

	@Autowired
	private ReconcileCategoryDao reconcileCategoryDao;

	@Override
	protected Dao<Integer, ReconcileCategory> getDao() {
		return reconcileCategoryDao;
	}

	@Override
	public List<ReconcileCategory> findByType(String reconcileCategotyCode) {
		return reconcileCategoryDao.findByType(reconcileCategotyCode);
	}

}
