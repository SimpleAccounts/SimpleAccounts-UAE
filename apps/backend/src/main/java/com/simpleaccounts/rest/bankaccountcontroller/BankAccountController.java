package com.simpleaccounts.rest.bankaccountcontroller;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.bank.model.DeleteModel;
import com.simpleaccounts.constant.ChartOfAccountCategoryCodeEnum;
import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import com.simpleaccounts.constant.TransactionCategoryCodeEnum;
import com.simpleaccounts.constant.dbfilter.BankAccounrFilterEnum;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.bankaccount.*;
import com.simpleaccounts.model.BankModel;
import com.simpleaccounts.model.DashBoardBankDataModel;
import com.simpleaccounts.repository.JournalLineItemRepository;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.*;
import com.simpleaccounts.service.bankaccount.TransactionService;
import com.simpleaccounts.utils.MessageUtil;
import com.simpleaccounts.utils.SimpleAccountsMessage;
import io.swagger.annotations.ApiOperation;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author Sonu
 */
	@RestController
	@RequestMapping(value = "/rest/bank")
	@SuppressWarnings("java:S131")
	@RequiredArgsConstructor
public class BankAccountController{

	private static final String MSG_DELETE_UNSUCCESSFUL = "delete.unsuccessful.msg";

	private  final Logger logger = LoggerFactory.getLogger(BankAccountController.class);

	private final BankAccountService bankAccountService;

	protected final JournalService journalService;

	private final CoacTransactionCategoryService coacTransactionCategoryService;
	private final TransactionCategoryClosingBalanceService transactionCategoryClosingBalanceService;

	private final TransactionCategoryBalanceService transactionCategoryBalanceService;

	private final BankAccountStatusService bankAccountStatusService;

	private final UserService userServiceNew;

	private final CurrencyService currencyService;

	private final BankAccountTypeService bankAccountTypeService;

	private final CountryService countryService;

	private final BankAccountRestHelper bankAccountRestHelper;

	private final TransactionCategoryService transactionCategoryService;
	private final ExpenseService expenseService;
	private final JwtTokenUtil jwtTokenUtil;

	private final BankAccountRestHelper bankRestHelper;

	private final TransactionService transactionService;

	private final CurrencyExchangeService currencyExchangeService;
	private final UserService userService;

	private final JournalLineItemRepository journalLineItemRepository;

