package com.simplevat.rest.expensescontroller;

import com.simplevat.aop.LogRequest;
import com.simplevat.bank.model.DeleteModel;
import com.simplevat.constant.dbfilter.ExpenseFIlterEnum;
import com.simplevat.entity.FileAttachment;
import com.simplevat.entity.TransactionCategoryBalance;
import com.simplevat.entity.User;
import com.simplevat.helper.ExpenseRestHelper;
import com.simplevat.rest.AbstractDoubleEntryRestController;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.entity.Expense;
import com.simplevat.rest.invoicecontroller.InvoiceRestHelper;
import com.simplevat.security.JwtTokenUtil;
import com.simplevat.service.*;
import com.simplevat.utils.FileHelper;
import com.simplevat.utils.MessageUtil;
import com.simplevat.utils.SimpleVatMessage;
import io.swagger.annotations.ApiOperation;

import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import static com.simplevat.constant.ErrorConstant.ERROR;

/**
 *
 * @author daynil
 */
@Slf4j
@RestController
@RequestMapping("/rest/expense")
public class ExpenseRestController extends AbstractDoubleEntryRestController {
	private final Logger logger = LoggerFactory.getLogger(ExpenseRestController.class);

	@Autowired
	private ExpenseService expenseService;

	@Autowired
	private ExpenseRestHelper expenseRestHelper;

	@Autowired
	private JwtTokenUtil jwtTokenUtil;

	@Autowired
	private TransactionCategoryService expenseTransactionCategoryService;

	@Autowired
	private CurrencyService currencyService;

	@Autowired
	private TransactionCategoryBalanceService transactionCategoryBalanceService;

	@Autowired
	private UserService userService;

	@Autowired
	private FileAttachmentService fileAttachmentService;

