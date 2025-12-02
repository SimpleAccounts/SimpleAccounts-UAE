package com.simplevat.rest.CorporateTax;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.simplevat.entity.User;
import com.simplevat.entity.VatPayment;
import com.simplevat.entity.bankaccount.Transaction;
import com.simplevat.entity.bankaccount.TransactionCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "CORPORATE_TAX_PAYMENT_HISTORY")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class CorporateTaxPaymentHistory implements Serializable {
    @Id
    @Column(name = "CORPORATE_TAX_PAYMENT_HISTORY_ID", updatable = false, nullable = false)
    @SequenceGenerator(name="CORPORATE_TAX_PAYMENT_HISTORY_SEQ", sequenceName="CORPORATE_TAX_PAYMENT_HISTORY_SEQ", allocationSize=1, initialValue = 10000)
    @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="CORPORATE_TAX_PAYMENT_HISTORY_SEQ")
    private Integer id;

    @Column(name = "CT_START_DATE")
    private LocalDate startDate;

    @Column(name = "CT_END_DATE")
    private LocalDate endDate;

    @Basic
    @Column(name = "AMOUNT_PAID")
    @ColumnDefault(value = "0.00")
    private BigDecimal amountPaid;

    @Basic
    @Column(name = "PAYMENT_DATE")
    //@Convert(converter = DateConverter.class)
    private LocalDate PaymentDate;

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
    private Integer lastUpdatedBy;

    @Column(name = "LAST_UPDATE_DATE")
    //@Convert(converter = DateConverter.class)
    private LocalDateTime lastUpdateDate;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CORPORATE_TAX_PAYMENT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_CORPORATE_TAX_PAYMENT_HISTORY_CORPORATE_TAX_PAYMENT_ID_CORPORATE_TAX_PAYMENT"))
    @JsonManagedReference
    private CorporateTaxPayment corporateTaxPayment;
    @PrePersist
    public void updateDates() {
        createdDate = LocalDateTime.now();
        lastUpdateDate = LocalDateTime.now();
    }

    @PreUpdate
    public void updateLastUpdatedDate() {
        lastUpdateDate = LocalDateTime.now();
    }
}
