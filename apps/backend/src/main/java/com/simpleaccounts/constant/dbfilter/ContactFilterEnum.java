/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.constant.dbfilter;

import lombok.Getter;

/**
 *
 * @author uday
 */
public enum ContactFilterEnum {
    NAME("firstName", " like CONCAT('%',:firstName,'%')"),
    EMAIL("email", " like CONCAT('%',:email,'%')"),
    CONTACT_TYPE("contactType", " = :contactType"),
    DELETE_FLAG("deleteFlag", " = :deleteFlag"),
    ORDER_BY("contactId"," =:contactId"),
    USER_ID("createdBy", "= :createdBy");

    @Getter
    String dbColumnName;

    @Getter
    String condition;
    
    private ContactFilterEnum(String dbColumnName, String condition) {
        this.dbColumnName = dbColumnName;
        this.condition = condition;
    }
}
