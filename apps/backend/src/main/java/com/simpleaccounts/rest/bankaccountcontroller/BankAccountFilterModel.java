package com.simpleaccounts.rest.bankaccountcontroller;

import com.simpleaccounts.rest.PaginationModel;
import java.util.Date;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class BankAccountFilterModel extends PaginationModel{

	private String bankName;
	private Integer bankAccountTypeId;
	private String bankAccountName;
	private Date transactionDate;
	private String accountNumber;
	private Integer currencyCode;
}
