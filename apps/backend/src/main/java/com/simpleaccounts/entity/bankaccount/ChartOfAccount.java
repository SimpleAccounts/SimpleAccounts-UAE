package com.simpleaccounts.entity.bankaccount;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

import javax.persistence.*;

import com.simpleaccounts.entity.converter.DateConverter;
import org.hibernate.annotations.ColumnDefault;

import com.simpleaccounts.entity.CoaCoaCategory;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Created by mohsinh on 2/26/2017.
 */
@NamedQueries({
		@NamedQuery(name = "findAllChartOfAccount", query = "SELECT c FROM ChartOfAccount c where c.chartOfAccountId > 5 and c.deleteFlag=false and c.chartOfAccountCode NOT IN ('01-02','01-03') ORDER BY c.defaltFlag DESC , c.orderSequence,c.chartOfAccountName ASC"),
		@NamedQuery(name = "findAllChildChartOfAccount", query = "SELECT c FROM ChartOfAccount c where c.deleteFlag=false and c.parentChartOfAccount != null ORDER BY c.defaltFlag DESC , c.orderSequence,c.chartOfAccountName ASC"),
		@NamedQuery(name = "findMoneyInChartOfAccount", query = "SELECT c FROM ChartOfAccount c where c.deleteFlag=false AND c.parentChartOfAccount.chartOfAccountId = 1 ORDER BY c.defaltFlag DESC , c.orderSequence,c.chartOfAccountName ASC"),
		@NamedQuery(name = "findMoneyOutChartOfAccount", query = "SELECT c FROM ChartOfAccount c where c.deleteFlag=false AND c.parentChartOfAccount.chartOfAccountId = 7 ORDER BY c.defaltFlag DESC , c.orderSequence,c.chartOfAccountName ASC") })
@Entity
@Table(name = "CHART_OF_ACCOUNT")
@Data
@NoArgsConstructor
public class ChartOfAccount implements Serializable {

	private static final long serialVersionUID = 1L;
	@Id
	@Column(name = "CHART_OF_ACCOUNT_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="CHART_OF_ACCOUNT_SEQ", sequenceName="CHART_OF_ACCOUNT_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="CHART_OF_ACCOUNT_SEQ")
	private Integer chartOfAccountId;

	@Column(name = "CREATED_BY")
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
	@Temporal(TemporalType.TIMESTAMP)
	private Date lastUpdateDate;

	@Column(name = "CHART_OF_ACCOUNT_NAME")
	@Basic(optional = false)
	private String chartOfAccountName;

	@Column(name = "CHART_OF_ACCOUNT_DESCRIPTION")
	private String chartOfAccountDescription;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "PARENT_CHART_OF_ACCOUNT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_CHART_OF_ACCOUNT_PARENT_CHART_OF_ACCOUNT_ID_CHART_OF_ACCOUNT"))
	private ChartOfAccount parentChartOfAccount;

	@Column(name = "DEBIT_CREDIT_FLAG")
	@Basic(optional = false)
	private Character debitCreditFlag;

	@Column(name = "CHART_OF_ACCOUNT_CODE")
	@Basic(optional = false)
	private String chartOfAccountCode;

	@Column(name = "CHART_OF_ACCOUNT_CATEGORY_CODE")
	private String chartOfAccountCategoryCode;

	@Column(name = "DEFAULT_FLAG")
	@ColumnDefault(value = "'N'")
	@Basic(optional = false)
	private Character defaltFlag;

	@Column(name = "ORDER_SEQUENCE")
	@Basic(optional = true)
	private Integer orderSequence;

	@Column(name = "DELETE_FLAG")
	@ColumnDefault(value = "false")
	@Basic(optional = false)
	private boolean deleteFlag;

	@Column(name = "VERSION_NUMBER")
	@ColumnDefault(value = "1")
	@Basic(optional = false)
	@Version
	private Integer versionNumber = 1;

	@OneToMany(mappedBy = "chartOfAccount", fetch = FetchType.LAZY)
	private List<CoaCoaCategory> transactionChartOfAccountCategoryList;

	public ChartOfAccount(Integer chartOfAccountId) {
		this.chartOfAccountId = chartOfAccountId;
	}
}
