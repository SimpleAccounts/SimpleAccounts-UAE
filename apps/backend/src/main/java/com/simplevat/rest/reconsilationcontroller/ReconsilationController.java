
package com.simplevat.rest.reconsilationcontroller;

import com.simplevat.aop.LogRequest;
import com.simplevat.bank.model.DeleteModel;
import com.simplevat.constant.ChartOfAccountCategoryIdEnumConstant;
import com.simplevat.constant.ReconsileCategoriesEnumConstant;
import com.simplevat.constant.TransactionExplinationStatusEnum;
import com.simplevat.constant.dbfilter.TransactionFilterEnum;
import com.simplevat.entity.ChartOfAccountCategory;
import com.simplevat.entity.Contact;
import com.simplevat.entity.Invoice;
import com.simplevat.entity.bankaccount.BankAccount;
import com.simplevat.entity.bankaccount.ReconcileStatus;
import com.simplevat.entity.bankaccount.TransactionCategory;
import com.simplevat.repository.TransactionExpensesRepository;
import com.simplevat.rest.DropdownModel;
import com.simplevat.rest.InviceSingleLevelDropdownModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.rest.SingleLevelDropDownModel;
import com.simplevat.rest.transactioncategorycontroller.TranscationCategoryHelper;
import com.simplevat.service.*;
import com.simplevat.service.bankaccount.ReconcileStatusService;
import com.simplevat.service.bankaccount.TransactionService;
import com.simplevat.service.impl.TransactionCategoryClosingBalanceServiceImpl;
import io.swagger.annotations.ApiOperation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

import static com.simplevat.constant.ErrorConstant.ERROR;

@RestController
@RequestMapping("/rest/reconsile")
public class ReconsilationController {

	private final Logger logger = LoggerFactory.getLogger(ReconsilationController.class);

	@Autowired
	private ReconcileStatusService reconcileStatusService;

	@Autowired
	private BankAccountService bankAccountService;


	@Autowired
	private TransactionCategoryService transactionCategoryService;

	@Autowired
	private ReconsilationRestHelper reconsilationRestHelper;

	@Autowired
	private InvoiceService invoiceService;

	@Autowired
	private TranscationCategoryHelper transcationCategoryHelper;

	@Autowired
	private ChartOfAccountCategoryService chartOfAccountCategoryService;

	@Autowired
	private VatCategoryService vatCategoryService;

	@Autowired
	private ContactService contactService;

	@Autowired
	private UserService userServiceNew;

	@Autowired
	private TransactionService transactionService;

	@Autowired
	TransactionCategoryClosingBalanceServiceImpl transactionCategoryClosingBalanceService;

	@Autowired
	private TransactionExpensesRepository transactionExpensesRepository;

