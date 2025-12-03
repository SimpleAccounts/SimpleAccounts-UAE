package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.EmployeeTransactionCategoryDao;
import com.simpleaccounts.dao.EmployeeUserRelationDao;
import com.simpleaccounts.entity.EmployeeTransactionCategoryRelation;
import com.simpleaccounts.entity.EmployeeUserRelation;
import org.springframework.stereotype.Repository;


/**
 * Created By Suraj Rahade
 */
@Repository("employeeUserRelationDao")
public class EmployeeUserRelationDaoImpl extends AbstractDao<Integer, EmployeeUserRelation> implements EmployeeUserRelationDao {
}
