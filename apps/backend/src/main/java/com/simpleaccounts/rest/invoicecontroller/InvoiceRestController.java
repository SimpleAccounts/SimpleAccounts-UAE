package com.simpleaccounts.rest.invoicecontroller;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.bank.model.DeleteModel;
import com.simpleaccounts.constant.CommonStatusEnum;
import com.simpleaccounts.constant.ContactTypeEnum;
import com.simpleaccounts.constant.FileTypeEnum;
import com.simpleaccounts.constant.dbfilter.InvoiceFilterEnum;
import com.simpleaccounts.entity.Expense;
import com.simpleaccounts.entity.FileAttachment;
import com.simpleaccounts.entity.Invoice;
import com.simpleaccounts.entity.Journal;
import com.simpleaccounts.entity.PlaceOfSupply;
import com.simpleaccounts.entity.QuotationInvoiceRelation;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.helper.ExpenseRestHelper;
import com.simpleaccounts.model.EarningDetailsModel;
import com.simpleaccounts.model.OverDueAmountDetailsModel;
import com.simpleaccounts.model.PlaceOfSupplyResponseModel;
import com.simpleaccounts.repository.JournalLineItemRepository;
import com.simpleaccounts.repository.QuotationInvoiceRepository;
import com.simpleaccounts.rest.AbstractDoubleEntryRestController;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.InviceSingleLevelDropdownModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.PostingRequestModel;
import com.simpleaccounts.rest.financialreport.AmountDetailRequestModel;
import com.simpleaccounts.rest.invoice.dto.VatAmountDto;
import com.simpleaccounts.rfq_po.PoQuatation;
import com.simpleaccounts.rfq_po.PoQuatationService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.BankAccountService;
import com.simpleaccounts.service.ContactService;
import com.simpleaccounts.service.CreditNoteInvoiceRelationService;
import com.simpleaccounts.service.CurrencyService;
import com.simpleaccounts.service.ExpenseService;
import com.simpleaccounts.service.FileAttachmentService;
import com.simpleaccounts.service.InvoiceLineItemService;
import com.simpleaccounts.service.InvoiceService;
import com.simpleaccounts.service.PlaceOfSupplyService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.utils.ChartUtil;
import com.simpleaccounts.utils.FileHelper;
import com.simpleaccounts.utils.MessageUtil;
import com.simpleaccounts.utils.SimpleAccountsMessage;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
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
import static com.simpleaccounts.constant.ErrorConstant.ERROR;

/**
 *
 * @author a shish
 */
@Slf4j
@RestController
@RequestMapping(value = "/rest/invoice")
@RequiredArgsConstructor
public class InvoiceRestController extends AbstractDoubleEntryRestController {
	private final Logger logger = LoggerFactory.getLogger(InvoiceRestController.class);
	private final JwtTokenUtil jwtTokenUtil;

	private final InvoiceRestHelper invoiceRestHelper;
	private final BankAccountService bankAccountService;

	private final InvoiceService invoiceService;

	private final ContactService contactService;

	private final ChartUtil chartUtil;

	private final ExpenseRestHelper expenseRestHelper;

	private final ExpenseService expenseService;

	private final CurrencyService currencyService;

	private final UserService userService;

	private final InvoiceLineItemService invoiceLineItemService;

	private final PlaceOfSupplyService placeOfSupplyService;

	private final FileAttachmentService fileAttachmentService;

	private final CreditNoteInvoiceRelationService creditNoteInvoiceRelationService;

	private final PoQuatationService poQuatationService;

	private final QuotationInvoiceRepository quotationInvoiceRepository;

	private final JournalLineItemRepository journalLineItemRepository;

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

				LocalDate date = LocalDate.parse(filterModel.getInvoiceDate());

