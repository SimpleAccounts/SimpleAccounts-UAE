package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.ReconcileCategoryDao;
import com.simpleaccounts.entity.bankaccount.ReconcileCategory;
import java.util.List;
import javax.persistence.Query;
import org.springframework.stereotype.Repository;

@Repository
public class ReconcileCategoryDaoImpl extends AbstractDao<Integer, ReconcileCategory> implements ReconcileCategoryDao {

	@Override
	public List<ReconcileCategory> findByType(String reconcileCategotyCode) {
		Query query = getEntityManager().createNamedQuery("allReconcileCategoryByparentReconcileCategoryId");
		query.setParameter("code", Integer.valueOf(reconcileCategotyCode));
		return query.getResultList();
	}

}
