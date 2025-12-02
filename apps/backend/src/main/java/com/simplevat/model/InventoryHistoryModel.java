package com.simplevat.model;

import com.simplevat.entity.Contact;
import com.simplevat.entity.Product;
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
