package com.simpleaccounts.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.InvoiceLineItemDao;
import com.simpleaccounts.entity.InvoiceLineItem;
import com.simpleaccounts.service.InvoiceLineItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service("InvoiceLineItemService")
@RequiredArgsConstructor
public class InvoiceLineItemServiceImpl extends InvoiceLineItemService {

    private final InvoiceLineItemDao invoiceLineItemDao;

    @Override
    protected Dao<Integer, InvoiceLineItem> getDao() {
        return invoiceLineItemDao;
    }
    
      @Override
    public void deleteByInvoiceId(Integer invoiceId) {
        invoiceLineItemDao.deleteByInvoiceId(invoiceId);
    }
  @Override
  public Integer getTotalInvoiceCountByProductId(Integer productId){
     return invoiceLineItemDao.getTotalInvoiceCountByProductId(productId);

  }
  @Override
    public  InvoiceLineItem getInvoiceLneItemByInvoiceId(Integer invoiceId){
        return invoiceLineItemDao.getInvoiceLneItemByInvoiceId(invoiceId);
  }
}
