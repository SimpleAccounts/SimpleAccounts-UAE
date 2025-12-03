package com.simpleaccounts.entity;

import java.io.Serializable;
import java.time.LocalDateTime;

import javax.persistence.*;

import org.hibernate.annotations.ColumnDefault;

import com.simpleaccounts.entity.converter.DateConverter;

import lombok.Data;

@Entity
@Table(name = "TRANSACTION_DATA_COL_MAPPING")
@Data
public class TransactionDataColMapping implements Serializable{
	/**
	 *
	 */
	private static final long serialVersionUID = 1L;

	@Id
	@SequenceGenerator(name="TRANSACTION_DATA_COL_MAPPING_SEQ", sequenceName="TRANSACTION_DATA_COL_MAPPING_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="TRANSACTION_DATA_COL_MAPPING_SEQ")
	@Column(name = "TRANSACTION_DATA_COL_MAPPING_ID", updatable = false, nullable = false)
	private Integer id;

	@Column(name = "COL_NAME")
	private String colName;

	@Column(name = "FILE_COL_INDEX")
	private Integer fileColIndex;

	@OneToOne
	@JoinColumn(name = "DATE_FORMAT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANSACTION_DATA_COL_MAPPING_DATE_FORMAT_ID_DATE_FORMAT"))
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

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "TRANSACTION_PARSING_SETTING_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANX_DATA_COL_MAP_TRANX_PARS_SET_TRANX_PARS_SET_ID"))
	private TransactionParsingSetting transactionParsingSettingId;

	@Column(name = "VERSION_NUMBER")
	@ColumnDefault(value = "1")
	@Basic(optional = false)
	@Version
	private Integer versionNumber = 1;
}
