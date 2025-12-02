/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.service;

import com.simplevat.entity.TaxTransaction;
import java.util.List;

/**
 *
 * @author admin
 */
public abstract class TaxTransactionService extends SimpleVatService<Integer, TaxTransaction> {

    public abstract List<TaxTransaction> getClosedTaxTransactionList();
    
    public abstract List<TaxTransaction> getOpenTaxTransactionList();

}
