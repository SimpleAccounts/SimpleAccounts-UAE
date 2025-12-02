/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Date;
import javax.persistence.*;

import com.simplevat.entity.converter.DateConverter;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

/**
 *
 * @author daynil
 */
@Data
@Entity
@Table(name = "DOCUMENT_TEMPLATE")
@NamedQueries({ @NamedQuery(name = "DocumentTemplate.findAll", query = "SELECT d FROM DocumentTemplate d"),
		@NamedQuery(name = "DocumentTemplate.findById", query = "SELECT d FROM DocumentTemplate d WHERE d.id = :id"),
		@NamedQuery(name = "DocumentTemplate.findByName", query = "SELECT d FROM DocumentTemplate d WHERE d.name = :name"),
		@NamedQuery(name = "DocumentTemplate.findByType", query = "SELECT d FROM DocumentTemplate d WHERE d.type = :type") })

public class DocumentTemplate implements Serializable {

	private static final long serialVersionUID = 1L;
	@Id
	@SequenceGenerator(name="DOCUMENT_TEMPLATE_SEQ", sequenceName="DOCUMENT_TEMPLATE_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="DOCUMENT_TEMPLATE_SEQ")
	@Basic(optional = false)
	@Column(name = "DOCUMENT_TEMPLATE_ID", updatable = false, nullable = false)
	private Integer id;

	@Column(name = "ORDER_SEQUENCE")
	@Basic(optional = true)
	private Integer orderSequence;

	@Column(name = "CREATED_BY")
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
	@Temporal(TemporalType.TIMESTAMP)
	private Date lastUpdateDate;

	@Column(name = "DELETE_FLAG")
	@ColumnDefault(value = "false")
	@Basic(optional = false)
	private Boolean deleteFlag = Boolean.FALSE;
	@Basic(optional = false)
	@Column(name = "NAME")
	private String name;

	@Basic(optional = false)
	@Column(name = "TYPE")
	private Integer type;

	@Column(name = "VERSION_NUMBER")
	@ColumnDefault(value = "1")
	@Basic(optional = false)
	@Version
	private Integer versionNumber = 1;

	@Basic(optional = false)
	@Lob
	@Column(name = "TEMPLATE")
	private byte[] template;

	public DocumentTemplate() {
	}

	public DocumentTemplate(Integer id) {
		this.id = id;
	}

	public DocumentTemplate(Integer id, String name, Integer type, byte[] template) {
		this.id = id;
		this.name = name;
		this.type = type;
		this.template = template;
	}

	@Override
	public int hashCode() {
		int hash = 0;
		hash += (id != null ? id.hashCode() : 0);
		return hash;
	}

	@Override
	public boolean equals(Object object) {
		// Warning - this method won't work in the case the id fields are not set
		if (!(object instanceof DocumentTemplate)) {
			return false;
		}
		DocumentTemplate other = (DocumentTemplate) object;
		return !((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id)));
	}

	@Override
	public String toString() {
		return "com.simplevat.entity.DocumentTemplate[ id=" + id + " ]";
	}

}
