/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.service;

import com.simpleaccounts.constant.dbfilter.CompanyFilterEnum;
import com.simpleaccounts.entity.Company;
import com.simpleaccounts.entity.Currency;

import com.simpleaccounts.rest.DropdownModel;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 *
 * @author admin
 */
public abstract class CompanyService extends SimpleAccountsService<Integer, Company> {

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
