package com.simplevat.service;

import com.simplevat.entity.Employee;
import com.simplevat.entity.EmployeeTransactionCategoryRelation;
import com.simplevat.entity.EmployeeUserRelation;
import com.simplevat.entity.User;
import com.simplevat.entity.bankaccount.TransactionCategory;

/**
 * Created By Suraj Rahade
 */

public abstract class EmployeeUserRelationService  extends SimpleVatService<Integer, EmployeeUserRelation> {
    public abstract void addEmployeeUserRelation(Employee employee, User user);
}