package com.simplevat.service.impl;

import com.simplevat.dao.Dao;
import com.simplevat.dao.EmploymentDao;
import com.simplevat.entity.Employment;
import com.simplevat.service.EmployeeBankDetailsService;
import com.simplevat.service.EmploymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Created by suraj
 */
@Service("employmentService")
@Transactional
public class EmploymentServiceImpl extends EmploymentService
{
@Autowired
    EmploymentDao employmentDao;

    @Override
    protected Dao<Integer, Employment> getDao() {
        return this.employmentDao;
    }
}
