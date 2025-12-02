/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.dao.impl;

import com.simplevat.constant.TaxTransactionStatusConstant;
import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.TaxTransactionDao;
import com.simplevat.entity.TaxTransaction;
import java.util.List;
import javax.persistence.TypedQuery;
import org.springframework.stereotype.Repository;

/**
 *
 * @author admin
 */
@Repository(value = "taxTransactionDao")
public class TaxTransactionDaoImpl extends AbstractDao<Integer, TaxTransaction> implements TaxTransactionDao {

    @Override
    public List<TaxTransaction> getClosedTaxTransactionList() {
        TypedQuery<TaxTransaction> query = getEntityManager().createQuery("Select t from TaxTransaction t WHERE t.status =:status", TaxTransaction.class);
        List<TaxTransaction> taxTransactionList = query.setParameter("status", TaxTransactionStatusConstant.CLOSE).getResultList();
        if (taxTransactionList != null && !taxTransactionList.isEmpty()) {
            return taxTransactionList;
        }
        return taxTransactionList;
    }

    @Override
    public List<TaxTransaction> getOpenTaxTransactionList() {
        TypedQuery<TaxTransaction> query = getEntityManager().createQuery("Select t from TaxTransaction t WHERE t.status =:status", TaxTransaction.class);
        List<TaxTransaction> taxTransactionList = query.setParameter("status", TaxTransactionStatusConstant.OPEN).getResultList();
        if (taxTransactionList != null && !taxTransactionList.isEmpty()) {
            return taxTransactionList;
        }
        return taxTransactionList;
    }

}
