package com.simpleaccounts.entity.bankaccount;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Date;
import javax.persistence.*;

import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

/**
 * Created by Uday on 9/28/2017.
 */
@NamedQueries({
    @NamedQuery(name = "allBankAccountType",
            query = "SELECT v FROM BankAccountType v where v.id not in (3) order by v.defaultFlag DESC, v.orderSequence,v.name ASC ")
})
@Entity
@Table(name = "BANK_ACCOUNT_TYPE")
@Data
public class BankAccountType implements Serializable {

    private static final long serialVersionUID = 1L;
    	@Id
    @Basic(optional = false)
    @Column(name = "BANK_ACCOUNT_TYPE_CODE", updatable = false, nullable = false)
	@SequenceGenerator(name="BANK_ACCOUNT_TYPE_SEQ", sequenceName="BANK_ACCOUNT_TYPE_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="BANK_ACCOUNT_TYPE_SEQ")
    private Integer id;

    @Basic(optional = false)
    @Column(name = "NAME")
    private String name;

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

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;

}
