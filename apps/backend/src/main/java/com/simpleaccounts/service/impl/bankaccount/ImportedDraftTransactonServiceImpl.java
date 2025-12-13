package com.simpleaccounts.service.impl.bankaccount;

import java.util.List;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.simpleaccounts.criteria.bankaccount.ImportedDraftTransactionCriteria;
import com.simpleaccounts.criteria.bankaccount.ImportedDraftTransactionFilter;
import com.simpleaccounts.dao.bankaccount.ImportedDraftTransactonDao;
import com.simpleaccounts.entity.bankaccount.ImportedDraftTransaction;
import com.simpleaccounts.service.bankaccount.ImportedDraftTransactonService;

@Service("importedDraftTransactonService")
@Transactional(propagation=Propagation.REQUIRED, rollbackFor=Exception.class)
@RequiredArgsConstructor
public class ImportedDraftTransactonServiceImpl extends
		ImportedDraftTransactonService {
	
	private final ImportedDraftTransactonDao importedDraftTransactonDao;

	@Override
	public List<ImportedDraftTransaction> getImportedDraftTransactionsByCriteria(
			ImportedDraftTransactionCriteria importedDraftTransactonCriteria)
			throws Exception {
		ImportedDraftTransactionFilter filter = new ImportedDraftTransactionFilter(importedDraftTransactonCriteria);
		return importedDraftTransactonDao.filter(filter);
	}

	@Override
	public ImportedDraftTransaction updateOrCreateImportedDraftTransaction(
			ImportedDraftTransaction importedDraftTransacton) {
		return importedDraftTransactonDao.updateOrCreateImportedDraftTransaction(importedDraftTransacton);
	}

	@Override
	public boolean deleteImportedDraftTransaction(Integer bankAcccountId) {
		return importedDraftTransactonDao.deleteImportedDraftTransaction(bankAcccountId);
	}

	@Override
	public ImportedDraftTransactonDao getDao() {
		return this.importedDraftTransactonDao;
	}

}
