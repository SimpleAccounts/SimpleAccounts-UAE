/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.dao;

import com.simplevat.entity.InvoiceLineItem;

/**
 *
 * @author daynil
 */
public interface InvoiceLineItemDao extends Dao<Integer, InvoiceLineItem> {

    public void deleteByInvoiceId(Integer invoiceId);

    public Integer getTotalInvoiceCountByProductId(Integer productId);

  public   InvoiceLineItem getInvoiceLneItemByInvoiceId(Integer invoiceId);
}
