package com.simpleaccounts.service.impl;

import com.simpleaccounts.constant.dbfilter.TransactionParsingSettingFilterEnum;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.TransactionParsingSettingDao;
import com.simpleaccounts.entity.TransactionParsingSetting;
import com.simpleaccounts.service.TransactionParsingSettingService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TransactionParsingSettingServiceImpl extends TransactionParsingSettingService {

	private final TransactionParsingSettingDao transactionParsingSettingDao;

	@Override
	protected Dao<Long, TransactionParsingSetting> getDao() {
		return transactionParsingSettingDao;
	}

	@Override
	public List<TransactionParsingSetting> geTransactionParsingList(
			Map<TransactionParsingSettingFilterEnum, Object> filterDataMap) {
		return transactionParsingSettingDao.getTransactionList(filterDataMap);
	}

}
