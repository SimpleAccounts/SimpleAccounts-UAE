package com.simpleaccounts.rest.transactioncategorybalancecontroller;

import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

import java.util.*;

import javax.servlet.http.HttpServletRequest;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.constant.ChartOfAccountCategoryCodeEnum;
import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import com.simpleaccounts.constant.TransactionCategoryCodeEnum;
import com.simpleaccounts.constant.dbfilter.ORDERBYENUM;
import com.simpleaccounts.constant.dbfilter.TransactionCategoryBalanceFilterEnum;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.migration.model.ListOfTCBPModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.*;
import com.simpleaccounts.utils.MessageUtil;
import com.simpleaccounts.utils.SimpleAccountsMessage;
import io.swagger.annotations.ApiOperation;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
	@RequestMapping(value = "/rest/transactionCategoryBalance")
	@SuppressWarnings({"java:S3973", "java:S131"})
	@RequiredArgsConstructor
public class TransactionCategoryBalanceController {
	private final Logger logger = LoggerFactory.getLogger(TransactionCategoryBalanceController.class);

	private final UserService userServiceNew;

	private final JwtTokenUtil jwtTokenUtil;

	private final TransactionCategoryBalanceService transactionCategoryBalanceService;

	private final TransactionCategoryBalanceRestHelper transactionCategoryBalanceRestHelper;

	private final TransactionCategoryService transactionCategoryService;

