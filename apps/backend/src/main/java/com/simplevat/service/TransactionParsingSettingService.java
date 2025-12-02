package com.simplevat.service;

import java.util.List;
import java.util.Map;


import com.simplevat.constant.dbfilter.TransactionParsingSettingFilterEnum;
import com.simplevat.entity.TransactionParsingSetting;

public abstract class TransactionParsingSettingService extends SimpleVatService<Long, TransactionParsingSetting> {

	public abstract List<TransactionParsingSetting> geTransactionParsingList(
			Map<TransactionParsingSettingFilterEnum, Object> filterDataMap);

}
