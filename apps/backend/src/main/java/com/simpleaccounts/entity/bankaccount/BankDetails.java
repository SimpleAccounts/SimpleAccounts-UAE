package com.simpleaccounts.entity.bankaccount;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Date;
import javax.persistence.*;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;
import org.springframework.transaction.annotation.Transactional;

@Entity
@Table(name = "BANK_DETAILS")
@Data
@Transactional

public class BankDetails implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "BANK_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="BANK_DETAILS_SEQ", sequenceName="BANK_DETAILS_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="BANK_DETAILS_SEQ")
	private Integer bankId;

	@Basic
	@Column(name = "BANK_NAME")
	private String bankName;

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

	@Column(name = "VERSION_NUMBER")
	@ColumnDefault(value = "1")
	@Basic(optional = false)
	@Version
	private Integer versionNumber = 1;

}
