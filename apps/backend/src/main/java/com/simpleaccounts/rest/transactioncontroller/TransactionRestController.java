package com.simpleaccounts.rest.transactioncontroller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.bank.model.DeleteModel;
import com.simpleaccounts.constant.*;
import com.simpleaccounts.constant.dbfilter.ORDERBYENUM;
import com.simpleaccounts.constant.dbfilter.TransactionFilterEnum;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.helper.DateFormatHelper;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.helper.TransactionHelper;
import com.simpleaccounts.model.ExplainedInvoiceListModel;
import com.simpleaccounts.repository.*;
import com.simpleaccounts.rest.CorporateTax.*;
import com.simpleaccounts.rest.CorporateTax.Repositories.CorporateTaxPaymentHistoryRepository;
import com.simpleaccounts.rest.CorporateTax.Repositories.CorporateTaxPaymentRepository;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.PostingRequestModel;
import com.simpleaccounts.rest.ReconsileRequestLineItemModel;
import com.simpleaccounts.rest.creditnotecontroller.CreditNoteRepository;
import com.simpleaccounts.rest.customizeinvoiceprefixsuffixccontroller.CustomizeInvoiceTemplateService;
import com.simpleaccounts.rest.financialreport.VatPaymentRepository;
import com.simpleaccounts.rest.financialreport.VatRecordPaymentHistoryRepository;
import com.simpleaccounts.rest.financialreport.VatReportFilingRepository;
import com.simpleaccounts.rest.receiptcontroller.ReceiptRestHelper;
import com.simpleaccounts.rest.reconsilationcontroller.ReconsilationRestHelper;
import com.simpleaccounts.rest.vatcontroller.VatReportResponseListForBank;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.*;
import com.simpleaccounts.service.bankaccount.ChartOfAccountService;
import com.simpleaccounts.service.bankaccount.TransactionService;
import com.simpleaccounts.service.bankaccount.TransactionStatusService;
import com.simpleaccounts.service.impl.TransactionCategoryClosingBalanceServiceImpl;
import com.simpleaccounts.utils.ChartUtil;
import com.simpleaccounts.utils.DateFormatUtil;
import com.simpleaccounts.utils.FileHelper;
import com.simpleaccounts.utils.InvoiceNumberUtil;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.math.BigDecimal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;

/**
 *
 * @author sonu
 */
@Slf4j
@RestController
@RequestMapping(value = "/rest/transaction")
public class TransactionRestController {
	private final Logger logger = LoggerFactory.getLogger(TransactionRestController.class);
	@Autowired
	JwtTokenUtil jwtTokenUtil;
	@Autowired
	TransactionRepository transactionRepository;

	@Autowired
	private TransactionService transactionService;

	@Autowired
	private DateFormatHelper dateFormatHelper;

	@Autowired
	TransactionCategoryClosingBalanceServiceImpl transactionCategoryClosingBalanceService;

	@Autowired
	private BankAccountService bankAccountService;

	@Autowired

	private ChartOfAccountService chartOfAccountService;

	@Autowired
	private TransactionHelper transactionHelper;

	@Autowired
	private ChartUtil chartUtil;

	@Autowired
	private TransactionCategoryService transactionCategoryService;

	@Autowired
	private ReconsilationRestHelper reconsilationRestHelper;

	@Autowired
	private JournalService journalService;

	@Autowired
	private BankAccountService bankService;

	@Autowired
	private ChartOfAccountCategoryService chartOfAccountCategoryService;

	@Autowired
	private VatCategoryService vatCategoryService;

	@Autowired
	private ContactService contactService;

	@Autowired
	private TransactionStatusService transactionStatusService;

	@Autowired
	private FileHelper fileHelper;

	@Autowired
	private InvoiceService invoiceService;

	@Autowired
	private ReceiptService receiptService;

	@Autowired
	private CustomerInvoiceReceiptService customerInvoiceReceiptService;

	@Autowired
	private ReceiptRestHelper receiptRestHelper;

	@Autowired
	private ExpenseService expenseService;

	@Autowired
	private TransactionExpensesService transactionExpensesService;

	@Autowired
	private TransactionExpensesPayrollService transactionExpensesPayrollService;
	@Autowired
	private PaymentService paymentService;

	@Autowired
	private SupplierInvoicePaymentService supplierInvoicePaymentService;

	@Autowired
	private UserService userService;

	@Autowired
	private CurrencyService currencyService;

	@Autowired
	private FileAttachmentService fileAttachmentService;

	@Autowired
	private CustomizeInvoiceTemplateService customizeInvoiceTemplateService;

	@Autowired
	private PayrollRepository payrollRepository;


	@Autowired
	private InvoiceNumberUtil invoiceNumberUtil;

	@Autowired
	private VatPaymentRepository vatPaymentRepository;

	@Autowired
	private VatRecordPaymentHistoryRepository vatRecordPaymentHistoryRepository;

	@Autowired
	private VatReportFilingRepository vatReportFilingRepository;

	@Autowired
	private JournalLineItemRepository journalLineItemRepository;
	@Autowired
	private DateFormatUtil dateFormtUtil;

	@Autowired
	private TransactionExplanationRepository transactionExplanationRepository;

	@Autowired
	private TransactionExplanationLineItemRepository transactionExplanationLineItemRepository;

	@Autowired
	private ContactTransactionCategoryService contactTransactionCategoryService;

	@Autowired
	private CorporateTaxFilingRepository corporateTaxFilingRepository;

	@Autowired
	private CorporateTaxPaymentRepository corporateTaxPaymentRepository;

	@Autowired
	private CorporateTaxPaymentHistoryRepository corporateTaxPaymentHistoryRepository;

