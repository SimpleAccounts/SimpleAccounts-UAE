/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.rest.transactionimportcontroller;

import java.io.*;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import static com.simpleaccounts.constant.ErrorConstant.ERROR;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.constant.TransactionCreditDebitConstant;
import com.simpleaccounts.constant.TransactionEntryTypeConstant;
import com.simpleaccounts.entity.TransactionParsingSetting;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.model.TransactionModel;
import com.simpleaccounts.parserengine.CsvParser;
import com.simpleaccounts.parserengine.ExcelParser;
import com.simpleaccounts.rest.transactionparsingcontroller.TransactionParsingSettingDetailModel;
import com.simpleaccounts.rest.transactionparsingcontroller.TransactionParsingSettingRestHelper;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.BankAccountService;
import com.simpleaccounts.service.TransactionParsingSettingService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.service.bankaccount.TransactionService;
import com.simpleaccounts.utils.DateFormatUtil;
import com.simpleaccounts.utils.FileHelper;
import io.swagger.annotations.ApiOperation;
import java.io.*;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 *
 * @author Sonu
 */
@RestController
@RequestMapping(value = "/rest/transactionimport")
@RequiredArgsConstructor
public class TransactionImportController{

	private  final Logger logger = LoggerFactory.getLogger(TransactionImportController.class);
	private final CsvParser csvParser;

	private final ExcelParser excelParser;

	private final FileHelper fileHelper;

	private final BankAccountService bankAccountService;

	private final TransactionService transactionService;

	private final UserService userServiceNew;

	private final TransactionParsingSettingService transactionParsingSettingService;
	private final TransactionParsingSettingRestHelper transactionParsingSettingRestHelper;

	private final	TransactionImportRestHelper transactionImportRestHelper;

	private final JwtTokenUtil jwtTokenUtil;

