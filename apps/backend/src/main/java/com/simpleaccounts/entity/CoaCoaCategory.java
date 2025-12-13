package com.simpleaccounts.entity;

import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Date;
import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name = "COA_COA_CATEGORY")
@Getter
@Setter
public class CoaCoaCategory implements Serializable{

	@Id
	@Column(name = "COA_COA_CATEGORY_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="COA_COA_CATEGORY_SEQ", sequenceName="COA_COA_CATEGORY_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="COA_COA_CATEGORY_SEQ")
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
	@JoinColumn(name = "CHART_OF_ACCOUNT_ID ",foreignKey = @javax.persistence.ForeignKey(name = "FK_COA_COA_CAT_COA_ID_COA"))
	private ChartOfAccount chartOfAccount;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "CHART_OF_ACCOUNT_CATEGORY_ID ",foreignKey = @javax.persistence.ForeignKey(name = "FK_COA_COA_CAT_COA_CAT_ID_COA_CAT"))
	private ChartOfAccountCategory chartOfAccountCategory;

	@Column(name = "VERSION_NUMBER")
	@ColumnDefault(value = "1")
	@Basic(optional = false)
	@Version
	private Integer versionNumber = 1;

}
