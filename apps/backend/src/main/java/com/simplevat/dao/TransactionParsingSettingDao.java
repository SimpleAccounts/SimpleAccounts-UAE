package com.simplevat.dao;

import java.util.List;
import java.util.Map;

import com.simplevat.constant.dbfilter.TransactionParsingSettingFilterEnum;
import com.simplevat.entity.TransactionParsingSetting;

public interface TransactionParsingSettingDao extends Dao<Long, TransactionParsingSetting>{

	List<TransactionParsingSetting> getTransactionList(
			Map<TransactionParsingSettingFilterEnum, Object> filterDataMap);

	String getDateFormatByTemplateId(Long templateId);

}
