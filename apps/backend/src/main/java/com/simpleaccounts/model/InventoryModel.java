package com.simpleaccounts.model;

import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.Product;
import com.simpleaccounts.entity.UnitType;
import lombok.Data;

@Data
public class InventoryModel {

    private Integer inventoryID;
    private Product productId ;
    private UnitType unitTypeId;
    private Integer  stockOnHand ;
    private Float  unitSellingPrice;
    private Integer   quantitySold;
    private Integer  reorderLevel ;
    private Float  unitCost;
    private Integer  purchaseQuantity;
    private Contact supplierId ;


}
