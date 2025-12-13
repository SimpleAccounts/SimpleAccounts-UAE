package com.simpleaccounts.dao.bankaccount;

import com.simpleaccounts.entity.bankaccount.BankAccountStatus;
import java.util.List;

public interface BankAccountStatusDao {

    List<BankAccountStatus> getBankAccountStatuses();

    BankAccountStatus getBankAccountStatus(Integer id);

    BankAccountStatus getBankAccountStatusByName(String status);

}
