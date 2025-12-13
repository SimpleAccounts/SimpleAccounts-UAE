package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.ReconcileCategoryDao;
import com.simpleaccounts.entity.bankaccount.ReconcileCategory;
import com.simpleaccounts.service.ReconcileCategoryService;
import java.util.List;
import javax.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
