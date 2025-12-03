/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.constant;

import java.util.HashMap;
import java.util.Map;

/**
 *
 * @author ashish
 */
public enum ContactTypeEnum {

	SUPPLIER("Supplier", 1), CUSTOMER("Customer", 2), BOTH("Both", 3);

	private String desc;
	private Integer value;

	private ContactTypeEnum(String desc, Integer value) {
		this.desc = desc;
		this.value = value;
	}

	@Override
	public String toString() {
		return name();
	}

	public String getDesc() {
		return desc;
	}

	public Integer getValue() {
		return value;
	}

	public static Map<Integer, ContactTypeEnum> map() {
		Map<Integer, ContactTypeEnum> contactTypes = new HashMap<>();
		for (ContactTypeEnum contactType : values()) {
			contactTypes.put(contactType.getValue(), contactType);
		}
		return contactTypes;
	}

	public static String getContactTypeByValue(Integer value) {
		return map().get(value).getDesc();
	}

}
