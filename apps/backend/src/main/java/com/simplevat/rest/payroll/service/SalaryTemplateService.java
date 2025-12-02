package com.simplevat.rest.payroll.service;

import com.simplevat.entity.SalaryTemplate;
import com.simplevat.entity.SupplierInvoicePayment;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.rest.payroll.DefaultSalaryTemplateModel;
import com.simplevat.rest.payroll.PayRollFilterModel;
import com.simplevat.service.SimpleVatService;

import java.util.Map;


public abstract class SalaryTemplateService extends SimpleVatService<Integer, SalaryTemplate> {


    public abstract PaginationResponseModel getSalaryTemplateList(Map<Object, Object> filterDataMap, PaginationModel paginationModel);


    public abstract DefaultSalaryTemplateModel  getDefaultSalaryTemplates();

}
