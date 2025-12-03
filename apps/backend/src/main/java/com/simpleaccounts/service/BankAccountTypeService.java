package com.simpleaccounts.service;



import com.simpleaccounts.entity.bankaccount.BankAccountType;
import java.util.List;


public abstract class BankAccountTypeService extends SimpleAccountsService<Integer, BankAccountType> {

	public abstract List<BankAccountType> getBankAccountTypeList();
        
        public abstract BankAccountType getBankAccountType(int id);
        
        public abstract BankAccountType getDefaultBankAccountType();
}