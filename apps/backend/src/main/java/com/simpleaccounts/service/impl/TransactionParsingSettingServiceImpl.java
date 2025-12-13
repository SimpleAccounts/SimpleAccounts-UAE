package com.simpleaccounts.service.impl;

import java.util.List;
import lombok.RequiredArgsConstructor;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.simpleaccounts.constant.dbfilter.TransactionParsingSettingFilterEnum;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.TransactionParsingSettingDao;
import com.simpleaccounts.entity.TransactionParsingSetting;
import com.simpleaccounts.service.TransactionParsingSettingService;

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
