package com.simpleaccounts.model;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.io.Serializable;

/**
 *
 * @author suraj
 */
@Getter
@Setter
public class EmployeeDesignationPersistModel implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer id;
    private String designationName;
    private Integer designationId;
    private Integer ParentId;
    private Boolean deleteFlag = Boolean.FALSE;
}
