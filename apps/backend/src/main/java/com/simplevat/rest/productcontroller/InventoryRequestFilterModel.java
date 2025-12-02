package com.simplevat.rest.productcontroller;

import com.simplevat.rest.PaginationModel;
import lombok.Data;

/**
 * Created By Zain Khan
 * Date:22/02/2021
 */
@Data
public class InventoryRequestFilterModel extends PaginationModel {
    private String name;
    private String productCode;
    private Integer quantityOrdered;
    private Integer quantityIn;
    private Integer quantityOut;
    private Integer stockInHand;
    private Integer reOrderLevel;
}
