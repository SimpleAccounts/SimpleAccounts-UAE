package com.simplevat.rest.vatcontroller;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class VatCategoryModel {

	private Integer id;
	private BigDecimal vat;
	private String name;
}
