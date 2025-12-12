package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.EmployeeBankDetailsDao;
import com.simpleaccounts.entity.EmployeeBankDetails;
import com.simpleaccounts.service.EmployeeBankDetailsService;
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
