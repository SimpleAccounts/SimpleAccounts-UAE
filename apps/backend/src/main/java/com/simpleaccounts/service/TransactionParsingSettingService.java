package com.simpleaccounts.service;

import java.util.List;
import java.util.Map;

import com.simpleaccounts.constant.dbfilter.TransactionParsingSettingFilterEnum;
import com.simpleaccounts.entity.TransactionParsingSetting;

public abstract class TransactionParsingSettingService extends SimpleAccountsService<Long, TransactionParsingSetting> {

	public abstract List<TransactionParsingSetting> geTransactionParsingList(
			Map<TransactionParsingSettingFilterEnum, Object> filterDataMap);

}
