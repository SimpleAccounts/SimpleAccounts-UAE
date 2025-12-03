package com.simpleaccounts.service;

import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeTransactionCategoryRelation;
import com.simpleaccounts.entity.EmployeeUserRelation;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;

/**
 * Created By Suraj Rahade
 */

public abstract class EmployeeUserRelationService  extends SimpleAccountsService<Integer, EmployeeUserRelation> {
    public abstract void addEmployeeUserRelation(Employee employee, User user);
}