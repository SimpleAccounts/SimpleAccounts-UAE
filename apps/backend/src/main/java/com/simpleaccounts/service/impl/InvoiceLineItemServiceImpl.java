package com.simpleaccounts.service.impl;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.InvoiceLineItem;
import com.simpleaccounts.service.InvoiceLineItemService;
import com.simpleaccounts.dao.InvoiceLineItemDao;

@Service("InvoiceLineItemService")
public class InvoiceLineItemServiceImpl extends InvoiceLineItemService {

    @Autowired
    private InvoiceLineItemDao invoiceLineItemDao;

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
