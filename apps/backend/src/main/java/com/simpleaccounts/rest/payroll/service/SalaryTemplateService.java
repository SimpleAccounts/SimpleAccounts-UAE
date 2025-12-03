package com.simpleaccounts.rest.payroll.service;

import com.simpleaccounts.entity.SalaryTemplate;
import com.simpleaccounts.entity.SupplierInvoicePayment;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.payroll.DefaultSalaryTemplateModel;
import com.simpleaccounts.rest.payroll.PayRollFilterModel;
import com.simpleaccounts.service.SimpleAccountsService;

import java.util.Map;


public abstract class SalaryTemplateService extends SimpleAccountsService<Integer, SalaryTemplate> {


    public abstract PaginationResponseModel getSalaryTemplateList(Map<Object, Object> filterDataMap, PaginationModel paginationModel);


    public abstract DefaultSalaryTemplateModel  getDefaultSalaryTemplates();

}
