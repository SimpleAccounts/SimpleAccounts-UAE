package com.simplevat.rest.payroll;


import com.simplevat.entity.SalaryStructure;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;

@Data
public class SalaryTemplateModel {

    private Integer id ;
    private String description;
    private String formula;
    private String flatAmount;


}
