/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import javax.persistence.*;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

/**
 *
 * @author daynil
 */
@Data
@Entity
@Table(name = "CONFIGURATION")
@NamedQueries({
    @NamedQuery(name = "Configuration.findAll", query = "SELECT c FROM Configuration c")
    , @NamedQuery(name = "Configuration.findById", query = "SELECT c FROM Configuration c WHERE c.id = :id")
    , @NamedQuery(name = "Configuration.findByName", query = "SELECT c FROM Configuration c WHERE c.name = :name")
    , @NamedQuery(name = "Configuration.findByValue", query = "SELECT c FROM Configuration c WHERE c.value = :value")})
public class Configuration implements Serializable {

    private static final long serialVersionUID = 1L;
    	@Id
	@SequenceGenerator(name="CONFIGURATION_SEQ", sequenceName="CONFIGURATION_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="CONFIGURATION_SEQ")
    @Basic(optional = false)
    @Column(name = "CONFIGURATION_ID", updatable = false, nullable = false)
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

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;
    @Basic(optional = false)
    @Column(name = "NAME")
    private String name;

    @Basic(optional = true)
    @Column(name = "VALUE", length = 5000)
    private String value;

    @Column(name = "LAST_UPDATED_BY")
    private Integer lastUpdateBy;

    @Column(name = "LAST_UPDATE_DATE")

    private LocalDateTime lastUpdateDate = LocalDateTime.now();

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;

    @Column(name = "LOGGED_IN_USER_EMAIL")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean loggedInUserEmail = Boolean.FALSE;

    @Basic(optional = false)
    @Column(name = "FROM_EMAIL_ADDRESS")
    private String fromEmailAddress;

}
