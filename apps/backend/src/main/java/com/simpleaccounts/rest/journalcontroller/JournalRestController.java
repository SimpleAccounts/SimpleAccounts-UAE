package com.simpleaccounts.rest.journalcontroller;

import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

import javax.servlet.http.HttpServletRequest;

import com.simpleaccounts.entity.*;
import com.simpleaccounts.repository.CustomerInvoiceReceiptRepository;
import com.simpleaccounts.repository.JournalLineItemRepository;
import com.simpleaccounts.repository.JournalRepository;
import com.simpleaccounts.repository.SupplierInvoicePaymentRepository;
import com.simpleaccounts.rest.creditnotecontroller.CreditNoteRepository;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.bank.model.DeleteModel;
import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import com.simpleaccounts.constant.dbfilter.JournalFilterEnum;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.JwtTokenUtil;

import io.swagger.annotations.ApiOperation;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;
import static com.simpleaccounts.constant.PostingReferenceTypeEnum.*;

/**
 *
 * @author saurabhg
 */
	@RestController
	@RequestMapping(value = "/rest/journal")
	@SuppressWarnings({"java:S131", "java:S6809"})
	public class JournalRestController {
	private static final String MSG_DELETE_UNSUCCESSFUL = "delete.unsuccessful.msg";
	
	private final Logger logger = LoggerFactory.getLogger(JournalRestController.class);
	@Autowired
	private JwtTokenUtil jwtTokenUtil;

	@Autowired
	private JournalService journalService;

	@Autowired
	private JournalRestHelper journalRestHelper;

	@Autowired
	private UserService userService;

	@Autowired
	private InvoiceService invoiceService;

	@Autowired
	private JournalRepository journalRepository;

	@Autowired
	private CustomerInvoiceReceiptRepository customerInvoiceReceiptRepository;

	@Autowired
	private PaymentRepository paymentRepository;

	@Autowired
	private SupplierInvoicePaymentRepository supplierInvoicePaymentRepository;

	@Autowired
	private CreditNoteRepository creditNoteRepository;

	@Autowired
	private JournalLineItemRepository journalLineItemRepository;

	@Autowired
	private ExpenseService expenseService;

	@LogRequest
	@ApiOperation(value = "Get Journal List")
	@GetMapping(value = "/getList")
	public ResponseEntity<PaginationResponseModel> getList(JournalRequestFilterModel filterModel, HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			User user = userService.findByPK(userId);
			Map<JournalFilterEnum, Object> filterDataMap = new EnumMap<>(JournalFilterEnum.class);
			if(user.getRole().getRoleCode()!=1) {
				filterDataMap.put(JournalFilterEnum.USER_ID, userId);
			}
			if (filterModel.getDescription() != null && !filterModel.getDescription().equals(" "))
				filterDataMap.put(JournalFilterEnum.DESCRIPTION, filterModel.getDescription());
			filterDataMap.put(JournalFilterEnum.REFERENCE_NO, filterModel.getJournalReferenceNo());
			if (filterModel.getJournalDate() != null && !filterModel.getJournalDate().isEmpty()) {
				LocalDate date = LocalDate.parse(filterModel.getJournalDate());
//				SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
//				LocalDateTime dateTime = Instant.ofEpochMilli(dateFormat.parse(filterModel.getJournalDate()).getTime())
//						.atZone(ZoneId.systemDefault()).toLocalDateTime();
				filterDataMap.put(JournalFilterEnum.JOURNAL_DATE, date);
			}
			//filterDataMap.put(JournalFilterEnum.DELETE_FLAG, false);
			PaginationResponseModel responseModel = journalService.getJornalList(filterDataMap, filterModel);
			if (responseModel == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
			return new ResponseEntity<>(
					filterModel.isPaginationDisable() ? journalRestHelper.getCsvListModel(responseModel)
							: journalRestHelper.getListModel(responseModel),
					HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete Journal By ID")
	@DeleteMapping(value = "/delete")
	public ResponseEntity<Object> deleteJournal(@RequestParam(value = "id") Integer id) {
		try {
			deleteJournalInternal(id);
			SimpleAccountsMessage message = null;
			message = new SimpleAccountsMessage("0080",
					MessageUtil.getMessage("journal.deleted.successful.msg.0080"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);

		} catch (Exception e) {
			SimpleAccountsMessage message = null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage(MSG_DELETE_UNSUCCESSFUL), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
//		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);

	}

	private void deleteJournalInternal(Integer id) {
		Journal journal = journalService.findByPK(id);
		if (journal != null) {
			List<Integer> list = new ArrayList<>();
			list.add(journal.getId());
			journalService.deleteByIds(list);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete Journal in Bulk")
	@DeleteMapping(value = "/deletes")
	public ResponseEntity<Object> deleteJournals(@RequestBody DeleteModel ids) {
		try {
			for (Integer id : ids.getIds()) {
				deleteJournalInternal(id);
			}
			SimpleAccountsMessage message = null;
			message = new SimpleAccountsMessage("0080",
					MessageUtil.getMessage("journal.deleted.successful.msg.0080"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {
			SimpleAccountsMessage message = null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage(MSG_DELETE_UNSUCCESSFUL), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
//		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);

	}

	@LogRequest
	@ApiOperation(value = "Get Journal By ID")
	@GetMapping(value = "/getById")
	public ResponseEntity<JournalModel> getInvoiceById(@RequestParam(value = "id") Integer id) {
		Journal journal = journalService.findByPK(id);
		if (journal == null) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		} else {
			return new ResponseEntity<>(journalRestHelper.getModel(journal, false), HttpStatus.OK);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Add New Journal Invoice")
	@PostMapping(value = "/save")
	public ResponseEntity<Object> save(@RequestBody JournalRequestModel journalRequestModel, HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			Journal journal = journalRestHelper.getEntity(journalRequestModel, userId);
			journal.setCreatedBy(userId);
			journal.setCreatedDate(LocalDateTime.now());
			journal.setDeleteFlag(Boolean.FALSE);
			journal.setPostingReferenceType(PostingReferenceTypeEnum.MANUAL);
			journalService.persist(journal);

			// add reference by in line item
			if (!journal.getJournalLineItems().isEmpty()) {
				Collection<JournalLineItem> journalLineItems = journalRestHelper
						.setReferenceId(journal.getJournalLineItems(), journal.getId());
				journal.setJournalLineItems(journalLineItems);
			}
			journalService.update(journal);

			SimpleAccountsMessage message = null;
			message = new SimpleAccountsMessage("0079",
					MessageUtil.getMessage("journal.created.successful.msg.0079"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);

		} catch (Exception e) {
			SimpleAccountsMessage message = null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage(MSG_DELETE_UNSUCCESSFUL), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Update Journal")
	@PostMapping(value = "/update")
	public ResponseEntity<Object> update(@RequestBody JournalRequestModel jouralRequestModel, HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			Journal journal = journalRestHelper.getEntity(jouralRequestModel, userId);
			journal.setLastUpdateDate(LocalDateTime.now());
			journal.setLastUpdateBy(userId);
			journal.setCreatedBy(userId);
			journalService.persist(journal);
			// add reference by in line item
			if (!journal.getJournalLineItems().isEmpty()) {
				Collection<JournalLineItem> journalLineItems = journalRestHelper
						.setReferenceId(journal.getJournalLineItems(), journal.getId());
				journal.setJournalLineItems(journalLineItems);
			}
			journalService.update(journal);
			SimpleAccountsMessage message = null;
			message = new SimpleAccountsMessage("0081",
					MessageUtil.getMessage("journal.updated.successful.msg.0081"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);

		} catch (Exception e) {
			SimpleAccountsMessage message = null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("create.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@ApiOperation(value = "Get Journals By Invoice ID")
	@GetMapping(value = "/getJournalsByInvoiceId")
	public ResponseEntity<Object> getJournalsByInvoiceId(@RequestParam(value = "id") Integer id,@RequestParam(value = "type") Integer type) {
		List<Journal> journalList = new ArrayList<>();
		try {
			switch (type){
				case 1:
					Invoice invoice = invoiceService.findByPK(id);
					journalList = journalRepository.findForSupplierInvoice(invoice.getReferenceNumber());
					Set<Integer> journalIds = new HashSet<>();
					journalList.forEach(journal -> journalIds.add(journal.getId()));

					if(invoice.getStatus() == 5 || invoice.getStatus() == 6) {
						List<SupplierInvoicePayment> paymentList = supplierInvoicePaymentRepository.findBySupplierInvoiceIdAndDeleteFlag(invoice.getId(), false);
						for (SupplierInvoicePayment payment : paymentList) {
							List<JournalLineItem> journalLineItemList = journalLineItemRepository.findAllByReferenceIdAndReferenceType(payment.getTransaction().getTransactionId(), PAYMENT);
							for (JournalLineItem journalLineItem : journalLineItemList) {
								if (!journalIds.contains(journalLineItem.getJournal().getId())) {
									journalList.add(journalLineItem.getJournal());
									journalIds.add(journalLineItem.getJournal().getId());
								}
							}
							List<JournalLineItem> journalLineItemList2 = journalLineItemRepository.findAllByReferenceIdAndReferenceType(payment.getTransaction().getTransactionId(), BANK_PAYMENT);
							for (JournalLineItem journalLineItem : journalLineItemList2) {
								if (!journalIds.contains(journalLineItem.getJournal().getId())) {
									journalList.add(journalLineItem.getJournal());
									journalIds.add(journalLineItem.getJournal().getId());
								}
							}
						}
					}
					break;
				case 2:
					invoice = invoiceService.findByPK(id);
					journalList = journalRepository.findForCustomerInvoice(invoice.getReferenceNumber());
					journalIds = new HashSet<>();
					journalList.forEach(journal -> journalIds.add(journal.getId()));

					if(invoice.getStatus() == 5 || invoice.getStatus() == 6){
						List<CustomerInvoiceReceipt> receiptList = customerInvoiceReceiptRepository.findByCustomerInvoiceIdAndDeleteFlag(invoice.getId(), false);
						for (CustomerInvoiceReceipt receipt : receiptList) {
							List<JournalLineItem> journalLineItemList = journalLineItemRepository.findAllByReferenceIdAndReferenceType(receipt.getTransaction().getTransactionId(), RECEIPT);
							for (JournalLineItem journalLineItem : journalLineItemList) {
								if (!journalIds.contains(journalLineItem.getJournal().getId())) {
									journalList.add(journalLineItem.getJournal());
									journalIds.add(journalLineItem.getJournal().getId());
								}
							}
							List<JournalLineItem> journalLineItemList2 = journalLineItemRepository.findAllByReferenceIdAndReferenceType(receipt.getTransaction().getTransactionId(), BANK_RECEIPT);
							for (JournalLineItem journalLineItem : journalLineItemList2) {
								if (!journalIds.contains(journalLineItem.getJournal().getId())) {
									journalList.add(journalLineItem.getJournal());
									journalIds.add(journalLineItem.getJournal().getId());
								}
							}
						}
					}
					break;
				case 3:
					Expense expense = expenseService.findByPK(id);
					journalList = journalRepository.findForExpense(expense.getExpenseNumber());
					break;
				case 4:
					CreditNote creditNote = creditNoteRepository.findById(id).get();
					journalList = journalRepository.findForCreditNote(creditNote.getCreditNoteNumber());
					journalIds = new HashSet<>();
					journalList.forEach(journal -> journalIds.add(journal.getId()));

					if(creditNote.getStatus() == 5 || creditNote.getStatus() == 8) {
						List<JournalLineItem> journalLineItemList = journalLineItemRepository.findAllByReferenceIdAndReferenceType(creditNote.getCreditNoteId(), REFUND);
						for (JournalLineItem journalLineItem : journalLineItemList) {
							if (!journalIds.contains(journalLineItem.getJournal().getId())) {
								journalList.add(journalLineItem.getJournal());
								journalIds.add(journalLineItem.getJournal().getId());
							}
						}
					}

					break;
				case 5:
					creditNote = creditNoteRepository.findById(id).get();
					journalList = journalRepository.findForDebitNote(creditNote.getCreditNoteNumber());
					journalIds = new HashSet<>();
					journalList.forEach(journal -> journalIds.add(journal.getId()));

					if(creditNote.getStatus() == 5 || creditNote.getStatus() == 8) {
						List<JournalLineItem> journalLineItemList = journalLineItemRepository.findAllByReferenceIdAndReferenceType(creditNote.getCreditNoteId(), REFUND);
						for (JournalLineItem journalLineItem : journalLineItemList) {
							if (!journalIds.contains(journalLineItem.getJournal().getId())) {
								journalList.add(journalLineItem.getJournal());
								journalIds.add(journalLineItem.getJournal().getId());
							}
						}
					}
					break;
				default:
					// Unknown type - return empty list
					break;
			}
			return new ResponseEntity<>( journalRestHelper.getEntriesListModel(journalList), HttpStatus.OK);
		}
		catch (Exception e){
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

}
