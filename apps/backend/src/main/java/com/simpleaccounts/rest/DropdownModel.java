/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.rest;

import java.io.Serializable;
import java.util.Objects;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 *
 * @author uday
 */
@Data
@Builder
@NoArgsConstructor
public class DropdownModel implements Serializable {
	private static final long serialVersionUID = 1L;
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
