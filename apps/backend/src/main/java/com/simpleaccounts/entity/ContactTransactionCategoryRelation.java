package com.simpleaccounts.entity;

import com.simpleaccounts.entity.bankaccount.TransactionCategory;

import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * Created By Zain Khan
 */
@Entity
@Table(name = "USER_CONTACT_TRANSACTION_CATEGORY_RELATION")
@Data
@NamedQueries({})
public class ContactTransactionCategoryRelation {

    	@Id
    @Column(name = "USER_CONTACT_TRANSACTION_CATEGORY_RELATION_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="USER_CONTACT_TRANSACTION_CATEGORY_RELATION_SEQ", sequenceName="USER_CONTACT_TRANSACTION_CATEGORY_RELATION_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="USER_CONTACT_TRANSACTION_CATEGORY_RELATION_SEQ")
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

    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "LAST_UPDATED_BY")
    private Integer lastUpdateBy;

    @Column(name = "LAST_UPDATE_DATE")

    private LocalDateTime lastUpdateDate = LocalDateTime.now();

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TRANSACTION_CATEGORY_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_USER_CONTACT_TRANX_CAT_RELATION_TRANX_CAT_ID_TRANX_CAT"))
    private TransactionCategory transactionCategory;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "CONTACT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_USER_CONTACT_TRANX_CATEGORY_RELATION_CONTACT_ID_CONTACT"))
    private Contact contact;

    @Column(name = "CONTACT_TYPE")
    private Integer contactType;

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;

}

