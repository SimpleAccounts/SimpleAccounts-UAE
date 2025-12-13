package com.simpleaccounts.entity;

import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import javax.persistence.*;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

/**
 * @author S@urabh
 */
@Data
@Entity
@Table(name = "TRANSACTION_EXPLINATION_LINE_ITEM")
public class TransactionExplinationLineItem {

	@Id
	@Column(name = "TRANSACTION_EXPLINATION_LINE_ITEM_ID", updatable = false, nullable = false)
	@Basic(optional = false)
	@SequenceGenerator(name="TRANSACTION_EXPLINATION_LINE_ITEM_SEQ", sequenceName="TRANSACTION_EXPLINATION_LINE_ITEM_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="TRANSACTION_EXPLINATION_LINE_ITEM_SEQ")
	private Integer id;

	@ManyToOne
	@JoinColumn(name = "TRANSACTION_EXPLANATION_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANX_EXP_LINE_ITEM_TRANX_EXP_ID_TRANX_EXPL"))
	private TransactionExplanation transactionExplanation;

	@Column(name = "REFERENCE_ID")
	// commented to avoid error in journal save
	@Basic(optional = false)
	private Integer referenceId;

	@Column(name = "REFERENCE_TYPE")
	@Basic(optional = false)
	@Enumerated(value = EnumType.STRING)
	private PostingReferenceTypeEnum referenceType;

	@Column(name = "CREATED_BY")
	@Basic(optional = false)
	private Integer createdBy = 0;

	@Column(name = "CREATED_DATE")
	@ColumnDefault(value = "CURRENT_TIMESTAMP")
	@CreationTimestamp

	private LocalDateTime createdDate;

	@Column(name = "DELETE_FLAG")
	@ColumnDefault(value = "false")
	@Basic(optional = false)
	private Boolean deleteFlag = Boolean.FALSE;

	@Column(name = "ORDER_SEQUENCE")
	@Basic(optional = true)
	private Integer orderSequence;

	@Column(name = "EXPLAINED_AMOUNT")
	@ColumnDefault(value = "0.00")
	private BigDecimal explainedAmount = BigDecimal.ZERO;

	@Basic
	@Column(name = "EXCHANGE_RATE", precision = 19, scale = 9)
	private BigDecimal exchangeRate;

	@Column(name = "CONVERTED_EXPLAINED_AMOUNT")
	@ColumnDefault(value = "0.00")
	private BigDecimal convertedAmount = BigDecimal.ZERO;

	@Column(name = "NON_CONVERTED_INVOICE_AMOUNT")
	@ColumnDefault(value = "0.00")
	private BigDecimal nonConvertedInvoiceAmount = BigDecimal.ZERO;

	@Column(name = "CONVERTED_TO_BASE_CURRENCY_AMOUNT")
	@ColumnDefault(value = "0.00")
	private BigDecimal convertedToBaseCurrencyAmount = BigDecimal.ZERO;

	@Column(name = "PARTIALLY_PAID")
	@ColumnDefault(value = "false")
	@Basic(optional = false)
	private Boolean partiallyPaid = Boolean.FALSE;

	@ManyToOne
	@JoinColumn(name = "JOURNAL_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANSACTION_EXPLINATION_LINE_ITEM_JOURNAL_ID_JOURNAL"))
	private Journal journal;

}
