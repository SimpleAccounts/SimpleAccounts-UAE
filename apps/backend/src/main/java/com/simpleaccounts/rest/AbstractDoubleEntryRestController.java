package com.simpleaccounts.rest;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.constant.CommonColumnConstants;
import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import com.simpleaccounts.constant.CommonStatusEnum;
import com.simpleaccounts.constant.ExpenseStatusEnum;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.helper.ExpenseRestHelper;
import com.simpleaccounts.repository.JournalLineItemRepository;
import com.simpleaccounts.repository.TransactionExpensesRepository;
import com.simpleaccounts.repository.TransactionExplanationRepository;
import com.simpleaccounts.rest.creditnotecontroller.CreditNoteRepository;
import com.simpleaccounts.rest.creditnotecontroller.CreditNoteRestHelper;
import com.simpleaccounts.rest.invoicecontroller.InvoiceRestHelper;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.*;
import com.simpleaccounts.service.bankaccount.TransactionService;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.simpleaccounts.rest.invoicecontroller.InvoiceRestHelper;
import com.simpleaccounts.security.JwtTokenUtil;
import io.swagger.annotations.ApiOperation;

import javax.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


/**
 *
 * @author uday
 */
@Slf4j
public abstract class AbstractDoubleEntryRestController {

	@Autowired
	TransactionCategoryService abstractDoubleEntryTransactionCategoryService;

	@Autowired
	protected JournalService journalService;

	@Autowired
	private InvoiceService invoiceService;

	@Autowired
	private ExpenseService expenseService;

	@Autowired
	private JwtTokenUtil jwtTokenUtil;

	@Autowired
	private InvoiceRestHelper invoiceRestHelper;

	@Autowired
	private ExpenseRestHelper expenseRestHelper;

	@Autowired
	private InventoryService inventoryService;

	@Autowired
	private CreditNoteRestHelper creditNoteRestHelper;

	@Autowired
	private CreditNoteRepository creditNoteRepository;

	@Autowired
	private InventoryHistoryService inventoryHistoryService;

	@Autowired
	private JournalLineItemRepository journalLineItemRepository;

	@Autowired
	private TransactionService transactionService;

	@Autowired
	private TransactionExpensesService transactionExpensesService;

	@Autowired
	private TransactionExpensesRepository transactionExpensesRepository;

	@Autowired
	private TransactionExplanationRepository transactionExplanationRepository;

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Post Journal Entry")
	@PostMapping(value = "/posting")
	public ResponseEntity<String> posting(@RequestBody PostingRequestModel postingRequestModel, HttpServletRequest request) {
		String validationCheck = "";
		Journal journal = null;

		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);

		if (postingRequestModel.getPostingRefType().equalsIgnoreCase(PostingReferenceTypeEnum.INVOICE.name())) {
			journal = invoiceRestHelper.invoicePosting(postingRequestModel, userId);
		} else if (postingRequestModel.getPostingRefType().equalsIgnoreCase(PostingReferenceTypeEnum.EXPENSE.name())) {
			journal = expenseRestHelper.expensePosting(postingRequestModel, userId);
		}

		if (journal != null) {
			journalService.persist(journal);
		}

