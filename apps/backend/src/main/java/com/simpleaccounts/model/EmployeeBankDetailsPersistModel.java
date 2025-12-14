package com.simpleaccounts.model;

import java.io.Serializable;
import java.time.LocalDateTime;
import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 *
 * @author admin
 */
@Getter
@Setter
public class EmployeeBankDetailsPersistModel implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer id;
    private String accountHolderName;
    private String accountNumber;
    private String iban;
    private Integer bankId;
    private String bankName;
    private String branch;
    private String swiftCode;
    private String routingCode;
    private Boolean isActive;
    private Integer employee;
    private Integer createdBy = 0;
    private LocalDateTime createdDate = LocalDateTime.now();
    private Integer lastUpdatedBy;
    private LocalDateTime lastUpdateDate;
    private Boolean deleteFlag = Boolean.FALSE;
    private Integer versionNumber = 1;
    private String  agentId;
    private Integer employmentId;
}
