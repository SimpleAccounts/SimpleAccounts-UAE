package com.simpleaccounts.dao;

import java.util.List;
import java.util.Map;

import com.simpleaccounts.constant.dbfilter.TransactionParsingSettingFilterEnum;
import com.simpleaccounts.entity.TransactionParsingSetting;

public interface TransactionParsingSettingDao extends Dao<Long, TransactionParsingSetting>{

	List<TransactionParsingSetting> getTransactionList(
			Map<TransactionParsingSettingFilterEnum, Object> filterDataMap);

	String getDateFormatByTemplateId(Long templateId);

}
