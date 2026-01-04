package com.simpleaccounts.rest.productcontroller;

import com.simpleaccounts.rest.PaginationModel;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Created By Zain Khan
 * Date:22/02/2021
 */
@Data
@EqualsAndHashCode(callSuper = false)
public class InventoryRequestFilterModel extends PaginationModel {
    private String name;
    private String productCode;
    private Integer quantityOrdered;
    private Integer quantityIn;
    private Integer quantityOut;
    private Integer stockInHand;
    private Integer reOrderLevel;
}