    @Autowired
	private InvoiceRestHelper invoiceRestHelper;
	@LogRequest
	@ApiOperation(value = "Get Expense List")
	@GetMapping(value = "/getList")
	public ResponseEntity<PaginationResponseModel> getExpenseList(ExpenseRequestFilterModel expenseRequestFilterModel,
																  HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			User user = userService.findByPK(userId);

			Map<ExpenseFIlterEnum, Object> filterDataMap = new EnumMap<>(ExpenseFIlterEnum.class);
			if(user.getRole().getRoleCode()!=1) {
				filterDataMap.put(ExpenseFIlterEnum.USER_ID, userId);
			}
			filterDataMap.put(ExpenseFIlterEnum.PAYEE, expenseRequestFilterModel.getPayee());
			if (expenseRequestFilterModel.getExpenseDate() != null
					&& !expenseRequestFilterModel.getExpenseDate().isEmpty()) {
				LocalDate date = LocalDate.parse(expenseRequestFilterModel.getExpenseDate());
//				SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
//				LocalDateTime dateTime = Instant
//						.ofEpochMilli(dateFormat.parse(expenseRequestFilterModel.getExpenseDate()).getTime())
//						.atZone(ZoneId.systemDefault()).toLocalDateTime();
				filterDataMap.put(ExpenseFIlterEnum.EXPENSE_DATE, date);
			}
			if (expenseRequestFilterModel.getTransactionCategoryId() != null) {
				filterDataMap.put(ExpenseFIlterEnum.TRANSACTION_CATEGORY,
						expenseTransactionCategoryService.findByPK(expenseRequestFilterModel.getTransactionCategoryId()));
			}
			if(expenseRequestFilterModel.getCurrencyCode()!=null){
				filterDataMap.put(ExpenseFIlterEnum.CURRECY, currencyService.findByPK(expenseRequestFilterModel.getCurrencyCode()));
			}
			filterDataMap.put(ExpenseFIlterEnum.PAYEE, expenseRequestFilterModel.getPayee());
			filterDataMap.put(ExpenseFIlterEnum.DELETE_FLAG, false);
			PaginationResponseModel response = expenseService.getExpensesList(filterDataMap, expenseRequestFilterModel);
			if (response == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
			response.setData(expenseRestHelper.getExpenseList(response.getData(), user));
			return new ResponseEntity<>(response, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Add New Expense")
	@PostMapping(value = "/save")
	public ResponseEntity<?> save(@ModelAttribute ExpenseModel expenseModel, HttpServletRequest request) {
		try {
			SimpleVatMessage message = null;
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			String rootPath = request.getServletContext().getRealPath("/");
			log.info("filePath {}",rootPath);
			FileHelper.setRootPath(rootPath);
			Boolean checkInvoiceNumber = expenseRestHelper.doesInvoiceNumberExist(expenseModel.getExpenseNumber());
			if (checkInvoiceNumber){
				SimpleVatMessage errorMessage = new SimpleVatMessage("0023",
						MessageUtil.getMessage("invoicenumber.alreadyexists.0023"), true);
				logger.info(errorMessage.getMessage());
				return new  ResponseEntity(errorMessage, HttpStatus.BAD_REQUEST);

			}
			Expense expense = expenseRestHelper.getExpenseEntity(expenseModel);
			expense.setExclusiveVat(expenseModel.getExclusiveVat());
			expense.setCreatedBy(userId);
			expense.setCreatedDate(LocalDateTime.now());
			//To save the uploaded file in db.
			if (expenseModel.getAttachmentFile()!=null) {
				MultipartFile file = expenseModel.getAttachmentFile();
				if (file != null) {
					FileAttachment fileAttachment = fileAttachmentService.storeExpenseFile(file, expenseModel);
					expense.setFileAttachment(fileAttachment);
				}
			}
			expenseService.persist(expense);
			message = new SimpleVatMessage("0065",
					MessageUtil.getMessage("expense.created.successful.msg.0065"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {
			SimpleVatMessage message = null;
			message = new SimpleVatMessage("",
					MessageUtil.getMessage("create.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Update Expense")
	@PostMapping(value = "/update")
	public ResponseEntity<?> update(@ModelAttribute ExpenseModel expenseModel, HttpServletRequest request) {
		try {
			SimpleVatMessage message = null;
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			String rootPath = request.getServletContext().getRealPath("/");
			log.info("filePath {}",rootPath);
			FileHelper.setRootPath(rootPath);
			if (expenseModel.getExpenseId() != null) {
				Expense expense = expenseRestHelper.getExpenseEntity(expenseModel);
				if (expenseModel.getAttachmentFile()!=null) {
					MultipartFile file = expenseModel.getAttachmentFile();
					if (file != null) {
						FileAttachment fileAttachment = fileAttachmentService.storeExpenseFile(file, expenseModel);
						expense.setFileAttachment(fileAttachment);
					}
				}
				expense.setLastUpdateBy(userId);
				expense.setLastUpdateDate(LocalDateTime.now());
				expense.setExclusiveVat(expenseModel.getExclusiveVat());
				expenseService.update(expense);
			}
			message = new SimpleVatMessage("0066",
					MessageUtil.getMessage("expense.updated.successful.msg.0066"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {
			SimpleVatMessage message = null;
			message = new SimpleVatMessage("",
					MessageUtil.getMessage("update.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@ApiOperation(value = "Get Expense Detail by Expanse Id")
	@GetMapping(value = "/getExpenseById")
	public ResponseEntity<ExpenseModel> getExpenseById(@RequestParam("expenseId") Integer expenseId) {
		try {
			Expense expense = expenseService.findByPK(expenseId);
			ExpenseModel expenseModel = expenseRestHelper.getExpenseModel(expense);
			return new ResponseEntity<>(expenseModel, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@DeleteMapping(value = "/delete")
	public ResponseEntity<?> delete(@RequestParam("expenseId") Integer expenseId) {
		try {
			SimpleVatMessage message = null;
			Expense expense = expenseService.findByPK(expenseId);
			if (expense!=null) {
				Map<String,Object> filterMap = new HashMap<>();
				filterMap.put("transactionCategory",expense.getTransactionCategory());
				//delete opening balance
				List<TransactionCategoryBalance> transactionCategoryBalanceList =
						transactionCategoryBalanceService.findByAttributes(filterMap);
				for(TransactionCategoryBalance transactionCategoryBalance : transactionCategoryBalanceList)
				{
					transactionCategoryBalanceService.delete(transactionCategoryBalance);
				}
				expense.setDeleteFlag(true);
				expenseService.update(expense);
			}message = new SimpleVatMessage("0067",
					MessageUtil.getMessage("expense.deleted.successful.msg.0067"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {
			SimpleVatMessage message = null;
			message = new SimpleVatMessage("",
					MessageUtil.getMessage("delete.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@DeleteMapping( value = "/deletes")
	public ResponseEntity<?> bulkDelete(@RequestBody DeleteModel expenseIds) {
		try {
			expenseService.deleteByIds(expenseIds.getIds());
			return ResponseEntity.status(HttpStatus.OK).build();
		} catch (Exception e) {
			logger.error(ERROR, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}
}
