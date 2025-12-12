package com.simpleaccounts.rest.payroll;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.io.Serializable;

/**
 *
 * @author admin
 */
@Getter
@Setter
public class SalaryRolePersistModel implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer id;
    private String salaryRoleName;

}
