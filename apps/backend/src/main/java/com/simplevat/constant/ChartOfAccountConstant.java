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
public class ChartOfAccountConstant {

	public static final int MONEY_IN = 1;
	public static final int ASSET = 1;
	public static final int LIABILITY = 2;
	public static final int REVENUE = 3;
	public static final int EXPENSE = 4;
	public static final int EQUITY = 5;
	public static final int BANK = 7;

	private ChartOfAccountConstant() {
		// CREATED TO REMOVE SONAR ERROR
	}

	public static boolean isDebitedFromBank(Integer id) {

		return (id.equals(ASSET) || id.equals(REVENUE) || id.equals(EQUITY));

	}
}
