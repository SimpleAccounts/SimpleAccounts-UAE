package com.simpleaccounts.rest.paymentcontroller;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import com.simpleaccounts.constant.*;
import com.simpleaccounts.repository.TransactionExplanationRepository;
import org.json.JSONObject;

import javax.servlet.http.HttpServletRequest;

import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.repository.PaymentDebitNoteRelationRepository;
import com.simpleaccounts.rest.creditnotecontroller.CreditNoteRepository;
import com.simpleaccounts.service.*;
import com.simpleaccounts.service.bankaccount.TransactionService;
import com.simpleaccounts.service.bankaccount.TransactionStatusService;
import com.simpleaccounts.utils.DateFormatUtil;
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
import com.simpleaccounts.constant.dbfilter.PaymentFilterEnum;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.PostingRequestModel;
import com.simpleaccounts.security.JwtTokenUtil;

import io.swagger.annotations.ApiOperation;

/**
 * @author Ashish : For Supplier invoice
 */
@RestController
@RequestMapping(value = "/rest/payment")
@RequiredArgsConstructor
public class PaymentController {

	private final Logger logger = LoggerFactory.getLogger(PaymentController.class);

	private final JwtTokenUtil jwtTokenUtil;

	private final DateFormatUtil dateFormtUtil;

	private final PaymentService paymentService;

	private final ContactService contactService;

	private final PaymentRestHelper paymentRestHelper;

	private final UserService userServiceNew;

	private final SupplierInvoicePaymentService supplierInvoicePaymentService;

	private final JournalService journalService;

	private final UserService userService;

	private final BankAccountService bankAccountService;

	private final ChartOfAccountCategoryService chartOfAccountCategoryService;

	private final TransactionService transactionService;

	private final TransactionStatusService transactionStatusService;

	private final CreditNoteRepository creditNoteRepository;

	private final PaymentDebitNoteRelationRepository paymentDebitNoteRelationRepository;

	private final TransactionExplanationRepository transactionExplanationRepository;

