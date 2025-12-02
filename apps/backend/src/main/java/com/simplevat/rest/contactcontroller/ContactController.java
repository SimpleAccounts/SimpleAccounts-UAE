/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.rest.contactcontroller;

import com.simplevat.aop.LogRequest;
import com.simplevat.bank.model.DeleteModel;
import com.simplevat.constant.DefaultTypeConstant;
import com.simplevat.constant.TransactionCategoryCodeEnum;
import com.simplevat.constant.dbfilter.ContactFilterEnum;
import com.simplevat.constant.dbfilter.ORDERBYENUM;
import com.simplevat.entity.Contact;
import com.simplevat.entity.ContactTransactionCategoryRelation;
import com.simplevat.entity.User;
import com.simplevat.entity.bankaccount.BankAccount;
import com.simplevat.entity.bankaccount.TransactionCategory;
import com.simplevat.model.ContactModel;
import com.simplevat.rest.DropdownObjectModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.rfq_po.PoQuatationService;
import com.simplevat.security.JwtTokenUtil;
import com.simplevat.service.*;
import com.simplevat.utils.MessageUtil;
import com.simplevat.utils.SimpleVatMessage;
import com.simplevat.utils.TransactionCategoryCreationHelper;
import io.swagger.annotations.ApiOperation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.*;

import static com.simplevat.constant.ErrorConstant.ERROR;

/**
 *
 * @author datainn.io
 */

@RestController
@RequestMapping("/rest/contact")
public class ContactController {

	private final Logger logger = LoggerFactory.getLogger(ContactController.class);

	@Autowired
	private ContactService contactService;

	@Autowired
	private TransactionCategoryCreationHelper transactionCategoryCreationHelper;

	@Autowired
	private ContactHelper contactHelper;

	@Autowired
	private JwtTokenUtil jwtTokenUtil;

	@Autowired
	private InvoiceService invoiceService;

	@Autowired
	private UserService userService;

	@Autowired
	private TransactionCategoryService transactionCategoryService;

	@Autowired
	private ContactTransactionCategoryService contactTransactionCategoryService;

	@Autowired
	private PoQuatationService poQuatationService;

	@Autowired
	private InventoryService inventoryService;

	@Autowired
	private BankAccountService bankAccountService;

