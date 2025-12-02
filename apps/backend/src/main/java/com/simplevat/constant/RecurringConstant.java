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
public abstract class RecurringConstant {

	public static final int DAILY = 1;
	public static final int WEEKLY = 2;
	public static final int MONTHLY = 3;
	public static final int YEARLY = 4;

	private RecurringConstant() {
		// CREATED TO REMOVE SONAR ERROR
	}
}