	@LogRequest
	@ApiOperation(value = "Get Bank Account List")
	@GetMapping(value = "/getbankaccountlist")
	public ResponseEntity<List<BankAccount>> getBankAccount() {
		List<BankAccount> bankAccounts = bankAccountService.getBankAccounts();
		if (bankAccounts != null) {
			return new ResponseEntity<>(bankAccounts, HttpStatus.OK);
		} else {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}

	@LogRequest
	@ApiOperation(value = "Download csv of Tranaction")
	@GetMapping(value = "/downloadcsv")
	public ResponseEntity<Object> downloadSimpleFile() {
		ClassLoader classLoader = getClass().getClassLoader();
		File file = new File(classLoader.getResource("excel-file/SampleTransaction1.csv").getFile());
		String filepath = file.getAbsolutePath();
		String content = null;
		Path path = Paths.get(filepath);
		try {
			content = FileUtils.readFileToString(file, StandardCharsets.UTF_8);

		} catch (IOException e ) {
			logger.error("Error importing transactions", e);
		}
		return ResponseEntity.ok()
				.contentType(MediaType.parseMediaType("application/octet-stream"))
				.header(HttpHeaders.CONTENT_DISPOSITION)
				.body(content);
	}

	@LogRequest
	@ApiOperation(value = "Get List of Date format")
	@GetMapping(value = "/getformatdate")
	public ResponseEntity<List<String>> getDateFormatList() {
		List<String> dateFormatList = DateFormatUtil.dateFormatList();
		if (dateFormatList != null) {
			return new ResponseEntity<>(dateFormatList, HttpStatus.OK);
		} else {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}

	/**
	 * @Deprecated
	 * @param transactionList
	 * @param id
	 * @param bankId
	 * @return
	 */
	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Save Import Transaction")
	@PostMapping(value = "/saveimporttransaction")
	public ResponseEntity<Integer> saveTransactions(@RequestBody List<TransactionModel> transactionList,
													@RequestParam(value = "id") Integer id, @RequestParam(value = "bankId") Integer bankId) {
		for (TransactionModel transaction : transactionList) {
			save(transaction, id, bankId);
		}
		return new ResponseEntity<>(bankId, HttpStatus.OK);
	}

	void save(TransactionModel transaction, Integer id, Integer bankId) {
		logger.info("transaction=== {}", transaction);
		try {
			User loggedInUser = userServiceNew.findByPK(id);
			com.simpleaccounts.entity.bankaccount.Transaction transaction1 = new com.simpleaccounts.entity.bankaccount.Transaction();
			transaction1.setLastUpdateBy(loggedInUser.getUserId());
			transaction1.setCreatedBy(loggedInUser.getUserId());
			BankAccount bankAccount = bankAccountService.findByPK(bankId);
			transaction1.setBankAccount(bankAccount);
			transaction1.setEntryType(TransactionEntryTypeConstant.IMPORT);
			transaction1.setTransactionDescription(transaction.getDescription());
			LocalDate date = LocalDate.parse(transaction.getTransactionDate(), DateTimeFormatter.ofPattern("M/d/yyyy"));
			LocalTime time = LocalTime.now();
			transaction1.setTransactionDate(LocalDateTime.of(date, time));
			if (transaction.getDebit() != null && !transaction.getDebit().trim().isEmpty()) {
				transaction1.setTransactionAmount(
						BigDecimal.valueOf(Double.parseDouble(transaction.getDebit().replace(",", ""))));
				transaction1.setDebitCreditFlag(TransactionCreditDebitConstant.DEBIT);
				BigDecimal currentBalance =  bankAccount.getCurrentBalance();
				currentBalance = currentBalance.subtract(transaction.getAmount());
				bankAccount.setCurrentBalance(currentBalance);

			}
			if (transaction.getCredit() != null && !transaction.getCredit().trim().isEmpty()) {
				transaction1.setTransactionAmount(
						BigDecimal.valueOf(Double.parseDouble(transaction.getCredit().replace(",", ""))));
				transaction1.setDebitCreditFlag(TransactionCreditDebitConstant.CREDIT);
				BigDecimal currentBalance = bankAccount.getCurrentBalance();
				currentBalance = currentBalance.add(transaction.getAmount());
				bankAccount.setCurrentBalance(currentBalance);
			}
			transactionService.persist(transaction1);
			bankAccountService.update(bankAccount);
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Import Trnsaction")
	@PostMapping(value = "/save")
	public ResponseEntity<String> importTransaction(@RequestBody TransactionImportModel transactionImportModel,
													HttpServletRequest request) {

		List<com.simpleaccounts.entity.bankaccount.Transaction> transactionList = null;
		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
		transactionImportModel.setCreatedBy(userId);
		transactionList = transactionImportRestHelper.getEntity(transactionImportModel);

		if (transactionList == null) {
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
		String status = transactionService.saveTransactions(transactionList);

		if (status==null) {
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}

		return new ResponseEntity<>(status, HttpStatus.OK);
	}
	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Import Trnsaction")
	@PostMapping(value = "/savewithtemplate")
	public ResponseEntity<String> importTransaction2(@RequestBody TransactionImportModel transactionImportModel,
													HttpServletRequest request) {

		List<com.simpleaccounts.entity.bankaccount.Transaction> transactionList = null;
		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
		transactionImportModel.setCreatedBy(userId);
		transactionList = transactionImportRestHelper.getEntityWithoutTemplate(transactionImportModel);

		if (transactionList == null) {
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
		String status = transactionService.saveTransactions(transactionList);

		if (status==null) {
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}

		return new ResponseEntity<>(status, HttpStatus.OK);
	}

	@LogRequest
	@ApiOperation(value = "parse file and return data according template")
	@PostMapping("/parse")
	public ResponseEntity<Map> parseTransaction(@RequestBody MultipartFile file, @RequestParam(value = "id") Long id) throws IOException {

		TransactionParsingSetting parsingSetting = transactionParsingSettingService.findByPK(id);
		TransactionParsingSettingDetailModel model = transactionParsingSettingRestHelper.getModel(parsingSetting);

		Map dataMap = null;

		switch (fileHelper.getFileExtension(file.getOriginalFilename())) {

			case "csv":
				dataMap = csvParser.parseImportData(model, file.getInputStream());
				break;

			case "xlsx":
			case "xlx":
			case "xls":
				dataMap = excelParser.parseImportData(model, file);
				break;
			default:
		}

		if (dataMap == null) {
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
		return new ResponseEntity<>(dataMap, HttpStatus.OK);
	}
	@LogRequest
	@ApiOperation(value = "Write file and return file")
	@PostMapping("/parseFile")
	public  ResponseEntity<Map> makeFile(@ModelAttribute TransactionImportRequestModel transactionImportRequestModel) throws IOException {

		TransactionParsingSetting parsingSetting = transactionParsingSettingService.findByPK(transactionImportRequestModel.getId().longValue());
		TransactionParsingSettingDetailModel model = transactionParsingSettingRestHelper.getModel(parsingSetting);

		String filename = "sample.csv";
		InputStream inputStream = fileHelper.writeFile(transactionImportRequestModel.getData(),filename);
		File file = new File(filename);
		Map dataMap = null;

		dataMap = csvParser.parseImportData(model, inputStream);

		if (dataMap == null) {
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
		return new ResponseEntity<>(dataMap, HttpStatus.OK);
	}

	@LogRequest
	@ApiOperation(value = "Write file and return file")
	@PostMapping("/parseFileWithoutTemplate")
	public  ResponseEntity<Map> makeFile2(@RequestBody TransactionImportRequestModel transactionImportRequestModel) throws IOException {

		TransactionParsingSettingDetailModel model = transactionParsingSettingRestHelper.getModel2(transactionImportRequestModel);

		String filename = "sample.csv";
		InputStream inputStream = fileHelper.writeFile(transactionImportRequestModel.getData(),filename);
		File file = new File(filename);
		Map dataMap = null;

		dataMap = csvParser.parseImportData(model, inputStream);

		if (dataMap == null) {
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
		return new ResponseEntity<>(dataMap, HttpStatus.OK);
	}
}

