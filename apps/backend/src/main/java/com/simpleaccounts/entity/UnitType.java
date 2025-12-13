package com.simpleaccounts.entity;

import java.io.Serializable;
import javax.persistence.*;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

/**
 * Created by adil on 2/13/2021.
 */
@NamedQueries({
        @NamedQuery(name = "allUnits", query = "SELECT u FROM UnitType u ") })
@Entity
@Table(name = "UNIT_TYPE")
@Data

public class UnitType  implements Serializable {

    private static final long serialVersionUID = 1L;

    	@Id
	@SequenceGenerator(name="UNIT_TYPE_SEQ", sequenceName="UNIT_TYPE_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="UNIT_TYPE_SEQ")
    @Column(name = "UNIT_TYPE_ID", updatable = false, nullable = false)
    private Integer unitTypeId;

    @Basic
    @Column(name = "UNIT_TYPE_CODE")
    private String  unitTypeCode;

    @Basic
    @Column(name = "UNIT_TYPE")
    private String  unitType;

    @Basic
    @Column(name = "UNIT_TYPE_STATUS")
    private Boolean  unitTypeStatus;

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;

}
