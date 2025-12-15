package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.TransactionExpensesDao;
import com.simpleaccounts.entity.TransactionExpenses;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Root;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public class TransactionExpensesDaoImpl extends AbstractDao<Integer, TransactionExpenses>
		implements TransactionExpensesDao {

	@Override
	public List<TransactionExpenses> getMappedExpenses(Integer transactionId) {
		CriteriaBuilder cb = getEntityManager().getCriteriaBuilder();
		CriteriaQuery<TransactionExpenses> query = cb.createQuery(TransactionExpenses.class);
		Root<TransactionExpenses> root = query.from(TransactionExpenses.class);

		if (transactionId != null) {
			Join<Object, Object> transactionJoin = root.join("transaction");
			query.where(cb.equal(transactionJoin.get("transactionId"), transactionId));
		}

		return getEntityManager().createQuery(query).getResultList();
	}

}
