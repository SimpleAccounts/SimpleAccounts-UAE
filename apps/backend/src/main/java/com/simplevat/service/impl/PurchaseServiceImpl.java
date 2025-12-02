package com.simplevat.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.simplevat.dao.Dao;
import com.simplevat.dao.PurchaseDao;
import com.simplevat.entity.Purchase;
import com.simplevat.service.PurchaseService;

@Service("purchaseService")
@Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
public class PurchaseServiceImpl extends PurchaseService {

    @Autowired
    public PurchaseDao purchaseDao;

    @Override
    public List<Purchase> getAllPurchase() {
        return purchaseDao.getAllPurchase();
    }

    @Override
    protected Dao<Integer, Purchase> getDao() {
        return purchaseDao;
    }

    @Override
    public Purchase getClosestDuePurchaseByContactId(Integer contactId) {
        return purchaseDao.getClosestDuePurchaseByContactId(contactId);
    }

    @Override
    public List<Purchase> getPurchaseListByDueAmount() {
        return purchaseDao.getPurchaseListByDueAmount();
    }

    @Override
    public void deleteByIds(List<Integer> ids) {
        purchaseDao.deleteByIds(ids);
    }

}
