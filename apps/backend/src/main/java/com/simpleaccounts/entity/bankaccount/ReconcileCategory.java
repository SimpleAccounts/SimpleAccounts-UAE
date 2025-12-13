package com.simpleaccounts.entity.bankaccount;

import java.io.Serializable;

import javax.persistence.*;

import org.hibernate.annotations.ColumnDefault;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "RECONCILE_CATEGORY")
@Data
@NoArgsConstructor
@AllArgsConstructor
@NamedQueries({
		@NamedQuery(name = "allReconcileCategoryByparentReconcileCategoryId", query = "from ReconcileCategory rc where rc.deleteFlag = false and rc.parentReconcileCategory.id = :code") })
public class ReconcileCategory implements Serializable {

	private static final long serialVersionUID = 1L;
	@Id
	@Column(name = "RECONCILE_CATEGORY_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="RECONCILE_CATEGORY_SEQ", sequenceName="RECONCILE_CATEGORY_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="RECONCILE_CATEGORY_SEQ")
	private Integer id;

	@Column(name = "RECONCILE_CATEGORY_NAME")
	@Basic(optional = false)
	private String reconcileCategoryName;

	@Column(name = "RECONCILE_CATEGORY_DESCRIPTION")
	private String reconcileCategoryDescription;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "PARENT_RECONCILE_CATEGORY_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_REC_CATEGORY_PARENT_REC_CATEGORY_ID_REC_CATEGORY"))
	private ReconcileCategory parentReconcileCategory;

	@Column(name = "RECONCILE_CATEGORY_CODE")
	@Basic(optional = false)
	private String reconcileCategoryCode;

	@Column(name = "DEFAULT_FLAG")
	@ColumnDefault(value = "'N'")
	@Basic(optional = false)
	private Character defaltFlag;

	@Column(name = "ORDER_SEQUENCE")
	@Basic(optional = true)
	private Integer orderSequence;

	@Column(name = "DELETE_FLAG")
	@ColumnDefault(value = "false")
	@Basic(optional = false)
	private boolean deleteFlag;

	@Column(name = "VERSION_NUMBER")
	@ColumnDefault(value = "1")
	@Basic(optional = false)
	@Version
	private Integer versionNumber = 1;
}
