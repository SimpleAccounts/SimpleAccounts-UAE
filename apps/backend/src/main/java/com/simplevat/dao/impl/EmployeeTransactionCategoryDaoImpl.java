package com.simplevat.dao.impl;

import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.EmployeeTransactionCategoryDao;
import com.simplevat.entity.EmployeeTransactionCategoryRelation;
import org.springframework.stereotype.Repository;

/**
 * Created By Zain Khan
 */
@Repository("employeeTransactionCategoryDao")
public class EmployeeTransactionCategoryDaoImpl extends AbstractDao<Integer, EmployeeTransactionCategoryRelation> implements EmployeeTransactionCategoryDao {
}
