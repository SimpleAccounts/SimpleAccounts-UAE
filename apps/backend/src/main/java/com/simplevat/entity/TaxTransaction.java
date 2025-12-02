package com.simplevat.entity;

import com.simplevat.entity.converter.DateConverter;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;
import javax.persistence.*;

import lombok.Data;
import org.hibernate.annotations.ColumnDefault;


@Entity
@Table(name = "TAX_TRANSACTION")
@Data
public class TaxTransaction implements Serializable {

    private static final long serialVersionUID = 6914121175305098995L;

    	@Id
    @Column(name = "TAX_TRANSACTION_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="TAX_TRANSACTION_SEQ", sequenceName="TAX_TRANSACTION_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="TAX_TRANSACTION_SEQ")
    private Integer taxTransactionId;
    @Basic
    @Temporal(TemporalType.DATE)
    @Column(name = "START_DATE")
    private Date startDate;
    @Basic
    @Temporal(TemporalType.DATE)
    @Column(name = "END_DATE")
    private Date endDate;
    @Basic
    @Column(name = "VAT_IN")
    private BigDecimal vatIn;
    @Basic
    @Column(name = "VAT_OUT")
    private BigDecimal vatOut;
    @Basic
    @Column(name = "DUE_AMOUNT")
    private BigDecimal dueAmount;
    @Basic
    @Temporal(TemporalType.DATE)
    @Column(name = "PAYMENT_DATE")
    private Date paymentDate;
    @Basic
    @Column(name = "PAID_AMOUNT")
    private BigDecimal paidAmount;
    @Basic
    @Column(name = "STATUS")
    private Integer status;

    @Basic(optional = false)
    @Column(name = "CREATED_BY")
    @ColumnDefault(value = "0")
    private Integer createdBy = 0;

    @Basic(optional = false)
    @Column(name = "CREATED_DATE")
    @ColumnDefault(value = "CURRENT_TIMESTAMP")
    //@Convert(converter = DateConverter.class)
    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "ORDER_SEQUENCE")
    @Basic(optional = true)
    private Integer orderSequence;

    @Column(name = "LAST_UPDATED_BY")
    private Integer lastUpdateBy;

    @Column(name = "LAST_UPDATE_DATE")
   //@Convert(converter = DateConverter.class)
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
