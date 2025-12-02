package com.simplevat.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.simplevat.constant.dbfilter.TransactionParsingSettingFilterEnum;
import com.simplevat.dao.Dao;
import com.simplevat.dao.TransactionParsingSettingDao;
import com.simplevat.entity.TransactionParsingSetting;
import com.simplevat.service.TransactionParsingSettingService;

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
