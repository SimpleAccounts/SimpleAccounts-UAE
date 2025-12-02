package com.simplevat.dao.impl;

import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.EmployeeDao;
import com.simplevat.dao.EmploymentDao;
import com.simplevat.entity.Employee;
import com.simplevat.entity.Employment;
import org.springframework.stereotype.Repository;

@Repository(value = "employmentDao")
public class EmploymentDaoImpl extends AbstractDao<Integer, Employment> implements EmploymentDao
{

}
