package com.simpleaccounts.service;

import java.util.List;

import com.simpleaccounts.entity.bankaccount.BankAccountStatus;

public interface BankAccountStatusService {

    List<BankAccountStatus> getBankAccountStatuses();

    BankAccountStatus getBankAccountStatus(Integer id);

    BankAccountStatus getBankAccountStatusByName(String status);

}
