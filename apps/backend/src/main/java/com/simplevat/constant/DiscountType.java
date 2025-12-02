/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.constant;

import java.util.Arrays;
import java.util.List;

/**
 *
 * @author ashish
 */
public enum DiscountType {

	NONE("None"),FIXED("Fixed"), PERCENTAGE("Percentage");

	private String desc;

	DiscountType(String desc) {
		this.desc = desc;
	}

	@Override
	public String toString() {
		return name();
	}

	public String getDesc() {
		return desc;
	}

	public static List<DiscountType> contactTypeList() {
		return Arrays.asList(values());
	}

}
