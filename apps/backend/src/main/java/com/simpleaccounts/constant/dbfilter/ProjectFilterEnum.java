package com.simpleaccounts.constant.dbfilter;

import lombok.Getter;

/**
 * 
 * @author  saurabh 26/12/19
 *
 */

public enum ProjectFilterEnum {

    PROJECT_ID("projectId", " = :projectId"),
    PROJECT_NAME("projectName", " like CONCAT('%',:projectName,'%')"),
    VAT_REGISTRATION_NUMBER("vatRegistrationNumber", " like CONCAT(:vatRegistrationNumber,'%')"),
    EXPENSE_BUDGET("expenseBudget", " like CONCAT('%',:expenseBudget,'%')"),
    REVENUE_BUDGET("revenueBudget", " like CONCAT('%',:revenueBudget,'%')"),
    DELETE_FLAG("deleteFlag", " = :deleteFlag"),   
	ORDER_BY("projectId"," =:projectId"),
    USER_ID("createdBy", "= :createdBy");

    @Getter
    String dbColumnName;

    @Getter
    String condition;

    private ProjectFilterEnum(String dbColumnName, String condition) {
        this.dbColumnName = dbColumnName;
        this.condition = condition;
    }

}
