package com.simplevat.dao.bankaccount;

import com.simplevat.dao.Dao;
import com.simplevat.entity.bankaccount.ImportedDraftTransaction;

public interface ImportedDraftTransactonDao extends Dao<Integer, ImportedDraftTransaction> {

	 ImportedDraftTransaction updateOrCreateImportedDraftTransaction(ImportedDraftTransaction ismportedDraftTransacton);
	 
	 boolean deleteImportedDraftTransaction(Integer bankAcccountId);
	    
}
