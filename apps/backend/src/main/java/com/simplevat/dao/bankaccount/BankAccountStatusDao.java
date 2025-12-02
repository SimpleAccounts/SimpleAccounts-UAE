package com.simplevat.dao.bankaccount;

import java.util.List;

import com.simplevat.entity.bankaccount.BankAccountStatus;

public interface BankAccountStatusDao {

    List<BankAccountStatus> getBankAccountStatuses();

    BankAccountStatus getBankAccountStatus(Integer id);

    BankAccountStatus getBankAccountStatusByName(String status);

}
