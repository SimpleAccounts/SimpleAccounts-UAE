package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.EmployeeTransactionCategoryDao;
import com.simpleaccounts.entity.EmployeeTransactionCategoryRelation;
import org.springframework.stereotype.Repository;

/**
 * Created By Zain Khan
 */
@Repository("employeeTransactionCategoryDao")
public class EmployeeTransactionCategoryDaoImpl extends AbstractDao<Integer, EmployeeTransactionCategoryRelation> implements EmployeeTransactionCategoryDao {
}
