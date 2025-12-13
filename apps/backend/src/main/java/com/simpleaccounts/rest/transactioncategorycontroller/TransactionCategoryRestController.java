/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.rest.transactioncategorycontroller;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.bank.model.DeleteModel;
import com.simpleaccounts.constant.ChartOfAccountCategoryCodeEnum;
import com.simpleaccounts.constant.dbfilter.ORDERBYENUM;
import com.simpleaccounts.constant.dbfilter.TransactionCategoryFilterEnum;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.repository.TransactionExpensesRepository;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.SingleLevelDropDownModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.CoacTransactionCategoryService;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.service.bankaccount.ChartOfAccountService;
import com.simpleaccounts.service.bankaccount.TransactionService;
import com.simpleaccounts.utils.MessageUtil;
import com.simpleaccounts.utils.SimpleAccountsMessage;
import io.swagger.annotations.ApiOperation;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.simpleaccounts.constant.ChartOfAccountCategoryCodeEnum;
import com.simpleaccounts.repository.TransactionExpensesRepository;
import com.simpleaccounts.rest.SingleLevelDropDownModel;
import com.simpleaccounts.service.CoacTransactionCategoryService;
import com.simpleaccounts.service.bankaccount.TransactionService;
import com.simpleaccounts.utils.MessageUtil;
import com.simpleaccounts.utils.SimpleAccountsMessage;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.bank.model.DeleteModel;
import com.simpleaccounts.constant.dbfilter.ORDERBYENUM;
import com.simpleaccounts.constant.dbfilter.TransactionCategoryFilterEnum;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.service.bankaccount.ChartOfAccountService;

import io.swagger.annotations.ApiOperation;

/**
 *
 * @author Sonu
 */
@RestController
@RequestMapping(value = "/rest/transactioncategory")
@RequiredArgsConstructor
public class TransactionCategoryRestController{
	private final Logger logger = LoggerFactory.getLogger(TransactionCategoryRestController.class);
	private final  TransactionCategoryService transactionCategoryService;

	private final  ChartOfAccountService chartOfAccountService;

	private final  UserService userServiceNew;

	private final CoacTransactionCategoryService coacTransactionCategoryService;

	private final JwtTokenUtil jwtTokenUtil;

	private final TranscationCategoryHelper transcationCategoryHelper;

	private final TransactionService transactionService;

	private final UserService userService;

	private final TransactionExpensesRepository transactionExpensesRepository;

	@LogRequest
	@ApiOperation(value = "Get All Transaction Categories for the Loggedin User and the Master data")
	@GetMapping(value = "/gettransactioncategory")
	public ResponseEntity<List<TransactionCategoryModel>> getAllTransactionCategory(HttpServletRequest request) {
		List<TransactionCategory> transactionCategories = transactionCategoryService.findAllTransactionCategory();

		if (transactionCategories != null) {
			return new ResponseEntity<>(transcationCategoryHelper.getListModel(transactionCategories), HttpStatus.OK);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);

	}

