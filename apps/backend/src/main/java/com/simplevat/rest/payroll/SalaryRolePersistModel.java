package com.simplevat.rest.payroll;

import com.simplevat.entity.Employee;
import lombok.Builder;
import lombok.Data;
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
