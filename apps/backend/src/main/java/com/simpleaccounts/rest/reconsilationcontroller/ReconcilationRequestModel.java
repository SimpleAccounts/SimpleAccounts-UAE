package com.simpleaccounts.rest.reconsilationcontroller;

import lombok.Data;

@Data
public class ReconcilationRequestModel {
    private Integer chartOfAccountCategoryId;
    private Integer bankId;

}
