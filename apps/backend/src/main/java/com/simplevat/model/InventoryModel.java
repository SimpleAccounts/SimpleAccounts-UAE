package com.simplevat.model;

import com.simplevat.entity.Contact;
import com.simplevat.entity.Product;
import com.simplevat.entity.UnitType;
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