				filterDataMap.put(InvoiceFilterEnum.INVOICE_DATE, date);
			}
			if (filterModel.getInvoiceDueDate() != null && !filterModel.getInvoiceDueDate().isEmpty()) {

				LocalDate date = LocalDate.parse(filterModel.getInvoiceDueDate());

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
	public ResponseEntity<Object> delete(@RequestParam(value = "id") Integer id) {
		Invoice invoice = invoiceService.findByPK(id);
		try {
			SimpleAccountsMessage message = null;
			if(invoice!=null){
				invoice.setDeleteFlag(Boolean.TRUE);
				invoiceService.update(invoice);
			}
			message = new SimpleAccountsMessage("0044",
					MessageUtil.getMessage("invoice.deleted.successful.msg.0044"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
		}catch (Exception e){
			SimpleAccountsMessage message= null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("delete.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete Invoices in Bulk")
	@DeleteMapping(value = "/deletes")
	public ResponseEntity<Object> delete(@RequestBody DeleteModel ids) {
		try {
			int requestedIds = ids != null && ids.getIds() != null ? ids.getIds().size() : 0;
			logger.info("Bulk invoice delete requested for {} ids", requestedIds);
			SimpleAccountsMessage message= null;
			message = new SimpleAccountsMessage("0044",
					MessageUtil.getMessage("invoice.deleted.successful.msg.0044"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {
			SimpleAccountsMessage message= null;
			message = new SimpleAccountsMessage("",
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
	public ResponseEntity<Object> save(@ModelAttribute InvoiceRequestModel requestModel, HttpServletRequest request) {
		try {
			SimpleAccountsMessage message = null;
			    String rootPath = request.getServletContext().getRealPath("/");
			log.info("filePath {}",rootPath);
			FileHelper.setRootPath(rootPath);
			log.info("In Controller :{}",requestModel.getInvoiceDueDate());
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			Boolean checkInvoiceNumber = invoiceRestHelper.doesInvoiceNumberExist(requestModel.getReferenceNumber());
				if (Boolean.TRUE.equals(checkInvoiceNumber)){
					SimpleAccountsMessage errorMessage = new SimpleAccountsMessage("0023",
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
			message = new SimpleAccountsMessage("0045",
					MessageUtil.getMessage("invoice.created.successful.msg.0045"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {
			SimpleAccountsMessage message= null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("create.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Update Invoice")
	@PostMapping(value = "/update")
	public ResponseEntity<Object> update(@ModelAttribute InvoiceRequestModel requestModel, HttpServletRequest request) {
		try {
			SimpleAccountsMessage message= null;
			String rootPath = request.getServletContext().getRealPath("/");
			log.info("filePath {}",rootPath);
			FileHelper.setRootPath(rootPath);
			log.info("In Update {}",requestModel.getInvoiceDueDate());
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);

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

			if (invoice.getStatus().equals(CommonStatusEnum.POST.getValue())) {
				// persist updated journal
				Journal journal = invoiceRestHelper.invoicePosting(new PostingRequestModel(invoice.getId()), userId);
				journalService.persist(journal);
			}
			message = new SimpleAccountsMessage("0046",
					MessageUtil.getMessage("invoice.updated.successful.msg.0046"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);		}
			catch (Exception e) {
				SimpleAccountsMessage message= null;
				message = new SimpleAccountsMessage("",
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
	@Cacheable(cacheNames = "dashboardInvoiceChart", key = "#monthCount")
	@ApiOperation(value = "Get chart data")
	@GetMapping(value = "/getChartData")
	public ResponseEntity<Object> getChartData(@RequestParam int monthCount) {
		try {
			long start = System.currentTimeMillis();
			List<Invoice> invList = invoiceService.getInvoiceList(monthCount);
			if (invList == null) {
				return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
			}
			Object result = chartUtil.getinvoiceData(invList, monthCount);
			logger.info("[PERF] getChartData for {} months took {} ms", monthCount, System.currentTimeMillis() - start);
			return new ResponseEntity<>(result, HttpStatus.OK);
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
	public ResponseEntity<Object> update(@RequestParam("id") Integer id, HttpServletRequest request) {
		try {
			SimpleAccountsMessage message= null;
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			invoiceRestHelper.send(invoiceService.findByPK(id), userId,new PostingRequestModel() ,request);

			message = new SimpleAccountsMessage("0047",
					MessageUtil.getMessage("invoice.post.successful.msg.0047"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {
			SimpleAccountsMessage message= null;
			message = new SimpleAccountsMessage("",
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
			@RequestParam("amount") BigDecimal amount, @RequestParam("currency") Integer currency, @RequestParam("id") Integer contactId,
			HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);

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
			@RequestParam("amount") BigDecimal amount, @RequestParam("currency") Integer currency,@RequestParam("id") Integer contactId,
			HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);

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
			@RequestParam("amount") BigDecimal amount, @RequestParam("currency") Integer currency, @RequestParam("id") Integer contactId,
			HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);

			List<Invoice> invoiceList = invoiceService.getSuggestionInvoices(amount, contactId,
					ContactTypeEnum.CUSTOMER, currency,userId);
			return new ResponseEntity<>(invoiceRestHelper.getDropDownModelList(invoiceList), HttpStatus.OK);

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
			@RequestParam("amount") BigDecimal amount, @RequestParam("id") Integer contactId, @RequestParam("currency") Integer currency,
			HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);

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
	public ResponseEntity<Object> getPlaceOfSupplyForDropdown() {
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
