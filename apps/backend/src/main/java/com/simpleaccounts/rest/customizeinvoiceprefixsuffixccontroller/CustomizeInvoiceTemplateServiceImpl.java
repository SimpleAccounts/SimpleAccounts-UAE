package com.simpleaccounts.rest.customizeinvoiceprefixsuffixccontroller;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.CustomizeInvoiceTemplate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created By Zain Khan On 20-11-2020
 */

@Service
public class CustomizeInvoiceTemplateServiceImpl extends CustomizeInvoiceTemplateService{

    @Autowired
    private CustomizeInvoiceTemplateDao customizeInvoiceTemplateDao;

    @Override
    protected Dao<Integer, CustomizeInvoiceTemplate> getDao() {

        return customizeInvoiceTemplateDao;
    }

    @Override
    public CustomizeInvoiceTemplate getCustomizeInvoiceTemplate(Integer invoiceType){
        return customizeInvoiceTemplateDao.getCustomizeInvoiceTemplate(invoiceType);
    }

    @Override
    public String getLastInvoice(Integer invoiceType){
        CustomizeInvoiceTemplate customizeInvoiceTemplateSuffix=customizeInvoiceTemplateDao.getLastInvoiceNo(invoiceType);
                Integer invoiceSuffix = customizeInvoiceTemplateSuffix.getSuffix();
                String referenceNumber = customizeInvoiceTemplateSuffix.getPrefix();
                String nextInvoiceNo= referenceNumber + (invoiceSuffix +1);
        return nextInvoiceNo ;
    }
    @Override
    public CustomizeInvoiceTemplate getInvoiceTemplate(Integer invoiceType){
        return customizeInvoiceTemplateDao.getLastInvoiceNo(invoiceType);

    }

}
