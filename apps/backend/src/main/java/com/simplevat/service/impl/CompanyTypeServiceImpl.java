/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.service.impl;

import com.simplevat.dao.CompanyTypeDao;
import com.simplevat.dao.Dao;
import com.simplevat.entity.CompanyType;
import com.simplevat.service.CompanyTypeService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author admin
 */
@Service("companyTypeService")
@Transactional
public class CompanyTypeServiceImpl extends CompanyTypeService {

    @Autowired
    private CompanyTypeDao companyTypeDao;

    @Override
    protected Dao<Integer, CompanyType> getDao() {
        return this.companyTypeDao;
    }

    @Override
    public List<CompanyType> getCompanyTypes() {
        return this.companyTypeDao.getCompanyTypes();
    }

}
