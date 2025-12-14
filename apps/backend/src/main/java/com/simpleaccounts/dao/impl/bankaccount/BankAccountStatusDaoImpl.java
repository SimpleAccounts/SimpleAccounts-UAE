package com.simpleaccounts.dao.impl.bankaccount;

import com.simpleaccounts.dao.bankaccount.BankAccountStatusDao;
import com.simpleaccounts.entity.bankaccount.BankAccountStatus;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

@Repository
public class BankAccountStatusDaoImpl implements BankAccountStatusDao {

	@PersistenceContext
	private EntityManager entityManager;

	@Override
	public List<BankAccountStatus> getBankAccountStatuses() {
		return entityManager
				.createNamedQuery("allBankAccountStatuses", BankAccountStatus.class).getResultList();
	}

	@Override
	public BankAccountStatus getBankAccountStatus(Integer id) {
		return entityManager.find(BankAccountStatus.class, id);
	}

	@Override
	public BankAccountStatus getBankAccountStatusByName(String status) {

		List<BankAccountStatus> bankAccounStatus = entityManager
				.createNamedQuery("findBankAccountStatusByName", BankAccountStatus.class).setParameter("status", status)
				.getResultList();
		return bankAccounStatus != null && !bankAccounStatus.isEmpty() ? bankAccounStatus.get(0) : null;
	}

}
