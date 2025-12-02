package com.simplevat.rest.reconsilationcontroller;

import java.math.BigDecimal;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ReconsilationListModel {

	private Integer id;
	private String date;
	private String label;
	private BigDecimal amount;
	private String dueDate;
	private String currencySymbol;

	public ReconsilationListModel(Integer id, String date, String label, BigDecimal amount, String currencySymbol) {
		super();
		this.id = id;
		this.date = date;
		this.label = label;
		this.amount = amount;
		this.currencySymbol = currencySymbol;
	}

	public ReconsilationListModel(Integer id, String date, String label, BigDecimal amount, String dueDate,
			String currencySymbol) {
		super();
		this.id = id;
		this.date = date;
		this.label = label;
		this.amount = amount;
		this.dueDate = dueDate;
		this.currencySymbol = currencySymbol;
	}

}