	private final JournalService journalService;

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Save")
	@PostMapping(value = "/save")
	public ResponseEntity<Object> save(@ModelAttribute ListOfTCBPModel persistmodelList,
									   HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			User user = userServiceNew.findByPK(userId);
			List<TransactioncategoryBalancePersistModel> list=persistmodelList.getPersistModelList();
			for(TransactioncategoryBalancePersistModel persistmodel: list){
				TransactionCategory category = transactionCategoryService.findByPK(persistmodel.getTransactionCategoryId());
				boolean isDebit = getValidTransactionCategoryType(category);
				TransactionCategory transactionCategory = transactionCategoryService
						.findTransactionCategoryByTransactionCategoryCode(
								TransactionCategoryCodeEnum.OPENING_BALANCE_OFFSET_LIABILITIES.getCode());

				List<JournalLineItem> journalLineItemList = new ArrayList<>();
				Journal journal = new Journal();
				JournalLineItem journalLineItem1 = new JournalLineItem();
				journalLineItem1.setTransactionCategory(category);
				boolean isNegative = persistmodel.getOpeningBalance().longValue()<0;
				if (isDebit ) {
					if(!isNegative)
					journalLineItem1.setDebitAmount(persistmodel.getOpeningBalance());
					else
						journalLineItem1.setCreditAmount(persistmodel.getOpeningBalance().negate());
				} else {
					if(!isNegative)
					journalLineItem1.setCreditAmount(persistmodel.getOpeningBalance());
					else
						journalLineItem1.setDebitAmount(persistmodel.getOpeningBalance().negate());
				}
				journalLineItem1.setReferenceType(PostingReferenceTypeEnum.BALANCE_ADJUSTMENT);
				journalLineItem1.setReferenceId(category.getTransactionCategoryId());
				journalLineItem1.setCreatedBy(userId);
				journalLineItem1.setExchangeRate(BigDecimal.ONE);
				journalLineItem1.setJournal(journal);
				journalLineItemList.add(journalLineItem1);

				JournalLineItem journalLineItem2 = new JournalLineItem();
				journalLineItem2.setTransactionCategory(transactionCategory);
				if (!isDebit) {
					if(!isNegative)
					journalLineItem2.setDebitAmount(persistmodel.getOpeningBalance());
					else
						journalLineItem2.setCreditAmount(persistmodel.getOpeningBalance().negate());
				} else {
					if(!isNegative)
					journalLineItem2.setCreditAmount(persistmodel.getOpeningBalance());
					else
						journalLineItem2.setDebitAmount(persistmodel.getOpeningBalance().negate());
				}
				journalLineItem2.setReferenceType(PostingReferenceTypeEnum.BALANCE_ADJUSTMENT);
				journalLineItem2.setReferenceId(transactionCategory.getTransactionCategoryId());
				journalLineItem2.setCreatedBy(userId);
				journalLineItem2.setExchangeRate(BigDecimal.ONE);
				journalLineItem2.setJournal(journal);
				journalLineItemList.add(journalLineItem2);

				journal.setJournalLineItems(journalLineItemList);
				journal.setCreatedBy(userId);
				journal.setPostingReferenceType(PostingReferenceTypeEnum.BALANCE_ADJUSTMENT);
				Instant instant = Instant.ofEpochMilli(persistmodel.getEffectiveDate().getTime());
				LocalDateTime date = LocalDateTime.ofInstant(instant,
						ZoneId.systemDefault());
				journal.setJournalDate(date.toLocalDate());
				journal.setTransactionDate(date.toLocalDate());
				journalService.persist(journal);
		}
			SimpleAccountsMessage message = null;
			message = new SimpleAccountsMessage("0077",
					MessageUtil.getMessage("opening.balance.created.successful.msg.0077"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);

		}catch (Exception e) {
			SimpleAccountsMessage message = null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("create.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	private boolean getValidTransactionCategoryType(TransactionCategory transactionCategory) {
		String transactionCategoryCode = transactionCategory.getChartOfAccount().getChartOfAccountCode();
		ChartOfAccountCategoryCodeEnum chartOfAccountCategoryCodeEnum = ChartOfAccountCategoryCodeEnum.getChartOfAccountCategoryCodeEnum(transactionCategoryCode);
		if (chartOfAccountCategoryCodeEnum == null)
			return false;
		switch (chartOfAccountCategoryCodeEnum) {
			case ACCOUNTS_RECEIVABLE:
			case BANK:
			case CASH:
			case CURRENT_ASSET:
			case FIXED_ASSET:
			case OTHER_CURRENT_ASSET:
			case STOCK:
				return true;
			case OTHER_LIABILITY:
			case OTHER_CURRENT_LIABILITIES:
			case EQUITY:
			case ADMIN_EXPENSE:
			case OTHER_EXPENSE:
			case COST_OF_GOODS_SOLD:
				return false;
			case ACCOUNTS_PAYABLE:
			case INCOME:
			default:
				return true;
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "/Update")
	@PostMapping(value = "update")
	public ResponseEntity<Object> update(@RequestBody TransactioncategoryBalancePersistModel persistModel,
										 HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			User user = userServiceNew.findByPK(userId);
			TransactionCategoryBalance transactionCategoryBalance= null;
			if (persistModel.getTransactionCategoryBalanceId() != null) {
				transactionCategoryBalance = transactionCategoryBalanceService
						.findByPK(persistModel.getTransactionCategoryBalanceId());
			}
			Journal journal = journalService.getJournalByReferenceId(transactionCategoryBalance.getTransactionCategory().getTransactionCategoryId());
			if (journal != null) {
				journalService.deleteAndUpdateByIds(Arrays.asList(journal.getId()),false);
			}
			TransactionCategory category = transactionCategoryService.findByPK(persistModel.getTransactionCategoryId());
			TransactionCategory transactionCategory = transactionCategoryService
					.findTransactionCategoryByTransactionCategoryCode(
							TransactionCategoryCodeEnum.OPENING_BALANCE_OFFSET_LIABILITIES.getCode());
			boolean isDebit=false;
			if(StringUtils.equalsAnyIgnoreCase(transactionCategory.getTransactionCategoryCode(),
					TransactionCategoryCodeEnum.OPENING_BALANCE_OFFSET_LIABILITIES.getCode())){
				isDebit=true;
			}
			List<JournalLineItem> journalLineItemList = new ArrayList<>();
			journal = new Journal();
			JournalLineItem journalLineItem1 = new JournalLineItem();
			journalLineItem1.setTransactionCategory(category);
			if (isDebit) {
				journalLineItem1.setDebitAmount(persistModel.getOpeningBalance());
			} else {
				journalLineItem1.setCreditAmount(persistModel.getOpeningBalance());
			}
			journalLineItem1.setReferenceType(PostingReferenceTypeEnum.BALANCE_ADJUSTMENT);
			journalLineItem1.setReferenceId(category.getTransactionCategoryId());
			journalLineItem1.setCreatedBy(userId);
			journalLineItem1.setExchangeRate(BigDecimal.ONE);
			journalLineItem1.setJournal(journal);
			journalLineItemList.add(journalLineItem1);

			JournalLineItem journalLineItem2 = new JournalLineItem();
			journalLineItem2.setTransactionCategory(transactionCategory);
			if (!isDebit) {
				journalLineItem2.setDebitAmount(persistModel.getOpeningBalance());
			} else {
				journalLineItem2.setCreditAmount(persistModel.getOpeningBalance());
			}
			journalLineItem2.setReferenceType(PostingReferenceTypeEnum.BALANCE_ADJUSTMENT);
			journalLineItem2.setReferenceId(transactionCategory.getTransactionCategoryId());
			journalLineItem2.setCreatedBy(userId);
			journalLineItem2.setExchangeRate(BigDecimal.ONE);
			journalLineItem2.setJournal(journal);
			journalLineItemList.add(journalLineItem2);

			journal.setJournalLineItems(journalLineItemList);
			journal.setCreatedBy(userId);
			journal.setPostingReferenceType(PostingReferenceTypeEnum.BALANCE_ADJUSTMENT);
			Instant instant = Instant.ofEpochMilli(persistModel.getEffectiveDate().getTime());
			LocalDateTime date = LocalDateTime.ofInstant(instant,
					ZoneId.systemDefault());
			journal.setJournalDate(date.toLocalDate());
			journal.setTransactionDate(date.toLocalDate());
			journalService.updateOpeningBalance(journal,true);
			SimpleAccountsMessage message = null;
			message = new SimpleAccountsMessage("0078",
					MessageUtil.getMessage("opening.balance.deleted.successful.msg.0078"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {
			SimpleAccountsMessage message = null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("update.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
//		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	private Transaction getTransactionFromClosingBalance(TransactioncategoryBalancePersistModel persistModel,TransactionCategoryClosingBalance closingBalance,Character debitCreditFlag) {
		BigDecimal transactionAmount = BigDecimal.ZERO;
		if(persistModel.getOpeningBalance()!=null)
		{
			transactionAmount = persistModel.getOpeningBalance();
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
	
	@LogRequest
	@ApiOperation(value = "Get Transaction By ID")
	@GetMapping(value = "/getTransactionById")
	public ResponseEntity<TransactioncategoryBalancePersistModel> getTransactionById(@RequestParam(value = "id") Integer id) {
		TransactionCategoryBalance transactionCategoryBalance = transactionCategoryBalanceService.findByPK(id);
		if (transactionCategoryBalance == null) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		} else {
			return new ResponseEntity<>(transactionCategoryBalanceRestHelper.getRequestModel(transactionCategoryBalance), HttpStatus.OK);
		}
	}

	@LogRequest
	@ApiOperation(value = "Get Transaction List")
	@GetMapping(value = "/list")
	public ResponseEntity<PaginationResponseModel> getAll(OpeningBalanceRequestFilterModel filterModel,HttpServletRequest request) {

		Map<TransactionCategoryBalanceFilterEnum, Object> dataMap = new EnumMap<>(
				TransactionCategoryBalanceFilterEnum.class);
		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
		dataMap.put(TransactionCategoryBalanceFilterEnum.USER_ID, userId);
		dataMap.put(TransactionCategoryBalanceFilterEnum.DELETE_FLAG, false);
		if(filterModel.getOrder()!=null && filterModel.getOrder().equalsIgnoreCase("desc"))
			dataMap.put(TransactionCategoryBalanceFilterEnum.ORDER_BY, ORDERBYENUM.DESC);
		else
			dataMap.put(TransactionCategoryBalanceFilterEnum.ORDER_BY, ORDERBYENUM.ASC);

		PaginationResponseModel response = transactionCategoryBalanceService.getAll(dataMap,filterModel);
		if (response == null) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
		response.setData(
				transactionCategoryBalanceRestHelper.getList((List<TransactionCategoryBalance>) response.getData()));
		return new ResponseEntity<>(response, HttpStatus.OK);
	}
}
