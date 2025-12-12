package com.simpleaccounts.rest.reconsilationcontroller;

import com.simpleaccounts.rest.PaginationModel;
import lombok.Data;

@Data
public class ReconcileStatusRequestModel extends PaginationModel {

    private Integer bankId;
}
