package com.simpleaccounts.rest.receiptcontroller;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

import javax.servlet.http.HttpServletRequest;

import com.simpleaccounts.constant.*;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.repository.ReceiptCreditNoteRelationRepository;
import com.simpleaccounts.repository.TransactionExplanationRepository;
import com.simpleaccounts.rest.creditnotecontroller.CreditNoteRepository;
import com.simpleaccounts.service.*;
import com.simpleaccounts.service.bankaccount.TransactionService;
import com.simpleaccounts.service.bankaccount.TransactionStatusService;
import com.simpleaccounts.utils.DateFormatUtil;
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
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.bank.model.DeleteModel;
import com.simpleaccounts.constant.dbfilter.ReceiptFilterEnum;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.PostingRequestModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.utils.FileHelper;
import org.json.JSONObject;
import io.swagger.annotations.ApiOperation;

/**
 * @author $@urabh : For Customer invoice
 */
@RestController
@RequestMapping("/rest/receipt")
public class ReceiptController {

	private final Logger logger = LoggerFactory.getLogger(ReceiptController.class);

	@Autowired
	private DateFormatUtil dateFormtUtil;
	@Autowired
	private ReceiptService receiptService;

	@Autowired
	private ReceiptRestHelper receiptRestHelper;

	@Autowired
	private ContactService contactService;

	@Autowired
	private InvoiceService invoiceService;

	@Autowired
	private JwtTokenUtil jwtTokenUtil;

	@Autowired
	private CustomerInvoiceReceiptService customerInvoiceReceiptService;

	@Autowired
	private JournalService journalService;

	@Autowired
	private FileHelper fileHelper;

	@Autowired
	private UserService userService;

	@Autowired
	private BankAccountService bankAccountService;

	@Autowired
	private TransactionService transactionService;

	@Autowired
	private TransactionStatusService transactionStatusService;

	@Autowired
	private ChartOfAccountCategoryService chartOfAccountCategoryService;

	@Autowired
	private CreditNoteRepository creditNoteRepository;

	@Autowired
	private ReceiptCreditNoteRelationRepository receiptCreditNoteRelationRepository;

	@Autowired
	private TransactionExplanationRepository transactionExplanationRepository;

