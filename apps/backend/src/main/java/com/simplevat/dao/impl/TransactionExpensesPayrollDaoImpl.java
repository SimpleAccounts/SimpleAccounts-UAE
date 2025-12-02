package com.simplevat.dao.impl;

import com.simplevat.dao.*;
import com.simplevat.entity.TransactionExpenses;
import com.simplevat.entity.TransactionExpensesPayroll;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.DetachedCriteria;
import org.hibernate.criterion.Restrictions;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;



        import java.util.List;

        import javax.transaction.Transactional;

        import org.hibernate.Criteria;
        import org.hibernate.Session;
        import org.hibernate.criterion.DetachedCriteria;
        import org.hibernate.criterion.Projection;
        import org.hibernate.criterion.Projections;
        import org.hibernate.criterion.Restrictions;
        import org.springframework.stereotype.Repository;

        import com.simplevat.dao.AbstractDao;
        import com.simplevat.dao.TransactionExpensesDao;
        import com.simplevat.entity.Expense;
        import com.simplevat.entity.TransactionExpenses;

@Repository
@Transactional
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
//		Projection projection = Projections.property("expense");
//		criteria.setProjection(projection);
        return criteria.list();
    }

}
