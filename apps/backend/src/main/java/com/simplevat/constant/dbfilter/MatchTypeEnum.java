/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.constant.dbfilter;

import lombok.Getter;

/**
 *
 * @author uday
 */
public enum MatchTypeEnum {
    CONTAINS("like"),
    EXACT("="),
    BETWEEN("between");
    
    
    @Getter
    String operand;

    private MatchTypeEnum(String operand) {
        this.operand = operand;
    }
}
