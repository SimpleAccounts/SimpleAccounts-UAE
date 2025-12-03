package com.simpleaccounts.model;

import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.Product;
import lombok.Data;

import javax.persistence.*;

@Data
public class InventoryHistoryModel {

    private Integer inventoryHistorYId;

    private Product productId ;

    private Contact supplierId ;

    private Float  purchaseQuantity ;

    private Float  purchaseDate;

    private Float  purchasePrice;
}
