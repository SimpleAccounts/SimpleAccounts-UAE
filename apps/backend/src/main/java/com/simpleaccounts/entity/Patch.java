/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Date;
import javax.persistence.*;

import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

/**
 *
 * @author admin
 */
@Entity
@Table(name = "PATCH")
@Data
public class Patch implements Serializable {

    private static final long serialVersionUID = 1L;

    	@Id
    @Column(name = "PATCH_ID", updatable = false, nullable = false)
    @Basic(optional = false)
	@SequenceGenerator(name="PATCH_SEQ", sequenceName="PATCH_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="PATCH_SEQ")
    private Integer id;

    @Column(name = "EXECUTION_DATE")
    @Basic(optional = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date executionData;

    @Basic(optional = false)
    @Column(name = "PATCH_NO", length = 255)
    private String patchNo;

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
