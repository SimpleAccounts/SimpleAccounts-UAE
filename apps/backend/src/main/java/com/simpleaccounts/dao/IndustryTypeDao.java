/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.dao;

import com.simpleaccounts.entity.IndustryType;
import java.util.List;

/**
 *
 * @author admin
 */
public interface IndustryTypeDao extends Dao<Integer, IndustryType>{

    public List<IndustryType> getIndustryTypes();
    
}
