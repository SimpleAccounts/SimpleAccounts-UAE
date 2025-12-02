package com.simplevat.dao.impl;

import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.EmployeeTransactionCategoryDao;
import com.simplevat.dao.EmployeeUserRelationDao;
import com.simplevat.entity.EmployeeTransactionCategoryRelation;
import com.simplevat.entity.EmployeeUserRelation;
import org.springframework.stereotype.Repository;


/**
 * Created By Suraj Rahade
 */
@Repository("employeeUserRelationDao")
public class EmployeeUserRelationDaoImpl extends AbstractDao<Integer, EmployeeUserRelation> implements EmployeeUserRelationDao {
}
