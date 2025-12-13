package com.simpleaccounts.entity;

import com.simpleaccounts.constant.CommonConstant;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import java.io.Serializable;
import java.time.LocalDateTime;
import javax.persistence.*;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Type;

/**
 * Created by mohsinh on 2/26/2017.
 */
@NamedQueries({
		@NamedQuery(name = "findAllUsers", query = "SELECT u FROM User u where u.deleteFlag = FALSE  ORDER BY u.isActive DESC,u.firstName ASC"),
		@NamedQuery(name = "userForPayrollDropdown", query = "SELECT  new " + CommonConstant.DROPDOWN_MODEL_PACKAGE + "(c.userId , CONCAT(r.roleName)) "
				+ " FROM User c,Role r where c.role.roleCode=r.roleCode and r.roleCode in (1,2,3,104) and  c.userId= :userId  AND c.deleteFlag = FALSE"),
		@NamedQuery(name = "userForDropdown", query = "SELECT  new " + CommonConstant.DROPDOWN_MODEL_PACKAGE + "(c.userId , CONCAT(c.firstName,' ', c.lastName)) "
				+ " FROM User c where  c.deleteFlag = FALSE order by c.firstName, c.lastName ")})
@Entity
@Table(name = "SA_USER")
@Data
public class User implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "USER_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="USER_SEQ", sequenceName="USER_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="USER_SEQ")
	private Integer userId;

	@Basic
	@Column(name = "FIRST_NAME")
	private String firstName;

	@Basic(optional = false)
	@Column(name = "USER_EMAIL", unique = true)
	private String userEmail;

	@Basic
	@Column(name = "LAST_NAME")
	private String lastName;

	@Basic
	@Column(name = "DATE_OF_BIRTH")

	private LocalDateTime dateOfBirth;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "COMPANY_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_SA_USER_COMPANY_ID_COMPANY"))
	private Company company;

	@Column(name = "CREATED_BY")
	@Basic(optional = false)
	private Integer createdBy = 0;

	@Column(name = "CREATED_DATE")
	@ColumnDefault(value = "CURRENT_TIMESTAMP")
	@Basic(optional = false)
	private LocalDateTime createdDate;

	@Basic
	@Column(name = "LAST_UPDATED_BY")
	private Integer lastUpdatedBy;

	@Basic

	@Column(name = "LAST_UPDATE_DATE")
	private LocalDateTime lastUpdateDate;

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

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "ROLE_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_SA_USER_ROLE_CODE_ROLE"))
	private Role role;

	@Column(name = "USER_PASSWORD")
	private String password;

	@Basic
	@Lob
	@Type(type = "org.hibernate.type.ImageType")
	@Column(name = "PROFILE_IMAGE")
	private byte[] profileImageBinary;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "EMPLOYEE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_SA_USER_EMPLOYEE_ID_EMPLOYEE"))
	private Contact employeeId;

	@Column(name = "FORGOT_PASS_TOKEN", length = 4000)
	private String forgotPasswordToken;

	@Column(name = "USER_TIMEZONE")
	private String userTimezone;

	@Column(name = "FORGOT_PASSWORD_TOKEN_EXPIRY_DATE")
	private LocalDateTime forgotPasswordTokenExpiryDate;

	@OneToOne
	@JoinColumn(name = "TRANSACTION_CATEGORY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_SA_USER_TRANSACTION_CATEGORY_CODE_TRANSACTION_CATEGORY"))
	private TransactionCategory transactionCategory;

	@Column(name = "IS_DESIGNATION_ENABLED")
	@ColumnDefault(value = "false")
	private Boolean isDesignationEnabled = Boolean.FALSE;

	@PrePersist
	public void updateDates() {
		createdDate = LocalDateTime.now();
		lastUpdateDate = LocalDateTime.now();
	}

	@PreUpdate
	public void updateLastUpdatedDate() {
		lastUpdateDate = LocalDateTime.now();
	}
}
