package com.simplevat.rest;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChartOfAccountDropdownModel {

	private String transactionCategory;
	private List<DropdownModel> subTransactionCategory;

}
