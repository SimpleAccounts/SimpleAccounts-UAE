package com.simpleaccounts.rest.payroll;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.List;

/**
 *
 * @author admin
 */

@Getter
@Setter
public class SalaryTemplatePersistModel implements Serializable {

    private static final long serialVersionUID = 1L;
    private String salaryTemplatesString;
    private List<SalaryTemplatePersistModel> salaryTemplatePersistModelList;
    private Integer id;
    private Integer salaryComponentId;

}