	@LogRequest
	@ApiOperation(value = "Get All Bank Accounts", response = List.class)
	@GetMapping(value = "/list")
	public ResponseEntity<PaginationResponseModel> getBankAccountList(BankAccountFilterModel filterModel,
																	  HttpServletRequest request) {
		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
		User user = userService.findByPK(userId);

		Map<BankAccounrFilterEnum, Object> filterDataMap = new EnumMap<>(BankAccounrFilterEnum.class);

		filterDataMap.put(BankAccounrFilterEnum.BANK_ACCOUNT_NAME, filterModel.getBankAccountName());
		filterDataMap.put(BankAccounrFilterEnum.BANK_BNAME, filterModel.getBankName());
		filterDataMap.put(BankAccounrFilterEnum.ACCOUNT_NO, filterModel.getAccountNumber());

		filterDataMap.put(BankAccounrFilterEnum.DELETE_FLAG, false);
		if (filterModel.getTransactionDate() != null) {
			LocalDateTime date = Instant.ofEpochMilli(filterModel.getTransactionDate().getTime())
					.atZone(ZoneId.systemDefault()).toLocalDateTime();
			filterDataMap.put(BankAccounrFilterEnum.TRANSACTION_DATE, date);
		}
		if (filterModel.getBankAccountTypeId() != null) {
			filterDataMap.put(BankAccounrFilterEnum.BANK_ACCOUNT_TYPE,
					bankAccountTypeService.findByPK(filterModel.getBankAccountTypeId()));
		}
		if (filterModel.getCurrencyCode() != null) {
			filterDataMap.put(BankAccounrFilterEnum.CURRENCY_CODE,
					currencyService.findByPK(filterModel.getCurrencyCode()));
		}

		PaginationResponseModel paginatinResponseModel = bankAccountService.getBankAccounts(filterDataMap, filterModel);
		if (paginatinResponseModel != null) {
			return new ResponseEntity<>(bankAccountRestHelper.getListModel(paginatinResponseModel), HttpStatus.OK);
		} else {
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Add New Bank Account", response = BankAccount.class)
	@PostMapping("/save")
	public ResponseEntity<Object> saveBankAccount(@RequestBody BankModel bankModel, HttpServletRequest request) {
		SimpleAccountsMessage message = null;
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			bankModel.setCreatedBy(userId);
			BankAccount bankAccount = bankRestHelper.getEntity(bankModel);
			User user = userServiceNew.findByPK(userId);
			if (bankModel.getBankAccountId() == null) {
				if (user != null) {
					bankAccount.setCreatedDate(LocalDateTime.now());
					bankAccount.setCreatedBy(user.getUserId());
				}
				bankAccountService.persist(bankAccount);
                if (bankAccount.getTransactionCategory() == null) {
                    return new ResponseEntity<>("Transaction Category is missing", HttpStatus.BAD_REQUEST);
                }
					TransactionCategory category = transactionCategoryService.findByPK(bankAccount.getTransactionCategory().getTransactionCategoryId());
					if (category == null) {
						return new ResponseEntity<>("Transaction Category is missing", HttpStatus.BAD_REQUEST);
					}
					TransactionCategory transactionCategory = getValidTransactionCategory(category);
					if (transactionCategory == null) {
						return new ResponseEntity<>("Transaction Category is missing", HttpStatus.BAD_REQUEST);
					}
					boolean isDebit=false;
					if(StringUtils.equalsAnyIgnoreCase(transactionCategory.getTransactionCategoryCode(),
							TransactionCategoryCodeEnum.OPENING_BALANCE_OFFSET_LIABILITIES.getCode())){
						isDebit=true;
					}
					BigDecimal openBigDecimal = bankModel.getOpeningBalance();
					CurrencyConversion exchangeRate =  currencyExchangeService.getExchangeRate(bankModel.getBankAccountCurrency());
					BigDecimal exchangeRateValue = BigDecimal.ONE;
					if(exchangeRate!=null && exchangeRate.getExchangeRate() != null)
					{
						exchangeRateValue = exchangeRate.getExchangeRate();
						openBigDecimal = openBigDecimal.multiply(exchangeRateValue);
					}
				List<JournalLineItem> journalLineItemList = new ArrayList<>();
				Journal journal = new Journal();
				JournalLineItem journalLineItem1 = new JournalLineItem();
				journalLineItem1.setTransactionCategory(category);
				if (isDebit) {
					journalLineItem1.setDebitAmount(openBigDecimal);
				} else {
					journalLineItem1.setCreditAmount(openBigDecimal);
				}
					journalLineItem1.setReferenceType(PostingReferenceTypeEnum.BANK_ACCOUNT);
					journalLineItem1.setReferenceId(category.getTransactionCategoryId());
					journalLineItem1.setExchangeRate(exchangeRateValue);
					journalLineItem1.setCreatedBy(userId);
					journalLineItem1.setJournal(journal);
					journalLineItemList.add(journalLineItem1);

				JournalLineItem journalLineItem2 = new JournalLineItem();
				journalLineItem2.setTransactionCategory(transactionCategory);

				if (!isDebit) {
					journalLineItem2.setDebitAmount(openBigDecimal);
				} else {
					journalLineItem2.setCreditAmount(openBigDecimal);
				}
					journalLineItem2.setReferenceType(PostingReferenceTypeEnum.BANK_ACCOUNT);
					journalLineItem2.setReferenceId(category.getTransactionCategoryId());
					journalLineItem2.setExchangeRate(exchangeRateValue);
					journalLineItem2.setCreatedBy(userId);
					journalLineItem2.setJournal(journal);
					journalLineItemList.add(journalLineItem2);

				journal.setJournalLineItems(journalLineItemList);
				journal.setCreatedBy(userId);
				journal.setPostingReferenceType(PostingReferenceTypeEnum.BANK_ACCOUNT);

				journal.setJournalDate(bankModel.getOpeningDate().toLocalDate());

				journal.setTransactionDate(bankModel.getOpeningDate().toLocalDate());
				journalService.persist(journal);
                coacTransactionCategoryService.addCoacTransactionCategory(bankAccount.getTransactionCategory().getChartOfAccount(),
						bankAccount.getTransactionCategory());
				message = new SimpleAccountsMessage("0075",
						MessageUtil.getMessage("bank.account.created.successful.msg.0075"), false);
				return new ResponseEntity<>(message,HttpStatus.OK);
			}
		} catch (Exception e) {
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("create.unsuccessful.msg"), true);
		}
		return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
	}
	private TransactionCategory getValidTransactionCategory(TransactionCategory transactionCategory) {
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

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Update Bank Account", response = BankAccount.class)
	@PutMapping("/{bankAccountId}")
	public ResponseEntity<Object> updateBankAccount(@PathVariable("bankAccountId") Integer bankAccountId, BankModel bankModel,HttpServletRequest request) {
		try {
			SimpleAccountsMessage message = null;
																										Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			bankModel.setBankAccountId(bankAccountId);
			BankAccount bankAccount = bankRestHelper.getBankAccountByBankAccountModel(bankModel);
			User user = userServiceNew.findByPK(userId);
			bankAccount.setBankAccountId(bankModel.getBankAccountId());
			bankAccount.setLastUpdateDate(LocalDateTime.now());
			bankAccount.setLastUpdatedBy(user.getUserId());
			bankAccountService.update(bankAccount);
			TransactionCategory category = transactionCategoryService.findByPK(bankAccount.getTransactionCategory().getTransactionCategoryId());
			if (category == null) {
				return new ResponseEntity<>("Transaction Category is missing", HttpStatus.BAD_REQUEST);
			}
			category.setTransactionCategoryName(bankModel.getBankName() + "-" + bankModel.getBankAccountName());
			category.setTransactionCategoryDescription(bankModel.getBankName() + "-" + bankModel.getBankAccountName());
			transactionCategoryService.update(category);
			TransactionCategory transactionCategory = getValidTransactionCategory(category);
			if (transactionCategory == null) {
				return new ResponseEntity<>("Transaction Category is missing", HttpStatus.BAD_REQUEST);
			}
			updateTransactionCategory(category, bankModel);
			boolean isDebit = false;
			if (StringUtils.equalsAnyIgnoreCase(transactionCategory.getTransactionCategoryCode(),
					TransactionCategoryCodeEnum.OPENING_BALANCE_OFFSET_LIABILITIES.getCode())) {
				isDebit = true;
			}
			BigDecimal openBigDecimal = bankModel.getOpeningBalance();
			CurrencyConversion exchangeRate = currencyExchangeService.getExchangeRate(bankModel.getBankAccountCurrency());
			BigDecimal exchangeRateValue = BigDecimal.ONE;
			if (exchangeRate != null && exchangeRate.getExchangeRate() != null) {
				exchangeRateValue = exchangeRate.getExchangeRate();
				openBigDecimal = openBigDecimal.multiply(exchangeRateValue);
			}

			List<JournalLineItem> bankAccJliList = journalLineItemRepository.findAllByReferenceIdAndReferenceType(
					bankAccount.getTransactionCategory().getTransactionCategoryId(),
					PostingReferenceTypeEnum.BANK_ACCOUNT);
			bankAccJliList = bankAccJliList.stream().filter(journalLineItem ->
					journalLineItem.getDeleteFlag().equals(Boolean.FALSE)).collect(Collectors.toList());
			List<JournalLineItem> reverseExpenseJournalLineItemList = new ArrayList<>();
			Journal reverseExpenseJournal = new Journal();
			for (JournalLineItem journalLineItem : bankAccJliList) {
				JournalLineItem journalLineItem1 = new JournalLineItem();
				journalLineItem1.setTransactionCategory(journalLineItem.getTransactionCategory());
					if (journalLineItem.getDebitAmount() != null && journalLineItem.getDebitAmount().compareTo(BigDecimal.ZERO) > 0) {
						journalLineItem1.setCreditAmount(journalLineItem.getDebitAmount());
					} else {
						journalLineItem1.setDebitAmount(journalLineItem.getCreditAmount());
					}
				journalLineItem1.setReferenceType(PostingReferenceTypeEnum.REVERSE_BANK_ACCOUNT);
				journalLineItem1.setReferenceId(journalLineItem.getReferenceId());
				journalLineItem1.setExchangeRate(journalLineItem.getExchangeRate());
				journalLineItem1.setCreatedBy(journalLineItem.getCreatedBy());
				journalLineItem1.setJournal(reverseExpenseJournal);
				reverseExpenseJournalLineItemList.add(journalLineItem1);

				journalLineItem.setDeleteFlag(Boolean.TRUE);
				Journal deleteJournal = journalLineItem.getJournal();
				deleteJournal.setDeleteFlag(Boolean.TRUE);
				journalService.update(deleteJournal);
			}
			reverseExpenseJournal.setJournalLineItems(reverseExpenseJournalLineItemList);
			reverseExpenseJournal.setCreatedBy(userId);
			reverseExpenseJournal.setPostingReferenceType(PostingReferenceTypeEnum.REVERSE_BANK_ACCOUNT);
			reverseExpenseJournal.setJournalDate(LocalDate.now());
			reverseExpenseJournal.setTransactionDate(LocalDate.now());
			reverseExpenseJournal.setDescription("Reverse Bank Account");
			journalService.persist(reverseExpenseJournal);

			List<JournalLineItem> journalLineItemList = new ArrayList<>();
			Journal journal = new Journal();
			JournalLineItem journalLineItem1 = new JournalLineItem();
			journalLineItem1.setTransactionCategory(category);
			if (isDebit) {
				journalLineItem1.setDebitAmount(openBigDecimal);
			} else {
				journalLineItem1.setCreditAmount(openBigDecimal);
			}
			journalLineItem1.setReferenceType(PostingReferenceTypeEnum.BANK_ACCOUNT);
			journalLineItem1.setReferenceId(category.getTransactionCategoryId());
			journalLineItem1.setCreatedBy(userId);
			journalLineItem1.setExchangeRate(exchangeRateValue);
			journalLineItem1.setJournal(journal);
			journalLineItemList.add(journalLineItem1);

			JournalLineItem journalLineItem2 = new JournalLineItem();
			journalLineItem2.setTransactionCategory(transactionCategory);
			if (!isDebit) {
				journalLineItem2.setDebitAmount(openBigDecimal);
			} else {
				journalLineItem2.setCreditAmount(openBigDecimal);
			}
			journalLineItem2.setReferenceType(PostingReferenceTypeEnum.BANK_ACCOUNT);
			journalLineItem2.setReferenceId(category.getTransactionCategoryId());
			journalLineItem2.setCreatedBy(userId);
			journalLineItem2.setExchangeRate(exchangeRateValue);
			journalLineItem2.setJournal(journal);
			journalLineItemList.add(journalLineItem2);

			journal.setJournalLineItems(journalLineItemList);
			journal.setCreatedBy(userId);
			journal.setPostingReferenceType(PostingReferenceTypeEnum.BANK_ACCOUNT);
			journal.setJournalDate(LocalDate.now());
			journal.setTransactionDate(LocalDate.now());
			journalService.persist(journal);

			message = new SimpleAccountsMessage("0076",
					MessageUtil.getMessage("bank.account.updated.successful.msg.0076"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {
			SimpleAccountsMessage message = null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("update.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	private void updateTransactionCategory(TransactionCategory category, BankModel bankModel) {

		category.setTransactionCategoryName(bankModel.getBankName() + "-" + bankModel.getBankAccountName());
		category.setTransactionCategoryDescription(bankModel.getBankName() + "-" + bankModel.getBankAccountName());
		transactionCategoryService.update(category);
	}

	@LogRequest
	@ApiOperation(value = "Get All Bank Account Types")
	@GetMapping(value = "/getaccounttype")
	public ResponseEntity<List<BankAccountType> > getBankAccontType() {
		List<BankAccountType> bankAccountTypes = bankAccountTypeService.getBankAccountTypeList();
		if (bankAccountTypes != null && !bankAccountTypes.isEmpty()) {
			return new ResponseEntity<>(bankAccountTypes, HttpStatus.OK);
		} else {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}

	@LogRequest
	@ApiOperation(value = "Get All Bank Account Status")
	@GetMapping(value = "/getbankaccountstatus")
	public ResponseEntity<List<BankAccountStatus>> getBankAccountStatus() {
		List<BankAccountStatus> bankAccountStatuses = bankAccountStatusService.getBankAccountStatuses();
		if (bankAccountStatuses != null && !bankAccountStatuses.isEmpty()) {
			return new ResponseEntity<>(bankAccountStatuses, HttpStatus.OK);
		} else {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}

	/**
	 * @Deprecated
	 */
	@LogRequest
	@GetMapping(value = "/getcountry")
	public ResponseEntity<List<Country>> getCountry() {
		try {
			List<Country> countries = countryService.getCountries();
			if (countries != null && !countries.isEmpty()) {
				return new ResponseEntity<>(countries,HttpStatus.OK);
			} else {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete the Bank Account", response = BankAccount.class)
	@DeleteMapping(value = "/{bankAccountId}")
	public ResponseEntity<Object> deleteBankAccount(@PathVariable("bankAccountId") Integer bankAccountId,
			HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);

			BankAccount  bankAccount = bankAccountService.findByPK(bankAccountId);
			if (bankAccount != null) {
				Map<String,Object> filterMap = new HashMap<>();
				filterMap.put("transactionCategory",bankAccount.getTransactionCategory());

				List<JournalLineItem> bankJLIList= journalLineItemRepository.findAllByReferenceIdAndReferenceType(
						bankAccount.getTransactionCategory().getTransactionCategoryId(),
						PostingReferenceTypeEnum.BANK_ACCOUNT);
				bankJLIList = bankJLIList.stream().filter(journalLineItem ->
						journalLineItem.getDeleteFlag().equals(Boolean.FALSE)).collect(Collectors.toList());
				List<JournalLineItem> reverseExpenseJournalLineItemList = new ArrayList<>();
				Journal reverseBankAccountJournal = new Journal();
				for (JournalLineItem journalLineItem:bankJLIList){
					JournalLineItem journalLineItem1 = new JournalLineItem();
					journalLineItem1.setTransactionCategory(journalLineItem.getTransactionCategory());
						if (journalLineItem.getDebitAmount()!=null && journalLineItem.getDebitAmount().compareTo(BigDecimal.ZERO)>0) {
							journalLineItem1.setCreditAmount(journalLineItem.getDebitAmount());
						} else {
							journalLineItem1.setDebitAmount(journalLineItem.getCreditAmount());
						}
					journalLineItem1.setReferenceType(PostingReferenceTypeEnum.DELETE_BANK_ACCOUNT);
					journalLineItem1.setReferenceId(journalLineItem.getReferenceId());
					journalLineItem1.setExchangeRate(journalLineItem.getExchangeRate());
					journalLineItem1.setCreatedBy(journalLineItem.getCreatedBy());
					journalLineItem1.setJournal(reverseBankAccountJournal);
					reverseExpenseJournalLineItemList.add(journalLineItem1);

					journalLineItem.setDeleteFlag(Boolean.TRUE);
					Journal deleteJournal = journalLineItem.getJournal();
					deleteJournal.setDeleteFlag(Boolean.TRUE);
					journalService.update(deleteJournal);
				}
				reverseBankAccountJournal.setJournalLineItems(reverseExpenseJournalLineItemList);
				reverseBankAccountJournal.setCreatedBy(userId);
				reverseBankAccountJournal.setPostingReferenceType(PostingReferenceTypeEnum.DELETE_BANK_ACCOUNT);
				reverseBankAccountJournal.setJournalDate(LocalDate.now());
				reverseBankAccountJournal.setTransactionDate(LocalDateTime.now().toLocalDate());
				reverseBankAccountJournal.setDescription("Delete Bank Account");
				journalService.persist(reverseBankAccountJournal);
				//delete Transaction
				List<Transaction> transactionList = transactionService.getAllTransactionListByBankAccountId(bankAccountId);
				for(Transaction transaction:transactionList)
				{
					if(transaction.getDebitCreditFlag()=='C' && !transaction.getDeleteFlag())
					{
						bankAccount.setCurrentBalance(bankAccount.getCurrentBalance()
								.subtract(transaction.getTransactionAmount()));
					}
					else if( !transaction.getDeleteFlag())
					{
						bankAccount.setCurrentBalance(bankAccount.getCurrentBalance()
								.add(transaction.getTransactionAmount()));
					}
					//transactionService.delete(transaction)
					transaction.setDeleteFlag(Boolean.TRUE);
					transactionService.update(transaction);
				}
				//delete closing balance
				filterMap = new HashMap<>();
				filterMap.put("transactionCategory",bankAccount.getTransactionCategory());
				List<TransactionCategoryClosingBalance> transactionCategoryClosingBalanceList =
						transactionCategoryClosingBalanceService.findByAttributes(filterMap);
				for(TransactionCategoryClosingBalance transactionCategoryClosingBalance :
						transactionCategoryClosingBalanceList)
				{
					transactionCategoryClosingBalanceService.delete(transactionCategoryClosingBalance);
				}
				//delete opening balance
				List<TransactionCategoryBalance> transactionCategoryBalanceList =
						transactionCategoryBalanceService.findByAttributes(filterMap);
				for(TransactionCategoryBalance transactionCategoryBalance : transactionCategoryBalanceList)
				{
					transactionCategoryBalanceService.delete(transactionCategoryBalance);
				}
                // Delete Expenses created from Bank

				Map<String,Object> expenseFilterMap = new HashMap<>();
				expenseFilterMap.put("bankAccount",bankAccount);
				List<Expense> expenseList = expenseService.findByAttributes(expenseFilterMap);
                for(Expense expense : expenseList)
                	expenseService.delete(expense);

				bankAccount.setLastUpdatedBy(userId);
				bankAccount.setDeleteFlag(true);

				bankAccountService.update(bankAccount);
				//delete coac category
				List<CoacTransactionCategory> coacTransactionCategoryList = coacTransactionCategoryService
						.findByAttributes(filterMap);
				for(CoacTransactionCategory coacTransactionCategory: coacTransactionCategoryList)
				{
					coacTransactionCategoryService.delete(coacTransactionCategory);
				}
				//delete transaction category
				Map<String,Object> filterTransactionCategoryMap = new HashMap<>();

				filterTransactionCategoryMap.put("transactionCategoryId",bankAccount.getTransactionCategory()
						.getTransactionCategoryId());

				List<TransactionCategory> transactionCategoryList = transactionCategoryService
						.findByAttributes(filterTransactionCategoryMap);
				for(TransactionCategory transactionCategory : transactionCategoryList)
				{
					transactionCategory.setDeleteFlag(Boolean.TRUE);
					transactionCategoryService.update(transactionCategory);

				}

				SimpleAccountsMessage message = null;
				message = new SimpleAccountsMessage("0074",
						MessageUtil.getMessage("bank.account.deleted.successful.msg.0074"), false);
				return new ResponseEntity<>(message,HttpStatus.OK);
			} else {
				SimpleAccountsMessage message = null;
				message = new SimpleAccountsMessage("",
						MessageUtil.getMessage(MSG_DELETE_UNSUCCESSFUL), true);
				return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
			}
		} catch (Exception e) {
			SimpleAccountsMessage message = null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage(MSG_DELETE_UNSUCCESSFUL), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	@LogRequest
	@ApiOperation(value = "Get Bank Account by Bank Account ID", response = BankAccount.class)
	@GetMapping(value = "/getbyid")
		public ResponseEntity<BankModel> getById(@RequestParam("id") Integer id) {
			try {
				BankAccount bankAccount = bankAccountService.findByPK(id);
				if (bankAccount == null) {
					return new ResponseEntity<>(HttpStatus.NO_CONTENT);
				}
				TransactionCategoryClosingBalance closingBalance = transactionCategoryClosingBalanceService.
						getLastClosingBalanceByDate(bankAccount.getTransactionCategory());
				BankModel bankModel = bankAccountRestHelper.getModel(bankAccount);
				if (closingBalance!=null && closingBalance.getClosingBalance()!=null) {
					bankModel.setClosingBalance(closingBalance.getBankAccountClosingBalance());
				}

				return new ResponseEntity<>( bankModel, HttpStatus.OK);
			} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete Bank Accounts")
	@DeleteMapping(value = "/multiple")
	public ResponseEntity<Object> deleteBankAccounts(@RequestBody DeleteModel ids) {
		try {
			bankAccountService.deleteByIds(ids.getIds());
			SimpleAccountsMessage message = null;
			message = new SimpleAccountsMessage("0074",
					MessageUtil.getMessage("bank.account.deleted.successful.msg.0074"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);

		} catch (Exception e) {
			SimpleAccountsMessage message = null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage(MSG_DELETE_UNSUCCESSFUL), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	@LogRequest
	@GetMapping(value = "/getcurrenncy")
	public ResponseEntity<List<Currency>> getCurrency() {
		try {
			List<Currency> currencies = currencyService.getCurrencies();
			if (currencies != null && !currencies.isEmpty()) {
				return new ResponseEntity<>(currencies, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@Cacheable(cacheNames = "dashboardBankChart", key = "#bankId + '-' + #monthCount")
	@GetMapping(value = "/getBankChart")
	public ResponseEntity<DashBoardBankDataModel> getCurrency(@RequestParam(required = false) Integer bankId, Integer monthCount) {
		try {
			long start = System.currentTimeMillis();
			if (bankId == null) {
				// Return empty chart data when no bank account is selected
				DashBoardBankDataModel emptyData = new DashBoardBankDataModel();
				return new ResponseEntity<>(emptyData, HttpStatus.OK);
			}
			DashBoardBankDataModel result = bankAccountRestHelper.getBankBalanceList(bankId, monthCount);
			logger.info("[PERF] getBankChart for bankId={} months={} took {} ms", bankId, monthCount, System.currentTimeMillis() - start);
			return new ResponseEntity<>(result, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@Cacheable(cacheNames = "dashboardBankTotalBalance")
	@GetMapping(value = "/getTotalBalance")
	public ResponseEntity<BigDecimal> getTotalBalance() {
		try {
			long start = System.currentTimeMillis();
			BigDecimal totalBalance = bankAccountService.getAllBankAccountsTotalBalance();
			logger.info("[PERF] getTotalBalance took {} ms", System.currentTimeMillis() - start);
			return new ResponseEntity<>(totalBalance != null ? totalBalance : BigDecimal.valueOf(0), HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	
	
	@LogRequest
	@ApiOperation(value = "Get All Bank List", response = List.class)
	@GetMapping(value = "/getBankNameList")
	public ResponseEntity<Object> getBankNameList(HttpServletRequest request) {
		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
		User user = userService.findByPK(userId);
		 try {
			 
	            List<BankDetails> bankNameDetailsList = bankAccountService.getBankNameList();
	            
	            return new ResponseEntity<>(bankNameDetailsList,HttpStatus.OK);
	        }catch (Exception e){
	            return new  ResponseEntity<>( "No Files Available",HttpStatus.OK);
	        }
	}
	
}
