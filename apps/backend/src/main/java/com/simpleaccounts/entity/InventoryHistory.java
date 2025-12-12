package com.simpleaccounts.entity;

import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Created by adil on 2/13/2021.
 */
@NamedQueries({
        @NamedQuery(name = "allInventoryHistory", query = "SELECT eh FROM InventoryHistory eh"),
        @NamedQuery(name = "getTotalQtySold", query = "SELECT SUM(ih.quantity) FROM InventoryHistory ih WHERE ih.invoice.type=2 AND ih.createdDate BETWEEN :startDate and :endDate"),
        @NamedQuery(name = "getTotalRevenue", query = "SELECT SUM(ih.unitSellingPrice)*SUM(ih.quantity) FROM InventoryHistory ih WHERE ih.invoice.type=2 AND ih.createdDate BETWEEN :startDate and :endDate"),
        @NamedQuery(name = "getHistoryByInventoryId", query = "SELECT ih from InventoryHistory ih where ih.inventory.inventoryID=:inventoryId")})
@Entity
@Table(name = "INVENTORY_HISTORY")
@Data
//@TableGenerator(name = "INCREMENT_INITIAL_VALUE", initialValue = 1000)
public class InventoryHistory implements Serializable {

    private static final long serialVersionUID = 1L;

    	@Id
	@SequenceGenerator(name="INVENTORY_HISTORY_SEQ", sequenceName="INVENTORY_HISTORY_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="INVENTORY_HISTORY_SEQ")
    @Column(name = "INVENTORY_HISTORY_ID", updatable = false, nullable = false)
    private Integer inventoryHistoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PRODUCT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_INVENTORY_HISTORY_PRODUCT_ID_PRODUCT"))
    private Product productId ;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SUPPLIER_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_INVENTORY_HISTORY_SUPPLIER_ID_SUPPLIER"))
    private Contact supplierId ;

    @Basic
    @Column(name = "QUANTITY")
    private Float  quantity ;

    @Basic
    @Column(name = "DATE")
    private LocalDate transactionDate;

    @Basic
    @Column(name = "UNIT_COST")
    private Float  unitCost;

    @Basic
    @Column(name = "UNIT_SELLING_PRICE")
    private Float  unitSellingPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "INVENTORY_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_INVENTORY_HISTORY_INVENTORY_ID_INVENTORY"))
    private Inventory inventory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "INVOICE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_INVENTORY_HISTORY_INVOICE_ID_INVOICE"))
    private Invoice invoice;

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

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

}
