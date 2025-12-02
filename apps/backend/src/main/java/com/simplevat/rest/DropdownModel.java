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

import java.util.Objects;

/**
 *
 * @author uday
 */
@Data
@Builder
@NoArgsConstructor
public class DropdownModel {
    private Integer value;
    private String label;

    
    public DropdownModel(Integer value, String label ){
        this.value = value;
        this.label = label;

    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DropdownModel that = (DropdownModel) o;
        return value.equals(that.value) && label.equals(that.label);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value, label);
    }
}
