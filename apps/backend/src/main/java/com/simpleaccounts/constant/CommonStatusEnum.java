package com.simpleaccounts.constant;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.Getter;
import lombok.Setter;

/**
 *
 * @author Hiren
 */
public enum CommonStatusEnum {

	SAVED("Saved", 1), 
	PENDING("Draft", 2),
	POST("Sent",3), 
	APPROVED("Approved", 4), 
	PARTIALLY_PAID("Partially Paid", 5),
	PAID("Paid", 6),
	POST_GRN("Posted",7),
	CLOSED("Closed",8),
	OPEN("Open",9),
	UN_FILED("UnFiled",10),
	FILED("Filed",11),
	CLAIMED("claimed",12),
	INVOICED("Invoiced",13),
	REJECTED("Rejected",14);

	@Getter
	@Setter
	private String desc;

	@Getter
	@Setter
	private Integer value;

	CommonStatusEnum(final String desc, Integer value) {
		this.desc = desc;
		this.value = value;
	}

	@Override
	public String toString() {
		return this.desc;
	}

	public static List<CommonStatusEnum> getInvoiceStatusList() {
		return Arrays.asList(values());
	}

	public static Map<Integer, CommonStatusEnum> map() {
		Map<Integer, CommonStatusEnum> invoiceStatusMap = new HashMap<>();
		for (CommonStatusEnum status : values()) {
			invoiceStatusMap.put(status.getValue(), status);
		}
		return invoiceStatusMap;
	}

	public static String getInvoiceTypeByValue(Integer value) {
		return map().get(value).getDesc();
	}
}
