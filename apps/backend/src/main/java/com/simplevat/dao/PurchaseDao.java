package com.simplevat.dao;

import java.util.List;

import com.simplevat.entity.Purchase;

public interface PurchaseDao extends Dao<Integer, Purchase> {

    public List<Purchase> getAllPurchase();

    public Purchase getClosestDuePurchaseByContactId(Integer contactId);

    public List<Purchase> getPurchaseListByDueAmount();

    public void deleteByIds(List<Integer> ids);
}
