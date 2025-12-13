package com.simpleaccounts.rest.customizeinvoiceprefixsuffixccontroller;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.entity.CustomizeInvoiceTemplate;
import javax.persistence.TypedQuery;
import org.springframework.stereotype.Repository;
import java.util.List;
import javax.persistence.TypedQuery;
import org.springframework.stereotype.Repository;

@Repository
public class CustomizeInvoiceTemplateDaoImpl extends AbstractDao<Integer, CustomizeInvoiceTemplate> implements CustomizeInvoiceTemplateDao {
    @Override
    public CustomizeInvoiceTemplate getCustomizeInvoiceTemplate(Integer invoiceType) {

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
