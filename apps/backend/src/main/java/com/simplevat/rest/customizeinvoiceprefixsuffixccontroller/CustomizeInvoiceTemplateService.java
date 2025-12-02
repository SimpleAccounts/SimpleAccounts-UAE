package com.simplevat.rest.customizeinvoiceprefixsuffixccontroller;

import com.simplevat.entity.CustomizeInvoiceTemplate;
import com.simplevat.entity.Invoice;
import com.simplevat.service.SimpleVatService;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Created By Zain Khan On 20-11-2020
 */
@Component
public abstract class CustomizeInvoiceTemplateService extends SimpleVatService<Integer, CustomizeInvoiceTemplate> {

    public abstract CustomizeInvoiceTemplate getCustomizeInvoiceTemplate(Integer invoiceType);

    public abstract String getLastInvoice(Integer invoiceType);

    public abstract CustomizeInvoiceTemplate getInvoiceTemplate(Integer invoiceType);
}
