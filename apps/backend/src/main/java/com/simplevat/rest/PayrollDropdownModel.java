
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.rest;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 *
 * @author Mudassar
 */
@Data
@Builder
@NoArgsConstructor
public class PayrollDropdownModel {
    private Integer value;
    private String label;
    private String payrollDatelabel;

    public PayrollDropdownModel(Integer value, String label, String payrollDatelabel ){
        this.value = value;
        this.label = label;
        this.payrollDatelabel = payrollDatelabel;
    }
}

