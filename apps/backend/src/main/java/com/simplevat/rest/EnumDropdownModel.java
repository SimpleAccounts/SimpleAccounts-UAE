/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.rest;

import lombok.Builder;
import lombok.Data;

/**
 *
 * @author ashish
 */
@Data
@Builder
public class EnumDropdownModel {
    private String value;
    private String label;
    
    public EnumDropdownModel(String value, String label){
        this.value = value;
        this.label = label;
    }
}
