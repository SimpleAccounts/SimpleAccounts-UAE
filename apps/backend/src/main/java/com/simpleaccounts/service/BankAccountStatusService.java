package com.simpleaccounts.service;

import com.simpleaccounts.entity.bankaccount.BankAccountStatus;
import java.util.List;

public interface BankAccountStatusService {

    List<BankAccountStatus> getBankAccountStatuses();

    BankAccountStatus getBankAccountStatus(Integer id);

    BankAccountStatus getBankAccountStatusByName(String status);

}
