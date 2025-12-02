package com.simplevat.parserengine;

import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.simplevat.entity.bankaccount.Transaction;
import com.simplevat.rest.transactionparsingcontroller.TransactionParsingSettingDetailModel;
import com.simplevat.rest.transactionparsingcontroller.TransactionParsingSettingPersistModel;

public interface TransactionFileParser {

	List<Map<String, String>> parseSmaple(TransactionParsingSettingPersistModel model);

	List<Transaction> getModelListFromFile(TransactionParsingSettingDetailModel model, MultipartFile file,
			Integer bankId);
}
