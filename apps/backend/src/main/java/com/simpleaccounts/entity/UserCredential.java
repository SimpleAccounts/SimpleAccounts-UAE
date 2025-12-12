package com.simpleaccounts.entity;

import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "USER_CREDENTIAL")
@Data
public class UserCredential {
    	@Id
    @Column(name = "USER_CREDENTIAL_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="USER_CREDENTIAL_SEQ", sequenceName="USER_CREDENTIAL_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="USER_CREDENTIAL_SEQ")
    private Integer id;

    @Column(name = "CREATED_BY")
    @ColumnDefault(value = "0")
    @Basic(optional = false)
    private Integer createdBy = 0;

    @Column(name = "CREATED_DATE")
    @ColumnDefault(value = "CURRENT_TIMESTAMP")
    @Basic(optional = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    @Basic
    @Column(name = "LAST_UPDATED_BY")
    private Integer lastUpdatedBy;

    @Basic
    //@Convert(converter = DateConverter.class)
    @Column(name = "LAST_UPDATE_DATE")
    private LocalDateTime lastUpdateDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "USER_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_USER_CREDENTIAL_USER_ID_USER"))
    private User user;

    @Basic(optional = false)
    @Column(name = "USER_PASSWORD")
    private String password;

    @Basic(optional = false)
    @ColumnDefault(value = "false")
    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

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
