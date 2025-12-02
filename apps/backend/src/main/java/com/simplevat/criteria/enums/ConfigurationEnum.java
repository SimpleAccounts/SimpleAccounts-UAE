/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.criteria.enums;

/**
 *
 * @author daynil
 */
public enum ConfigurationEnum {
    INVOICE_TEMPLATE("INVOICE_TEMPLATE");

    private String configurationName;

    ConfigurationEnum(String configurationName) {
        this.configurationName = configurationName;
    }

    public String configurationName() {
        return configurationName;
    }
}
