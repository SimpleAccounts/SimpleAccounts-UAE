package com.simpleaccounts.rest.excisetaxcontroller;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ExciseTaxModel {
    public ExciseTaxModel() {
        // TODO Auto-generated constructor stub
    }
    private Integer id;
    private BigDecimal excise;
    private String name;
}