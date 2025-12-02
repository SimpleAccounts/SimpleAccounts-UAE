package com.simplevat.rest.payroll;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Basic;
import javax.persistence.Column;
import java.io.Serializable;

/**
 *
 * @author admin
 */
@Getter
@Setter
public class SalaryStructurePersistModel implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer id;
    private String type;
    private String name;
}
