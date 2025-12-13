package com.simpleaccounts.entity;

import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 *  Created By Zain Khan On 20-11-2020
 */

@Data
@Entity
@Table(name = "CUSTOMIZE_INVOICE_TEMPLATE")

@NamedQueries({
        @NamedQuery(name = "allInvoicesPrefix", query = "select i from CustomizeInvoiceTemplate i where i.type = :type and i.deleteFlag = false "),
        @NamedQuery(name = "lastInvoiceSuffixNo", query = "select i from CustomizeInvoiceTemplate i where i.type = :type order by i.id desc"),
})
public class CustomizeInvoiceTemplate implements Serializable {

    private static final long serialVersionUID = 1L;
    	@Id
    @Column(name = "CUSTOMIZE_INVOICE_TEMPLATE_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="CUSTOMIZE_INVOICE_TEMPLATE_SEQ", sequenceName="CUSTOMIZE_INVOICE_TEMPLATE_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="CUSTOMIZE_INVOICE_TEMPLATE_SEQ")
    private Integer id;

    @Column(name = "PREFIX")
    private String prefix;

    @Column(name = "SUFFIX")
    private Integer suffix;

    @Column(name = "TYPE")
    @Basic
    private Integer type;

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

    @Column(name = "CREATED_BY")
    @ColumnDefault(value = "0")
    @Basic(optional = false)
    private Integer createdBy = 0;

    @Column(name = "ORDER_SEQUENCE")
    @Basic(optional = true)
    private Integer orderSequence;

    @Column(name = "CREATED_DATE")
    @ColumnDefault(value = "CURRENT_TIMESTAMP")
    @Basic(optional = false)

    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "LAST_UPDATED_BY")
    private Integer lastUpdateBy;

    @Column(name = "LAST_UPDATE_DATE")

    private LocalDateTime lastUpdateDate = LocalDateTime.now();

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;
}
