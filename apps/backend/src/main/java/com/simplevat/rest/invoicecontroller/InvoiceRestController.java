package com.simplevat.rest.invoicecontroller;

import static com.simplevat.constant.ErrorConstant.ERROR;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import com.simplevat.repository.JournalLineItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.simplevat.aop.LogRequest;
import com.simplevat.bank.model.DeleteModel;
import com.simplevat.constant.ContactTypeEnum;
import com.simplevat.constant.FileTypeEnum;
import com.simplevat.constant.CommonStatusEnum;
import com.simplevat.constant.dbfilter.InvoiceFilterEnum;
import com.simplevat.entity.CreditNoteInvoiceRelation;
import com.simplevat.entity.Expense;
import com.simplevat.entity.FileAttachment;
import com.simplevat.entity.Invoice;
import com.simplevat.entity.Journal;
import com.simplevat.entity.PlaceOfSupply;
import com.simplevat.entity.QuotationInvoiceRelation;
import com.simplevat.entity.User;
import com.simplevat.helper.ExpenseRestHelper;
import com.simplevat.model.EarningDetailsModel;
import com.simplevat.model.OverDueAmountDetailsModel;
import com.simplevat.model.PlaceOfSupplyResponseModel;
import com.simplevat.repository.QuotationInvoiceRepository;
import com.simplevat.rest.AbstractDoubleEntryRestController;
import com.simplevat.rest.DropdownModel;
import com.simplevat.rest.InviceSingleLevelDropdownModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.rest.PostingRequestModel;
import com.simplevat.rest.financialreport.AmountDetailRequestModel;
import com.simplevat.rest.invoice.dto.VatAmountDto;
import com.simplevat.rfq_po.PoQuatation;
import com.simplevat.rfq_po.PoQuatationService;
import com.simplevat.security.JwtTokenUtil;
import com.simplevat.service.BankAccountService;
import com.simplevat.service.ContactService;
import com.simplevat.service.CreditNoteInvoiceRelationService;
import com.simplevat.service.CurrencyService;
import com.simplevat.service.ExpenseService;
import com.simplevat.service.FileAttachmentService;
import com.simplevat.service.InvoiceLineItemService;
import com.simplevat.service.InvoiceService;
import com.simplevat.service.PlaceOfSupplyService;
import com.simplevat.service.UserService;
import com.simplevat.utils.ChartUtil;
import com.simplevat.utils.FileHelper;
import com.simplevat.utils.MessageUtil;
import com.simplevat.utils.SimpleVatMessage;

import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.extern.slf4j.Slf4j;

/**
 *
 * @author a shish
 */
@Slf4j
@RestController
@RequestMapping(value = "/rest/invoice")
public class InvoiceRestController extends AbstractDoubleEntryRestController {
	private final Logger logger = LoggerFactory.getLogger(InvoiceRestController.class);
	@Autowired
	private JwtTokenUtil jwtTokenUtil;

	@Autowired
	private InvoiceRestHelper invoiceRestHelper;
	@Autowired
	private BankAccountService bankAccountService;

	@Autowired
	private InvoiceService invoiceService;

	@Autowired
	private ContactService contactService;

	@Autowired
	private ChartUtil chartUtil;

	@Autowired
	private ExpenseRestHelper expenseRestHelper;

	@Autowired
	private ExpenseService expenseService;

	@Autowired
	private CurrencyService currencyService;

	@Autowired
	private UserService userService;

	@Autowired
	private InvoiceLineItemService invoiceLineItemService;

	@Autowired
	private PlaceOfSupplyService placeOfSupplyService;

	@Autowired
    private FileAttachmentService fileAttachmentService;

	@Autowired
	private CreditNoteInvoiceRelationService creditNoteInvoiceRelationService;

	@Autowired
	private PoQuatationService poQuatationService;

	@Autowired
	private QuotationInvoiceRepository quotationInvoiceRepository;

	@Autowired
	private JournalLineItemRepository journalLineItemRepository;

