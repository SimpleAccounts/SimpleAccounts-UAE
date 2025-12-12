package com.simpleaccounts.dao.impl;

import java.util.List;

import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.DetachedCriteria;

import org.hibernate.criterion.Restrictions;
import org.springframework.stereotype.Repository;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.TransactionExpensesDao;

import com.simpleaccounts.entity.TransactionExpenses;

@Repository
public class TransactionExpensesDaoImpl extends AbstractDao<Integer, TransactionExpenses>
		implements TransactionExpensesDao {

	@Override
	public List<TransactionExpenses> getMappedExpenses(Integer transactionId) {
		org.hibernate.Session session = (Session) getEntityManager().getDelegate();
		Criteria criteria = DetachedCriteria.forClass(TransactionExpenses.class).getExecutableCriteria(session);
		if (transactionId != null) {
			criteria.createAlias("transaction", "tr");
			criteria.add(Restrictions.eq("tr.transactionId", transactionId));
		}

		return criteria.list();
	}

}
