package com.simplevat.service;



import com.simplevat.entity.bankaccount.BankAccountType;
import java.util.List;


public abstract class BankAccountTypeService extends SimpleVatService<Integer, BankAccountType> {

	public abstract List<BankAccountType> getBankAccountTypeList();
        
        public abstract BankAccountType getBankAccountType(int id);
        
        public abstract BankAccountType getDefaultBankAccountType();
}