package com.simpleaccounts.rest;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DropdownObjectModel {

    private Integer value;
    private Object label;

    public DropdownObjectModel(Integer value, Object label){
        this.value = value;
        this.label = label;
    }
}
