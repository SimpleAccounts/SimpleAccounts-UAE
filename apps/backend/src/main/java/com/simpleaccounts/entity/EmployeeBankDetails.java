package com.simpleaccounts.entity;

import com.simpleaccounts.entity.converter.DateConverter;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;
import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "EMPLOYEE_BANK_DETAILS")
@Data
//@TableGenerator(name = "INCREMENT_INITIAL_VALUE", initialValue = 1000)
public class EmployeeBankDetails  implements Serializable {

    	@Id
    @Column(name = "EMPLOYEE_BANK_DETAILS_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="EMPLOYEE_BANK_DETAILS_SEQ", sequenceName="EMPLOYEE_BANK_DETAILS_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="EMPLOYEE_BANK_DETAILS_SEQ")
    private Integer id;

    @Basic
    @Column(name = "ACCOUNT_HOLDER_NAME")
    private String accountHolderName;

    @Basic
    @Column(name = "ACCOUNT_NUMBER")
    private String accountNumber;

    @Basic
    @Column(name = "IBAN")
    private String iban;

    @Column(name = "BANK_ID")
    private Integer bankId;

    @Basic
    @Column(name = "BANK_NAME")
    private String bankName;

    @Basic
    @Column(name = "BRANCH")
    private String branch;

    @Basic
    @Column(name = "SWIFT_CODE")
    private String swiftCode;

    @Basic
    @Column(name = "ROUTING_CODE")
    private String routingCode;

    @Basic(optional = false)
    @ColumnDefault(value = "false")
    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    @Basic(optional = false)
    @Column(name = "CREATED_BY")
    @ColumnDefault(value = "0")
    private Integer createdBy = 0;

    @Basic(optional = false)
    @Column(name = "CREATED_DATE")
    @ColumnDefault(value = "CURRENT_TIMESTAMP")
    //@Convert(converter = DateConverter.class)
    private LocalDateTime createdDate = LocalDateTime.now();

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

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EMPLOYEE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_EMPLOYEE_BANK_DETAILS_EMPLOYEE_ID_EMPLOYEE"))
    private Employee employee;

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;

}
