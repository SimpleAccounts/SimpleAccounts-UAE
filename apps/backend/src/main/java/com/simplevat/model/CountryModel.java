/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.model;

import lombok.Data;

/**
 *
 * @author Sonu
 */
@Data
public class CountryModel {

    private String countryCode;

    private String countryName;

    private String countryDescription;

    private String isoAlpha3Code;

    private String countryFullName;
}
