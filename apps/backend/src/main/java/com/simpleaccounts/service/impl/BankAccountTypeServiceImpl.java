package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.BankAccountTypeDao;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.bankaccount.BankAccountType;
import com.simpleaccounts.service.BankAccountTypeService;
import java.util.List;
import javax.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service("bankAccountTypeService")
@Transactional
@RequiredArgsConstructor
public class BankAccountTypeServiceImpl extends BankAccountTypeService {

    private final BankAccountTypeDao bankAccountTypeDao;

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
