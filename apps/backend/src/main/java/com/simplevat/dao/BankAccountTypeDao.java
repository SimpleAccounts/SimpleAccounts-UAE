/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.dao;

import com.simplevat.entity.bankaccount.BankAccountType;
import java.util.List;

/**
 *
 * @author daynil
 */
public interface BankAccountTypeDao extends Dao<Integer, BankAccountType> {

    List<BankAccountType> getBankAccountTypeList();

    BankAccountType getBankAccountType(int id);

    BankAccountType getDefaultBankAccountType();

}
