package com.simpleaccounts.entity;
import com.simpleaccounts.entity.converter.DateConverter;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.Date;

/**
 * Created By Muzammil Sayed On 28-2-2022
 */


@Entity
@Table(name = "EMAIL_LOGS")
@Data
@NoArgsConstructor
//@TableGenerator(name = "INCREMENT_INITIAL_VALUE", initialValue = 1000)
public class EmailLogs {

    	@Id
    @Column(name = "EMAIL_LOGS_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="EMAIL_LOGS_SEQ", sequenceName="EMAIL_LOGS_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="EMAIL_LOGS_SEQ")
    private Integer id;

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
    //@Convert(converter = DateConverter.class)
    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "LAST_UPDATED_BY")
    private Integer lastUpdateBy;

    @Column(name = "LAST_UPDATE_DATE")
   //@Convert(converter = DateConverter.class)
    private LocalDateTime lastUpdateDate = LocalDateTime.now();

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

    @Column(name = "BASE_URl")
    @Basic(optional = false)
    private String baseUrl;

    @Column(name = "EMAIL_DATE")
//	//@Convert(converter = DateConverter.class)
    private LocalDateTime emailDate;

    @Column(name = "MODULE_NAME")
    @Basic(optional = false)
    private String moduleName;

    @Column(name = "EMAIL_FROM")
    @Basic(optional = false)
    private String emailFrom;

    @Column(name = "EMAIL_TO")
    @Basic(optional = false)
    private String emailTo;

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;

}

