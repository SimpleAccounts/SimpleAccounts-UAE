package com.simpleaccounts.rfq_po;

import com.simpleaccounts.service.SimpleAccountsService;

public abstract class PoQuatationLineItemService extends SimpleAccountsService<Integer,PoQuatationLineItem> {

    public abstract void deleteByRfqId(Integer id);
//    public abstract void deleteByQuatationId(Integer id);
}