	@LogRequest
	@GetMapping(value = "/getByReconcilationCatCode")
	public ResponseEntity<List<ReconsilationListModel>> getByReconcilationCatCode(
			@RequestParam int reconcilationCatCode) {
		try {
			return new ResponseEntity<>(
					reconsilationRestHelper.getList(ReconsileCategoriesEnumConstant.get(reconcilationCatCode)),
					HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@GetMapping(value = "/getTransactionCat")
	public ResponseEntity<?> getTransactionCategory(ReconcilationRequestModel filterModel ) {
		try {
			Integer chartOfAccountCategoryId = filterModel.getChartOfAccountCategoryId();
			ChartOfAccountCategory category = chartOfAccountCategoryService.findByPK(chartOfAccountCategoryId);
			Map<String, Object> param = null;
			List<TransactionCategory> transactionCatList = null;
			List<Object> list = new ArrayList<>();
			BankAccount bankAccount =bankAccountService.findByPK(filterModel.getBankId());
//			Map<String,Object> filterMap = new HashMap<>();
//			filterMap.put("contactType",2);
//			filterMap.put("currency",bankAccount.getBankAccountCurrency());
//			List<Contact> customerContactList =
//					contactService.findByAttributes(filterMap);
			List<Contact> customerContactList = contactService.getCustomerContacts(bankAccount.getBankAccountCurrency());
			List<DropdownModel> dropdownModelList = new ArrayList<>();
			for (Contact contact:customerContactList){
				DropdownModel dropdownModel =new DropdownModel();
				dropdownModel.setValue(contact.getContactId());

				if(contact.getOrganization() != null && !contact.getOrganization().isEmpty()){
					dropdownModel.setLabel(contact.getOrganization());
				}else {
					dropdownModel.setLabel(contact.getFirstName()+" "+contact.getMiddleName()+" "+contact.getLastName());
				}
				dropdownModelList.add(dropdownModel);
			}

			switch (ChartOfAccountCategoryIdEnumConstant.get(category.getChartOfAccountCategoryId())) {
				case SALES:
					param = new HashMap<>();
					param.put("deleteFlag", false);
					param.put("type", 2);
					List<Invoice> invList = invoiceService.findByAttributes(param);
				List<InviceSingleLevelDropdownModel> invModelList = new ArrayList<>();

				for (Invoice invice : invList) {
					if (invice.getId()!=null && invice.getReferenceNumber()!=null && invice.getTotalAmount()!=null && invice.getCurrency()!=null){
						invModelList.add(new InviceSingleLevelDropdownModel(invice.getId(), invice.getReferenceNumber()
								+ " (" + invice.getTotalAmount() + " " + invice.getCurrency().getCurrencyName()+")",
								invice.getTotalAmount()));
					}
				}
//				list.add(new SingleLevelDropDownModel("Customer", contactService.getContactForDropdown(2)));
					list.add(new SingleLevelDropDownModel("Customer",dropdownModelList));
				param = new HashMap<>();
				param.put("label", "Sales Invoice");
				param.put("options", invModelList);
				//list.add(param);
				list.add(param);
					transactionCatList = transactionCategoryService
							.getTransactionCatByChartOfAccountCategoryId(category.getChartOfAccountCategoryId());
					return new ResponseEntity<>(
							new ReconsilationCatDataModel(list,
									transcationCategoryHelper.getSinleLevelDropDownModelList(transactionCatList)),
							HttpStatus.OK);

				case EXPENSE:
					transactionCatList = transactionCategoryService
							.getTransactionCatByChartOfAccountCategoryId(category.getChartOfAccountCategoryId());
					list.add(new SingleLevelDropDownModel("Vat Included", vatCategoryService.getVatCategoryForDropDown()));
					list.add(new SingleLevelDropDownModel("Customer", dropdownModelList));
					 bankAccount =bankAccountService.findByPK(filterModel.getBankId());
//					 filterMap = new HashMap<>();
//					filterMap.put("contactType",1);
//					filterMap.put("currency",bankAccount.getBankAccountCurrency());
//					List<Contact> vendorContactList =
//							contactService.findByAttributes(filterMap);
					List<Contact> supplierContactList = contactService.getSupplierContacts(bankAccount.getBankAccountCurrency());
					dropdownModelList = new ArrayList<>();
					for (Contact contact:supplierContactList){
						DropdownModel dropdownModel =new DropdownModel();
						dropdownModel.setValue(contact.getContactId());
						dropdownModel.setLabel(contact.getFirstName()+""+contact.getLastName());
						dropdownModelList.add(dropdownModel);
					}
//					list.add(new SingleLevelDropDownModel("Vendor", contactService.getContactForDropdown(1)));
					list.add(new SingleLevelDropDownModel("Vendor", dropdownModelList));
					return new ResponseEntity<>(
							new ReconsilationCatDataModel(list,
									transcationCategoryHelper.getSinleLevelDropDownModelList(transactionCatList)),
							HttpStatus.OK);

				case MONEY_PAID_TO_USER:
				case MONEY_RECEIVED_FROM_USER:
					transactionCatList = transactionCategoryService
							.getTransactionCatByChartOfAccountCategoryId(category.getChartOfAccountCategoryId());
					return new ResponseEntity<>(
							new ReconsilationCatDataModel(
									Arrays.asList(new SingleLevelDropDownModel("User",
											userServiceNew.getUserForDropdown()/*
										employeeService.getEmployeesForDropdown()*/)),
									transcationCategoryHelper.getSinleLevelDropDownModelList(transactionCatList)),
							HttpStatus.OK);

				case TRANSFERD_TO:
				case TRANSFER_FROM:
					transactionCatList = transactionCategoryService
							.getTransactionCatByChartOfAccountCategoryId(category.getChartOfAccountCategoryId());
					if (transactionCatList != null && !transactionCatList.isEmpty())
					{
						if(filterModel.getBankId() != null && filterModel.getBankId() != 0)
						{
							List<TransactionCategory> tempTransactionCatogaryList = new ArrayList<>();
							TransactionCategory bankTransactionCategory = bankAccountService.getBankAccountById(filterModel.getBankId()).getTransactionCategory();
							Integer bankTransactionCategoryId = bankTransactionCategory.getTransactionCategoryId();
							for(TransactionCategory transactionCategory : transactionCatList)
							{
                             Integer transactionCategoryId = transactionCategory.getTransactionCategoryId();
								if(transactionCategoryId == bankTransactionCategoryId)
								{
									//tempTransactionCatogaryList.add(transactionCategory);
								}
								else
								{
									tempTransactionCatogaryList.add(transactionCategory);
								}
							}
							transactionCatList = tempTransactionCatogaryList;
						}
						return new ResponseEntity<>(
								new ReconsilationCatDataModel(null,
										transcationCategoryHelper.getSinleLevelDropDownModelList(transactionCatList)),
							HttpStatus.OK);
					}
					break;

				case MONEY_SPENT_OTHERS:
				case MONEY_SPENT:
				case PURCHASE_OF_CAPITAL_ASSET:
				case REFUND_RECEIVED:
				case INTEREST_RECEVIED:
				case MONEY_RECEIVED_OTHERS:
				case DISPOSAL_OF_CAPITAL_ASSET:
				case MONEY_RECEIVED:

					transactionCatList = transactionCategoryService
							.getTransactionCatByChartOfAccountCategoryId(category.getChartOfAccountCategoryId());
					if (transactionCatList != null && !transactionCatList.isEmpty())
						return new ResponseEntity<>(
								new ReconsilationCatDataModel(null,
										transcationCategoryHelper.getSinleLevelDropDownModelList(transactionCatList)),
								HttpStatus.OK);
					break;
				case DEFAULT:
					transactionCatList = transactionCategoryService
							.getTransactionCatByChartOfAccountCategoryId(category.getChartOfAccountCategoryId());
					if (transactionCatList != null && !transactionCatList.isEmpty())
						return new ResponseEntity<>(
								new ReconsilationCatDataModel(null,
										transcationCategoryHelper.getSinleLevelDropDownModelList(transactionCatList)),
								HttpStatus.OK);
			}

			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}


	@LogRequest
	@ApiOperation(value = "Get ReconcileStatusList")
	@GetMapping(value = "/list")
	public ResponseEntity<PaginationResponseModel> getAllReconcileStatus(ReconcileStatusRequestModel filterModel) {


		Map<TransactionFilterEnum, Object> dataMap = new EnumMap<>(TransactionFilterEnum.class);

		if (filterModel.getBankId() != null) {
			dataMap.put(TransactionFilterEnum.BANK_ID, bankAccountService.findByPK(filterModel.getBankId()));
		}
		dataMap.put(TransactionFilterEnum.DELETE_FLAG, false);
		PaginationResponseModel response = reconcileStatusService.getAllReconcileStatusList(dataMap, filterModel);
		if (response == null) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
		response.setData(reconsilationRestHelper.getModelList(response.getData()));
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Add New ReconcileStatus")
	@PostMapping(value = "/save")
	public ResponseEntity<String> save(@RequestParam Integer bankAccountId, @RequestParam BigDecimal closingBalance) {
		try {
			ReconcileStatus reconcileStatus = new ReconcileStatus();
			reconcileStatus.setBankAccount(bankAccountService.getBankAccountById(bankAccountId));
			reconcileStatus.setClosingBalance(closingBalance);
			reconcileStatus.setReconciledDuration("1 Month");
			Date date = new Date();
			reconcileStatus.setReconciledDate(Instant.ofEpochMilli(date.getTime())
					.atZone(ZoneId.systemDefault()).toLocalDateTime());
			reconcileStatusService.persist(reconcileStatus);
			return new ResponseEntity<>("Saved Successfully", HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@PostMapping(value = "/reconcilenow")
	public ResponseEntity<ReconcilationResponseModel> reconcileNow(@ModelAttribute ReconcilationPersistModel reconcilationPersistModel,
																   HttpServletRequest request) {
		try {
			ReconcilationResponseModel responseModel = new ReconcilationResponseModel();
			LocalDateTime reconcileDate = reconsilationRestHelper.getDateFromRequest(reconcilationPersistModel);

			ReconcileStatus status = reconsilationRestHelper.getReconcileStatus(reconcilationPersistModel);
			LocalDateTime startDate = null;
			if (status == null) {
				startDate = transactionService.getTransactionStartDateToReconcile(reconcileDate.plusHours(23).plusMinutes(59), reconcilationPersistModel.getBankId());
				if(startDate == null) {
					responseModel.setStatus(3);
					responseModel.setMessage(" The Reconcile date should be after the last transaction date or same as the transaction date.");
					return new ResponseEntity<>(responseModel, HttpStatus.OK);
				}
			} else {
				startDate = status.getReconciledDate();
				//startDate = LocalDateTime.ofInstant(startDate.toInstant(ZoneOffset.UTC),ZoneId.of(System.getProperty("simplevat.user.timezone","Asia/Dubai")));
			}
			Integer unexplainedTransaction = 1;
			if (startDate.isEqual(reconcileDate) && status !=null)
				unexplainedTransaction = -1;
			else
				unexplainedTransaction = transactionService.isTransactionsReadyForReconcile(startDate, reconcileDate.plusHours(23).plusMinutes(59), reconcilationPersistModel.getBankId());
			if (unexplainedTransaction == 0) {
				//1 check if this matches with closing balance
				BigDecimal closingBalance = reconcilationPersistModel.getClosingBalance();
				BigDecimal dbClosingBalance = transactionCategoryClosingBalanceService.matchClosingBalanceForReconcile(reconcileDate,
						bankAccountService.getBankAccountById(reconcilationPersistModel.getBankId()).getTransactionCategory());
				if(dbClosingBalance.longValue()<0)
					dbClosingBalance = dbClosingBalance.negate();
				boolean isClosingBalanceMatches = dbClosingBalance.compareTo(closingBalance)==0;
				if (isClosingBalanceMatches) {
					transactionService.updateTransactionStatusReconcile(startDate, reconcileDate.plusHours(23).plusMinutes(59), reconcilationPersistModel.getBankId(),
							TransactionExplinationStatusEnum.RECONCILED);
					ReconcileStatus reconcileStatus = new ReconcileStatus();
					reconcileStatus.setReconciledDate(reconcileDate);
					reconcileStatus.setReconciledStartDate(startDate);
					reconcileStatus.setBankAccount(bankAccountService.findByPK(reconcilationPersistModel.getBankId()));
					reconcileStatus.setClosingBalance(closingBalance);
					reconcileStatusService.persist(reconcileStatus);
					responseModel.setStatus(1);
					responseModel.setMessage("Reconciled Successfully..");
					return new ResponseEntity<>(responseModel, HttpStatus.OK);
				} else {
					responseModel.setStatus(2);
					responseModel.setMessage("Failed Reconciling. Closing Balance in System " + dbClosingBalance + " does not matches with the given Closing Balance");
					return new ResponseEntity<>(responseModel, HttpStatus.OK);
				}
			} else if (unexplainedTransaction == -1) {
				responseModel.setStatus(3);
				responseModel.setMessage("The Transactions in Bank Account are already reconciled for the given date");
				return new ResponseEntity<>(responseModel, HttpStatus.OK);
			} else {    /*
			 *  Send unexplainedTransaction still pending to be explained.
			 */
				responseModel.setStatus(4);
				responseModel.setMessage("Failed Reconciling. Please update the remaining " + unexplainedTransaction + " unexplained transactions before reconciling");
				return new ResponseEntity<>(responseModel, HttpStatus.OK);
			}

		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete Reconcile Status")
	@DeleteMapping(value = "/deletes")
	public ResponseEntity<String> deleteTransactions(@RequestBody DeleteModel ids) {
		try {
			reconcileStatusService.deleteByIds(ids.getIds());
			return new ResponseEntity<>("Deleted reconcile status rows successfully", HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@ApiOperation(value = "Get ReconcileStatusList")
	@GetMapping(value = "/getChildrenTransactionCategoryList")
	public ResponseEntity<List<SingleLevelDropDownModel>> getlistEmployeeTransactionCategory(Integer id){
		try {
			List<DropdownModel> response = new ArrayList<>();
			Map<String, Object> param = new HashMap<>();
			param.put("parentTransactionCategory", id);
			List<TransactionCategory> transactionCategoryList =
					transactionCategoryService.findByAttributes(param);
			response = transcationCategoryHelper.getEmployeeTransactionCategory(transactionCategoryList);
			return new ResponseEntity(response, HttpStatus.OK);
		}
		catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}
	@LogRequest
	@ApiOperation(value = "Get ReconcileStatusList")
	@GetMapping(value = "/getCOACList")
	public ResponseEntity<List<SingleLevelDropDownModel>> getCOACList(){

		try {
			List<DropdownModel> response = new ArrayList<>();
			List<ChartOfAccountCategory> chartOfAccountCategory = chartOfAccountCategoryService.findAll();
			response = transcationCategoryHelper.getCOACList(chartOfAccountCategory);
			return new ResponseEntity(response, HttpStatus.OK);
		}
		catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

}
