/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.constant;

/**
 *
 * @author uday
 */
public enum ModuleName {
    INVOICE_MODULE("INVOICE_MODULE"),
    EXPENSE_MODULE("EXPANSE_MODULE"),
    IMPORT_MODULE("IMPORT_MODULE"),
    TAX_MODULE("TAX_MODULE"),
    BANK_MODULE("BANK_MODULE"),
    PURCHASE_MODULE("PURCHASE_MODULE"),
    PROJECT_MODULE("PROJECT_MODULE"),
    CONTACT_MODULE("CONTACT_MODULE"),
    SETTING_MODULE("SETTING_MODULE"),
    REPORT_MODULE("REPORT_MODULE"),
    PRODUCT_MODULE("PRODUCT_MODULE"),
    USER_MODULE("USER_MODULE"),
    EMPLOYEE_MODULE("EMPLOYEE_MODULE"),
    GENERALSETTING_MODULE("GENERALSETTING_MODULE"),
    VATCATEGORY_MODULE("VATCATEGORY_MODULE"),
    TRANSACTIONCATEGORY_MODULE("TRANSACTIONCATEGORY_MODULE");

    String name;

    ModuleName(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
