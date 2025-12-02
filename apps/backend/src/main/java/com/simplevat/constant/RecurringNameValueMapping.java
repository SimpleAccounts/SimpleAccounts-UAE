/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.constant;

import lombok.Data;

/**
 *
 * @author admin
 */
@Data
public class RecurringNameValueMapping {

    private String name;
    private Integer value;

    public RecurringNameValueMapping() {
    }

    public RecurringNameValueMapping(String name, int value) {
        this.name = name;
        this.value = value;
    }

}
