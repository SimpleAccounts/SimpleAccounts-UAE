/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.Dao;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.dao.TaxTransactionDao;
import com.simpleaccounts.entity.TaxTransaction;
import com.simpleaccounts.service.TaxTransactionService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author admin
 */
@Service("taxTransactionService")
@Transactional
@RequiredArgsConstructor
public class TaxTransactionServiceImpl extends TaxTransactionService {

    private final TaxTransactionDao taxTransactionDao;

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
