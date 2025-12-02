package com.simplevat.model;

import java.math.BigDecimal;
import java.util.List;

import lombok.Data;

@Data
public class DashBoardBankDataModel {

	private String updatedDate;
	private BigDecimal balance;
	private List<Number> data;
	private List<String> labels;
	private String account_name;
}
