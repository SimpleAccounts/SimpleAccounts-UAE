package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.PurchaseDao;
import com.simpleaccounts.entity.Purchase;
import com.simpleaccounts.service.PurchaseService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service("purchaseService")
@Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
@RequiredArgsConstructor
public class PurchaseServiceImpl extends PurchaseService {

    public final PurchaseDao purchaseDao;

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