	@Autowired
	private CreditNoteRepository creditNoteRepository;
	@LogRequest
	@ApiOperation(value = "Get Transaction List")
	@GetMapping(value = "/list")
	public ResponseEntity<PaginationResponseModel> getAllTransaction(TransactionRequestFilterModel filterModel) {

		Map<TransactionFilterEnum, Object> dataMap = new EnumMap<>(TransactionFilterEnum.class);
		if(filterModel.getSortingCol()==null|| filterModel.getSortingCol()=="-1")
			filterModel.setSortingCol("transactionDate");
		if (filterModel.getBankId() != null) {
			dataMap.put(TransactionFilterEnum.BANK_ID, bankAccountService.findByPK(filterModel.getBankId()));
		}
		if(filterModel.getTransactionType()!=null)
		{String transactionType = filterModel.getTransactionType();
			if(transactionType.equalsIgnoreCase("POTENTIAL_DUPLICATE"))
			{
				dataMap.put(TransactionFilterEnum.CREATION_MODE, TransactionCreationMode.POTENTIAL_DUPLICATE);
			}
			else if(transactionType.equalsIgnoreCase("NOT_EXPLAIN"))
			{
				List<TransactionExplinationStatusEnum> s= new ArrayList<>() ;
				s.add(TransactionExplinationStatusEnum.NOT_EXPLAIN);
				s.add(TransactionExplinationStatusEnum.PARTIAL);

				dataMap.put(TransactionFilterEnum.TRANSACTION_EXPLINATION_STATUS_IN, s);
			}
		}
		if (filterModel.getTransactionDate() != null) {
			SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
			LocalDateTime dateTime = null;
			try {
				dateTime = Instant.ofEpochMilli(dateFormat.parse(filterModel.getTransactionDate()).getTime())
						.atZone(ZoneId.systemDefault()).toLocalDateTime();
			} catch (ParseException e) {
				logger.error(ERROR, e);
			}
			dataMap.put(TransactionFilterEnum.TRANSACTION_DATE, dateTime);
		}
		if (filterModel.getTransactionStatusCode() != null) {
			dataMap.put(TransactionFilterEnum.TRANSACTION_STATUS,
					transactionStatusService.findByPK(filterModel.getTransactionStatusCode()));
		}
		if (filterModel.getChartOfAccountId() != null) {
			dataMap.put(TransactionFilterEnum.CHART_OF_ACCOUNT,
					chartOfAccountService.findByPK(filterModel.getChartOfAccountId()));
		}
		dataMap.put(TransactionFilterEnum.ORDER_BY, ORDERBYENUM.DESC);
		dataMap.put(TransactionFilterEnum.DELETE_FLAG, false);
		PaginationResponseModel response = transactionService.getAllTransactionList(dataMap, filterModel);
		if (response == null) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
		response.setData(transactionHelper.getModelList(response.getData()));
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Add New Transaction", response = Transaction.class)
	@PostMapping(value = "/save")
	public ResponseEntity<String> saveTransaction(@ModelAttribute TransactionPresistModel transactionPresistModel,
												  HttpServletRequest request) throws IOException {

		String rootPath = request.getServletContext().getRealPath("/");
		log.info("filePath {}",rootPath);
		FileHelper.setRootPath(rootPath);
		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
//dada ki ID
		int chartOfAccountCategory = transactionPresistModel.getCoaCategoryId();

		Transaction trnx = updateTransactionWithCommonFields(transactionPresistModel,userId,TransactionCreationMode.MANUAL, null);
		trnx.setCreatedBy(userId);
		switch(ChartOfAccountCategoryIdEnumConstant.get(chartOfAccountCategory))
		{
//---------------------------------------Expense Chart of Account Category----------------------------------
			case EXPENSE:
				if(transactionPresistModel.getExpenseCategory()!=null && transactionPresistModel.getExpenseCategory() !=0)
				{
					if(transactionPresistModel.getExpenseCategory()==34)
					{
						explainPayroll(transactionPresistModel,userId,trnx);
					}
					else {
						explainExpenses(transactionPresistModel, userId, trnx);
					}
				}
				else
				{  // Supplier Invoices
					updateTransactionForSupplierInvoices(trnx,transactionPresistModel);
					// JOURNAL LINE ITEM FOR normal transaction
					List<ReconsileRequestLineItemModel> itemModels = getReconsileRequestLineItemModels(transactionPresistModel);
					reconsileSupplierInvoices(userId, trnx, itemModels,transactionPresistModel,request);
				}
				break;
			case MONEY_PAID_TO_USER:
				updateTransactionMoneyPaidToUser(trnx,transactionPresistModel);
				/////////////////////////////////////////////////////////////////////////////////////////////
				TransactionExplanation transactionExplanation = new TransactionExplanation();
				transactionExplanation.setCreatedBy(userId);
				transactionExplanation.setCreatedDate(LocalDateTime.now());
				transactionExplanation.setTransaction(trnx);
				transactionExplanation.setExplainedTransactionCategory(transactionCategoryService
                        .findByPK(transactionPresistModel.getTransactionCategoryId()));
				transactionExplanation.setCoaCategory(chartOfAccountCategoryService.
                        findByPK(transactionPresistModel.getCoaCategoryId()));
				transactionExplanation.setPaidAmount(transactionPresistModel.getAmount());
				if(transactionPresistModel.getEmployeeId()!=null)
					transactionExplanation.setExplanationEmployee(transactionPresistModel.getEmployeeId());
				transactionExplanation.setCurrentBalance(trnx.getCurrentBalance());
				transactionExplanation.setExplanationEmployee(transactionPresistModel.getEmployeeId());
				List<TransactionExplinationLineItem> transactionExplinationLineItems = new ArrayList<>();
				TransactionExplinationLineItem transactionExplinationLineItem = new TransactionExplinationLineItem();
				transactionExplinationLineItem.setCreatedBy(userId);
				transactionExplinationLineItem.setCreatedDate(LocalDateTime.now());
				transactionExplinationLineItem.setReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE);
				transactionExplinationLineItem.setReferenceId(trnx.getTransactionId());
				transactionExplinationLineItem.setTransactionExplanation(transactionExplanation);
				transactionExplinationLineItems.add(transactionExplinationLineItem);
				transactionExplanation.setExplanationLineItems(transactionExplinationLineItems);
				transactionExplanationRepository.save(transactionExplanation);
				//////////////////////////////////////////////////////////////////////////////////////////////
				Journal journal = reconsilationRestHelper.getByTransactionType(transactionPresistModel.getEmployeeId()!=null
								? transactionPresistModel.getEmployeeId():transactionPresistModel.getTransactionCategoryId(),
						transactionPresistModel.getAmount(), userId, trnx,false,transactionPresistModel.getExchangeRate());
				journal.setJournalDate(trnx.getTransactionDate().toLocalDate());
				journalService.persist(journal);
				break;
			case TRANSFERD_TO:
				updateTransactionForMoneySpent(trnx,transactionPresistModel);
				/////////////////////////////////////////////////////////////////////////////////////////////
				transactionExplanation = new TransactionExplanation();
				transactionExplanation.setCreatedBy(userId);
				transactionExplanation.setCreatedDate(LocalDateTime.now());
				transactionExplanation.setTransaction(trnx);
				transactionExplanation.setPaidAmount(transactionPresistModel.getAmount());
				transactionExplanation.setCurrentBalance(trnx.getCurrentBalance());
				transactionExplanation.setExplainedTransactionCategory(transactionCategoryService.
                        findByPK(transactionPresistModel.getTransactionCategoryId()));
				transactionExplanation.setCoaCategory(chartOfAccountCategoryService
                        .findByPK(transactionPresistModel.getCoaCategoryId()));
				transactionExplanation.setTransactionDescription(transactionPresistModel.getDescription());
				transactionExplinationLineItems = new ArrayList<>();
				transactionExplinationLineItem = new TransactionExplinationLineItem();
				transactionExplinationLineItem.setCreatedBy(userId);
				transactionExplinationLineItem.setCreatedDate(LocalDateTime.now());
				transactionExplinationLineItem.setReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE);
				transactionExplinationLineItem.setReferenceId(trnx.getTransactionId());
				transactionExplinationLineItem.setTransactionExplanation(transactionExplanation);
				transactionExplinationLineItems.add(transactionExplinationLineItem);
				transactionExplanation.setExplanationLineItems(transactionExplinationLineItems);
				transactionExplanationRepository.save(transactionExplanation);
				//////////////////////////////////////////////////////////////////////////////////////////////
				TransactionCategory explainedTransactionCategory = trnx.getExplainedTransactionCategory();
				boolean isdebitFromBank = false;
				if(explainedTransactionCategory!=null && explainedTransactionCategory.getChartOfAccount()
						.getChartOfAccountCode().equalsIgnoreCase(ChartOfAccountCategoryCodeEnum.BANK.getCode()))
				{
					TransactionCategory transactionCategory = transactionCategoryService
							.findTransactionCategoryByTransactionCategoryCode(
									TransactionCategoryCodeEnum.AMOUNT_IN_TRANSIT.getCode());
					trnx.setExplainedTransactionCategory(transactionCategory);
					trnx.setExplainedTransactionDescription("Transferred to " + explainedTransactionCategory.getTransactionCategoryName()
							+" : TransactionId=" + explainedTransactionCategory.getTransactionCategoryId());
				}
				journal = reconsilationRestHelper.getByTransactionType(transactionPresistModel.getTransactionCategoryId(),
						transactionPresistModel.getAmount(), userId, trnx, isdebitFromBank,transactionPresistModel.getExchangeRate());
				journal.setJournalDate(trnx.getTransactionDate().toLocalDate());
				journalService.persist(journal);
				break;
			case MONEY_SPENT:
			case MONEY_SPENT_OTHERS:
			case PURCHASE_OF_CAPITAL_ASSET:
				updateTransactionForMoneySpent(trnx,transactionPresistModel);
				/////////////////////////////////////////////////////////////////////////////////////////////
				transactionExplanation = new TransactionExplanation();
				transactionExplanation.setCreatedBy(userId);
				transactionExplanation.setCreatedDate(LocalDateTime.now());
				transactionExplanation.setTransaction(trnx);
				transactionExplanation.setExplainedTransactionCategory(transactionCategoryService
                        .findByPK(transactionPresistModel.getTransactionCategoryId()));
				transactionExplanation.setCoaCategory(chartOfAccountCategoryService
                        .findByPK(transactionPresistModel.getCoaCategoryId()));
				transactionExplanation.setPaidAmount(transactionPresistModel.getAmount());
				transactionExplanation.setCurrentBalance(trnx.getCurrentBalance());
				transactionExplinationLineItems = new ArrayList<>();
				transactionExplinationLineItem = new TransactionExplinationLineItem();
				transactionExplinationLineItem.setCreatedBy(userId);
				transactionExplinationLineItem.setCreatedDate(LocalDateTime.now());
				transactionExplinationLineItem.setReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE);
				transactionExplinationLineItem.setReferenceId(trnx.getTransactionId());
				transactionExplinationLineItem.setTransactionExplanation(transactionExplanation);
				transactionExplinationLineItems.add(transactionExplinationLineItem);
				transactionExplanation.setExplanationLineItems(transactionExplinationLineItems);
				transactionExplanationRepository.save(transactionExplanation);
				//////////////////////////////////////////////////////////////////////////////////////////////
				journal = reconsilationRestHelper.getByTransactionType(transactionPresistModel.getTransactionCategoryId(),
						transactionPresistModel.getAmount(), userId, trnx, false,transactionPresistModel.getExchangeRate());
				journal.setJournalDate(trnx.getTransactionDate().toLocalDate());
				journalService.persist(journal);
				break;
//-----------------------------------------------------Sales Chart of Account Category-----------------------------------------
			case SALES:
				// Customer Invoices
				updateTransactionForCustomerInvoices(trnx,transactionPresistModel);
				List<ReconsileRequestLineItemModel> itemModels = getReconsileRequestLineItemModels(transactionPresistModel);
				reconsileCustomerInvoices(userId, trnx, itemModels, transactionPresistModel,request);
				break;
			case VAT_PAYMENT:
			case VAT_CLAIM:
				recordVatPayment(transactionPresistModel,trnx);
				break;
			case CORPORATE_TAX_PAYMENT:
				recordCorporateTaxPayment(transactionPresistModel,trnx);
				break;
			case TRANSFER_FROM:
				updateTransactionForMoneyReceived(trnx,transactionPresistModel);
				/////////////////////////////////////////////////////////////////////////////////////////////
				transactionExplanation = new TransactionExplanation();
				transactionExplanation.setCreatedBy(userId);
				transactionExplanation.setCreatedDate(LocalDateTime.now());
				transactionExplanation.setTransaction(trnx);
				transactionExplanation.setExplainedTransactionCategory(transactionCategoryService
                        .findByPK(transactionPresistModel.getTransactionCategoryId()));
				transactionExplanation.setCoaCategory(chartOfAccountCategoryService
                        .findByPK(transactionPresistModel.getCoaCategoryId()));
				transactionExplanation.setPaidAmount(transactionPresistModel.getAmount());
				transactionExplanation.setCurrentBalance(trnx.getCurrentBalance());
				transactionExplanation.setTransactionDescription(transactionPresistModel.getDescription());
				transactionExplinationLineItems = new ArrayList<>();
				transactionExplinationLineItem = new TransactionExplinationLineItem();
				transactionExplinationLineItem.setCreatedBy(userId);
				transactionExplinationLineItem.setCreatedDate(LocalDateTime.now());
				transactionExplinationLineItem.setReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE);
				transactionExplinationLineItem.setReferenceId(trnx.getTransactionId());
				transactionExplinationLineItem.setTransactionExplanation(transactionExplanation);
				transactionExplinationLineItems.add(transactionExplinationLineItem);
				transactionExplanation.setExplanationLineItems(transactionExplinationLineItems);
				transactionExplanationRepository.save(transactionExplanation);
				//////////////////////////////////////////////////////////////////////////////////////////////
				explainedTransactionCategory = trnx.getExplainedTransactionCategory();
				isdebitFromBank = true;
					TransactionCategory transactionCategory = transactionCategoryService
							.findTransactionCategoryByTransactionCategoryCode(
									TransactionCategoryCodeEnum.AMOUNT_IN_TRANSIT.getCode());
					trnx.setExplainedTransactionCategory(transactionCategory);
					trnx.setExplainedTransactionDescription("Transferred from " + explainedTransactionCategory.getTransactionCategoryName()
							+ " : TransactionId=" + explainedTransactionCategory.getTransactionCategoryId());
				journal = reconsilationRestHelper.getByTransactionType(transactionPresistModel.getTransactionCategoryId(),
						transactionPresistModel.getAmount(), userId, trnx, isdebitFromBank,transactionPresistModel.getExchangeRate());
				journal.setJournalDate(trnx.getTransactionDate().toLocalDate());
				journalService.persist(journal);
				break;
			case REFUND_RECEIVED:
			case INTEREST_RECEVIED:
			case DISPOSAL_OF_CAPITAL_ASSET:
			case MONEY_RECEIVED_FROM_USER:
			case MONEY_RECEIVED_OTHERS:
				updateTransactionForMoneyReceived(trnx,transactionPresistModel);
				/////////////////////////////////////////////////////////////////////////////////////////////
				transactionExplanation = new TransactionExplanation();
				transactionExplanation.setCreatedBy(userId);
				transactionExplanation.setCreatedDate(LocalDateTime.now());
				transactionExplanation.setTransaction(trnx);
				if(transactionPresistModel.getEmployeeId()!=null)
					transactionExplanation.setExplanationEmployee(transactionPresistModel.getEmployeeId());
				transactionExplanation.setExplainedTransactionCategory(transactionCategoryService
                        .findByPK(transactionPresistModel.getTransactionCategoryId()));
				transactionExplanation.setCoaCategory(chartOfAccountCategoryService
                        .findByPK(transactionPresistModel.getCoaCategoryId()));
				transactionExplanation.setPaidAmount(transactionPresistModel.getAmount());
				transactionExplanation.setCurrentBalance(trnx.getCurrentBalance());
				transactionExplinationLineItems = new ArrayList<>();
				transactionExplinationLineItem = new TransactionExplinationLineItem();
				transactionExplinationLineItem.setCreatedBy(userId);
				transactionExplinationLineItem.setCreatedDate(LocalDateTime.now());
				transactionExplinationLineItem.setReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE);
				transactionExplinationLineItem.setReferenceId(trnx.getTransactionId());
				transactionExplinationLineItem.setTransactionExplanation(transactionExplanation);
				transactionExplinationLineItems.add(transactionExplinationLineItem);
				transactionExplanation.setExplanationLineItems(transactionExplinationLineItems);
				transactionExplanationRepository.save(transactionExplanation);
				//////////////////////////////////////////////////////////////////////////////////////////////
				journal = reconsilationRestHelper.getByTransactionType(transactionPresistModel.getTransactionCategoryId(),
						transactionPresistModel.getAmount(), userId, trnx, true,transactionPresistModel.getExchangeRate());
				journal.setJournalDate(trnx.getTransactionDate().toLocalDate());
				journalService.persist(journal);
				break;
			default:
				return new ResponseEntity<>("Chart of Category Id not sent correctly", HttpStatus.INTERNAL_SERVER_ERROR);
		}
		updateBankCurrentBalance(trnx);
		return new ResponseEntity<>("Saved successfull", HttpStatus.OK);

	}

	private void recordCorporateTaxPayment(TransactionPresistModel transactionPresistModel, Transaction trnx) {
		CorporateTaxModel corporateTaxModel = getExplainedCorporateTaxListModel(transactionPresistModel).get(0);
		TransactionExplanation transactionExplanation = new TransactionExplanation();
		BankAccount bankAccount = bankAccountService.getBankAccountById(transactionPresistModel.getBankId());
		CorporateTaxPayment corporateTaxPayment = new CorporateTaxPayment();
		corporateTaxPayment.setPaymentDate(trnx.getTransactionDate().toLocalDate());
		corporateTaxPayment.setAmountPaid(trnx.getTransactionAmount());
		corporateTaxPayment.setDepositToTransactionCategory((bankAccount.getTransactionCategory()));
		BigDecimal ctReportFilingBalanceDue = BigDecimal.ZERO;
		CorporateTaxFiling corporateTaxFiling = corporateTaxFilingRepository.findById(corporateTaxModel.getId()).get();
		if (corporateTaxFiling.getBalanceDue().compareTo(trnx.getTransactionAmount()) > 0){
			ctReportFilingBalanceDue = corporateTaxFiling.getBalanceDue().subtract(trnx.getTransactionAmount());
		}
		else {
			ctReportFilingBalanceDue = (trnx.getTransactionAmount().subtract(corporateTaxFiling.getBalanceDue()));
		}
		if (ctReportFilingBalanceDue.compareTo(BigDecimal.ZERO) == 0) {
			corporateTaxFiling.setBalanceDue(ctReportFilingBalanceDue);
			corporateTaxFiling.setStatus(CommonStatusEnum.PAID.getValue());
		}
		else if (ctReportFilingBalanceDue.compareTo(BigDecimal.ZERO) > 0){
			corporateTaxFiling.setBalanceDue(ctReportFilingBalanceDue);
			corporateTaxFiling.setStatus(CommonStatusEnum.PARTIALLY_PAID.getValue());
		}
		corporateTaxPayment.setCorporateTaxFiling(corporateTaxFiling);
		corporateTaxPayment.setCreatedBy(trnx.getCreatedBy());
		corporateTaxPayment.setCreatedDate(LocalDateTime.now());
		corporateTaxPayment.setDeleteFlag(Boolean.FALSE);

		CorporateTaxPaymentHistory corporateTaxPaymentHistory = new CorporateTaxPaymentHistory();
		corporateTaxPaymentHistory.setCreatedBy(trnx.getCreatedBy());
		corporateTaxPaymentHistory.setCreatedDate(LocalDateTime.now());
		corporateTaxPaymentHistory.setLastUpdatedBy(trnx.getCreatedBy());
		corporateTaxPaymentHistory.setLastUpdateDate(LocalDateTime.now());
		corporateTaxPaymentHistory.setStartDate(corporateTaxPayment.getCorporateTaxFiling().getStartDate());
		corporateTaxPaymentHistory.setEndDate(corporateTaxPayment.getCorporateTaxFiling().getEndDate());
		corporateTaxPaymentHistory.setAmountPaid(corporateTaxPayment.getAmountPaid());

        trnx.setCoaCategory(chartOfAccountCategoryService
                .findByPK(ChartOfAccountCategoryIdEnumConstant.MONEY_SPENT_OTHERS.getId()));
        transactionExplanation.setCoaCategory(chartOfAccountCategoryService
                .findByPK(ChartOfAccountCategoryIdEnumConstant.MONEY_SPENT_OTHERS.getId()));
        trnx.setDebitCreditFlag('D');

		trnx.setTransactionExplinationStatusEnum(TransactionExplinationStatusEnum.FULL);
		trnx.setTransactionDueAmount(BigDecimal.ZERO);
		trnx.setBankAccount(bankAccount);
		transactionService.persist(trnx);

		corporateTaxPayment.setTransaction(trnx);
		corporateTaxPaymentRepository.save(corporateTaxPayment);
		corporateTaxPaymentHistory.setCorporateTaxPayment(corporateTaxPayment);
		corporateTaxPaymentHistoryRepository.save(corporateTaxPaymentHistory);

		transactionExplanation.setCreatedBy(trnx.getCreatedBy());
		transactionExplanation.setCreatedDate(LocalDateTime.now());
		transactionExplanation.setTransaction(trnx);
		transactionExplanation.setPaidAmount(trnx.getTransactionAmount());
		transactionExplanation.setCurrentBalance(trnx.getCurrentBalance());
		transactionExplanation.setExplainedTransactionCategory(trnx.getExplainedTransactionCategory());
		transactionExplanation.setExchangeGainOrLossAmount(BigDecimal.ZERO);
		transactionExplanationRepository.save(transactionExplanation);
		// Post journal
		Journal journal =  corporateTaxPaymentPosting(
				new PostingRequestModel(corporateTaxPayment.getId(), corporateTaxPayment.getAmountPaid()), trnx.getCreatedBy(),
				corporateTaxPayment.getDepositToTransactionCategory(),transactionPresistModel.getExchangeRate());
		journalService.persist(journal);
	}

	private Journal corporateTaxPaymentPosting(PostingRequestModel postingRequestModel, Integer userId,
                                               TransactionCategory depositeToTransactionCategory,BigDecimal exchangeRate) {
		List<JournalLineItem> journalLineItemList = new ArrayList<>();
		Journal journal = new Journal();
		JournalLineItem journalLineItem1 = new JournalLineItem();
		JournalLineItem journalLineItem2 = new JournalLineItem();
		journalLineItem1.setReferenceId(postingRequestModel.getPostingRefId());
		CorporateTaxPayment corporateTaxPayment=corporateTaxPaymentRepository.findById(postingRequestModel.getPostingRefId()).get();
		TransactionCategory transactionCategory = transactionCategoryService.
				findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.CORPORATION_TAX.getCode());
		journalLineItem1.setTransactionCategory(depositeToTransactionCategory);
		journalLineItem1.setCreditAmount(postingRequestModel.getAmount());
		journalLineItem2.setDebitAmount(postingRequestModel.getAmount());
		journalLineItem1.setReferenceType(PostingReferenceTypeEnum.CORPORATE_TAX_PAYMENT);
		journalLineItem1.setExchangeRate(BigDecimal.ONE);
		journalLineItem1.setCreatedBy(userId);
		journalLineItem1.setJournal(journal);
		journalLineItemList.add(journalLineItem1);
		journalLineItem2.setTransactionCategory(transactionCategory);
		journalLineItem2.setReferenceType(PostingReferenceTypeEnum.CORPORATE_TAX_PAYMENT);
		journalLineItem2.setReferenceId(postingRequestModel.getPostingRefId());
		journalLineItem2.setExchangeRate(BigDecimal.ONE);
		journalLineItem2.setCreatedBy(userId);
		journalLineItem2.setJournal(journal);
		journalLineItemList.add(journalLineItem2);
		//Create Journal
		journal.setJournalLineItems(journalLineItemList);
		journal.setCreatedBy(userId);
		journal.setPostingReferenceType(PostingReferenceTypeEnum.CORPORATE_TAX_PAYMENT);
		journal.setJournalDate(LocalDate.now());
		journal.setTransactionDate(corporateTaxPayment.getPaymentDate());
		return journal;
	}

	private void recordVatPayment(TransactionPresistModel transactionPresistModel, Transaction trnx) {
		List<VatReportResponseListForBank> vatReportResponseListForBankList = getExplainedVatPaymentListModel(transactionPresistModel);
		TransactionExplanation transactionExplanation = new TransactionExplanation();
		BankAccount bankAccount = bankAccountService.getBankAccountById(transactionPresistModel.getBankId());
		VatReportResponseListForBank vatReportResponseListForBank = vatReportResponseListForBankList.get(0);
		VatPayment vatPayment = new VatPayment();
		vatPayment.setVatPaymentDate(trnx.getTransactionDate());
		vatPayment.setAmount(trnx.getTransactionAmount());
		vatPayment.setDepositToTransactionCategory((bankAccount.getTransactionCategory()));

		BigDecimal vatReportFilingBalanceDue = BigDecimal.ZERO;
		VatReportFiling vatReportFiling = vatReportFilingRepository.findById(vatReportResponseListForBank.getId()).get();
		if (vatReportFiling.getBalanceDue().compareTo(trnx.getTransactionAmount()) > 0){
			vatReportFilingBalanceDue = vatReportFiling.getBalanceDue().subtract(trnx.getTransactionAmount());
		}
		else {
			vatReportFilingBalanceDue = (trnx.getTransactionAmount().subtract(vatReportFiling.getBalanceDue()));
		}
		if (vatReportFilingBalanceDue.compareTo(BigDecimal.ZERO)==0){
			vatReportFiling.setBalanceDue(vatReportFilingBalanceDue);
			if (vatReportFiling.getTotalTaxReclaimable().compareTo(BigDecimal.ZERO) > 0){
				vatReportFiling.setStatus(CommonStatusEnum.CLAIMED.getValue());
			}
			else
				vatReportFiling.setStatus(CommonStatusEnum.PAID.getValue());
		}
		else if (vatReportFilingBalanceDue.compareTo(BigDecimal.ZERO) > 0){
			vatReportFiling.setBalanceDue(vatReportFilingBalanceDue);
			vatReportFiling.setStatus(CommonStatusEnum.PARTIALLY_PAID.getValue());
		}
		vatPayment.setVatReportFiling(vatReportFiling);
		vatPayment.setCreatedBy(trnx.getCreatedBy());
		vatPayment.setCreatedDate(LocalDateTime.now());
		vatPayment.setDeleteFlag(Boolean.FALSE);
		vatPayment.setIsVatReclaimable(vatReportFiling.getIsVatReclaimable());

		VatRecordPaymentHistory vatRecordPaymentHistory = new VatRecordPaymentHistory();
		vatRecordPaymentHistory.setCreatedBy(trnx.getCreatedBy());
		vatRecordPaymentHistory.setCreatedDate(LocalDateTime.now());
		vatRecordPaymentHistory.setDeleteFlag(Boolean.FALSE);
		vatRecordPaymentHistory.setLastUpdateBy(trnx.getCreatedBy());
		vatRecordPaymentHistory.setLastUpdateDate(LocalDateTime.now());
		vatRecordPaymentHistory.setStartDate(vatPayment.getVatReportFiling().getStartDate().atStartOfDay());
		vatRecordPaymentHistory.setEndDate(vatPayment.getVatReportFiling().getEndDate().atStartOfDay());
		vatRecordPaymentHistory.setDateOfFiling(vatPayment.getVatReportFiling().getTaxFiledOn().atStartOfDay());

		if (vatPayment.getIsVatReclaimable()==Boolean.TRUE){
			vatRecordPaymentHistory.setAmountReclaimed(vatPayment.getAmount());
			vatRecordPaymentHistory.setAmountPaid(BigDecimal.ZERO);
		}
		else {
			vatRecordPaymentHistory.setAmountPaid(vatPayment.getAmount());
			vatRecordPaymentHistory.setAmountReclaimed(BigDecimal.ZERO);
		}
		if (vatPayment.getIsVatReclaimable().equals(Boolean.TRUE)){
			trnx.setCoaCategory(chartOfAccountCategoryService
                    .findByPK(ChartOfAccountCategoryIdEnumConstant.MONEY_RECEIVED_OTHERS.getId()));
			transactionExplanation.setCoaCategory(chartOfAccountCategoryService
                    .findByPK(ChartOfAccountCategoryIdEnumConstant.MONEY_RECEIVED_OTHERS.getId()));
			trnx.setDebitCreditFlag('C');
		}
		else {
			trnx.setCoaCategory(chartOfAccountCategoryService
                    .findByPK(ChartOfAccountCategoryIdEnumConstant.MONEY_SPENT_OTHERS.getId()));
			transactionExplanation.setCoaCategory(chartOfAccountCategoryService
                    .findByPK(ChartOfAccountCategoryIdEnumConstant.MONEY_SPENT_OTHERS.getId()));
			trnx.setDebitCreditFlag('D');
		}
		trnx.setTransactionDescription("Manual Transaction Created Against ReceiptNo " + vatReportFiling.getVatNumber());
		trnx.setTransactionExplinationStatusEnum(TransactionExplinationStatusEnum.FULL);
		trnx.setTransactionDueAmount(BigDecimal.ZERO);
		trnx.setBankAccount(bankAccount);
		transactionService.persist(trnx);

		vatPayment.setTransaction(trnx);
		vatPaymentRepository.save(vatPayment);
		vatRecordPaymentHistory.setVatPayment(vatPayment);
		vatRecordPaymentHistoryRepository.save(vatRecordPaymentHistory);

		transactionExplanation.setCreatedBy(trnx.getCreatedBy());
		transactionExplanation.setCreatedDate(LocalDateTime.now());
		transactionExplanation.setTransaction(trnx);
		transactionExplanation.setPaidAmount(trnx.getTransactionAmount());
		transactionExplanation.setCurrentBalance(trnx.getCurrentBalance());
		transactionExplanation.setExplainedTransactionCategory(trnx.getExplainedTransactionCategory());
		transactionExplanation.setExchangeGainOrLossAmount(BigDecimal.ZERO);
		transactionExplanationRepository.save(transactionExplanation);
		// Post journal
		Journal journal =  vatPaymentPosting(
				new PostingRequestModel(vatPayment.getId(), vatPayment.getAmount()), trnx.getCreatedBy(),
				vatPayment.getDepositToTransactionCategory(),transactionPresistModel.getExchangeRate());
		journalService.persist(journal);
	}
	private Journal vatPaymentPosting(PostingRequestModel postingRequestModel, Integer userId,
                                      TransactionCategory depositeToTransactionCategory,BigDecimal exchangeRate) {
		List<JournalLineItem> journalLineItemList = new ArrayList<>();
		Journal journal = new Journal();
		JournalLineItem journalLineItem1 = new JournalLineItem();
		JournalLineItem journalLineItem2 = new JournalLineItem();
		journalLineItem1.setReferenceId(postingRequestModel.getPostingRefId());
		VatPayment vatPayment=vatPaymentRepository.findById(postingRequestModel.getPostingRefId()).get();
		TransactionCategory transactionCategory = transactionCategoryService.
				findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.GCC_VAT_PAYABLE.getCode());
		journalLineItem1.setTransactionCategory(transactionCategory);
		if (vatPayment.getIsVatReclaimable().equals(Boolean.FALSE)){
			journalLineItem1.setDebitAmount(postingRequestModel.getAmount());
			journalLineItem2.setCreditAmount(postingRequestModel.getAmount());
			journalLineItem1.setReferenceType(PostingReferenceTypeEnum.VAT_PAYMENT);
		}
		else {
			journalLineItem1.setCreditAmount(postingRequestModel.getAmount());
			journalLineItem2.setDebitAmount(postingRequestModel.getAmount());
			journalLineItem1.setReferenceType(PostingReferenceTypeEnum.VAT_CLAIM);
		}
		journalLineItem1.setExchangeRate(exchangeRate);
		journalLineItem1.setCreatedBy(userId);
		journalLineItem1.setJournal(journal);
		journalLineItemList.add(journalLineItem1);


		journalLineItem2.setTransactionCategory(depositeToTransactionCategory);
		if (vatPayment.getIsVatReclaimable().equals(Boolean.FALSE)) {
			journalLineItem2.setReferenceType(PostingReferenceTypeEnum.VAT_PAYMENT);
		}
		else {
			journalLineItem2.setReferenceType(PostingReferenceTypeEnum.VAT_CLAIM);
		}
		journalLineItem2.setReferenceId(postingRequestModel.getPostingRefId());
		journalLineItem2.setExchangeRate(exchangeRate);
		journalLineItem2.setCreatedBy(userId);
		journalLineItem2.setJournal(journal);
		journalLineItemList.add(journalLineItem2);
		//Create Journal
		journal.setJournalLineItems(journalLineItemList);
		journal.setCreatedBy(userId);
		if (vatPayment.getIsVatReclaimable().equals(Boolean.FALSE)) {
			journal.setPostingReferenceType(PostingReferenceTypeEnum.VAT_PAYMENT);
		}
		else {
			journal.setPostingReferenceType(PostingReferenceTypeEnum.VAT_CLAIM);
		}
		journal.setJournalDate(LocalDate.now());
		journal.setTransactionDate(vatPayment.getVatPaymentDate().toLocalDate());
		return journal;
	}

	/**
	 *
	 * @param transactionPresistModel
	 * @param userId
	 * @param trnx
	 * @throws IOException
	 */
	private void explainPayroll(TransactionPresistModel transactionPresistModel, Integer userId, Transaction trnx) throws IOException {
		TransactionExplanation transactionExplanation = new TransactionExplanation();
//1.payrollTotal for expense
		BigDecimal payrollsTotalAmt = BigDecimal.ZERO;
		for(Object payrollObject :  transactionPresistModel.getPayrollListIds()) {
			JSONObject obj =  (JSONObject)payrollObject;
			Payroll payroll = payrollRepository.findById(obj.getInt("payrollId"));
			payrollsTotalAmt=payrollsTotalAmt.add(payroll.getDueAmountPayroll());
		}

//2.create new expenses
		Expense expense =  createNewExpense(transactionPresistModel,userId);
		//amnt check
		BigDecimal transactionAmount = BigDecimal.ZERO; //for journal
		if(trnx.getTransactionAmount().compareTo(payrollsTotalAmt) > 0)
		{
			expense.setExpenseAmount(payrollsTotalAmt);
			transactionAmount=payrollsTotalAmt;
		}else {
			expense.setExpenseAmount(trnx.getTransactionAmount());
			transactionAmount=trnx.getTransactionAmount();
		}

		if (transactionPresistModel.getDescription() != null) {
			trnx.setExplainedTransactionDescription(transactionPresistModel.getDescription());
		}
		// create Expense Journal-entry
		Journal journal = null;
		int transactionCategoryId = 0;
		if(transactionPresistModel.getTransactionCategoryId()==null||transactionPresistModel.getExpenseCategory()!=null) {

			transactionCategoryId = transactionPresistModel.getExpenseCategory();
			TransactionCategory transactionCategory = transactionCategoryService.findByPK(transactionCategoryId);
			trnx.setExplainedTransactionCategory(transactionCategory);
			transactionExplanation.setExplainedTransactionCategory(transactionCategory);
		}
		else
		{
			transactionCategoryId = transactionPresistModel.getTransactionCategoryId();
			transactionExplanation.setExplainedTransactionCategory(transactionCategoryService.findByPK(transactionCategoryId));
		}
		// explain transaction
		updateTransactionMoneyPaidToUser(trnx,transactionPresistModel);
		// create Journal entry for Transaction explanation
		//Employee reimbursement and bank
		journal = reconsilationRestHelper.getByTransactionTypeForPayroll(transactionPresistModel,transactionCategoryId
				, userId, trnx,expense,transactionAmount);
		journal.setJournalDate(trnx.getTransactionDate().toLocalDate());
		journalService.persist(journal);

		//Trx-Exp Relationship
		TransactionExpenses status = new TransactionExpenses();
		status.setCreatedBy(userId);
		status.setExplinationStatus(TransactionExplinationStatusEnum.FULL);
		status.setRemainingToExplain(BigDecimal.ZERO);
		status.setTransaction(trnx);
		status.setExpense(expense);
		transactionExpensesService.persist(status);
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		transactionExplanation.setCreatedBy(userId);
		transactionExplanation.setCreatedDate(LocalDateTime.now());
		transactionExplanation.setTransaction(trnx);

		transactionExplanation.setCoaCategory(chartOfAccountCategoryService.findByPK(transactionPresistModel.getCoaCategoryId()));
		transactionExplanation.setCurrentBalance(trnx.getCurrentBalance());
		transactionExplanation.setCoaCategory(chartOfAccountCategoryService.findByPK(transactionPresistModel.getCoaCategoryId()));
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//3.payroll Loop
		List<TransactionExplinationLineItem> transactionExplinationLineItems = new ArrayList<>();
		BigDecimal transactionPaidAmount = BigDecimal.ZERO;
		for(Object payrollObject :  transactionPresistModel.getPayrollListIds()) {
			TransactionExplinationLineItem transactionExplinationLineItem = new TransactionExplinationLineItem();
			JSONObject obj =  (JSONObject)payrollObject;
			Payroll payroll = payrollRepository.findById(obj.getInt("payrollId"));
			BigDecimal journalAmountForSalaryPayrollJli = BigDecimal.ZERO;
			//trnx amnt should not be Zero and payroll due amount should not be zero
			if (!trnx.getTransactionDueAmount().equals(BigDecimal.ZERO)
                    && payroll.getDueAmountPayroll().floatValue() != 0.00) {
				TransactionExpensesPayroll transactionExpensesPayroll = new TransactionExpensesPayroll();

				//TDA<PDA
				if (trnx.getTransactionDueAmount().compareTo(payroll.getDueAmountPayroll()) < 0) {
					transactionExplinationLineItem.setExplainedAmount(trnx.getTransactionDueAmount());
					transactionPaidAmount = transactionPaidAmount.add(trnx.getTransactionDueAmount());
					journalAmountForSalaryPayrollJli = journalAmountForSalaryPayrollJli.add(trnx.getTransactionDueAmount());
					trnx.setTransactionExplinationStatusEnum(TransactionExplinationStatusEnum.FULL);
					payroll.setDueAmountPayroll(payroll.getDueAmountPayroll().subtract(trnx.getTransactionDueAmount()));
					trnx.setTransactionDueAmount(BigDecimal.ZERO);
					transactionExpensesPayroll.setExplinationStatus(TransactionExplinationStatusEnum.FULL);
					transactionExpensesPayroll.setRemainingToExplain(BigDecimal.ZERO);
				}

				//TDA>PDA
				if (trnx.getTransactionDueAmount().compareTo(payroll.getDueAmountPayroll()) > 0) {
					transactionExplinationLineItem.setExplainedAmount(payroll.getDueAmountPayroll());
					journalAmountForSalaryPayrollJli = journalAmountForSalaryPayrollJli.add((payroll.getDueAmountPayroll()));
					transactionPaidAmount = transactionPaidAmount.add(payroll.getDueAmountPayroll());
					trnx.setTransactionDueAmount(trnx.getTransactionDueAmount().subtract(payroll.getDueAmountPayroll()));
					trnx.setTransactionExplinationStatusEnum(TransactionExplinationStatusEnum.PARTIAL);
					payroll.setDueAmountPayroll(BigDecimal.ZERO);
					transactionExpensesPayroll.setExplinationStatus(TransactionExplinationStatusEnum.PARTIAL);
					transactionExpensesPayroll.setRemainingToExplain(trnx.getTransactionDueAmount());


				}

				//TDA=PDA
				if (trnx.getTransactionDueAmount().compareTo(payroll.getDueAmountPayroll()) == 0) {
					journalAmountForSalaryPayrollJli = journalAmountForSalaryPayrollJli.add(payroll.getDueAmountPayroll());
					transactionExplinationLineItem.setExplainedAmount(payroll.getDueAmountPayroll());
					transactionPaidAmount = transactionPaidAmount.add(payroll.getDueAmountPayroll());
					trnx.setTransactionDueAmount(BigDecimal.ZERO);
					trnx.setTransactionExplinationStatusEnum(TransactionExplinationStatusEnum.FULL);
					payroll.setDueAmountPayroll(BigDecimal.ZERO);
					transactionExpensesPayroll.setExplinationStatus(TransactionExplinationStatusEnum.FULL);
					transactionExpensesPayroll.setRemainingToExplain(BigDecimal.ZERO);

				}

				//status update
				payroll.setStatus(
						payroll.getDueAmountPayroll().compareTo(BigDecimal.ZERO) == 0
								? "Paid"
								: "Partially Paid"
				);
				payrollRepository.save(payroll);

				transactionExpensesPayroll.setCreatedBy(userId);
				transactionExpensesPayroll.setTransaction(trnx);
				transactionExpensesPayroll.setExpense(expense);
				transactionExpensesPayroll.setPayroll(payroll);
				transactionExpensesPayrollService.persist(transactionExpensesPayroll);
				////////////////////////////////////////////////////////////////////////////////////////////////////////
				transactionExplinationLineItem.setCreatedBy(userId);
				transactionExplinationLineItem.setCreatedDate(LocalDateTime.now());
				transactionExplinationLineItem.setReferenceType(PostingReferenceTypeEnum.PAYROLL_EXPLAINED);
				transactionExplinationLineItem.setReferenceId(payroll.getId());
				transactionExplinationLineItem.setTransactionExplanation(transactionExplanation);
//4.create each Payroll journal-entry
			Journal journal1 = createPayrollJournal(payroll,userId,journalAmountForSalaryPayrollJli,trnx);
			transactionExplinationLineItem.setJournal(journal1);
				transactionExplinationLineItems.add(transactionExplinationLineItem);
			}//if
		}//loop
		transactionExplanation.setPaidAmount(transactionPaidAmount);
		transactionExplanation.setExplanationLineItems(transactionExplinationLineItems);
		transactionExplanationRepository.save(transactionExplanation);

	}

	/**
	 * This Method will Create PAYROLL_EXPLAINED Journal Entry
	 *
	 * @param payroll
	 * @param userId
	 * @param journalAmountForSalaryPayrollJli
	 */
	private Journal createPayrollJournal(Payroll payroll, Integer userId, BigDecimal journalAmountForSalaryPayrollJli,Transaction trnx){
		Map<String, Object> CategoryParam = new HashMap<>();
		CategoryParam.put("transactionCategoryName", "Payroll Liability");
		List<TransactionCategory> payrollTransactionCategoryList = transactionCategoryService.findByAttributes(CategoryParam);
		TransactionCategory transactionCategoryForSalaryWages = transactionCategoryService.findByPK(34);
		Journal journal2 = new Journal();
		if (payrollTransactionCategoryList != null && !payrollTransactionCategoryList.isEmpty()) {

			List<JournalLineItem> journalLineItemList = new ArrayList<>();
			JournalLineItem journalLineItem1 = new JournalLineItem();
			journalLineItem1.setTransactionCategory(transactionCategoryForSalaryWages);
			journalLineItem1.setCreditAmount(journalAmountForSalaryPayrollJli);
			journalLineItem1.setReferenceType(PostingReferenceTypeEnum.PAYROLL_EXPLAINED);
			journalLineItem1.setCreatedBy(userId);
			journalLineItem1.setJournal(journal2);
			journalLineItem1.setReferenceId(payroll.getId());
			journalLineItemList.add(journalLineItem1);

			JournalLineItem journalLineItem2 = new JournalLineItem();
			journalLineItem2.setTransactionCategory(payrollTransactionCategoryList.get(0));
			journalLineItem2.setDebitAmount(journalAmountForSalaryPayrollJli);
			journalLineItem2.setReferenceType(PostingReferenceTypeEnum.PAYROLL_EXPLAINED);
			journalLineItem2.setCreatedBy(userId);
			journalLineItem2.setJournal(journal2);
			journalLineItem2.setReferenceId(payroll.getId());
			journalLineItemList.add(journalLineItem2);

			journal2.setJournalLineItems(journalLineItemList);
			journal2.setCreatedBy(userId);
			journal2.setPostingReferenceType(PostingReferenceTypeEnum.PAYROLL_EXPLAINED);
			journal2.setJournalDate(trnx.getTransactionDate().toLocalDate());
			journal2.setTransactionDate(trnx.getTransactionDate().toLocalDate());
			if (payroll.getPayrollSubject()!=null){
				journal2.setDescription(payroll.getPayrollSubject());
			}
		journalService.persist(journal2);
		}
        return journal2;
	}

	private void updateBankCurrentBalance(Transaction trnx) {
		BankAccount bankAccount = trnx.getBankAccount();
		BigDecimal currentBalance = trnx.getBankAccount().getCurrentBalance();
		if (trnx.getDebitCreditFlag() == 'D') {
			currentBalance = currentBalance.subtract(trnx.getTransactionAmount());
		} else {
			currentBalance =	currentBalance.add(trnx.getTransactionAmount());
		}
		bankAccount.setCurrentBalance(currentBalance);
		bankAccountService.update(bankAccount);
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "update Transaction", response = Transaction.class)
	@PostMapping(value = "/update")
	public ResponseEntity<String> updateTransaction(@ModelAttribute TransactionPresistModel transactionPresistModel,
													HttpServletRequest request) throws IOException {

		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
		String rootPath = request.getServletContext().getRealPath("/");
		log.info("filePath {}",rootPath);
		FileHelper.setRootPath(rootPath);
		Transaction trnx = isValidTransactionToExplain(transactionPresistModel);
		if(trnx!=null&&trnx.getTransactionExplinationStatusEnum()==TransactionExplinationStatusEnum.FULL) {
			TransactionExplanation transactionExplanation =
                    transactionExplanationRepository.findById(transactionPresistModel.getExplanationId()).get();
			trnx = updateTransactionWithCommonFields(transactionPresistModel, userId, TransactionCreationMode.IMPORT, trnx);
		}
		else if(trnx==null) {
			trnx = updateTransactionWithCommonFields(transactionPresistModel, userId, TransactionCreationMode.IMPORT, trnx);
		}
		if(transactionPresistModel.getTransactionCategoryId()!=null) {
			//Pota Grandchild
			TransactionCategory transactionCategory =
                    transactionCategoryService.findByPK(transactionPresistModel.getTransactionCategoryId());
			trnx.setExplainedTransactionCategory(transactionCategory);
		}
		int chartOfAccountCategory = transactionPresistModel.getCoaCategoryId();

		switch(ChartOfAccountCategoryIdEnumConstant.get(chartOfAccountCategory))
		{
//---------------------------------------Expense Chart of Account Category----------------------------------
			case EXPENSE:
				if(transactionPresistModel.getExpenseCategory()!=null && transactionPresistModel.getExpenseCategory() != 0) {
					if (transactionPresistModel.getExpenseCategory() == 34) {
						explainPayroll(transactionPresistModel,userId,trnx);
					} else {
						explainExpenses(transactionPresistModel, userId, trnx);
					}
				} else {  // Supplier Invoices
					updateTransactionForSupplierInvoices(trnx,transactionPresistModel);
					// JOURNAL LINE ITEM FOR normal transaction
					List<ReconsileRequestLineItemModel> itemModels = getReconsileRequestLineItemModels(transactionPresistModel);
					reconsileSupplierInvoices(userId, trnx, itemModels, transactionPresistModel,request);
				}
				break;
			case MONEY_PAID_TO_USER:
				updateTransactionMoneyPaidToUser(trnx,transactionPresistModel);
				/////////////////////////////////////////////////////////////////////////////////////////////
				TransactionExplanation transactionExplanation = new TransactionExplanation();
				transactionExplanation.setCreatedBy(userId);
				transactionExplanation.setCreatedDate(LocalDateTime.now());
				transactionExplanation.setTransaction(trnx);
				transactionExplanation.setExplainedTransactionCategory(transactionCategoryService
                        .findByPK(transactionPresistModel.getTransactionCategoryId()));
				transactionExplanation.setCoaCategory(chartOfAccountCategoryService
                        .findByPK(transactionPresistModel.getCoaCategoryId()));
				transactionExplanation.setPaidAmount(transactionPresistModel.getAmount());
				transactionExplanation.setCurrentBalance(trnx.getCurrentBalance());
				if(transactionPresistModel.getEmployeeId()!=null)
					transactionExplanation.setExplanationEmployee(transactionPresistModel.getEmployeeId());
				transactionExplanation.setExplanationEmployee(transactionPresistModel.getEmployeeId());
				List<TransactionExplinationLineItem> transactionExplinationLineItems = new ArrayList<>();
				TransactionExplinationLineItem transactionExplinationLineItem = new TransactionExplinationLineItem();
				transactionExplinationLineItem.setCreatedBy(userId);
				transactionExplinationLineItem.setCreatedDate(LocalDateTime.now());
				transactionExplinationLineItem.setReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE);
				transactionExplinationLineItem.setReferenceId(trnx.getTransactionId());
				transactionExplinationLineItem.setTransactionExplanation(transactionExplanation);
				transactionExplinationLineItems.add(transactionExplinationLineItem);
				transactionExplanation.setExplanationLineItems(transactionExplinationLineItems);
				transactionExplanationRepository.save(transactionExplanation);

				//////////////////////////////////////////////////////////////////////////////////////////////
				Journal journal = reconsilationRestHelper.getByTransactionType(transactionPresistModel.getEmployeeId(),
						transactionPresistModel.getDueAmount(), userId, trnx, false,transactionPresistModel.getExchangeRate());
				journal.setJournalDate(LocalDate.now());
				journalService.persist(journal);
				break;
			case TRANSFERD_TO:
				updateTransactionForMoneySpent(trnx,transactionPresistModel);
				/////////////////////////////////////////////////////////////////////////////////////////////
				transactionExplanation = new TransactionExplanation();
				transactionExplanation.setCreatedBy(userId);
				transactionExplanation.setCreatedDate(LocalDateTime.now());
				transactionExplanation.setTransaction(trnx);
				transactionExplanation.setExplainedTransactionCategory(transactionCategoryService
                        .findByPK(transactionPresistModel.getTransactionCategoryId()));
				transactionExplanation.setCoaCategory(chartOfAccountCategoryService
                        .findByPK(transactionPresistModel.getCoaCategoryId()));
				transactionExplanation.setPaidAmount(transactionPresistModel.getAmount());
				transactionExplanation.setCurrentBalance(trnx.getCurrentBalance());
				transactionExplinationLineItems = new ArrayList<>();
				transactionExplinationLineItem = new TransactionExplinationLineItem();
				transactionExplinationLineItem.setCreatedBy(userId);
				transactionExplinationLineItem.setCreatedDate(LocalDateTime.now());
				transactionExplinationLineItem.setReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE);
				transactionExplinationLineItem.setReferenceId(trnx.getTransactionId());
				transactionExplinationLineItem.setTransactionExplanation(transactionExplanation);
				transactionExplinationLineItems.add(transactionExplinationLineItem);
				transactionExplanation.setExplanationLineItems(transactionExplinationLineItems);
				transactionExplanationRepository.save(transactionExplanation);
				//////////////////////////////////////////////////////////////////////////////////////////////
				TransactionCategory explainedTransactionCategory = trnx.getExplainedTransactionCategory();
				boolean isdebitFromBank = false;
				if (explainedTransactionCategory!=null
                        && (explainedTransactionCategory.getChartOfAccount().getChartOfAccountCode()
                            .equalsIgnoreCase(ChartOfAccountCategoryCodeEnum.BANK.getCode())
						|| explainedTransactionCategory.getTransactionCategoryCode()
                            .equalsIgnoreCase(TransactionCategoryCodeEnum.PETTY_CASH.getCode())))
				{
					TransactionCategory transactionCategory = transactionCategoryService
							.findTransactionCategoryByTransactionCategoryCode(
									TransactionCategoryCodeEnum.AMOUNT_IN_TRANSIT.getCode());
					trnx.setExplainedTransactionCategory(transactionCategory);
					trnx.setExplainedTransactionDescription("Transferred to " + explainedTransactionCategory.getTransactionCategoryName()
							+ " : TransactionId=" + explainedTransactionCategory.getTransactionCategoryId());
				}
				journal = reconsilationRestHelper.getByTransactionType(transactionPresistModel.getTransactionCategoryId(),
						transactionPresistModel.getDueAmount(), userId, trnx, isdebitFromBank,transactionPresistModel.getExchangeRate());
				journal.setJournalDate(LocalDate.now());
				journalService.persist(journal);
				break;
			case MONEY_SPENT:
			case MONEY_SPENT_OTHERS:
			case PURCHASE_OF_CAPITAL_ASSET:
				updateTransactionForMoneySpent(trnx,transactionPresistModel);
				/////////////////////////////////////////////////////////////////////////////////////////////
				transactionExplanation = new TransactionExplanation();
				transactionExplanation.setCreatedBy(userId);
				transactionExplanation.setCreatedDate(LocalDateTime.now());
				transactionExplanation.setTransaction(trnx);
				transactionExplanation.setExplainedTransactionCategory(transactionCategoryService
                        .findByPK(transactionPresistModel.getTransactionCategoryId()));
				transactionExplanation.setCoaCategory(chartOfAccountCategoryService
                        .findByPK(transactionPresistModel.getCoaCategoryId()));
				transactionExplanation.setPaidAmount(transactionPresistModel.getAmount());
				transactionExplanation.setCurrentBalance(trnx.getCurrentBalance());
				transactionExplinationLineItems = new ArrayList<>();
				transactionExplinationLineItem = new TransactionExplinationLineItem();
				transactionExplinationLineItem.setCreatedBy(userId);
				transactionExplinationLineItem.setCreatedDate(LocalDateTime.now());
				transactionExplinationLineItem.setReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE);
				transactionExplinationLineItem.setReferenceId(trnx.getTransactionId());
				transactionExplinationLineItem.setTransactionExplanation(transactionExplanation);
				transactionExplinationLineItems.add(transactionExplinationLineItem);
				transactionExplanation.setExplanationLineItems(transactionExplinationLineItems);
				transactionExplanationRepository.save(transactionExplanation);
				//////////////////////////////////////////////////////////////////////////////////////////////
				journal = reconsilationRestHelper.getByTransactionType(transactionPresistModel.getTransactionCategoryId(),
						transactionPresistModel.getDueAmount(), userId, trnx, false,transactionPresistModel.getExchangeRate());
				journal.setJournalDate(LocalDate.now());
				journalService.persist(journal);
				break;
