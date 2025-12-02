package com.simplevat.constant.dbfilter;

import lombok.Getter;

public enum InventoryFilterEnum {

    DELETE_FLAG("deleteFlag", " = :deleteFlag"),
    ORDER_BY("productID"," =:productID"),
    PRODUCT_PRICE_TYPE("priceType"," in :priceType"),
    USER_ID("createdBy", "= :createdBy"),
    PURCHASE_ORDER("purcahseOrder","= :purchaseOrder"),
    QUANTITY_SOLD("quantitySold","= :quantitySold"),
    STOCK_IN_HAND("stockOnHand","= :stockOnHand"),
    REORDER_LEVEL("reorderLevel","= :reorderlevel");


    @Getter
    String dbColumnName;

    @Getter
    String condition;

    private InventoryFilterEnum(String dbColumnName, String condition) {
        this.dbColumnName = dbColumnName;
        this.condition = condition;
    }

}
