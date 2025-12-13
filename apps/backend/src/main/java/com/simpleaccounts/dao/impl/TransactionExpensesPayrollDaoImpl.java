package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.TransactionExpensesPayrollDao;
import com.simpleaccounts.entity.TransactionExpensesPayroll;
import java.util.List;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.DetachedCriteria;
import org.hibernate.criterion.Restrictions;
import org.springframework.stereotype.Repository;

@Repository
public class TransactionExpensesPayrollDaoImpl extends AbstractDao<Integer, TransactionExpensesPayroll>
        implements TransactionExpensesPayrollDao {

    @Override
    public List<TransactionExpensesPayroll> getMappedExpenses(Integer transactionId) {
        org.hibernate.Session session = (Session) getEntityManager().getDelegate();
        Criteria criteria = DetachedCriteria.forClass(TransactionExpensesPayroll.class).getExecutableCriteria(session);
        if (transactionId != null) {
            criteria.createAlias("transaction", "tr");
            criteria.add(Restrictions.eq("tr.transactionId", transactionId));
        }

        return criteria.list();
    }

}
