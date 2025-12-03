package com.simpleaccounts.entity;
import com.simpleaccounts.entity.converter.DateConverter;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;
import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.Date;

@Data
@Entity
@Table(name = "EMPLOYEE_PARENT_RELATION")
public class EmployeeParentRelation {

    	@Id
    @Column(name = "EMPLOYEE_PARENT_RELATION_ID")
	@SequenceGenerator(name="EMPLOYEE_PARENT_RELATION_SEQ", sequenceName="EMPLOYEE_PARENT_RELATION_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="EMPLOYEE_PARENT_RELATION_SEQ")
    private Integer id;

    @Basic(optional = false)
    @Column(name = "CREATED_BY")
    @ColumnDefault(value = "0")
    private Integer createdBy = 0;

    @Basic(optional = false)
    @Column(name = "CREATED_DATE")
    @ColumnDefault(value = "CURRENT_TIMESTAMP")
    //@Convert(converter = DateConverter.class)
    private LocalDateTime createdDate = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PARENT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_EMPLOYEE_PARENT_RELATION_PARENT_ID_EMPLOYEE"))
    private Employee parentID;

    @Column(name = "PARENT_TYPE")
    @Basic
    private Integer parentType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CHILD_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_EMPLOYEE_PARENT_RELATION_CHILD_ID_EMPLOYEE"))
    private Employee childID;

    @Column(name = "CHILD_TYPE")
    @Basic
    private Integer childType;

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

    @Column(name = "ORDER_SEQUENCE")
    @Basic(optional = true)
    private Integer orderSequence;

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;

}
