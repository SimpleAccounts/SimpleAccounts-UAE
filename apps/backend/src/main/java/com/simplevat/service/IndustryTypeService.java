/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.service;

import com.simplevat.entity.IndustryType;
import java.util.List;

/**
 *
 * @author admin
 */
public abstract class IndustryTypeService extends SimpleVatService<Integer, IndustryType> {

    public abstract List<IndustryType> getIndustryTypes();

}
