package com.simpleaccounts.dao.bankaccount;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.entity.TransactionStatus;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository(value = "transactionStatusDao")
public class TransactionStatusDaoImpl extends AbstractDao<Integer, TransactionStatus> implements TransactionStatusDao {

	@Override
	public List<TransactionStatus> findAllTransactionStatues() {
		return this.executeNamedQuery("findAllTransactionStatues");
	}

	@Override
	public List<TransactionStatus> findAllTransactionStatuesByTrnxId(Integer transactionId) {
		return getEntityManager().createNamedQuery("findAllTransactionStatuesByTrnxId")
				.setParameter("transactionId", transactionId).getResultList();
	}
}
