package com.simpleaccounts.criteria.enums;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import com.simpleaccounts.rest.EnumDropdownModel;

import lombok.Getter;

public enum TransactionEnum {

	TRANSACTION_DATE("TRANSACTION_DATE", "Transaction Date"), 
	DESCRIPTION("DESCRIPTION", "Description"),
//	AMOUNT("AMOUNT", "Amount"),
	DR_AMOUNT("DR_AMOUNT", "Debit Amount"), 
	CR_AMOUNT("CR_AMOUNT", "Credit Amount");
//	CREDIT_DEBIT_FLAG("CREDIT_DEBIT_FLAG", "Credit Debit Flag");

	@Getter
	String dbColumnName;

	@Getter
	String displayName;

	private TransactionEnum(String dbColumnName, String displayName) {
		this.dbColumnName = dbColumnName;
		this.displayName = displayName;
	}

	public static List<EnumDropdownModel> getDropdownList() {
		List<EnumDropdownModel> enumDropdownModels = new ArrayList<>();
		Stream.of(TransactionEnum.values()).forEach(transactionEnum -> enumDropdownModels
				.add(new EnumDropdownModel(transactionEnum.name(), transactionEnum.displayName)));
		return enumDropdownModels;
	}

	public static Map<String, TransactionEnum> getMap() {
		Map<String, TransactionEnum> enumMap = new HashMap<>();

		Stream.of(TransactionEnum.values())
				.forEach(transactionEnum -> enumMap.put(transactionEnum.dbColumnName, transactionEnum));
		return enumMap;
	}

	public static TransactionEnum getByDisplayName(String displayName) {
		Map<String, TransactionEnum> enumMap = getMap();
		return enumMap.get(displayName);
	}

}