//-----------------------------------------------------Sales Chart of Account Category-----------------------------------------
			case SALES:
				// Customer Invoices
				updateTransactionForCustomerInvoices(trnx,transactionPresistModel);
				// JOURNAL LINE ITEM FOR normal transaction
				List<ReconsileRequestLineItemModel> itemModels = getReconsileRequestLineItemModels(transactionPresistModel);
				reconsileCustomerInvoices(userId, trnx, itemModels, transactionPresistModel,request);
				break;
			case VAT_PAYMENT:
			case VAT_CLAIM:
				recordVatPayment(transactionPresistModel,trnx);
				break;
			case CORPORATE_TAX_PAYMENT:
				recordCorporateTaxPayment(transactionPresistModel,trnx);
				break;
			case TRANSFER_FROM:
				updateTransactionForMoneyReceived(trnx,transactionPresistModel);
				/////////////////////////////////////////////////////////////////////////////////////////////
				transactionExplanation = new TransactionExplanation();
				transactionExplanation.setCreatedBy(userId);
				transactionExplanation.setCreatedDate(LocalDateTime.now());
				transactionExplanation.setTransaction(trnx);
				transactionExplanation.setExplainedTransactionCategory(transactionCategoryService
                        .findByPK(transactionPresistModel.getTransactionCategoryId()));
				transactionExplanation.setCoaCategory(chartOfAccountCategoryService
                        .findByPK(transactionPresistModel.getCoaCategoryId()));
				transactionExplanation.setPaidAmount(transactionPresistModel.getAmount());
				transactionExplanation.setCurrentBalance(trnx.getCurrentBalance());
				transactionExplinationLineItems = new ArrayList<>();
				transactionExplinationLineItem = new TransactionExplinationLineItem();
				transactionExplinationLineItem.setCreatedBy(userId);
				transactionExplinationLineItem.setCreatedDate(LocalDateTime.now());
				transactionExplinationLineItem.setReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE);
				transactionExplinationLineItem.setReferenceId(trnx.getTransactionId());
				transactionExplinationLineItem.setTransactionExplanation(transactionExplanation);
				transactionExplinationLineItems.add(transactionExplinationLineItem);
				transactionExplanation.setExplanationLineItems(transactionExplinationLineItems);
				transactionExplanationRepository.save(transactionExplanation);
				//////////////////////////////////////////////////////////////////////////////////////////////
				explainedTransactionCategory = trnx.getExplainedTransactionCategory();
				isdebitFromBank = true;
				if(explainedTransactionCategory!=null
                        && explainedTransactionCategory.getChartOfAccount().getChartOfAccountCode()
                            .equalsIgnoreCase(ChartOfAccountCategoryCodeEnum.BANK.getCode()))
				{
					TransactionCategory transactionCategory = transactionCategoryService
							.findTransactionCategoryByTransactionCategoryCode(
									TransactionCategoryCodeEnum.AMOUNT_IN_TRANSIT.getCode());
					trnx.setExplainedTransactionCategory(transactionCategory);
					trnx.setExplainedTransactionDescription("Transferred from " + explainedTransactionCategory.getTransactionCategoryName()
							+ " : TransactionId=" + explainedTransactionCategory.getTransactionCategoryId());
				}
				journal = reconsilationRestHelper.getByTransactionType(transactionPresistModel.getTransactionCategoryId(),
						transactionPresistModel.getDueAmount(), userId, trnx, isdebitFromBank,transactionPresistModel.getExchangeRate());
				journal.setJournalDate(LocalDate.now());
				journalService.persist(journal);

				break;
			case REFUND_RECEIVED:
			case INTEREST_RECEVIED:
			case DISPOSAL_OF_CAPITAL_ASSET:
			case MONEY_RECEIVED_FROM_USER:
			case MONEY_RECEIVED_OTHERS:
				updateTransactionForMoneyReceived(trnx,transactionPresistModel);
				/////////////////////////////////////////////////////////////////////////////////////////////
				transactionExplanation = new TransactionExplanation();
				transactionExplanation.setCreatedBy(userId);
				transactionExplanation.setCreatedDate(LocalDateTime.now());
				transactionExplanation.setTransaction(trnx);
				if(transactionPresistModel.getEmployeeId()!=null)
					transactionExplanation.setExplanationEmployee(transactionPresistModel.getEmployeeId());
				transactionExplanation.setExplainedTransactionCategory(transactionCategoryService
                        .findByPK(transactionPresistModel.getTransactionCategoryId()));
				transactionExplanation.setCoaCategory(chartOfAccountCategoryService
                        .findByPK(transactionPresistModel.getCoaCategoryId()));
				transactionExplanation.setPaidAmount(transactionPresistModel.getAmount());
				transactionExplanation.setCurrentBalance(trnx.getCurrentBalance());
				transactionExplinationLineItems = new ArrayList<>();
				transactionExplinationLineItem = new TransactionExplinationLineItem();
				transactionExplinationLineItem.setCreatedBy(userId);
				transactionExplinationLineItem.setCreatedDate(LocalDateTime.now());
				transactionExplinationLineItem.setReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE);
				transactionExplinationLineItem.setReferenceId(trnx.getTransactionId());
				transactionExplinationLineItem.setTransactionExplanation(transactionExplanation);
				transactionExplinationLineItems.add(transactionExplinationLineItem);
				transactionExplanation.setExplanationLineItems(transactionExplinationLineItems);
				transactionExplanationRepository.save(transactionExplanation);
				//////////////////////////////////////////////////////////////////////////////////////////////
				journal = reconsilationRestHelper.getByTransactionType(transactionPresistModel.getTransactionCategoryId(),
						transactionPresistModel.getAmount(), userId, trnx, true,transactionPresistModel.getExchangeRate());
				journal.setJournalDate(LocalDate.now());
				journalService.persist(journal);
				break;
			default:
				return new ResponseEntity<>("Chart of Category Id not sent correctly", HttpStatus.INTERNAL_SERVER_ERROR);
		}
		if (transactionPresistModel.getIsValidForCurrentBalance()!=null && transactionPresistModel.getIsValidForCurrentBalance()){

			BigDecimal oldTransactionAmount = transactionPresistModel.getOldTransactionAmount();
			BigDecimal newTransactionAmount =transactionPresistModel.getAmount();
			BigDecimal currentBalance = trnx.getBankAccount().getCurrentBalance();

			BigDecimal updateTransactionAmount = BigDecimal.ZERO;
			updateTransactionAmount = newTransactionAmount.subtract(oldTransactionAmount);
			if(trnx.getDebitCreditFlag() == 'C'){

				currentBalance= currentBalance.subtract(oldTransactionAmount);
				currentBalance= currentBalance.add(newTransactionAmount);
			} else {
				currentBalance= currentBalance.add(oldTransactionAmount);
				currentBalance= currentBalance.subtract(newTransactionAmount);
			}

			BankAccount bankAccount =trnx.getBankAccount();
			bankAccount.setCurrentBalance(currentBalance);
			bankAccountService.update(bankAccount);
			trnx.setTransactionAmount(updateTransactionAmount);
		}
		return new ResponseEntity<>("Saved successfully", HttpStatus.OK);
	}
	protected Transaction isValidTransactionToExplain(TransactionPresistModel transactionPresistModel)
	{
		if(transactionPresistModel.getTransactionId()==null)
			return null;
		Transaction transaction =  transactionService.findByPK(transactionPresistModel.getTransactionId());
		if(transaction.getTransactionExplinationStatusEnum() == TransactionExplinationStatusEnum.FULL
                || transaction.getTransactionExplinationStatusEnum() == TransactionExplinationStatusEnum.PARTIAL){
			return transaction;
		}
		else
			return	null;
	}

	private String unExplain(@ModelAttribute TransactionPresistModel transactionPresistModel, Transaction trnx,TransactionExplanation transactionExplanation) {
		int chartOfAccountCategory = trnx.getCoaCategory().getChartOfAccountCategoryId();

		switch(ChartOfAccountCategoryIdEnumConstant.get(chartOfAccountCategory))
		{
//---------------------------------------Expense Chart of Account Category----------------------------------
			case EXPENSE:
				List<TransactionExpenses> transactionExpensesList = transactionExpensesService
						.findAllForTransactionExpenses(trnx.getTransactionId());
				if (transactionExpensesList != null && !transactionExpensesList.isEmpty())
				{
					if(transactionPresistModel.getExpenseCategory() == 34) {
						List<TransactionExpensesPayroll> transactionExpensesPayrollList = transactionExpensesPayrollService
								.findAllForTransactionExpenses(trnx.getTransactionId());
						unExplainPayrollExpenses(transactionExpensesPayrollList,trnx,transactionExpensesList,transactionExplanation);
					} else {
						unExplainExpenses(transactionExpensesList,trnx,transactionExplanation);
					}
				} else {
					// Get invoice
					Map<String, Object> param = new HashMap<>();
					param.put("transaction", trnx);
					List<TransactionStatus> transactionStatusList = transactionStatusService.findByAttributes(param);
					if(transactionStatusList!=null)	{

						for(TransactionStatus transactionStatus : transactionStatusList ) {
							param.clear();
							Invoice invoice = transactionStatus.getInvoice();
							param.put("supplierInvoice", invoice);
							param.put("transaction",trnx);
							List<SupplierInvoicePayment> supplierInvoicePaymentList = supplierInvoicePaymentService.findByAttributes(param);
							for (SupplierInvoicePayment supplierInvoiceReceipt:supplierInvoicePaymentList){
								// Delete journal lineItem
								Journal paymentJournal = journalService.getJournalByReferenceIdAndType(supplierInvoiceReceipt.
										getPayment().getPaymentId(),PostingReferenceTypeEnum.PAYMENT);

								List<Integer> paymentIdList = new ArrayList<>();
								paymentIdList.add(paymentJournal.getId());
								journalService.deleteByIds(paymentIdList);
								//Delete payment
								paymentService.delete(supplierInvoiceReceipt.getPayment());

								BigDecimal invoiceDueAmountToFill = supplierInvoiceReceipt.getPaidAmount();
								BigDecimal transactionDueAmountToFill = supplierInvoiceReceipt.getPaidAmount();
								invoice.setDueAmount(invoice.getDueAmount().add(invoiceDueAmountToFill));
								trnx.setTransactionDueAmount(trnx.getTransactionDueAmount().add(transactionDueAmountToFill));
								if (invoice.getDueAmount().floatValue() != 0f
                                        && invoice.getDueAmount().floatValue() != invoice.getTotalAmount().floatValue()) {
									invoice.setStatus(CommonStatusEnum.PARTIALLY_PAID.getValue());
								} else {
									invoice.setStatus(CommonStatusEnum.POST.getValue());
								}
								invoiceService.update(invoice);
								transactionStatusService.delete(transactionStatus);
								supplierInvoicePaymentService.delete(supplierInvoiceReceipt);

							}
						}
					}
					clearAndUpdateTransaction(trnx,transactionExplanation);
				}
				break;
			case MONEY_PAID_TO_USER:
			case TRANSFERD_TO:
			case MONEY_SPENT:
			case MONEY_SPENT_OTHERS:
			case PURCHASE_OF_CAPITAL_ASSET:
			case TRANSFER_FROM:
			case REFUND_RECEIVED:
			case INTEREST_RECEVIED:
			case DISPOSAL_OF_CAPITAL_ASSET:
			case MONEY_RECEIVED_FROM_USER:
			case MONEY_RECEIVED_OTHERS:
				Journal journal = null;
				VatPayment vatPayment = vatPaymentRepository.getVatPaymentByTransactionId(trnx.getTransactionId());
				if (vatPayment!=null)
				{
					if (vatPayment.getIsVatReclaimable().equals(Boolean.FALSE)){
						journal = journalService.getJournalByReferenceIdAndType(vatPayment.getId(),PostingReferenceTypeEnum.VAT_PAYMENT);
					} else {
						journal = journalService.getJournalByReferenceIdAndType(vatPayment.getId(),PostingReferenceTypeEnum.VAT_CLAIM);
					}
					VatRecordPaymentHistory vatRecordPaymentHistory = vatRecordPaymentHistoryRepository.getByVatPaymentId(vatPayment.getId());
					if (vatRecordPaymentHistory!=null){
						vatRecordPaymentHistoryRepository.delete(vatRecordPaymentHistory);
					}
					VatReportFiling vatReportFiling = vatPayment.getVatReportFiling();
					vatReportFiling.setBalanceDue(vatPayment.getAmount());
					if (vatReportFiling.getIsVatReclaimable().equals(Boolean.FALSE)
                            && !vatReportFiling.getTotalTaxPayable().equals(vatReportFiling.getBalanceDue())){
						vatReportFiling.setStatus(CommonStatusEnum.PARTIALLY_PAID.getValue());
					}
					vatReportFiling.setStatus(CommonStatusEnum.FILED.getValue());
					vatReportFilingRepository.save(vatReportFiling);
					vatPaymentRepository.delete(vatPayment);
				}else {
					journal = journalService.getJournalByReferenceIdAndType(trnx.getTransactionId(),
                            PostingReferenceTypeEnum.TRANSACTION_RECONSILE);
				}
				List<Integer> list = new ArrayList<>();
				list.add(journal.getId());
				journalService.deleteByIds(list);
				clearAndUpdateTransaction(trnx,transactionExplanation);
				break;
			//-----------------------------------------------------Sales Chart of Account Category-----------------------------------------
			case SALES:
				// Customer Invoices
				// Get invoice
				Map<String, Object> param = new HashMap<>();
				param.put("transaction", trnx);
				trnx.setTransactionDueAmount(BigDecimal.ZERO);
				List<TransactionStatus> transactionStatusList = transactionStatusService.findByAttributes(param);
				if(transactionStatusList!=null)	{

					for(TransactionStatus transactionStatus : transactionStatusList ) {
						param.clear();
						Invoice invoice = transactionStatus.getInvoice();
						param.put("customerInvoice", invoice);
						param.put("transaction",trnx);
						List<CustomerInvoiceReceipt> customerInvoiceReceiptList = customerInvoiceReceiptService.findByAttributes(param);
						for (CustomerInvoiceReceipt customerInvoiceReceipt:customerInvoiceReceiptList){
							customerInvoiceReceiptService.delete(customerInvoiceReceipt);
							// Delete journal lineItem
							Journal receiptJournal =
                                    journalService.getJournalByReferenceIdAndType(customerInvoiceReceipt.getReceipt().getId(),
                                            PostingReferenceTypeEnum.RECEIPT);
							List<Integer> receiptIdList = new ArrayList<>();
							receiptIdList.add(receiptJournal.getId());
							journalService.deleteByIds(receiptIdList);
							//Delete payment
							receiptService.delete(customerInvoiceReceipt.getReceipt());

							BigDecimal invoiceDueAmountToFill = customerInvoiceReceipt.getPaidAmount();
							BigDecimal transactionDueAmountToFill = customerInvoiceReceipt.getPaidAmount();
							invoice.setDueAmount(invoice.getDueAmount().add(invoiceDueAmountToFill));
							trnx.setTransactionDueAmount(trnx.getTransactionDueAmount().add(transactionDueAmountToFill));
							if (invoice.getDueAmount().floatValue() != 0f
                                    && invoice.getDueAmount().floatValue() != invoice.getTotalAmount().floatValue()) {
								invoice.setStatus(CommonStatusEnum.PARTIALLY_PAID.getValue());
							} else {
								invoice.setStatus(CommonStatusEnum.POST.getValue());
							}
							invoiceService.update(invoice);
							transactionStatusService.delete(transactionStatus);
						}
					}
				}
				clearAndUpdateTransaction(trnx,transactionExplanation);
				break;
			default:
				return "Chart of Category Id not sent correctly";
		}
		return "Transaction Un Explained Successfully";
	}

	/**
	 *
	 * @param userId
	 * @param trnx
	 * @param itemModels
	 */
	private void reconsileCustomerInvoices(Integer userId, Transaction trnx, List<ReconsileRequestLineItemModel> itemModels,
										   TransactionPresistModel transactionPresistModel,HttpServletRequest request) {
		List<ExplainedInvoiceListModel> explainedInvoiceListModelList = getExplainedInvoiceListModel(transactionPresistModel);
		TransactionExplanation transactionExplanation = new TransactionExplanation();
		transactionExplanation.setCreatedBy(userId);
		transactionExplanation.setCreatedDate(LocalDateTime.now());
		transactionExplanation.setTransaction(trnx);
		transactionExplanation.setExplanationContact(transactionPresistModel.getCustomerId());
		Contact contact1 = contactService.findByPK(transactionPresistModel.getCustomerId());
		Map<String, Object> customerMap = new HashMap<>();
		customerMap.put("contact", contact1.getContactId());
		customerMap.put("contactType", 2);
		customerMap.put("deleteFlag",Boolean.FALSE);

		List<ContactTransactionCategoryRelation> contactTransactionCategoryRelations = contactTransactionCategoryService
				.findByAttributes(customerMap);
		if (contactTransactionCategoryRelations!=null && !contactTransactionCategoryRelations.isEmpty()){
			ContactTransactionCategoryRelation contactTransactionCategoryRelation = contactTransactionCategoryRelations.get(0);
			transactionExplanation.setExplainedTransactionCategory(contactTransactionCategoryRelation.getTransactionCategory());
		}
		transactionExplanation.setCoaCategory(chartOfAccountCategoryService.findByPK(trnx.getCoaCategory().getChartOfAccountCategoryId()));
		transactionExplanation.setPaidAmount(trnx.getTransactionAmount());
		transactionExplanation.setCurrentBalance(trnx.getCurrentBalance());
		BigDecimal paidAmount = BigDecimal.ZERO;
        BigDecimal sumOfConvertedExplainedAmount= BigDecimal.ZERO;
		BigDecimal journalAmount = BigDecimal.ZERO;
		Integer contactId = null;
		Receipt receipt = null;
		List<TransactionExplinationLineItem> transactionExplinationLineItems = new ArrayList<>();
		for (ExplainedInvoiceListModel explainParam : explainedInvoiceListModelList) {
			TransactionExplinationLineItem transactionExplinationLineItem = new TransactionExplinationLineItem();
			BigDecimal explainedAmount = BigDecimal.ZERO;
			journalAmount = journalAmount.add(explainParam.getConvertedToBaseCurrencyAmount());
			// Update invoice Payment status
			Invoice invoiceEntity = invoiceService.findByPK(explainParam.getInvoiceId());
			contactId = invoiceEntity.getContact().getContactId();
			Contact contact = invoiceEntity.getContact();
			explainedAmount =explainParam.getExplainedAmount();
			if (explainParam.getPartiallyPaid().equals(Boolean.TRUE)){
				invoiceEntity.setDueAmount(invoiceEntity.getDueAmount().subtract(explainParam.getNonConvertedInvoiceAmount()));
				invoiceEntity.setStatus(CommonStatusEnum.PARTIALLY_PAID.getValue());
			}
			else {
				invoiceEntity.setDueAmount(BigDecimal.ZERO);
				invoiceEntity.setStatus(CommonStatusEnum.PAID.getValue());
			}
			transactionExplinationLineItem.setExplainedAmount(invoiceEntity.getDueAmount().subtract(trnx.getTransactionDueAmount()));
			if (explainParam.getExchangeRate()!=null){
				transactionExplinationLineItem.setExchangeRate(explainParam.getExchangeRate());
			}
			invoiceService.update(invoiceEntity);
			// CREATE MAPPNG BETWEEN RECEIPT AND INVOICE
			CustomerInvoiceReceipt customerInvoiceReceipt = new CustomerInvoiceReceipt();
			customerInvoiceReceipt.setCustomerInvoice(invoiceEntity);
			customerInvoiceReceipt.setTransaction(trnx);
			customerInvoiceReceipt.setPaidAmount(explainParam.getNonConvertedInvoiceAmount());
			customerInvoiceReceipt.setDeleteFlag(Boolean.FALSE);
			customerInvoiceReceipt.setDueAmount(invoiceEntity.getDueAmount());
			// CREATE RECEIPT
			receipt = transactionHelper.getReceiptEntity(contact, explainParam.getNonConvertedInvoiceAmount(),
					trnx.getBankAccount().getTransactionCategory());
			receipt.setCreatedBy(userId);
			receipt.setInvoice(invoiceEntity);
			receipt.setReceiptDate(trnx.getTransactionDate());
			receiptService.persist(receipt);
			// SAVE DATE OF RECEIPT AND INVOICE MAPPING IN MIDDLE TABLE
			customerInvoiceReceipt.setReceipt(receipt);
			customerInvoiceReceipt.setCreatedBy(userId);
			customerInvoiceReceiptService.persist(customerInvoiceReceipt);
			transactionExplinationLineItem.setCreatedBy(userId);
			transactionExplinationLineItem.setCreatedDate(LocalDateTime.now());
			transactionExplinationLineItem.setReferenceType(PostingReferenceTypeEnum.INVOICE);
			transactionExplinationLineItem.setReferenceId(invoiceEntity.getId());
			transactionExplinationLineItem.setTransactionExplanation(transactionExplanation);
			transactionExplinationLineItems.add(transactionExplinationLineItem);
			paidAmount = paidAmount.add(explainedAmount);
			transactionExplinationLineItem.setExplainedAmount(explainedAmount);
			transactionExplinationLineItem.setConvertedAmount(explainParam.getConvertedInvoiceAmount());
			transactionExplinationLineItem.setExchangeRate(explainParam.getExchangeRate());
			transactionExplinationLineItem.setPartiallyPaid(explainParam.getPartiallyPaid());
            //sum of all explained invoices
			sumOfConvertedExplainedAmount = sumOfConvertedExplainedAmount.add(explainParam.getConvertedInvoiceAmount());
			contactService.sendInvoiceThankYouMail(contact,1, invoiceEntity.getReferenceNumber(),
                    transactionPresistModel.getAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString(),
                    dateFormtUtil.getDateAsString(transactionPresistModel.getDate(),"dd/MM/yyyy") .replace("/","-"),
                    customerInvoiceReceipt.getCustomerInvoice().getDueAmount(), request);
		}
		transactionExplanation.setExplanationLineItems(transactionExplinationLineItems);
		transactionExplanation.setPaidAmount(paidAmount);
		transactionExplanation.setExchangeGainOrLossAmount(transactionPresistModel.getExchangeGainOrLoss());
		transactionExplanationRepository.save(transactionExplanation);
		// POST JOURNAL FOR RECCEPT
		Journal journalForReceipt = receiptRestHelper.customerPaymentFromBank(
				new PostingRequestModel(contactId,journalAmount),
				userId, trnx.getBankAccount().getTransactionCategory(),transactionPresistModel.getExchangeGainOrLoss(),
				transactionPresistModel.getExchangeGainOrLossId(),trnx.getTransactionId(),receipt,transactionPresistModel.getExchangeRate());
		journalForReceipt.setTransactionDate(trnx.getTransactionDate().toLocalDate());
		journalForReceipt.setJournalDate(trnx.getTransactionDate().toLocalDate());
		journalForReceipt.setJournlReferencenNo(trnx.getTransactionId().toString());
		journalService.persist(journalForReceipt);
		trnx.setTransactionDueAmount(BigDecimal.ZERO);
		trnx.setTransactionExplinationStatusEnum(TransactionExplinationStatusEnum.FULL);
		transactionService.update(trnx);
	}
	/**
	 *
	 * @param userId
	 * @param trnx
	 * @param itemModels
	 */
	private void reconsileSupplierInvoices(Integer userId, Transaction trnx, List<ReconsileRequestLineItemModel> itemModels,
										   TransactionPresistModel transactionPresistModel, HttpServletRequest request) {
		List<ExplainedInvoiceListModel> explainedInvoiceListModelList = getExplainedInvoiceListModel(transactionPresistModel);
		TransactionExplanation transactionExplanation = new TransactionExplanation();
		transactionExplanation.setCreatedBy(userId);
		transactionExplanation.setCreatedDate(LocalDateTime.now());
		transactionExplanation.setTransaction(trnx);
		transactionExplanation.setCurrentBalance(trnx.getCurrentBalance());
		transactionExplanation.setExplanationContact(transactionPresistModel.getVendorId());
		transactionExplanation.setExplainedTransactionCategory(trnx.getExplainedTransactionCategory());
		transactionExplanation.setCoaCategory(chartOfAccountCategoryService.findByPK(transactionPresistModel.getCoaCategoryId()));
		BigDecimal paidAmount = BigDecimal.ZERO;
        BigDecimal sumOfConvertedExplainedAmount= BigDecimal.ZERO;
		BigDecimal journalAmount = BigDecimal.ZERO;
		Integer contactId = null;
		List<TransactionExplinationLineItem> transactionExplinationLineItems = new ArrayList<>();
		for (ExplainedInvoiceListModel explainParam : explainedInvoiceListModelList) {
			TransactionExplinationLineItem transactionExplinationLineItem = new TransactionExplinationLineItem();
			BigDecimal explainedAmount = BigDecimal.ZERO;
			journalAmount = journalAmount.add(explainParam.getConvertedToBaseCurrencyAmount());
			// Update invoice Payment status
			if(explainParam.getInvoiceId() != null) {
				Invoice invoiceEntity = invoiceService.findByPK(explainParam.getInvoiceId());
				Contact contact = invoiceEntity.getContact();
				explainedAmount =explainParam.getExplainedAmount();

				if (explainParam.getPartiallyPaid().equals(Boolean.TRUE)){
					invoiceEntity.setDueAmount(invoiceEntity.getDueAmount().subtract(explainParam.getNonConvertedInvoiceAmount()));
					invoiceEntity.setStatus(CommonStatusEnum.PARTIALLY_PAID.getValue());
				} else {
					invoiceEntity.setDueAmount(BigDecimal.ZERO);
					invoiceEntity.setStatus(CommonStatusEnum.PAID.getValue());
				}

				if (explainParam.getExchangeRate()!=null){
					transactionExplinationLineItem.setExchangeRate(explainParam.getExchangeRate());
				}
				invoiceService.update(invoiceEntity);
				contactId = invoiceEntity.getContact().getContactId();
				// CREATE MAPPING BETWEEN PAYMENT AND INVOICE
				SupplierInvoicePayment supplierInvoicePayment = new SupplierInvoicePayment();
				supplierInvoicePayment.setSupplierInvoice(invoiceEntity);
				supplierInvoicePayment.setTransaction(trnx);
				supplierInvoicePayment.setPaidAmount(explainParam.getNonConvertedInvoiceAmount());
				supplierInvoicePayment.setDeleteFlag(Boolean.FALSE);
				supplierInvoicePayment.setDueAmount(invoiceEntity.getDueAmount());
				// CREATE PAYMENT
				Payment payment = transactionHelper.getPaymentEntity(contact, explainParam.getNonConvertedInvoiceAmount(),
						trnx.getBankAccount().getTransactionCategory(), invoiceEntity);
				payment.setCreatedBy(userId);
				payment.setInvoice(invoiceEntity);
				payment.setPaymentDate(trnx.getTransactionDate().toLocalDate());
				paymentService.persist(payment);
				// SAVE DATE OF RECEIPT AND INVOICE MAPPING IN MIDDLE TABLE
				supplierInvoicePayment.setPayment(payment);
				supplierInvoicePayment.setCreatedBy(userId);
				supplierInvoicePaymentService.persist(supplierInvoicePayment);

				transactionExplinationLineItem.setCreatedBy(userId);
				transactionExplinationLineItem.setCreatedDate(LocalDateTime.now());
				transactionExplinationLineItem.setReferenceType(PostingReferenceTypeEnum.INVOICE);
				transactionExplinationLineItem.setReferenceId(invoiceEntity.getId());
				transactionExplinationLineItem.setTransactionExplanation(transactionExplanation);
				paidAmount = paidAmount.add(explainedAmount);
				transactionExplinationLineItems.add(transactionExplinationLineItem);
				// CREATE MAPPING BETWEEN TRANSACTION AND JOURNAL
				contactService.sendInvoiceThankYouMail(contact,2,invoiceEntity.getReferenceNumber(),
                        transactionPresistModel.getAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString(),
                        dateFormtUtil.getDateAsString(transactionPresistModel.getDate(),"dd/MM/yyyy").replace("/","-"),
                        supplierInvoicePayment.getDueAmount(), request);
			}
			transactionExplinationLineItem.setExplainedAmount(explainedAmount);
			transactionExplinationLineItem.setConvertedAmount(explainParam.getConvertedInvoiceAmount());
			transactionExplinationLineItem.setExchangeRate(explainParam.getExchangeRate());
			transactionExplinationLineItem.setPartiallyPaid(explainParam.getPartiallyPaid());
            //sum of all explained invoices
			sumOfConvertedExplainedAmount = sumOfConvertedExplainedAmount.add(explainParam.getConvertedInvoiceAmount());
		}
		transactionExplanation.setExplanationLineItems(transactionExplinationLineItems);
		transactionExplanation.setPaidAmount(paidAmount);
		transactionExplanation.setExchangeGainOrLossAmount(transactionPresistModel.getExchangeGainOrLoss());
		transactionExplanationRepository.save(transactionExplanation);
		// POST JOURNAL FOR PAYMENT
		Journal journalForReceipt = receiptRestHelper.supplierPaymentFromBank(
				new PostingRequestModel(contactId,journalAmount),
				userId, trnx.getBankAccount().getTransactionCategory(),transactionPresistModel.getExchangeGainOrLoss(),
				transactionPresistModel.getExchangeGainOrLossId(),trnx.getTransactionId(),transactionPresistModel.getExchangeRate());
		journalForReceipt.setTransactionDate(trnx.getTransactionDate().toLocalDate());
		journalForReceipt.setJournalDate(trnx.getTransactionDate().toLocalDate());
		journalForReceipt.setJournlReferencenNo(trnx.getTransactionId().toString());
		journalService.persist(journalForReceipt);
		trnx.setTransactionDueAmount(BigDecimal.ZERO);
		trnx.setTransactionExplinationStatusEnum(TransactionExplinationStatusEnum.FULL);
		transactionService.update(trnx);
	}

	private void createTransactionStatus(Integer userId, Transaction trnx, ReconsileRequestLineItemModel explainParam, Invoice invoiceEntity) {
		TransactionStatus status = new TransactionStatus();
		status.setCreatedBy(userId);
		status.setExplinationStatus(TransactionExplinationStatusEnum.FULL);
		status.setTransaction(trnx);
		status.setRemainingToExplain(explainParam.getRemainingInvoiceAmount());
		status.setInvoice(invoiceEntity);
		transactionStatusService.persist(status);
	}

	/**
	 * This method with retrieve the invoice list from the TransactionPresistModel to List of ReconsileRequestLineItemModel
	 * @param transactionPresistModel
	 * @return list<ReconsileRequestLineItemModel>
	 */
	private List<ReconsileRequestLineItemModel> getReconsileRequestLineItemModels(@ModelAttribute TransactionPresistModel transactionPresistModel) {
		List<ReconsileRequestLineItemModel> itemModels = new ArrayList<>();
		if (transactionPresistModel.getExplainParamListStr() != null
				&& !transactionPresistModel.getExplainParamListStr().isEmpty()) {
			ObjectMapper mapper = new ObjectMapper();
			try {
				itemModels = mapper.readValue(transactionPresistModel.getExplainParamListStr(),
						new TypeReference<List<ReconsileRequestLineItemModel>>() {
						});
			} catch (IOException ex) {
				logger.error(ERROR, ex);
			}
		}
		return itemModels;
	}

	private List<ExplainedInvoiceListModel> getExplainedInvoiceListModel(@ModelAttribute TransactionPresistModel transactionPresistModel) {
		List<ExplainedInvoiceListModel> itemModels = new ArrayList<>();
		if (transactionPresistModel.getExplainedInvoiceListString() != null
				&& !transactionPresistModel.getExplainedInvoiceListString().isEmpty()) {
			ObjectMapper mapper = new ObjectMapper();
			try {
				itemModels = mapper.readValue(transactionPresistModel.getExplainedInvoiceListString(),
						new TypeReference<List<ExplainedInvoiceListModel>>() {
						});
			} catch (IOException ex) {
				logger.error(ERROR, ex);
			}
		}
		return itemModels;
	}

	private List<VatReportResponseListForBank> getExplainedVatPaymentListModel(@ModelAttribute TransactionPresistModel transactionPresistModel) {
		List<VatReportResponseListForBank> itemModels = new ArrayList<>();
		if (transactionPresistModel.getExplainedVatPaymentListString() != null
				&& !transactionPresistModel.getExplainedVatPaymentListString().isEmpty()) {
			ObjectMapper mapper = new ObjectMapper();
			try {
				itemModels = mapper.readValue(transactionPresistModel.getExplainedVatPaymentListString(),
						new TypeReference<List<VatReportResponseListForBank>>() {
						});
			} catch (IOException ex) {
				logger.error(ERROR, ex);
			}
		}
		return itemModels;
	}

	private List<CorporateTaxModel> getExplainedCorporateTaxListModel(@ModelAttribute TransactionPresistModel transactionPresistModel) {
		List<CorporateTaxModel> itemModels = new ArrayList<>();
		if (transactionPresistModel.getExplainedCorporateTaxListString() != null
				&& !transactionPresistModel.getExplainedCorporateTaxListString().isEmpty()) {
			ObjectMapper mapper = new ObjectMapper();
			try {
				itemModels = mapper.readValue(transactionPresistModel.getExplainedCorporateTaxListString(),
						new TypeReference<List<CorporateTaxModel>>() {
						});
			} catch (IOException ex) {
				logger.error(ERROR, ex);
			}
		}
		return itemModels;
	}

	/**
	 *
	 * @param transactionPresistModel
	 * @param userId
	 * @param trnx
	 */
	private void explainExpenses(@ModelAttribute TransactionPresistModel transactionPresistModel, Integer userId, Transaction trnx) throws IOException {
		TransactionExplanation transactionExplanation = new TransactionExplanation();
		//create new expenses
		Expense expense =  createNewExpense(transactionPresistModel,userId);
		trnx.setTransactionDueAmount(trnx.getTransactionDueAmount().subtract(transactionPresistModel.getAmount()));
		if (trnx.getTransactionDueAmount().compareTo(BigDecimal.ZERO)==0){
			trnx.setTransactionExplinationStatusEnum(TransactionExplinationStatusEnum.FULL);
		}
		if (expense.getExclusiveVat().equals(Boolean.TRUE)){
			trnx.setTransactionAmount(transactionPresistModel.getAmount());
		}

		if (transactionPresistModel.getDescription() != null) {
			trnx.setExplainedTransactionDescription(transactionPresistModel.getDescription());
		}
		// create Journal entry for Expense
		//Chart of account in expense and user
		Journal journal = null;
		int transactionCategoryId = 0;
		if(transactionPresistModel.getTransactionCategoryId()==null||transactionPresistModel.getExpenseCategory()!=null) {

			transactionCategoryId = transactionPresistModel.getExpenseCategory();
            TransactionCategory transactionCategory = transactionCategoryService.findByPK(transactionCategoryId);
			trnx.setExplainedTransactionCategory(transactionCategory);

			transactionExplanation.setExplainedTransactionCategory(transactionCategory);
		} else {
			transactionCategoryId = transactionPresistModel.getTransactionCategoryId();

			transactionExplanation.setExplainedTransactionCategory(transactionCategoryService.findByPK(transactionCategoryId));
		}
		// explain transaction
		updateTransactionMoneyPaidToUser(trnx,transactionPresistModel);
		// create Journal entry for Transaction explanation
		//Employee reimbursement and bank
		journal = reconsilationRestHelper.getByTransactionType(transactionPresistModel,transactionCategoryId
				, userId, trnx,expense);
		journal.setDescription("Expense");
		if (expense.getExpenseNumber()!=null){
			journal.setJournlReferencenNo(expense.getExpenseNumber());
		}
		journal.setJournalDate(LocalDate.now());
		LocalDate date = dateFormatHelper.convertToLocalDateViaSqlDate(transactionPresistModel.getDate());
		journal.setJournalDate(date);
		journalService.persist(journal);

		TransactionExpenses status = new TransactionExpenses();
		status.setCreatedBy(userId);
		status.setExplinationStatus(TransactionExplinationStatusEnum.FULL);
		status.setRemainingToExplain(BigDecimal.ZERO);
		status.setTransaction(trnx);
		status.setExpense(expense);
		transactionExpensesService.persist(status);
		/////////////////////////////////////////////////////////////////////////////////////////////
		transactionExplanation.setCreatedBy(userId);
		transactionExplanation.setCreatedDate(LocalDateTime.now());
		transactionExplanation.setTransaction(trnx);
		transactionExplanation.setPaidAmount(transactionPresistModel.getAmount());
		transactionExplanation.setCurrentBalance(trnx.getCurrentBalance());
		transactionExplanation.setVatCategory(transactionPresistModel.getVatId());

		if (transactionPresistModel.getTransactionCategoryId()!=null)
			transactionExplanation.setExplainedTransactionCategory(transactionCategoryService
                    .findByPK(transactionPresistModel.getTransactionCategoryId()));

		if (transactionPresistModel.getCoaCategoryId()!=null)
		    transactionExplanation.setCoaCategory(chartOfAccountCategoryService.findByPK(transactionPresistModel.getCoaCategoryId()));
		transactionExplanationRepository.save(transactionExplanation);
		//////////////////////////////////////////////////////////////////////////////////////////////
	}
	/**
	 *
	 * @param transaction
	 */
	private void unExplainExpenses( List<TransactionExpenses> transactionExpensesList, Transaction transaction,TransactionExplanation transactionExplanation) {
		//delete existing expense
		List<Integer> expenseIdList = deleteExpense(transactionExpensesList,transaction);
		if (!expenseIdList.isEmpty()) {
			clearAndUpdateTransaction(transaction,transactionExplanation);
		}
	}

	private List<Integer> deleteExpense( List<TransactionExpenses> transactionExpensesList,Transaction transaction) {
		List<Integer> expenseIdList = new ArrayList<>();
		for(TransactionExpenses transactionExpenses : transactionExpensesList)
		{
			transactionExpensesService.delete(transactionExpenses);
			Expense expense = transactionExpenses.getExpense();
			expenseIdList.add(expense.getExpenseId());
			if (transactionExpenses.getExpense().getBankGenerated() == true){
				expense.setDeleteFlag(Boolean.TRUE);
			}else{
				expense.setStatus(ExpenseStatusEnum.DRAFT.getValue());
			}

			expenseService.update(expense);
		}
		return expenseIdList;
	}
	private void unExplainPayrollExpenses( List<TransactionExpensesPayroll> transactionExpensesList,Transaction transaction,
                                           List<TransactionExpenses> transactionExpensesList1,TransactionExplanation transactionExplanation) {

		List<TransactionExplinationLineItem> transactionExplinationLineItemList =
                transactionExplanationLineItemRepository.getTransactionExplinationLineItemsByTransactionExplanation(transactionExplanation);
		for (TransactionExplinationLineItem transactionExplinationLineItem : transactionExplinationLineItemList) {

			Payroll payroll=payrollRepository.findById(transactionExplinationLineItem.getReferenceId());

			BigDecimal payrollDueAmountToFill = transactionExplinationLineItem.getExplainedAmount();
			BigDecimal transactionDueAmountTofill = transactionExplinationLineItem.getExplainedAmount();

			if (transactionDueAmountTofill.compareTo(payrollDueAmountToFill) < 0){
				payroll.setDueAmountPayroll(payroll.getDueAmountPayroll().add(transactionDueAmountTofill));
			} else if (transactionDueAmountTofill.compareTo(payrollDueAmountToFill) > 0){
				payroll.setDueAmountPayroll(payroll.getDueAmountPayroll().add(payrollDueAmountToFill));
			} else {
				payroll.setDueAmountPayroll(payroll.getDueAmountPayroll().add(payrollDueAmountToFill));
			}

			if(payroll.getDueAmountPayroll().floatValue() != 0f
                    && payroll.getDueAmountPayroll().floatValue() != payroll.getTotalAmountPayroll().floatValue()){
				payroll.setStatus("Partially Paid");
			} else {
				payroll.setStatus("Approved");
			}
			payrollRepository.save(payroll);
		}
		unExplainExpenses(transactionExpensesList1,transaction,transactionExplanation);

	}

	/**
	 * This method will delete PAYROLL_EXPLAINED Journal entries
	 * @param payroll
	 */
	private void deletePayrollJournal(Payroll payroll) {
		Journal journal = journalService.getJournalByReferenceIdAndType(payroll.getId(),PostingReferenceTypeEnum.PAYROLL_EXPLAINED);
		List<Integer> list = new ArrayList<>();
		list.add(journal.getId());
		journalService.deleteByIds(list);
	}

	private BigDecimal calculateActualVatAmount(BigDecimal vatPercent, BigDecimal expenseAmount) {
		float vatPercentFloat = vatPercent.floatValue();
		float expenseAmountFloat = expenseAmount.floatValue()*vatPercentFloat /(100+vatPercentFloat);
		return BigDecimal.valueOf(expenseAmountFloat);
	}

	private Expense createNewExpense(TransactionPresistModel model, Integer userId) {
		Expense expense = new Expense();
		String nxtExpenseNo = customizeInvoiceTemplateService.getLastInvoice(10);
		expense.setExpenseNumber(nxtExpenseNo);
		if (expense.getExpenseNumber()!=null) {
			CustomizeInvoiceTemplate template = customizeInvoiceTemplateService.getInvoiceTemplate(10);
			String suffix = invoiceNumberUtil.fetchSuffixFromString(expense.getExpenseNumber());
			template.setSuffix(Integer.parseInt(suffix));
			String prefix = expense.getExpenseNumber().substring(0, expense.getExpenseNumber().lastIndexOf(suffix));
			template.setPrefix(prefix);
			customizeInvoiceTemplateService.persist(template);
		}
		expense.setStatus(ExpenseStatusEnum.POSTED.getValue());
		Expense.ExpenseBuilder expenseBuilder = expense.toBuilder();
		if(model.getUserId()!=null) {
			expenseBuilder.userId(userService.findByPK(model.getUserId()));
		}
		else
		{
			expenseBuilder.payee("Company Expense");
		}
		if (model.getDate() != null) {
			LocalDate transactionDate = Instant.ofEpochMilli(model.getDate().getTime())
					.atZone(ZoneId.systemDefault())
					.toLocalDate();
			expenseBuilder.expenseDate(transactionDate);
		}
		expenseBuilder.exchangeRate(model.getExchangeRate());
		expenseBuilder.bankGenerated(Boolean.TRUE);
		expenseBuilder.expenseDescription(model.getDescription());
		BankAccount bankAccount = bankAccountService.findByPK(model.getBankId());
		if (bankAccount.getBankAccountCurrency() != null) {
			expenseBuilder.currency(currencyService.findByPK(bankAccount.getBankAccountCurrency().getCurrencyCode()));
		}
		if(model.getExpenseType() != null){
			expenseBuilder.expenseType(model.getExpenseType());
			expenseBuilder.vatClaimable(model.getExpenseType());
		}
		if (model.getExpenseCategory() != null) {
			expenseBuilder.transactionCategory(transactionCategoryService.findByPK(model.getExpenseCategory()));
		}
		if (model.getVatId() != null) {
			VatCategory vatCategory = vatCategoryService.findByPK(model.getVatId());
			expenseBuilder.vatCategory(vatCategory);

            if (model.getExclusiveVat()) {
				expenseBuilder.expenseAmount(model.getTransactionExpenseAmount().subtract(model.getTransactionVatAmount()));
			} else {
				expenseBuilder.expenseAmount(model.getAmount());
			}

			if (model.getTransactionVatAmount()!=null){
				expenseBuilder.expenseVatAmount(model.getTransactionVatAmount());
			} else {
				expenseBuilder.expenseVatAmount(BigDecimal.ZERO);
			}
		}
		if (model.getBankId() != null) {
			expenseBuilder.bankAccount(bankAccountService.findByPK(model.getBankId()));
		}
		expenseBuilder.createdBy(userId).createdDate(LocalDateTime.now());
		if (model.getAttachmentFile() != null && !model.getAttachmentFile().isEmpty()) {
			String fileName = null;
			try {
				fileName = fileHelper.saveFile(model.getAttachmentFile(), FileTypeEnum.EXPENSE);
			} catch (IOException e) {
				logger.error("Error saving file attachment ");
			}
			expenseBuilder.receiptAttachmentFileName(model.getAttachmentFile().getOriginalFilename())
					.receiptAttachmentPath(fileName);

		}
		if (model.getExclusiveVat()!=null){
			expenseBuilder.exclusiveVat(model.getExclusiveVat());
		}
		if (model.getIsReverseChargeEnabled()!=null){
			expenseBuilder.isReverseChargeEnabled(model.getIsReverseChargeEnabled());
		}
		expense = expenseBuilder.build();
		expenseService.persist(expense);
		return expense;
	}

	private void updateTransactionForMoneySpent(Transaction trnx, TransactionPresistModel transactionPresistModel) throws IOException {
		trnx.setDebitCreditFlag('D');
		if (transactionPresistModel.getDescription() != null) {
			trnx.setExplainedTransactionDescription(transactionPresistModel.getDescription());
		}
		if (transactionPresistModel.getBankId() != null) {
			trnx.setBankAccount(bankService.findByPK(transactionPresistModel.getBankId()));
		}
		if (transactionPresistModel.getReference() != null
				&& !transactionPresistModel.getReference().isEmpty()) {
			trnx.setReferenceStr(transactionPresistModel.getReference());
		}
		if (transactionPresistModel.getAttachmentFile() != null) {
			//To save the uploaded file in db.
			MultipartFile file = transactionPresistModel.getAttachmentFile();
            FileAttachment fileAttachment = fileAttachmentService.storeTransactionFile(file, transactionPresistModel);
            trnx.setFileAttachment(fileAttachment);
        }
		if (transactionPresistModel.getExchangeRate()!=null){
			trnx.setExchangeRate(transactionPresistModel.getExchangeRate());
		}
		transactionService.persist(trnx);
	}
	private void updateTransactionForMoneyReceived(Transaction trnx, TransactionPresistModel transactionPresistModel) throws IOException {
		updateTransactionDetails(trnx, transactionPresistModel);
		if (transactionPresistModel.getAttachmentFile() != null) {
			//To save the uploaded file in db.
			MultipartFile file = transactionPresistModel.getAttachmentFile();
            FileAttachment fileAttachment = fileAttachmentService.storeTransactionFile(file, transactionPresistModel);
            trnx.setFileAttachment(fileAttachment);
        }
		if (transactionPresistModel.getEmployeeId() != null) {
			TransactionCategory transactionCategory = transactionCategoryService.findByPK(transactionPresistModel.getEmployeeId());
			trnx.setExplainedTransactionCategory(transactionCategory);
		}
		transactionService.persist(trnx);
	}

	private void updateTransactionDetails(Transaction trnx, TransactionPresistModel transactionPresistModel) {
		trnx.setDebitCreditFlag('C');
		if (transactionPresistModel.getDescription() != null) {
			trnx.setExplainedTransactionDescription(transactionPresistModel.getDescription());
		}
		if (transactionPresistModel.getBankId() != null) {
			trnx.setBankAccount(bankService.findByPK(transactionPresistModel.getBankId()));
		}
		if (transactionPresistModel.getReference() != null
				&& !transactionPresistModel.getReference().isEmpty()) {
			trnx.setReferenceStr(transactionPresistModel.getReference());
		}
		if (transactionPresistModel.getExchangeRate()!=null){
			trnx.setExchangeRate(transactionPresistModel.getExchangeRate());
		}
	}

	private void updateTransactionForSupplierInvoices(Transaction trnx, TransactionPresistModel transactionPresistModel) throws IOException {
		trnx.setDebitCreditFlag('D');
		if (transactionPresistModel.getDescription() != null) {
			trnx.setExplainedTransactionDescription(transactionPresistModel.getDescription());
		}
		if (transactionPresistModel.getExchangeRate()!=null){
			trnx.setExchangeRate(transactionPresistModel.getExchangeRate());
		}
		if (transactionPresistModel.getBankId() != null) {
			trnx.setBankAccount(bankService.findByPK(transactionPresistModel.getBankId()));
		}
		if (transactionPresistModel.getReference() != null
				&& !transactionPresistModel.getReference().isEmpty()) {
			trnx.setReferenceStr(transactionPresistModel.getReference());
		}
		if (transactionPresistModel.getVatId() != null) {
			trnx.setVatCategory(vatCategoryService.findByPK(transactionPresistModel.getVatId()));
		}
		if (transactionPresistModel.getVendorId() != null) {
			trnx.setExplinationVendor((contactService.findByPK(transactionPresistModel.getVendorId())));
		}

		if (transactionPresistModel.getAttachmentFile()!=null) {
			//To save the uploaded file in db.
			MultipartFile file = transactionPresistModel.getAttachmentFile();
            FileAttachment fileAttachment = fileAttachmentService.storeTransactionFile(file, transactionPresistModel);
            trnx.setFileAttachment(fileAttachment);
        }
		transactionService.persist(trnx);
	}
	private void updateTransactionForCustomerInvoices(Transaction trnx, TransactionPresistModel transactionPresistModel) throws IOException {
		updateTransactionDetails(trnx, transactionPresistModel);
		if (transactionPresistModel.getVatId() != null) {
			trnx.setVatCategory(vatCategoryService.findByPK(transactionPresistModel.getVatId()));
		}
		if (transactionPresistModel.getCustomerId() != null) {
			trnx.setExplinationCustomer(contactService.findByPK(transactionPresistModel.getCustomerId()));
		}

		if (transactionPresistModel.getAttachmentFile()!=null) {
			//To save the uploaded file in db.
			MultipartFile file = transactionPresistModel.getAttachmentFile();
            FileAttachment fileAttachment = fileAttachmentService.storeTransactionFile(file, transactionPresistModel);
            trnx.setFileAttachment(fileAttachment);
        }
		transactionService.persist(trnx);
	}
	private Transaction updateTransactionWithCommonFields(TransactionPresistModel transactionPresistModel, int userId,
                                                          TransactionCreationMode mode, Transaction trnx) {

		if (transactionPresistModel.getTransactionId()!=null || trnx != null) {
			trnx = transactionService.findByPK(transactionPresistModel.getTransactionId());
		} else {
			trnx = new Transaction();
			transactionPresistModel.setIsValidForClosingBalance(true);
		}

		BigDecimal oldTransactionAmount = trnx.getTransactionAmount();
		BigDecimal newTransactionAmount = transactionPresistModel.getAmount();

		if (trnx.getTransactionExplinationStatusEnum()!=TransactionExplinationStatusEnum.FULL) {
			transactionPresistModel.setIsValidForClosingBalance(true);
		} else if (oldTransactionAmount.compareTo(newTransactionAmount) != 0) {
			transactionPresistModel.setIsValidForCurrentBalance(true);
			transactionPresistModel.setOldTransactionAmount(oldTransactionAmount);
		}

		if (transactionPresistModel.getExchangeRate()!=null){
			trnx.setExchangeRate(transactionPresistModel.getExchangeRate());
		}

		trnx.setLastUpdateBy(userId);
		//GrandFather daddu dadaji
		trnx.setCoaCategory(chartOfAccountCategoryService.findByPK(transactionPresistModel.getCoaCategoryId()));
		trnx.setTransactionAmount(transactionPresistModel.getAmount());
		trnx.setTransactionDueAmount(transactionPresistModel.getAmount());
		if (trnx.getCreationMode()!=null) {
			trnx.setCreationMode(mode);
		}
		trnx.setReferenceStr(transactionPresistModel.getReference());
		trnx.setTransactionExplinationStatusEnum(TransactionExplinationStatusEnum.FULL);
		if (transactionPresistModel.getDate() != null){
			Instant instant = Instant.ofEpochMilli(transactionPresistModel.getDate().getTime());
			LocalDateTime transactionDate = LocalDateTime.ofInstant(instant,
					ZoneId.systemDefault());
			trnx.setTransactionDate(transactionDate);
		}

		if(transactionPresistModel.getVatId() != null) {
			trnx.setVatCategory(vatCategoryService.findByPK(transactionPresistModel.getVatId()));
		}

		if(transactionPresistModel.getTransactionCategoryId()!=null) {
			//Pota Grandchild
			TransactionCategory transactionCategory = transactionCategoryService.findByPK(transactionPresistModel.getTransactionCategoryId());
			trnx.setExplainedTransactionCategory(transactionCategory);
		}
		return trnx;
	}
	/*
	 * This method will update the transaction for Money paid to user.
	 * Fields to update
	 * 1. Desc
	 * 2.
	 */
	private void updateTransactionMoneyPaidToUser(Transaction trnx, TransactionPresistModel transactionPresistModel) throws IOException {
		trnx.setDebitCreditFlag('D');
		if (transactionPresistModel.getDescription() != null) {
			trnx.setExplainedTransactionDescription(transactionPresistModel.getDescription());
		}
		if (transactionPresistModel.getEmployeeId() != null) {
			TransactionCategory transactionCategory = transactionCategoryService.findByPK(transactionPresistModel.getEmployeeId());
			trnx.setExplainedTransactionCategory(transactionCategory);
		}
		if (transactionPresistModel.getBankId() != null) {
			trnx.setBankAccount(bankService.findByPK(transactionPresistModel.getBankId()));
		}
		if (transactionPresistModel.getReference() != null
				&& !transactionPresistModel.getReference().isEmpty()) {
			trnx.setReferenceStr(transactionPresistModel.getReference());
		}
		if (transactionPresistModel.getAttachmentFile()!=null) {
			//To save the uploaded file in db.
			MultipartFile file = transactionPresistModel.getAttachmentFile();
            FileAttachment fileAttachment = fileAttachmentService.storeTransactionFile(file, transactionPresistModel);
            trnx.setFileAttachment(fileAttachment);
        }
		transactionService.persist(trnx);
	}

	/*
	 * This method will update the transaction for Money paid to user.
	 * Fields to update
	 * 1. Desc
	 * 2.
	 */
	private void clearAndUpdateTransaction(Transaction trnx, TransactionExplanation transactionExplanation)
	{
		trnx.setChartOfAccount(null);
		trnx.setExplainedTransactionDescription(null);
		trnx.setExplainationUser(null);
		trnx.setExplinationBankAccount(null);
		trnx.setExplainedTransactionCategory(null);
		trnx.setExplainedTransactionAttachmentFileName(null);
		trnx.setExplainedTransactionAttachmentPath(null);
		trnx.setExplainedTransactionAttachementDescription(null);
		trnx.setExplinationVendor(null);
		trnx.setExchangeRate(null);
		trnx.setExplinationCustomer(null);
		trnx.setExplinationEmployee(null);
		trnx.setCoaCategory(null);
		if (trnx.getTransactionDueAmount().compareTo(transactionExplanation.getPaidAmount()) == 0) {
			trnx.setTransactionDueAmount(trnx.getTransactionAmount());
			trnx.setTransactionExplinationStatusEnum(TransactionExplinationStatusEnum.NOT_EXPLAIN);
		}
		if (trnx.getTransactionDueAmount().compareTo(transactionExplanation.getPaidAmount()) != 0
                || !trnx.getTransactionDueAmount().equals(trnx.getTransactionAmount())) {
			trnx.setTransactionExplinationStatusEnum(TransactionExplinationStatusEnum.PARTIAL);
			trnx.setTransactionDueAmount(trnx.getTransactionDueAmount().add(transactionExplanation.getPaidAmount()));
		}
		if (trnx.getTransactionDueAmount().compareTo(trnx.getTransactionAmount()) == 0){
			trnx.setTransactionDueAmount(trnx.getTransactionAmount());
			trnx.setTransactionExplinationStatusEnum(TransactionExplinationStatusEnum.NOT_EXPLAIN);
		}
		transactionService.persist(trnx);
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete Transaction By ID")
	@DeleteMapping(value = "/delete")
	public ResponseEntity<String> deleteTransaction(@RequestParam(value = "id") Integer id) {
		Transaction trnx = transactionService.findByPK(id);
		if (trnx != null) {
			trnx.setDeleteFlag(Boolean.TRUE);
			transactionService.deleteTransaction(trnx);
		}
		return new ResponseEntity<>("Deleted successful", HttpStatus.OK);

	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete Transaction in Bulk")
	@DeleteMapping(value = "/deletes")
	public ResponseEntity<String> deleteTransactions(@RequestBody DeleteModel ids) {
		try {
			transactionService.deleteByIds(ids.getIds());
			return new ResponseEntity<>("Deleted successfully", HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Update Transaction Status")
	@PostMapping(value = "/changestatus")
	public ResponseEntity<String> updateTransactions(@RequestBody DeleteModel ids) {
		try {
			transactionService.updateStatusByIds(ids.getIds(),TransactionCreationMode.IMPORT);
			return new ResponseEntity<>("Transaction status mode updated successfully", HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@ApiOperation(value = "Get Transaction By ID")
	@GetMapping(value = "/getById")
	public ResponseEntity<List<TransactionPresistModel>> getInvoiceById(@RequestParam(value = "id") Integer id) {
		Transaction trnx = transactionService.findByPK(id);
		List<TransactionExplanation> transactionExplanationList = transactionExplanationRepository.
				getTransactionExplanationsByTransaction(trnx);
		//remove deleted records
		List<TransactionExplanation> sortedList = transactionExplanationList.stream().filter(transactionExplanation ->
				transactionExplanation.getDeleteFlag()!=null &&
                        transactionExplanation.getDeleteFlag()!=Boolean.TRUE).collect(Collectors.toList());
		if (trnx == null) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		} else {
			return new ResponseEntity<>(transactionHelper.getModel(trnx,sortedList), HttpStatus.OK);
		}
	}

	@LogRequest
	@Cacheable(cacheNames = "dashboardCashFlow", key = "#monthNo")
	@GetMapping(value = "/getCashFlow")
	public ResponseEntity<Object> getCashFlow(@RequestParam int monthNo) {
		try {
			long start = System.currentTimeMillis();
			Object obj = chartUtil.getCashFlow(transactionService.getCashInData(monthNo, null),
					transactionService.getCashOutData(monthNo, null));
			logger.info("[PERF] getCashFlow for {} months took {} ms", monthNo, System.currentTimeMillis() - start);
			return new ResponseEntity<>(obj, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@ApiOperation(value = "Get Explained Transaction Count")
	@GetMapping(value = "/getExplainedTransactionCount")
	public ResponseEntity<Integer> getExplainedTransactionCount(@RequestParam int bankAccountId){
		Integer response = transactionService.getTotalExplainedTransactionCountByBankAccountId(bankAccountId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Un explain Transaction", response = Transaction.class)
	@PostMapping(value = "/unexplain")
	public ResponseEntity<?> unExplainTransaction(@ModelAttribute TransactionPresistModel transactionPresistModel,
												  HttpServletRequest request) {
		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
		Transaction trnx = isValidTransactionToExplain(transactionPresistModel);
		TransactionExplanation transactionExplanation = transactionExplanationRepository.findById(transactionPresistModel.getExplanationId()).get();
		int chartOfAccountCategory = transactionExplanation.getCoaCategory().getChartOfAccountCategoryId();
		switch(ChartOfAccountCategoryIdEnumConstant.get(chartOfAccountCategory))
		{
//---------------------------------------Expense Chart of Account Category----------------------------------
			case EXPENSE:
				List<TransactionExpenses> transactionExpensesList = transactionExpensesService
						.findAllForTransactionExpenses(trnx.getTransactionId());
				/////////////////////////////////////////////////////////////////////////////////////////////////////////////
				transactionExplanation = transactionExplanationRepository.findById(transactionPresistModel.getExplanationId()).get();
				List<TransactionExplinationLineItem> transactionExplinationLineItems = transactionExplanationLineItemRepository.
						getTransactionExplinationLineItemsByTransactionExplanation(transactionExplanation);
				for (TransactionExplinationLineItem transactionExplinationLineItem:transactionExplinationLineItems){
					transactionExplinationLineItem.setDeleteFlag(Boolean.TRUE);
					transactionExplanationLineItemRepository.save(transactionExplinationLineItem);
				}
				transactionExplanation.setDeleteFlag(Boolean.TRUE);
				transactionExplanationRepository.save(transactionExplanation);
				/////////////////////////////////////////////////////////////////////////////////////////////////////////////
				if(transactionExpensesList!=null && !transactionExpensesList.isEmpty())
				{
					// create Reverse Journal entry for Expense
					TransactionExpenses transactionExpenses = transactionExpensesList.get(0);
					List<JournalLineItem> expenseJLIList= journalLineItemRepository.findAllByReferenceIdAndReferenceType(
							transactionExpenses.getExpense().getExpenseId(),
							PostingReferenceTypeEnum.EXPENSE);
					expenseJLIList = expenseJLIList.stream().filter(journalLineItem ->
							journalLineItem.getDeleteFlag().equals(Boolean.FALSE)).collect(Collectors.toList());
					List<JournalLineItem> reverseExpenseJournalLineItemList = new ArrayList<>();
					Journal reverseExpenseJournal = new Journal();
					for (JournalLineItem journalLineItem:expenseJLIList){
						JournalLineItem journalLineItem1 = new JournalLineItem();
						journalLineItem1.setTransactionCategory(journalLineItem.getTransactionCategory());
						if (journalLineItem.getDebitAmount()!=null && journalLineItem.getDebitAmount().compareTo(BigDecimal.ZERO) > 0) {
							journalLineItem1.setCreditAmount(journalLineItem.getDebitAmount());
						} else {
							journalLineItem1.setDebitAmount(journalLineItem.getCreditAmount());
						}
						journalLineItem1.setReferenceType(PostingReferenceTypeEnum.REVERSE_EXPENSE);
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
					reverseExpenseJournal.setPostingReferenceType(PostingReferenceTypeEnum.REVERSE_EXPENSE);
					reverseExpenseJournal.setJournalDate(LocalDate.now());
					reverseExpenseJournal.setTransactionDate(trnx.getTransactionDate().toLocalDate());
					reverseExpenseJournal.setDescription("Reverse Expense");
					journalService.persist(reverseExpenseJournal);
					if (transactionPresistModel.getExpenseCategory() != null
                            && transactionPresistModel.getExpenseCategory() == 34) {

						List<TransactionExpensesPayroll> transactionExpensesPayrollList = transactionExpensesPayrollService
								.findAllForTransactionExpenses(trnx.getTransactionId());

						for (TransactionExplinationLineItem transactionExpensesPayroll:transactionExplinationLineItems){
							//Create Reverse Journal Entries For Explained Payroll
							Journal journal = transactionExpensesPayroll.getJournal();
							Journal newjournal = new Journal();
							if (journal.getDeleteFlag()!=null && journal.getDeleteFlag().equals(Boolean.FALSE)) {
								newjournal.setCreatedBy(journal.getCreatedBy());
								newjournal.setPostingReferenceType(PostingReferenceTypeEnum.REVERSE_PAYROLL_EXPLAINED);
								newjournal.setDescription("Reverse Payroll");
								newjournal.setJournalDate(LocalDate.now());
								newjournal.setTransactionDate(LocalDate.now());
							}
                            Collection<JournalLineItem> journalLineItems = journal.getJournalLineItems();
                            Collection<JournalLineItem> newReverseJournalLineItemList = new ArrayList<>();
                            for (JournalLineItem journalLineItem : journalLineItems) {
                                JournalLineItem newReverseJournalLineItemEntry = new JournalLineItem();
                                newReverseJournalLineItemEntry.setTransactionCategory(journalLineItem.getTransactionCategory());
                                newReverseJournalLineItemEntry.setReferenceType(PostingReferenceTypeEnum.REVERSE_PAYROLL_EXPLAINED);
                                newReverseJournalLineItemEntry.setReferenceId(journalLineItem.getReferenceId());
                                newReverseJournalLineItemEntry.setExchangeRate(journalLineItem.getExchangeRate());
                                newReverseJournalLineItemEntry.setCreatedBy(journalLineItem.getCreatedBy());
                                newReverseJournalLineItemEntry.setCreatedDate(journalLineItem.getCreatedDate());
                                newReverseJournalLineItemEntry.setDescription(journalLineItem.getDescription());
                                newReverseJournalLineItemEntry.setDeleteFlag(journalLineItem.getDeleteFlag());

                                newReverseJournalLineItemEntry.setDebitAmount(journalLineItem.getCreditAmount());
                                newReverseJournalLineItemEntry.setCreditAmount(journalLineItem.getDebitAmount());;
                                newReverseJournalLineItemEntry.setJournal(newjournal);
                                newReverseJournalLineItemList.add(newReverseJournalLineItemEntry);
                            }
                            journal.setDeleteFlag(Boolean.TRUE);
                            journalService.update(journal);
                            newjournal.setJournalLineItems(newReverseJournalLineItemList);
                            journalService.persist(newjournal);
						}
						unExplainPayrollExpenses(transactionExpensesPayrollList,trnx,transactionExpensesList,transactionExplanation);
					} else {
						unExplainExpenses(transactionExpensesList,trnx,transactionExplanation);
					}
				} else {
                    for (TransactionExplinationLineItem transactionExplinationLineItem : transactionExplinationLineItems) {
                        if (transactionExplinationLineItem.getReferenceType().equals(PostingReferenceTypeEnum.INVOICE)) {
                            Map<String, Object> param = new HashMap<>();
                            Invoice invoice = invoiceService.findByPK(transactionExplinationLineItem.getReferenceId());
                            param.put("supplierInvoice", invoice);
                            param.put("transaction", trnx);
                            List<SupplierInvoicePayment> supplierInvoicePaymentList = supplierInvoicePaymentService.findByAttributes(param);
                            PostingReferenceTypeEnum postingReferenceTypeEnum = null;
                            List<JournalLineItem> paymentJLIList = null;
                            paymentJLIList = journalLineItemRepository.findAllByReferenceIdAndReferenceType(
                                    trnx.getTransactionId(), PostingReferenceTypeEnum.PAYMENT);
                            postingReferenceTypeEnum = PostingReferenceTypeEnum.REVERSE_PAYMENT;
                            if (paymentJLIList.isEmpty()) {
                                paymentJLIList = journalLineItemRepository.findAllByReferenceIdAndReferenceType(
                                        trnx.getTransactionId(), PostingReferenceTypeEnum.BANK_PAYMENT);
                                postingReferenceTypeEnum = PostingReferenceTypeEnum.REVERSE_BANK_PAYMENT;
                            }
                            paymentJLIList = paymentJLIList.stream().filter(journalLineItem ->
                                    journalLineItem.getDeleteFlag().equals(Boolean.FALSE)).collect(Collectors.toList());
                            List<JournalLineItem> reversePaymentJournalLineItemList = new ArrayList<>();
                            Journal reversePaymentJournal = new Journal();
                            for (JournalLineItem journalLineItem : paymentJLIList) {
                                JournalLineItem journalLineItem1 = new JournalLineItem();
                                journalLineItem1.setTransactionCategory(journalLineItem.getTransactionCategory());
                                if (journalLineItem.getDebitAmount() != null
                                        && journalLineItem.getDebitAmount().compareTo(BigDecimal.ZERO) > 0) {
                                    journalLineItem1.setCreditAmount(journalLineItem.getDebitAmount());
                                } else {
                                    journalLineItem1.setDebitAmount(journalLineItem.getCreditAmount());
                                }
                                journalLineItem1.setReferenceType(postingReferenceTypeEnum);
                                journalLineItem1.setReferenceId(journalLineItem.getReferenceId());
                                journalLineItem1.setExchangeRate(journalLineItem.getExchangeRate());
                                journalLineItem1.setCreatedBy(journalLineItem.getCreatedBy());
                                journalLineItem1.setJournal(reversePaymentJournal);
                                reversePaymentJournalLineItemList.add(journalLineItem1);

                                journalLineItem.setDeleteFlag(Boolean.TRUE);
                                Journal deleteJournal = journalLineItem.getJournal();
                                deleteJournal.setDeleteFlag(Boolean.TRUE);
                                journalService.update(deleteJournal);
                            }
                            if (!paymentJLIList.isEmpty()) {
                                reversePaymentJournal.setJournalLineItems(reversePaymentJournalLineItemList);
                                reversePaymentJournal.setCreatedBy(userId);
                                reversePaymentJournal.setPostingReferenceType(postingReferenceTypeEnum);
                                reversePaymentJournal.setJournalDate(LocalDate.now());
                                reversePaymentJournal.setTransactionDate(trnx.getTransactionDate().toLocalDate());
                                journalService.persist(reversePaymentJournal);
                            }
//filter Deleted Records
                            List<SupplierInvoicePayment> supplierInvoicePayments = supplierInvoicePaymentList.stream().
                                    filter(supplierInvoicePayment -> supplierInvoicePayment.getDeleteFlag() != null &&
                                            supplierInvoicePayment.getDeleteFlag().equals(Boolean.FALSE)).collect(Collectors.toList());
                            for (SupplierInvoicePayment supplierInvoiceReceipt : supplierInvoicePayments) {
//Delete payment

                                BigDecimal invoiceDueAmountToFill = supplierInvoiceReceipt.getPaidAmount();
                                invoice.setDueAmount(invoice.getDueAmount().add(invoiceDueAmountToFill));
                                if (invoice.getDueAmount().floatValue() != 0f
                                        && invoice.getDueAmount().floatValue() != invoice.getTotalAmount().floatValue()) {
                                    invoice.setStatus(CommonStatusEnum.PARTIALLY_PAID.getValue());
                                } else {
                                    invoice.setStatus(CommonStatusEnum.POST.getValue());
                                }
                                invoiceService.update(invoice);
                                Payment supplierPayment = supplierInvoiceReceipt.getPayment();
                                supplierPayment.setDeleteFlag(Boolean.TRUE);
                                paymentService.update(supplierPayment);
                                supplierInvoiceReceipt.setDeleteFlag(Boolean.TRUE);
                                supplierInvoicePaymentService.update(supplierInvoiceReceipt);
                            }
                        } else {
                            CreditNote creditNote = creditNoteRepository.findById(transactionExplinationLineItem.getReferenceId()).get();
                            PostingReferenceTypeEnum postingReferenceTypeEnum = null;
                            List<JournalLineItem> cnJLIList = null;
                            cnJLIList = journalLineItemRepository.findAllByReferenceIdAndReferenceTypeAndAmount(
                                    creditNote.getCreditNoteId(), PostingReferenceTypeEnum.REFUND.toString(),
                                    transactionPresistModel.getAmount());
                            postingReferenceTypeEnum = PostingReferenceTypeEnum.CANCEL_REFUND;

                            cnJLIList = cnJLIList.stream().filter(journalLineItem ->
                                    journalLineItem.getDeleteFlag().equals(Boolean.FALSE)).collect(Collectors.toList());
                            List<JournalLineItem> reverseReceiptJournalLineItemList = new ArrayList<>();
                            Journal reverseReceiptJournal = new Journal();
                            for (JournalLineItem journalLineItem : cnJLIList) {
                                JournalLineItem journalLineItem1 = new JournalLineItem();
                                journalLineItem1.setTransactionCategory(journalLineItem.getTransactionCategory());
                                if (journalLineItem.getDebitAmount() != null
                                        && journalLineItem.getDebitAmount().compareTo(BigDecimal.ZERO) > 0) {
                                    journalLineItem1.setCreditAmount(journalLineItem.getDebitAmount());
                                } else {
                                    journalLineItem1.setDebitAmount(journalLineItem.getCreditAmount());
                                }
                                journalLineItem1.setReferenceType(postingReferenceTypeEnum);
                                journalLineItem1.setExchangeRate(journalLineItem.getExchangeRate());
                                journalLineItem1.setReferenceId(journalLineItem.getReferenceId());
                                journalLineItem1.setCreatedBy(journalLineItem.getCreatedBy());
                                journalLineItem1.setExchangeRate(journalLineItem.getExchangeRate());
                                journalLineItem1.setJournal(reverseReceiptJournal);
                                reverseReceiptJournalLineItemList.add(journalLineItem1);

                                journalLineItem.setDeleteFlag(Boolean.TRUE);
                                Journal deleteJournal = journalLineItem.getJournal();
                                deleteJournal.setDeleteFlag(Boolean.TRUE);
                                journalService.update(deleteJournal);
                            }
                            if (!cnJLIList.isEmpty()) {
                                reverseReceiptJournal.setJournalLineItems(reverseReceiptJournalLineItemList);
                                reverseReceiptJournal.setCreatedBy(userId);
                                reverseReceiptJournal.setPostingReferenceType(postingReferenceTypeEnum);
                                reverseReceiptJournal.setJournalDate(LocalDate.now());
                                reverseReceiptJournal.setTransactionDate(trnx.getTransactionDate().toLocalDate());
                                journalService.persist(reverseReceiptJournal);
                            }
//deleted records filter
                            BigDecimal invoiceDueAmountToFill = transactionExplanation.getPaidAmount();
                            creditNote.setDueAmount(creditNote.getDueAmount().add(invoiceDueAmountToFill));
                            if ((creditNote.getDueAmount()).compareTo(creditNote.getTotalAmount()) == 0) {
                                creditNote.setStatus(CommonStatusEnum.OPEN.getValue());
                            } else {
                                creditNote.setStatus(CommonStatusEnum.PARTIALLY_PAID.getValue());
                            }
                            creditNoteRepository.save(creditNote);
                        }
                    }
                    clearAndUpdateTransaction(trnx,transactionExplanation);
				}
				break;
			case MONEY_PAID_TO_USER:
			case TRANSFERD_TO:
			case MONEY_SPENT:
			case MONEY_SPENT_OTHERS:
			case PURCHASE_OF_CAPITAL_ASSET:
			case TRANSFER_FROM:
			case REFUND_RECEIVED:
			case INTEREST_RECEVIED:
			case DISPOSAL_OF_CAPITAL_ASSET:
			case MONEY_RECEIVED_FROM_USER:
			case MONEY_RECEIVED_OTHERS:
                VatPayment vatPayment = vatPaymentRepository.getVatPaymentByTransactionId(trnx.getTransactionId());
				/////////////////////////////////////////////////////////////////////////////////////////////////////////////
				transactionExplanation = transactionExplanationRepository.findById(transactionPresistModel.getExplanationId()).get();
				transactionExplinationLineItems = transactionExplanationLineItemRepository.
						getTransactionExplinationLineItemsByTransactionExplanation(transactionExplanation);
				for (TransactionExplinationLineItem transactionExplinationLineItem:transactionExplinationLineItems){
					transactionExplinationLineItem.setDeleteFlag(Boolean.TRUE);
					transactionExplanationLineItemRepository.save(transactionExplinationLineItem);
				}
				transactionExplanation.setDeleteFlag(Boolean.TRUE);
				transactionExplanationRepository.save(transactionExplanation);
				/////////////////////////////////////////////////////////////////////////////////////////////////////////////
				CorporateTaxPayment corporateTaxPayment = corporateTaxPaymentRepository
                        .findCorporateTaxPaymentByTransactionAndDeleteFlag(trnx,Boolean.FALSE);
				if (corporateTaxPayment!=null){
					//Reverse Tax Payment Journal Entries
						List<JournalLineItem> taxPaymentJLIList= journalLineItemRepository.findAllByReferenceIdAndReferenceType(
								corporateTaxPayment.getId(),PostingReferenceTypeEnum.CORPORATE_TAX_PAYMENT);
						taxPaymentJLIList = taxPaymentJLIList.stream().filter(journalLineItem ->
								journalLineItem.getDeleteFlag().equals(Boolean.FALSE)).collect(Collectors.toList());
						List<JournalLineItem> reverseTaxPaymentJournalLineItemList = new ArrayList<>();
						Journal reverseTaxPaymentJournal = new Journal();
						for (JournalLineItem journalLineItem:taxPaymentJLIList){
							JournalLineItem journalLineItem1 = new JournalLineItem();
							journalLineItem1.setTransactionCategory(journalLineItem.getTransactionCategory());
							if (journalLineItem.getDebitAmount()!=null && journalLineItem.getDebitAmount().compareTo(BigDecimal.ZERO) > 0) {
								journalLineItem1.setCreditAmount(journalLineItem.getDebitAmount());
							} else {
								journalLineItem1.setDebitAmount(journalLineItem.getCreditAmount());
							}
							journalLineItem1.setReferenceType(PostingReferenceTypeEnum.REVERSE_CORPORATE_TAX_PAYMENT);
							journalLineItem1.setReferenceId(journalLineItem.getReferenceId());
							journalLineItem1.setExchangeRate(journalLineItem.getExchangeRate());
							journalLineItem1.setCreatedBy(journalLineItem.getCreatedBy());
							journalLineItem1.setJournal(reverseTaxPaymentJournal);
							reverseTaxPaymentJournalLineItemList.add(journalLineItem1);

							journalLineItem.setDeleteFlag(Boolean.TRUE);
							Journal deleteJournal = journalLineItem.getJournal();
							deleteJournal.setDeleteFlag(Boolean.TRUE);
							journalService.update(deleteJournal);
						}
						reverseTaxPaymentJournal.setJournalLineItems(reverseTaxPaymentJournalLineItemList);
						reverseTaxPaymentJournal.setCreatedBy(userId);
						reverseTaxPaymentJournal.setPostingReferenceType(PostingReferenceTypeEnum.REVERSE_CORPORATE_TAX_PAYMENT);
						reverseTaxPaymentJournal.setJournalDate(LocalDate.now());
						reverseTaxPaymentJournal.setTransactionDate(trnx.getTransactionDate().toLocalDate());
						journalService.persist(reverseTaxPaymentJournal);

					CorporateTaxPaymentHistory corporateTaxPaymentHistory = corporateTaxPaymentHistoryRepository
                            .findCorporateTaxPaymentHistoryByCorporateTaxPayment(corporateTaxPayment);
					if (corporateTaxPaymentHistory!=null){
						corporateTaxPaymentHistoryRepository.delete(corporateTaxPaymentHistory);
					}
					CorporateTaxFiling corporateTaxFiling = corporateTaxPayment.getCorporateTaxFiling();
					corporateTaxFiling.setBalanceDue(corporateTaxFiling.getBalanceDue().add(corporateTaxPayment.getAmountPaid()));
					if (!corporateTaxFiling.getTaxAmount().equals(corporateTaxFiling.getBalanceDue())){
						corporateTaxFiling.setStatus(CommonStatusEnum.PARTIALLY_PAID.getValue());
					} else {
						corporateTaxFiling.setStatus(CommonStatusEnum.FILED.getValue());
					}
					corporateTaxFilingRepository.save(corporateTaxFiling);
					corporateTaxPayment.setDeleteFlag(Boolean.TRUE);
					corporateTaxPaymentRepository.delete(corporateTaxPayment);
				}
				else if (vatPayment!=null)
				{
					//Reverse Tax Payment Journal Entries
					if (vatPayment.getIsVatReclaimable().equals(Boolean.FALSE)){
						List<JournalLineItem> taxPaymentJLIList= journalLineItemRepository.findAllByReferenceIdAndReferenceType(
								vatPayment.getId(),PostingReferenceTypeEnum.VAT_PAYMENT);
						taxPaymentJLIList = taxPaymentJLIList.stream().filter(journalLineItem ->
								journalLineItem.getDeleteFlag().equals(Boolean.FALSE)).collect(Collectors.toList());
						List<JournalLineItem> reverseTaxPaymentJournalLineItemList = new ArrayList<>();
						Journal reverseTaxPaymentJournal = new Journal();
						for (JournalLineItem journalLineItem:taxPaymentJLIList){
							JournalLineItem journalLineItem1 = new JournalLineItem();
							journalLineItem1.setTransactionCategory(journalLineItem.getTransactionCategory());
							if (journalLineItem.getDebitAmount()!=null
                                    && journalLineItem.getDebitAmount().compareTo(BigDecimal.ZERO) > 0) {
								journalLineItem1.setCreditAmount(journalLineItem.getDebitAmount());
							} else {
								journalLineItem1.setDebitAmount(journalLineItem.getCreditAmount());
							}
							journalLineItem1.setReferenceType(PostingReferenceTypeEnum.REVERSE_VAT_PAYMENT);
							journalLineItem1.setReferenceId(journalLineItem.getReferenceId());
							journalLineItem1.setExchangeRate(journalLineItem.getExchangeRate());
							journalLineItem1.setCreatedBy(journalLineItem.getCreatedBy());
							journalLineItem1.setJournal(reverseTaxPaymentJournal);
							reverseTaxPaymentJournalLineItemList.add(journalLineItem1);

							journalLineItem.setDeleteFlag(Boolean.TRUE);
							Journal deleteJournal = journalLineItem.getJournal();
							deleteJournal.setDeleteFlag(Boolean.TRUE);
							journalService.update(deleteJournal);
						}
						reverseTaxPaymentJournal.setJournalLineItems(reverseTaxPaymentJournalLineItemList);
						reverseTaxPaymentJournal.setCreatedBy(userId);
						reverseTaxPaymentJournal.setPostingReferenceType(PostingReferenceTypeEnum.REVERSE_VAT_PAYMENT);
						reverseTaxPaymentJournal.setJournalDate(LocalDate.now());
						reverseTaxPaymentJournal.setTransactionDate(trnx.getTransactionDate().toLocalDate());
						journalService.persist(reverseTaxPaymentJournal);
					}
					else {
						//Reverse Tax Claim Journal Entries
						List<JournalLineItem> taxClaimJLIList= journalLineItemRepository.findAllByReferenceIdAndReferenceType(
								vatPayment.getId(),PostingReferenceTypeEnum.VAT_CLAIM);
						taxClaimJLIList = taxClaimJLIList.stream().filter(journalLineItem ->
								journalLineItem.getDeleteFlag().equals(Boolean.FALSE)).collect(Collectors.toList());
						List<JournalLineItem> reverseTaxClaimJournalLineItemList = new ArrayList<>();
						Journal reverseTaxClaimJournal = new Journal();
						for (JournalLineItem journalLineItem:taxClaimJLIList){
							JournalLineItem journalLineItem1 = new JournalLineItem();
							journalLineItem1.setTransactionCategory(journalLineItem.getTransactionCategory());
							if (journalLineItem.getDebitAmount()!=null && journalLineItem.getDebitAmount().compareTo(BigDecimal.ZERO) > 0) {
								journalLineItem1.setCreditAmount(journalLineItem.getDebitAmount());
							} else {
								journalLineItem1.setDebitAmount(journalLineItem.getCreditAmount());
							}
							journalLineItem1.setReferenceType(PostingReferenceTypeEnum.REVERSE_VAT_CLAIM);
							journalLineItem1.setReferenceId(journalLineItem.getReferenceId());
							journalLineItem1.setExchangeRate(journalLineItem.getExchangeRate());
							journalLineItem1.setCreatedBy(journalLineItem.getCreatedBy());
							journalLineItem1.setJournal(reverseTaxClaimJournal);
							reverseTaxClaimJournalLineItemList.add(journalLineItem1);

							journalLineItem.setDeleteFlag(Boolean.TRUE);
							Journal deleteJournal = journalLineItem.getJournal();
							deleteJournal.setDeleteFlag(Boolean.TRUE);
							journalService.update(deleteJournal);
						}
						reverseTaxClaimJournal.setJournalLineItems(reverseTaxClaimJournalLineItemList);
						reverseTaxClaimJournal.setCreatedBy(userId);
						reverseTaxClaimJournal.setPostingReferenceType(PostingReferenceTypeEnum.REVERSE_VAT_CLAIM);
						reverseTaxClaimJournal.setJournalDate(LocalDate.now());
						reverseTaxClaimJournal.setTransactionDate(trnx.getTransactionDate().toLocalDate());
						journalService.persist(reverseTaxClaimJournal);
					}
					VatRecordPaymentHistory vatRecordPaymentHistory = vatRecordPaymentHistoryRepository.getByVatPaymentId(vatPayment.getId());
					if (vatRecordPaymentHistory!=null){
						vatRecordPaymentHistory.setDeleteFlag(Boolean.TRUE);
						vatRecordPaymentHistoryRepository.delete(vatRecordPaymentHistory);
					}
					VatReportFiling vatReportFiling = vatPayment.getVatReportFiling();
					vatReportFiling.setBalanceDue(vatReportFiling.getBalanceDue().add(vatPayment.getAmount()));
					if (vatReportFiling.getIsVatReclaimable().equals(Boolean.FALSE)
                            && !vatReportFiling.getTotalTaxPayable().equals(vatReportFiling.getBalanceDue())) {
						vatReportFiling.setStatus(CommonStatusEnum.PARTIALLY_PAID.getValue());
					}
					else {
						vatReportFiling.setStatus(CommonStatusEnum.FILED.getValue());
					}
					vatReportFilingRepository.save(vatReportFiling);
					vatPayment.setDeleteFlag(Boolean.TRUE);
					vatPaymentRepository.delete(vatPayment);
				}else {
					//Reverse Transactions Journal Entries
					List<JournalLineItem> transactionReconcileJLIList= journalLineItemRepository.findAllByReferenceIdAndReferenceType(
							trnx.getTransactionId(),PostingReferenceTypeEnum.TRANSACTION_RECONSILE);
					transactionReconcileJLIList = transactionReconcileJLIList.stream().filter(journalLineItem ->
							journalLineItem.getDeleteFlag().equals(Boolean.FALSE)).collect(Collectors.toList());
					List<JournalLineItem> reverseTransactionReconcileJournalLineItemList = new ArrayList<>();
					Journal reverseTransactionReconcileJournal = new Journal();
					for (JournalLineItem journalLineItem:transactionReconcileJLIList){
						JournalLineItem journalLineItem1 = new JournalLineItem();
						journalLineItem1.setTransactionCategory(journalLineItem.getTransactionCategory());
						if (journalLineItem.getDebitAmount()!=null
                                && journalLineItem.getDebitAmount().compareTo(BigDecimal.ZERO) > 0) {
							journalLineItem1.setCreditAmount(journalLineItem.getDebitAmount());
						} else {
							journalLineItem1.setDebitAmount(journalLineItem.getCreditAmount());
						}
						journalLineItem1.setReferenceType(PostingReferenceTypeEnum.REVERSE_TRANSACTION_RECONSILE);
						journalLineItem1.setReferenceId(journalLineItem.getReferenceId());
						journalLineItem1.setExchangeRate(journalLineItem.getExchangeRate());
						journalLineItem1.setCreatedBy(journalLineItem.getCreatedBy());
						journalLineItem1.setJournal(reverseTransactionReconcileJournal);
						reverseTransactionReconcileJournalLineItemList.add(journalLineItem1);

						journalLineItem.setDeleteFlag(Boolean.TRUE);
						Journal deleteJournal = journalLineItem.getJournal();
						deleteJournal.setDeleteFlag(Boolean.TRUE);
						journalService.update(deleteJournal);
					}
					reverseTransactionReconcileJournal.setJournalLineItems(reverseTransactionReconcileJournalLineItemList);
					reverseTransactionReconcileJournal.setCreatedBy(userId);
					reverseTransactionReconcileJournal.setPostingReferenceType(PostingReferenceTypeEnum.REVERSE_TRANSACTION_RECONSILE);
					reverseTransactionReconcileJournal.setJournalDate(LocalDate.now());
					reverseTransactionReconcileJournal.setTransactionDate(trnx.getTransactionDate().toLocalDate());
					journalService.persist(reverseTransactionReconcileJournal);
				}
				clearAndUpdateTransaction(trnx,transactionExplanation);
				break;
			//-----------------------------------------------------Sales Chart of Account Category-----------------------------------------
			case SALES:
				// Customer Invoices
				transactionExplanation = transactionExplanationRepository.findById(transactionPresistModel.getExplanationId()).get();
				transactionExplinationLineItems = transactionExplanationLineItemRepository.
						getTransactionExplinationLineItemsByTransactionExplanation(transactionExplanation);
				for (TransactionExplinationLineItem transactionExplinationLineItem:transactionExplinationLineItems){
					transactionExplinationLineItem.setDeleteFlag(Boolean.TRUE);
					transactionExplanationLineItemRepository.save(transactionExplinationLineItem);
				}
				transactionExplanation.setDeleteFlag(Boolean.TRUE);
				transactionExplanationRepository.save(transactionExplanation);

                for (TransactionExplinationLineItem transactionExplinationLineItem : transactionExplinationLineItems) {
                    if (transactionExplinationLineItem.getReferenceType().equals(PostingReferenceTypeEnum.INVOICE)) {
                        Map<String, Object> param = new HashMap<>();
                        Invoice invoice = invoiceService.findByPK(transactionExplinationLineItem.getReferenceId());
                        param.put("customerInvoice", invoice);
                        param.put("transaction", trnx);
                        List<CustomerInvoiceReceipt> customerInvoiceReceiptList = customerInvoiceReceiptService.findByAttributes(param);
                        PostingReferenceTypeEnum postingReferenceTypeEnum = null;
                        List<JournalLineItem> receiptJLIList = null;
                        receiptJLIList = journalLineItemRepository.findAllByReferenceIdAndReferenceType(
                                trnx.getTransactionId(), PostingReferenceTypeEnum.RECEIPT);
                        postingReferenceTypeEnum = PostingReferenceTypeEnum.REVERSE_RECEIPT;
                        if (receiptJLIList.isEmpty()) {
                            receiptJLIList = journalLineItemRepository.findAllByReferenceIdAndReferenceType(
                                    trnx.getTransactionId(), PostingReferenceTypeEnum.BANK_RECEIPT);
                            postingReferenceTypeEnum = PostingReferenceTypeEnum.REVERSE_BANK_RECEIPT;
                        }
                        receiptJLIList = receiptJLIList.stream().filter(journalLineItem ->
                                journalLineItem.getDeleteFlag().equals(Boolean.FALSE)).collect(Collectors.toList());
                        List<JournalLineItem> reverseReceiptJournalLineItemList = new ArrayList<>();
                        Journal reverseReceiptJournal = new Journal();
                        for (JournalLineItem journalLineItem : receiptJLIList) {
                            JournalLineItem journalLineItem1 = new JournalLineItem();
                            journalLineItem1.setTransactionCategory(journalLineItem.getTransactionCategory());
                            if (journalLineItem.getDebitAmount() != null && journalLineItem.getDebitAmount().compareTo(BigDecimal.ZERO) > 0) {
                                journalLineItem1.setCreditAmount(journalLineItem.getDebitAmount());
                            } else {
                                journalLineItem1.setDebitAmount(journalLineItem.getCreditAmount());
                            }
                            journalLineItem1.setReferenceType(postingReferenceTypeEnum);
                            journalLineItem1.setExchangeRate(journalLineItem.getExchangeRate());
                            journalLineItem1.setReferenceId(journalLineItem.getReferenceId());
                            journalLineItem1.setCreatedBy(journalLineItem.getCreatedBy());
                            journalLineItem1.setExchangeRate(journalLineItem.getExchangeRate());
                            journalLineItem1.setJournal(reverseReceiptJournal);
                            reverseReceiptJournalLineItemList.add(journalLineItem1);

                            journalLineItem.setDeleteFlag(Boolean.TRUE);
                            Journal deleteJournal = journalLineItem.getJournal();
                            deleteJournal.setDeleteFlag(Boolean.TRUE);
                            journalService.update(deleteJournal);
                        }
                        if (!receiptJLIList.isEmpty()) {
                            reverseReceiptJournal.setJournalLineItems(reverseReceiptJournalLineItemList);
                            reverseReceiptJournal.setCreatedBy(userId);
                            reverseReceiptJournal.setPostingReferenceType(postingReferenceTypeEnum);
                            reverseReceiptJournal.setJournalDate(LocalDate.now());
                            reverseReceiptJournal.setTransactionDate(trnx.getTransactionDate().toLocalDate());
                            journalService.persist(reverseReceiptJournal);
                        }
//deleted records filter
                        List<CustomerInvoiceReceipt> customerInvoiceReceipts = customerInvoiceReceiptList.stream().filter
                                (customerInvoiceReceipt -> customerInvoiceReceipt.getDeleteFlag() != null &&
                                        customerInvoiceReceipt.getDeleteFlag().equals(Boolean.FALSE)).collect(Collectors.toList());
                        for (CustomerInvoiceReceipt customerInvoiceReceipt : customerInvoiceReceipts) {
                            customerInvoiceReceipt.setDeleteFlag(Boolean.TRUE);
                            customerInvoiceReceiptService.update(customerInvoiceReceipt);
//Delete Customer Made payment
                            customerInvoiceReceipt.getReceipt().setDeleteFlag(Boolean.TRUE);
                            receiptService.update(customerInvoiceReceipt.getReceipt());
                            BigDecimal invoiceDueAmountToFill = customerInvoiceReceipt.getPaidAmount();
                            invoice.setDueAmount(invoice.getDueAmount().add(invoiceDueAmountToFill));
                            if (invoice.getDueAmount().floatValue() != 0f
                                    && invoice.getDueAmount().floatValue() != invoice.getTotalAmount().floatValue()) {
                                invoice.setStatus(CommonStatusEnum.PARTIALLY_PAID.getValue());
                            } else {
                                invoice.setStatus(CommonStatusEnum.POST.getValue());
                            }
                            invoiceService.update(invoice);
                        }
                    } else {
                        CreditNote creditNote = creditNoteRepository.findById(transactionExplinationLineItem.getReferenceId()).get();
                        PostingReferenceTypeEnum postingReferenceTypeEnum = null;
                        List<JournalLineItem> cnJLIList = null;
                        cnJLIList = journalLineItemRepository.findAllByReferenceIdAndReferenceTypeAndAmount(
                                creditNote.getCreditNoteId(), PostingReferenceTypeEnum.REFUND.toString(), transactionPresistModel.getAmount());
                        postingReferenceTypeEnum = PostingReferenceTypeEnum.CANCEL_REFUND;

                        cnJLIList = cnJLIList.stream().filter(journalLineItem ->
                                journalLineItem.getDeleteFlag().equals(Boolean.FALSE)).collect(Collectors.toList());
                        List<JournalLineItem> reverseReceiptJournalLineItemList = new ArrayList<>();
                        Journal reverseReceiptJournal = new Journal();
                        for (JournalLineItem journalLineItem : cnJLIList) {
                            JournalLineItem journalLineItem1 = new JournalLineItem();
                            journalLineItem1.setTransactionCategory(journalLineItem.getTransactionCategory());
                            if (journalLineItem.getDebitAmount() != null
                                    && journalLineItem.getDebitAmount().compareTo(BigDecimal.ZERO) > 0) {
                                journalLineItem1.setCreditAmount(journalLineItem.getDebitAmount());
                            } else {
                                journalLineItem1.setDebitAmount(journalLineItem.getCreditAmount());
                            }
                            journalLineItem1.setReferenceType(postingReferenceTypeEnum);
                            journalLineItem1.setExchangeRate(journalLineItem.getExchangeRate());
                            journalLineItem1.setReferenceId(journalLineItem.getReferenceId());
                            journalLineItem1.setCreatedBy(journalLineItem.getCreatedBy());
                            journalLineItem1.setExchangeRate(journalLineItem.getExchangeRate());
                            journalLineItem1.setJournal(reverseReceiptJournal);
                            reverseReceiptJournalLineItemList.add(journalLineItem1);

                            journalLineItem.setDeleteFlag(Boolean.TRUE);
                            Journal deleteJournal = journalLineItem.getJournal();
                            deleteJournal.setDeleteFlag(Boolean.TRUE);
                            journalService.update(deleteJournal);
                        }
                        if (!cnJLIList.isEmpty()) {
                            reverseReceiptJournal.setJournalLineItems(reverseReceiptJournalLineItemList);
                            reverseReceiptJournal.setCreatedBy(userId);
                            reverseReceiptJournal.setPostingReferenceType(postingReferenceTypeEnum);
                            reverseReceiptJournal.setJournalDate(LocalDate.now());
                            reverseReceiptJournal.setTransactionDate(trnx.getTransactionDate().toLocalDate());
                            journalService.persist(reverseReceiptJournal);
                        }
//deleted records filter
                        BigDecimal invoiceDueAmountToFill = transactionExplanation.getPaidAmount();
                        creditNote.setDueAmount(creditNote.getDueAmount().add(invoiceDueAmountToFill));
                        if ((creditNote.getDueAmount()).compareTo(creditNote.getTotalAmount()) == 0) {
                            creditNote.setStatus(CommonStatusEnum.OPEN.getValue());
                        } else {
                            creditNote.setStatus(CommonStatusEnum.PARTIALLY_PAID.getValue());
                        }
                        creditNoteRepository.save(creditNote);
                    }
                }
                clearAndUpdateTransaction(trnx,transactionExplanation);
				break;
			default:
				return new ResponseEntity<>("Chart of Category Id not sent correctly", HttpStatus.OK);
		}
		return new ResponseEntity<>("Transaction Un Explained Successfully", HttpStatus.OK);
	}
	@LogRequest
	@ApiOperation(value = "Get first created transaction date")
	@GetMapping(value = "/getTransactionDate")
	public ResponseEntity<?> getFirstTransactionDate() {
		Transaction transaction = transactionRepository.getFirstRecord();
		if (transaction != null) {
			return new ResponseEntity<>(transaction.getTransactionDate(), HttpStatus.OK);
		} else {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}
}
