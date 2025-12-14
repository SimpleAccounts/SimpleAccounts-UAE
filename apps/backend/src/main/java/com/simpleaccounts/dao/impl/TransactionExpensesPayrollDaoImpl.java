package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.TransactionExpensesPayrollDao;
import com.simpleaccounts.entity.TransactionExpensesPayroll;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Root;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public class TransactionExpensesPayrollDaoImpl extends AbstractDao<Integer, TransactionExpensesPayroll>
        implements TransactionExpensesPayrollDao {

    @Override
    public List<TransactionExpensesPayroll> getMappedExpenses(Integer transactionId) {
        CriteriaBuilder cb = getEntityManager().getCriteriaBuilder();
        CriteriaQuery<TransactionExpensesPayroll> query = cb.createQuery(TransactionExpensesPayroll.class);
        Root<TransactionExpensesPayroll> root = query.from(TransactionExpensesPayroll.class);

        if (transactionId != null) {
            Join<Object, Object> transactionJoin = root.join("transaction");
            query.where(cb.equal(transactionJoin.get("transactionId"), transactionId));
        }

        return getEntityManager().createQuery(query).getResultList();
    }

}
