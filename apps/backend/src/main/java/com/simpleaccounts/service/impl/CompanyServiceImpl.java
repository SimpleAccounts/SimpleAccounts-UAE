/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.service.impl;

import com.simpleaccounts.constant.dbfilter.CompanyFilterEnum;
import com.simpleaccounts.dao.CompanyDao;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.service.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author admin
 */
@Service("companyService")
@Transactional
@RequiredArgsConstructor
public class CompanyServiceImpl extends CompanyService {

    private final Logger logger = LoggerFactory.getLogger(CompanyServiceImpl.class);
    private final CompanyDao companyDao;

    private final BankAccountService bankAccountService;

    private final TransactionCategoryService transactionCategoryService;

    protected final JournalService journalService;

    private final CoacTransactionCategoryService coacTransactionCategoryService;

    private final BankAccountStatusService bankAccountStatusService;

    private final CompanyService companyService;

    private final CurrencyService currencyService;

    private final CompanyTypeService companyTypeService;

    private final IndustryTypeService industryTypeService;

    private final RoleService roleService;

    private final UserService userService;

    private final CurrencyExchangeService currencyExchangeService;

    private final BankAccountTypeService bankAccountTypeService;

    @Override
    protected Dao<Integer, Company> getDao() {
        return this.companyDao;
    }

    @Override
    public void updateCompanyExpenseBudget(BigDecimal expenseAmount, Company company) {
        company.setCompanyExpenseBudget(company.getCompanyExpenseBudget().add(expenseAmount));
        update(company);
    }

    @Override
    public void updateCompanyRevenueBudget(BigDecimal revenueAmount, Company company) {
        company.setCompanyRevenueBudget(company.getCompanyRevenueBudget().add(revenueAmount));
        update(company);
    }

    @Override
    public Company getCompany() {
        return companyDao.getCompany();
    }

    @Override
    public List<Company> getCompanyList(Map<CompanyFilterEnum, Object> filterMap) {
        return companyDao.getCompanyList(filterMap);
    }
    @Override
    public Integer getDbConncection(){
        return companyDao.getDbConncection();
    }

    @Override
    public void deleteByIds(ArrayList<Integer> ids) {
        companyDao.deleteByIds(ids);
    }

    @Override
    public List<DropdownModel> getCompaniesForDropdown() {
       return companyDao.getCompaniesForDropdown();
    }
    @Override
    public Currency getCompanyCurrency(){
        return companyDao.getCompanyCurrency();
    }

//

//

//
//
//            // create transaction category with bankname-accout name
//

//

//

//

//

}
