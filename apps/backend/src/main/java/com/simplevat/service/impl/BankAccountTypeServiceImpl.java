package com.simplevat.service.impl;

import com.simplevat.dao.BankAccountTypeDao;
import com.simplevat.dao.Dao;
import com.simplevat.entity.bankaccount.BankAccountType;
import com.simplevat.service.BankAccountTypeService;
import java.util.List;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service("bankAccountTypeService")
@Transactional
public class BankAccountTypeServiceImpl extends BankAccountTypeService {

    @Autowired
    BankAccountTypeDao bankAccountTypeDao;

    @Override
    public List<BankAccountType> getBankAccountTypeList() {
        return bankAccountTypeDao.getBankAccountTypeList();
    }

    @Override
    protected Dao<Integer, BankAccountType> getDao() {
        return bankAccountTypeDao;
    }

    @Override
    public BankAccountType getBankAccountType(int id) {

        return bankAccountTypeDao.getBankAccountType(id);
    }

    @Override
    public BankAccountType getDefaultBankAccountType() {
        return bankAccountTypeDao.getDefaultBankAccountType();
    }

}