	@LogRequest
	@ApiOperation(value = "Get Invoice List")
	@GetMapping(value = "/getList")
	public ResponseEntity<PaginationResponseModel> getInvoiceList(InvoiceRequestFilterModel filterModel,
			HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);
			Map<InvoiceFilterEnum, Object> filterDataMap = new EnumMap<>(InvoiceFilterEnum.class);
			if(user.getRole().getRoleCode()!=1) {
				filterDataMap.put(InvoiceFilterEnum.USER_ID, userId);
			}
			if (filterModel.getContact() != null) {
				filterDataMap.put(InvoiceFilterEnum.CONTACT, contactService.findByPK(filterModel.getContact()));
			}
			if(filterModel.getCurrencyCode()!=null){
				filterDataMap.put(InvoiceFilterEnum.CURRECY, currencyService.findByPK(filterModel.getCurrencyCode()));
			}
			filterDataMap.put(InvoiceFilterEnum.INVOICE_NUMBER, filterModel.getReferenceNumber());
			if (filterModel.getAmount() != null) {
				filterDataMap.put(InvoiceFilterEnum.INVOICE_AMOUNT, filterModel.getAmount());
			}
			if (filterModel.getInvoiceDate() != null && !filterModel.getInvoiceDate().isEmpty()) {
//				SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
//				Date dateTime =  dateFormat.parse(filterModel.getInvoiceDate());
				LocalDate date = LocalDate.parse(filterModel.getInvoiceDate());
//				LocalDateTime dateTime = Instant.ofEpochMilli(dateFormat.parse(filterModel.getInvoiceDate()).getTime())
//					.atZone(ZoneId.systemDefault()).toLocalDateTime();
				filterDataMap.put(InvoiceFilterEnum.INVOICE_DATE, date);
			}
			if (filterModel.getInvoiceDueDate() != null && !filterModel.getInvoiceDueDate().isEmpty()) {
//				SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
				LocalDate date = LocalDate.parse(filterModel.getInvoiceDueDate());
//				LocalDateTime dateTime = Instant
//						.ofEpochMilli(dateFormat.parse(filterModel.getInvoiceDueDate()).getTime())
//						.atZone(ZoneId.systemDefault()).toLocalDateTime();
				filterDataMap.put(InvoiceFilterEnum.INVOICE_DUE_DATE, date);
			}
			filterDataMap.put(InvoiceFilterEnum.STATUS, filterModel.getStatus());

			filterDataMap.put(InvoiceFilterEnum.DELETE_FLAG, false);
			filterDataMap.put(InvoiceFilterEnum.TYPE, filterModel.getType());

