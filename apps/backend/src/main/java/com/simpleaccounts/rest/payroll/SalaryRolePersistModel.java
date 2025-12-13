package com.simpleaccounts.rest.payroll;

import java.io.Serializable;
import lombok.Getter;
import lombok.Setter;

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
