package com.simplevat.rest.customizeinvoiceprefixsuffixccontroller;

import com.simplevat.dao.Dao;
import com.simplevat.entity.CustomizeInvoiceTemplate;

import java.util.List;

/**
 * Created By Zain Khan On 20-11-2020
 */
public interface CustomizeInvoiceTemplateDao extends Dao<Integer, CustomizeInvoiceTemplate> {
    public CustomizeInvoiceTemplate getCustomizeInvoiceTemplate(Integer invoiceType);

    public CustomizeInvoiceTemplate getLastInvoiceNo(Integer invoiceType);

    public CustomizeInvoiceTemplate getType(Integer invoiceType);
}
