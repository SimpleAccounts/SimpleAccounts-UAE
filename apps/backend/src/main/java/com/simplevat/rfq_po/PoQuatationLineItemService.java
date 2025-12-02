package com.simplevat.rfq_po;


import com.simplevat.service.SimpleVatService;


public abstract class PoQuatationLineItemService extends SimpleVatService<Integer,PoQuatationLineItem> {

    public abstract void deleteByRfqId(Integer id);
//    public abstract void deleteByQuatationId(Integer id);
}
