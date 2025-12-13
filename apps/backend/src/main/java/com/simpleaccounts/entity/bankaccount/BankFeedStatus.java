package com.simpleaccounts.entity.bankaccount;

import java.io.Serializable;
import java.time.LocalDateTime;

import lombok.Data;

import javax.persistence.*;

import org.hibernate.annotations.ColumnDefault;

/**
 * Created by mohsinh on 2/26/2017.
 */
@Entity
@Table(name = "BANK_FEED_STATUS")
@Data
public class BankFeedStatus implements Serializable {

    private static final long serialVersionUID = 1L;
    	@Id
    @Column(name = "BANK_FEED_STATUS_CODE", updatable = false, nullable = false)
	@SequenceGenerator(name="BANK_FEED_STATUS_SEQ", sequenceName="BANK_FEED_STATUS_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="BANK_FEED_STATUS_SEQ")
    private int bankFeedStatusCode;

    @Basic(optional = false)
    @Column(name = "BANK_FEED_STATUS_NAME")
    private String bankFeedStatusName;

    @Basic
    @Column(name = "BANK_FEED_STATUS_DESCRIPTION")
    private String bankFeedStatusDescription;

    @Column(name = "DEFAULT_FLAG")
    @ColumnDefault(value = "'N'")
    @Basic(optional = false)
    private Character defaultFlag;

    @Column(name = "ORDER_SEQUENCE")
    @Basic(optional = true)
    private Integer orderSequence;

    @Column(name = "CREATED_BY")
    @ColumnDefault(value = "0")
    @Basic(optional = false)
    private Integer createdBy = 0;

    @Column(name = "CREATED_DATE")
    @ColumnDefault(value = "CURRENT_TIMESTAMP")
    @Basic(optional = false)

    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "LAST_UPDATED_BY")
    private Integer lastUpdateBy;

    @Column(name = "LAST_UPDATE_DATE")

    private LocalDateTime lastUpdateDate = LocalDateTime.now();

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
