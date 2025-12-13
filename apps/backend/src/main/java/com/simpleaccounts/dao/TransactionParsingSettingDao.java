package com.simpleaccounts.dao;

import com.simpleaccounts.constant.dbfilter.TransactionParsingSettingFilterEnum;
import com.simpleaccounts.entity.TransactionParsingSetting;
import java.util.List;
import java.util.Map;

public interface TransactionParsingSettingDao extends Dao<Long, TransactionParsingSetting>{

	List<TransactionParsingSetting> getTransactionList(
			Map<TransactionParsingSettingFilterEnum, Object> filterDataMap);

	String getDateFormatByTemplateId(Long templateId);

}