	@LogRequest
	@ApiOperation(value = "Get All Transaction Categories for the Loggedin User and the Master data by filter")
	@GetMapping(value = "/getList")
	public ResponseEntity<PaginationResponseModel> getAllTransactionCategoryListByFilter(TransactionCategoryRequestFilterModel filterModel,
			HttpServletRequest request) {

		Map<TransactionCategoryFilterEnum, Object> filterDataMap = new HashMap<>();

		filterDataMap.put(TransactionCategoryFilterEnum.TRANSACTION_CATEGORY_CODE,
				filterModel.getTransactionCategoryCode());
		filterDataMap.put(TransactionCategoryFilterEnum.TRANSACTION_CATEGORY_NAME,
				filterModel.getTransactionCategoryName());
		filterDataMap.put(TransactionCategoryFilterEnum.DELETE_FLAG, false);

		if (filterModel.getChartOfAccountId() != null) {
			filterDataMap.put(TransactionCategoryFilterEnum.CHART_OF_ACCOUNT,
					chartOfAccountService.findByPK(filterModel.getChartOfAccountId()));
		}
		filterDataMap.put(TransactionCategoryFilterEnum.CHART_OF_ACCOUNT_NOT_EQUAL,
				chartOfAccountService.getChartOfAccount(7));
		filterDataMap.put(TransactionCategoryFilterEnum.CHART_OF_ACCOUNT_NOT_EQUAL,
				chartOfAccountService.getChartOfAccount(8));
		filterDataMap.put(TransactionCategoryFilterEnum.ORDER_BY, ORDERBYENUM.DESC);

		PaginationResponseModel response = transactionCategoryService.getTransactionCategoryList(filterDataMap,
				filterModel);
		if (response == null) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
		response.setData(transcationCategoryHelper.getListModel(response.getData()));
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@LogRequest
	@ApiOperation(value = "Get All Transaction Categories for export")
	@GetMapping(value = "/getExportList")
	public ResponseEntity<List<TransactionCategoryExportModel>> getAllTransactionCategoryForExport(HttpServletRequest request) {
		List<TransactionCategory> response = transactionCategoryService.findAllTransactionCategory();
		if (response == null) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
		List<TransactionCategoryExportModel> exportList  = transcationCategoryHelper.getExportListModel(response);

		return new ResponseEntity(exportList, HttpStatus.OK);
	}

	@LogRequest
	@ApiOperation(value = "Get Transaction Category By ID")
	@GetMapping(value = "/getTransactionCategoryById")
	public ResponseEntity<TransactionCategoryModel> getTransactionCategoryById(@RequestParam("id") Integer id) {
		TransactionCategory transactionCategories = transactionCategoryService.findByPK(id);
		if (transactionCategories != null) {
			return new ResponseEntity<>(transcationCategoryHelper.getModel(transactionCategories), HttpStatus.OK);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);

	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete Transaction Category")
	@DeleteMapping(value = "/deleteTransactionCategory")
	public ResponseEntity<Object> deleteTransactionCategory(@RequestParam("id") Integer id) {
		try{
		SimpleAccountsMessage message= null;
		TransactionCategory transactionCategories = transactionCategoryService.findByPK(id);
		if (transactionCategories == null) {
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
		transactionCategories.setDeleteFlag(Boolean.TRUE);
		transactionCategoryService.update(transactionCategories, id);
		message = new SimpleAccountsMessage("0068",
				MessageUtil.getMessage("chartofaccount.deleted.successful.msg.0068"), false);
		return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {
			SimpleAccountsMessage message= null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("delete.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete Transaction Category In Bulk")
	@DeleteMapping(value = "/deleteTransactionCategories")
	public ResponseEntity<Object> deleteTransactionCategories(@RequestBody DeleteModel ids) {
		try {
			SimpleAccountsMessage message= null;
			transactionCategoryService.deleteByIds(ids.getIds());
			message = new SimpleAccountsMessage("0068",
					MessageUtil.getMessage("chartofaccount.deleted.successful.msg.0068"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);

		} catch (Exception e) {SimpleAccountsMessage message= null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("delete.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Add New Transaction Category")
	@PostMapping(value = "/save")
	public ResponseEntity<Object> save(@RequestBody TransactionCategoryBean transactionCategoryBean,
			HttpServletRequest request) {
		try {
			SimpleAccountsMessage message= null;
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			User user = userServiceNew.findByPK(userId);
			TransactionCategory selectedTransactionCategory = transcationCategoryHelper
					.getEntity(transactionCategoryBean);

			selectedTransactionCategory.setCreatedBy(user.getUserId());
			selectedTransactionCategory.setCreatedDate(LocalDateTime.now());
			transactionCategoryService.persist(selectedTransactionCategory);
			coacTransactionCategoryService.addCoacTransactionCategory(selectedTransactionCategory.getChartOfAccount(),
					selectedTransactionCategory);
			message = new SimpleAccountsMessage("0069",
					MessageUtil.getMessage("chartofaccount.created.successful.msg.0069"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);

		} catch (Exception e) {SimpleAccountsMessage message= null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("create.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Update Transaction Category")
	@PostMapping(value = "/update")
	public ResponseEntity<Object> update(@RequestBody TransactionCategoryBean transactionCategoryBean,
			HttpServletRequest request) {
		try {
			SimpleAccountsMessage message= null;
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			User user = userServiceNew.findByPK(userId);
			TransactionCategory selectedTransactionCategory = transactionCategoryService
					.findByPK(transactionCategoryBean.getTransactionCategoryId());
			selectedTransactionCategory
					.setTransactionCategoryName(transactionCategoryBean.getTransactionCategoryName());
			if (!transactionCategoryBean.getChartOfAccount()
					.equals(selectedTransactionCategory.getChartOfAccount().getChartOfAccountId())) {
				ChartOfAccount chartOfAccount = chartOfAccountService
						.findByPK(transactionCategoryBean.getChartOfAccount());
				selectedTransactionCategory.setChartOfAccount(chartOfAccount);
				selectedTransactionCategory.setTransactionCategoryCode(
						transactionCategoryService.getNxtTransactionCatCodeByChartOfAccount(chartOfAccount));
			}
			selectedTransactionCategory.setLastUpdateBy(user.getUserId());
			selectedTransactionCategory.setLastUpdateDate(LocalDateTime.now());
			transactionCategoryService.update(selectedTransactionCategory);
			message = new SimpleAccountsMessage("0070",
					MessageUtil.getMessage("chartofaccount.updated.successful.msg.0070"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);

		} catch (Exception e) {SimpleAccountsMessage message= null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("update.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@ApiOperation(value = "Get All Transaction Categories for Expense")
	@GetMapping(value = "/getForExpenses")
	public ResponseEntity<List<TransactionCategory>> getTransactionCatgeoriesForExpenses(HttpServletRequest request) {
		List<TransactionCategory> transactionCategories =transactionExpensesRepository.getTransactionCategory(logger.getName());
		if (transactionCategories != null) {
			for (TransactionCategory cat : transactionCategories) {
				cat.setChartOfAccount(null);
			}
			return new ResponseEntity<>(transactionCategories, HttpStatus.OK);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);

	}

	@LogRequest
	@ApiOperation(value = "Get Explained Transaction Count For Transaction Id")
	@GetMapping(value = "/getExplainedTransactionCountForTransactionCategory")
	public ResponseEntity<Integer> getExplainedTransactionCount(@RequestParam int transactionCategoryId) {
		TransactionCategory transactionCategory = transactionCategoryService.findByPK(transactionCategoryId);
		if(transactionCategory.getChartOfAccount().getChartOfAccountCode().equalsIgnoreCase(ChartOfAccountCategoryCodeEnum.BANK.getCode())){
			return new ResponseEntity<>(1, HttpStatus.OK);
		}
		Integer response = transactionService.getExplainedTransactionCountByTransactionCategoryId(transactionCategoryId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@LogRequest
	@ApiOperation(value = "Get Transaction category For Product")
	@GetMapping(value = "/getTransactionCategoryListForManualJornal")
	public ResponseEntity getTransactionCategoryListManualJornal(){
		List<SingleLevelDropDownModel> response  = new ArrayList<>();
		List<TransactionCategory> transactionCategoryList = transactionCategoryService.getTransactionCategoryListManualJornal();
		if (transactionCategoryList!=null){
			response = transcationCategoryHelper.getSingleLevelDropDownModelListForManualJournal(transactionCategoryList);
		}

		return new ResponseEntity (response, HttpStatus.OK);
	}
}
