package com.simpleaccounts.rest.customizeinvoiceprefixsuffixccontroller;

import com.simpleaccounts.entity.CustomizeInvoiceTemplate;
import com.simpleaccounts.service.SimpleAccountsService;
import org.springframework.stereotype.Component;

/**
 * Created By Zain Khan On 20-11-2020
 */
@Component
public abstract class CustomizeInvoiceTemplateService extends SimpleAccountsService<Integer, CustomizeInvoiceTemplate> {

    public abstract CustomizeInvoiceTemplate getCustomizeInvoiceTemplate(Integer invoiceType);

    public abstract String getLastInvoice(Integer invoiceType);

    public abstract CustomizeInvoiceTemplate getInvoiceTemplate(Integer invoiceType);
}
