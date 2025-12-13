package com.simpleaccounts.entity.bankaccount;

import java.io.Serializable;
import java.time.LocalDateTime;

import javax.persistence.*;

import lombok.Data;

import org.hibernate.annotations.ColumnDefault;

/**
 * Created by mohsinh on 2/26/2017.
 */
@NamedQueries({
    @NamedQuery(name = "allBankAccountStatuses",
            query = "SELECT status FROM BankAccountStatus status where status.deleteFlag = FALSE order by status.defaultFlag DESC, status.orderSequence,status.bankAccountStatusName ASC"),
    @NamedQuery(name = "findBankAccountStatusByName",
            query = "SELECT status "
            + "FROM BankAccountStatus status where status.bankAccountStatusName = :status")
})
@Entity
@Table(name = "BANK_ACCOUNT_STATUS")
@Data
public class BankAccountStatus implements Serializable{

    	@Id
    @Column(name = "BANK_ACCOUNT_STATUS_CODE", updatable = false, nullable = false)
	@SequenceGenerator(name="BANK_ACCOUNT_STATUS_SEQ", sequenceName="BANK_ACCOUNT_STATUS_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="BANK_ACCOUNT_STATUS_SEQ")
    private Integer bankAccountStatusCode;

    @Basic(optional = false)
    @Column(name = "BANK_ACCOUNT_STATUS_NAME")
    private String bankAccountStatusName;

    @Basic
    @Column(name = "BANK_ACCOUNT_STATUS_DESCRIPTION")
    private String bankAccountStatusDescription;

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
