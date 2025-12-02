/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.dao;

import java.util.List;
import java.util.Map;

import com.simplevat.constant.dbfilter.CompanyFilterEnum;
import com.simplevat.entity.Company;
import com.simplevat.entity.Currency;
import com.simplevat.entity.CurrencyConversion;
import com.simplevat.rest.DropdownModel;

/**
 *
 * @author admin
 */
public interface CompanyDao extends Dao<Integer, Company> {

    public Company getCompany();

    public Integer getDbConncection();

    public List<Company> getCompanyList(Map<CompanyFilterEnum, Object> filterMap);

    public List<DropdownModel> getCompaniesForDropdown();

    public void deleteByIds(List<Integer> ids);

   public Currency getCompanyCurrency();
}
