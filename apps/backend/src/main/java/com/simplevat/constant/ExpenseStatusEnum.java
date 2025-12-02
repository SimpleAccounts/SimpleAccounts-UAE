package com.simplevat.constant;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import lombok.Getter;
import lombok.Setter;

public enum ExpenseStatusEnum {

	DRAFT("Draft", 1), PENDING("Pending", 2), POSTED("Posted", 3), APPROVED("Approved", 4),
	PARTIALLY_PAID("Partially Paid", 5), PAID("Paid", 6);

	@Getter
	@Setter
	private String desc;

	@Getter
	@Setter
	private Integer value;

	ExpenseStatusEnum(final String desc, Integer value) {
		this.desc = desc;
		this.value = value;
	}

	@Override
	public String toString() {
		return this.desc;
	}

	public static List<ExpenseStatusEnum> getInvoiceStatusList() {
		return Arrays.asList(values());
	}

	public static Map<Integer, ExpenseStatusEnum> map() {
		Map<Integer, ExpenseStatusEnum> invoiceStatusMap = new HashMap<>();
		for (ExpenseStatusEnum status : values()) {
			invoiceStatusMap.put(status.getValue(), status);
		}
		return invoiceStatusMap;
	}

	public static String getExpenseStatusByValue(Integer value) {
		return map().get(value).getDesc();
	}
}
