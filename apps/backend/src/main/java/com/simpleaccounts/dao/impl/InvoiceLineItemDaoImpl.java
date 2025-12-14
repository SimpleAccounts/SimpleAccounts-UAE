package com.simpleaccounts.dao.impl;

import com.simpleaccounts.constant.CommonColumnConstants;
import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.InvoiceLineItemDao;
import com.simpleaccounts.entity.InvoiceLineItem;
import java.util.List;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class InvoiceLineItemDaoImpl extends AbstractDao<Integer, InvoiceLineItem> implements InvoiceLineItemDao {

    @Override
    @Transactional
    public void deleteByInvoiceId(Integer invoiceId) {
        Query query = getEntityManager().createQuery("DELETE FROM InvoiceLineItem i WHERE i.invoice.id = :invoiceId ");
        query.setParameter("invoiceId", invoiceId);
        query.executeUpdate();
    }
    @Override
    public Integer getTotalInvoiceCountByProductId(Integer productId){
        Query query = getEntityManager().createQuery(
                "SELECT COUNT(i) FROM InvoiceLineItem i WHERE i.product.productID =:productId AND i.invoice.deleteFlag=false" );
        query.setParameter(CommonColumnConstants.PRODUCT_ID,productId);
        List<Object> countList = query.getResultList();
        if (countList != null && !countList.isEmpty()) {
            return ((Long) countList.get(0)).intValue();
        }
        return null;
    }
    @Override
    public   InvoiceLineItem getInvoiceLneItemByInvoiceId(Integer invoiceId){
        TypedQuery<InvoiceLineItem> query = getEntityManager().createQuery("SELECT i FROM InvoiceLineItem  i WHERE i.invoice.id=:invoiceId AND i.deleteFlag=false",InvoiceLineItem.class);
        query.setParameter("invoiceId", invoiceId);
        InvoiceLineItem invoiceLineItem = query.getSingleResult();
        return invoiceLineItem;
    }
}