			PaginationResponseModel responseModel = invoiceService.getInvoiceList(filterDataMap, filterModel);
			if (responseModel == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
			responseModel.setData(invoiceRestHelper.getListModel(responseModel.getData()));
			return new ResponseEntity<>(responseModel, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@GetMapping(value = "/getInvoicesForDropdown")
	public ResponseEntity<List<DropdownModel>> getInvoicesForDropdown(@RequestParam (value = "type") Integer type) {
		try {
			return new ResponseEntity<>(invoiceService.getInvoicesForDropdown(type), HttpStatus.OK);
		}catch (Exception e){
			logger.error(ERROR,e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete Invoice By ID")
	@DeleteMapping(value = "/delete")
	public ResponseEntity<?> delete(@RequestParam(value = "id") Integer id) {
		Invoice invoice = invoiceService.findByPK(id);
		try {
			SimpleVatMessage message = null;
			if(invoice!=null){
				invoice.setDeleteFlag(Boolean.TRUE);
				invoiceService.update(invoice);
			}
			message = new SimpleVatMessage("0044",
					MessageUtil.getMessage("invoice.deleted.successful.msg.0044"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
		}catch (Exception e){
			SimpleVatMessage message= null;
			message = new SimpleVatMessage("",
					MessageUtil.getMessage("delete.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
//		InvoiceLineItem invoiceLineItem = invoiceLineItemService.deleteByInvoiceId(invoice.getId());
//		if (invoiceLineItem!=null){
//			invoiceLineItemService.delete(invoiceLineItem);
//		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete Invoices in Bulk")
	@DeleteMapping(value = "/deletes")
	public ResponseEntity<?> delete(@RequestBody DeleteModel ids) {
		try {
			SimpleVatMessage message= null;
			message = new SimpleVatMessage("0044",
					MessageUtil.getMessage("invoice.deleted.successful.msg.0044"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {
			SimpleVatMessage message= null;
			message = new SimpleVatMessage("",
					MessageUtil.getMessage("delete.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@ApiOperation(value = "Get Invoice By ID")
	@GetMapping(value = "/getInvoiceById")
	public ResponseEntity<InvoiceRequestModel> getInvoiceById(@RequestParam(value = "id") Integer id) {
		Invoice invoice = invoiceService.findByPK(id);
		if (invoice == null) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		} else {
			return new ResponseEntity<>(invoiceRestHelper.getRequestModel(invoice), HttpStatus.OK);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Add New Invoice")
	@PostMapping(value = "/save")
	public ResponseEntity<?> save(@ModelAttribute InvoiceRequestModel requestModel, HttpServletRequest request) {
		try {
			SimpleVatMessage message = null;
			    String rootPath = request.getServletContext().getRealPath("/");
			log.info("filePath {}",rootPath);
			FileHelper.setRootPath(rootPath);
			log.info("In Controller :{}",requestModel.getInvoiceDueDate());
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			Boolean checkInvoiceNumber = invoiceRestHelper.doesInvoiceNumberExist(requestModel.getReferenceNumber());
			if (checkInvoiceNumber){
				SimpleVatMessage errorMessage = new SimpleVatMessage("0023",
						MessageUtil.getMessage("invoicenumber.alreadyexists.0023"), true);
				logger.info(errorMessage.getMessage());
				return new  ResponseEntity(errorMessage, HttpStatus.BAD_REQUEST);

			}
			Invoice invoice = invoiceRestHelper.getEntity(requestModel, userId);
			invoice.setCreatedBy(userId);
			invoice.setCreatedDate(LocalDateTime.now());
			invoice.setDeleteFlag(Boolean.FALSE);
			//To save the uploaded file in
			if (requestModel.getAttachmentFile()!=null) {
				MultipartFile file = requestModel.getAttachmentFile();
				if (file != null) {
					FileAttachment fileAttachment = fileAttachmentService.storeFile(file, requestModel.getType().equals(ContactTypeEnum.SUPPLIER.getValue().toString())
							? FileTypeEnum.SUPPLIER_INVOICE
							: FileTypeEnum.CUSTOMER_INVOICE, requestModel);
					invoice.setAttachmentFileName(fileAttachment);
				}
			}
			invoiceService.persist(invoice);
			if(requestModel.getQuotationId()!= null) {
				QuotationInvoiceRelation quotationInvoiceRelation = new QuotationInvoiceRelation();
				quotationInvoiceRelation.setInvoice(invoice);
				PoQuatation quatation = poQuatationService.findByPK(requestModel.getQuotationId());
				quotationInvoiceRelation.setPoQuatation(quatation);
				quotationInvoiceRelation.setDeleteFlag(Boolean.FALSE);
				quotationInvoiceRepository.save(quotationInvoiceRelation);
				quatation.setStatus(CommonStatusEnum.INVOICED.getValue());
				poQuatationService.update(quatation);

			}
			message = new SimpleVatMessage("0045",
					MessageUtil.getMessage("invoice.created.successful.msg.0045"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {
			SimpleVatMessage message= null;
			message = new SimpleVatMessage("",
					MessageUtil.getMessage("create.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Update Invoice")
	@PostMapping(value = "/update")
	public ResponseEntity<?> update(@ModelAttribute InvoiceRequestModel requestModel, HttpServletRequest request) {
		try {
			SimpleVatMessage message= null;
			String rootPath = request.getServletContext().getRealPath("/");
			log.info("filePath {}",rootPath);
			FileHelper.setRootPath(rootPath);
			log.info("In Update {}",requestModel.getInvoiceDueDate());
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
//			Boolean checkInvoiceNumber = invoiceRestHelper.doesInvoiceNumberExist(requestModel.getReferenceNumber());
//			if (checkInvoiceNumber){
//				SimpleVatMessage errorMessage = new SimpleVatMessage("0023",
//						MessageUtil.getMessage("invoicenumber.alreadyexists.0023"), true);
//				logger.info(errorMessage.getMessage());
//				return new  ResponseEntity(errorMessage, HttpStatus.BAD_REQUEST);
//
//			}
			Invoice invoice = invoiceRestHelper.getEntity(requestModel, userId);
			if (requestModel.getAttachmentFile()!=null) {
				MultipartFile file = requestModel.getAttachmentFile();
				if (file != null) {
					FileAttachment fileAttachment = fileAttachmentService.storeFile(file, requestModel.getType().equals(ContactTypeEnum.SUPPLIER.getValue().toString())
							? FileTypeEnum.SUPPLIER_INVOICE
							: FileTypeEnum.CUSTOMER_INVOICE, requestModel);
					invoice.setAttachmentFileName(fileAttachment);
				}
			}
			invoice.setLastUpdateBy(userId);
			invoice.setLastUpdateDate(LocalDateTime.now());
			invoiceService.update(invoice, invoice.getId());
			//invoiceService.deleteJournaForInvoice(invoice);
			if (invoice.getStatus().equals(CommonStatusEnum.POST.getValue())) {
				// persist updated journal
				Journal journal = invoiceRestHelper.invoicePosting(new PostingRequestModel(invoice.getId()), userId);
				journalService.persist(journal);
			}
			message = new SimpleVatMessage("0046",
					MessageUtil.getMessage("invoice.updated.successful.msg.0046"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);		}
			catch (Exception e) {
				SimpleVatMessage message= null;
				message = new SimpleVatMessage("",
					MessageUtil.getMessage("update.unsuccessful.msg"), true);
				return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@ApiOperation(value = "Next invoice No")
	@GetMapping(value = "/getNextInvoiceNo")
	public ResponseEntity<Integer> getNextInvoiceNo(@RequestParam(value = "invoiceType") Integer invoiceType) {
		try {
			Integer nxtInvoiceNo = invoiceService.getLastInvoiceNo(invoiceType);
			if (nxtInvoiceNo == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
			return new ResponseEntity<>(nxtInvoiceNo, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@ApiOperation(value = "Get chart data")
	@GetMapping(value = "/getChartData")
	public ResponseEntity<Object> getChartData(@RequestParam int monthCount) {
		try {
			List<Invoice> invList = invoiceService.getInvoiceList(monthCount);
			if (invList == null) {
				return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
			}
			return new ResponseEntity<>(chartUtil.getinvoiceData(invList, monthCount), HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @Deprecated
	 * @param id
	 * @param request
	 * @return
	 */
	@LogRequest
	@ApiOperation(value = "Send Invoice")
	@PostMapping(value = "/send")
	public ResponseEntity<?> update(@RequestParam("id") Integer id, HttpServletRequest request) {
		try {
			SimpleVatMessage message= null;
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			invoiceRestHelper.send(invoiceService.findByPK(id), userId,new PostingRequestModel() ,request);

			message = new SimpleVatMessage("0047",
					MessageUtil.getMessage("invoice.post.successful.msg.0047"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {
			SimpleVatMessage message= null;
			message = new SimpleVatMessage("",
					MessageUtil.getMessage("sent.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * This method web service will retriever the OverDueAmountDetails To Be Paid
	 * for the the specific user
	 * 
	 * @param request HTTP servelet request
	 * @return Response entity
	 */
	@LogRequest
	@ApiOperation(value = "Get Overdue Amount Details")
	@GetMapping(value = "/getOverDueAmountDetails")
	public ResponseEntity<OverDueAmountDetailsModel> getOverDueAmountDetails(HttpServletRequest request) {
		try {
			Integer type = Integer.parseInt(request.getParameter("type"));
			OverDueAmountDetailsModel overDueAmountDetails = new OverDueAmountDetailsModel();
			overDueAmountDetails.setOverDueAmount(BigDecimal.ZERO.floatValue());
			overDueAmountDetails.setOverDueAmountWeekly(BigDecimal.ZERO.floatValue());
			overDueAmountDetails.setOverDueAmountMonthly(BigDecimal.ZERO.floatValue());
			InvoiceDueAmountResultSet dueAmountResultSet = null;
			if (type==2) {
				dueAmountResultSet = journalLineItemRepository.geCustomerDueAmount();
			}
			else {
               dueAmountResultSet = journalLineItemRepository.getSupplierDueAmount();
			}
				if (dueAmountResultSet.getTotalOverdue() != null) {
					overDueAmountDetails.setOverDueAmount(dueAmountResultSet.getTotalOverdue().floatValue());
				}
				if (dueAmountResultSet.getThisWeekOverdue() != null) {
					overDueAmountDetails.setOverDueAmountWeekly(dueAmountResultSet.getThisWeekOverdue().floatValue());
				}
				if (dueAmountResultSet.getThisMonthOverdue() != null) {
					overDueAmountDetails.setOverDueAmountMonthly(dueAmountResultSet.getThisMonthOverdue().floatValue());
				}

			//OverDueAmountDetailsModel overDueAmountDetails = invoiceService.getOverDueAmountDetails(type);
			return new ResponseEntity<>(overDueAmountDetails, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	@LogRequest
	@ApiOperation(value = "Get Total Earnings Amount Details")
	@GetMapping(value = "/getTotalEarningsAmountDetails")
	public ResponseEntity<EarningDetailsModel> getTotalEarningsAmountDetails(HttpServletRequest request) {
		try {
			EarningDetailsModel earningDetailsModel = invoiceService.getTotalEarnings();
			return new ResponseEntity<>(earningDetailsModel, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * getUnpaid invoice
	 * 
	 * @param contactId Contact Id
	 * @return list InvoiceDueAmountModel datalist
	 */
	@LogRequest
	@ApiOperation(value = "Get Overdue Amount Details")
	@GetMapping(value = "/getDueInvoices")
	public ResponseEntity<List<InvoiceDueAmountModel>> getDueInvoiceForContact(@RequestParam("id") Integer contactId,
			@RequestParam("type") ContactTypeEnum type,HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			User user = userService.findByPK(userId);
			List<Invoice> invoiceList = invoiceService.getUnpaidInvoice(contactId, type);
			return new ResponseEntity<>(invoiceRestHelper.getDueInvoiceList(invoiceList,user), HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * Get Suggestion Invoices & expense for transaction explanation
	 *
	 * @param contactId Contact Id
	 * @return List<InvoiceDueAmountModel> InvoiceDueAmountModel data list
	 */
	@LogRequest
	@ApiOperation(value = "Get Suggestion ofUnpaid Invoices for transaction explination")
	@GetMapping(value = "/getSuggestionExplainedForVend")
	public ResponseEntity<List<InviceSingleLevelDropdownModel>> getSuggestionExplainedForVend(
			@RequestParam("amount") BigDecimal amount, 	@RequestParam("currency") Integer currency, @RequestParam("id") Integer contactId,@RequestParam("bankId") Integer bankId,
			HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
//			Currency currency = bankAccountService.getBankAccountById(bankId).getBankAccountCurrency();
			List<Invoice> invoiceList = invoiceService.getSuggestionExplainedInvoices(amount, contactId,
					ContactTypeEnum.SUPPLIER,currency, userId);
			List<InviceSingleLevelDropdownModel> responseList = invoiceRestHelper.getDropDownModelList(invoiceList);
			return new ResponseEntity<>(responseList, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Get Suggestion Invoices for transaction explanation
	 *
	 * @param contactId Contact Id
	 * @return List<InvoiceDueAmountModel> InvoiceDueAmountModel data list
	 */
	@LogRequest
	@ApiOperation(value = "Get Suggestion ofUnpaid Invoices for transaction explination")
	@GetMapping(value = "/getSuggestionExplainedForCust")
	public ResponseEntity<List<InviceSingleLevelDropdownModel>> getSuggestionExplainedForCust(
			@RequestParam("amount") BigDecimal amount, 	@RequestParam("currency") Integer currency,@RequestParam("id") Integer contactId,@RequestParam("bankId") Integer bankId,
			HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
//			Currency currency = bankAccountService.getBankAccountById(bankId).getBankAccountCurrency();
			List<Invoice> invoiceList = invoiceService.getSuggestionExplainedInvoices(amount, contactId,
					ContactTypeEnum.CUSTOMER, currency,userId);
			return new ResponseEntity<>(invoiceRestHelper.getDropDownModelList(invoiceList), HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Get Suggestion Invoices for transaction explanation
	 * 
	 * @param contactId Contact Id
	 * @return List<InvoiceDueAmountModel> InvoiceDueAmountModel data list
	 */
	@LogRequest
	@ApiOperation(value = "Get Suggestion ofUnpaid Invoices for transaction explination")
	@GetMapping(value = "/getSuggestionInvoicesFotCust")
	public ResponseEntity<List<InviceSingleLevelDropdownModel>> getSuggestionUnpaidInvoicesForCustomer(
			@RequestParam("amount") BigDecimal amount,	@RequestParam("currency") Integer currency, @RequestParam("id") Integer contactId,@RequestParam("bankId") Integer bankId,
			HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
//			Currency currency = bankAccountService.getBankAccountById(bankId).getBankAccountCurrency();
			List<Invoice> invoiceList = invoiceService.getSuggestionInvoices(amount, contactId,
					ContactTypeEnum.CUSTOMER, currency,userId);
			return new ResponseEntity<>(invoiceRestHelper.getDropDownModelList(invoiceList), HttpStatus.OK);
//			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Get Suggestion Invoices & expense for transaction explanation
	 * 
	 * @param contactId Contact Id
	 * @return List<InvoiceDueAmountModel> InvoiceDueAmountModel data list
	 */
	@LogRequest
	@ApiOperation(value = "Get Suggestion ofUnpaid Invoices for transaction explination")
	@GetMapping(value = "/getSuggestionInvoicesFotVend")
	public ResponseEntity<List<InviceSingleLevelDropdownModel>> getSuggestionUnpaidInvoicesForVendor(
			@RequestParam("amount") BigDecimal amount,@RequestParam("id")   Integer contactId,@RequestParam("currency") Integer currency,@RequestParam("bankId") Integer bankId,
			HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
//			Currency currency = bankAccountService.getBankAccountById(bankId).getBankAccountCurrency();
			List<Invoice> invoiceList = invoiceService.getSuggestionInvoices(amount, contactId,ContactTypeEnum.SUPPLIER,currency,userId);

			List<InviceSingleLevelDropdownModel> responseList = invoiceRestHelper.getDropDownModelList(invoiceList);
			return new ResponseEntity<>(responseList, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Get Suggestion Invoices & expense for transaction explanation
	 *
	 * @param amount select expenses < or = to the amount given
	 * @return List<InvoiceDueAmountModel> InvoiceDueAmountModel data list
	 */
	@LogRequest
	@ApiOperation(value = "Get Suggestion ofUnpaid Expenses for transaction explination")
	@GetMapping(value = "/getSuggestionExpenses")
	public ResponseEntity<List<InviceSingleLevelDropdownModel>> getSuggestionExpenses(
			@RequestParam("amount") BigDecimal amount,
			HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			List<Expense> expenseList = expenseService.getUnMappedExpenses(userId,amount);
			List<InviceSingleLevelDropdownModel> responseList = expenseRestHelper.getDropDoenModelList(expenseList);
			return new ResponseEntity<>(responseList, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@ApiOperation(value = "Get Invoices Count For receipt")
	@GetMapping(value = "/getCustomerInvoicesCountForDelete")
	public ResponseEntity<Integer> getCustomerInvoicesCountForDelete(@RequestParam int invoiceId){
		try {
			Integer response = invoiceService.getReceiptCountByCustInvoiceId(invoiceId);
			return new ResponseEntity<>(response, HttpStatus.OK);
		}catch (Exception e){
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	@LogRequest
	@ApiOperation(value = "Get Invoices Count For receipt")
	@GetMapping(value = "/getSupplierInvoicesCountForDelete")
	public ResponseEntity<Integer> getSupInvoicesCountForDelete(@RequestParam int invoiceId){
		try {
			Integer response = invoiceService.getReceiptCountBySupInvoiceId(invoiceId);
			return new ResponseEntity<>(response, HttpStatus.OK);
		}catch (Exception e){
			logger.error(ERROR,e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@GetMapping(value = "/getPlaceOfSupplyForDropdown")
	public ResponseEntity<?> getPlaceOfSupplyForDropdown() {
		try {
			List<PlaceOfSupplyResponseModel> response  = new ArrayList<>();
			List<PlaceOfSupply> modulesList=placeOfSupplyService.getPlaceOfSupplyForDropdown();
			if (modulesList!=null){
				response = getPlaceOfSupply(modulesList);
			}

			return new ResponseEntity<>(response, HttpStatus.OK);
		}catch (Exception e){
			logger.error(ERROR,e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Added By Nilesh Deshmukh,Suraj Rahade,Zain Khan
	 * Date :-03-02-2021
	 * @param fileId
	 * @return this method will return the Saved File.
	 */
	@LogRequest
    @GetMapping(value = "/downloadFile/{fileId}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Integer fileId) {
        // Load file from database
		try {
			FileAttachment fileAttachment = fileAttachmentService.getFile(fileId);
			return ResponseEntity.ok()
					.contentType(MediaType.parseMediaType(fileAttachment.getFileType()))
					.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileAttachment.getFileName() + "\"")
					.body(new ByteArrayResource(fileAttachment.getFileData()));
		}catch (Exception e){
			logger.error(ERROR,e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
    }
	
	public List<PlaceOfSupplyResponseModel> getPlaceOfSupply(Object placeOfSupply){
		List<PlaceOfSupplyResponseModel> responseList = new ArrayList<>();
		if (placeOfSupply!=null){
			for (PlaceOfSupply placeOfSupplyName:(List<PlaceOfSupply>) placeOfSupply){
				PlaceOfSupplyResponseModel placeOfSupplyResponseModel = new PlaceOfSupplyResponseModel();
				if (placeOfSupplyName.getId()!=null){
					placeOfSupplyResponseModel.setId(placeOfSupplyName.getId());
				}
				if (placeOfSupplyName.getPlaceOfSupply()!=null){
					placeOfSupplyResponseModel.setPlaceOfSupplyName(placeOfSupplyName.getPlaceOfSupply());
				}
				responseList.add(placeOfSupplyResponseModel);
			}
		}
		return responseList;
	}
	
    
	/**
     * This API is used to get vat Amount details.
     *
     * @param 
     * @return 
     */
    @LogRequest
    @ApiOperation(value = "GetAmountDetails ", notes = "Getting Amount Details")
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Successful"), @ApiResponse(code = 500, message = "Internal Server Error")})
    @GetMapping(value = "/getAmountDetails")
    public ResponseEntity<List<VatAmountDto>> getAmountDetails(AmountDetailRequestModel amountDetailRequestModel, HttpServletRequest request) {
		try {
			List<VatAmountDto> response = invoiceService.getAmountDetails(amountDetailRequestModel);
			if (response == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
			return new ResponseEntity<>(response, HttpStatus.OK);

		} catch (Exception e) {
			logger.error("InvoiceRestController:: Exception in getAmountDetails: ", e);
			return (new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
		}
    }
    
}