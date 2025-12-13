package com.simpleaccounts.service.impl.bankaccount;

import com.simpleaccounts.constant.dbfilter.BankAccounrFilterEnum;
import com.simpleaccounts.dao.bankaccount.BankAccountDao;
import com.simpleaccounts.entity.Activity;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.BankDetails;
import com.simpleaccounts.entity.bankaccount.BankDetailsRepository;
import com.simpleaccounts.model.DashBoardBankDataModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.BankAccountService;
import com.simpleaccounts.utils.DateFormatUtil;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service("bankAccountService")
@Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
public class BankAccountServiceImpl extends BankAccountService {

	private static final String BANK_ACCOUNT = "BANK_ACCOUNT";

	public final BankAccountDao bankAccountDao;

	private final DateFormatUtil dateFormatUtil;
	
	private final BankDetailsRepository bankDetailsRepository;

	@Autowired
	public BankAccountServiceImpl(BankAccountDao bankAccountDao,
								  DateFormatUtil dateFormatUtil,
								  BankDetailsRepository bankDetailsRepository) {
		this.bankAccountDao = bankAccountDao;
		this.dateFormatUtil = dateFormatUtil;
		this.bankDetailsRepository = bankDetailsRepository;
	}

	@Override
	public List<BankAccount> getBankAccounts() {
		return getDao().getBankAccounts();
	}

	@Override
	public List<BankAccount> getBankAccountByUser(int userId) {
		return bankAccountDao.getBankAccountByUser(userId);
	}

	@Override
	protected BankAccountDao getDao() {
		return this.bankAccountDao;
	}

	public void persist(BankAccount bankAccount) {
		super.persist(bankAccount, null, getActivity(bankAccount, "CREATED"));
	}

	public BankAccount update(BankAccount bankAccount) {
		return super.update(bankAccount, null, getActivity(bankAccount, "UPDATED"));
	}

	private Activity getActivity(BankAccount bankAccount, String activityCode) {
		Activity activity = new Activity();
		activity.setActivityCode(activityCode);
		activity.setModuleCode(BANK_ACCOUNT);
		activity.setField3("Bank Account " + activityCode.charAt(0)
				+ activityCode.substring(1, activityCode.length()).toLowerCase());
		activity.setField1(bankAccount.getAccountNumber());
		activity.setField2(bankAccount.getBankName());
		activity.setLastUpdateDate(LocalDateTime.now());
		activity.setLoggingRequired(true);
		return activity;
	}

	@Override
	public BankAccount getBankAccountById(int id) {
		return bankAccountDao.getBankAccountById(id);
	}

	@Override
	public void deleteByIds(List<Integer> ids) {
		bankAccountDao.deleteByIds(ids);
	}

	@Override
	public PaginationResponseModel getBankAccounts(Map<BankAccounrFilterEnum, Object> filterDataMap,
			PaginationModel paginationModel) {
		return bankAccountDao.getBankAccounts(filterDataMap, paginationModel);
	}

	@Override
	public DashBoardBankDataModel getBankBalanceList(BankAccount bank, Map<Object, Number> inflow,
			Map<Object, Number> outFlow) {
		List<Number> number = new ArrayList<>();
		List<String> months = new ArrayList<>();
		for (Object key : inflow.keySet()) {
			number.add((inflow.get(key).doubleValue() - outFlow.get(key).doubleValue()));
			months.add((String) key);
		}
		DashBoardBankDataModel model = new DashBoardBankDataModel();
		model.setData(number);
		model.setBalance(bank.getCurrentBalance());
		model.setUpdatedDate(bank.getLastUpdateDate() != null
				? dateFormatUtil.getLocalDateTimeAsString(bank.getLastUpdateDate(), "dd-MM-yyyy")
				: null);
		model.setLabels(months);
		model.setAccount_name(bank.getBankAccountName());
		return model;

	}

	@Override
	public BigDecimal getAllBankAccountsTotalBalance() {
		return bankAccountDao.getAllBankAccountsTotalBalance();
	}

	@Override
	public List<BankDetails> getBankNameList() {

			
		return bankDetailsRepository.findAll();
	}
}
