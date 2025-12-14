package com.simpleaccounts.service;

import com.simpleaccounts.constant.dbfilter.TransactionParsingSettingFilterEnum;
import com.simpleaccounts.entity.TransactionParsingSetting;
import java.util.List;
import java.util.Map;

public abstract class TransactionParsingSettingService extends SimpleAccountsService<Long, TransactionParsingSetting> {

	public abstract List<TransactionParsingSetting> geTransactionParsingList(
			Map<TransactionParsingSettingFilterEnum, Object> filterDataMap);

}
