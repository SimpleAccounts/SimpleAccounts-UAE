package com.simpleaccounts.rest.customizeinvoiceprefixsuffixccontroller;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.CustomizeInvoiceTemplate;

/**
 * Created By Zain Khan On 20-11-2020
 */
public interface CustomizeInvoiceTemplateDao extends Dao<Integer, CustomizeInvoiceTemplate> {
    public CustomizeInvoiceTemplate getCustomizeInvoiceTemplate(Integer invoiceType);

    public CustomizeInvoiceTemplate getLastInvoiceNo(Integer invoiceType);

    public CustomizeInvoiceTemplate getType(Integer invoiceType);
}
