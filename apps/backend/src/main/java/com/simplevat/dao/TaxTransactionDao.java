/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.dao;

import com.simplevat.entity.TaxTransaction;
import java.util.List;

/**
 *
 * @author admin
 */
public interface TaxTransactionDao extends Dao<Integer, TaxTransaction> {

    public List<TaxTransaction> getClosedTaxTransactionList();

    public List<TaxTransaction> getOpenTaxTransactionList();

}
