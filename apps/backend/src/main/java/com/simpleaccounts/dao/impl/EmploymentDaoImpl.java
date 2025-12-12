package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;

import com.simpleaccounts.dao.EmploymentDao;

import com.simpleaccounts.entity.Employment;
import org.springframework.stereotype.Repository;

@Repository(value = "employmentDao")
public class EmploymentDaoImpl extends AbstractDao<Integer, Employment> implements EmploymentDao
{

}
