package com.simpleaccounts.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Created by Suraj on 26/11/2021.
 */

@Entity(name = "EXCISE_TAX")
@Table(name = "EXCISE_TAX")
@Data
@NoArgsConstructor
public class ExciseTax implements Serializable {

    private static final long serialVersionUID = 1L;
    	@Id
	@SequenceGenerator(name="EXCISE_TAX_SEQ", sequenceName="EXCISE_TAX_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="EXCISE_TAX_SEQ")
    @Basic(optional = false)
    @Column(name = "EXCISE_TAX_ID", updatable = false, nullable = false)
    private Integer id;
    @Basic
    @Column(name = "NAME")
    private String name;
    @Basic
    @Column(name = "EXCISE_PERCENTAGE")
    private BigDecimal excisePercentage;
    @Column(name = "DEFAULT_FLAG")
    @ColumnDefault(value = "'N'")
    private Character defaultFlag;
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
   //@Convert(converter = DateConverter.class)
    private LocalDateTime createdDate = LocalDateTime.now();
    @Column(name = "LAST_UPDATED_BY")
    private Integer lastUpdateBy;
    @Column(name = "LAST_UPDATE_DATE")
   //@Convert(converter = DateConverter.class)
    private LocalDateTime lastUpdateDate = LocalDateTime.now();
    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    private Boolean deleteFlag = Boolean.FALSE;
    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Version
    private Integer versionNumber = 1;
    @Transient
    private String vatLabel;

    public ExciseTax(Integer id) {
        this.id = id;
    }

    public String getVatLabel() {
        return name + "(" + excisePercentage + ")";
    }

}
