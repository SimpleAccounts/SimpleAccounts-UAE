/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.CompanyTypeDao;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.CompanyType;
import com.simpleaccounts.service.CompanyTypeService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author admin
 */
@Service("companyTypeService")
@Transactional
@RequiredArgsConstructor
public class CompanyTypeServiceImpl extends CompanyTypeService {

    private final CompanyTypeDao companyTypeDao;

    @Override
    protected Dao<Integer, CompanyType> getDao() {
        return this.companyTypeDao;
    }

    @Override
    public List<CompanyType> getCompanyTypes() {
        return this.companyTypeDao.getCompanyTypes();
    }

}
