package com.simpleaccounts.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import javax.persistence.*;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

/**
 * Created by mohsin on 3/12/2017.
 */
@NamedQueries({
    @NamedQuery(name = "allTitles",
            query = "SELECT t FROM Title t where t.deleteFlag=false ORDER BY t.defaultFlag DESC, t.orderSequence,t.titleName ASC ")
})

@Entity
@Table(name = "TITLE")
@Data
public class Title implements Serializable {

    private static final long serialVersionUID = 1L;

    	@Id
	@SequenceGenerator(name="TITLE_SEQ", sequenceName="TITLE_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="TITLE_SEQ")
    @Column(name = "TITLE_CODE", updatable = false, nullable = false)
    private int titleCode;
    @Basic(optional = false)
    @Column(name = "TITLE_NAME")
    private String titleName;
    @Basic
    @Column(name = "TITLE_DESCRIPTION")
    private String titleDescription;

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
