package com.simpleaccounts.entity;

import java.io.Serializable;
import java.time.LocalDateTime;

import javax.persistence.*;

import org.hibernate.annotations.ColumnDefault;

import lombok.Data;

@Entity
@Table(name = "PRODUCT_CATEGORY")
@Data
public class ProductCategory implements Serializable {

	private static final long serialVersionUID = 848122185643690684L;

	@Id
	@Column(name = "PRODUCT_CATEGORY_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="PRODUCT_CATEGORY_SEQ", sequenceName="PRODUCT_CATEGORY_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="PRODUCT_CATEGORY_SEQ")
	private Integer id;

	@Basic(optional = false)
	@Column(name = "PRODUCT_CATEGORY_NAME")
	private String productCategoryName;

	@Basic
	@Column(name = "PRODUCT_CATEGORY_DESCRIPTION")
	private String productCategoryDescription;

	@Basic
	@Column(name = "PRODUCT_CATEGORY_CODE")
	private String productCategoryCode;

	@Column(name = "CREATED_BY")
	@Basic(optional = false)
	private Integer createdBy = 0;

	@Column(name = "CREATED_DATE")
	@ColumnDefault(value = "CURRENT_TIMESTAMP")
	@Basic(optional = false)
	//@Convert(converter = DateConverter.class)
	private LocalDateTime createdDate;

	@Column(name = "LAST_UPDATED_BY")
	private Integer lastUpdateBy;

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
