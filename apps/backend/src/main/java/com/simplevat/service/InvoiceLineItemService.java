package com.simplevat.service;

import com.simplevat.entity.InvoiceLineItem;

public abstract class InvoiceLineItemService extends SimpleVatService<Integer, InvoiceLineItem> {

    public abstract void deleteByInvoiceId(Integer invoiceId);

    public abstract Integer getTotalInvoiceCountByProductId(Integer productId);

    public abstract InvoiceLineItem getInvoiceLneItemByInvoiceId(Integer invoiceId);
}
