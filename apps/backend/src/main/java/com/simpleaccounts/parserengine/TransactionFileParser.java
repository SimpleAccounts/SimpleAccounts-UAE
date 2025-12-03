package com.simpleaccounts.parserengine;

import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.rest.transactionparsingcontroller.TransactionParsingSettingDetailModel;
import com.simpleaccounts.rest.transactionparsingcontroller.TransactionParsingSettingPersistModel;

public interface TransactionFileParser {

	List<Map<String, String>> parseSmaple(TransactionParsingSettingPersistModel model);

	List<Transaction> getModelListFromFile(TransactionParsingSettingDetailModel model, MultipartFile file,
			Integer bankId);
}
