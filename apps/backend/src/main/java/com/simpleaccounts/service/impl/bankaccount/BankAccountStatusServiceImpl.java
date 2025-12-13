package com.simpleaccounts.service.impl.bankaccount;


import com.simpleaccounts.dao.bankaccount.BankAccountStatusDao;
import com.simpleaccounts.entity.bankaccount.BankAccountStatus;
import com.simpleaccounts.service.BankAccountStatusService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service("bankAccountStatusService")
@RequiredArgsConstructor
public class BankAccountStatusServiceImpl implements BankAccountStatusService {

    public final BankAccountStatusDao bankAccountStatusDao;
	
	@Override
	public List<BankAccountStatus> getBankAccountStatuses() {
		return bankAccountStatusDao.getBankAccountStatuses();
	}

	@Override
	public BankAccountStatus getBankAccountStatus(Integer id) {
		return bankAccountStatusDao.getBankAccountStatus(id);
	}

	@Override
	public BankAccountStatus getBankAccountStatusByName(String status) {
		return bankAccountStatusDao.getBankAccountStatusByName(status);
	}

}