	@LogRequest
	@ApiOperation(value = "Get All Payments")
	@GetMapping(value = "/getlist")
	public ResponseEntity<PaginationResponseModel> getPaymentList(PaymentRequestFilterModel filterModel,
			HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			User user = userService.findByPK(userId);
			Map<PaymentFilterEnum, Object> filterDataMap = new EnumMap<>(PaymentFilterEnum.class);
			if(user.getRole().getRoleCode()!=1) {
				filterDataMap.put(PaymentFilterEnum.USER_ID, userId);
			}
			if (filterModel.getSupplierId() != null) {
				filterDataMap.put(PaymentFilterEnum.SUPPLIER, contactService.findByPK(filterModel.getSupplierId()));
			}
			if (filterModel.getInvoiceAmount() != null) {
				filterDataMap.put(PaymentFilterEnum.INVOICE_AMOUNT, filterModel.getInvoiceAmount());
			}
			if (filterModel.getPaymentDate() != null && !filterModel.getPaymentDate().isEmpty()) {
				LocalDate date = LocalDate.parse(filterModel.getPaymentDate());

				filterDataMap.put(PaymentFilterEnum.PAYMENT_DATE, date);
			}
			filterDataMap.put(PaymentFilterEnum.USER_ID, userId);
			filterDataMap.put(PaymentFilterEnum.DELETE_FLAG, false);
			PaginationResponseModel response = paymentService.getPayments(filterDataMap, filterModel);

			List<PaymentViewModel> paymentModels = new ArrayList<>();
			if (response != null && response.getData() != null) {
				for (Payment payment : (List<Payment>) response.getData()) {
					PaymentViewModel paymentModel = paymentRestHelper.convertToPaymentViewModel(payment);
					paymentModels.add(paymentModel);
				}
				response.setData(paymentModels);
			}
			if (response != null && response.getData() != null) {
				return new ResponseEntity<>(response, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@ApiOperation(value = "Get Payment By Id")
	@GetMapping(value = "/getpaymentbyid")
	public ResponseEntity<PaymentPersistModel> getPaymentById(@RequestParam("paymentId") Integer paymentId) {
		try {
			if (paymentId == null) {
				return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
			}
			Payment payment = paymentService.findByPK(paymentId);
			return new ResponseEntity<>(paymentRestHelper.convertToPaymentPersistModel(payment), HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Save a Payment")
	@PostMapping(value = "/save")
	public ResponseEntity<String> save(@ModelAttribute PaymentPersistModel paymentModel, HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			User user = userServiceNew.findByPK(userId);
			Payment payment = paymentRestHelper.convertToPayment(paymentModel);
			payment.setCreatedBy(user.getUserId());
			payment.setCreatedDate(LocalDateTime.now());
			Transaction transaction = new Transaction();

			paymentService.persist(payment);

			if (paymentModel.getPayMode()== PayMode.CASH){
				Map<String, Object> param = new HashMap<>();
				param.put("transactionCategory", payment.getDepositeToTransactionCategory());
				param.put("deleteFlag", false);
				List<BankAccount> bankAccountList = bankAccountService.findByAttributes(param);
				BankAccount bankAccount =  bankAccountList!= null && !bankAccountList.isEmpty()
						? bankAccountList.get(0)
						: null;
				transaction.setCreatedBy(payment.getCreatedBy());
				transaction.setTransactionDate(payment.getPaymentDate().atStartOfDay());
				transaction.setBankAccount(bankAccount);
				transaction.setTransactionAmount(payment.getInvoiceAmount());
				transaction.setTransactionExplinationStatusEnum(TransactionExplinationStatusEnum.FULL);
				transaction.setTransactionDescription("Manual Transaction Created Against ReceiptNo "+payment.getPaymentNo());
				transaction.setDebitCreditFlag('D');
				transaction.setExplinationVendor(payment.getSupplier());
				transaction.setExchangeRate(BigDecimal.valueOf(1));
				transaction.setTransactionDueAmount(BigDecimal.ZERO);
				transaction.setCoaCategory(chartOfAccountCategoryService.findByPK(ChartOfAccountCategoryIdEnumConstant.EXPENSE.getId()));
				transactionService.persist(transaction);
				BigDecimal currentBalance = bankAccount.getCurrentBalance();
				currentBalance = currentBalance.subtract(transaction.getTransactionAmount());
				bankAccount.setCurrentBalance(currentBalance);
				bankAccountService.update(bankAccount);

				TransactionExplanation transactionExplanation = new TransactionExplanation();
				transactionExplanation.setCreatedBy(userId);
				transactionExplanation.setCreatedDate(LocalDateTime.now());
				transactionExplanation.setTransaction(transaction);
				transactionExplanation.setPaidAmount(transaction.getTransactionAmount());
				transactionExplanation.setCurrentBalance(transaction.getCurrentBalance());
				transactionExplanation.setExplanationContact(payment.getSupplier().getContactId());
				transactionExplanation.setExplainedTransactionCategory(transaction.getExplainedTransactionCategory());
				transactionExplanation.setExchangeGainOrLossAmount(BigDecimal.ZERO);
				transactionExplanation.setCoaCategory(chartOfAccountCategoryService.findByPK(ChartOfAccountCategoryIdEnumConstant.EXPENSE.getId()));

				List<TransactionExplinationLineItem> transactionExplinationLineItems = new ArrayList<>();
				TransactionExplinationLineItem transactionExplinationLineItem = new TransactionExplinationLineItem();
				transactionExplinationLineItem.setCreatedBy(userId);
				transactionExplinationLineItem.setCreatedDate(LocalDateTime.now());
				transactionExplinationLineItem.setReferenceType(PostingReferenceTypeEnum.INVOICE);
				transactionExplinationLineItem.setReferenceId(payment.getInvoice().getId());
				transactionExplinationLineItem.setTransactionExplanation(transactionExplanation);
				transactionExplanation.setExplanationLineItems(transactionExplinationLineItems);
				transactionExplinationLineItems.add(transactionExplinationLineItem);
				transactionExplinationLineItem.setExplainedAmount(transaction.getTransactionAmount());
				transactionExplinationLineItem.setConvertedAmount(transaction.getTransactionAmount());
				transactionExplinationLineItem.setExchangeRate(transaction.getExchangeRate());
				if(payment.getInvoice().getDueAmount().subtract(payment.getInvoiceAmount()).compareTo(BigDecimal.ZERO) == 0) {
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
				status.setRemainingToExplain((payment.getInvoice().getDueAmount().subtract(paymentModel.getAmount())));
				status.setInvoice(payment.getInvoice());
				transactionStatusService.persist(status);
			}
			//Apply Debits.
			if (paymentModel.getListOfDebitNotes()!=null){
				BigDecimal paymentAmountAfterApplyingCredits = payment.getInvoice().getDueAmount();
				for(Object dnObject : paymentModel.getListOfDebitNotes()) {
					JSONObject obj =  (JSONObject)dnObject;
					CreditNote creditDebitNote = creditNoteRepository.findById(obj.getInt("value")).get();
					PaymentDebitNoteRelation paymentDebitNoteRelation = new PaymentDebitNoteRelation();
					if (paymentAmountAfterApplyingCredits.compareTo(creditDebitNote.getDueAmount())==1 ||
							paymentAmountAfterApplyingCredits.compareTo(creditDebitNote.getDueAmount())==0){
						paymentAmountAfterApplyingCredits = paymentAmountAfterApplyingCredits.subtract(creditDebitNote.getDueAmount());
						paymentDebitNoteRelation.setAppliedDNAmount(creditDebitNote.getDueAmount());
						creditDebitNote.setDueAmount(BigDecimal.ZERO);
						creditDebitNote.setStatus(CommonStatusEnum.CLOSED.getValue());
						creditNoteRepository.save(creditDebitNote);
					}
					else {
						paymentDebitNoteRelation.setAppliedDNAmount((paymentAmountAfterApplyingCredits));
						creditDebitNote.setDueAmount(creditDebitNote.getDueAmount().subtract(paymentAmountAfterApplyingCredits));
						creditDebitNote.setStatus(CommonStatusEnum.PARTIALLY_PAID.getValue());
						creditNoteRepository.save(creditDebitNote);
					}
					paymentDebitNoteRelation.setCreatedBy(userId);
					paymentDebitNoteRelation.setCreatedDate(LocalDateTime.now());
					paymentDebitNoteRelation.setLastUpdateBy(userId);
					paymentDebitNoteRelation.setLastUpdateDate(LocalDateTime.now());
					paymentDebitNoteRelation.setPayment(payment);
					paymentDebitNoteRelation.setReceiptAmountAfterApplyingCredits(paymentAmountAfterApplyingCredits);
					paymentDebitNoteRelation.setCreditNote(creditDebitNote);
					paymentDebitNoteRelationRepository.save(paymentDebitNoteRelation);
				}
			}
			// save data in Mapping Table
			List<SupplierInvoicePayment> supplierInvoicePaymentList = paymentRestHelper
					.getSupplierInvoicePaymentEntity(paymentModel);
			for (SupplierInvoicePayment supplierInvoicePayment : supplierInvoicePaymentList) {
				supplierInvoicePayment.setTransaction(transaction);
				supplierInvoicePayment.setPayment(payment);
				supplierInvoicePayment.setCreatedBy(userId);
				Contact contact=contactService.findByPK(paymentModel.getContactId());
				contactService.sendInvoiceThankYouMail(contact,2,supplierInvoicePayment.getSupplierInvoice().getReferenceNumber(),paymentModel.getAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString(),dateFormtUtil.getLocalDateTimeAsString(payment.getPaymentDate().atStartOfDay(),"dd/MM/yyyy").replace("/","-"), supplierInvoicePayment.getDueAmount(), request);
				supplierInvoicePaymentService.persist(supplierInvoicePayment);
			}
			// Post journal
			Journal journal = paymentRestHelper.paymentPosting(
					new PostingRequestModel(payment.getPaymentId(), payment.getInvoiceAmount()), userId,
					payment.getDepositeToTransactionCategory(),transaction.getTransactionId());
			journalService.persist(journal);
//pay
			return new ResponseEntity<>(HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Update Payment")
	@PostMapping(value = "/update")
	public ResponseEntity<String> update(@ModelAttribute PaymentPersistModel paymentModel, HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			User user = userServiceNew.findByPK(userId);

			Payment payment = paymentRestHelper.convertToPayment(paymentModel);

			Journal journal = paymentRestHelper.paymentPosting(
					new PostingRequestModel(payment.getPaymentId(), payment.getInvoiceAmount()), userId,
					payment.getDepositeToTransactionCategory(),0);
			journalService.update(journal);

			payment.setLastUpdateBy(user.getUserId());
			payment.setLastUpdateDate(LocalDateTime.now());
			paymentService.update(payment);
			return new ResponseEntity<>(HttpStatus.OK);
		} catch (

		Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete Payment")
	@DeleteMapping(value = "/delete")
	public ResponseEntity<String> deletePayment(@RequestParam(value = "id") Integer id) {
		Payment payment = paymentService.findByPK(id);
		try {
			if (payment != null) {
				List<Integer> paymentIdList = new ArrayList<>();
				paymentIdList.add(id);
				paymentService.deleteByIds(paymentIdList);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
		return new ResponseEntity<>("Deleted Successfully", HttpStatus.OK);
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete Multiple Payments")
	@DeleteMapping(value = "/deletes")
	public ResponseEntity<String> deleteExpenses(@RequestBody DeleteModel expenseIds) {
		try {
			paymentService.deleteByIds(expenseIds.getIds());
			return ResponseEntity.status(HttpStatus.OK).build();
		} catch (Exception e) {
			logger.error(ERROR, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

}
