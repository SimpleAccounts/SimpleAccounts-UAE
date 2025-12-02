/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.service;

import com.simplevat.constant.dbfilter.CompanyFilterEnum;
import com.simplevat.entity.Company;
import com.simplevat.entity.Currency;
import com.simplevat.entity.CurrencyConversion;
import com.simplevat.rest.DropdownModel;
import com.simplevat.rest.companycontroller.RegistrationModel;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 *
 * @author admin
 */
public abstract class CompanyService extends SimpleVatService<Integer, Company> {

    public abstract void updateCompanyExpenseBudget(BigDecimal expenseAmount, Company company);

    public abstract void updateCompanyRevenueBudget(BigDecimal revenueAmount, Company company);

    public abstract Company getCompany();

    public abstract Integer getDbConncection();

    public abstract List<Company> getCompanyList(Map<CompanyFilterEnum, Object> filterMap);

    public abstract void deleteByIds(ArrayList<Integer> ids);
    
    public abstract List<DropdownModel> getCompaniesForDropdown();

   public abstract Currency getCompanyCurrency();

//   public abstract String registerCompany(RegistrationModel registrationModel) throws Exception;

}
