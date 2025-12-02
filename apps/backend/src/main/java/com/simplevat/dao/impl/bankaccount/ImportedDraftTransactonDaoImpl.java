package com.simplevat.dao.impl.bankaccount;


import javax.persistence.Query;
import org.springframework.stereotype.Repository;

import com.simplevat.dao.bankaccount.ImportedDraftTransactonDao;
import com.simplevat.dao.AbstractDao;
import com.simplevat.entity.bankaccount.ImportedDraftTransaction;

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
