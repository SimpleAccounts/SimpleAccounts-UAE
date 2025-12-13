package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.EmploymentDao;
import com.simpleaccounts.entity.Employment;
import com.simpleaccounts.service.EmploymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Created by suraj
 */
@Service("employmentService")
@Transactional
@RequiredArgsConstructor
public class EmploymentServiceImpl extends EmploymentService
{
    private final EmploymentDao employmentDao;

    @Override
    protected Dao<Integer, Employment> getDao() {
        return this.employmentDao;
    }
}
