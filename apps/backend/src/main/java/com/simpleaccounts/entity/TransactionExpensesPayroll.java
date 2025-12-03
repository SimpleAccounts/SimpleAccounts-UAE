        package com.simpleaccounts.entity;

        import com.simpleaccounts.constant.TransactionExplinationStatusEnum;
        import com.simpleaccounts.entity.bankaccount.Transaction;
        import com.simpleaccounts.entity.converter.DateConverter;
        import lombok.Data;
        import org.hibernate.annotations.ColumnDefault;
        import org.hibernate.annotations.CreationTimestamp;
        import org.hibernate.annotations.UpdateTimestamp;


        import java.math.BigDecimal;
        import java.time.LocalDateTime;
        import java.util.Date;
        import javax.persistence.*;


		/**
		 * Middle table for mapping between transaction and expense
		 */
@Entity
@Table(name = "TRANSACTION_EXPENSES_PAYROLL")
@Data
public class TransactionExpensesPayroll {

    	@Id
	@SequenceGenerator(name="TRANSACTION_EXPENSES_PAYROLL_SEQ", sequenceName="TRANSACTION_EXPENSES_PAYROLL_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="TRANSACTION_EXPENSES_PAYROLL_SEQ")
    @Column(name = "TRANSACTION_EXPENSES_PAYROLL_ID", updatable = false, nullable = false)
    private int id;

    @Basic(optional = false)
    @Enumerated(EnumType.STRING)
    @Column(name = "EXPLANATION_STATUS_NAME")
    private TransactionExplinationStatusEnum explinationStatus;

    @Basic(optional = false)
    @Column(name = "REMAINING_TO_EXPLAIN_BALANCE")
    @ColumnDefault(value = "0.00")
    private BigDecimal remainingToExplain;

    @ManyToOne
    @JoinColumn(name = "TRANSACTION_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANSACTION_EXPENSES_PAYROLL_TRANSACTION_ID_TRANSACTION"))
    private Transaction transaction;

    @ManyToOne
    @JoinColumn(name = "PAYROLL_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANSACTION_EXPENSES_PAYROLL_PAYROLL_ID_PAYROLL"))
    private Payroll payroll;

    @ManyToOne
    @JoinColumn(name = "EXPENSE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANSACTION_EXPENSES_PAYROLL_EXPENSE_ID_EXPENSE"))
    private Expense expense;

    @Column(name = "CREATED_BY")
    @ColumnDefault(value = "0")
    @Basic(optional = false)
    private Integer createdBy = 0;

    @Column(name = "CREATED_DATE")
    @ColumnDefault(value = "CURRENT_TIMESTAMP")
    @CreationTimestamp
    //@Convert(converter = DateConverter.class)
    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "LAST_UPDATED_BY")
    private Integer lastUpdateBy;

            @Column(name = "ORDER_SEQUENCE")
            @Basic(optional = true)
            private Integer orderSequence;

            @Column(name = "DELETE_FLAG")
            @ColumnDefault(value = "false")
            @Basic(optional = false)
            private Boolean deleteFlag = Boolean.FALSE;

    @Column(name = "LAST_UPDATE_DATE")
    @UpdateTimestamp
    //@Convert(converter = DateConverter.class)
    private LocalDateTime lastUpdateDate;

            @Column(name = "VERSION_NUMBER")
            @ColumnDefault(value = "1")
            @Basic(optional = false)
            @Version
            private Integer versionNumber = 1;
}