	@LogRequest
	@GetMapping(value = "/getContactList")
	public ResponseEntity<PaginationResponseModel> getContactList(ContactRequestFilterModel filterModel,
			HttpServletRequest request) {
		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
		User user = userService.findByPK(userId);

		try {
			Map<ContactFilterEnum, Object> filterDataMap = new EnumMap<>(ContactFilterEnum.class);
			if (user.getRole().getRoleCode() != 1) {
				filterDataMap.put(ContactFilterEnum.USER_ID, userId);
			}
			filterDataMap.put(ContactFilterEnum.CONTACT_TYPE, filterModel.getContactType());
			filterDataMap.put(ContactFilterEnum.NAME, filterModel.getName());
			filterDataMap.put(ContactFilterEnum.EMAIL, filterModel.getEmail());
			filterDataMap.put(ContactFilterEnum.DELETE_FLAG, false);

			filterDataMap.put(ContactFilterEnum.ORDER_BY, ORDERBYENUM.DESC);

			PaginationResponseModel response = contactService.getContactList(filterDataMap, filterModel);
			if (response == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
			if (response.getData() != null) {
				response.setData(contactHelper.getModelList(response.getData()));
			}
			return new ResponseEntity<>(response, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@GetMapping(value = "/getContactsForDropdown")
	public ResponseEntity<List<DropdownObjectModel>> getContactsForDropdown(
			@RequestParam(name = "contactType", required = false) Integer contactType) {
		return new ResponseEntity<>(contactService.getContactForDropdownObjectModel(contactType), HttpStatus.OK);
	}

	/**
	 * Vender list for bank transactiom
	 *
	 */
	@LogRequest
	@GetMapping(value = "/getContactsForDropdownForVendor")
	public ResponseEntity<?> getContactsForDropdownForVendor(
			@RequestParam(name = "bankId", required = false) Integer BankId) {
		BankAccount bankAccount = bankAccountService.findByPK(BankId);
		List<DropdownObjectModel> dropdownModelList = new ArrayList<>();
		List<Contact> supplierContactList = contactService.getSupplierContacts(bankAccount.getBankAccountCurrency());
		for(Contact contact : supplierContactList) {
			ContactModel contactModel = new ContactModel();
			if(contact.getOrganization() != null && !contact.getOrganization().isEmpty()){
				contactModel.setContactName(contact.getOrganization());
			}else {
				contactModel.setContactName(contact.getFirstName()+" "+contact.getMiddleName()+" "+contact.getLastName());
			}
			contactModel.setContactId(contact.getContactId());
			contactModel.setCurrency(contact.getCurrency());
			DropdownObjectModel dropdownObjectModel = new DropdownObjectModel(contact.getContactId(),contactModel);
			dropdownModelList.add(dropdownObjectModel);
		}

		return new ResponseEntity<>(dropdownModelList, HttpStatus.OK);

	}

	@LogRequest
	@GetMapping(value = "/getContactById")
	public ResponseEntity<ContactPersistModel> getContactById(@RequestParam("contactId") Integer contactId) {
		ContactPersistModel contactPersistModel = contactHelper
				.getContactPersistModel(contactService.findByPK(contactId));
		return new ResponseEntity<>(contactPersistModel, HttpStatus.OK);
	}

	/**
	 * Create new Contact
	 * 
	 * @param contactPersistModel
	 * @param request
	 * @return
	 */
	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@PostMapping(value = "/save")
	public ResponseEntity<?> save(@RequestBody ContactPersistModel contactPersistModel, HttpServletRequest request) {
		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);

		try {
			SimpleVatMessage message = null;
			Map<String, Object> vatRegistrationNumberParam = new HashMap<>();
			if(contactPersistModel.getVatRegistrationNumber() != "") {
				vatRegistrationNumberParam.put("vatRegistrationNumber", contactPersistModel.getVatRegistrationNumber());
				vatRegistrationNumberParam.put("deleteFlag", Boolean.FALSE);
				List<Contact> existingContactvatRegistrationNumber = contactService.findByAttributes(vatRegistrationNumberParam);
				if (existingContactvatRegistrationNumber != null && !existingContactvatRegistrationNumber.isEmpty()) {
					message = new SimpleVatMessage("0087",
							MessageUtil.getMessage("trn.alreadyexists.0087"), true);
					logger.info(message.getMessage());
					return new ResponseEntity<>(message, HttpStatus.BAD_REQUEST);
				}
			}

			Contact contact = contactHelper.getEntity(contactPersistModel);
			contact.setCreatedBy(userId);
			contact.setCreatedDate(LocalDateTime.now());
			contact.setDeleteFlag(false);
			contactService.persist(contact);
			transactionCategoryCreationHelper.createTransactionCategoryForContact(contact);
			ContactListModel contactListModel = contactHelper.getModel(contact);
			if(contactListModel == null){
				message = new SimpleVatMessage("",
					MessageUtil.getMessage("create.unsuccessful.msg"), true);
				return new ResponseEntity<>( message ,HttpStatus.INTERNAL_SERVER_ERROR);
			}else {
				message = new SimpleVatMessage("0024",
						MessageUtil.getMessage("contact.created.successful.msg.0024"), false);
				return new ResponseEntity<>(contactHelper.getModel(contact) ,HttpStatus.OK);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	private void updateTransactionCategory(TransactionCategory contactCategory, Contact contact) {
		if (contact.getOrganization() != null && !contact.getOrganization().isEmpty()) {
			contactCategory.setTransactionCategoryName(contactCategory.getParentTransactionCategory().getTransactionCategoryName()+" - "+contact.getOrganization());
		} else {
			contactCategory.setTransactionCategoryName(contactCategory.getParentTransactionCategory().getTransactionCategoryName()+" - "+contact.getFirstName() + " " + contact.getLastName());
		}
		if (contact.getOrganization() != null && !contact.getOrganization().isEmpty()) {
			contactCategory.setTransactionCategoryDescription(contactCategory.getParentTransactionCategory().getTransactionCategoryName()+" - "+contact.getOrganization());
		} else {
			contactCategory.setTransactionCategoryDescription(contactCategory.getParentTransactionCategory().getTransactionCategoryName()+" - "+contact.getFirstName() + " " + contact.getLastName());
		}
		contactCategory.setCreatedDate(LocalDateTime.now());
		contactCategory.setCreatedBy(contact.getCreatedBy());
		transactionCategoryService.update(contactCategory);
	}

	private TransactionCategory getTransactionCategory(String transactionCategoryName,
			String transactionCategoryDescription, Integer userId, TransactionCategory parentTransactionCategory) {
		TransactionCategory category = new TransactionCategory();
		category.setChartOfAccount(parentTransactionCategory.getChartOfAccount());
		category.setEditableFlag(Boolean.FALSE);
		category.setSelectableFlag(Boolean.FALSE);
		category.setTransactionCategoryCode(transactionCategoryService
				.getNxtTransactionCatCodeByChartOfAccount(parentTransactionCategory.getChartOfAccount()));
		category.setTransactionCategoryName(transactionCategoryName);
		category.setTransactionCategoryDescription(transactionCategoryDescription);
		category.setParentTransactionCategory(parentTransactionCategory);
		category.setCreatedDate(LocalDateTime.now());
		category.setCreatedBy(userId);
		category.setDefaltFlag(DefaultTypeConstant.NO);
		transactionCategoryService.persist(category);
		return category;

	}

	private void createTransactionCategory(TransactionCategory contactCategoryReceivable, Contact contact) {
		String transactionCategoryName = null;
		if (contact.getOrganization() != null && !contact.getOrganization().isEmpty()) {
			transactionCategoryName = contactCategoryReceivable.getTransactionCategoryName()+" - "+contact.getOrganization();
		} else {
			transactionCategoryName =  contactCategoryReceivable.getTransactionCategoryName()+" - "+contact.getFirstName() + " " + contact.getLastName();
		}
		contactService.persist(contact);
		TransactionCategory transactionCategory = getTransactionCategory(transactionCategoryName,
				transactionCategoryName, contact.getCreatedBy(), contactCategoryReceivable);
		ContactTransactionCategoryRelation contactTransactionCategoryRelation = new ContactTransactionCategoryRelation();
		contactTransactionCategoryRelation.setContact(contact);
		contactTransactionCategoryRelation.setTransactionCategory(transactionCategory);
		contactTransactionCategoryService.persist(contactTransactionCategoryRelation);
	}

	/**
	 * 
	 * @param contactPersistModel
	 * @param request
	 * @return
	 */
	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@PostMapping(value = "/update")
	public ResponseEntity<?> update(@RequestBody ContactPersistModel contactPersistModel,
			HttpServletRequest request) {
		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);

		try {
			SimpleVatMessage message = null;
			Map<String, Object> vatRegistrationNumberparam = new HashMap<>();
			if(contactPersistModel.getVatRegistrationNumber() != ""){
			vatRegistrationNumberparam.put("vatRegistrationNumber", contactPersistModel.getVatRegistrationNumber());
			vatRegistrationNumberparam.put("deleteFlag", Boolean.FALSE);
			List<Contact> existingContactvatRegistrationNumber = contactService.findByAttributes(vatRegistrationNumberparam);
			if (existingContactvatRegistrationNumber != null && !existingContactvatRegistrationNumber.isEmpty()
					&& (existingContactvatRegistrationNumber.get(0).getVatRegistrationNumber().equals(contactPersistModel.getVatRegistrationNumber()))) {
				for (Contact contact : existingContactvatRegistrationNumber) {
					if (contact.getContactId().equals(contactPersistModel.getContactId())) {
						break;
					}
					message = new SimpleVatMessage("0087",
							MessageUtil.getMessage("trn.alreadyexists.0087"), true);
					logger.info(message.getMessage());
					return new ResponseEntity<>(message, HttpStatus.BAD_REQUEST);
				}
			}}
			Map<String, Object> supplierMap = new HashMap<>();
			supplierMap.put("contact", contactPersistModel.getContactId());
			supplierMap.put("deleteFlag",Boolean.FALSE);
			List<ContactTransactionCategoryRelation> contactTransactionCategoryRelations = contactTransactionCategoryService
					.findByAttributes(supplierMap);
			for (ContactTransactionCategoryRelation categoryRelation : contactTransactionCategoryRelations) {
				categoryRelation.setDeleteFlag(Boolean.TRUE);
				contactTransactionCategoryService.update(categoryRelation);
				categoryRelation.getTransactionCategory().setDeleteFlag(Boolean.TRUE);
				transactionCategoryService.update(categoryRelation.getTransactionCategory());
			}
				Contact contact = contactHelper.getEntity(contactPersistModel);
				contact.setLastUpdatedBy(userId);
				contact.setLastUpdateDate(LocalDateTime.now());
				contactService.persist(contact);
					transactionCategoryCreationHelper.createTransactionCategoryForContact(contact);
				ContactListModel contactListModel = contactHelper.getModel(contact);
				if(contactListModel == null){
					message = new SimpleVatMessage("",
							MessageUtil.getMessage("update.unsuccessful.msg"), true);
					return new ResponseEntity<>( message ,HttpStatus.INTERNAL_SERVER_ERROR);
				}else {
					message = new SimpleVatMessage("0025",
							MessageUtil.getMessage("contact.update.successful.msg.0025"), false);
					return new ResponseEntity<>( message ,HttpStatus.OK);
				}
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);

		}
	}

	/**
	 * 
	 * @param id
	 * @param request
	 * @return
	 */
	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@DeleteMapping(value = "/delete")
	public ResponseEntity<?> delete(@RequestParam(value = "id") Integer id, HttpServletRequest request) {
		try {
		SimpleVatMessage message= null;
		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
		List<TransactionCategory> transactionCategoryList = new ArrayList<>();
		Contact contact = contactService.findByPK(id);

		contact.setDeleteFlag(true);
		contact.setLastUpdatedBy(userId);
		contactService.update(contact);

			/*as per comments by moshin just update contact table */

		Map<String, Object> tmap = new HashMap<>();

		if (contact.getOrganization() != null && !contact.getOrganization().isEmpty()) {
			tmap.put("transactionCategoryName", contact.getOrganization());
			transactionCategoryList = transactionCategoryService.findByAttributes(tmap);
		} else {
			tmap.put("transactionCategoryName", contact.getFirstName() + " " + contact.getLastName());
			transactionCategoryList = transactionCategoryService.findByAttributes(tmap);
		}
		Map<String, Object> filterMap = new HashMap<>();
		filterMap.put("contact", contact.getContactId());
		// delete Contact Transaction Category Relation
		List<ContactTransactionCategoryRelation> contactTransactionCategoryRelations = contactTransactionCategoryService
				.findByAttributes(filterMap);
		contact.setLastUpdatedBy(userId);
		for (ContactTransactionCategoryRelation categoryRelation : contactTransactionCategoryRelations) {
			categoryRelation.setDeleteFlag(Boolean.TRUE);
			contactTransactionCategoryService.update(categoryRelation);
		}
		for (TransactionCategory transactionCategory : transactionCategoryList) {
			if (transactionCategory.getChartOfAccount().getChartOfAccountId()==7)
				continue;
			transactionCategory.setDeleteFlag(Boolean.TRUE);
			transactionCategoryService.update(transactionCategory);
		}
		message = new SimpleVatMessage("0026",
				MessageUtil.getMessage("contact.deleted.successful.msg.0026"), false);
		return new ResponseEntity<>(message,HttpStatus.OK);
	} catch (Exception e) {
			SimpleVatMessage message = null;
			message = new SimpleVatMessage("",
					MessageUtil.getMessage("delete.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * 
	 * @param ids
	 * @param request
	 * @return
	 */
	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@DeleteMapping(value = "/deletes")
	public ResponseEntity<?> deletes(@RequestBody DeleteModel ids, HttpServletRequest request) {

		try {
			SimpleVatMessage message= null;
			contactService.deleleByIds(ids.getIds());
			message = new SimpleVatMessage("0026",
					MessageUtil.getMessage("contact.deleted.successful.msg.0026"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {
			SimpleVatMessage message = null;
			message = new SimpleVatMessage("",
					MessageUtil.getMessage("delete.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);

		}
	}

	/**
	 * 
	 * @param contactId
	 * @return
	 */
	@LogRequest
	@ApiOperation(value = "Get Invoices Count For Contact")
	@GetMapping(value = "/getInvoicesCountForContact")
	public ResponseEntity<Integer> getExplainedTransactionCount(@RequestParam int contactId) {
		try {
			Integer totalCount =0;
			totalCount = totalCount + invoiceService.getTotalInvoiceCountByContactId(contactId);
			totalCount = totalCount +poQuatationService.getTotalPoQuotationCountForContact(contactId);
			totalCount = totalCount +inventoryService.getTotalInventoryCountForContact(contactId);
			Integer response = totalCount;

			return new ResponseEntity<>(response, HttpStatus.OK);
		}catch (Exception e){
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}
}
