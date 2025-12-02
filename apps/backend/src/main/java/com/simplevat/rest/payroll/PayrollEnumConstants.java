package com.simplevat.rest.payroll;

import com.simplevat.constant.ChartOfAccountCategoryIdEnumConstant;
import lombok.Getter;
import lombok.Setter;

public enum PayrollEnumConstants {


    Fixed("Fixed",1), Variable("Variable",2),Deduction("Deduction",3),Fixed_Allowance("Fixed Allowance",4),
    DEFAULT("Default",0);

    @Getter
    @Setter
    Integer id;

    @Getter
    @Setter
    String name;
    PayrollEnumConstants(String name , int id) {
        this.name = name;
        this.id = id;
    }

    public static PayrollEnumConstants get(Integer id) {
        for (PayrollEnumConstants constant : PayrollEnumConstants.values()) {
            if (constant.id.equals(id))
                return constant;
        }
        return PayrollEnumConstants.DEFAULT;
    }



}
