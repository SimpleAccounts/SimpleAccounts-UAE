package com.simpleaccounts.entity;

import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import java.math.BigDecimal;
import java.util.Date;
import javax.persistence.*;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "TRANSACTION_CATEGORY_BALANCE")
@Data
public class TransactionCategoryBalance {

	@Id
	@Column(name = "TRANSACTION_CATEGORY_BALANCE_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="TRANSACTION_CATEGORY_BALANCE_SEQ", sequenceName="TRANSACTION_CATEGORY_BALANCE_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="TRANSACTION_CATEGORY_BALANCE_SEQ")
	private Integer id;

	@OneToOne
	@JoinColumn(name = "TRANSACTION_CATEGORY_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANX_CAT_BALANCE_TRANX_CAT_ID_TRANX_CAT"))
	@Basic(optional = false)
	private TransactionCategory transactionCategory;

	@Column(name = "OPENING_BALANCE")
	@ColumnDefault(value = "0.00")
	@Basic(optional = false)
	private BigDecimal openingBalance = BigDecimal.ZERO;

	@Column(name = "RUNNING_BALANCE")
	@ColumnDefault(value = "0.00")
	@Basic(optional = false)
	private BigDecimal runningBalance = BigDecimal.ZERO;

	@Column(name = "EFFECTIVE_DATE")
	@ColumnDefault(value = "CURRENT_TIMESTAMP")
	@Basic(optional = false)
	private Date effectiveDate;

	@Column(name = "CREATED_BY")
	@Basic(optional = false)
	private Integer createdBy = 0;

	@Column(name = "CREATED_DATE")
	@ColumnDefault(value = "CURRENT_TIMESTAMP")
	@Basic(optional = false)
	@Temporal(TemporalType.TIMESTAMP)
	@CreationTimestamp
	private Date createdDate;

	@Column(name = "LAST_UPDATED_BY")
	private Integer lastUpdateBy;

	@Column(name = "LAST_UPDATE_DATE")
	@Temporal(TemporalType.TIMESTAMP)
	@UpdateTimestamp
	private Date lastUpdateDate;

	@Column(name = "DELETE_FLAG")
	@ColumnDefault(value = "false")
	@Basic(optional = false)
	private boolean deleteFlag;

	@Column(name = "VERSION_NUMBER")
	@ColumnDefault(value = "1")
	@Basic(optional = false)
	@Version
	private Integer versionNumber = 1;

}
