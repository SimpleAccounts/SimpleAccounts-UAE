/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.constant;

import lombok.Getter;

/**
 *
 * @author uday
 */
public enum TransactionCategoryCodeEnum {
    ACCOUNT_PAYABLE("02-01-001"),
    ACCOUNT_RECEIVABLE("01-01-001"),
    ACCOUNTANCY_FEE("04-01-002"),
    SALE("03-01-006"),
    BANK("01-02-001"),
    PETTY_CASH("01-04-001"),
	EXPENSE("04"),
	INPUT_VAT("01-06-004"),
	OUTPUT_VAT("02-02-004"),
    EMPLOYEE_REIMBURSEMENT("02-02-001"),
	UNDEPOSTED_FUND("01-04-006"),
    AMOUNT_IN_TRANSIT("01-02-001"),
    OPENING_BALANCE_OFFSET_LIABILITIES("05-01-002"),
    OPENING_BALANCE_OFFSET_ASSETS("01-04-007"),
    INVENTORY_ASSET("01-08-003"),
    COST_OF_GOODS_SOLD("04-02-002"),
    EXCISE_TAX_PAYABLE("02-02-002"),
    OUTPUT_EXCISE_TAX("02-02-003"),
    INPUT_EXCISE_TAX("01-06-003"),
    PURCHASE_DISCOUNT("04-03-004"),
    SALES_DISCOUNT("03-01-007"),

    CORPORATION_TAX("02-02-008"),

    RETAINED_EARNINGS("05-01-007"),
    GCC_VAT_PAYABLE("02-02-017");

	
    @Getter
    private final String code;

    private TransactionCategoryCodeEnum(String  code) {
        this.code = code;
    }
}
