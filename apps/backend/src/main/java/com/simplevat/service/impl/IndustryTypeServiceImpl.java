/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.service.impl;

import com.simplevat.dao.Dao;
import com.simplevat.dao.IndustryTypeDao;
import com.simplevat.entity.IndustryType;
import com.simplevat.service.IndustryTypeService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author admin
 */
@Service("industryTypeService")
@Transactional
public class IndustryTypeServiceImpl extends IndustryTypeService {

    @Autowired
    private IndustryTypeDao industryTypeDao;

    @Override
    protected Dao<Integer, IndustryType> getDao() {
        return industryTypeDao;
    }

    @Override
    public List<IndustryType> getIndustryTypes() {
        return industryTypeDao.getIndustryTypes();
    }
}
