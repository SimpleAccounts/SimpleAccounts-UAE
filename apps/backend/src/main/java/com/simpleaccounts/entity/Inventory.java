package com.simpleaccounts.entity;

import java.io.Serializable;
import java.time.LocalDateTime;

import javax.persistence.*;

import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

/**
 * Created by adil on 2/13/2021.
 */
@NamedQueries({
        @NamedQuery(name = "allInvetories", query = "SELECT e FROM Inventory e"),
        @NamedQuery(name = "getTotalStockOnHand",query = "SELECT  SUM(i.stockOnHand) AS StockOnHand FROM Inventory i"),
        @NamedQuery(name = "getInventoryLowProduct",query = "SELECT i.productId FROM Inventory i WHERE i.stockOnHand <= i.reorderLevel ORDER BY i.inventoryID "),
        @NamedQuery(name = "getTopSellingProduct",query = "SELECT  i.productId, SUM(i.quantitySold) AS TotalQuantity FROM Inventory i GROUP BY i.productId  ORDER BY SUM(i.quantitySold) DESC "),
        @NamedQuery(name = "getInventoryByProductIdAndSupplierId", query = "SELECT i  FROM Inventory i WHERE i.productId.productID =:productId AND i.supplierId.contactId =:supplierId"),
        @NamedQuery(name = "getInventoryProductById", query = "SELECT i FROM Inventory i WHERE i.productId.productID =:productId ") })
@Entity
@Table(name = "INVENTORY")
@Data
//@TableGenerator(name = "INCREMENT_INITIAL_VALUE", initialValue = 1000)
public class Inventory implements Serializable{

    private static final long serialVersionUID = 1L;

    	@Id
	@SequenceGenerator(name="INVENTORY_SEQ", sequenceName="INVENTORY_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="INVENTORY_SEQ")
    @Column(name = "INVENTORY_ID", updatable = false, nullable = false)
    private Integer inventoryID;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PRODUCT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_INVENTORY_PRODUCT_ID_PRODUCT"))
    private Product productId ;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SUPPLIER_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_INVENTORY_SUPPLIER_ID_SUPPLIER"))
    private Contact supplierId ;

//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "CUSTOMER_ID")
//    private Contact customerId ;

    @Basic
    @Column(name = "PURCHASE_ORDER")
    private Integer   purchaseQuantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UNIT_TYPE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_INVENTORY_UNIT_TYPE_ID_UNIT_TYPE"))
    private UnitType unitTypeId;

    @Basic
    @Column(name = "UNIT_COST")
    private Float  unitCost ;

    @Basic
    @Column(name = "UNIT_SELLING_PRICE")
    private Float  unitSellingPrice;

    @Basic
    @Column(name = "STOCK_ON_HAND")
    private Integer  stockOnHand ;

    @Basic
    @Column(name = "QUANTITY_SOLD")
    private Integer quantitySold;

    @Basic
    @Column(name = "REORDER_LEVEL")
    private Integer  reorderLevel ;

    @Column(name = "CREATED_BY")
    @ColumnDefault(value = "0")
    @Basic(optional = false)
    private Integer createdBy = 0;

    @Column(name = "CREATED_DATE")
    @ColumnDefault(value = "CURRENT_TIMESTAMP")
    @Basic(optional = false)
    //@Convert(converter = DateConverter.class)
    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "LAST_UPDATED_BY")
    private Integer lastUpdateBy;

    @Column(name = "LAST_UPDATE_DATE")
    //@Convert(converter = DateConverter.class)
    private LocalDateTime lastUpdateDate;

    @Column(name = "ORDER_SEQUENCE")
    @Basic(optional = true)
    private Integer orderSequence;

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "INVOICE_ID")
//    private Invoice invoice;

    @Basic(optional = false)
    @ColumnDefault(value = "false")
    @Column(name = "IS_MIGRATED_RECORD")
    private Boolean isMigratedRecord = Boolean.FALSE;

//    @Column(name = "VERSION_NUMBER")
//    @ColumnDefault(value = "1")
//    @Basic(optional = false)
//    @Version
//    private Integer versionNumber = 1;

}
