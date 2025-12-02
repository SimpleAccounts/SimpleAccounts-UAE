package com.simplevat.service;

import java.util.List;
import com.simplevat.entity.Purchase;

public abstract class PurchaseService extends SimpleVatService<Integer, Purchase> {

    public abstract List<Purchase> getAllPurchase();

    public abstract Purchase getClosestDuePurchaseByContactId(Integer contactId);

    public abstract List<Purchase> getPurchaseListByDueAmount();

    public abstract void deleteByIds(List<Integer> ids);
}
