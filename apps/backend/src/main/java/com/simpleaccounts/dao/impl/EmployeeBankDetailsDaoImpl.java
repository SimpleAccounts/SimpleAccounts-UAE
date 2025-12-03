package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.EmployeeBankDetailsDao;
import com.simpleaccounts.entity.EmployeeBankDetails;
import org.springframework.stereotype.Repository;

@Repository(value = "employeeBankDetailsDao")
public class EmployeeBankDetailsDaoImpl extends AbstractDao<Integer, EmployeeBankDetails> implements EmployeeBankDetailsDao
{

}
