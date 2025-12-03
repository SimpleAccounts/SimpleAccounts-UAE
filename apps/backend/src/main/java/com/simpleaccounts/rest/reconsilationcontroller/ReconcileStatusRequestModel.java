package com.simpleaccounts.rest.reconsilationcontroller;

import com.simpleaccounts.rest.PaginationModel;
import lombok.Data;
import lombok.Getter;

@Data
public class ReconcileStatusRequestModel extends PaginationModel {

    private Integer bankId;
}
