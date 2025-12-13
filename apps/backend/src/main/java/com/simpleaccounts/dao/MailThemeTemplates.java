package com.simpleaccounts.dao;

import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;

/**
 *
 * @author Suraj Rahade
 *
 * Note :
 *
 * type
 * 1    Customer Invoice
 * 2    Supplier Invoice
 * 3    RFQ
 * 4    PO
 * 5    GRN
 * 6    Quotation
 * 7    CN
 *
 */
@Data
@Entity
@Table(name = "MAIL_THEME_TEMPLATES")
public class MailThemeTemplates implements Serializable {
    private static final long serialVersionUID = 1L;
    	@Id
	@SequenceGenerator(name="MAIL_THEME_TEMPLATES_SEQ", sequenceName="MAIL_THEME_TEMPLATES_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="MAIL_THEME_TEMPLATES_SEQ")
	@Column(name = "ID", updatable = false, nullable = false)
    private Integer id;
    @Basic
    @Column(name = "MODULE_ID")
    private Integer moduleId;
    @Basic
    @Column(name = "TEMPLATE_ID")
    private Integer templateId;
    @Basic
    @Column(name = "TEMPLATE_ENABLE")
    private boolean templateEnable;
    @Basic
    @Column(name = "TEMPLATE_SUBJECT")
    private String templateSubject;
    @Basic
    @Column(name = "TEMPLATE_BODY", length = 5000)
    private String templateBody;
    @Basic
    @Column(name = "PATH")
    private String path;
    @Basic
    @Column(name = "MODULE_NAME")
    private String moduleName;
}
