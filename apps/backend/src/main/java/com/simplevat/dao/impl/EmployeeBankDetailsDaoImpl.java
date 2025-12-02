package com.simplevat.dao.impl;

import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.EmployeeBankDetailsDao;
import com.simplevat.entity.EmployeeBankDetails;
import org.springframework.stereotype.Repository;

@Repository(value = "employeeBankDetailsDao")
public class EmployeeBankDetailsDaoImpl extends AbstractDao<Integer, EmployeeBankDetails> implements EmployeeBankDetailsDao
{

}
