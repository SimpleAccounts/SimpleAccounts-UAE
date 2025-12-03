package com.simpleaccounts.service;

import com.simpleaccounts.entity.InvoiceLineItem;

public abstract class InvoiceLineItemService extends SimpleAccountsService<Integer, InvoiceLineItem> {

    public abstract void deleteByInvoiceId(Integer invoiceId);

    public abstract Integer getTotalInvoiceCountByProductId(Integer productId);

    public abstract InvoiceLineItem getInvoiceLneItemByInvoiceId(Integer invoiceId);
}