	@LogRequest
	@ApiOperation(value = "Get receipt List")
	@GetMapping(value = "/getList")
	public ResponseEntity<PaginationResponseModel> getList(ReceiptRequestFilterModel filterModel, HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			User user = userService.findByPK(userId);
			Map<ReceiptFilterEnum, Object> filterDataMap = new EnumMap<>(ReceiptFilterEnum.class);
			if(user.getRole().getRoleCode()!=1) {
				filterDataMap.put(ReceiptFilterEnum.USER_ID, filterModel.getUserId());
			}
			if (filterModel.getContactId() != null) {
				filterDataMap.put(ReceiptFilterEnum.CONTACT, contactService.findByPK(filterModel.getContactId()));
			}
			if (filterModel.getInvoiceId() != null) {
				filterDataMap.put(ReceiptFilterEnum.INVOICE, invoiceService.findByPK(filterModel.getInvoiceId()));
			}
			filterDataMap.put(ReceiptFilterEnum.REFERENCE_CODE, filterModel.getReferenceCode());
			filterDataMap.put(ReceiptFilterEnum.DELETE, false);
			if (filterModel.getReceiptDate() != null && !filterModel.getReceiptDate().isEmpty()) {
				SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
				LocalDateTime dateTime = Instant.ofEpochMilli(dateFormat.parse(filterModel.getReceiptDate()).getTime())
						.atZone(ZoneId.systemDefault()).toLocalDateTime();
				filterDataMap.put(ReceiptFilterEnum.RECEIPT_DATE, dateTime);
			}

			PaginationResponseModel response = receiptService.getReceiptList(filterDataMap, filterModel);
			if (response == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
			response.setData(receiptRestHelper.getListModel(response.getData()));
			return new ResponseEntity<>(response, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete Receipt By ID")
	@DeleteMapping(value = "/delete")
	public ResponseEntity<?> deleteReceipt(@RequestParam(value = "id") Integer id) {
		try {
			SimpleAccountsMessage message= null;
			Receipt receipt = receiptService.findByPK(id);
			if (receipt != null) {
				receipt.setDeleteFlag(Boolean.TRUE);
				receiptService.update(receipt, receipt.getId());
			}
			message = new SimpleAccountsMessage("0048",
					MessageUtil.getMessage("receipt.deleted.successful.msg.0048"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);		}
			catch (Exception e) {
				SimpleAccountsMessage message= null;
				message = new SimpleAccountsMessage("",
						MessageUtil.getMessage("delete.unsuccessful.msg"), true);
				return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
			}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete Receipt in Bulk")
	@DeleteMapping(value = "/deletes")
	public ResponseEntity<?> deleteReceipts(@RequestBody DeleteModel ids) {
		try {
			SimpleAccountsMessage message=null;
			receiptService.deleteByIds(ids.getIds());
			message = new SimpleAccountsMessage("0048",
					MessageUtil.getMessage("receipt.deleted.successful.msg.0048"), false);
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		SimpleAccountsMessage message= null;
		message = new SimpleAccountsMessage("",
				MessageUtil.getMessage("delete.unsuccessful.msg"), true);
		return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@ApiOperation(value = "Get Receipt By ID")
	@GetMapping(value = "/getReceiptById")
	public ResponseEntity<ReceiptRequestModel> getReceiptById(@RequestParam(value = "id") Integer id) {
		try {
			Receipt receipt = receiptService.findByPK(id);
			if (receipt == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			} else {
				return new ResponseEntity<>(receiptRestHelper.getRequestModel(receipt), HttpStatus.OK);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Add New Receipt")
	@PostMapping(value = "/save")
	public ResponseEntity<?> save(@ModelAttribute ReceiptRequestModel receiptRequestModel, HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			Receipt receipt = receiptRestHelper.getEntity(receiptRequestModel);
			Transaction transaction = new Transaction();
			// save Attcahement
			if (receiptRequestModel.getAttachmentFile() != null && !receiptRequestModel.getAttachmentFile().isEmpty()) {
				String fileName = fileHelper.saveFile(receiptRequestModel.getAttachmentFile(), FileTypeEnum.RECEIPT);
				receipt.setReceiptAttachmentFileName(receiptRequestModel.getAttachmentFile().getOriginalFilename());
				receipt.setReceiptAttachmentPath(fileName);
			}
			receipt.setCreatedBy(userId);
			receipt.setCreatedDate(LocalDateTime.now());
			receipt.setDeleteFlag(Boolean.FALSE);
			receiptService.persist(receipt);
			if (receiptRequestModel.getPayMode()== PayMode.CASH){
				Map<String, Object> param = new HashMap<>();
				if (receipt.getDepositeToTransactionCategory()!=null)
				param.put("transactionCategory", receipt.getDepositeToTransactionCategory());
				param.put("deleteFlag", false);
				List<BankAccount> bankAccountList = bankAccountService.findByAttributes(param);
				BankAccount bankAccount =  bankAccountList!= null && bankAccountList.size() > 0
						? bankAccountList.get(0)
						: null;
			//	Transaction transaction = new Transaction();
				transaction.setCreatedBy(receipt.getCreatedBy());
				transaction.setTransactionDate(receipt.getReceiptDate());
				transaction.setBankAccount(bankAccount);
				transaction.setTransactionAmount(receipt.getAmount().multiply(receipt.getInvoice().getExchangeRate()));
			    transaction.setTransactionExplinationStatusEnum(TransactionExplinationStatusEnum.FULL);
			    transaction.setTransactionDescription("Manual Transaction Created Against ReceiptNo "+receipt.getReceiptNo());
			    transaction.setDebitCreditFlag('C');
				transaction.setExplinationCustomer(receipt.getContact());
				transaction.setExchangeRate(BigDecimal.valueOf(1));
				transaction.setTransactionDueAmount(BigDecimal.ZERO);
				transaction.setCoaCategory(chartOfAccountCategoryService.findByPK(ChartOfAccountCategoryIdEnumConstant.SALES.getId()));
				transactionService.persist(transaction);
				BigDecimal currentBalance = bankAccount.getCurrentBalance();
				currentBalance = currentBalance.add(transaction.getTransactionAmount());
				bankAccount.setCurrentBalance(currentBalance);
				bankAccountService.update(bankAccount);

				TransactionExplanation transactionExplanation = new TransactionExplanation();
				transactionExplanation.setCreatedBy(userId);
				transactionExplanation.setCreatedDate(LocalDateTime.now());
				transactionExplanation.setTransaction(transaction);
				transactionExplanation.setPaidAmount(transaction.getTransactionAmount());
				transactionExplanation.setCurrentBalance(transaction.getCurrentBalance());
				transactionExplanation.setExplanationContact(receipt.getContact().getContactId());
				transactionExplanation.setExplainedTransactionCategory(transaction.getExplainedTransactionCategory());
				transactionExplanation.setExchangeGainOrLossAmount(BigDecimal.ZERO);
				transactionExplanation.setCoaCategory(chartOfAccountCategoryService.findByPK(ChartOfAccountCategoryIdEnumConstant.SALES.getId()));

				List<TransactionExplinationLineItem> transactionExplinationLineItems = new ArrayList<>();
				TransactionExplinationLineItem transactionExplinationLineItem = new TransactionExplinationLineItem();
				transactionExplinationLineItem.setCreatedBy(userId);
				transactionExplinationLineItem.setCreatedDate(LocalDateTime.now());
				transactionExplinationLineItem.setReferenceType(PostingReferenceTypeEnum.INVOICE);
				transactionExplinationLineItem.setReferenceId(receipt.getInvoice().getId());
				transactionExplinationLineItem.setTransactionExplanation(transactionExplanation);
				transactionExplanation.setExplanationLineItems(transactionExplinationLineItems);
				transactionExplinationLineItems.add(transactionExplinationLineItem);
				transactionExplinationLineItem.setExplainedAmount(transaction.getTransactionAmount());
				transactionExplinationLineItem.setConvertedAmount(transaction.getTransactionAmount());
				transactionExplinationLineItem.setExchangeRate(transaction.getExchangeRate());
				if(receipt.getInvoice().getDueAmount().subtract(receipt.getAmount()).compareTo(BigDecimal.ZERO) == 0) {
					transactionExplinationLineItem.setPartiallyPaid(Boolean.FALSE);
				}else{
					transactionExplinationLineItem.setPartiallyPaid(Boolean.TRUE);
				}
				//sum of all explained invoices
				transactionExplanationRepository.save(transactionExplanation);

				TransactionStatus status = new TransactionStatus();
				status.setCreatedBy(userId);
				status.setExplinationStatus(TransactionExplinationStatusEnum.FULL);
				status.setTransaction(transaction);
				status.setRemainingToExplain((receipt.getInvoice().getDueAmount().subtract(receiptRequestModel.getAmount())));
				status.setInvoice(receipt.getInvoice());
				transactionStatusService.persist(status);
		}
			//Apply Credits
			if (receiptRequestModel.getListOfCreditNotes()!=null) {
				BigDecimal receiptAmountAfterApplyingCredits = receipt.getInvoice().getDueAmount();
				for (Object cnObject : receiptRequestModel.getListOfCreditNotes()) {
					JSONObject obj = (JSONObject) cnObject;
					CreditNote creditNote = creditNoteRepository.findById(obj.getInt("value")).get();
					ReceiptCreditNoteRelation receiptCreditNoteRelation = new ReceiptCreditNoteRelation();
					if (receiptAmountAfterApplyingCredits.compareTo(creditNote.getDueAmount()) == 1 ||
							receiptAmountAfterApplyingCredits.compareTo(creditNote.getDueAmount()) == 0) {
						receiptAmountAfterApplyingCredits = receiptAmountAfterApplyingCredits.subtract(creditNote.getDueAmount());
						receiptCreditNoteRelation.setAppliedCNAmount(creditNote.getDueAmount());
						creditNote.setDueAmount(BigDecimal.ZERO);
						creditNote.setStatus(CommonStatusEnum.CLOSED.getValue());
						creditNoteRepository.save(creditNote);
					} else {
						receiptCreditNoteRelation.setAppliedCNAmount((receiptAmountAfterApplyingCredits));
						creditNote.setDueAmount(creditNote.getDueAmount().subtract(receiptAmountAfterApplyingCredits));
						creditNote.setStatus(CommonStatusEnum.PARTIALLY_PAID.getValue());
						creditNoteRepository.save(creditNote);
					}
					receiptCreditNoteRelation.setCreatedBy(userId);
					receiptCreditNoteRelation.setCreatedDate(LocalDateTime.now());
					receiptCreditNoteRelation.setLastUpdateBy(userId);
					receiptCreditNoteRelation.setLastUpdateDate(LocalDateTime.now());
					receiptCreditNoteRelation.setReceipt(receipt);
					receiptCreditNoteRelation.setReceiptAmountAfterApplyingCredits(receiptAmountAfterApplyingCredits);
					receiptCreditNoteRelation.setCreditNote(creditNote);
					receiptCreditNoteRelationRepository.save(receiptCreditNoteRelation);
				}
			}
			// save data in Mapping Table
			List<CustomerInvoiceReceipt> customerInvoiceReceiptList = receiptRestHelper
					.getCustomerInvoiceReceiptEntity(receiptRequestModel);
			for (CustomerInvoiceReceipt customerInvoiceReceipt : customerInvoiceReceiptList) {
				customerInvoiceReceipt.setTransaction(transaction);
				customerInvoiceReceipt.setReceipt(receipt);
				customerInvoiceReceipt.setCreatedBy(userId);
				Contact contact=contactService.findByPK(receiptRequestModel.getContactId());
				contactService.sendInvoiceThankYouMail(contact,1,customerInvoiceReceipt.getCustomerInvoice().getReferenceNumber(),receiptRequestModel.getAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString(),dateFormtUtil.getLocalDateTimeAsString(receipt.getReceiptDate(),"dd/MM/yyyy").replace("/","-"),customerInvoiceReceipt.getDueAmount(),request);
				customerInvoiceReceiptService.persist(customerInvoiceReceipt);
			}

			// Post journal
			Journal journal = receiptRestHelper.receiptPosting(
					new PostingRequestModel(receipt.getId(), receipt.getAmount()), userId,
					receipt.getDepositeToTransactionCategory(),BigDecimal.ZERO,0,transaction.getTransactionId());
			journalService.persist(journal);

			SimpleAccountsMessage message = null;
			message = new SimpleAccountsMessage("0049",
					MessageUtil.getMessage("receipt.created.successful.msg.0049"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
			} catch (Exception e)
			{
			SimpleAccountsMessage message= null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("create.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
			}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Update Receipt")
	@PostMapping(value = "/update")
	public ResponseEntity<?> update(@ModelAttribute ReceiptRequestModel receiptRequestModel, HttpServletRequest request) {
		try {
			SimpleAccountsMessage message= null;
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			Receipt receipt = receiptRestHelper.getEntity(receiptRequestModel);

			// save Attcahement
			if (receiptRequestModel.getAttachmentFile() != null && !receiptRequestModel.getAttachmentFile().isEmpty()) {
				String fileName = fileHelper.saveFile(receiptRequestModel.getAttachmentFile(), FileTypeEnum.RECEIPT);
				receipt.setReceiptAttachmentFileName(receiptRequestModel.getAttachmentFile().getOriginalFilename());
				receipt.setReceiptAttachmentPath(fileName);
			}

			// No need to Update data in Mapping Table

			// Update journal
			Journal journal = receiptRestHelper.receiptPosting(
					new PostingRequestModel(receipt.getId(), receipt.getAmount()), userId,
					receipt.getDepositeToTransactionCategory(),BigDecimal.ZERO,0,0);
			journalService.update(journal);

			receipt.setLastUpdateDate(LocalDateTime.now());
			receipt.setLastUpdatedBy(userId);
			receiptService.update(receipt);

			message = new SimpleAccountsMessage("0050",
					MessageUtil.getMessage("receipt.updated.successful.msg.0050"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
		}
			catch (Exception e) {
				SimpleAccountsMessage message= null;
				message = new SimpleAccountsMessage("",
						MessageUtil.getMessage("update.unsuccessful.msg"), true);
				return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@ApiOperation(value = "Next Receipt No")
	@GetMapping(value = "/getNextReceiptNo")
	public ResponseEntity<Integer> getNextReceiptNo(@RequestParam("id") Integer invoiceId) {
		try {
			Integer nxtInvoiceNo = customerInvoiceReceiptService.findNextReceiptNoForInvoice(invoiceId);
			if (nxtInvoiceNo == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
			return new ResponseEntity<>(nxtInvoiceNo, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
