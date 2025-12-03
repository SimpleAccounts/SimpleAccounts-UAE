package com.simpleaccounts.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.simpleaccounts.constant.dbfilter.TransactionParsingSettingFilterEnum;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.TransactionParsingSettingDao;
import com.simpleaccounts.entity.TransactionParsingSetting;
import com.simpleaccounts.service.TransactionParsingSettingService;

@Service
public class TransactionParsingSettingServiceImpl extends TransactionParsingSettingService {

	@Autowired
	private TransactionParsingSettingDao transactionParsingSettingDao;

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
