/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.constant.dbfilter;

import lombok.Builder;
import lombok.Getter;

/**
 *
 * @author uday
 */
@Builder
@Getter
public class DbFilter {
    String dbCoulmnName;
    String condition;
    Object value;
    public DbFilter(String dbCoulmnName, String condition, Object value){
        this.dbCoulmnName = dbCoulmnName;
        this.condition = condition;
        this.value = value;
        
    }
	@Override
	public String toString() {
		return "DbFilter [dbCoulmnName=" + dbCoulmnName + ", condition=" + condition + ", value=" + value + "]";
	}
    
    
}
