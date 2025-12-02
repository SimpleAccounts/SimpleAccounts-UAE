package com.simplevat.rest.customizeinvoiceprefixsuffixccontroller;

import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.InvoiceDao;
import com.simplevat.entity.CustomizeInvoiceTemplate;
import com.simplevat.entity.Invoice;
import org.springframework.stereotype.Repository;

import javax.persistence.TypedQuery;
import java.util.List;

@Repository
public class CustomizeInvoiceTemplateDaoImpl extends AbstractDao<Integer, CustomizeInvoiceTemplate> implements CustomizeInvoiceTemplateDao {
    @Override
    public CustomizeInvoiceTemplate getCustomizeInvoiceTemplate(Integer invoiceType) {
//        return getEntityManager().createNamedQuery("allInvoicesPrefix", CustomizeInvoiceTemplate.class).getResultList();
            TypedQuery<CustomizeInvoiceTemplate> query = getEntityManager().createNamedQuery("allInvoicesPrefix", CustomizeInvoiceTemplate.class);
            query.setParameter("type", invoiceType);
            query.setMaxResults(1);
            List<CustomizeInvoiceTemplate> invoiceList = query.getResultList();
            return invoiceList != null && !invoiceList.isEmpty() ? invoiceList.get(0) : null;

    }

    @Override
    public CustomizeInvoiceTemplate getLastInvoiceNo(Integer invoiceType) {
        TypedQuery<CustomizeInvoiceTemplate> query = getEntityManager().createNamedQuery("lastInvoiceSuffixNo", CustomizeInvoiceTemplate.class);
        query.setParameter("type", invoiceType);
        query.setMaxResults(1);
        List<CustomizeInvoiceTemplate> invoiceList = query.getResultList();

        return invoiceList != null && !invoiceList.isEmpty() ? invoiceList.get(0) : null;
    }
    @Override
    public CustomizeInvoiceTemplate getType(Integer invoiceType){
        TypedQuery<CustomizeInvoiceTemplate> query = getEntityManager().createNamedQuery("lastInvoiceSuffixNo", CustomizeInvoiceTemplate.class);
        query.setParameter("type", invoiceType);
        query.setMaxResults(1);
        List<CustomizeInvoiceTemplate> invoiceList = query.getResultList();
        return invoiceList != null && !invoiceList.isEmpty() ? invoiceList.get(0) : null;
    }
}
