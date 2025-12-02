/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.service.impl;

import com.simplevat.dao.Dao;
import com.simplevat.dao.TaxTransactionDao;
import com.simplevat.entity.TaxTransaction;
import com.simplevat.service.TaxTransactionService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author admin
 */
@Service("taxTransactionService")
@Transactional
public class TaxTransactionServiceImpl extends TaxTransactionService {

    @Autowired
    private TaxTransactionDao taxTransactionDao;

    @Override
    protected Dao<Integer, TaxTransaction> getDao() {
        return taxTransactionDao;
    }

    @Override
    public List<TaxTransaction> getClosedTaxTransactionList() {
        return taxTransactionDao.getClosedTaxTransactionList();
    }

    @Override
    public List<TaxTransaction> getOpenTaxTransactionList() {
        return taxTransactionDao.getOpenTaxTransactionList();
    }
}
