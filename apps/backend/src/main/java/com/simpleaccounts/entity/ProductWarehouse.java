/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import javax.persistence.*;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

/**
 *
 * @author admin
 */
@NamedQueries({
    @NamedQuery(name = "allProductWarehouse",
            query = "SELECT w FROM ProductWarehouse w where w.deleteFlag = false order by w.warehouseName ASC")
})

@Entity
@Table(name = "PRODUCT_WAREHOUSE")
@Data

public class ProductWarehouse implements Serializable {

    private static final long serialVersionUID = 1L;

    	@Id
    @Column(name = "PRODUCT_WAREHOUSE_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="PRODUCT_WAREHOUSE_SEQ", sequenceName="PRODUCT_WAREHOUSE_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="PRODUCT_WAREHOUSE_SEQ")
    private Integer warehouseId;

    @Basic(optional = false)
    @Column(name = "WAREHOUSE_NAME")
    private String warehouseName;

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    private Boolean deleteFlag = Boolean.FALSE;

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;

    @Column(name = "ORDER_SEQUENCE")
    @Basic(optional = true)
    private Integer orderSequence;

    @Column(name = "CREATED_BY")
    @ColumnDefault(value = "0")
    @Basic(optional = false)
    private Integer createdBy = 0;

    @Column(name = "CREATED_DATE")
    @ColumnDefault(value = "CURRENT_TIMESTAMP")
    @Basic(optional = false)

    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "LAST_UPDATED_BY")
    private Integer lastUpdateBy;

    @Column(name = "LAST_UPDATE_DATE")

    private LocalDateTime lastUpdateDate = LocalDateTime.now();
}
