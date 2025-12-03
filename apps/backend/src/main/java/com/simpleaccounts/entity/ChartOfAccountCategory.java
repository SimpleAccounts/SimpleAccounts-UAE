package com.simpleaccounts.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

import javax.persistence.*;

import com.simpleaccounts.entity.converter.DateConverter;
import org.hibernate.annotations.ColumnDefault;

import lombok.Data;

@Entity
@Table(name = "CHART_OF_ACCOUNT_CATEGORY")
@Data
@NamedQueries({
		@NamedQuery(name = "allChartOfAccountCategory", query = "SELECT c FROM ChartOfAccountCategory c where c.deleteFlag = FALSE") })
public class ChartOfAccountCategory implements Serializable {

	@Id
	@Column(name = "CHART_OF_ACCOUNT_CATEGORY_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="CHART_OF_ACCOUNT_CATEGORY_SEQ", sequenceName="CHART_OF_ACCOUNT_CATEGORY_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="CHART_OF_ACCOUNT_CATEGORY_SEQ")
	private Integer chartOfAccountCategoryId;

	@Column(name = "CHART_OF_ACCOUNT_CATEGORY_NAME")
	@Basic(optional = false)
	private String chartOfAccountCategoryName;

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

	@Column(name = "CHART_OF_ACCOUNT_CATEGORY_DESCRIPTION")
	private String chartOfAccountCategoryDescription;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "PARENT_CHART_OF_ACCOUNT_CATEGORY_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_COA_CAT_PARENT_COA_CAT_ID_COA_CAT"))
	private ChartOfAccountCategory parentChartOfAccount;

	@Column(name = "CHART_OF_ACCOUNT_CATEGORY_CODE")
	@Basic(optional = false)
	private String chartOfAccountCategoryCode;

	@Column(name = "SELECT_FLAG")
	@ColumnDefault(value = "'N'")
	@Basic(optional = false)
	private Character selectFlag;

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

	@OneToMany(mappedBy = "chartOfAccountCategory", fetch = FetchType.LAZY)
	private List<CoaCoaCategory> coacoaCategoryList;

	@OneToMany(mappedBy = "chartOfAccountCategory", fetch = FetchType.LAZY)
	private List<CoacTransactionCategory> coatransactionCategoryList;

}
