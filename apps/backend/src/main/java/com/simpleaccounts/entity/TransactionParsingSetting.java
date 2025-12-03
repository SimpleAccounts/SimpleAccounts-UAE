package com.simpleaccounts.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

import javax.persistence.*;

import org.hibernate.annotations.ColumnDefault;

import com.simpleaccounts.constant.ExcellDelimiterEnum;

import lombok.Data;


@Entity
@Table(name = "TRANSACTION_PARSING_SETTING")
@Data
@NamedQueries({
		@NamedQuery(name = "getDateFormatIdTemplateId", query = "select df.format from TransactionParsingSetting t inner join DateFormat df on df.id=t.dateFormat where t.id = :id") })
public class TransactionParsingSetting implements Serializable {

	private static final long serialVersionUID = 1L;
	@Id
	@SequenceGenerator(name="TRANSACTION_PARSING_SETTING_SEQ", sequenceName="TRANSACTION_PARSING_SETTING_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="TRANSACTION_PARSING_SETTING_SEQ")
	@Column(name = "TRANSACTION_PARSING_SETTING_ID", updatable = false, nullable = false)
	private Long id;

	@Basic
	@Column(name = "NAME")
	private String name;

	@Column
	@Enumerated(EnumType.STRING)
	private ExcellDelimiterEnum delimiter;

	@Column(name = "OTHER_DELIMITER")
	private String otherDilimiterStr;

	@Column(name = "SKIP_ROWS")
	private Integer skipRows;

	@Column(name = "END_ROWS")
	private Integer endRows;

	@Column(name = "SKIP_COLUMNS")
	private String skipColumns;


	@Column(name = "HEADER_ROW_NO")
	private Integer headerRowNo;


	@Column(name = "TEXT_QUALIFIER")
	private String textQualifier;

	@OneToOne
	@JoinColumn(name = "DATE_FORMAT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANSACTION_PARSING_SETTING_DATE_FORMAT_ID_DATE_FORMAT"))
	private DateFormat dateFormat;

	@Column(name = "CREATED_BY")
	@Basic(optional = false)
	private Integer createdBy = 0;

	@Column(name = "CREATED_DATE")
	@ColumnDefault(value = "CURRENT_TIMESTAMP")
	@Basic(optional = false)
	//@Convert(converter = DateConverter.class)
	private LocalDateTime createdDate;

	@Basic
	@Column(name = "LAST_UPDATED_BY")
	private Integer lastUpdatedBy;

	@Basic
	@Column(name = "LAST_UPDATE_DATE")
	//@Convert(converter = DateConverter.class)
	private LocalDateTime lastUpdateDate;

	@Column(name = "DELETE_FLAG")
	@ColumnDefault(value = "false")
	@Basic(optional = false)
	private Boolean deleteFlag = Boolean.FALSE;

	@OneToMany(cascade = CascadeType.ALL)
	@JoinColumn(name = "TRANSACTION_PARSING_SETTING_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANX_PARS_SETTING_TRANX_DATA_COL_MAP_ID_TRANX_DATA_COL_MAP"))
	private List<TransactionDataColMapping> transactionDataColMapping;

	@Column(name = "VERSION_NUMBER")
	@ColumnDefault(value = "1")
	@Basic(optional = false)
	@Version
	private Integer versionNumber = 1;

}
