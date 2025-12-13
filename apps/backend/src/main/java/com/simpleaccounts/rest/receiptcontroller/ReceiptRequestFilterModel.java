package com.simpleaccounts.rest.receiptcontroller;

import com.simpleaccounts.rest.PaginationModel;
import lombok.Data;

@Data
public class ReceiptRequestFilterModel extends PaginationModel {

	private Integer userId;
	private Integer contactId;
	private Integer invoiceId;
	private String referenceCode;
	private String receiptDate;
}
