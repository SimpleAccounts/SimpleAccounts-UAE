package com.simplevat.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.simplevat.entity.converter.DateConverter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;


@Entity
@Table(name = "VAT_RECORD_PAYMENT_HISTORY")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
//@TableGenerator(name = "INCREMENT_INITIAL_VALUE", initialValue = 1000)
public class VatRecordPaymentHistory implements Serializable {

    	@Id
    @Column(name = "VAT_RECORD_PAYMENT_HISTORY_ID")
	@SequenceGenerator(name="VAT_RECORD_PAYMENT_HISTORY_SEQ", sequenceName="VAT_RECORD_PAYMENT_HISTORY_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="VAT_RECORD_PAYMENT_HISTORY_SEQ")
    private Integer id;

    @Basic
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_VAT_RECORD_PAYMENT_HISTORY_USER_ID_SA_USER"))
    private User userId;

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

//    @Column(name = "VERSION_NUMBER")
//    @ColumnDefault(value = "1")
//    @Basic(optional = false)
//    @Version
//    private Integer versionNumber = 1;

    @Column(name = "START_DATE")
    private LocalDateTime startDate;

    @Column(name = "END_DATE")
    private LocalDateTime endDate;

    @Column(name = "DATE_OF_FILING")
    private LocalDateTime dateOfFiling;

    @Column(name = "AMOUNT_PAID")
    @ColumnDefault(value = "0.00")
    private BigDecimal amountPaid;

    @Column(name = "AMOUNT_RECLAIMED")
    @ColumnDefault(value = "0.00")
    private BigDecimal amountReclaimed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "VAT_PAYMENT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_VAT_RECORD_PAYMENT_HISTORY_VAT_PAYMENT_ID_VAT_PAYMENT"))
    @JsonManagedReference
    private VatPayment vatPayment;

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

}
