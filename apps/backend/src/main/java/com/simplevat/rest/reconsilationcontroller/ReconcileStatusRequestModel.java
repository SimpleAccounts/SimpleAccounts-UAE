package com.simplevat.rest.reconsilationcontroller;

import com.simplevat.rest.PaginationModel;
import lombok.Data;
import lombok.Getter;

@Data
public class ReconcileStatusRequestModel extends PaginationModel {

    private Integer bankId;
}
