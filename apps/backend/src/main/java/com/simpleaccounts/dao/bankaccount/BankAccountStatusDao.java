package com.simpleaccounts.dao.bankaccount;

import java.util.List;

import com.simpleaccounts.entity.bankaccount.BankAccountStatus;

public interface BankAccountStatusDao {

    List<BankAccountStatus> getBankAccountStatuses();

    BankAccountStatus getBankAccountStatus(Integer id);

    BankAccountStatus getBankAccountStatusByName(String status);

}
