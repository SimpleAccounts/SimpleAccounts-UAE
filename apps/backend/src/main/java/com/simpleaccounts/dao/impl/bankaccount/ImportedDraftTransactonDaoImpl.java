package com.simpleaccounts.dao.impl.bankaccount;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.bankaccount.ImportedDraftTransactonDao;
import com.simpleaccounts.entity.bankaccount.ImportedDraftTransaction;
import javax.persistence.Query;
import org.springframework.stereotype.Repository;

@Repository
public class ImportedDraftTransactonDaoImpl extends AbstractDao<Integer, ImportedDraftTransaction> implements ImportedDraftTransactonDao {

	@Override
	public ImportedDraftTransaction updateOrCreateImportedDraftTransaction(ImportedDraftTransaction importedDraftTransacton) {
		 return this.update(importedDraftTransacton);
	}

	@Override
	public boolean deleteImportedDraftTransaction(Integer bankAcccountId) {
		Query updateQuery = getEntityManager().createNativeQuery("UPDATE IMPORTED_DRAFT_TRANSACTON idt SET idt.DELETE_FLAG=1 WHERE idt.BANK_ACCOUNT_ID= :bankAccountId");
		updateQuery.setParameter("bankAccountId", bankAcccountId);
		updateQuery.executeUpdate();
		
		return true;
	}

}