		if (postingRequestModel.getPostingRefType().equalsIgnoreCase(PostingReferenceTypeEnum.INVOICE.name())) {
			Invoice invoice = invoiceService.findByPK(postingRequestModel.getPostingRefId());
			invoice.setStatus(CommonStatusEnum.POST.getValue());
			if (invoice.getContact().getBillingEmail()!=null && !invoice.getContact().getBillingEmail().isEmpty() ||
					invoice.getContact().getEmail()!=null && !invoice.getContact().getEmail().isEmpty()) {
				if(postingRequestModel.getMarkAsSent()==false)
					invoiceRestHelper.send(invoice, userId,postingRequestModel,request);
			}else {
				validationCheck = "Please update the contact email Details";
			}
			invoiceService.persist(invoice);
		} else if (postingRequestModel.getPostingRefType().equalsIgnoreCase(PostingReferenceTypeEnum.EXPENSE.name())) {
			Expense expense = expenseService.findByPK(postingRequestModel.getPostingRefId());
			expense.setStatus(ExpenseStatusEnum.POSTED.getValue());
			expenseService.persist(expense);
		}
		if (validationCheck.isEmpty()) {
			return new ResponseEntity<>("Journal Entries created Successfully", HttpStatus.OK);
		}
		return new ResponseEntity<>(validationCheck,HttpStatus.OK);
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "UndoPost Journal Entry")
	@PostMapping(value = "/undoPosting")
	public ResponseEntity<String> undoPosting(@RequestBody PostingRequestModel postingRequestModel, HttpServletRequest request) {

		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
		Journal journal = null;
		if (postingRequestModel.getPostingRefType().equalsIgnoreCase(PostingReferenceTypeEnum.INVOICE.name())) {
			List<JournalLineItem> invoiceJliList= journalLineItemRepository.findAllByReferenceIdAndReferenceType(
					postingRequestModel.getPostingRefId(),
					PostingReferenceTypeEnum.INVOICE);

			for(JournalLineItem journalLineItem:invoiceJliList){

				journalLineItem.setReversalFlag(Boolean.TRUE);
				Journal journal1 = journalLineItem.getJournal();
				journal1.setReversalFlag(Boolean.TRUE);
				journalLineItemRepository.save(journalLineItem);
				journalService.update(journal1);

			}
			journal = invoiceRestHelper.reverseInvoicePosting(postingRequestModel, userId);
			if (journal != null) {
				journalService.persist(journal);
				Invoice invoice = invoiceService.findByPK(postingRequestModel.getPostingRefId());
				invoice.setStatus(CommonStatusEnum.PENDING.getValue());
				invoice.setDueAmount(invoice.getDueAmount());
				for (	InvoiceLineItem invoiceLineItem : invoice.getInvoiceLineItems()){
					if (invoiceLineItem.getProduct().getIsInventoryEnabled()!=null && invoiceLineItem.getProduct().getIsInventoryEnabled()) {
						Map<String, Object> inventoryHistoryFilterMap = new HashMap<>();
						inventoryHistoryFilterMap.put("invoice", invoice);
						List<InventoryHistory> inventoryHistoryList = inventoryHistoryService.findByAttributes(inventoryHistoryFilterMap);
						for (InventoryHistory inventoryHistory : inventoryHistoryList) {
							Inventory inventory = inventoryService.findByPK(inventoryHistory.getInventory().getInventoryID());
							if (invoice.getType() == 2) {
								if (inventory.getStockOnHand() != null) {
									inventory.setStockOnHand(inventory.getStockOnHand() + inventory.getQuantitySold());
								}
								if (inventory.getQuantitySold() != null) {
									inventory.setQuantitySold( inventory.getQuantitySold() - inventory.getQuantitySold());
								}
								inventoryService.update(inventory);
								inventoryHistoryService.delete(inventoryHistory);
							}
							if (invoice.getType() == 1) {
								if (inventory.getPurchaseQuantity() != null) {
									inventory.setPurchaseQuantity(inventory.getPurchaseQuantity() - inventoryHistory.getQuantity().intValue());
								}
								inventory.setStockOnHand(inventory.getStockOnHand() - inventoryHistory.getQuantity().intValue());
								//to check multiple usage of single inventory item
								Map<String, Object> map = new HashMap<>();
								map.put("inventory", inventory);
								List<InventoryHistory> list = inventoryHistoryService.findByAttributes(map);
								if (list != null && list.size() == 1) {
									inventoryHistoryService.delete(inventoryHistory);
									inventoryService.delete(inventory);
								} else {
									inventoryHistoryService.delete(inventoryHistory);
									inventoryService.update(inventory);
								}
							}
						}
					}
				}
				if(postingRequestModel.getComment()!=null) {
					String notes = invoice.getNotes();
					if(notes!=null && !notes.isEmpty())
					{
						notes=notes+"\n"+postingRequestModel.getComment();
					}
					else
						notes = postingRequestModel.getComment();
					invoice.setNotes(notes);
				}
				invoiceService.update(invoice);
			}
		}
		else if (postingRequestModel.getPostingRefType().equalsIgnoreCase(PostingReferenceTypeEnum.CREDIT_NOTE.name())){
			journal = creditNoteRestHelper.reverseCreditNotePosting(postingRequestModel, userId);
			if (journal != null) {
				journalService.persist(journal);
				creditNoteRestHelper.creditNoteReverseInventoryHandling(postingRequestModel,userId);
				CreditNote creditNote = creditNoteRepository.findById(postingRequestModel.getPostingRefId()).get();
				creditNote.setStatus(CommonStatusEnum.PENDING.getValue());
				creditNote.setDueAmount(creditNote.getDueAmount());
				creditNoteRepository.save(creditNote);
			}
			List<JournalLineItem> invoiceJliList= journalLineItemRepository.findAllByReferenceIdAndReferenceType(
					postingRequestModel.getPostingRefId(),
					PostingReferenceTypeEnum.CREDIT_NOTE);

			for(JournalLineItem journalLineItem:invoiceJliList){

				journalLineItem.setReversalFlag(Boolean.TRUE);
				Journal journal1 = journalLineItem.getJournal();
				journal1.setReversalFlag(Boolean.TRUE);
				journalLineItemRepository.save(journalLineItem);
				journalService.update(journal1);

			}
		}
		else if (postingRequestModel.getPostingRefType().equalsIgnoreCase(PostingReferenceTypeEnum.DEBIT_NOTE.name())){
			List<JournalLineItem> invoiceJliList= journalLineItemRepository.findAllByReferenceIdAndReferenceType(
					postingRequestModel.getPostingRefId(),
					PostingReferenceTypeEnum.DEBIT_NOTE);

			for(JournalLineItem journalLineItem:invoiceJliList){

				journalLineItem.setReversalFlag(Boolean.TRUE);
				Journal journal1 = journalLineItem.getJournal();
				journal1.setReversalFlag(Boolean.TRUE);
				journalLineItemRepository.save(journalLineItem);
				journalService.update(journal1);

			}
			journal = creditNoteRestHelper.reverseDebitNotePosting(postingRequestModel, userId);
			if (journal != null) {
				journalService.persist(journal);
				creditNoteRestHelper.creditNoteReverseInventoryHandling(postingRequestModel,userId);
				CreditNote creditNote = creditNoteRepository.findById(postingRequestModel.getPostingRefId()).get();
				creditNote.setStatus(CommonStatusEnum.PENDING.getValue());
				creditNote.setDueAmount(creditNote.getDueAmount());
				creditNoteRepository.save(creditNote);
			}
		}
		else if (postingRequestModel.getPostingRefType().equalsIgnoreCase(PostingReferenceTypeEnum.EXPENSE.name())) {

			List<JournalLineItem> expenseJliList= journalLineItemRepository.findAllByReferenceIdAndReferenceType(
					postingRequestModel.getPostingRefId(),
					PostingReferenceTypeEnum.EXPENSE);
			for(JournalLineItem journalLineItem:expenseJliList) {
				journalLineItem.setReversalFlag(Boolean.TRUE);
				journalLineItem.setDeleteFlag(Boolean.TRUE);
				Journal journal1 = journalLineItem.getJournal();
				journal1.setReversalFlag(Boolean.TRUE);
				journalLineItemRepository.save(journalLineItem);
				journalService.update(journal1);
			}
			journal = expenseRestHelper.reverseExpensePosting(postingRequestModel, userId);
			if (journal != null) {
				journalService.persist(journal);
				Expense expense = expenseService.findByPK(postingRequestModel.getPostingRefId());
				if (expense.getPayee().equalsIgnoreCase(CommonColumnConstants.COMPANY_EXPENSE)){
				TransactionExpenses transactionExpenses =  transactionExpensesRepository.findByExpense(expense);
				transactionExpensesService.delete(transactionExpenses);
				Transaction transaction = transactionService.findByPK(transactionExpenses.getTransaction().getTransactionId());
				TransactionExplanation transactionExplanation = transactionExplanationRepository.getTransactionExplanationsByTransaction(transaction).get(0);
				transactionExplanationRepository.delete(transactionExplanation);
				transaction.setDeleteFlag(Boolean.TRUE);
				transactionService.deleteTransaction(transaction);
				}
				expense.setStatus(ExpenseStatusEnum.DRAFT.getValue());
				expenseService.update(expense);}

			}

		return new ResponseEntity<>("Journal Entries created Successfully", HttpStatus.OK);
	}

	@LogRequest
	@PostMapping(value = "/stockInHandTestForProduct")
	public ResponseEntity<Object> stockInHandTestForProduct(@RequestParam int invoiceId)
	{
		Invoice invoice = invoiceService.findByPK(invoiceId);
		int stockOnHand = 0;
		for (InvoiceLineItem lineItem : invoice.getInvoiceLineItems())
		{

			if(lineItem.getProduct().getIsInventoryEnabled().equals(Boolean.TRUE)){
				List<Inventory> inventoryList = inventoryService.getProductByProductId(lineItem.getProduct().getProductID());

				for (Inventory inventory : inventoryList)
					stockOnHand = stockOnHand+inventory.getStockOnHand();
			}
		}
		List<InvoiceLineItem> inventoryLineItemList = invoice.getInvoiceLineItems().stream().filter(invoiceLineItem ->
				invoiceLineItem.getProduct().getIsInventoryEnabled().equals(Boolean.TRUE)).collect(Collectors.toList());
		if (inventoryLineItemList.size()>0 && stockOnHand == 0){
			return new ResponseEntity<>("false",HttpStatus.EXPECTATION_FAILED);
		}
		return new  ResponseEntity<>("true", HttpStatus.OK);
	}

}
