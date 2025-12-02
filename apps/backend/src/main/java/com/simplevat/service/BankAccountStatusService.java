package com.simplevat.service;

import java.util.List;

import com.simplevat.entity.bankaccount.BankAccountStatus;

public interface BankAccountStatusService {

    List<BankAccountStatus> getBankAccountStatuses();

    BankAccountStatus getBankAccountStatus(Integer id);

    BankAccountStatus getBankAccountStatusByName(String status);

}
