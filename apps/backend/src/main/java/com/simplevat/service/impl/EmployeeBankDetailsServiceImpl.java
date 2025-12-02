package com.simplevat.service.impl;

import com.simplevat.dao.Dao;
import com.simplevat.dao.EmployeeBankDetailsDao;
import com.simplevat.entity.EmployeeBankDetails;
import com.simplevat.service.EmployeeBankDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service("employeeBankDetailsService")
@Transactional
public class EmployeeBankDetailsServiceImpl extends EmployeeBankDetailsService
{
    @Autowired
    EmployeeBankDetailsDao employeeBankDetailsDao;



    @Override
    protected Dao<Integer, EmployeeBankDetails> getDao() {
        return this.employeeBankDetailsDao;
    }
}
