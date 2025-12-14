package com.simpleaccounts.entity;

import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Date;
import javax.persistence.*;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name = "COAC_TRANSACTION_CATEGORY")

@Data
@NamedQueries({
		@NamedQuery(name = "findCoacTransactionCategoryForTransctionCategortyId", query = "SELECT tc FROM CoacTransactionCategory tc where tc.transactionCategory.transactionCategoryId=:id ") })
public class CoacTransactionCategory implements Serializable {
	@Id
	@Column(name = "COAC_TRANSACTION_CATEGORY_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="COAC_TRANSACTION_CATEGORY_IDCOAC_TRANSACTION_CATEGORY_SEQ", sequenceName="COAC_TRANSACTION_CATEGORY_IDCOAC_TRANSACTION_CATEGORY_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="COAC_TRANSACTION_CATEGORY_IDCOAC_TRANSACTION_CATEGORY_SEQ")
	private Integer id;

	@Column(name = "ORDER_SEQUENCE")
	@Basic(optional = true)
	private Integer orderSequence;

	@Column(name = "CREATED_BY")
	@Basic(optional = false)
	private Integer createdBy = 0;

	@Column(name = "CREATED_DATE")
	@ColumnDefault(value = "CURRENT_TIMESTAMP")
	@Basic(optional = false)

    private LocalDateTime createdDate = LocalDateTime.now();

	@Column(name = "LAST_UPDATED_BY")
	private Integer lastUpdateBy;

	@Column(name = "LAST_UPDATE_DATE")
	@Temporal(TemporalType.TIMESTAMP)
	private Date lastUpdateDate;

	@Column(name = "DELETE_FLAG")
	@ColumnDefault(value = "false")
	@Basic(optional = false)
	private Boolean deleteFlag = Boolean.FALSE;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "TRANSACTION_CATEGORY_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_COAC_TRANX_CAT_TRANX_CAT_ID_TRANX_CAT"))
	private TransactionCategory transactionCategory;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "CHART_OF_ACCOUNT_CATEGORY_ID ",foreignKey = @javax.persistence.ForeignKey(name = "FK_COAC_TRANX_CAT_COA_CAT_ID_COA_CAT"))
	private ChartOfAccountCategory chartOfAccountCategory;

	@Column(name = "VERSION_NUMBER")
	@ColumnDefault(value = "1")
	@Basic(optional = false)
	@Version
	private Integer versionNumber = 1;

}
