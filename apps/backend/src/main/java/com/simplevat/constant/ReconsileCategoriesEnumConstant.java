package com.simplevat.constant;

import lombok.Getter;

public enum ReconsileCategoriesEnumConstant {
	EXPENSE(21), SUPPLIER_INVOICE(22), MONEY_PAID_TO_USER(23), MONEY_TRANSFER_TO_ANOTHER_ACCOUNT(24),
	CASH_WITHDRAWAL(25), SALES(11), MONEY_PAID_BY_USER(12), TRANSFER_TO_ANOTHER_ACCOUNT(13);

	@Getter
	private int code;

	ReconsileCategoriesEnumConstant(int code) {
		this.code = code;
	}

	public static ReconsileCategoriesEnumConstant get(int code) {

		for (ReconsileCategoriesEnumConstant cat : ReconsileCategoriesEnumConstant.values()) {
			if (cat.getCode() == code)
				return cat;
		}
		return null;
	}
}
