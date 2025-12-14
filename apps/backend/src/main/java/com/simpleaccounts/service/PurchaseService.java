package com.simpleaccounts.service;

import com.simpleaccounts.entity.Purchase;
import java.util.List;

public abstract class PurchaseService extends SimpleAccountsService<Integer, Purchase> {

    public abstract List<Purchase> getAllPurchase();

    public abstract Purchase getClosestDuePurchaseByContactId(Integer contactId);

    public abstract List<Purchase> getPurchaseListByDueAmount();

    public abstract void deleteByIds(List<Integer> ids);
}
