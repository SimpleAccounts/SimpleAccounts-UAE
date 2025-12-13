package com.simpleaccounts.rest.bankaccountcontroller;

import com.simpleaccounts.constant.ChartOfAccountCategoryCodeEnum;
import com.simpleaccounts.constant.DefaultTypeConstant;
import com.simpleaccounts.constant.TransactionCategoryCodeEnum;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.bankaccount.*;
import com.simpleaccounts.model.BankModel;
import com.simpleaccounts.model.DashBoardBankDataModel;
import com.simpleaccounts.repository.TransactionRepository;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.*;
import com.simpleaccounts.service.bankaccount.ReconcileStatusService;
import com.simpleaccounts.service.bankaccount.TransactionService;
import com.simpleaccounts.utils.ChartUtil;
import com.simpleaccounts.utils.DateFormatUtil;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
	@SuppressWarnings("java:S131")
	@RequiredArgsConstructor
public class BankAccountRestHelper {

	private static final String DATE_FORMAT_MMM_YYYY = "MMM yyyy";

	private final BankAccountService bankAccountService;

	private final DateFormatUtil dateUtil;

	private final BankAccountStatusService bankAccountStatusService;

	private final CurrencyService currencyService;

	private final ReconcileStatusService reconcileStatusService;

	private final BankAccountTypeService bankAccountTypeService;

	private final TransactionService transactionService;

	private final CountryService countryService;

	private final TransactionCategoryService transactionCategoryService;

	private final TransactionCategoryBalanceService transactionCategoryBalanceService;

	private final BankDetailsRepository bankDetailsRepository;

	private final TransactionRepository transactionRepository;

	private final ChartUtil util;

	private final DateFormatUtil dateFormatUtil;

	public PaginationResponseModel getListModel(PaginationResponseModel pagiantionResponseModel) {

		List<BankAccountListModel> modelList = new ArrayList<>();

		if (pagiantionResponseModel != null && pagiantionResponseModel.getData() != null) {
			List<BankAccount> bankAccounts = (List<BankAccount>) pagiantionResponseModel.getData();
			for (BankAccount acc : bankAccounts) {
				BankAccountListModel model = new BankAccountListModel();
				model.setBankAccountId(acc.getBankAccountId());
				model.setAccounName(acc.getBankAccountName());
				model.setBankAccountNo(acc.getAccountNumber());
				model.setBankAccountTypeName(
						acc.getBankAccountType() != null ? acc.getBankAccountType().getName() : "-");
				model.setCurrancyName(
						acc.getBankAccountCurrency() != null ? acc.getBankAccountCurrency().getCurrencyIsoCode() : "-");
				model.setCurruncySymbol(acc.getBankAccountCurrency().getCurrencyIsoCode());
				Integer res = transactionService.getTransactionCountByBankAccountId(acc.getBankAccountId());
					model.setTransactionCount(res);
				model.setName(acc.getBankName());
				List<ReconcileStatus> reconcileStatusList = reconcileStatusService.getAllReconcileStatusListByBankAccountId(acc.getBankAccountId());
					if (reconcileStatusList.isEmpty()){
						model.setClosingBalance(BigDecimal.ZERO);
					}
				if(reconcileStatusList != null && !reconcileStatusList.isEmpty())
				{
					ReconcileStatus reconcileStatus = reconcileStatusList.get(0);
					model.setReconcileDate(dateUtil.getLocalDateTimeAsString(reconcileStatus.getReconciledDate(), "dd-MM-yyyy"));
					if (reconcileStatus.getClosingBalance()==null){
						model.setClosingBalance(BigDecimal.ZERO);
					}
					model.setClosingBalance(reconcileStatus.getClosingBalance());
				}
				model.setOpeningBalance(acc.getCurrentBalance() != null ? acc.getCurrentBalance().doubleValue() : 0);
				modelList.add(model);
			}

			pagiantionResponseModel.setData(modelList);

		}
		return pagiantionResponseModel;
	}

