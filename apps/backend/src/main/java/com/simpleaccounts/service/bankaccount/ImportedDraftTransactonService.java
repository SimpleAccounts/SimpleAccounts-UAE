package com.simpleaccounts.service.bankaccount;

import java.util.List;

import com.simpleaccounts.criteria.bankaccount.ImportedDraftTransactionCriteria;
import com.simpleaccounts.entity.bankaccount.ImportedDraftTransaction;
import com.simpleaccounts.service.SimpleAccountsService;

public abstract class ImportedDraftTransactonService extends SimpleAccountsService<Integer, ImportedDraftTransaction> {
	
	public abstract List<ImportedDraftTransaction> getImportedDraftTransactionsByCriteria(ImportedDraftTransactionCriteria importedDraftTransactonCriteria) throws Exception;

	public abstract ImportedDraftTransaction updateOrCreateImportedDraftTransaction(ImportedDraftTransaction importedDraftTransacton);
	 
	public abstract boolean deleteImportedDraftTransaction(Integer bankAcccountId);

}
