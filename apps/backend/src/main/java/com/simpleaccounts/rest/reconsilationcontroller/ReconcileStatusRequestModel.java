package com.simpleaccounts.rest.reconsilationcontroller;

import com.simpleaccounts.rest.PaginationModel;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class ReconcileStatusRequestModel extends PaginationModel {

    private Integer bankId;
}