	public BankModel getModel(BankAccount bank) {

		if (bank != null) {
			BankModel bankModel = new BankModel();

			bankModel.setBankAccountId(bank.getBankAccountId());

			bankModel.setAccountNumber(bank.getAccountNumber());
			bankModel.setBankAccountName(bank.getBankAccountName());
			bankModel.setBankName(bank.getBankName());
			bankModel.setIfscCode(bank.getIfscCode());
			bankModel.setIsprimaryAccountFlag(bank.getIsprimaryAccountFlag());
			bankModel.setOpeningBalance(bank.getOpeningBalance());
			bankModel.setPersonalCorporateAccountInd(bank.getPersonalCorporateAccountInd().toString());
			bankModel.setSwiftCode(bank.getSwiftCode());
			bankModel.setCurrentBalance(bank.getCurrentBalance());
			Integer res = transactionService.getTransactionCountByBankAccountId(bank.getBankAccountId());
			bankModel.setTransactionCount(res);
			if (bank.getOpeningDate() != null) {

				bankModel.setOpeningDate(bank.getOpeningDate());
			}
			if (bank.getBankAccountStatus() != null) {
				bankModel.setBankAccountStatus(bank.getBankAccountStatus().getBankAccountStatusCode());
			}
			if (bank.getBankAccountCurrency() != null) {
				bankModel.setBankAccountCurrency(bank.getBankAccountCurrency().getCurrencyCode());
				bankModel.setBankAccountCurrencySymbol(bank.getBankAccountCurrency().getCurrencySymbol());
				bankModel.setBankAccountCurrencyIsoCode(bank.getBankAccountCurrency().getCurrencyIsoCode());
			}

			if (bank.getBankAccountType() != null) {
				bankModel.setBankAccountType(bank.getBankAccountType().getId());
			}
			if (bank.getBankCountry() != null) {
				bankModel.setBankCountry(bank.getBankCountry().getCountryCode());
			}
			List<ReconcileStatus> reconcileStatusList = reconcileStatusService.getAllReconcileStatusListByBankAccountId(bankModel.getBankAccountId());
			if(reconcileStatusList != null && !reconcileStatusList.isEmpty()) {
				ReconcileStatus reconcileStatus = reconcileStatusList.get(0);
				if (reconcileStatus.getReconciledDate()!=null){

					bankModel.setLastReconcileDate(reconcileStatus.getReconciledDate());
				}

			}
			return bankModel;
		}
		return null;
	}

