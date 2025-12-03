/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.rest.currencycontroller;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.constant.ErrorConstant;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.Expense;
import com.simpleaccounts.entity.Invoice;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.service.*;
import com.simpleaccounts.utils.MessageUtil;
import com.simpleaccounts.utils.SimpleAccountsMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.security.JwtTokenUtil;

import io.swagger.annotations.ApiOperation;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;

/**
 *
 * @author Rupesh - 29/Nov/2019
 */
@RestController
@RequestMapping(value = "/rest/currency")
public class CurrencyController {

	private final Logger logger = LoggerFactory.getLogger(CurrencyController.class);

	@Autowired
	private CurrencyService currencyService;

	@Autowired
	JwtTokenUtil jwtTokenUtil;

	@Autowired
	UserService userServiceNew;

	@Autowired
	private InvoiceService invoiceService;

	@Autowired
	private ExpenseService expenseService;

	@Autowired
	private BankAccountService bankAccountService;

	@Autowired
	private ContactService contactService;

	
	@LogRequest
	@ApiOperation(value = "Get Currency List", response = List.class)
	@GetMapping(value = "/getcurrency")
	public ResponseEntity<List<Currency>> getCurrencies() {
		try {
			List<Currency> currencies = currencyService.getCurrenciesProfile();
			if (currencies != null && !currencies.isEmpty()) {
				return new ResponseEntity<>(currencies, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(HttpStatus.NO_CONTENT);
			}
		} catch (Exception e) {
			logger.error(ErrorConstant.ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@ApiOperation(value = "Get Active Currency List", response = List.class)
	@GetMapping(value = "/getactivecurrencies")
	public ResponseEntity<List<Currency>> getActiveCurrencies() {
		try {
			List<Currency> currencies = currencyService.getActiveCurrencies();
			if (currencies != null && !currencies.isEmpty()) {
				return new ResponseEntity<>(currencies, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(HttpStatus.NO_CONTENT);
			}
		} catch (Exception e) {
			logger.error(ErrorConstant.ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@ApiOperation(value = "Get Active Currency List", response = List.class)
	@GetMapping(value = "/getCompanyCurrencies")
	public ResponseEntity<List<Currency>> getCompanyCurrencies() {
		try {
			List<Currency> currencies = currencyService.getCompanyCurrencies();
			if (currencies != null && !currencies.isEmpty()) {
				return new ResponseEntity<>(currencies, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(HttpStatus.NO_CONTENT);
			}
		} catch (Exception e) {
			logger.error(ErrorConstant.ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@ApiOperation(value = "Get Currency by Currency Code", response = Currency.class)
	@GetMapping("/{currencyCode}")
	public ResponseEntity<Currency> getCurrency(@RequestParam("currencyCode") Integer currencyCode) {
		try {
			Currency currency = currencyService.findByPK(currencyCode);
			if (currency != null) {
				return new ResponseEntity<>(currency, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(HttpStatus.NO_CONTENT);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	
	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Save Currency Code", response = Currency.class)
	@PostMapping(value = "/save")
	public ResponseEntity<?> createCurrency(@RequestBody Currency currency, HttpServletRequest request) {
		try {
			SimpleAccountsMessage message = null;
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			currency.setCreatedBy(userId);
			currency.setCreatedDate(LocalDateTime.now());
			currencyService.persist(currency);
			message = new SimpleAccountsMessage("30",
					MessageUtil.getMessage("currency.created.successful.msg.0030"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
//			return new ResponseEntity<>("Saved Successfully",HttpStatus.CREATED);
		} catch (Exception e) {SimpleAccountsMessage message= null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("create.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Update Currency by Currency Code", response = Currency.class)
	@PutMapping(value = "/{currencyCode}")
	public ResponseEntity<?> editCurrency(@RequestBody Currency currency,
			@RequestParam("currencyCode") Integer currencyCode, HttpServletRequest request) {
		try {

			Currency existingCurrency = currencyService.findByPK(currencyCode);

			if (existingCurrency != null) {
				Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
				currency.setCurrencyCode(existingCurrency.getCurrencyCode());
				currency.setLastUpdateDate(LocalDateTime.now());
				currency.setLastUpdateBy(userId);
				currency.setCreatedBy(existingCurrency.getCreatedBy());
				currency.setCreatedDate(existingCurrency.getCreatedDate());
				currencyService.update(currency);
				return new ResponseEntity<>(currency, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
			}
		} catch (Exception e) {
			SimpleAccountsMessage message= null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("update.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete Currency by Currency Code", response = Currency.class)
	@DeleteMapping(value = "/{currencyCode}")
	public ResponseEntity<?> deleteCurrency(@RequestParam("currencyCode") Integer currencyCode,
			HttpServletRequest request) {
		try {
			SimpleAccountsMessage message = null;
			Currency currency = currencyService.findByPK(currencyCode);
			if (currency != null) {
				Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
				currency.setLastUpdateDate(LocalDateTime.now());
				currency.setLastUpdateBy(userId);
				currency.setDeleteFlag(true);
				currencyService.update(currency);
				message = new SimpleAccountsMessage("0031",
						MessageUtil.getMessage("currency.deleted.successful.msg.0031"), false);
				return new ResponseEntity<>(message,HttpStatus.OK);
//				return new ResponseEntity<>(currency, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(HttpStatus.NO_CONTENT);
			}
		} catch (Exception e) {
			SimpleAccountsMessage message= null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("delete.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	@LogRequest
	@ApiOperation(value = "Get Invoices Count For Currency")
	@GetMapping(value = "/getInvoicesCountForCurrency")
	public ResponseEntity<Integer> getExplainedTransactionCount(@RequestParam int currencyId){
		Integer response = 0;
		Currency currency = currencyService.getCurrency(currencyId);
		Map<String,Object> map = new HashMap<>();
		map.put("currency",currency);
		map.put("deleteFlag",Boolean.FALSE);
		List<Invoice> invoiceList = invoiceService.findByAttributes(map);
		List<Expense> expenseList = expenseService.findByAttributes(map);
		List<Contact> contactList = contactService.findByAttributes(map);
		map.clear();
		map.put("bankAccountCurrency",currency);
		map.put("deleteFlag",Boolean.FALSE);
		List<BankAccount> bankAccountList = bankAccountService.findByAttributes(map);
		if (invoiceList.size()>0 || bankAccountList.size()>0 || expenseList.size()>0 || contactList.size()>0){
			 response = 1;
		}
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}

