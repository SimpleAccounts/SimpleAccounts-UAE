package com.simpleaccounts.rest.excisetaxcontroller;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

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