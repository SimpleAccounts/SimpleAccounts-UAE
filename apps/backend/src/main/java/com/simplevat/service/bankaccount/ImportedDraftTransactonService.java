package com.simplevat.service.bankaccount;

import java.util.List;

import com.simplevat.criteria.bankaccount.ImportedDraftTransactionCriteria;
import com.simplevat.entity.bankaccount.ImportedDraftTransaction;
import com.simplevat.service.SimpleVatService;

public abstract class ImportedDraftTransactonService extends SimpleVatService<Integer, ImportedDraftTransaction> {
	
	public abstract List<ImportedDraftTransaction> getImportedDraftTransactionsByCriteria(ImportedDraftTransactionCriteria importedDraftTransactonCriteria) throws Exception;

	public abstract ImportedDraftTransaction updateOrCreateImportedDraftTransaction(ImportedDraftTransaction importedDraftTransacton);
	 
	public abstract boolean deleteImportedDraftTransaction(Integer bankAcccountId);

}
