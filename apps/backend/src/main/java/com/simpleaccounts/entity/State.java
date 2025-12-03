package com.simpleaccounts.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Date;

import javax.persistence.*;

import com.simpleaccounts.entity.converter.DateConverter;
import org.hibernate.annotations.ColumnDefault;

import lombok.Data;


@NamedQueries({

		@NamedQuery(name = "getStateIdByInputColumnValue", query = "SELECT s.id FROM State s where s.stateName=:val")
})


@Entity
@Table(name = "STATE")
@Data
public class State implements Serializable {
	private static final long serialVersionUID = 1L;
	@Id
	@Column(name = "STATE_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="STATE_SEQ", sequenceName="STATE_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="STATE_SEQ")
	private int id;

	@Basic(optional = false)
	@Column(name = "STATE_NAME")
	private String stateName;

	@OneToOne
	@JoinColumn(name = "COUNTRY_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_STATE_COUNTRY_ID_COUNTRY"))
	private Country country;

	@Column(name = "DEFAULT_FLAG")
	@ColumnDefault(value = "'N'")
	@Basic(optional = false)
	private Character defaltFlag;

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
	private boolean deleteFlag;

	@Column(name = "VERSION_NUMBER")
	@ColumnDefault(value = "1")
	@Basic(optional = false)
	@Version
	private Integer versionNumber = 1;

}
