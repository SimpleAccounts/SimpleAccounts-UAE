/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.constant.dbfilter;

import lombok.Getter;

/**
 *
 * @author uday
 */
public enum PaymentFilterEnum {
    SUPPLIER("supplier", " = :supplier "),
    INVOICE_AMOUNT("invoiceAmount", " like CONCAT('%',:invoiceAmount,'%')"),
    PAYMENT_DATE("paymentDate", " = :paymentDate "),
    DELETE_FLAG("deleteFlag", " = :deleteFlag"),
    ORDER_BY("paymentId"," =:paymentId"),
    USER_ID("createdBy", "= :createdBy");

    @Getter
    String dbColumnName;

    @Getter
    String condition;

    private PaymentFilterEnum(String dbColumnName, String condition) {
        this.dbColumnName = dbColumnName;
        this.condition = condition;
    }
}
