package com.simplevat.constant;

import lombok.Getter;
import lombok.Setter;

public enum ChartOfAccountCategoryIdEnumConstant {

	MONEY_RECEIVED(1), SALES(2),TRANSFER_FROM(3),REFUND_RECEIVED(4),INTEREST_RECEVIED(5),MONEY_RECEIVED_FROM_USER(6),
	DISPOSAL_OF_CAPITAL_ASSET(7),MONEY_RECEIVED_OTHERS(8),
	MONEY_SPENT(9), EXPENSE(10),TRANSFERD_TO(11), MONEY_PAID_TO_USER(12),
	PURCHASE_OF_CAPITAL_ASSET(13),MONEY_SPENT_OTHERS(14),INVOICE(15),VAT_PAYMENT(16),VAT_CLAIM(17),CORPORATE_TAX_PAYMENT(18),
	DEFAULT(0);

	@Getter
	@Setter
	Integer id;

	ChartOfAccountCategoryIdEnumConstant(int id) {
		this.id = id;
	}

	public static ChartOfAccountCategoryIdEnumConstant get(Integer id) {
		for (ChartOfAccountCategoryIdEnumConstant constant : ChartOfAccountCategoryIdEnumConstant.values()) {
			if (constant.id.equals(id))
				return constant;
		}
		return ChartOfAccountCategoryIdEnumConstant.DEFAULT;
	}

	public static boolean isDebitedFromBank(Integer id) {

		return id.equals(MONEY_SPENT.id);

	}
}
