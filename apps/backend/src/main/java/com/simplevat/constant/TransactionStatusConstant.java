/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.constant;

/**
 *
 * @author admin
 */
public final class TransactionStatusConstant {

    public static final int UNEXPLAINED = 1;
    public static final int EXPLIANED = 2;
    public static final int PARTIALLYEXPLIANED = 3;

    //====================Constant used in import transcation============
    public static final String DEFAULT_DATE_FORMAT = "dd/MM/yyyy";
    public static final int HEADER_COUNT = 0;
    public static final String TRANSACTION_DATE = "Transaction Date";
    public static final String DESCRIPTION = "Description";
    public static final String DEBIT_AMOUNT = "Debit Amount";
    public static final String CREDIT_AMOUNT = "Credit Amount";
    public static final String INVALID="invalid";
    public static final String VALID="valid";
    
    private TransactionStatusConstant() {
		// CREATED TO REMOVE SONAR ERROR
    }
}
