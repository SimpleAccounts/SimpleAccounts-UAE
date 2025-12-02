package com.simplevat.service.report.model;

import java.util.Comparator;

public class BankAcctRtpModelComparator implements Comparator<BankAccountTransactionReportModel> {

	@Override
	public int compare(BankAccountTransactionReportModel o1, BankAccountTransactionReportModel o2) {
		if(o1 != null && o2 != null) {
			return o1.getDate().compareTo(o2.getDate());
		}
		return 1;
	}

}