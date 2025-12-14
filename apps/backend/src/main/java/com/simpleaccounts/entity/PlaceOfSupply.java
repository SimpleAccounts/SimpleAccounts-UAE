package com.simpleaccounts.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

/**
 * Created By Zain Khan On 16-12-2020
 */
@Entity
@Table(name = "PLACE_OF_SUPPLY")
@Getter
@Setter
@NamedQueries({

        @NamedQuery(  name = "getAllPlaceOfSupplyForDropdown", query =" SELECT pos FROM PlaceOfSupply pos ")})
public class PlaceOfSupply implements Serializable {
    	@Id
    @Column(name = "PLACE_OF_SUPPLY_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="PLACE_OF_SUPPLY_SEQ", sequenceName="PLACE_OF_SUPPLY_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="PLACE_OF_SUPPLY_SEQ")
    private Integer id;

    @Column(name = "PLACE_OF_SUPPLY")
    @Basic(optional = false)
    private String placeOfSupply;

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

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;
}