	@Transactional(rollbackFor = Exception.class)
	public BankAccount getEntity(BankModel bankModel) {
		BankAccount bankAccount = new BankAccount();

		if (bankModel.getBankAccountId() != null) {
			bankAccount = bankAccountService.findByPK(bankModel.getBankAccountId());
		}

		if (bankModel.getBankCountry() != null) {
			bankAccount.setBankCountry(countryService.getCountry(bankModel.getBankCountry()));
		}
		bankAccount.setAccountNumber(bankModel.getAccountNumber());
		bankAccount.setBankAccountName(bankModel.getBankAccountName());
		bankAccount.setBankName(bankModel.getBankName());
		if(bankModel.getBankName().equals("Others")){
			List<BankDetails> bankNameDetailsList = bankDetailsRepository.getBankByBankName(bankModel.getNewBankName());
			if(bankNameDetailsList.isEmpty()){
				BankDetails bankDetails = new BankDetails();
				bankDetails.setBankName(bankModel.getNewBankName());
				bankDetails.setDeleteFlag(false);
				bankDetailsRepository.save(bankDetails);
			}
			bankAccount.setBankName(bankModel.getNewBankName());
		}
		bankAccount.setDeleteFlag(Boolean.FALSE);
		bankAccount.setIfscCode(bankModel.getIfscCode());
		bankAccount.setIsprimaryAccountFlag(bankModel.getIsprimaryAccountFlag());
		bankAccount.setOpeningBalance(bankModel.getOpeningBalance());
		bankAccount.setPersonalCorporateAccountInd(bankModel.getPersonalCorporateAccountInd().charAt(0));
		bankAccount.setSwiftCode(bankModel.getSwiftCode());
		bankAccount.setVersionNumber(1);
		if (bankModel.getOpeningDate()!= null) {

			bankAccount.setOpeningDate(bankModel.getOpeningDate());
		}
		if (bankModel.getBankAccountStatus() != null) {
			BankAccountStatus bankAccountStatus = bankAccountStatusService
					.getBankAccountStatus(bankModel.getBankAccountStatus());
			bankAccount.setBankAccountStatus(bankAccountStatus);
		}
		bankAccountCurrency(bankModel, bankAccount);

		if (bankModel.getBankAccountType() != null) {
			BankAccountType bankAccountType = bankAccountTypeService.getBankAccountType(bankModel.getBankAccountType());
			bankAccount.setBankAccountType(bankAccountType);
		}

		if (bankModel.getBankAccountId() == null || bankModel.getBankAccountId() == 0) {
			bankAccount.setCurrentBalance(bankModel.getOpeningBalance());
			BankAccountStatus bankAccountStatus = bankAccountStatusService.getBankAccountStatusByName("ACTIVE");
			bankAccount.setBankAccountStatus(bankAccountStatus);
		}
		// create transaction category with bankname-accout name

		if (bankAccount.getTransactionCategory() == null) {

			TransactionCategory bankCategory = transactionCategoryService
					.findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.BANK.getCode());

			TransactionCategory category = new TransactionCategory();
			category.setChartOfAccount(bankCategory.getChartOfAccount());
			category.setEditableFlag(Boolean.FALSE);
			category.setSelectableFlag(Boolean.FALSE);
			category.setTransactionCategoryCode(transactionCategoryService
					.getNxtTransactionCatCodeByChartOfAccount(bankCategory.getChartOfAccount()));
			category.setTransactionCategoryName(bankModel.getBankName() + "-" + bankModel.getBankAccountName());
			category.setTransactionCategoryDescription(bankModel.getBankName() + "-" + bankModel.getBankAccountName());
			category.setParentTransactionCategory(bankCategory);
			category.setCreatedDate(LocalDateTime.now());
			category.setCreatedBy(bankModel.getCreatedBy());
			category.setDefaltFlag(DefaultTypeConstant.NO);
			transactionCategoryService.persist(category);
			bankAccount.setTransactionCategory(category);
		}
		return bankAccount;
	}

	public BankAccount getBankAccountByBankAccountModel(BankModel bankModel) {
		if (bankModel.getBankAccountId() != null) {
			BankAccount bankAccount = bankAccountService.getBankAccountById(bankModel.getBankAccountId());
        	if (bankModel.getBankCountry() != null) {
				bankAccount.setBankCountry(countryService.getCountry(bankModel.getBankCountry()));
			}
			bankAccount.setAccountNumber(bankModel.getAccountNumber());
			bankAccount.setBankAccountName(bankModel.getBankAccountName());
			bankAccount.setBankName(bankModel.getBankName());
			if(bankModel.getBankName().equals("Others")){
				List<BankDetails> bankNameDetailsList = bankDetailsRepository.getBankByBankName(bankModel.getNewBankName());
				if(bankNameDetailsList.isEmpty()){
					BankDetails bankDetails = new BankDetails();
					bankDetails.setBankName(bankModel.getNewBankName());
					bankDetails.setDeleteFlag(false);
					bankDetailsRepository.save(bankDetails);
				}
				bankAccount.setBankName(bankModel.getNewBankName());
			}
			bankAccount.setIfscCode(bankModel.getIfscCode());
			bankAccount.setIsprimaryAccountFlag(bankModel.getIsprimaryAccountFlag());
			BigDecimal actualOpeningBalance = bankModel.getOpeningBalance().subtract(bankAccount.getOpeningBalance());
			bankModel.setActualOpeningBalance(actualOpeningBalance);
			bankAccount.setOpeningBalance(bankAccount.getOpeningBalance().add(actualOpeningBalance));
			bankAccount.setCurrentBalance(bankAccount.getCurrentBalance().add(actualOpeningBalance));
			bankAccount.setPersonalCorporateAccountInd(bankModel.getPersonalCorporateAccountInd().charAt(0));
			bankAccount.setSwiftCode(bankModel.getSwiftCode());
			bankAccount.setVersionNumber(
					bankAccount.getVersionNumber() != null ? 1 : (bankAccount.getVersionNumber() + 1));
			if (bankModel.getOpeningDate()!= null) {
				bankAccount.setOpeningDate(bankModel.getOpeningDate());
			}
			if (bankModel.getBankAccountStatus() != null) {
				BankAccountStatus bankAccountStatus = bankAccountStatusService
						.getBankAccountStatus(bankModel.getBankAccountStatus());
				bankAccount.setBankAccountStatus(bankAccountStatus);
			}
			bankAccountCurrency(bankModel, bankAccount);

			if (bankModel.getBankAccountType() != null) {
				BankAccountType bankAccountType = bankAccountTypeService
						.getBankAccountType(bankModel.getBankAccountType());
				bankAccount.setBankAccountType(bankAccountType);
			}

			if (bankModel.getBankAccountId() == null || bankModel.getBankAccountId() == 0) {
				bankAccount.setCurrentBalance(bankModel.getOpeningBalance());
				BankAccountStatus bankAccountStatus = bankAccountStatusService.getBankAccountStatusByName("ACTIVE");
				bankAccount.setBankAccountStatus(bankAccountStatus);
			}
			return bankAccount;
		}
		return null;
	}

	private void bankAccountCurrency(BankModel bankModel, BankAccount bankAccount) {
		if (bankModel.getBankAccountCurrency() != null) {
			Currency currency = currencyService.getCurrency(Integer.valueOf(bankModel.getBankAccountCurrency()));
			bankAccount.setBankAccountCurrency(currency);
		}
	}

	public TransactionCategoryBalance getOpeningBalanceEntity(BankAccount bankAccount,TransactionCategory transactionCategory) {
		Map<String,Object> filterMap = new HashMap<String,Object>();
		filterMap.put("transactionCategory",transactionCategory);
		List<TransactionCategoryBalance> transactionCategoryBalanceList = transactionCategoryBalanceService.findByAttributes(filterMap);
		TransactionCategoryBalance openingBalance =null;
			if(transactionCategoryBalanceList!=null && !transactionCategoryBalanceList.isEmpty())
			{
				return transactionCategoryBalanceList.get(0);

			}
		else {
			openingBalance = new TransactionCategoryBalance();
			openingBalance.setCreatedBy(bankAccount.getCreatedBy());
			openingBalance.setEffectiveDate(dateUtil.getDate());
			openingBalance.setRunningBalance(bankAccount.getOpeningBalance());
			openingBalance.setOpeningBalance(bankAccount.getOpeningBalance());
			openingBalance.setTransactionCategory(transactionCategory);
			openingBalance.setLastUpdateBy(bankAccount.getLastUpdatedBy());
			openingBalance.setDeleteFlag(bankAccount.getDeleteFlag());
		}
		return  openingBalance;
	}
	public Transaction getBankBalanceFromClosingBalance(BankModel bankModel, TransactionCategoryClosingBalance closingBalance
	,Character debitCreditFlag) {
		BigDecimal transactionAmount = BigDecimal.ZERO;
		if (bankModel.getOpeningBalance() != null) {
			transactionAmount = bankModel.getOpeningBalance();
			BigDecimal closingBalanceAmount = closingBalance.getOpeningBalance();
			transactionAmount = transactionAmount.subtract(closingBalanceAmount);
		}
		Transaction transaction = new Transaction();
		LocalDateTime journalDate = closingBalance.getClosingBalanceDate();
		transaction.setDebitCreditFlag(debitCreditFlag);
		transaction.setCreatedBy(closingBalance.getCreatedBy());
		transaction.setTransactionDate(journalDate);
		transaction.setTransactionAmount(transactionAmount);
		transaction.setExplainedTransactionCategory(closingBalance.getTransactionCategory());
		return transaction;
	}
	public TransactionCategory getValidTransactionCategory(TransactionCategory transactionCategory) {
		String transactionCategoryCode = transactionCategory.getChartOfAccount().getChartOfAccountCode();
		ChartOfAccountCategoryCodeEnum chartOfAccountCategoryCodeEnum = ChartOfAccountCategoryCodeEnum.getChartOfAccountCategoryCodeEnum(transactionCategoryCode);
		if (chartOfAccountCategoryCodeEnum == null)
			return null;
		switch (chartOfAccountCategoryCodeEnum) {
			case ACCOUNTS_RECEIVABLE:
			case BANK:
			case CASH:
			case CURRENT_ASSET:
			case FIXED_ASSET:
			case OTHER_CURRENT_ASSET:
			case STOCK:
				return transactionCategoryService
						.findTransactionCategoryByTransactionCategoryCode(
								TransactionCategoryCodeEnum.OPENING_BALANCE_OFFSET_LIABILITIES.getCode());
			case OTHER_LIABILITY:
			case OTHER_CURRENT_LIABILITIES:
			case EQUITY:
				return transactionCategoryService
						.findTransactionCategoryByTransactionCategoryCode(
								TransactionCategoryCodeEnum.OPENING_BALANCE_OFFSET_ASSETS.getCode());
			case ACCOUNTS_PAYABLE:
			case INCOME:
			case ADMIN_EXPENSE:
			case COST_OF_GOODS_SOLD:
			case OTHER_EXPENSE:
			default:
				return transactionCategoryService
						.findTransactionCategoryByTransactionCategoryCode(
								TransactionCategoryCodeEnum.OPENING_BALANCE_OFFSET_LIABILITIES.getCode());
		}
	}
	public TransactionCategoryClosingBalance getClosingBalanceEntity(BankAccount bankAccount, TransactionCategory transactionCategory) {
		TransactionCategoryClosingBalance closingBalance = new TransactionCategoryClosingBalance();
		closingBalance.setClosingBalance(bankAccount.getOpeningBalance());
		closingBalance.setClosingBalanceDate(bankAccount.getOpeningDate());
		closingBalance.setCreatedBy(bankAccount.getCreatedBy());
		closingBalance.setOpeningBalance(bankAccount.getOpeningBalance());
		closingBalance.setEffectiveDate(dateUtil.getDate());
		closingBalance.setDeleteFlag(bankAccount.getDeleteFlag());
		closingBalance.setTransactionCategory(transactionCategory);

		return  closingBalance;
	}

	public TransactionCategoryClosingBalance getClosingBalanceEntity(TransactionCategoryBalance transactionCategoryBalance, TransactionCategory transactionCategory) {
		TransactionCategoryClosingBalance closingBalance = new TransactionCategoryClosingBalance();
		closingBalance.setClosingBalance(transactionCategoryBalance.getOpeningBalance());
		LocalDateTime openingDate = Instant.ofEpochMilli(new Date().getTime())
				.atZone(ZoneId.systemDefault()).withHour(0).withMinute(0).withSecond(0).withNano(0)
				.toLocalDateTime();
		closingBalance.setClosingBalanceDate(openingDate);
		closingBalance.setCreatedBy(transactionCategoryBalance.getCreatedBy());
		closingBalance.setOpeningBalance(transactionCategoryBalance.getOpeningBalance());
		closingBalance.setEffectiveDate(dateUtil.getDate());
		closingBalance.setDeleteFlag(Boolean.FALSE);
		closingBalance.setTransactionCategory(transactionCategory);

		return  closingBalance;
	}

	public DashBoardBankDataModel getBankBalanceList(Integer bankId, Integer monthCount) {

		Date start;
		Date end = getEndDate().getTime();
		if (monthCount != null) {
			start = util.getStartDate(Calendar.MONTH, -monthCount).getTime();
		} else {
			start = util.getStartDate(Calendar.YEAR, -1).getTime();
		}
		LocalDateTime startDate = Instant.ofEpochMilli(start.getTime())
				.atZone(ZoneId.systemDefault()).toLocalDateTime().toLocalDate().atStartOfDay();
		LocalDateTime endDate = Instant.ofEpochMilli(end.getTime())
				.atZone(ZoneId.systemDefault()).toLocalDateTime().toLocalDate().atTime(LocalTime.MAX);
		List<Transaction> transactionList = transactionRepository.getTransactionForDashboard(bankId, startDate, endDate);
		transactionList.sort(Comparator.comparing(Transaction::getTransactionDate));

		BankAccount bank = bankAccountService.findByPK(bankId);
		BigDecimal openingBalance = bank.getOpeningBalance();
		LocalDateTime bankOpeningDate = bank.getOpeningDate().atZone(ZoneId.systemDefault()).toLocalDateTime().toLocalDate().atStartOfDay();

		if (bankOpeningDate.isBefore(startDate)) {
			endDate = startDate;
			startDate = bankOpeningDate;
			List<Transaction> openingBalanceList = transactionRepository.getTransactionForDashboard(bankId, startDate, endDate);
			for (Transaction transaction : openingBalanceList) {
				if(transaction.getDebitCreditFlag() == 'C') {
					openingBalance = openingBalance.add(transaction.getTransactionAmount());
				} else {
					openingBalance = openingBalance.subtract(transaction.getTransactionAmount());
				}
			}
		}

		List<String> monthList = new ArrayList<>();
		for (int i = 0; i < monthCount; i++) {
			Calendar calendar = util.getStartDate(Calendar.MONTH, -monthCount);
			calendar.add(Calendar.MONTH, i);
			monthList.add(new SimpleDateFormat(DATE_FORMAT_MMM_YYYY).format(calendar.getTime()));
		}

		BigDecimal totalAmt = openingBalance;
		Map<String, BigDecimal> map = new HashMap<>();
		for (Transaction transaction : transactionList) {
			String month = dateFormatUtil.getLocalDateTimeAsString(transaction.getTransactionDate(), DATE_FORMAT_MMM_YYYY);
			if(transaction.getDebitCreditFlag() == 'C') {
				totalAmt = totalAmt.add(transaction.getTransactionAmount());
			} else {
				totalAmt = totalAmt.subtract(transaction.getTransactionAmount());
			}
			map.put(month, totalAmt);
		}

		List<Number> bankBalanceList = new LinkedList<>();
		BigDecimal previousAmount = openingBalance;
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern(DATE_FORMAT_MMM_YYYY);
		for (String month : monthList) {
			YearMonth yearMonth = YearMonth.parse(month, formatter);
			LocalDate monthDate = yearMonth.atEndOfMonth();
			BigDecimal amount;
			if (!monthDate.isBefore(bankOpeningDate.toLocalDate())) {
				amount = map.getOrDefault(month, previousAmount);
				bankBalanceList.add(amount);
				previousAmount = amount;
			} else {
				amount = BigDecimal.ZERO;
				bankBalanceList.add(amount);
			}
		}

		DashBoardBankDataModel model = new DashBoardBankDataModel();
		model.setBalance(bank.getCurrentBalance());
		model.setUpdatedDate(bank.getLastUpdateDate() != null
				? dateFormatUtil.getLocalDateTimeAsString(bank.getLastUpdateDate(), "dd-MM-yyyy")
				: null);
		model.setAccount_name(bank.getBankAccountName());
		model.setLabels(monthList);
		model.setData(bankBalanceList);

		return model;
	}

	private Calendar getEndDate() {
		Calendar currentMonth = Calendar.getInstance();
		currentMonth.set(Calendar.DAY_OF_MONTH, 1);
		currentMonth.add(Calendar.MONTH, 1);
		currentMonth.add(Calendar.DAY_OF_MONTH, -1);
		return currentMonth;
	}
}
