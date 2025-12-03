package com.simpleaccounts.dao.bankaccount;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.bankaccount.ImportedDraftTransaction;

public interface ImportedDraftTransactonDao extends Dao<Integer, ImportedDraftTransaction> {

	 ImportedDraftTransaction updateOrCreateImportedDraftTransaction(ImportedDraftTransaction ismportedDraftTransacton);
	 
	 boolean deleteImportedDraftTransaction(Integer bankAcccountId);
	    
}
