package com.simplevat.rest.migration.model;

import lombok.Data;

@Data
public class ExchangeRateModel {
	
	String currencyCode;
	String exchangeRate;
	String date;

}
