package com.simpleaccounts.entity;

import java.io.Serializable;
import java.time.LocalDateTime;

import javax.persistence.*;

import org.hibernate.annotations.ColumnDefault;

import lombok.Data;

@Entity
@Table(name = "DATE_FORMAT")
@Data
public class DateFormat  implements Serializable{

	/**
	 *
	 */
	private static final long serialVersionUID = 1L;

	@Id
	@SequenceGenerator(name="DATE_FORMAT_SEQ", sequenceName="DATE_FORMAT_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="DATE_FORMAT_SEQ")
	@Column(name = "DATE_FORMAT_ID", updatable = false, nullable = false)
	private Integer id;

	@Basic
	@Column(name = "format")
	private String format;

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

	@Column(name = "VERSION_NUMBER")
	@ColumnDefault(value = "1")
	@Basic(optional = false)
	@Version
	private Integer versionNumber = 1;

}
