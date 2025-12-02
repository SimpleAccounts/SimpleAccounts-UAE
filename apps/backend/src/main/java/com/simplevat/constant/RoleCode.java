/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.constant;

/**
 *
 * @author uday
 */
public enum RoleCode {
    ADMIN(1), DIRECTOR(2),SHARE_HOLDER(3),MANGER(4),EMPLOYEE(5),ACCOUNTANT(6);
    
    int roleCode;
    private RoleCode(int roleCode){
        this.roleCode = roleCode;
    }
    
    public int getCode(){
        return roleCode;
    }
}
