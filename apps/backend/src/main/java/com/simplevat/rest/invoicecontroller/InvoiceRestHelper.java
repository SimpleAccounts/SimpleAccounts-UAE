package com.simplevat.rest.invoicecontroller;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import com.simplevat.constant.*;
import com.simplevat.dao.MailThemeTemplates;
import com.simplevat.entity.*;
import com.simplevat.entity.Currency;
import com.simplevat.helper.DateFormatHelper;
import com.simplevat.repository.UnitTypesRepository;
import com.simplevat.rest.creditnotecontroller.CreditNoteRepository;
import com.simplevat.rest.customizeinvoiceprefixsuffixccontroller.CustomizeInvoiceTemplateResponseModel;
import com.simplevat.rest.customizeinvoiceprefixsuffixccontroller.CustomizeInvoiceTemplateService;
import com.simplevat.service.*;
import com.simplevat.utils.*;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerErrorException;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.simplevat.entity.bankaccount.TransactionCategory;
import com.simplevat.rest.InviceSingleLevelDropdownModel;
import com.simplevat.rest.PostingRequestModel;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.servlet.http.HttpServletRequest;
import javax.xml.bind.DatatypeConverter;

import static com.simplevat.rest.invoicecontroller.HtmlTemplateConstants.*;

@Service
@Slf4j
public class InvoiceRestHelper {
	@Autowired
	private PaymentRepository paymentRepository;
	@Autowired
	private CurrencyConversionRepository currencyConversionRepository;
	@Autowired
	private ReceiptRepository receiptRepository;
	@Autowired
	private CreditNoteRepository creditNoteRepository;
	private final Logger logger = LoggerFactory.getLogger(InvoiceRestHelper.class);
	private static final String dateFormat = "dd-MM-yyyy";
	@Autowired
	VatCategoryService vatCategoryService;

	@Autowired
	EntityManager entityManager;
	@Autowired
	ProjectService projectService;

	@Autowired
	ResourceLoader	resourceLoader;
	@Autowired
	ContactService contactService;

	@Autowired
	CurrencyService currencyService;

	@Autowired
	InvoiceLineItemService invoiceLineItemService;

	@Autowired
	private InvoiceService invoiceService;

	@Autowired
	private FileHelper fileHelper;

	@Autowired
	private MailUtility mailUtility;

	@Autowired
	private EmaiLogsService emaiLogsService;

	@Autowired
	private UserService userService;

	@Autowired
	private DateUtils dateUtils;

	@Autowired
	private ProductService productService;

	@Autowired
	private TransactionCategoryService transactionCategoryService;

	@Autowired
	private DateFormatUtil dateFormtUtil;

	@Autowired
	private CurrencyExchangeService currencyExchangeService;

	@Autowired
	private PlaceOfSupplyService placeOfSupplyService;

	@Autowired
	private CustomizeInvoiceTemplateService customizeInvoiceTemplateService;

	@Autowired
	InvoiceNumberUtil invoiceNumberUtil;

	@Autowired
	InventoryService inventoryService;

	@Autowired
	InventoryHistoryService inventoryHistoryService;

	@Autowired
	ProductLineItemService productLineItemService;

	@Autowired
	private CreditNoteInvoiceRelationService creditNoteInvoiceRelationService;

	@Autowired
	private ExciseTaxService exciseTaxService;

	private int size;

	@Autowired
	private  CompanyService companyService;

	@Autowired
	private  CountryService countryService;

	@Autowired
	private StateService stateService;
	@Autowired
	private UnitTypesRepository unitTypesRepository;

	@Autowired
	private  ContactTransactionCategoryService contactTransactionCategoryService;

	@Autowired
	private DateFormatHelper dateFormatHelper;

	@Transactional(rollbackFor = Exception.class)
	public Invoice getEntity(InvoiceRequestModel invoiceModel, Integer userId) {
		Invoice invoice = new Invoice();

		if (invoiceModel.getInvoiceId() != null) {
			invoice = invoiceService.findByPK(invoiceModel.getInvoiceId());
			if (invoice.getInvoiceLineItems() != null) {
				invoiceLineItemService.deleteByInvoiceId(invoiceModel.getInvoiceId());
			}
			// If invoice is paid cannot update
			if (invoice.getStatus() > CommonStatusEnum.APPROVED.getValue())
				throw new ServerErrorException("Cannot Update Paid Invoice.");
		}

		if (invoiceModel.getPlaceOfSupplyId() !=null){
			PlaceOfSupply placeOfSupply = placeOfSupplyService.findByPK(invoiceModel.getPlaceOfSupplyId());
			invoice.setPlaceOfSupplyId(placeOfSupply);
		}
		if(invoiceModel.getFootNote()!=null){
			invoice.setFootNote(invoiceModel.getFootNote());
		}
		if (invoiceModel.getTotalAmount() != null) {
			invoice.setTotalAmount(invoiceModel.getTotalAmount());
		}
		if (invoiceModel.getReceiptNumber() != null) {
			invoice.setReceiptNumber(invoiceModel.getReceiptNumber());
		}
		if (invoiceModel.getExchangeRate()!=null){
			invoice.setExchangeRate(invoiceModel.getExchangeRate());
		}
		if (invoiceModel.getTotalVatAmount() != null) {
			invoice.setTotalVatAmount(invoiceModel.getTotalVatAmount());
		}
		if (invoiceModel.getTaxType()!=null){
			invoice.setTaxType(invoiceModel.getTaxType());
		}
		if (invoiceModel.getTotalExciseAmount()!=null){
			invoice.setTotalExciseAmount(invoiceModel.getTotalExciseAmount());
		}
		if (invoiceModel.getIsReverseChargeEnabled()!=null) {
			invoice.setIsReverseChargeEnabled(invoiceModel.getIsReverseChargeEnabled());
		}
		invoice.setReferenceNumber(invoiceModel.getReferenceNumber());
		if(invoiceModel.getChangeShippingAddress()== true){
			invoice.setChangeShippingAddress(invoiceModel.getChangeShippingAddress());
			invoice.setShippingAddress(invoiceModel.getShippingAddress());
			invoice.setShippingCountry(countryService.getCountry(invoiceModel.getShippingCountry()));
			invoice.setShippingState(stateService.findByPK(invoiceModel.getShippingState()));
			invoice.setShippingCity(invoiceModel.getShippingCity());
			invoice.setShippingPostZipCode(invoiceModel.getShippingPostZipCode());
			invoice.setShippingTelephone(invoiceModel.getShippingTelephone());
			invoice.setShippingFax(invoiceModel.getShippingFax());
		}else
			invoice.setChangeShippingAddress(invoiceModel.getChangeShippingAddress());
		if (invoiceModel.getDueAmount()==null){
			invoice.setDueAmount(invoiceModel.getTotalAmount());
		}
		else invoice.setDueAmount(invoiceModel.getTotalAmount());

		/**
		 * @see ContactTypeEnum
		 */
		if (invoiceModel.getType() != null && !invoiceModel.getType().isEmpty()) {
			Integer invoiceType=Integer.parseInt(invoiceModel.getType());
			invoice.setType(invoiceType);
			CustomizeInvoiceTemplate template = customizeInvoiceTemplateService.getInvoiceTemplate(invoiceType);
			//	String prefix=invoiceNumberUtil.fetchPrefixFromString(invoiceModel.getReferenceNumber());
			//		template.setPrefix(prefix);
			String suffix=invoiceNumberUtil.fetchSuffixFromString(invoiceModel.getReferenceNumber());
			template.setSuffix(Integer.parseInt(suffix));
			String prefix= invoice.getReferenceNumber().substring(0,invoice.getReferenceNumber().lastIndexOf(suffix));
			template.setPrefix(prefix);
			customizeInvoiceTemplateService.persist(template);

		}
		if (invoiceModel.getProjectId() != null) {
			Project project = projectService.findByPK(invoiceModel.getProjectId());
			invoice.setProject(project);
		}
		if (invoiceModel.getContactId() != null) {
			Contact contact = contactService.findByPK(invoiceModel.getContactId());
			invoice.setContact(contact);
		}
		LocalDate invoiceDate = dateFormatHelper.convertToLocalDateViaSqlDate(invoiceModel.getInvoiceDate());
		invoice.setInvoiceDate(invoiceDate);

		LocalDate invoiceDueDate = dateFormatHelper.convertToLocalDateViaSqlDate(invoiceModel.getInvoiceDueDate());
		invoice.setInvoiceDueDate(invoiceDueDate);

		if (invoiceModel.getCurrencyCode() != null) {
			Currency currency = currencyService.findByPK(invoiceModel.getCurrencyCode());
			invoice.setCurrency(currency);
		}
		List<InvoiceLineItemModel> itemModels = new ArrayList<>();
		lineItemString(invoiceModel, userId, invoice, itemModels);
		if (invoiceModel.getTaxIdentificationNumber() != null) {
			invoice.setTaxIdentificationNumber(invoiceModel.getTaxIdentificationNumber());
		}
		invoice.setContactPoNumber(invoiceModel.getContactPoNumber());
		invoice.setReceiptAttachmentDescription(invoiceModel.getReceiptAttachmentDescription());
		invoice.setNotes(invoiceModel.getNotes());
		invoice.setDiscountType(invoiceModel.getDiscountType());
		invoice.setDiscount(invoiceModel.getDiscount());
		invoice.setStatus(invoice.getId() == null ? CommonStatusEnum.PENDING.getValue() : invoice.getStatus());
		if (invoiceModel.getDiscountPercentage() != null){
			invoice.setDiscountPercentage(invoiceModel.getDiscountPercentage());
		}

		invoice.setInvoiceDuePeriod(invoiceModel.getTerm());

		return invoice;
	}

	private void lineItemString(InvoiceRequestModel invoiceModel, Integer userId, Invoice invoice,
								List<InvoiceLineItemModel> itemModels) {
		if (invoiceModel.getLineItemsString() != null && !invoiceModel.getLineItemsString().isEmpty()) {
			ObjectMapper mapper = new ObjectMapper();
			try {
				itemModels = mapper.readValue(invoiceModel.getLineItemsString(),
						new TypeReference<List<InvoiceLineItemModel>>() {
						});
			} catch (IOException ex) {
				logger.error("Error", ex);
			}
			if (!itemModels.isEmpty()) {
				List<InvoiceLineItem> invoiceLineItemList = getLineItems(itemModels, invoice, userId);
				invoice.setInvoiceLineItems(invoiceLineItemList);
			}
		}
	}

//	private void invoiceDueDate(InvoiceRequestModel invoiceModel, Invoice invoice) {
//		log.info("invoiceDueDate before {}", invoiceModel.getInvoiceDueDate());
//
//		if (invoiceModel.getInvoiceDueDate() != null) {
//			Instant instant = Instant.ofEpochMilli(invoiceModel.getInvoiceDueDate().getTime());
//			LocalDateTime invoiceDueDate = LocalDateTime.ofInstant(instant,
//					ZoneId.systemDefault());
//			//	invoiceDueDate=invoiceDueDate.withHour(0).withMinute(0).withSecond(0).withNano(0);seconds = 1631881535
//			log.info("invoiceDueDate {}",invoiceDueDate );
//			invoice.setInvoiceDueDate(invoiceDueDate);
//			log.info("invoiceDueDate setvalue {}",invoiceDueDate );
//		}
//	}

//	private void invoiceDate(InvoiceRequestModel invoiceModel, Invoice invoice) {
//		log.info("invoiceDate before {}", invoiceModel.getInvoiceDate());
//		if (invoiceModel.getInvoiceDate() != null) {
//			Instant instant = Instant.ofEpochMilli(invoiceModel.getInvoiceDate().getTime());
//			LocalDateTime invoiceDate = LocalDateTime.ofInstant(instant,
//					ZoneId.systemDefault());
//			invoice.setInvoiceDate(invoiceDate);
//			log.info("invoiceDate setvalue {}",invoiceDate );
//		}
//	}

	public List<InvoiceLineItem>
	getLineItems(List<InvoiceLineItemModel> itemModels, Invoice invoice, Integer userId) {
		List<InvoiceLineItem> lineItems = new ArrayList<>();
		for (InvoiceLineItemModel model : itemModels) {
			try {
				InvoiceLineItem lineItem = new InvoiceLineItem();
				lineItem.setCreatedBy(userId);
				lineItem.setCreatedDate(LocalDateTime.now());
				lineItem.setDeleteFlag(false);
				lineItem.setQuantity(model.getQuantity());
				lineItem.setDescription(model.getDescription());
				lineItem.setUnitPrice(model.getUnitPrice());
				lineItem.setSubTotal(model.getSubTotal());
				if(model.getUnitType()!=null)
					lineItem.setUnitType(model.getUnitType());
				if(model.getUnitTypeId()!=null)
					lineItem.setUnitTypeId(unitTypesRepository.findById(model.getUnitTypeId()).get());
				if (model.getExciseTaxId()!=null){
					lineItem.setExciseCategory(exciseTaxService.getExciseTax(model.getExciseTaxId()));
				}
				if (model.getExciseAmount()!=null){
					lineItem.setExciseAmount(model.getExciseAmount());
				}
				if (model.getVatCategoryId() != null) {
					lineItem.setVatCategory(vatCategoryService.findByPK(Integer.parseInt(model.getVatCategoryId())));
				}
				if (model.getVatAmount()!=null){
					lineItem.setVatAmount(model.getVatAmount());
				}
				if (model.getDiscount()!=null){
					lineItem.setDiscount(model.getDiscount());
				}
				if (model.getDiscountType()!=null){
					lineItem.setDiscountType(model.getDiscountType());
				}
				lineItem.setInvoice(invoice);
				if (model.getProductId() != null)
					lineItem.setProduct(productService.findByPK(model.getProductId()));
				Map<String, Object> attribute = new HashMap<String, Object>();
				attribute.put("product", lineItem.getProduct());
				if (invoice.getType()==2) {
					attribute.put("priceType", ProductPriceType.SALES);
				}
				else {
					attribute.put("priceType",ProductPriceType.PURCHASE);
				}
				if (invoice.getType().equals(2)) {
					List<ProductLineItem> productLineItemList = productLineItemService.findByAttributes(attribute);
					for (ProductLineItem productLineItem : productLineItemList) {
						if (productLineItemList != null) {
							lineItem.setTrnsactioncCategory(productLineItem.getTransactioncategory());
						}
					}
				}
				else {
					lineItem.setTrnsactioncCategory(transactionCategoryService.findByPK(model.getTransactionCategoryId()));
				}

//				if (model.getTransactionCategoryId() != null)
//					lineItem.setTrnsactioncCategory(
//							transactionCategoryService.findByPK(model.getTransactionCategoryId()));
				lineItems.add(lineItem);
			} catch (Exception e) {
				logger.error("Error", e);
				return new ArrayList<>();
			}
		}
		return lineItems;
	}

	private void handleCustomerInvoiceInventory(InvoiceLineItem model,Product product,Integer userId) {
		List<Inventory> inventoryList = inventoryService.getProductByProductId(model.getProduct().getProductID());
		int qtyUpdate=0;
		int remainingQty = model.getQuantity();
		for(Inventory inventory : inventoryList)
		{
			int stockOnHand = inventory.getStockOnHand();
			//	if(stockOnHand>inventory.getReorderLevel())
			//	{
			if(stockOnHand > remainingQty )
			{
				stockOnHand = stockOnHand - remainingQty ;
				qtyUpdate += remainingQty;
				inventory.setQuantitySold(inventory.getQuantitySold()+remainingQty);
				remainingQty -= remainingQty;
				inventory.setStockOnHand(stockOnHand);

			}
			else
			{
				qtyUpdate += stockOnHand;
				remainingQty -= stockOnHand;
				inventory.setStockOnHand(0);
				inventory.setQuantitySold(inventory.getQuantitySold()+stockOnHand);

			}
			inventoryService.update(inventory);
			InventoryHistory inventoryHistory = new InventoryHistory();
			inventoryHistory.setCreatedBy(inventory.getCreatedBy());
			inventoryHistory.setCreatedDate(LocalDateTime.now());
			inventoryHistory.setLastUpdateBy(inventory.getLastUpdateBy());
			inventoryHistory.setLastUpdateDate(LocalDateTime.now());
			inventoryHistory.setTransactionDate(model.getInvoice().getInvoiceDate());
			inventoryHistory.setInventory(inventory);
			inventoryHistory.setInvoice(model.getInvoice());
			inventoryHistory.setProductId(inventory.getProductId());
			inventoryHistory.setUnitCost(inventory.getUnitCost());
			inventoryHistory.setQuantity((float) stockOnHand);
			inventoryHistory.setUnitSellingPrice(model.getUnitPrice().floatValue()*model.getInvoice().getExchangeRate().floatValue());
			inventoryHistory.setSupplierId(inventory.getSupplierId());
			inventoryHistoryService.update(inventoryHistory);
			//	}
			if(remainingQty==0)
				break;
		}
	}
	@Transactional(rollbackFor = Exception.class)
	void handleSupplierInvoiceInventory(InvoiceLineItem model,Product product,Contact supplier,Integer userId){
		Map<String, Object> attribute = new HashMap<String, Object>();
		attribute.put("productId", product);
		attribute.put("supplierId",supplier);

		List<Inventory> inventoryList = inventoryService.findByAttributes(attribute);
		if (inventoryList!=null && inventoryList.size()>0) {
			for (Inventory inventory : inventoryList) {
				int stockOnHand = inventory.getStockOnHand();
				int purchaseQuantity = inventory.getPurchaseQuantity();
				inventory.setUnitCost(((stockOnHand*inventory.getUnitCost())+(model.getQuantity().floatValue()*
						model.getUnitPrice().floatValue()))/(inventory.getStockOnHand().floatValue()+model.getQuantity().
						floatValue()));
				inventory.setStockOnHand(model.getQuantity() + stockOnHand);
				inventory.setPurchaseQuantity(model.getQuantity() + purchaseQuantity);
				inventoryService.update(inventory);
				InventoryHistory inventoryHistory = new InventoryHistory();
				inventoryHistory.setInventory(inventory);
				inventoryHistory.setInvoice(model.getInvoice());
				inventoryHistory.setProductId(inventory.getProductId());
				inventoryHistory.setUnitCost(model.getUnitPrice().floatValue());
				//inventoryHistory.setUnitCost(((inventory.getStockOnHand().floatValue()*inventory.getUnitCost())+(model.getQuantity().floatValue()*model.getUnitPrice().floatValue()))/(inventory.getStockOnHand().floatValue()+model.getQuantity().floatValue()));
				inventoryHistory.setQuantity(model.getQuantity().floatValue());
				inventoryHistory.setUnitSellingPrice(model.getUnitPrice().floatValue()*model.getInvoice().getExchangeRate().floatValue());
				inventoryHistory.setSupplierId(inventory.getSupplierId());
				inventoryHistory.setCreatedBy(userId);
				inventoryHistory.setCreatedDate(LocalDateTime.now());
				inventoryHistory.setLastUpdateBy(inventory.getLastUpdateBy());
				inventoryHistory.setLastUpdateDate(LocalDateTime.now());
				inventoryHistory.setTransactionDate(model.getInvoice().getInvoiceDate());
				inventoryHistoryService.update(inventoryHistory);
			}
		}
		else {
			Inventory inventory = new Inventory();
			inventory.setProductId(product);
			// Check for supplier id From contact entity
			inventory.setSupplierId(supplier);
			inventory.setPurchaseQuantity(model.getQuantity());
			inventory.setStockOnHand(model.getQuantity());
			inventory.setQuantitySold(0);
			inventory.setCreatedBy(userId);
			inventory.setCreatedDate(LocalDateTime.now());
			inventory.setLastUpdateBy(inventory.getLastUpdateBy());
			inventory.setLastUpdateDate(LocalDateTime.now());
//			UnitType unitType = new UnitType();
//			unitType.setUnitType(1);
			int reOrderLevel = model.getQuantity()/10;
			inventory.setReorderLevel(reOrderLevel);
//			inventory.setUnitTypeId(unitType);
			inventory.setUnitCost((model.getUnitPrice().multiply(model.getInvoice().getExchangeRate())).floatValue());
			//inventory.setUnitCost(((inventory.getStockOnHand().floatValue()*inventory.getUnitCost())+(model.getQuantity().floatValue()*model.getUnitPrice().floatValue()))/(inventory.getStockOnHand().floatValue()+model.getQuantity().floatValue()));
			inventoryService.persist(inventory);
			InventoryHistory inventoryHistory = new InventoryHistory();
			inventoryHistory.setInventory(inventory);
			inventoryHistory.setInvoice(model.getInvoice());
			inventoryHistory.setProductId(inventory.getProductId());
			inventoryHistory.setUnitCost(inventory.getUnitCost());
			inventoryHistory.setSupplierId(inventory.getSupplierId());
			inventoryHistory.setQuantity((model.getQuantity().floatValue()));
			inventoryHistory.setCreatedBy(userId);
			inventoryHistory.setCreatedDate(LocalDateTime.now());
			inventoryHistory.setLastUpdateBy(inventory.getLastUpdateBy());
			inventoryHistory.setLastUpdateDate(LocalDateTime.now());
			inventoryHistory.setTransactionDate(model.getInvoice().getInvoiceDate());
			inventoryHistoryService.update(inventoryHistory);
		}
		Map<String,Object> map = new HashMap<>();
		map.put("productId",product);
		List<Inventory> inventoriesProduct = inventoryService.findByAttributes(map);
		Float totalStockOnHand =0f;
		Float totalInventoryAsset = 0f;
		for (Inventory inventoryProduct:inventoriesProduct){
			totalStockOnHand = totalStockOnHand + (inventoryProduct.getStockOnHand());
			totalInventoryAsset = totalInventoryAsset + (inventoryProduct.getUnitCost()*inventoryProduct.getStockOnHand());
		}
		product.setAvgPurchaseCost(BigDecimal.valueOf(totalInventoryAsset/totalStockOnHand));
		productService.update(product);
	}


	public InvoiceRequestModel getRequestModel(Invoice invoice) {
		InvoiceRequestModel requestModel = new InvoiceRequestModel();
		Map<String,Object> map = new HashMap<>();
		map.put("invoice",invoice);BigDecimal
				totalCreditNoteAmount = BigDecimal.ZERO;
		List<CreditNoteInvoiceRelation> creditNoteInvoiceRelationList = creditNoteInvoiceRelationService.findByAttributes(map);
		if (!creditNoteInvoiceRelationList.isEmpty()) {
			for (CreditNoteInvoiceRelation creditNoteInvoiceRelation : creditNoteInvoiceRelationList) {
				if (creditNoteInvoiceRelation.getCreditNote()!=null)
					totalCreditNoteAmount = totalCreditNoteAmount.add(creditNoteInvoiceRelation.getCreditNote().getTotalAmount());
			}
			requestModel.setRemainingInvoiceAmount(invoice.getTotalAmount());
		}else {
			requestModel.setRemainingInvoiceAmount(invoice.getTotalAmount());
		}
		if(requestModel.getRemainingInvoiceAmount().equals(BigDecimal.ZERO)){
			invoice.setCnCreatedOnPaidInvoice(true);
			invoiceService.update(invoice);
		}
		requestModel.setInvoiceId(invoice.getId());
		requestModel.setReferenceNumber(invoice.getReferenceNumber());
		if (invoice.getContact() != null) {
			requestModel.setContactId(invoice.getContact().getContactId());
		}
		if(invoice.getContact()!=null) {
			requestModel.setTaxTreatment(invoice.getContact().getTaxTreatment().getTaxTreatment());
		}
		if (invoice.getProject() != null) {
			requestModel.setProjectId(invoice.getProject().getProjectId());
		}
		if (invoice.getFootNote() != null) {
			requestModel.setFootNote(invoice.getFootNote());
		}
		if (invoice.getCurrency() != null) {
			requestModel.setCurrencyCode(invoice.getCurrency().getCurrencyCode());
		}
		if (invoice.getCurrency() != null) {
			requestModel.setCurrencyName(invoice.getCurrency().getCurrencyName());
		}
		if (invoice.getCurrency() != null) {
			requestModel.setCurrencyIsoCode(invoice.getCurrency().getCurrencyIsoCode());
		}
		if(invoice.getTaxType() != null){
			requestModel.setTaxType(invoice.getTaxType());
		}
		if (invoice.getPlaceOfSupplyId() !=null){
//			PlaceOfSupply placeOfSupply = placeOfSupplyService.findByPK(invoice.getPlaceOfSupplyId().getId());
			requestModel.setPlaceOfSupplyId(invoice.getPlaceOfSupplyId().getId());
		}
		if (invoice.getCurrency() != null) {
			requestModel.setCurrencySymbol(invoice.getCurrency().getCurrencySymbol());
		}
		if (invoice.getInvoiceDate() != null) {
			ZoneId timeZone = ZoneId.systemDefault();
			Date date = Date.from(invoice.getInvoiceDate().atStartOfDay(timeZone).toInstant());
			requestModel.setInvoiceDate(date);
		}
		if (invoice.getInvoiceDueDate() != null) {
			ZoneId timeZone = ZoneId.systemDefault();
			Date date = Date.from(invoice.getInvoiceDueDate().atStartOfDay(timeZone).toInstant());
			requestModel.setInvoiceDueDate(date);
		}
		if (invoice.getAttachmentFileName()!=null){
			requestModel.setFileName(invoice.getAttachmentFileName().getFileName());
			requestModel.setFileAttachmentId(invoice.getAttachmentFileName().getId());
		}
		if (invoice.getExchangeRate()!=null){
			requestModel.setExchangeRate(invoice.getExchangeRate());
		}
		if (invoice.getPlaceOfSupplyId() !=null){
			PlaceOfSupply placeOfSupply = placeOfSupplyService.findByPK(invoice.getPlaceOfSupplyId().getId());
			invoice.setPlaceOfSupplyId(placeOfSupply);
		}
		if (invoice.getIsReverseChargeEnabled()!=null){
			requestModel.setIsReverseChargeEnabled(invoice.getIsReverseChargeEnabled());
		}
		if (invoice.getTaxType()!=null){
			requestModel.setTaxType(invoice.getTaxType());
		}
		if(invoice!=null) {
			List<Receipt> receiptList = receiptRepository.findByInvoiceId(invoice.getId());
			if (receiptList != null) {
				for (Receipt receipt : receiptList) {
					requestModel.setReceiptDate(receipt.getReceiptDate());
				}
			}
		}
			if(invoice!=null) {
				List<Payment> paymentList = paymentRepository.findByInvoiceId(invoice.getId());
				if (paymentList != null) {
					for(Payment payment:paymentList){
					requestModel.setReceiptDate(payment.getPaymentDate().atStartOfDay());
					}
				}
			}
		requestModel.setTotalAmount(invoice.getTotalAmount());
		requestModel.setContactPoNumber(invoice.getContactPoNumber());
		requestModel.setTotalVatAmount(invoice.getTotalVatAmount());
		requestModel.setTotalExciseAmount(invoice.getTotalExciseAmount());
		requestModel.setReceiptNumber(invoice.getReceiptNumber());
		requestModel.setNotes(invoice.getNotes());
		if (invoice.getType() != null) {
			/**
			 * @see ContactTypeEnum
			 */
			requestModel.setType(invoice.getType().toString());
		}
		requestModel.setReceiptAttachmentDescription(invoice.getReceiptAttachmentDescription());
		if (invoice.getTaxIdentificationNumber() != null) {
			requestModel.setTaxIdentificationNumber(invoice.getTaxIdentificationNumber());
		}
		if (invoice.getStatus() != null) {
			requestModel.setStatusEnum(CommonStatusEnum.getInvoiceTypeByValue(invoice.getStatus()));
			requestModel.setStatus(getInvoiceStatus(invoice.getStatus(), requestModel.getInvoiceDueDate()));

		}
		List<InvoiceLineItemModel> lineItemModels = new ArrayList<>();
		invoiceLineItems(invoice, requestModel, lineItemModels);
//		if (invoice.getReceiptAttachmentPath() != null) {
//			requestModel.setFilePath("/file/" + fileHelper.convertFilePthToUrl(invoice.getReceiptAttachmentPath()));
//		}
		if (invoice.getDiscountType() != null) {
			requestModel.setDiscountType(invoice.getDiscountType());
		}
		requestModel.setDiscount(invoice.getDiscount());
		requestModel.setDiscountPercentage(invoice.getDiscountPercentage());
		requestModel.setTerm(invoice.getInvoiceDuePeriod());
		requestModel.setDueAmount(invoice.getDueAmount());
		if (invoice.getContact() != null) {
			Contact contact = invoice.getContact();

			requestModel.setOrganisationName(contact.getOrganization());
			requestModel.setName(getFullName(contact));
			requestModel.setAddress(getAddress(contact));
			requestModel.setEmail(contact.getBillingEmail());
			requestModel.setTaxRegistrationNo(contact.getVatRegistrationNumber());
		}
		requestModel.setBaseCurrencyIsoCode(companyService.getCompanyCurrency().getCurrencyIsoCode());

		if(invoice.getChangeShippingAddress() != null && invoice.getChangeShippingAddress()==true)
		{
			requestModel.setChangeShippingAddress(invoice.getChangeShippingAddress());

			requestModel.setShippingAddress(invoice.getShippingAddress());
			requestModel.setShippingCountryName(invoice.getShippingCountry().getCountryName());
			requestModel.setShippingCity(invoice.getShippingCity());
			requestModel.setShippingCountry(invoice.getShippingCountry().getCountryCode());
			requestModel.setShippingFax(invoice.getShippingFax());
			requestModel.setShippingState(invoice.getShippingState().getId());
			requestModel.setShippingStateName(invoice.getShippingState().getStateName());
			requestModel.setShippingPostZipCode(invoice.getShippingPostZipCode());
			requestModel.setShippingTelephone(invoice.getShippingTelephone());

		}else
			requestModel.setChangeShippingAddress(false);

		return requestModel;
	}

	private void invoiceLineItems(Invoice invoice, InvoiceRequestModel requestModel,
								  List<InvoiceLineItemModel> lineItemModels) {
		if (invoice.getInvoiceLineItems() != null && !invoice.getInvoiceLineItems().isEmpty()) {
			for (InvoiceLineItem lineItem : invoice.getInvoiceLineItems()) {
				InvoiceLineItemModel model = getLineItemModel(lineItem);
				lineItemModels.add(model);
			}
			requestModel.setInvoiceLineItems(lineItemModels);
		}
	}

	public InvoiceLineItemModel getLineItemModel(InvoiceLineItem lineItem) {
		InvoiceLineItemModel lineItemModel = new InvoiceLineItemModel();
		lineItemModel.setId(lineItem.getId());
		lineItemModel.setDescription(lineItem.getDescription());
		lineItemModel.setQuantity(lineItem.getQuantity());
		lineItemModel.setUnitPrice(lineItem.getUnitPrice());
		lineItemModel.setSubTotal(lineItem.getSubTotal());
		if(lineItem.getUnitType()!=null)
			lineItemModel.setUnitType(lineItem.getUnitType());
		if(lineItem.getUnitTypeId()!=null)
			lineItemModel.setUnitTypeId(lineItem.getUnitTypeId().getUnitTypeId());
		if (lineItem.getExciseCategory()!=null){
			lineItemModel.setExciseTaxId(lineItem.getExciseCategory().getId());
		}
		if (lineItem.getExciseAmount()!=null){
			lineItemModel.setExciseAmount(lineItem.getExciseAmount());
		}
		if (lineItem.getVatCategory() != null && lineItem.getVatCategory().getId() != null) {
			lineItemModel.setVatCategoryId(lineItem.getVatCategory().getId().toString());
			lineItemModel.setVatPercentage(lineItem.getVatCategory().getVat().intValue());
		}
		if (lineItem.getVatAmount()!=null){
			lineItemModel.setVatAmount(lineItem.getVatAmount());
		}
		if (lineItem.getDiscount()!=null){
			lineItemModel.setDiscount(lineItem.getDiscount());
		}
		if (lineItem.getDiscountType()!=null){
			lineItemModel.setDiscountType(lineItem.getDiscountType());
		}
		if (lineItem.getProduct() != null) {
			lineItemModel.setProductId(lineItem.getProduct().getProductID());
			lineItemModel.setProductName(lineItem.getProduct().getProductName());
		}if (lineItem.getTrnsactioncCategory() != null) {
			lineItemModel.setTransactionCategoryId(lineItem.getTrnsactioncCategory().getTransactionCategoryId());
			lineItemModel.setTransactionCategoryLabel(
					lineItem.getTrnsactioncCategory().getChartOfAccount().getChartOfAccountName());
		}
		if(lineItem.getProduct() !=null)
			lineItemModel.setIsExciseTaxExclusive(lineItem.getProduct().getExciseType());
		return lineItemModel;
	}

	public List<InvoiceListModel> getListModel(Object invoices) {
		List<InvoiceListModel> invoiceListModels = new ArrayList<>();
		if (invoices != null) {
			for (Invoice invoice : (List<Invoice>) invoices) {
				InvoiceListModel model = new InvoiceListModel();
				model.setId(invoice.getId());
				contact(invoice, model);
//				currency(invoice,model);
				model.setCurrencyName(
						invoice.getCurrency() != null ? invoice.getCurrency().getCurrencyName() : "-");
				model.setCurrencySymbol(
						invoice.getCurrency() != null ? invoice.getCurrency().getCurrencyIsoCode() : "-");

				model.setReferenceNumber(invoice.getReferenceNumber());
				invoiceDate(invoice, model);
				invoiceDueDate(invoice, model);
				model.setTotalAmount(invoice.getTotalAmount());
				model.setTotalVatAmount(invoice.getTotalVatAmount());
				if (invoice.getExchangeRate()!=null){
					model.setExchangeRate(invoice.getExchangeRate());
				}
				if (invoice.getStatus() != null) {
					ZoneId timeZone = ZoneId.systemDefault();
					Date date = Date.from(invoice.getInvoiceDueDate().atStartOfDay(timeZone).toInstant());
					model.setStatus(getInvoiceStatus(invoice.getStatus(), date));
				}
				model.setStatusEnum(CommonStatusEnum.getInvoiceTypeByValue(invoice.getStatus()));
				if (invoice.getContact() != null) {
					model.setContactId(invoice.getContact().getContactId());
				}
				model.setCnCreatedOnPaidInvoice(invoice.getCnCreatedOnPaidInvoice());
				model.setDueAmount(invoice.getDueAmount() == null ? invoice.getTotalAmount() : invoice.getDueAmount());

				Map<String,Object> map = new HashMap<>();
				map.put("invoice",invoice);
				BigDecimal totalCreditNoteAmount = BigDecimal.ZERO;
				List<CreditNoteInvoiceRelation> creditNoteInvoiceRelationList = creditNoteInvoiceRelationService.
						findByAttributes(map);
				if (!creditNoteInvoiceRelationList.isEmpty()) {
					for (CreditNoteInvoiceRelation creditNoteInvoiceRelation : creditNoteInvoiceRelationList) {
						if (creditNoteInvoiceRelation.getCreditNote()!=null)
							totalCreditNoteAmount = totalCreditNoteAmount.add(creditNoteInvoiceRelation.getCreditNote().
									getTotalAmount());
					}
					if (invoice.getTotalAmount().compareTo(totalCreditNoteAmount)==1){
						model.setIsEligibleForCreditNote(true);
					}
					else {
						model.setIsEligibleForCreditNote(false);
					}
				}
				model.setEditFlag(invoice.getEditFlag());
				invoiceListModels.add(model);
			}
		}
		return invoiceListModels;
	}

	private void invoiceDueDate(Invoice invoice, InvoiceListModel model) {
		if (invoice.getInvoiceDueDate() != null) {
			ZoneId timeZone = ZoneId.systemDefault();
			Date date = Date.from(invoice.getInvoiceDueDate().atStartOfDay(timeZone).toInstant());
			SimpleDateFormat simpleDateFormat = new SimpleDateFormat(dateFormat);
			String d = simpleDateFormat.format(date);
			model.setInvoiceDueDate(d);
		}
	}

	private void invoiceDate(Invoice invoice, InvoiceListModel model) {
		if (invoice.getInvoiceDate() != null) {
			ZoneId timeZone = ZoneId.systemDefault();
			Date date = Date.from(invoice.getInvoiceDate().atStartOfDay(timeZone).toInstant());
			SimpleDateFormat simpleDateFormat = new SimpleDateFormat(dateFormat);
			String d = simpleDateFormat.format(date);
			model.setInvoiceDate(d);
		}
	}

	private void contact(Invoice invoice, InvoiceListModel model) {
		if (invoice.getContact() != null) {
			if (invoice.getContact().getOrganization() != null && !invoice.getContact().getOrganization().isEmpty() ) {
				model.setName(invoice.getContact().getOrganization());
			}
			else {
				model.setName(invoice.getContact().getFirstName() + " " + invoice.getContact().getLastName());
			}
		}
	}
//	private void currency(Invoice invoice, InvoiceListModel model) {
//		if (invoice.getCurrency() != null) {
//			if (invoice.getCurrency().getCurrencyName() != null || invoice.getCurrency().getCurrencyIsoCode() != null) {
//				model.setName(invoice.getCurrency().getCurrencyIsoCode());
//			}
//		}
//	}

	private String getFullName(Contact contact) {
		StringBuilder sb = new StringBuilder();
		if (contact.getFirstName() != null && !contact.getFirstName().isEmpty()) {
			sb.append(contact.getFirstName()).append(" ");
		}
		if (contact.getMiddleName() != null && !contact.getMiddleName().isEmpty()) {
			sb.append(contact.getMiddleName()).append(" ");
		}
		if (contact.getLastName() != null && !contact.getLastName().isEmpty()) {
			sb.append(contact.getLastName());
		}
		return sb.toString();
	}

	private String getAddress(Contact contact) {
		StringBuilder sb = new StringBuilder();
		if (contact.getAddressLine1() != null && !contact.getAddressLine1().isEmpty()) {
			sb.append(contact.getAddressLine1()).append(" ");
		}
		if (contact.getAddressLine2() != null && !contact.getAddressLine2().isEmpty()) {
			sb.append(contact.getAddressLine2()).append(" ");
		}
		if (contact.getAddressLine3() != null && !contact.getAddressLine3().isEmpty()) {
			sb.append(contact.getAddressLine3());
		}
		if (sb.length() > 0) {
			sb.append("\n");
		}
		if (contact.getCountry() != null && contact.getCountry().getCountryName() != null) {
			sb.append(contact.getCountry().getCountryName()).append(", ");
		}
		if (contact.getState() != null) {
			sb.append(contact.getState().getStateName()).append(", ");
		}
		if (contact.getCity() != null && !contact.getCity().isEmpty()) {
			sb.append(contact.getCity()).append(", ");
		}
		if (contact.getPoBoxNumber() != null && !contact.getPoBoxNumber().isEmpty()) {
			sb.append(contact.getPoBoxNumber()).append(".");
		}

		return sb.toString();
	}

	public void send(Invoice invoice, Integer userId, PostingRequestModel postingRequestModel, HttpServletRequest request) {
		String subject = "";
		String body = "";
		String quertStr = "SELECT m FROM MailThemeTemplates m WHERE m.moduleId=1 and m.templateEnable=true";

		Query query = entityManager.createQuery(quertStr);

		MailThemeTemplates invoiceEmailBody = (MailThemeTemplates) query.getSingleResult();


		Contact contact = invoice.getContact();
//		Configuration invoiceEmailSub = configurationService
//				.getConfigurationByName(ConfigurationConstants.INVOICE_MAIL_TAMPLATE_SUBJECT);

		Map<String, String> map = getInvoiceData(invoice, userId);

		String content = "";
		String htmlText = "";
		String htmlContent = "";

		String amountInWords = "-";
		String vatInWords = "-";

		if (postingRequestModel != null && postingRequestModel.getAmountInWords() != null)
			amountInWords = postingRequestModel.getAmountInWords();

		if (postingRequestModel != null && postingRequestModel.getVatInWords() != null)
			vatInWords = postingRequestModel.getVatInWords();
		try {
			String emailBody = invoiceEmailBody.getPath();

			byte[] bodyData = Files.readAllBytes(Paths.get(resourceLoader.getResource("classpath:" + emailBody).getURI()));
			byte[] contentData = Files.readAllBytes(Paths.get(resourceLoader.getResource("classpath:" + INVOICE_TEMPLATE).getURI()));

			htmlText = new String(bodyData, StandardCharsets.UTF_8).replace("{amountInWords}", amountInWords).replace("{vatInWords}", vatInWords);
			htmlContent = new String(contentData, StandardCharsets.UTF_8).replace("{currency}", invoice.getCurrency().getCurrencyIsoCode())
					.replace("{amountInWords}", amountInWords)
					.replace("{vatInWords}", vatInWords);
		} catch (IOException e) {
			e.printStackTrace();
		}

		if (htmlContent != "" && htmlContent != null) {
			content = mailUtility.create(map, htmlContent);
		}

		if (invoiceEmailBody != null && invoiceEmailBody.getTemplateSubject() != null) {
			subject = mailUtility.create(map, invoiceEmailBody.getTemplateSubject());
		}

//		Configuration invoiceEmailBody = configurationService
//				.getConfigurationByName(ConfigurationConstants.INVOICE_MAIL_TAMPLATE_BODY);

		if (invoiceEmailBody != null && !StringUtils.isEmpty(htmlText)) {
			if (invoice.getInvoiceLineItems().size()>1){
				body = mailUtility.create(map, updateInvoiceLineItem(invoice.getInvoiceLineItems().size(),invoiceEmailBody));
			}
			else {
				body = mailUtility.create(map, htmlText);
			}
		}
		body=getTaxableSummaryString(invoice,body)
				.replace("{amountInWords}", amountInWords)
				.replace("{vatInWords}", vatInWords);

		if (invoice.getContact() != null && contact.getBillingEmail() != null && !contact.getBillingEmail().isEmpty()) {
			mailUtility.triggerEmailOnBackground2(subject, content, body, null, EmailConstant.ADMIN_SUPPORT_EMAIL,
					EmailConstant.ADMIN_EMAIL_SENDER_NAME, new String[]{invoice.getContact().getBillingEmail()},
					true);
			EmailLogs emailLogs = new EmailLogs();
			emailLogs.setEmailDate(LocalDateTime.now());
			emailLogs.setEmailTo(invoice.getContact().getBillingEmail());
			User user = userService.findByPK(userId);
			emailLogs.setEmailFrom(user.getUserEmail());
			emailLogs.setModuleName("INVOICE");
			String baseUrl = ServletUriComponentsBuilder.fromRequestUri(request)
					.replacePath(null)
					.build()
					.toUriString();
			System.out.println(baseUrl);
			emailLogs.setBaseUrl(baseUrl);
			emaiLogsService.persist(emailLogs);
		} else {
			logger.info("BILLING ADDRESS NOT PRESENT");
		}
	}

	/**
	 * Added for TAX SUMMARY DETAILS ( 5%, 0%, Exepmt )
	 * @param invoice
	 * @param body
	 * @return
	 */
	public String getTaxableSummaryString(Invoice invoice,String body){
		//TAX SUMMARY DETAILS ( 5%, 0%, Exepmt )
		BigDecimal taxableAmount_5=BigDecimal.ZERO.setScale(2, BigDecimal.ROUND_HALF_EVEN);
		BigDecimal taxAmount_5=BigDecimal.ZERO.setScale(2, BigDecimal.ROUND_HALF_EVEN);

		BigDecimal taxableAmount_0=BigDecimal.ZERO.setScale(2, BigDecimal.ROUND_HALF_EVEN);
		BigDecimal taxAmount_0=BigDecimal.ZERO.setScale(2, BigDecimal.ROUND_HALF_EVEN);

		BigDecimal taxableAmount_E=BigDecimal.ZERO.setScale(2, BigDecimal.ROUND_HALF_EVEN);
		BigDecimal taxAmount_E=BigDecimal.ZERO.setScale(2, BigDecimal.ROUND_HALF_EVEN);

		if (invoice.getInvoiceLineItems() != null) {

			for(InvoiceLineItem invoiceLineItem : invoice.getInvoiceLineItems()){
				if (invoiceLineItem.getUnitPrice()!= null) {

					if(invoiceLineItem.getVatCategory()!=null && invoiceLineItem.getVatCategory().getId()==1) {
						taxAmount_5 = taxAmount_5.add(invoiceLineItem.getVatAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN));
						taxableAmount_5 = taxableAmount_5.add(invoiceLineItem.getSubTotal().subtract(invoiceLineItem.getVatAmount()).setScale(2, BigDecimal.ROUND_HALF_EVEN));
					}
					if(invoiceLineItem.getVatCategory()!=null && invoiceLineItem.getVatCategory().getId()==2) {
						taxAmount_0 = taxAmount_0.add(invoiceLineItem.getVatAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN));
						taxableAmount_0 = taxableAmount_0.add(invoiceLineItem.getSubTotal().subtract(invoiceLineItem.getVatAmount()).setScale(2, BigDecimal.ROUND_HALF_EVEN));
					}
					if(invoiceLineItem.getVatCategory()!=null && invoiceLineItem.getVatCategory().getId()==3) {
						taxAmount_E = taxAmount_E.add(invoiceLineItem.getVatAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN));
						taxableAmount_E = taxableAmount_E.add(invoiceLineItem.getSubTotal().subtract(invoiceLineItem.getVatAmount()).setScale(2, BigDecimal.ROUND_HALF_EVEN));
					}

				}
			}

		}

		body=body.replace("{currency}", invoice.getCurrency().getCurrencyIsoCode())
				.replace("{taxableAmount_5}",taxableAmount_5.toString())
				.replace("{taxAmount_5}",taxAmount_5.toString())
				.replace("{taxableAmount_0}",taxableAmount_0.toString())
				.replace("{taxAmount_0}",taxAmount_0.toString())
				.replace("{taxableAmount_E}",taxableAmount_E.toString())
				.replace("{taxAmount_E}",taxAmount_E.toString());

		return body;
	}
	public void sendCN(Invoice invoice, Integer userId,PostingRequestModel postingRequestModel,HttpServletRequest request,CreditNote creditNote) {
		String subject = "";
		String body = "";
		String quertStr = "SELECT m FROM MailThemeTemplates m WHERE m.moduleId=7 and m.templateEnable=true";

		Query query = entityManager.createQuery(quertStr);

		MailThemeTemplates creditNoteEmailBody =(MailThemeTemplates) query.getSingleResult();
		Map<String, String> map = null;
		Contact contact = null;
		Currency currency = null;
		String message = null;
		String contactName = null;
		if(invoice!=null){
			contactName = invoice.getContact().getFirstName()+" "+invoice.getContact().getLastName();
			currency  = invoice.getCurrency();
			message = "Dear {contactName} , <br><br>Please review the credit note "+creditNote.getCreditNoteNumber()+".\n" +
					"details mentioned in the document attached\n" +
					"below, for the goods/services provided by our\n" +
					"company against your Customer Invoice number "+invoice.getReferenceNumber()+"\n" +
					"If you have any queries, please feel free to\n" +
					"contact us.\n" +
					"We are looking forward to a long-term business\n" +
					"relationship with you.";
		}
		else {
			contactName = creditNote.getContact().getFirstName()+" "+creditNote.getContact().getLastName();
			currency = creditNote.getCurrency();
			message = "Dear {contactName},<br><br>\n" +
					"Please review the credit note " +creditNote.getCreditNoteNumber()+".\n" +
					"details mentioned in the document attached \n" +
					"below. \n" +
					"If you have any queries, please feel free to \n" +
					"contact us.\n" +
					"We are looking forward to a long-term business \n" +
					"relationship with you.";
		}
		if(invoice!=null && creditNote.getIsCNWithoutProduct()==Boolean.FALSE){
		contact= invoice.getContact();
//		Configuration invoiceEmailSub = configurationService
//				.getConfigurationByName(ConfigurationConstants.INVOICE_MAIL_TAMPLATE_SUBJECT);
		 map = getInvoiceData(invoice, userId);
		}
		else {
			contact = creditNote.getContact();
			map = getCNData(contact, userId,creditNote);
		}
		String content = "";
		String htmlText="";
		String htmlContent="";

		String amountInWords = "-";
		String vatInWords = "-";

		if (postingRequestModel != null && postingRequestModel.getAmountInWords() != null)
			amountInWords = postingRequestModel.getAmountInWords();

		if (postingRequestModel != null && postingRequestModel.getVatInWords() != null)
			vatInWords = postingRequestModel.getVatInWords();
		try {
			String emailBody=creditNoteEmailBody.getPath();
			byte[] bodyData = null;
			if(creditNote.getInvoiceId()!=null && creditNote.getIsCNWithoutProduct()==Boolean.FALSE) {
			 bodyData = Files.readAllBytes(Paths.get(resourceLoader.getResource("classpath:" + emailBody).getURI()));
			}
			else{
				bodyData = Files.readAllBytes(Paths.get(resourceLoader.getResource("classpath:" +CN_WITHOUT_PRODUCT).getURI()));
			}
			byte[] contentData = Files.readAllBytes(Paths.get(  resourceLoader.getResource("classpath:"+CN_TEMPLATE).getURI()));

			htmlText = new String(bodyData, StandardCharsets.UTF_8).replace("{amountInWords}",amountInWords).replace("{vatInWords}",vatInWords);;

			if(creditNote.getInvoiceId()!=null && creditNote.getIsCNWithoutProduct()==Boolean.FALSE) {
				htmlContent = new String(contentData, StandardCharsets.UTF_8).replace("{currency}", currency.getCurrencyIsoCode())
						.replace("{amountInWords}", amountInWords)
						.replace("{message}", message)
						.replace("{vatInWords}", vatInWords);
			}
			else {
				htmlContent = new String(contentData, StandardCharsets.UTF_8).replace("{currency}", currency.getCurrencyIsoCode())
						.replace("{amountInWords}", amountInWords)
						.replace("{message}", message)
						.replace("{creditNoteNumber}",creditNote.getCreditNoteNumber())
						.replace("{invoiceAmount}",creditNote.getTotalAmount().toString())
						.replace("{vatInWords}", vatInWords);
			}

		} catch (IOException e) {
			e.printStackTrace();
		}

		if (htmlContent !="" && htmlContent !=null ){
			content = mailUtility.create(map, htmlContent);
		}
		if (invoice!=null && creditNoteEmailBody != null && creditNoteEmailBody.getTemplateSubject() != null && creditNote.getIsCNWithoutProduct()==Boolean.FALSE) {
			subject = mailUtility.create(map, creditNoteEmailBody.getTemplateSubject());
		}
		else{
			subject = "CREDIT NOTE-"+creditNote.getCreditNoteNumber();
		}

//		Configuration invoiceEmailBody = configurationService
//				.getConfigurationByName(ConfigurationConstants.INVOICE_MAIL_TAMPLATE_BODY);

		if (creditNoteEmailBody != null && creditNoteEmailBody.getTemplateBody() != null) {
			if (creditNote!=null && creditNote.getCreditNoteLineItems().size()>1){
				body = mailUtility.create(map, updateCreditNoteLineItem(creditNote.getCreditNoteLineItems().size(),creditNoteEmailBody));
			}
			else {
				body = mailUtility.create(map,htmlText );
			}
		}
		if(invoice!=null) {
			body = getTaxableSummaryString(invoice, body)
					.replace("{amountInWords}", amountInWords)
					.replace("{vatInWords}", vatInWords);
		}

		if (contact!= null && contact.getBillingEmail() != null && !contact.getBillingEmail().isEmpty()) {
			mailUtility.triggerEmailOnBackground2(subject, content,body, null, EmailConstant.ADMIN_SUPPORT_EMAIL,
					EmailConstant.ADMIN_EMAIL_SENDER_NAME, new String[] { contact.getBillingEmail() },
					true);
			EmailLogs emailLogs = new EmailLogs();
			emailLogs.setEmailDate(LocalDateTime.now());
			emailLogs.setEmailTo(contact.getBillingEmail());
			User user = userService.findByPK(userId);
			emailLogs.setEmailFrom(user.getUserEmail());
			emailLogs.setModuleName("CREDIT NOTE");
			String baseUrl = ServletUriComponentsBuilder.fromRequestUri(request)
					.replacePath(null)
					.build()
					.toUriString();
			System.out.println(baseUrl);
			emailLogs.setBaseUrl(baseUrl);
			emaiLogsService.persist(emailLogs);
		} else {
			logger.info("BILLING ADDRESS NOT PRESENT");
		}
	}
//	private String updateInvoiceLineItem(int size, Configuration invoiceEmailBody) {
//		String productRow = "<tr>\r\n                <td>{product}</td>\r\n                 <td>{description}</td>\r\n                 <td>{quantity}</td>\r\n                 <td>{unitPrice}</td>\r\n                 <td>{vatType}</td>\r\n                <td>{subTotal}</td>\r\n            </tr>\r\n";
//		StringBuilder productRowBuilder = new StringBuilder(productRow);
//		for (int row=1;row<size;row++){
//			productRowBuilder.append("<tr>\n" +
//					"                <td>{product"+row+"}</td>\n" +
//					"                 <td>{description"+row+"}</td>\n" +
//					"                 <td>{quantity"+row+"}</td>\n" +
//					"                 <td>{unitPrice"+row+"}</td>\n" +
//					"                 <td>{vatType"+row+"}</td>\n" +
//					"                <td>{subTotal"+row+"}</td>\n" +
//					"            </tr>\n");
//		}
//		String emailBody = invoiceEmailBody.getValue();
//		StringBuilder emailBodyBuilder = new StringBuilder();
//         emailBodyBuilder.append(emailBody.substring(0,emailBody.indexOf(productRow)));
//         emailBodyBuilder.append(productRowBuilder.toString());
//         emailBodyBuilder.append(emailBody.substring(emailBody.indexOf(productRow)+productRow.length(),emailBody.length()));
////		emailBody = emailBody.replace(productRow,productRowBuilder.toString());
////		invoiceEmailBody.setValue(emailBodyBuilder.toString());
//		return emailBodyBuilder.toString();
//	}

	private String updateInvoiceLineItem(int size, MailThemeTemplates invoiceEmailBody) {

		String productRow="<tr><td style=\"word-wrap: break-word; width: 25%;max-width:20px;\"><b>{product} </b><br> {description}</td><td style=\"text-align:center\">{quantity}</td><td style=\"text-align:center\">{unitType}</td><td style=\"text-align:right\">{unitPrice}</td><td style=\"text-align:right\">{discount}</td><td style=\"text-align:center\">{invoiceLineItemExciseTax}</td><td style=\"text-align:right\">{exciseAmount}</td><td style=\"text-align:center\">{vatType}</td><td style=\"text-align:right\">{invoiceLineItemVatAmount}</td><td style=\"text-align:right\">{subTotal}</td></tr>" ;
		StringBuilder productRowBuilder = new StringBuilder(productRow);
		for (int row=1;row<size;row++){
			productRowBuilder.append("<tr>" +
					"<td style=\"word-wrap: break-word; width: 25%;max-width:20px;\"><b>{product"+row+"} </b><br> {description"+row+"}</td>" +
					"<td style=\"text-align:center\">{quantity"+row+"}</td>" +
					"<td style=\"text-align:center\">{unitType"+row+"}</td>" +
					"<td style=\"text-align:right\">{unitPrice"+row+"}</td>" +
					"<td style=\"text-align:right\">{discount"+row+"}</td>" +
					"<td style=\"text-align:center\">{invoiceLineItemExciseTax"+row+"}</td>" +
					"<td style=\"text-align:right\">{exciseAmount"+row+"}</td>" +
					"<td style=\"text-align:right\">{vatType"+row+"}</td>" +
					"<td style=\"text-align:right\">{invoiceLineItemVatAmount"+row+"}</td>" +
					"<td style=\"text-align:right\">{subTotal"+row+"}</td>" +
					"</tr>");
		}

//		String taxRow="<tr><td style=\"text-align:left\">{vatCategory}</td><td style=\"text-align:center\">{currency} {taxableAmount}</td><td style=\"text-align:center\">{currency} {invoiceLineItemVatAmount}</td></tr>";
//		StringBuilder taxRowBuilder = new StringBuilder(taxRow);
		/*for (int row=1;row<size;row++){
			taxRowBuilder.append("<tr><td style=\"text-align:left\">{vatCategory"+ row +"}</td><td style=\"text-align:center\">{currency} {unitPrice"+ row +"}</td><td style=\"text-align:center\">{currency} {invoiceLineItemVatAmount"+ row +"}</td></tr>");
		}*/

		String htmlText="";

		try {
			byte[] bodyData = Files.readAllBytes(Paths.get(resourceLoader.getResource("classpath:"+invoiceEmailBody.getPath()).getURI()));

			htmlText = new String(bodyData, StandardCharsets.UTF_8);

		} catch (IOException e) {
			e.printStackTrace();
		}

		//Adding product details html content
		StringBuilder emailBodyBuilder = new StringBuilder();
		emailBodyBuilder.append(htmlText.substring(0,htmlText.indexOf(productRow)+1));
		emailBodyBuilder.append(productRowBuilder.toString());
		emailBodyBuilder.append(htmlText.substring(htmlText.indexOf(productRow)+1+productRow.length(),htmlText.length()));
			log.info(emailBodyBuilder.toString());
		//Adding tax summary details html content
//		StringBuilder emailBodyBuilderNew = new StringBuilder();
//		emailBodyBuilderNew.append(emailBodyBuilder.substring(0,emailBodyBuilder.indexOf(taxRow)));
//		emailBodyBuilderNew.append(taxRowBuilder.toString());
//		emailBodyBuilderNew.append(emailBodyBuilder.substring(emailBodyBuilder.indexOf(taxRow)+taxRow.length(),emailBodyBuilder.length()));

		return emailBodyBuilder.toString();
	}

	private String updateCreditNoteLineItem(int size, MailThemeTemplates invoiceEmailBody) {

		String productRow="<tr><td style=\"word-wrap: break-word; width: 25%;max-width:20px;\"><b>{Cn_product} </b><br> {cnDescription}</td><td style=\"text-align:center\">{Cnquantity}</td><td style=\"text-align:center\">{CnunitType}</td><td style=\"text-align:right\">{cnUnitPrice}</td><td style=\"text-align:right\">{Cndiscount}</td><td style=\"text-align:center\">{CnLineItemExciseTax}</td><td style=\"text-align:right\">{CnexciseAmount}</td><td style=\"text-align:center\">{CnvatType}</td><td style=\"text-align:right\">{CnVatAmount}</td><td style=\"text-align:right\">{CnsubTotal}</td></tr>" ;
		StringBuilder productRowBuilder = new StringBuilder(productRow);
		for (int row=1;row<size;row++){
			productRowBuilder.append("<tr>" +
					"<td style=\"word-wrap: break-word; width: 25%;max-width:20px;\"><b>{Cn_product"+row+"} </b><br> {cnDescription"+row+"}</td>" +
					"<td style=\"text-align:center\">{Cnquantity"+row+"}</td>" +
					"<td style=\"text-align:center\">{CnunitType"+row+"}</td>" +
					"<td style=\"text-align:right\">{cnUnitPrice"+row+"}</td>" +
					"<td style=\"text-align:right\">{Cndiscount"+row+"}</td>" +
					"<td style=\"text-align:center\">{CnLineItemExciseTax"+row+"}</td>" +
					"<td style=\"text-align:right\">{CnexciseAmount"+row+"}</td>" +
					"<td style=\"text-align:right\">{CnvatType"+row+"}</td>" +
					"<td style=\"text-align:right\">{CnVatAmount"+row+"}</td>" +
					"<td style=\"text-align:right\">{CnsubTotal"+row+"}</td>" +
					"</tr>");
		}
		String htmlText="";

		try {
			byte[] bodyData = Files.readAllBytes(Paths.get(resourceLoader.getResource("classpath:"+invoiceEmailBody.getPath()).getURI()));

			htmlText = new String(bodyData, StandardCharsets.UTF_8);

		} catch (IOException e) {
			e.printStackTrace();
		}
		//Adding product details html content
		StringBuilder emailBodyBuilder = new StringBuilder();
		emailBodyBuilder.append(htmlText.substring(0,htmlText.indexOf(productRow)+1));
		emailBodyBuilder.append(productRowBuilder.toString());
		emailBodyBuilder.append(htmlText.substring(htmlText.indexOf(productRow)+1+productRow.length(),htmlText.length()));
		log.info(emailBodyBuilder.toString());
		return emailBodyBuilder.toString();
	}
	public Map<String, String> getInvoiceData(Invoice invoice, Integer userId) {
		Map<String, String> map = mailUtility.getInvoiceEmailParamMap();
		Map<String, String> invoiceDataMap = new HashMap<>();
		User user = userService.findByPK(userId);
		for (String key : map.keySet()) {
			String value = map.get(key);
			switch (key) {
				case MailUtility.INVOICE_NAME:
					if (user.getCompany().getIsRegisteredVat().equals(Boolean.TRUE)) {
						invoiceDataMap.put(value,"Tax Invoice");
					} else {
						invoiceDataMap.put(value, "Invoice");
					}
					break;
				case MailUtility.INVOICE_REFEREBCE_NO:
					getReferenceNumber(invoice, invoiceDataMap, value);
					break;
				case MailUtility.CN_REFERENCE_NO:
					getCNNumber(invoice, invoiceDataMap, value);
					break;
				case MailUtility.INVOICE_DATE:
					getInvoiceDate(invoice, invoiceDataMap, value);
					break;
				case MailUtility.INVOICE_DUE_DATE:
					getInvoiceDueDate(invoice, invoiceDataMap, value);
					break;
				case MailUtility.INVOICE_DISCOUNT:
					getDiscount(invoice, invoiceDataMap, value);
					break;
				case MailUtility.SUB_TOTAL:
					getsubtotal(invoice, invoiceDataMap, value);
					break;
				case MailUtility.CN_SUB_TOTAL:
					getCnsubtotal(invoice, invoiceDataMap, value);
					break;
				case MailUtility.CONTRACT_PO_NUMBER:
					getContactPoNumber(invoice, invoiceDataMap, value);
					break;
				case MailUtility.CONTACT_NAME:
					getContact(invoice, invoiceDataMap, value);
					break;
//				case MailUtility.CREDIT_NOTE_CONTACT_NAME:
//					getCNContact(invoice, invoiceDataMap, value);
//					break;
				case MailUtility.CONTACT_ADDRESS_LINE1:
					getContactAddress1(invoice, invoiceDataMap, value);
					break;
				case MailUtility.CONTACT_ADDRESS_LINE2:
					getContactAddress2(invoice, invoiceDataMap, value);
					break;
				case MailUtility.CONTACT_COUNTRY:
					getContactCountry(invoice, invoiceDataMap, value);
					break;
				case MailUtility.CONTACT_STATE:
					getContactState(invoice, invoiceDataMap, value);
					break;
				case MailUtility.MOBILE_NUMBER:
					getMobileNumber(invoice, invoiceDataMap, value);
					break;
				case MailUtility.CONTACT_CITY:
					getContactCity(invoice, invoiceDataMap, value);
					break;
				case MailUtility.CONTACT_EMAIL:
					getContactEmail(invoice, invoiceDataMap, value);
					break;
				case MailUtility.EXCHANGE_RATE:
					if (invoice.getExchangeRate() != null && invoice.getExchangeRate().compareTo(BigDecimal.ONE) > 0) {
						invoiceDataMap.put(value, invoice.getExchangeRate().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
					} else {
						invoiceDataMap.put(value, "---");
					}
					break;
				case MailUtility.PRODUCT:
					getProduct(invoice, invoiceDataMap, value);
					break;
				case MailUtility.CN_PRODUCT:
					getCnProduct(invoice, invoiceDataMap, value);
					break;
				case MailUtility.UNIT_PRICE:
					getUnitPrice(invoice, invoiceDataMap, value);
					break;
				case MailUtility.CN_UNIT_PRICE:
					getCnUnitPrice(invoice, invoiceDataMap, value);
					break;
				case MailUtility.UNIT_TYPE:
					getUnitType(invoice, invoiceDataMap, value);
					break;
				case MailUtility.CN_UNIT_TYPE:
					getCnUnitType(invoice, invoiceDataMap, value);
					break;
				case MailUtility.DISCOUNT:
					getDiscount(invoice, invoiceDataMap, value);
					break;
				case MailUtility.CN_DISCOUNT:
					getCnDiscount(invoice, invoiceDataMap, value);
					break;
				case MailUtility.CREDIT_NOTE_DISCOUNT:
					getCnDiscount(invoice, invoiceDataMap, value);
					break;
				case MailUtility.EXCISE_AMOUNT:
					getExciseAmount(invoice, invoiceDataMap, value);
					break;
				case MailUtility.CN_EXCISE_AMOUNT:
					getCnExciseAmount(invoice, invoiceDataMap, value);
					break;
				case MailUtility.CREDIT_NOTE_NUMBER:
					getCreditNote(invoice, invoiceDataMap, value);
					break;
				case MailUtility.INVOICE_DUE_PERIOD:
					getInvoiceDuePeriod(invoice, invoiceDataMap, value);
					break;
				case MailUtility.INVOICE_VAT_AMOUNT:
					getInvoiceVatAmount(invoice, invoiceDataMap, value);
					break;
				case MailUtility.CREDIT_NOTE_VAT_AMOUNT:
					getCreditNoteVatAmount(invoice, invoiceDataMap, value);
					break;
				case MailUtility.QUANTITY:
					getQuantity(invoice, invoiceDataMap, value);
					break;
				case MailUtility.CN_QUANTITY:
					getCnQuantity(invoice, invoiceDataMap, value);
					break;
				case MailUtility.TOTAL:
					getTotal(invoice, invoiceDataMap, value);
					break;
				case MailUtility.CN_TOTAL:
					getCnTotal(invoice, invoiceDataMap, value);
					break;
				case MailUtility.TOTAL_NET:
					getTotalNet(invoice, invoiceDataMap, value);
					break;
				case MailUtility.PROJECT_NAME:
					getProject(invoice, invoiceDataMap, value);
					break;
				case MailUtility.CURRENCY:
					invoiceDataMap.put(value, invoice.getCurrency().getCurrencyIsoCode());
					break;
				case MailUtility.INVOICE_AMOUNT:
					if (invoice.getTotalAmount() != null) {
						invoiceDataMap.put(value, invoice.getTotalAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
					} else {
						invoiceDataMap.put(value, "---");
					}
					break;
				case MailUtility.INVOICE_LABEL:
					if (user.getCompany().getIsRegisteredVat().equals(Boolean.TRUE)) {
						invoiceDataMap.put(value,"Tax Invoice");
					} else {
						invoiceDataMap.put(value, "Customer Invoice");
					}
					break;
				case MailUtility.CN_AMOUNT:
					CreditNote creditNote = creditNoteRepository.findByInvoiceIdAndDeleteFlag(invoice.getId(),false);
					if(creditNote!=null && creditNote.getTotalAmount()!=null){
						invoiceDataMap.put(value, creditNote.getTotalAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
					} else {
						invoiceDataMap.put(value, "---");
					}
					break;
				case MailUtility.SENDER_NAME:
					invoiceDataMap.put(value, user.getUserEmail());
					break;
				case MailUtility.COMPANY_NAME:
					if (user.getCompany() != null) {
						invoiceDataMap.put(value, user.getCompany().getCompanyName());
					} else {
						invoiceDataMap.put(value, "---");
					}
					break;
				case MailUtility.COMPANYLOGO:
					if (user.getCompany() != null && user.getCompany().getCompanyLogo() != null) {
						String image = " data:image/jpg;base64," + DatatypeConverter.printBase64Binary(
								user.getCompany().getCompanyLogo()) ;
						invoiceDataMap.put(value, image);
					} else {
						invoiceDataMap.put(value, "");
					}
					break;
				case MailUtility.VAT_TYPE:
					if (MailUtility.VAT_TYPE != null)
						getVat(invoice, invoiceDataMap, value);
					break;
				case MailUtility.CN_VAT_TYPE:
					if (MailUtility.CN_VAT_TYPE != null)
						getCNVat(invoice, invoiceDataMap, value);
					break;
//				case MailUtility.INVOICE_LINEITEM_VAT_AMOUNT:
//					if (MailUtility.VAT_AMOUNT != null)
//						getVatAmount(invoice, invoiceDataMap, value);
//					break;
				case MailUtility.DUE_AMOUNT:
					if (invoice.getDueAmount() != null) {
						invoiceDataMap.put(value, invoice.getDueAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
					} else {
						invoiceDataMap.put(value, "---");
					}
					break;
				case MailUtility.DESCRIPTION:
					getDescription(invoice, invoiceDataMap, value);
					break;
				case MailUtility.CN_DESCRIPTION:
					getCnDescription(invoice, invoiceDataMap, value);
					break;
				case MailUtility.COMPANY_ADDRESS_LINE1:
					if (user.getCompany() != null) {
						invoiceDataMap.put(value, user.getCompany().getCompanyAddressLine1());
					} else {
						invoiceDataMap.put(value, "---");
					}
					break;
				case MailUtility.COMPANY_ADDRESS_LINE2:
					if (user.getCompany() != null) {
						invoiceDataMap.put(value, user.getCompany().getCompanyAddressLine2());
					} else {
						invoiceDataMap.put(value, "---");
					}
					break;
				case MailUtility.COMPANY_POST_ZIP_CODE:
					if (user.getCompany().getCompanyPoBoxNumber() != null) {
						invoiceDataMap.put(value, user.getCompany().getCompanyPoBoxNumber());
					} else {
						invoiceDataMap.put(value, "---");
					}
					break;
				case MailUtility.COMPANY_COUNTRY_CODE:
					if (user.getCompany() != null) {
						invoiceDataMap.put(value, user.getCompany().getCompanyCountryCode().getCountryName());
					} else {
						invoiceDataMap.put(value, "---");
					}
					break;
				case MailUtility.COMPANY_STATE_REGION:
					if (user.getCompany() != null) {
						invoiceDataMap.put(value, user.getCompany().getCompanyStateCode().getStateName());
					} else {
						invoiceDataMap.put(value, "---");
					}
					break;
				case MailUtility.COMPANY_CITY:
					if (user.getCompany().getCompanyCity() != null) {
						invoiceDataMap.put(value, user.getCompany().getCompanyCity());
					} else {
						invoiceDataMap.put(value, "---");
					}
					break;
				case MailUtility.COMPANY_REGISTRATION_NO:
					if (user.getCompany().getCompanyRegistrationNumber() != null) {
						invoiceDataMap.put(value, user.getCompany().getCompanyRegistrationNumber());
					} else {
						invoiceDataMap.put(value, "---");
					}
					break;
				case MailUtility.VAT_NUMBER:
					if (user.getCompany() != null) {
						invoiceDataMap.put(value, user.getCompany().getVatNumber());
					} else {
						invoiceDataMap.put(value, "---");
					}
					break;
				case MailUtility.COMPANY_MOBILE_NUMBER:
					if (user.getCompany() != null && user.getCompany().getPhoneNumber() != null) {
						String[] numbers=user.getCompany().getPhoneNumber().split(",");
						String mobileNumber="";
						if(numbers.length!=0){
							if(numbers[0]!=null)
								mobileNumber=mobileNumber.concat(numbers[0]);
						}
						invoiceDataMap.put(value,mobileNumber );
					} else {
						invoiceDataMap.put(value, "---");
					}
					break;
				case MailUtility.POST_ZIP_CODE:
					getPostZipCode(invoice, invoiceDataMap, value);
					break;
				case MailUtility.VAT_REGISTRATION_NUMBER:
					getVatRegistrationNumber(invoice, invoiceDataMap, value);
					break;
				case MailUtility.STATUS:
					getStatus(invoice, invoiceDataMap, value);
					break;
				case MailUtility.NOTES:
					getNotes(invoice, invoiceDataMap, value);
					break;
//					case MailUtility.VAT_ID:
//						getName(invoice, invoiceDataMap, value);
//						break;
				case MailUtility.INVOICE_LINEITEM_EXCISE_TAX:
					if (MailUtility.INVOICE_LINEITEM_EXCISE_TAX != null)
						getInvoiceLineItemExciseTax(invoice, invoiceDataMap, value);
					break;
				case MailUtility.CN_LINEITEM_EXCISE_TAX:
					if (MailUtility.CN_LINEITEM_EXCISE_TAX != null)
						getCNLineItemExciseTax(invoice, invoiceDataMap, value);
					break;
				case MailUtility.TOTAL_EXCISE_AMOUNT:
					getTotalExciseAmount(invoice, invoiceDataMap, value);
					break;
				case MailUtility.CN_TOTAL_EXCISE_AMOUNT:
					getCnTotalExciseAmount(invoice, invoiceDataMap, value);
					break;
				case MailUtility.INVOICE_LINEITEM_VAT_AMOUNT:
					getInvoiceLineItemVatAmount(invoice, invoiceDataMap, value);
					break;
				case MailUtility.CN_VAT_AMOUNT:
					getCnLineItemVatAmount(invoice, invoiceDataMap, value);
					break;
				default:
			}
		}
		return invoiceDataMap;
	}
	private Map<String, String> getCNData(Contact contact, Integer userId,CreditNote creditNote) {
		Map<String, String> map = mailUtility.getInvoiceEmailParamMap();
		Map<String, String> invoiceDataMap = new HashMap<>();
		User user = userService.findByPK(userId);
		for (String key : map.keySet()) {
			String value = map.get(key);
			switch (key) {
				case MailUtility.INVOICE_REFEREBCE_NO:
					getCNNumber(creditNote, invoiceDataMap, value);
					break;
				case MailUtility.CN_REFERENCE_NO:
					getReferenceNumber(creditNote, invoiceDataMap, value);
					break;
				case MailUtility.INVOICE_DATE:
					getCreditNoteDate(creditNote, invoiceDataMap, value);
					break;
				case MailUtility.CONTRACT_PO_NUMBER:
					getCnContactPoNumber(contact, invoiceDataMap, value);
					break;
				case MailUtility.CONTACT_NAME:
					getContact(contact, invoiceDataMap, value);
					break;
				case MailUtility.CONTACT_ADDRESS_LINE1:
					getCNContactAddress1(contact, invoiceDataMap, value);
					break;
				case MailUtility.CONTACT_COUNTRY:
					getCNContactCountry(contact, invoiceDataMap, value);
					break;
				case MailUtility.CONTACT_STATE:
					getCNContactState(contact, invoiceDataMap, value);
					break;
				case MailUtility.MOBILE_NUMBER:
					getMobileNumber(contact, invoiceDataMap, value);
					break;
				case MailUtility.CONTACT_CITY:
					getCNContactCity(contact, invoiceDataMap, value);
					break;
				case MailUtility.CONTACT_EMAIL:
					getCNContactEmail(contact, invoiceDataMap, value);
					break;
				case MailUtility.EXCHANGE_RATE:
					getCNContactCurrencyExchange(contact, invoiceDataMap, value);
					break;
				case MailUtility.TOTAL:
					getCNTotal(creditNote, invoiceDataMap, value);
					break;
					case MailUtility.SENDER_NAME:
					invoiceDataMap.put(value, user.getUserEmail());
					break;
				case MailUtility.COMPANY_NAME:
					if (user.getCompany() != null) {
						invoiceDataMap.put(value, user.getCompany().getCompanyName());
					} else {
						invoiceDataMap.put(value, "---");
					}
					break;
				case MailUtility.COMPANYLOGO:
					if (user.getCompany() != null && user.getCompany().getCompanyLogo() != null) {
						String image = " data:image/jpg;base64," + DatatypeConverter.printBase64Binary(
								user.getCompany().getCompanyLogo()) ;
						invoiceDataMap.put(value, image);
					} else {
						invoiceDataMap.put(value, "");
					}
					break;
				case MailUtility.COMPANY_ADDRESS_LINE1:
					if (user.getCompany() != null) {
						invoiceDataMap.put(value, user.getCompany().getCompanyAddressLine1());
					} else {
						invoiceDataMap.put(value, "---");
					}
					break;
				case MailUtility.COMPANY_ADDRESS_LINE2:
					if (user.getCompany() != null) {
						invoiceDataMap.put(value, user.getCompany().getCompanyAddressLine2());
					} else {
						invoiceDataMap.put(value, "---");
					}
					break;
				case MailUtility.COMPANY_POST_ZIP_CODE:
					if (user.getCompany().getCompanyPoBoxNumber() != null) {
						invoiceDataMap.put(value, user.getCompany().getCompanyPoBoxNumber());
					} else {
						invoiceDataMap.put(value, "---");
					}
					break;
				case MailUtility.COMPANY_COUNTRY_CODE:
					if (user.getCompany() != null) {
						invoiceDataMap.put(value, user.getCompany().getCompanyCountryCode().getCountryName());
					} else {
						invoiceDataMap.put(value, "---");
					}
					break;
				case MailUtility.COMPANY_STATE_REGION:
					if (user.getCompany() != null) {
						invoiceDataMap.put(value, user.getCompany().getCompanyStateCode().getStateName());
					} else {
						invoiceDataMap.put(value, "---");
					}
					break;
				case MailUtility.COMPANY_CITY:
					if (user.getCompany().getCompanyCity() != null) {
						invoiceDataMap.put(value, user.getCompany().getCompanyCity());
					} else {
						invoiceDataMap.put(value, "---");
					}
					break;
				case MailUtility.COMPANY_REGISTRATION_NO:
					if (user.getCompany().getCompanyRegistrationNumber() != null) {
						invoiceDataMap.put(value, user.getCompany().getCompanyRegistrationNumber());
					} else {
						invoiceDataMap.put(value, "---");
					}
					break;
				case MailUtility.VAT_NUMBER:
					if (user.getCompany() != null) {
						invoiceDataMap.put(value, user.getCompany().getVatNumber());
					} else {
						invoiceDataMap.put(value, "---");
					}
					break;
				case MailUtility.COMPANY_MOBILE_NUMBER:
					if (user.getCompany() != null && user.getCompany().getPhoneNumber() != null) {
						String[] numbers=user.getCompany().getPhoneNumber().split(",");
						String mobileNumber="";
						if(numbers.length!=0){
							if(numbers[0]!=null)
								mobileNumber=mobileNumber.concat(numbers[0]);
						}
						invoiceDataMap.put(value,mobileNumber );
					} else {
						invoiceDataMap.put(value, "---");
					}
					break;
				case MailUtility.POST_ZIP_CODE:
					getPostZipCode(contact, invoiceDataMap, value);
					break;
				case MailUtility.VAT_REGISTRATION_NUMBER:
					getVatRegistrationNumber(contact, invoiceDataMap, value);
					break;
				case MailUtility.NOTES:
					getCNNotes(creditNote, invoiceDataMap, value);
					break;
				default:
			}
		}
		return invoiceDataMap;
	}
	private void getTaxableAmount(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		int row=0;
		if (invoice.getInvoiceLineItems() != null) {
			BigDecimal taxableAmount=BigDecimal.ZERO;
			for(InvoiceLineItem invoiceLineItem : invoice.getInvoiceLineItems()){
				if (invoiceLineItem.getUnitPrice()!= null) {
					if(invoiceLineItem.getVatCategory()!=null && invoiceLineItem.getVatCategory().getId()==1)
						taxableAmount=taxableAmount.add( invoiceLineItem.getUnitPrice().setScale(2, BigDecimal.ROUND_HALF_EVEN));
				}
			}
			invoiceDataMap.put(value, taxableAmount.toString());
		}
	}
	private void getTaxAmount(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		int row=0;
		if (invoice.getInvoiceLineItems() != null) {
			BigDecimal taxAmount=BigDecimal.ZERO;
			for(InvoiceLineItem invoiceLineItem : invoice.getInvoiceLineItems()){
				if (invoiceLineItem.getUnitPrice()!= null ) {
					if(invoiceLineItem.getVatCategory()!=null && invoiceLineItem.getVatCategory().getId()==1)
						taxAmount=taxAmount.add( invoiceLineItem.getVatAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN));
				}
			}
			invoiceDataMap.put(value, taxAmount.toString());

		}
	}

	private void getInvoiceLineItemExciseTax(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		int row=0;
		if (invoice.getInvoiceLineItems() != null) {
			for(InvoiceLineItem invoiceLineItem : invoice.getInvoiceLineItems()){
				if (invoiceLineItem.getExciseCategory()!= null) {
					if (row==0){
						row++;
//						invoiceDataMap.put(value, invoiceLineItem.getUnitPrice().toString() );
						invoiceDataMap.put(value, invoiceLineItem.getExciseCategory().getName());
					}
					else {
//						invoiceDataMap.put("{unitPrice"+row+"}", invoiceLineItem.getUnitPrice().toString());
						invoiceDataMap.put("{invoiceLineItemExciseTax"+row+"}", invoiceLineItem.getExciseCategory().getName());
						row++;
					}

				}
				else {
					if (row==0){
						row++;
						invoiceDataMap.put(value,  "---" );
					}
					else {
						invoiceDataMap.put("{invoiceLineItemExciseTax"+row+"}", "---");
						row++;
					}
//					invoiceDataMap.put("{description"+row+"}", "---");
//					row++;
				}
			}}
	}

	private void getCNLineItemExciseTax(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		int row=0;
		CreditNote creditNote = creditNoteRepository.findByInvoiceIdAndDeleteFlag(invoice.getId(),false);
		if (creditNote !=null && creditNote.getCreditNoteLineItems() != null) {
			for(CreditNoteLineItem creditNoteLineItem : creditNote.getCreditNoteLineItems()){
				if (creditNoteLineItem.getExciseCategory()!= null) {
					if (row==0){
						row++;
						invoiceDataMap.put(value, creditNoteLineItem.getExciseCategory().getName());
					}
					else {
						invoiceDataMap.put("{CnLineItemExciseTax"+row+"}", creditNoteLineItem.getExciseCategory().getName());
						row++;
					}

				}
				else {
					if (row==0){
						row++;
						invoiceDataMap.put(value,  "---" );
					}
					else {
						invoiceDataMap.put("{CnLineItemExciseTax"+row+"}", "---");
						row++;
					}
				}
			}}
	}

	private void getTotalExciseAmount(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		if (invoice.getTotalExciseAmount() != null) {
			invoiceDataMap.put(value, invoice.getTotalExciseAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
		}
		else{
			invoiceDataMap.put(value, "---");
		}
	}
	private void getCnTotalExciseAmount(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		CreditNote creditNote = creditNoteRepository.findByInvoiceIdAndDeleteFlag(invoice.getId(),false);
		if (creditNote!=null && creditNote.getTotalExciseAmount() != null) {
			invoiceDataMap.put(value, creditNote.getTotalExciseAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
		}
		else{
			invoiceDataMap.put(value, "---");
		}
	}

	private void getInvoiceLineItemVatAmount(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		int row=0;
		if (invoice.getInvoiceLineItems() != null) {
			for(InvoiceLineItem invoiceLineItem : invoice.getInvoiceLineItems()){
				if (invoiceLineItem.getVatAmount()!= null ) {
					if (row==0){
						row++;
//						invoiceDataMap.put(value, invoiceLineItem.getUnitPrice().toString() );
						invoiceDataMap.put(value, invoiceLineItem.getVatAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
					}
					else {
//						invoiceDataMap.put("{unitPrice"+row+"}", invoiceLineItem.getUnitPrice().toString());
						invoiceDataMap.put("{invoiceLineItemVatAmount"+row+"}", invoiceLineItem.getVatAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
						row++;
					}

				}
				else{
					invoiceDataMap.put(value, "---");
				}
			}}
	}
	private void getCnLineItemVatAmount(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		int row=0;
		CreditNote creditNote = creditNoteRepository.findByInvoiceIdAndDeleteFlag(invoice.getId(),false);
		if (creditNote !=null && creditNote.getCreditNoteLineItems() != null) {
			for(CreditNoteLineItem creditNoteLineItem : creditNote.getCreditNoteLineItems()){
				if (creditNoteLineItem.getVatAmount()!= null ) {
					if (row==0){
						row++;
						invoiceDataMap.put(value, creditNoteLineItem.getVatAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
					}
					else {
						invoiceDataMap.put("{CnVatAmount"+row+"}", creditNoteLineItem.getVatAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
						row++;
					}

				}
				else{
					invoiceDataMap.put(value, "---");
				}
			}}
	}

	private void getDescription(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		int row=0;
		if (invoice.getInvoiceLineItems() != null) {

			for (InvoiceLineItem invoiceLineItem : invoice.getInvoiceLineItems()) {
				if (invoiceLineItem.getDescription() != null) {
					if (row==0){
						row++;
						invoiceDataMap.put(value,  invoiceLineItem.getDescription() );
					}
					else {
						invoiceDataMap.put("{description"+row+"}",  invoiceLineItem.getDescription());
						row++;
					}
				} else {
					if (row==0){
						row++;
						invoiceDataMap.put(value,  "---" );
					}
					else {
						invoiceDataMap.put("{description"+row+"}", "---");
						row++;
					}
//					invoiceDataMap.put("{description"+row+"}", "---");
//					row++;
				}
			}
		}
	}

	private void getCnDescription(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		int row=0;
		CreditNote creditNote = creditNoteRepository.findByInvoiceIdAndDeleteFlag(invoice.getId(),false);
		if (creditNote !=null && creditNote.getCreditNoteLineItems() != null) {

			for (CreditNoteLineItem creditNoteLineItem : creditNote.getCreditNoteLineItems()) {
				if (creditNoteLineItem.getDescription() != null) {
					if (row==0){
						row++;
						invoiceDataMap.put(value,  creditNoteLineItem.getDescription() );
					}
					else {
						invoiceDataMap.put("{cnDescription"+row+"}",  creditNoteLineItem.getDescription());
						row++;
					}
				} else {
					if (row==0){
						row++;
						invoiceDataMap.put(value,  "---" );
					}
					else {
						invoiceDataMap.put("{cnDescription"+row+"}", "---");
						row++;
					}
//					invoiceDataMap.put("{description"+row+"}", "---");
//					row++;
				}
			}
		}
	}

	private void getProject(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		if (invoice.getProject() != null && !invoice.getProject().getProjectName().isEmpty()) {
			invoiceDataMap.put(value, invoice.getProject().getProjectName());
		}
		else{
			invoiceDataMap.put(value, "---");
		}

	}
	private void getCreditNote(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		CreditNote creditNote = creditNoteRepository.findByInvoiceIdAndDeleteFlag(invoice.getId(),false);
		if(creditNote!=null){
			invoiceDataMap.put(value,creditNote.getCreditNoteNumber());
		}
		else{
			invoiceDataMap.put(value, "---");
		}

	}

	private void getCNContact(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		CreditNote creditNote = creditNoteRepository.findByInvoiceIdAndDeleteFlag(invoice.getId(),false);
		if(creditNote!=null && creditNote.getContact() != null && !invoice.getContact().getOrganization().isEmpty()){
			invoiceDataMap.put(value,invoice.getContact().getOrganization());
		}
		else if (creditNote!=null && creditNote.getContact() != null && !invoice.getContact().getFirstName().isEmpty())
		{
			StringBuilder sb = new StringBuilder();
			Contact c = invoice.getContact();
			if (c.getFirstName() != null && !c.getFirstName().isEmpty()) {
				sb.append(c.getFirstName()).append(" ");
			}
			if (c.getMiddleName() != null && !c.getMiddleName().isEmpty()) {
				sb.append(c.getMiddleName()).append(" ");
			}
			if (c.getLastName() != null && !c.getLastName().isEmpty()) {
				sb.append(c.getLastName());
			}
			invoiceDataMap.put(value, sb.toString());
		}
		else{
			invoiceDataMap.put(value, "---");
		}

	}

	private void getContact(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		if(invoice.getContact() != null && !invoice.getContact().getOrganization().isEmpty()){
			invoiceDataMap.put(value,invoice.getContact().getOrganization());
		}
		else if (invoice.getContact() != null && !invoice.getContact().getFirstName().isEmpty()) {
			StringBuilder sb = new StringBuilder();
			Contact c = invoice.getContact();
			if (c.getFirstName() != null && !c.getFirstName().isEmpty()) {
				sb.append(c.getFirstName()).append(" ");
			}
			if (c.getMiddleName() != null && !c.getMiddleName().isEmpty()) {
				sb.append(c.getMiddleName()).append(" ");
			}
			if (c.getLastName() != null && !c.getLastName().isEmpty()) {
				sb.append(c.getLastName());
			}
			invoiceDataMap.put(value, sb.toString());
		}
		else{
			invoiceDataMap.put(value, "---");
		}

	}
	private void getContact(Contact contact, Map<String, String> invoiceDataMap, String value) {
		if(contact!= null && !contact.getOrganization().isEmpty()){
			invoiceDataMap.put(value,contact.getOrganization());
		}
		else if (contact != null && !contact.getFirstName().isEmpty()) {
			StringBuilder sb = new StringBuilder();
			Contact c = contact;
			if (c.getFirstName() != null && !c.getFirstName().isEmpty()) {
				sb.append(c.getFirstName()).append(" ");
			}
			if (c.getMiddleName() != null && !c.getMiddleName().isEmpty()) {
				sb.append(c.getMiddleName()).append(" ");
			}
			if (c.getLastName() != null && !c.getLastName().isEmpty()) {
				sb.append(c.getLastName());
			}
			invoiceDataMap.put(value, sb.toString());
		}
		else{
			invoiceDataMap.put(value, "---");
		}

	}
	private void getContactAddress1(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		if (invoice.getContact() != null || !invoice.getContact().getAddressLine1().isEmpty()) {
			StringBuilder sb = new StringBuilder();
			Contact c = invoice.getContact();
			if (c.getAddressLine1() != null && !c.getAddressLine1().isEmpty()) {
				sb.append(c.getAddressLine1()).append(" ");
			}
//			if (c.getAddressLine2() != null && !c.getAddressLine2().isEmpty()) {
//				sb.append(c.getAddressLine2()).append(" ");
//			}
//			if (c.getAddressLine3() != null && !c.getAddressLine3().isEmpty()) {
//				sb.append(c.getAddressLine3());
//			}
			invoiceDataMap.put(value, sb.toString());
		}
		else{
			invoiceDataMap.put(value, "---");
		}

	}
	private void getCNContactAddress1(Contact contact, Map<String, String> invoiceDataMap, String value) {
		if (contact != null || !contact.getAddressLine1().isEmpty()) {
			StringBuilder sb = new StringBuilder();
			Contact c = contact;
			if (c.getAddressLine1() != null && !c.getAddressLine1().isEmpty()) {
				sb.append(c.getAddressLine1()).append(" ");
			}
			invoiceDataMap.put(value, sb.toString());
		}
		else{
			invoiceDataMap.put(value, "---");
		}

	}

	private void getContactAddress2(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		if (invoice.getContact() != null || !invoice.getContact().getAddressLine1().isEmpty()) {
			StringBuilder sb = new StringBuilder();
			Contact c = invoice.getContact();
//			if (c.getAddressLine1() != null && !c.getAddressLine1().isEmpty()) {
//				sb.append(c.getAddressLine1()).append(" ");
//			}
			if (c.getAddressLine2() != null && !c.getAddressLine2().isEmpty()) {
				sb.append(c.getAddressLine2()).append(" ");
			}
//			if (c.getAddressLine3() != null && !c.getAddressLine3().isEmpty()) {
//				sb.append(c.getAddressLine3());
//			}
			invoiceDataMap.put(value, sb.toString());
		}
		else{
			invoiceDataMap.put(value, "---");
		}

	}

	private void getContactCountry(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		if (invoice.getContact() != null) {
			StringBuilder sb = new StringBuilder();
			Contact c = invoice.getContact();
			if (c==null) {
				invoiceDataMap.put(value, "N/A");
			}else if (c.getCountry() != null) {
				sb.append(c.getCountry().getCountryName()).append(" ");
				invoiceDataMap.put(value, sb.toString());
			}
			else{
				invoiceDataMap.put(value, "---");
			}
		}

	}
	private void getCNContactCountry(Contact contact, Map<String, String> invoiceDataMap, String value) {
		if (contact != null) {
			StringBuilder sb = new StringBuilder();
			Contact c = contact;
			if (c==null) {
				invoiceDataMap.put(value, "N/A");
			}else if (c.getCountry() != null) {
				sb.append(c.getCountry().getCountryName()).append(" ");
				invoiceDataMap.put(value, sb.toString());
			}
			else{
				invoiceDataMap.put(value, "---");
			}
		}

	}
	private void getContactState(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		if ( invoice.getContact()!=null && invoice.getContact().getState() != null ) {
			StringBuilder sb = new StringBuilder();
			Contact c = invoice.getContact();
			if (c==null) {
				invoiceDataMap.put(value, "N/A");
			}else if (c.getState().getStateName() != null) {
				sb.append(c.getState().getStateName()).append(" ");
				invoiceDataMap.put(value, sb.toString());
			}
		}
		else{
			invoiceDataMap.put(value, "---");
		}
	}
	private void getCNContactState(Contact contact, Map<String, String> invoiceDataMap, String value) {
		if ( contact!=null && contact.getState() != null ) {
			StringBuilder sb = new StringBuilder();
			Contact c = contact;
			if (c==null) {
				invoiceDataMap.put(value, "N/A");
			}else if (c.getState().getStateName() != null) {
				sb.append(c.getState().getStateName()).append(" ");
				invoiceDataMap.put(value, sb.toString());
			}
		}
		else{
			invoiceDataMap.put(value, "---");
		}
	}
	private void getContactCity(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		if (invoice.getContact()!=null && invoice.getContact().getCity() != null  ) {
			StringBuilder sb = new StringBuilder();
			Contact c = invoice.getContact();
			if (c==null) {
				invoiceDataMap.put(value, "N/A");
			}
			else if (c.getCity()!= null) {
				sb.append(c.getCity()).append(" ");
				invoiceDataMap.put(value, sb.toString());
			}
		}
		else{
			invoiceDataMap.put(value, "---");
		}

	}
	private void getCNContactCity(Contact contact, Map<String, String> invoiceDataMap, String value) {
		if (contact!=null && contact.getCity() != null  ) {
			StringBuilder sb = new StringBuilder();
			Contact c = contact;
			if (c==null) {
				invoiceDataMap.put(value, "N/A");
			}
			else if (c.getCity()!= null) {
				sb.append(c.getCity()).append(" ");
				invoiceDataMap.put(value, sb.toString());
			}
		}
		else{
			invoiceDataMap.put(value, "---");
		}

	}
	private void getContactEmail(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		if (invoice.getContact()!=null && invoice.getContact().getBillingEmail() != null  ) {
		    invoiceDataMap.put(value, invoice.getContact().getBillingEmail());
		}
		else{
			invoiceDataMap.put(value, "---");
		}

	}
	private void getCNContactEmail(Contact contact, Map<String, String> invoiceDataMap, String value) {
		if (contact !=null && contact.getBillingEmail() != null  ) {
			invoiceDataMap.put(value,contact.getBillingEmail());
		}
		else{
			invoiceDataMap.put(value, "---");
		}

	}private void getCNContactCurrencyExchange(Contact contact, Map<String, String> invoiceDataMap, String value) {
		if (contact !=null && contact.getCurrency() != null  ) {
			Currency currency = contact.getCurrency();
			CurrencyConversion currencyConversion = currencyConversionRepository.findByCurrencyCode(currency);
			if(currencyConversion.getExchangeRate().compareTo(BigDecimal.ONE) > 0) {
				invoiceDataMap.put(value, currencyConversion.getExchangeRate().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
			}
			else{
				invoiceDataMap.put(value, "---");
			}
		}
		else{
			invoiceDataMap.put(value, "---");
		}

	}

	private void getMobileNumber(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		if (invoice.getContact()!=null && invoice.getContact().getMobileNumber() != null ) {
			StringBuilder sb = new StringBuilder();
			Contact c = invoice.getContact();
			if (c.getMobileNumber() != null) {
				sb.append(c.getMobileNumber()).append(" ");
			}
			invoiceDataMap.put(value, sb.toString());
		}
		else{
			invoiceDataMap.put(value, "---");
		}
	}
	private void getMobileNumber(Contact contact, Map<String, String> invoiceDataMap, String value) {
		if (contact!=null && contact.getMobileNumber() != null ) {
			StringBuilder sb = new StringBuilder();
			Contact c = contact;
			if (c.getMobileNumber() != null) {
				sb.append(c.getMobileNumber()).append(" ");
			}
			invoiceDataMap.put(value, sb.toString());
		}
		else{
			invoiceDataMap.put(value, "---");
		}
	}
		public static String insertSpaces(String input, int interval) {
			if (input.contains(" ") && input.length()<20) {
				return input;
			}

			StringBuilder stringBuilder = new StringBuilder(input);

			for (int i = interval; i < stringBuilder.length(); i += interval + 1) {
				stringBuilder.insert(i, ' ');
			}

			return stringBuilder.toString();
		}


	private void getProduct(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		int row=0;
		if (invoice.getInvoiceLineItems() != null) {

			for(InvoiceLineItem invoiceLineItem : invoice.getInvoiceLineItems()){

				if (invoiceLineItem.getProduct().getProductName() != null) {
					String product = insertSpaces(invoiceLineItem.getProduct().getProductName(), 20);
					if (row==0){
						row++;
						invoiceDataMap.put(value, product );
					}
					else {
						invoiceDataMap.put("{product"+row+"}", product);
						row++;
					}

				}
				else{
					invoiceDataMap.put(value, "---");
				}
			}}

	}

	private void getCnProduct(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		int row=0;
		CreditNote creditNote = creditNoteRepository.findByInvoiceIdAndDeleteFlag(invoice.getId(),false);
		if(creditNote!=null){
		if(creditNote.getIsCNWithoutProduct().equals(Boolean.FALSE)) {
			if (creditNote != null && creditNote.getCreditNoteLineItems() != null) {
				for (CreditNoteLineItem creditNoteLineItem : creditNote.getCreditNoteLineItems()) {
					if (creditNoteLineItem.getProduct().getProductName() != null) {
						String product = insertSpaces(creditNoteLineItem.getProduct().getProductName(), 20);
						if (row == 0) {
							row++;
							invoiceDataMap.put(value, product);
						} else {
							invoiceDataMap.put("{Cn_product" + row + "}", product);
							row++;
						}

					} else {
						invoiceDataMap.put(value, "---");
					}
				}
			}
		}
		}

	}

	private void getUnitType(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		int row=0;
		if (invoice.getInvoiceLineItems() != null) {
			for(InvoiceLineItem invoiceLineItem : invoice.getInvoiceLineItems()){
				if (invoiceLineItem.getUnitType()!= null) {
					if (row==0){
						row++;
						invoiceDataMap.put(value, invoiceLineItem.getUnitType());
					}
					else {
						invoiceDataMap.put("{unitType"+row+"}", invoiceLineItem.getUnitType());
						row++;
					}

				}
				else{
					invoiceDataMap.put(value, "---");
				}
			}}
	}

	private void getCnUnitType(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		int row=0;
		CreditNote creditNote = creditNoteRepository.findByInvoiceIdAndDeleteFlag(invoice.getId(),false);
		if (creditNote !=null && creditNote.getCreditNoteLineItems() != null) {
			for(CreditNoteLineItem creditNoteLineItem : creditNote.getCreditNoteLineItems() ){
				if (creditNoteLineItem.getUnitType()!= null) {
					if (row==0){
						row++;
						invoiceDataMap.put(value, creditNoteLineItem.getUnitType());
					}
					else {
						invoiceDataMap.put("{CnunitType"+row+"}", creditNoteLineItem.getUnitType());
						row++;
					}

				}
				else{
					invoiceDataMap.put(value, "---");
				}
			}}
	}

	private void getUnitPrice(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		int row=0;
		if (invoice.getInvoiceLineItems() != null) {
			for(InvoiceLineItem invoiceLineItem : invoice.getInvoiceLineItems()){
				if (invoiceLineItem.getUnitPrice()!= null) {
					if (row==0){
						row++;
//						invoiceDataMap.put(value, invoiceLineItem.getUnitPrice().toString() );
						invoiceDataMap.put(value, invoiceLineItem.getUnitPrice().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
					}
					else {
//						invoiceDataMap.put("{unitPrice"+row+"}", invoiceLineItem.getUnitPrice().toString());
						invoiceDataMap.put("{unitPrice"+row+"}", invoiceLineItem.getUnitPrice().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
						row++;
					}

				}
				else{
					invoiceDataMap.put(value, "---");
				}
			}}
	}

	private void getCnUnitPrice(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		int row=0;
		CreditNote creditNote = creditNoteRepository.findByInvoiceIdAndDeleteFlag(invoice.getId(),false);
		if (creditNote!=null && creditNote.getCreditNoteLineItems() != null) {
			for(CreditNoteLineItem creditNoteLineItem : creditNote.getCreditNoteLineItems()){
				if (creditNoteLineItem.getUnitPrice()!= null) {
					if (row==0){
						row++;
						invoiceDataMap.put(value, creditNoteLineItem.getUnitPrice().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
					}
					else {
						invoiceDataMap.put("{cnUnitPrice"+row+"}", creditNoteLineItem.getUnitPrice().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
						row++;
					}

				}
				else{
					invoiceDataMap.put(value, "---");
				}
			}}
	}


	private void getDiscount(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		int row=0;
		if (value.equals("{invoiceDiscount}")){
			invoiceDataMap.put(value, invoice.getDiscount().toString());
		}
		else {
			if (invoice.getInvoiceLineItems() != null) {
				for(InvoiceLineItem invoiceLineItem : invoice.getInvoiceLineItems()){
					if (invoiceLineItem.getDiscount()!= null) {
						if (row==0){
							row++;
//						invoiceDataMap.put(value, invoiceLineItem.getExciseAmount().toString() );
							String percentagesymbol=invoiceLineItem.getDiscountType().equals(DiscountType.PERCENTAGE) ==true ?"%":"";
							invoiceDataMap.put(value, invoiceLineItem.getDiscount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString() +percentagesymbol);
						}
						else {
//						invoiceDataMap.put("{getExciseAmount"+row+"}", invoiceLineItem.getExciseAmount().toString());
							String percentagesymbol=invoiceLineItem.getDiscountType().equals(DiscountType.PERCENTAGE) ==true ?"%":"";
							invoiceDataMap.put("{discount"+row+"}", invoiceLineItem.getDiscount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString()+percentagesymbol);
							row++;
						}

					}
					else{
						invoiceDataMap.put(value, "---");
					}
				}}
		}
	}
	private void getCnDiscount(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		int row = 0;
		CreditNote creditNote = creditNoteRepository.findByInvoiceIdAndDeleteFlag(invoice.getId(), false);
		if(creditNote!=null){
		if (creditNote.getIsCNWithoutProduct().equals(Boolean.FALSE)) {
			if (creditNote != null && value.equals("{CreditNoteDiscount}")) {
				invoiceDataMap.put(value, creditNote.getDiscount().toString());
			} else {
				if (creditNote != null && creditNote.getCreditNoteLineItems() != null) {
					for (CreditNoteLineItem creditNoteLineItem : creditNote.getCreditNoteLineItems()) {
						if (creditNoteLineItem.getDiscount() != null) {
							if (row == 0) {
								row++;
								String percentagesymbol = creditNoteLineItem.getDiscountType().equals(DiscountType.PERCENTAGE) == true ? "%" : "";
								invoiceDataMap.put(value, creditNoteLineItem.getDiscount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString() + percentagesymbol);
							} else {
								String percentagesymbol = creditNoteLineItem.getDiscountType().equals(DiscountType.PERCENTAGE) == true ? "%" : "";
								invoiceDataMap.put("{Cndiscount" + row + "}", creditNoteLineItem.getDiscount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString() + percentagesymbol);
								row++;
							}

						} else {
							invoiceDataMap.put(value, "---");
						}
					}
				}
			}
		}
	}
	}


	private void getExciseAmount(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		int row=0;
		if (invoice.getInvoiceLineItems() != null) {
			for(InvoiceLineItem invoiceLineItem : invoice.getInvoiceLineItems()){
				if (invoiceLineItem.getExciseAmount()!= null) {
					if (row==0){
						row++;
//						invoiceDataMap.put(value, invoiceLineItem.getExciseAmount().toString() );
						invoiceDataMap.put(value, invoiceLineItem.getExciseAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
					}
					else {
//						invoiceDataMap.put("{getExciseAmount"+row+"}", invoiceLineItem.getExciseAmount().toString());
						invoiceDataMap.put("{exciseAmount"+row+"}", invoiceLineItem.getExciseAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
						row++;
					}

				}
				else{
					invoiceDataMap.put(value, "---");
				}
			}}
	}

	private void getCnExciseAmount(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		int row=0;
		CreditNote creditNote = creditNoteRepository.findByInvoiceIdAndDeleteFlag(invoice.getId(),false);
		if (creditNote!=null && creditNote.getCreditNoteLineItems() != null) {
			for(CreditNoteLineItem creditNoteLineItem : creditNote.getCreditNoteLineItems()){
				if (creditNoteLineItem.getExciseAmount()!= null) {
					if (row==0){
						row++;
						invoiceDataMap.put(value, creditNoteLineItem.getExciseAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
					}
					else {
						invoiceDataMap.put("{CnexciseAmount"+row+"}", creditNoteLineItem.getExciseAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
						row++;
					}

				}
				else{
					invoiceDataMap.put(value, "---");
				}
			}}
	}

	private void getInvoiceDuePeriod(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		if (invoice.getInvoiceDuePeriod() != null) {
			invoiceDataMap.put(value, invoice.getInvoiceDuePeriod().toString());
		}
		else{
			invoiceDataMap.put(value, "---");
		}
	}
	private void getInvoiceVatAmount(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		if (invoice.getTotalVatAmount() != null) {
			invoiceDataMap.put(value, invoice.getTotalVatAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
		}
		else{
			invoiceDataMap.put(value, "---");
		}
	}
	private void getCreditNoteVatAmount(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		CreditNote creditNote = creditNoteRepository.findByInvoiceIdAndDeleteFlag(invoice.getId(),false);
		if (creditNote!=null && creditNote.getTotalVatAmount() != null) {
			invoiceDataMap.put(value, creditNote.getTotalVatAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
		}
		else{
			invoiceDataMap.put(value, "---");
		}
	}
	private void getQuantity(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		int row=0;
		if (invoice.getInvoiceLineItems() != null) {

			for(InvoiceLineItem invoiceLineItem : invoice.getInvoiceLineItems()){

				if (invoiceLineItem.getQuantity()!= null) {
					if (row==0){
						row++;
						invoiceDataMap.put(value,  invoiceLineItem.getQuantity().toString() );
					}
					else {
						invoiceDataMap.put("{quantity"+row+"}",  invoiceLineItem.getQuantity().toString());
						row++;
					}
				}
				else{
					invoiceDataMap.put(value, "---");
				}
			}}
	}

	private void getCnQuantity(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		int row=0;
		CreditNote creditNote = creditNoteRepository.findByInvoiceIdAndDeleteFlag(invoice.getId(),false);
		if (creditNote!=null && creditNote.getCreditNoteLineItems() != null) {

			for(CreditNoteLineItem creditNoteLineItem : creditNote.getCreditNoteLineItems()){

				if (creditNoteLineItem.getQuantity()!= null) {
					if (row==0){
						row++;
						invoiceDataMap.put(value,  creditNoteLineItem.getQuantity().toString() );
					}
					else {
						invoiceDataMap.put("{Cnquantity"+row+"}",  creditNoteLineItem.getQuantity().toString());
						row++;
					}
				}
				else{
					invoiceDataMap.put(value, "---");
				}
			}}
	}
	private void getTotal(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		if (invoice.getTotalAmount() != null) {
			invoiceDataMap.put(value, invoice.getTotalAmount().subtract(invoice.getTotalVatAmount()).setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
		}
		else{
			invoiceDataMap.put(value, "---");
		}
	}
	private void getCnTotal(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		CreditNote creditNote = creditNoteRepository.findByInvoiceIdAndDeleteFlag(invoice.getId(),false);
		if (creditNote!=null && creditNote.getTotalAmount() != null) {
			invoiceDataMap.put(value, creditNote.getTotalAmount().subtract(creditNote.getTotalAmount()).setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
		}
		else{
			invoiceDataMap.put(value, "---");
		}
	}
	private void getCNTotal(CreditNote creditNote, Map<String, String> invoiceDataMap, String value) {
		if (creditNote.getTotalAmount() != null) {
			invoiceDataMap.put(value, creditNote.getTotalAmount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
		}
		else{
			invoiceDataMap.put(value, "---");
		}
	}

	private void getTotalNet(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		if (invoice.getTotalAmount() != null) {
			invoiceDataMap.put(value, invoice.getTotalAmount().subtract(invoice.getTotalVatAmount()).subtract(invoice.getTotalExciseAmount()).setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
		}
		else{
			invoiceDataMap.put(value, "---");
		}
	}

	private void getsubtotal(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		int row=0;
		if (invoice.getInvoiceLineItems() != null) {

			for(InvoiceLineItem invoiceLineItem : invoice.getInvoiceLineItems()){

				if (invoiceLineItem.getSubTotal() != null) {
					if (row==0){
						row++;
						invoiceDataMap.put(value,  invoiceLineItem.getSubTotal().setScale(2, BigDecimal.ROUND_HALF_EVEN)+"" );
					}
					else {
						invoiceDataMap.put("{subTotal"+row+"}",  invoiceLineItem.getSubTotal().setScale(2, BigDecimal.ROUND_HALF_EVEN)+"");
						row++;
					}
//				if(invoiceLineItem.getSubTotal() != null ){
//					if (row==0) {
//						row++;
//						invoiceDataMap.put("{taxableAmount" + row + "}", invoiceLineItem.getSubTotal().setScale(2, BigDecimal.ROUND_HALF_EVEN) + "");
//					}
//				}
//				else {
//					invoiceDataMap.put("{taxableAmount"+row+"}",  invoiceLineItem.getSubTotal().setScale(2, BigDecimal.ROUND_HALF_EVEN)+"");
//					row++;
//				}
				}
				else{
					invoiceDataMap.put(value, "---");
				}
			}}
	}

	private void getCnsubtotal(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		int row=0;
		CreditNote creditNote = creditNoteRepository.findByInvoiceIdAndDeleteFlag(invoice.getId(),false);
		if (creditNote!=null && creditNote.getCreditNoteLineItems() != null) {

			for(CreditNoteLineItem creditNoteLineItem : creditNote.getCreditNoteLineItems() ){

				if (creditNoteLineItem.getSubTotal() != null) {
					if (row==0){
						row++;
						invoiceDataMap.put(value,  creditNoteLineItem.getSubTotal().setScale(2, BigDecimal.ROUND_HALF_EVEN)+"" );
					}
					else {
						invoiceDataMap.put("{CnsubTotal"+row+"}",  creditNoteLineItem.getSubTotal().setScale(2, BigDecimal.ROUND_HALF_EVEN)+"");
						row++;
					}
				}
				else{
					invoiceDataMap.put(value, "---");
				}
			}}
	}


	private void getContactPoNumber(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		if (invoice.getContact().getPoBoxNumber() != null && !invoice.getContact().getPoBoxNumber().isEmpty()) {
			invoiceDataMap.put(value, invoice.getContact().getPoBoxNumber());
		}
		else{
			invoiceDataMap.put(value, "---");
		}
	}
	private void getCnContactPoNumber(Contact contact, Map<String, String> invoiceDataMap, String value) {
		if (contact.getPoBoxNumber() != null && !contact.getPoBoxNumber().isEmpty()) {
			invoiceDataMap.put(value, contact.getPoBoxNumber());
		}
		else{
			invoiceDataMap.put(value, "---");
		}
	}

	//	private void getDiscount(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
//		if (invoice.getDiscount() != null) {
//			invoiceDataMap.put(value, invoice.getDiscount().setScale(2, BigDecimal.ROUND_HALF_EVEN).toString());
//		}
//		else{
//			invoiceDataMap.put(value, "---");
//		}
//	}
	private void getVat(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		int row=0;
		if (invoice.getInvoiceLineItems() != null) {

			for(InvoiceLineItem invoiceLineItem : invoice.getInvoiceLineItems()){

				if (invoiceLineItem.getVatCategory() != null) {
					if (row==0){
						row++;
						invoiceDataMap.put(value,  invoiceLineItem.getVatCategory().getVat().toString());
					}
					else {
						invoiceDataMap.put("{vatType"+row+"}",  invoiceLineItem.getVatCategory().getVat().toString());
						row++;
					}
				}
				else{
					invoiceDataMap.put(value, "---");
				}
			}}
	}

	private void getCNVat(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		int row=0;
		CreditNote creditNote = creditNoteRepository.findByInvoiceIdAndDeleteFlag(invoice.getId(),false);
		if (creditNote!=null && creditNote.getCreditNoteLineItems() != null) {

			for(CreditNoteLineItem creditNoteLineItem : creditNote.getCreditNoteLineItems()){

				if (creditNoteLineItem.getVatCategory() != null) {
					if (row==0){
						row++;
						invoiceDataMap.put(value,  creditNoteLineItem.getVatCategory().getVat().toString());
					}
					else {
						invoiceDataMap.put("{CnvatType"+row+"}",  creditNoteLineItem.getVatCategory().getVat().toString());
						row++;
					}
				}
				else{
					invoiceDataMap.put(value, "---");
				}
			}}
	}

	private void getInvoiceDueDate(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		if (invoice.getInvoiceDueDate() != null) {
			LocalDateTime localDateTime = invoice.getInvoiceDueDate().atStartOfDay();
			invoiceDataMap.put(value,  dateFormtUtil.getLocalDateTimeAsString(localDateTime, dateFormat));
		}
		else{
			invoiceDataMap.put(value, "---");
		}
	}

	private void getInvoiceDate(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		if (invoice.getInvoiceDate() != null) {
			LocalDateTime localDateTime = invoice.getInvoiceDate().atStartOfDay();
			invoiceDataMap.put(value, dateFormtUtil.getLocalDateTimeAsString(localDateTime, dateFormat));
		}
		else{
			invoiceDataMap.put(value, "---");
		}
	}
	private void getCreditNoteDate(CreditNote creditNote, Map<String, String> invoiceDataMap, String value) {
		if (creditNote.getCreditNoteDate() != null) {
//			Date date = Date.from(creditNote.getCreditNoteDate().toInstant());
			DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
			invoiceDataMap.put(value, creditNote.getCreditNoteDate().toLocalDate().format(formatter).toString());
		}
		else{
			invoiceDataMap.put(value, "---");
		}
	}

	private void getReferenceNumber(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		if (invoice.getReferenceNumber() != null && !invoice.getReferenceNumber().isEmpty()) {
			invoiceDataMap.put(value, invoice.getReferenceNumber());
		}
		else{
			invoiceDataMap.put(value, "---");
		}
	}

	private void getCNNumber(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		CreditNote creditNote = creditNoteRepository.findByInvoiceIdAndDeleteFlag(invoice.getId(),false);
		if (creditNote!=null) {
			invoiceDataMap.put(value, creditNote.getCreditNoteNumber());
		}
		else{
			invoiceDataMap.put(value, "---");
		}

	}
	private void getCNNumber(CreditNote creditNote, Map<String, String> invoiceDataMap, String value) {
		if (creditNote.getCreditNoteNumber() != null && !creditNote.getCreditNoteNumber().isEmpty()) {
			invoiceDataMap.put(value, creditNote.getCreditNoteNumber());
		}
		else{
			invoiceDataMap.put(value, "---");
		}
	}
	private void getReferenceNumber(CreditNote creditNote, Map<String, String> invoiceDataMap, String value) {
		if (creditNote.getReferenceNo() != null && !creditNote.getReferenceNo().isEmpty()) {
			invoiceDataMap.put(value, creditNote.getReferenceNo());
		}
		else{
			invoiceDataMap.put(value, "---");
		}
	}

	private String getInvoceStatusLabel(Date dueDate) {
		String status = "";
		Date today = new Date();
		today = org.apache.commons.lang.time.DateUtils.truncate(today, Calendar.DAY_OF_MONTH);
		int dueDays = dateUtils.diff(today, dueDate);
		int dueDay = Math.abs(dueDays);
		if (dueDays > 0) {
			status = ("Over Due by " + dueDay + " Days");
		} else if (dueDays < 0) {
			status = (" Due in " + dueDay + " Days");
		} else if (dueDays == 0) {
			status = ("Due Today");
		}
		return status;
	}

	public String getInvoiceStatus(Integer status, Date dueDate) {
		String statusLabel = "";
		if (status > 2 && status < 5) {
			statusLabel = getInvoceStatusLabel(dueDate);
		} else {
			statusLabel = CommonStatusEnum.getInvoiceTypeByValue(status);
		}
		return statusLabel;
	}
	//TODO
	@Transactional(rollbackFor = Exception.class)
	public Journal invoicePosting(PostingRequestModel postingRequestModel, Integer userId) {

		List<JournalLineItem> journalLineItemList = new ArrayList<>();

		Invoice invoice = invoiceService.findByPK(postingRequestModel.getPostingRefId());
//		CurrencyConversion exchangeRate =  currencyExchangeService.getExchangeRate(invoice.getCurrency().getCurrencyCode());

		boolean isCustomerInvoice = InvoiceTypeConstant.isCustomerInvoice(invoice.getType());

		Journal journal = new Journal();
		JournalLineItem journalLineItem1 = new JournalLineItem();
//		TransactionCategory transactionCategory = transactionCategoryService
//				.findTransactionCategoryByTransactionCategoryCode(
//						isCustomerInvoice ? TransactionCategoryCodeEnum.ACCOUNT_RECEIVABLE.getCode()
//								: TransactionCategoryCodeEnum.ACCOUNT_PAYABLE.getCode());

//		if(invoice.getContact() != null)
//		{
//			TransactionCategory transactionCategory = invoice.getContact().getTransactionCategory();
//			journalLineItem1.setTransactionCategory(transactionCategory);
//		}
			Map<String, Object> map = new HashMap<>();
			map.put("contact",invoice.getContact());
			map.put("contactType", invoice.getType());
		    map.put("deleteFlag",Boolean.FALSE);
			ContactTransactionCategoryRelation contactTransactionCategoryRelation = contactTransactionCategoryService.findByAttributes(map).get(0);
		journalLineItem1.setTransactionCategory(contactTransactionCategoryRelation.getTransactionCategory());
//		BigDecimal amountWithoutDiscount = invoice.getTotalAmount().subtract(invoice.getDiscount());
		BigDecimal amountWithoutDiscount = invoice.getTotalAmount();
		if (isCustomerInvoice)
			//journalLineItem1.setDebitAmount(invoice.getTotalAmount().subtract(invoice.getTotalVatAmount()));

			journalLineItem1.setDebitAmount(amountWithoutDiscount.multiply(invoice.getExchangeRate()));
//			journalLineItem1.setDebitAmount(invoice.getTotalAmount().divide(invoice.getExchangeRate(), 2, RoundingMode.HALF_UP));
		else
			//journalLineItem1.setCreditAmount(invoice.getTotalAmount().subtract(invoice.getTotalVatAmount()));
			//journalLineItem1.setCreditAmount(invoice.getTotalAmount().multiply(invoice.getExchangeRate()));
		if (invoice.getIsReverseChargeEnabled().equals(Boolean.TRUE)){
			BigDecimal amnt = amountWithoutDiscount.subtract(invoice.getTotalVatAmount());
			journalLineItem1.setCreditAmount(amnt.multiply(invoice.getExchangeRate()));
		}
		else {
			journalLineItem1.setCreditAmount(amountWithoutDiscount.multiply(invoice.getExchangeRate()));
		}
		journalLineItem1.setReferenceType(PostingReferenceTypeEnum.INVOICE);
		journalLineItem1.setReferenceId(postingRequestModel.getPostingRefId());
		journalLineItem1.setExchangeRate(invoice.getExchangeRate());
		journalLineItem1.setCreatedBy(userId);
		journalLineItem1.setJournal(journal);
		journalLineItemList.add(journalLineItem1);

		Map<String, Object> param = new HashMap<>();
		param.put("invoice", invoice);
		param.put("deleteFlag", false);

		List<InvoiceLineItem> invoiceLineItemList = invoiceLineItemService.findByAttributes(param);
		Map<Integer, List<InvoiceLineItem>> tnxcatIdInvLnItemMap = new HashMap<>();
		Map<Integer, TransactionCategory> tnxcatMap = new HashMap<>();
		customerInvoice(isCustomerInvoice, invoiceLineItemList, tnxcatIdInvLnItemMap, tnxcatMap,userId);
		Boolean isEligibleForInventoryAssetJournalEntry = false;
		Boolean isEligibleForInventoryJournalEntry = false;
		BigDecimal inventoryAssetValue = BigDecimal.ZERO;
		BigDecimal sumOfInventoryAssetValuePerTransactionCategory = BigDecimal.ZERO;
		for (Integer categoryId : tnxcatIdInvLnItemMap.keySet()) {
			List<InvoiceLineItem> sortedItemList = tnxcatIdInvLnItemMap.get(categoryId);
			BigDecimal inventoryAssetValuePerTransactionCategory = BigDecimal.ZERO;
			BigDecimal totalAmount = BigDecimal.ZERO;
			BigDecimal lineItemDiscount = BigDecimal.ZERO;
			TransactionCategory purchaseCategory = null;
			Map<TransactionCategory,BigDecimal> transactionCategoryTotalAmountMap = new HashMap<>();
			for (InvoiceLineItem sortedLineItem : sortedItemList) {

				BigDecimal amntWithoutVat = sortedLineItem.getUnitPrice()
						.multiply(BigDecimal.valueOf(sortedLineItem.getQuantity()));
				if (sortedLineItem.getDiscountType().equals(DiscountType.FIXED) && sortedLineItem.getDiscount()!=null){
					amntWithoutVat = amntWithoutVat.subtract(sortedLineItem.getDiscount());
					totalAmount = totalAmount.add(amntWithoutVat);
					lineItemDiscount = lineItemDiscount.add(sortedLineItem.getDiscount());
				}
				else if (sortedLineItem.getDiscountType().equals(DiscountType.PERCENTAGE) && sortedLineItem.getDiscount()!=null){

					BigDecimal discountedAmount = amntWithoutVat.multiply(sortedLineItem.getDiscount()).divide(BigDecimal.valueOf(100));
					amntWithoutVat = amntWithoutVat.subtract(discountedAmount);
					totalAmount = totalAmount.add(amntWithoutVat);
					lineItemDiscount = lineItemDiscount.add(discountedAmount);
				}
				else {
					totalAmount = totalAmount.add(amntWithoutVat);
				}
				if	(sortedLineItem.getProduct().getIsInventoryEnabled() !=null&&sortedLineItem.getProduct().getIsInventoryEnabled()  && isCustomerInvoice){
					List<Inventory> inventoryList = inventoryService.getInventoryByProductId(sortedLineItem.getProduct().
							getProductID());
					//		for (Inventory inventory:inventoryList) {
//						inventoryAssetValuePerTransactionCategory = inventoryAssetValuePerTransactionCategory.add(BigDecimal.
//								valueOf(sortedLineItem.getQuantity()).multiply(BigDecimal.valueOf
//								(inventory.getUnitCost())));
					if (sortedLineItem.getProduct().getAvgPurchaseCost()!=null) {
						inventoryAssetValuePerTransactionCategory = inventoryAssetValuePerTransactionCategory.add(BigDecimal.
								valueOf(sortedLineItem.getQuantity()).multiply(BigDecimal.valueOf
										(sortedLineItem.getProduct().getAvgPurchaseCost().floatValue())));
					}
					else {
						for (Inventory inventory : inventoryList) {
							inventoryAssetValuePerTransactionCategory = inventoryAssetValuePerTransactionCategory.add(BigDecimal.
									valueOf(sortedLineItem.getQuantity()).multiply(BigDecimal.valueOf
											(inventory.getUnitCost())));

						}
					}
					//		}
					purchaseCategory = sortedLineItem.getTrnsactioncCategory() != null ? sortedLineItem.getTrnsactioncCategory()
							: sortedLineItem.getProduct().getLineItemList().stream()
							.filter(p -> p.getPriceType().equals(ProductPriceType.PURCHASE)).findAny().get()
							.getTransactioncategory();
					isEligibleForInventoryJournalEntry = true;
				}
			}if(isCustomerInvoice && isEligibleForInventoryJournalEntry) {
				sumOfInventoryAssetValuePerTransactionCategory = sumOfInventoryAssetValuePerTransactionCategory.add
						(inventoryAssetValuePerTransactionCategory);
//				JournalLineItem journalLineItem = new JournalLineItem();
//				journalLineItem.setTransactionCategory(transactionCategoryService
//						.findTransactionCategoryByTransactionCategoryCode(
//								TransactionCategoryCodeEnum.INVENTORY_ASSET.getCode()));
//				journalLineItem.setCreditAmount(inventoryAssetValuePerTransactionCategory.multiply(invoice.getExchangeRate()));
//				journalLineItem.setReferenceType(PostingReferenceTypeEnum.INVOICE);
//				journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
//				journalLineItem.setCreatedBy(userId);
//				journalLineItem.setJournal(journal);
//				journalLineItemList.add(journalLineItem);
//				inventoryAssetValue = inventoryAssetValue.add(inventoryAssetValuePerTransactionCategory.multiply(invoice.
//						getExchangeRate()));
//				isEligibleForInventoryAssetJournalEntry = true;
			}
			//This list contains ILI which consist of excise Tax included in product price group by Transaction Category Id
			List<InvoiceLineItem> inclusiveExciseLineItems = sortedItemList.stream().
					filter(invoiceLineItem -> invoiceLineItem.
							getProduct().getExciseStatus()!=null && invoiceLineItem.
							getProduct().getExciseStatus().equals(Boolean.TRUE)).filter(invoiceLineItem ->
							invoiceLineItem.getInvoice().getTaxType()!=null && invoiceLineItem.getInvoice().getTaxType().equals(Boolean.TRUE)).filter
							(invoiceLineItem -> invoiceLineItem.getTrnsactioncCategory()
									.getTransactionCategoryId().equals(categoryId)).collect(Collectors.toList());
			if (!inclusiveExciseLineItems.isEmpty()){
				for (InvoiceLineItem invoiceLineItem:inclusiveExciseLineItems){
					totalAmount = totalAmount.subtract(invoiceLineItem.getExciseAmount());
				}
			}
			//To handle inclusive vat journal entry
			if (invoice.getTaxType().equals(Boolean.TRUE)){
				List<InvoiceLineItem> inclusiveVatLineItems = sortedItemList.stream().filter(invoiceLineItem ->
								invoiceLineItem.getInvoice().getTaxType()!=null && invoiceLineItem.getInvoice().getTaxType().equals(Boolean.TRUE)).
						filter(invoiceLineItem -> invoiceLineItem.getTrnsactioncCategory()
								.getTransactionCategoryId().equals(categoryId)).collect(Collectors.toList());
				if (!inclusiveVatLineItems.isEmpty()){
					for (InvoiceLineItem invoiceLineItem:inclusiveVatLineItems){
						totalAmount = totalAmount.subtract(invoiceLineItem.getVatAmount());
					}
				}
			}
			JournalLineItem journalLineItem = new JournalLineItem();
			journalLineItem.setTransactionCategory(tnxcatMap.get(categoryId));
			totalAmount = totalAmount.add(lineItemDiscount);
			if (isCustomerInvoice)
				//journalLineItem.setCreditAmount(totalAmount.multiply(invoice.getExchangeRate()));
				journalLineItem.setCreditAmount(totalAmount.multiply(invoice.getExchangeRate()));
			else
				//	journalLineItem.setDebitAmount(totalAmount.multiply(invoice.getExchangeRate()));
				journalLineItem.setDebitAmount(totalAmount.multiply(invoice.getExchangeRate()));
			journalLineItem.setReferenceType(PostingReferenceTypeEnum.INVOICE);
			journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
			journalLineItem.setExchangeRate(invoice.getExchangeRate());
			journalLineItem.setCreatedBy(userId);
			journalLineItem.setJournal(journal);
			journalLineItemList.add(journalLineItem);

//			if(isCustomerInvoice && isEligibleForInventoryAssetJournalEntry) {
//				 journalLineItem = new JournalLineItem();
//				journalLineItem.setTransactionCategory(transactionCategoryService
//						.findTransactionCategoryByTransactionCategoryCode(
//								TransactionCategoryCodeEnum.COST_OF_GOODS_SOLD.getCode()));
//				journalLineItem.setDebitAmount(inventoryAssetValue);
//				journalLineItem.setReferenceType(PostingReferenceTypeEnum.INVOICE);
//				journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
//				journalLineItem.setCreatedBy(userId);
//				journalLineItem.setJournal(journal);
//				journalLineItemList.add(journalLineItem);
//			}
		}
		//For multiple products Inventory Asset entry for journal  Should be single.
		if(isCustomerInvoice && isEligibleForInventoryJournalEntry) {
			JournalLineItem journalLineItem = new JournalLineItem();
			journalLineItem.setTransactionCategory(transactionCategoryService
					.findTransactionCategoryByTransactionCategoryCode(
							TransactionCategoryCodeEnum.INVENTORY_ASSET.getCode()));
			journalLineItem.setCreditAmount(sumOfInventoryAssetValuePerTransactionCategory);
			journalLineItem.setReferenceType(PostingReferenceTypeEnum.INVOICE);
			journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
			journalLineItem.setExchangeRate(invoice.getExchangeRate());
			journalLineItem.setCreatedBy(userId);
			journalLineItem.setJournal(journal);
			journalLineItemList.add(journalLineItem);
			inventoryAssetValue = inventoryAssetValue.add(sumOfInventoryAssetValuePerTransactionCategory);
			isEligibleForInventoryAssetJournalEntry = true;
		}
		//For multiple products CostOfGoodsSold entry for journal  Should be single.
		if(isCustomerInvoice && isEligibleForInventoryAssetJournalEntry) {
			JournalLineItem	journalLineItem = new JournalLineItem();
			journalLineItem.setTransactionCategory(transactionCategoryService
					.findTransactionCategoryByTransactionCategoryCode(
							TransactionCategoryCodeEnum.COST_OF_GOODS_SOLD.getCode()));
			journalLineItem.setDebitAmount(inventoryAssetValue);
			journalLineItem.setReferenceType(PostingReferenceTypeEnum.INVOICE);
			journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
			journalLineItem.setExchangeRate(invoice.getExchangeRate());
			journalLineItem.setCreatedBy(userId);
			journalLineItem.setJournal(journal);
			journalLineItemList.add(journalLineItem);
		}
		if((invoice.getTotalVatAmount() != null) && (invoice.getTotalVatAmount().compareTo(BigDecimal.ZERO) != 0 ))
		{
		//	if (invoice.getTotalVatAmount().compareTo(BigDecimal.ZERO) > 0 ) {
				JournalLineItem journalLineItem = new JournalLineItem();
				TransactionCategory inputVatCategory = transactionCategoryService
						.findTransactionCategoryByTransactionCategoryCode(
								isCustomerInvoice ? TransactionCategoryCodeEnum.OUTPUT_VAT.getCode()
										: TransactionCategoryCodeEnum.INPUT_VAT.getCode());
				journalLineItem.setTransactionCategory(inputVatCategory);
				if (isCustomerInvoice)
					journalLineItem.setCreditAmount(invoice.getTotalVatAmount().multiply(invoice.getExchangeRate()));
					//journalLineItem.setCreditAmount(invoice.getTotalVatAmount().divide(invoice.getExchangeRate(), 2, RoundingMode.HALF_UP));
				else
					journalLineItem.setDebitAmount(invoice.getTotalVatAmount().multiply(invoice.getExchangeRate()));
				journalLineItem.setReferenceType(PostingReferenceTypeEnum.INVOICE);
				journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
			    journalLineItem.setExchangeRate(invoice.getExchangeRate());
				journalLineItem.setCreatedBy(userId);
				journalLineItem.setJournal(journal);
				journalLineItemList.add(journalLineItem);
				if(invoice.getIsReverseChargeEnabled().equals(Boolean.TRUE)){
					JournalLineItem reverseChargeJournalLineItem = new JournalLineItem();
					TransactionCategory transactionCategory = transactionCategoryService
							.findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.OUTPUT_VAT.getCode());
					reverseChargeJournalLineItem.setTransactionCategory(transactionCategory);
					reverseChargeJournalLineItem.setCreditAmount(invoice.getTotalVatAmount().multiply(invoice.getExchangeRate()));
					reverseChargeJournalLineItem.setReferenceType(PostingReferenceTypeEnum.INVOICE);
					reverseChargeJournalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
					reverseChargeJournalLineItem.setExchangeRate(invoice.getExchangeRate());
					reverseChargeJournalLineItem.setCreatedBy(userId);
					reverseChargeJournalLineItem.setJournal(journal);
					journalLineItemList.add(reverseChargeJournalLineItem);
				}
	//		}
		}
		if(invoice.getDiscount().compareTo(BigDecimal.ZERO) == 1 && invoice.getDiscount()!=null) {
			JournalLineItem journalLineItem = new JournalLineItem();
			if (invoice.getType()==2) {
				journalLineItem.setDebitAmount(invoice.getDiscount().multiply(invoice.getExchangeRate()));
				journalLineItem.setTransactionCategory(transactionCategoryService
						.findTransactionCategoryByTransactionCategoryCode(
								TransactionCategoryCodeEnum.SALES_DISCOUNT.getCode()));
			}
			else {
				journalLineItem.setCreditAmount(invoice.getDiscount().multiply(invoice.getExchangeRate()));
				journalLineItem.setTransactionCategory(transactionCategoryService
						.findTransactionCategoryByTransactionCategoryCode(
								TransactionCategoryCodeEnum.PURCHASE_DISCOUNT.getCode()));
			}
			journalLineItem.setReferenceType(PostingReferenceTypeEnum.INVOICE);
			journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
			journalLineItem.setExchangeRate(invoice.getExchangeRate());
			journalLineItem.setCreatedBy(userId);
			journalLineItem.setJournal(journal);
			journalLineItemList.add(journalLineItem);
		}
		////////////////////
		if((invoice.getTotalExciseAmount() != null))
		{
			if (invoice.getTotalExciseAmount().compareTo(BigDecimal.ZERO) > 0 ) {
				JournalLineItem journalLineItem = new JournalLineItem();
				TransactionCategory inputExciseCategory = transactionCategoryService
						.findTransactionCategoryByTransactionCategoryCode(
								isCustomerInvoice ? TransactionCategoryCodeEnum.OUTPUT_EXCISE_TAX.getCode()
										: TransactionCategoryCodeEnum.INPUT_EXCISE_TAX.getCode());
				journalLineItem.setTransactionCategory(inputExciseCategory);
				if (isCustomerInvoice)
					journalLineItem.setCreditAmount(invoice.getTotalExciseAmount().multiply(invoice.getExchangeRate()));
				//	journalLineItem.setCreditAmount(invoice.getTotalExciseAmount().divide(invoice.getExchangeRate(), 2, RoundingMode.HALF_UP));
				else
					journalLineItem.setDebitAmount(invoice.getTotalExciseAmount().multiply(invoice.getExchangeRate()));
				journalLineItem.setReferenceType(PostingReferenceTypeEnum.INVOICE);
				journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
				journalLineItem.setExchangeRate(invoice.getExchangeRate());
				journalLineItem.setCreatedBy(userId);
				journalLineItem.setJournal(journal);
				journalLineItemList.add(journalLineItem);
			}
		}
////////////////////////////////////////////////////////////////////
		journal.setJournalLineItems(journalLineItemList);
		journal.setCreatedBy(userId);
		journal.setPostingReferenceType(PostingReferenceTypeEnum.INVOICE);
		if(invoice!=null) {
			journal.setJournalDate(invoice.getInvoiceDate());
			journal.setTransactionDate(invoice.getInvoiceDate());
		}
		else {
			//journal.setJournalDate(LocalDate.now());
			journal.setTransactionDate(invoice.getInvoiceDate());
		}
		journal.setJournlReferencenNo(invoice.getReferenceNumber());
		if (invoice.getType()==1){
			journal.setDescription("Supplier Invoice");
		}
		else {
			journal.setDescription("Customer Invoice");
		}
//		List<JournalLineItem> debitedJournalLineItems = journalLineItemList.stream().filter(journalLineItem -> journalLineItem.getDebitAmount()!=null
//				&& journalLineItem.getDebitAmount().compareTo(BigDecimal.ZERO)>0).collect(Collectors.toList());
//		        String string = new String();
//				for (JournalLineItem journalLineItem:debitedJournalLineItems){
//					string = string.concat(journalLineItem.getTransactionCategory().getTransactionCategoryName()+",");
//				}
//				string = string.concat(" Acc Dr. to ");
//		List<JournalLineItem> creditedJournalLineItems = journalLineItemList.stream().filter(journalLineItem -> journalLineItem.getCreditAmount()!=null
//				&& journalLineItem.getCreditAmount().compareTo(BigDecimal.ZERO)>0).collect(Collectors.toList());
//		for (JournalLineItem journalLineItem:creditedJournalLineItems){
//			string = string.concat(journalLineItem.getTransactionCategory().getTransactionCategoryName()+",");
//		}
//		string = string.concat(" Acc Cr.");
//		journal.setDescription(string);
		return journal;
	}

	private void customerInvoice(boolean isCustomerInvoice, List<InvoiceLineItem> invoiceLineItemList,
								 Map<Integer, List<InvoiceLineItem>> tnxcatIdInvLnItemMap, Map<Integer, TransactionCategory> tnxcatMap,Integer
										 userId) {
		TransactionCategory category;
		for (InvoiceLineItem lineItem : invoiceLineItemList) {
			// sales for customer
			// purchase for vendor
			Product product=productService.findByPK(lineItem.getProduct().getProductID());
			if(product.getIsInventoryEnabled() != null && product.getIsInventoryEnabled() )
			{
				if(lineItem.getInvoice().getType() ==2){
					handleCustomerInvoiceInventory(lineItem,product,userId);
				}
				else {
					handleSupplierInvoiceInventory(lineItem,product,lineItem.getInvoice().getContact(),userId);
				}
			}
			if (isCustomerInvoice)
				category = lineItem.getProduct().getLineItemList().stream()
						.filter(p -> p.getPriceType().equals(ProductPriceType.SALES)).findAny().get()
						.getTransactioncategory();
			else if(lineItem.getProduct().getIsInventoryEnabled()!=null && lineItem.getProduct().getIsInventoryEnabled())
			{
				category = transactionCategoryService
						.findTransactionCategoryByTransactionCategoryCode(
								TransactionCategoryCodeEnum.INVENTORY_ASSET.getCode());
			}
			else {
				category =  lineItem.getProduct().getLineItemList().stream()
						.filter(p -> p.getPriceType().equals(ProductPriceType.PURCHASE)).findAny().get()
						.getTransactioncategory();
				if (!category.equals(lineItem.getTrnsactioncCategory())){
					category = lineItem.getTrnsactioncCategory();
				}
			}
			tnxcatMap.put(category.getTransactionCategoryId(), category);
			if (tnxcatIdInvLnItemMap.containsKey(category.getTransactionCategoryId())) {
				tnxcatIdInvLnItemMap.get(category.getTransactionCategoryId()).add(lineItem);
			} else {
				List<InvoiceLineItem> dummyInvoiceLineItemList = new ArrayList<>();
				dummyInvoiceLineItemList.add(lineItem);
				tnxcatIdInvLnItemMap.put(category.getTransactionCategoryId(), dummyInvoiceLineItemList);
			}
		}
	}

	public List<InvoiceDueAmountModel> getDueInvoiceList(List<Invoice> invoiceList,User user) {

		if (invoiceList != null && !invoiceList.isEmpty()) {
			List<InvoiceDueAmountModel> modelList = new ArrayList<>();
			for (Invoice invoice : invoiceList) {
				if (invoice.getCurrency() == user.getCompany().getCurrencyCode()) {
					InvoiceDueAmountModel model = new InvoiceDueAmountModel();

					model.setId(invoice.getId());
					model.setDueAmount(invoice.getDueAmount() != null ? invoice.getDueAmount() : invoice.getTotalAmount());
					if (invoice.getInvoiceDate() != null) {
						ZoneId timeZone = ZoneId.systemDefault();
						Date date = Date.from(invoice.getInvoiceDate().atStartOfDay(timeZone).toInstant());
						model.setDate(date);
					}
					if (invoice.getInvoiceDueDate() != null) {
						ZoneId timeZone = ZoneId.systemDefault();
						Date date = Date.from(invoice.getInvoiceDueDate().atStartOfDay(timeZone).toInstant());
						model.setDueDate(date);
					}
					model.setReferenceNo(invoice.getReferenceNumber());
					model.setTotalAount(invoice.getTotalAmount());

					modelList.add(model);
				}
			}
			return modelList;
		}

		return new ArrayList<>();

	}

	public List<InviceSingleLevelDropdownModel> getDropDownModelList(List<Invoice> invoiceList) {

		if (invoiceList != null && !invoiceList.isEmpty()) {
			List<InviceSingleLevelDropdownModel> modelList = new ArrayList<>();
			for (Invoice invoice : invoiceList) {
				InviceSingleLevelDropdownModel model = new InviceSingleLevelDropdownModel(invoice.getId(),
					" ("+invoice.getReferenceNumber()+" ,Invoice Amount: "+ invoice.getTotalAmount()+" "+ invoice.getCurrency().getCurrencyName() +",Due Amount: "+invoice.getDueAmount()+" " + invoice.getCurrency().getCurrencyName() + ")",
//					" ("+invoice.getReferenceNumber()+" "+invoice.getDueAmount()+")",
						invoice.getTotalAmount(), PostingReferenceTypeEnum.INVOICE,invoice.getCurrency().getCurrencyCode(),invoice.getInvoiceDate().toString(),invoice.getDueAmount(),invoice.getReferenceNumber());
				modelList.add(model);
			}
			return modelList;
		}

		return new ArrayList<>();

	}
	public List<CustomizeInvoiceTemplateResponseModel> getListOfCustomizeInvoicePrefix
			(List<CustomizeInvoiceTemplate> customizeInvoiceTemplateList) {
		List<CustomizeInvoiceTemplateResponseModel> customizeInvoiceTemplateResponseModdelList = new ArrayList<>();
		if (customizeInvoiceTemplateList!=null) {
			for (CustomizeInvoiceTemplate customizeInvoiceTemplate : customizeInvoiceTemplateList) {
				CustomizeInvoiceTemplateResponseModel customizeInvoiceTemplateResponseModdel = new CustomizeInvoiceTemplateResponseModel();
				customizeInvoiceTemplateResponseModdel.setInvoiceType(customizeInvoiceTemplate.getType());
				customizeInvoiceTemplateResponseModdel.setInvoicePrefix(customizeInvoiceTemplate.getPrefix());
				customizeInvoiceTemplateResponseModdel.setInvoiceId(customizeInvoiceTemplate.getId());
				customizeInvoiceTemplateResponseModdel.setInvoiceSuffix(customizeInvoiceTemplate.getSuffix());
				customizeInvoiceTemplateResponseModdelList.add(customizeInvoiceTemplateResponseModdel);
			}
		}
		return customizeInvoiceTemplateResponseModdelList;
	}
	public Boolean doesInvoiceNumberExist(String referenceNumber){
		Map<String, Object> attribute = new HashMap<String, Object>();
		attribute.put("referenceNumber", referenceNumber);
		attribute.put("deleteFlag",false);
		List<Invoice> invoiceList = invoiceService.findByAttributes(attribute);
		if (invoiceList.isEmpty()){
			return false;
		}
		return true;
	}

	private void getPostZipCode(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		if (invoice.getContact() != null && !invoice.getContact().getPostZipCode().isEmpty()) {
			StringBuilder sb = new StringBuilder();
			Contact c = invoice.getContact();
			if (c.getPostZipCode() != null && !c.getPostZipCode().isEmpty()) {
				sb.append(c.getPostZipCode()).append(" ");
			}
			invoiceDataMap.put(value, sb.toString());
		}
		else{
			invoiceDataMap.put(value, "---");
		}

	}
	private void getPostZipCode(Contact contact, Map<String, String> invoiceDataMap, String value) {
		if (contact != null && !contact.getPostZipCode().isEmpty()) {
			StringBuilder sb = new StringBuilder();
			Contact c = contact;
			if (c.getPostZipCode() != null && !c.getPostZipCode().isEmpty()) {
				sb.append(c.getPostZipCode()).append(" ");
			}
			invoiceDataMap.put(value, sb.toString());
		}
		else{
			invoiceDataMap.put(value, "---");
		}

	}

	private void getVatRegistrationNumber(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		if (invoice.getContact() != null && !invoice.getContact().getVatRegistrationNumber().isEmpty()) {
			StringBuilder sb = new StringBuilder();
			Contact c = invoice.getContact();
			if (c.getVatRegistrationNumber() != null && !c.getVatRegistrationNumber().isEmpty()) {
				sb.append(c.getVatRegistrationNumber()).append(" ");
			}
			invoiceDataMap.put(value, sb.toString());
		}
		else{
			invoiceDataMap.put(value, "---");
		}

	}
	private void getVatRegistrationNumber(Contact contact, Map<String, String> invoiceDataMap, String value) {
		if (contact != null && !contact.getVatRegistrationNumber().isEmpty()) {
			StringBuilder sb = new StringBuilder();
			Contact c = contact;
			if (c.getVatRegistrationNumber() != null && !c.getVatRegistrationNumber().isEmpty()) {
				sb.append(c.getVatRegistrationNumber()).append(" ");
			}
			invoiceDataMap.put(value, sb.toString());
		}
		else{
			invoiceDataMap.put(value, "---");
		}

	}

	private void getStatus(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		if (CommonStatusEnum.getInvoiceTypeByValue(invoice.getStatus()) != null && !CommonStatusEnum.getInvoiceTypeByValue(invoice.getStatus()).isEmpty()) {
			StringBuilder sb = new StringBuilder();
			invoice.getStatus();
			if (CommonStatusEnum.getInvoiceTypeByValue(invoice.getStatus()) != null && !CommonStatusEnum.getInvoiceTypeByValue(invoice.getStatus()).isEmpty()) {
				sb.append(CommonStatusEnum.getInvoiceTypeByValue(invoice.getStatus())).append(" ");
				invoice.getStatus();
//				if (CommonStatusEnum.getInvoiceTypeByValue(invoice.getStatus()) != null && !CommonStatusEnum.getInvoiceTypeByValue(invoice.getStatus()).isEmpty()) {
//					sb.append(CommonStatusEnum.getInvoiceTypeByValue(invoice.getStatus())).append(" ");
//				}
				invoiceDataMap.put(value, sb.toString());
			} else {
				invoiceDataMap.put(value, "---");
			}
		}
	}
		private void getNotes (Invoice invoice, Map < String, String > invoiceDataMap, String value){
			if (invoice.getNotes() != null && !invoice.getNotes().isEmpty()) {
				StringBuilder sb = new StringBuilder();
				invoice.getNotes();
				if (invoice.getNotes() != null && !invoice.getNotes().isEmpty()) {
					sb.append(invoice.getNotes()).append(" ");
				}
				invoiceDataMap.put(value, sb.toString());
			} else {
				invoiceDataMap.put(value, "---");
			}

		}
	private void getCNNotes (CreditNote creditNote, Map < String, String > invoiceDataMap, String value){
		if (creditNote.getNotes() != null && !creditNote.getNotes().isEmpty()) {
			StringBuilder sb = new StringBuilder();
			creditNote.getNotes();
			if (creditNote.getNotes() != null && !creditNote.getNotes().isEmpty()) {
				sb.append(creditNote.getNotes()).append(" ");
			}
			invoiceDataMap.put(value, sb.toString());
		} else {
			invoiceDataMap.put(value, "---");
		}

	}

	private void getName(Invoice invoice, Map<String, String> invoiceDataMap, String value) {
		int row=0;
		if (invoice.getInvoiceLineItems() != null) {
			for(InvoiceLineItem invoiceLineItem : invoice.getInvoiceLineItems()){
				if (invoiceLineItem.getVatCategory()!= null && invoiceLineItem.getVatCategory().equals("STANDARD RATED TAX(5%)")) {
					if (row==0){
						row++;
						invoiceDataMap.put(value, invoiceLineItem.getVatCategory().getName());
					}
					else if(invoiceLineItem.getVatAmount().intValueExact()>0) {
						invoiceDataMap.put("{vatCategory"+row+"}", invoiceLineItem.getVatCategory().getName());
						row++;
					}

				}
				else{
					invoiceDataMap.put(value, "---");
				}
			}}
	}


	// Reverse Journal Entries for Invoices
	@Transactional(rollbackFor = Exception.class)
	public Journal reverseInvoicePosting(PostingRequestModel postingRequestModel, Integer userId) {

		List<JournalLineItem> journalLineItemList = new ArrayList<>();

		Invoice invoice = invoiceService.findByPK(postingRequestModel.getPostingRefId());
//		CurrencyConversion exchangeRate =  currencyExchangeService.getExchangeRate(invoice.getCurrency().getCurrencyCode());

		boolean isCustomerInvoice = InvoiceTypeConstant.isCustomerInvoice(invoice.getType());

		Journal journal = new Journal();
		JournalLineItem journalLineItem1 = new JournalLineItem();
//		TransactionCategory transactionCategory = transactionCategoryService
//				.findTransactionCategoryByTransactionCategoryCode(
//						isCustomerInvoice ? TransactionCategoryCodeEnum.ACCOUNT_RECEIVABLE.getCode()
//								: TransactionCategoryCodeEnum.ACCOUNT_PAYABLE.getCode());
//		if(invoice.getContact() != null)
//		{
//			TransactionCategory transactionCategory = invoice.getContact().getTransactionCategory();
//			journalLineItem1.setTransactionCategory(transactionCategory);
//		}
		Map<String, Object> map = new HashMap<>();
		map.put("contact",invoice.getContact());
		map.put("contactType", invoice.getType());
		map.put("deleteFlag",Boolean.FALSE);
		ContactTransactionCategoryRelation contactTransactionCategoryRelation = contactTransactionCategoryService.findByAttributes(map).get(0);
		journalLineItem1.setTransactionCategory(contactTransactionCategoryRelation.getTransactionCategory());
//		BigDecimal amountWithoutDiscount = invoice.getTotalAmount().subtract(invoice.getDiscount());
		BigDecimal amountWithoutDiscount = invoice.getTotalAmount();
		if (isCustomerInvoice)
			//journalLineItem1.setDebitAmount(invoice.getTotalAmount().subtract(invoice.getTotalVatAmount()));

			journalLineItem1.setCreditAmount(amountWithoutDiscount.multiply(invoice.getExchangeRate()));
//			journalLineItem1.setDebitAmount(invoice.getTotalAmount().divide(invoice.getExchangeRate(), 2, RoundingMode.HALF_UP));
		else
			//journalLineItem1.setCreditAmount(invoice.getTotalAmount().subtract(invoice.getTotalVatAmount()));
			//journalLineItem1.setCreditAmount(invoice.getTotalAmount().multiply(invoice.getExchangeRate()));
			if (invoice.getIsReverseChargeEnabled().equals(Boolean.TRUE)){
				BigDecimal amnt = amountWithoutDiscount.subtract(invoice.getTotalVatAmount());
				journalLineItem1.setDebitAmount(amnt.multiply(invoice.getExchangeRate()));
			}
			else {
				journalLineItem1.setDebitAmount(amountWithoutDiscount.multiply(invoice.getExchangeRate()));
			}
		journalLineItem1.setReferenceType(PostingReferenceTypeEnum.REVERSE_INVOICE);
		journalLineItem1.setReferenceId(postingRequestModel.getPostingRefId());
		journalLineItem1.setExchangeRate(invoice.getExchangeRate());
		journalLineItem1.setCreatedBy(userId);
		journalLineItem1.setJournal(journal);
		journalLineItemList.add(journalLineItem1);

		Map<String, Object> param = new HashMap<>();
		param.put("invoice", invoice);
		param.put("deleteFlag", false);

		List<InvoiceLineItem> invoiceLineItemList = invoiceLineItemService.findByAttributes(param);
		Map<Integer, List<InvoiceLineItem>> tnxcatIdInvLnItemMap = new HashMap<>();
		Map<Integer, TransactionCategory> tnxcatMap = new HashMap<>();
		reverseCustomerInvoice(isCustomerInvoice, invoiceLineItemList, tnxcatIdInvLnItemMap, tnxcatMap,userId);
		Boolean isEligibleForInventoryAssetJournalEntry = false;
		Boolean isEligibleForInventoryJournalEntry = false;
		BigDecimal inventoryAssetValue = BigDecimal.ZERO;
		BigDecimal sumOfInventoryAssetValuePerTransactionCategory = BigDecimal.ZERO;
		for (Integer categoryId : tnxcatIdInvLnItemMap.keySet()) {
			List<InvoiceLineItem> sortedItemList = tnxcatIdInvLnItemMap.get(categoryId);
			BigDecimal inventoryAssetValuePerTransactionCategory = BigDecimal.ZERO;
			BigDecimal totalAmount = BigDecimal.ZERO;
			BigDecimal lineItemDiscount = BigDecimal.ZERO;
			TransactionCategory purchaseCategory = null;
			Map<TransactionCategory,BigDecimal> transactionCategoryTotalAmountMap = new HashMap<>();
			for (InvoiceLineItem sortedLineItem : sortedItemList) {

				BigDecimal amntWithoutVat = sortedLineItem.getUnitPrice()
						.multiply(BigDecimal.valueOf(sortedLineItem.getQuantity()));
				if (sortedLineItem.getDiscountType().equals(DiscountType.FIXED) && sortedLineItem.getDiscount()!=null){
					amntWithoutVat = amntWithoutVat.subtract(sortedLineItem.getDiscount());
					totalAmount = totalAmount.add(amntWithoutVat);
					lineItemDiscount = lineItemDiscount.add(sortedLineItem.getDiscount());
				}
				else if (sortedLineItem.getDiscountType().equals(DiscountType.PERCENTAGE) && sortedLineItem.getDiscount()!=null){

					BigDecimal discountedAmount = amntWithoutVat.multiply(sortedLineItem.getDiscount()).divide(BigDecimal.valueOf(100));
					amntWithoutVat = amntWithoutVat.subtract(discountedAmount);
					totalAmount = totalAmount.add(amntWithoutVat);
					lineItemDiscount = lineItemDiscount.add(discountedAmount);
				}
				else {

					totalAmount = totalAmount.add(amntWithoutVat);
				}
				if	(sortedLineItem.getProduct().getIsInventoryEnabled() !=null&&sortedLineItem.getProduct().getIsInventoryEnabled()  && isCustomerInvoice){
					List<Inventory> inventoryList = inventoryService.getInventoryByProductId(sortedLineItem.getProduct().
							getProductID());
					//		for (Inventory inventory:inventoryList) {
//						inventoryAssetValuePerTransactionCategory = inventoryAssetValuePerTransactionCategory.add(BigDecimal.
//								valueOf(sortedLineItem.getQuantity()).multiply(BigDecimal.valueOf

//								(inventory.getUnitCost())));
					if (sortedLineItem.getProduct().getAvgPurchaseCost()!=null) {
						inventoryAssetValuePerTransactionCategory = inventoryAssetValuePerTransactionCategory.add(BigDecimal.
								valueOf(sortedLineItem.getQuantity()).multiply(BigDecimal.valueOf
										(sortedLineItem.getProduct().getAvgPurchaseCost().floatValue())));
					}
					else {
						for (Inventory inventory : inventoryList) {
							inventoryAssetValuePerTransactionCategory = inventoryAssetValuePerTransactionCategory.add(BigDecimal.
									valueOf(sortedLineItem.getQuantity()).multiply(BigDecimal.valueOf
											(inventory.getUnitCost())));

						}
					}
					//		}
					purchaseCategory = sortedLineItem.getTrnsactioncCategory() != null ? sortedLineItem.getTrnsactioncCategory()
							: sortedLineItem.getProduct().getLineItemList().stream()
							.filter(p -> p.getPriceType().equals(ProductPriceType.PURCHASE)).findAny().get()
							.getTransactioncategory();
					isEligibleForInventoryJournalEntry = true;
				}
			}if(isCustomerInvoice && isEligibleForInventoryJournalEntry) {
				sumOfInventoryAssetValuePerTransactionCategory = sumOfInventoryAssetValuePerTransactionCategory.add
						(inventoryAssetValuePerTransactionCategory);
//				JournalLineItem journalLineItem = new JournalLineItem();
//				journalLineItem.setTransactionCategory(transactionCategoryService
//						.findTransactionCategoryByTransactionCategoryCode(
//								TransactionCategoryCodeEnum.INVENTORY_ASSET.getCode()));
//				journalLineItem.setCreditAmount(inventoryAssetValuePerTransactionCategory.multiply(invoice.getExchangeRate()));
//				journalLineItem.setReferenceType(PostingReferenceTypeEnum.INVOICE);
//				journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
//				journalLineItem.setCreatedBy(userId);
//				journalLineItem.setJournal(journal);
//				journalLineItemList.add(journalLineItem);
//				inventoryAssetValue = inventoryAssetValue.add(inventoryAssetValuePerTransactionCategory.multiply(invoice.
//						getExchangeRate()));
//				isEligibleForInventoryAssetJournalEntry = true;
			}
			//This list contains ILI which consist of excise Tax included in product price group by Transaction Category Id
			List<InvoiceLineItem> inclusiveExciseLineItems = sortedItemList.stream().
					filter(invoiceLineItem -> invoiceLineItem.
							getProduct().getExciseStatus()!=null && invoiceLineItem.
							getProduct().getExciseStatus().equals(Boolean.TRUE)).filter(invoiceLineItem ->
							invoiceLineItem.getInvoice().getTaxType()!=null && invoiceLineItem.getInvoice().getTaxType().equals(Boolean.TRUE)).filter
							(invoiceLineItem -> invoiceLineItem.getTrnsactioncCategory()
									.getTransactionCategoryId().equals(categoryId)).collect(Collectors.toList());
			if (!inclusiveExciseLineItems.isEmpty()){
				for (InvoiceLineItem invoiceLineItem:inclusiveExciseLineItems){
					totalAmount = totalAmount.subtract(invoiceLineItem.getExciseAmount());
				}
			}
			//To handle inclusive vat journal entry
			if (invoice.getTaxType().equals(Boolean.TRUE)){
				List<InvoiceLineItem> inclusiveVatLineItems = sortedItemList.stream().filter(invoiceLineItem ->
								invoiceLineItem.getInvoice().getTaxType()!=null && invoiceLineItem.getInvoice().getTaxType().equals(Boolean.TRUE)).
						filter(invoiceLineItem -> invoiceLineItem.getTrnsactioncCategory()
								.getTransactionCategoryId().equals(categoryId)).collect(Collectors.toList());
				if (!inclusiveVatLineItems.isEmpty()){
					for (InvoiceLineItem invoiceLineItem:inclusiveVatLineItems){
						totalAmount = totalAmount.subtract(invoiceLineItem.getVatAmount());
					}
				}
			}
			JournalLineItem journalLineItem = new JournalLineItem();
			journalLineItem.setTransactionCategory(tnxcatMap.get(categoryId));
			totalAmount = totalAmount.add(lineItemDiscount);
			if (isCustomerInvoice)
				//journalLineItem.setCreditAmount(totalAmount.multiply(invoice.getExchangeRate()));
				journalLineItem.setDebitAmount(totalAmount.multiply(invoice.getExchangeRate()));
			else
				//	journalLineItem.setDebitAmount(totalAmount.multiply(invoice.getExchangeRate()));
				journalLineItem.setCreditAmount(totalAmount.multiply(invoice.getExchangeRate()));
			journalLineItem.setReferenceType(PostingReferenceTypeEnum.REVERSE_INVOICE);
			journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
			journalLineItem.setExchangeRate(invoice.getExchangeRate());
			journalLineItem.setCreatedBy(userId);
			journalLineItem.setJournal(journal);
			journalLineItemList.add(journalLineItem);

//			if(isCustomerInvoice && isEligibleForInventoryAssetJournalEntry) {
//				 journalLineItem = new JournalLineItem();
//				journalLineItem.setTransactionCategory(transactionCategoryService
//						.findTransactionCategoryByTransactionCategoryCode(
//								TransactionCategoryCodeEnum.COST_OF_GOODS_SOLD.getCode()));
//				journalLineItem.setDebitAmount(inventoryAssetValue);
//				journalLineItem.setReferenceType(PostingReferenceTypeEnum.INVOICE);
//				journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
//				journalLineItem.setCreatedBy(userId);
//				journalLineItem.setJournal(journal);
//				journalLineItemList.add(journalLineItem);
//			}
		}
		//For multiple products Inventory Asset entry for journal  Should be single.
		if(isCustomerInvoice && isEligibleForInventoryJournalEntry) {
			JournalLineItem journalLineItem = new JournalLineItem();
			journalLineItem.setTransactionCategory(transactionCategoryService
					.findTransactionCategoryByTransactionCategoryCode(
							TransactionCategoryCodeEnum.INVENTORY_ASSET.getCode()));
			journalLineItem.setDebitAmount(sumOfInventoryAssetValuePerTransactionCategory);
			journalLineItem.setReferenceType(PostingReferenceTypeEnum.REVERSE_INVOICE);
			journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
			journalLineItem.setExchangeRate(invoice.getExchangeRate());
			journalLineItem.setCreatedBy(userId);
			journalLineItem.setJournal(journal);
			journalLineItemList.add(journalLineItem);
			inventoryAssetValue = inventoryAssetValue.add(sumOfInventoryAssetValuePerTransactionCategory);
			isEligibleForInventoryAssetJournalEntry = true;
		}
		//For multiple products CostOfGoodsSold entry for journal  Should be single.
		if(isCustomerInvoice && isEligibleForInventoryAssetJournalEntry) {
			JournalLineItem	journalLineItem = new JournalLineItem();
			journalLineItem.setTransactionCategory(transactionCategoryService
					.findTransactionCategoryByTransactionCategoryCode(
							TransactionCategoryCodeEnum.COST_OF_GOODS_SOLD.getCode()));
			journalLineItem.setCreditAmount(inventoryAssetValue);
			journalLineItem.setReferenceType(PostingReferenceTypeEnum.REVERSE_INVOICE);
			journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
			journalLineItem.setExchangeRate(invoice.getExchangeRate());
			journalLineItem.setCreatedBy(userId);
			journalLineItem.setJournal(journal);
			journalLineItemList.add(journalLineItem);
		}
		if((invoice.getTotalVatAmount() != null))
		{
			if (invoice.getTotalVatAmount().compareTo(BigDecimal.ZERO) > 0 ) {
				JournalLineItem journalLineItem = new JournalLineItem();
				TransactionCategory inputVatCategory = transactionCategoryService
						.findTransactionCategoryByTransactionCategoryCode(
								isCustomerInvoice ? TransactionCategoryCodeEnum.OUTPUT_VAT.getCode()
										: TransactionCategoryCodeEnum.INPUT_VAT.getCode());
				journalLineItem.setTransactionCategory(inputVatCategory);
				if (isCustomerInvoice)
					journalLineItem.setDebitAmount(invoice.getTotalVatAmount().multiply(invoice.getExchangeRate()));
					//journalLineItem.setCreditAmount(invoice.getTotalVatAmount().divide(invoice.getExchangeRate(), 2, RoundingMode.HALF_UP));
				else
					journalLineItem.setCreditAmount(invoice.getTotalVatAmount().multiply(invoice.getExchangeRate()));
				journalLineItem.setReferenceType(PostingReferenceTypeEnum.REVERSE_INVOICE);
				journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
				journalLineItem.setExchangeRate(invoice.getExchangeRate());
				journalLineItem.setCreatedBy(userId);
				journalLineItem.setJournal(journal);
				journalLineItemList.add(journalLineItem);

				if(invoice.getIsReverseChargeEnabled().equals(Boolean.TRUE)){
					JournalLineItem reverseChargeJournalLineItem = new JournalLineItem();
					TransactionCategory transactionCategory = transactionCategoryService
							.findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.OUTPUT_VAT.getCode());
					reverseChargeJournalLineItem.setTransactionCategory(transactionCategory);
					reverseChargeJournalLineItem.setDebitAmount(invoice.getTotalVatAmount().multiply(invoice.getExchangeRate()));
					reverseChargeJournalLineItem.setReferenceType(PostingReferenceTypeEnum.REVERSE_INVOICE);
					reverseChargeJournalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
					reverseChargeJournalLineItem.setExchangeRate(invoice.getExchangeRate());
					reverseChargeJournalLineItem.setCreatedBy(userId);
					reverseChargeJournalLineItem.setJournal(journal);
					journalLineItemList.add(reverseChargeJournalLineItem);
				}
			}
		}
		if(invoice.getDiscount().compareTo(BigDecimal.ZERO) == 1 && invoice.getDiscount()!=null) {
			JournalLineItem journalLineItem = new JournalLineItem();
			if (invoice.getType()==2) {
				journalLineItem.setCreditAmount(invoice.getDiscount().multiply(invoice.getExchangeRate()));
				journalLineItem.setTransactionCategory(transactionCategoryService
						.findTransactionCategoryByTransactionCategoryCode(
								TransactionCategoryCodeEnum.SALES_DISCOUNT.getCode()));
			}
			else {
				journalLineItem.setDebitAmount(invoice.getDiscount().multiply(invoice.getExchangeRate()));
				journalLineItem.setTransactionCategory(transactionCategoryService
						.findTransactionCategoryByTransactionCategoryCode(
								TransactionCategoryCodeEnum.PURCHASE_DISCOUNT.getCode()));
			}
			journalLineItem.setReferenceType(PostingReferenceTypeEnum.REVERSE_INVOICE);
			journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
			journalLineItem.setExchangeRate(invoice.getExchangeRate());
			journalLineItem.setCreatedBy(userId);
			journalLineItem.setJournal(journal);
			journalLineItemList.add(journalLineItem);
		}
		////////////////////
		if((invoice.getTotalExciseAmount() != null))
		{
			if (invoice.getTotalExciseAmount().compareTo(BigDecimal.ZERO) > 0 ) {
				JournalLineItem journalLineItem = new JournalLineItem();
				TransactionCategory inputExciseCategory = transactionCategoryService
						.findTransactionCategoryByTransactionCategoryCode(
								isCustomerInvoice ? TransactionCategoryCodeEnum.OUTPUT_EXCISE_TAX.getCode()
										: TransactionCategoryCodeEnum.INPUT_EXCISE_TAX.getCode());
				journalLineItem.setTransactionCategory(inputExciseCategory);
				if (isCustomerInvoice)
					journalLineItem.setDebitAmount(invoice.getTotalExciseAmount().multiply(invoice.getExchangeRate()));
					//	journalLineItem.setCreditAmount(invoice.getTotalExciseAmount().divide(invoice.getExchangeRate(), 2, RoundingMode.HALF_UP));
				else
					journalLineItem.setCreditAmount(invoice.getTotalExciseAmount().multiply(invoice.getExchangeRate()));
				journalLineItem.setReferenceType(PostingReferenceTypeEnum.REVERSE_INVOICE);
				journalLineItem.setReferenceId(postingRequestModel.getPostingRefId());
				journalLineItem.setExchangeRate(invoice.getExchangeRate());
				journalLineItem.setCreatedBy(userId);
				journalLineItem.setJournal(journal);
				journalLineItemList.add(journalLineItem);
			}
		}
////////////////////////////////////////////////////////////////////
		journal.setJournalLineItems(journalLineItemList);
		journal.setCreatedBy(userId);
		journal.setPostingReferenceType(PostingReferenceTypeEnum.REVERSE_INVOICE);
		journal.setJournlReferencenNo(invoice.getReferenceNumber());
		if (invoice.getType()==1){
			journal.setDescription("Reversal of journal entry against Supplier Invoice No:-"+invoice.getReferenceNumber());
		}
		else {
			journal.setDescription("Reversal of journal entry against Customer Invoice No:-"+invoice.getReferenceNumber());
		}
		if(invoice!=null) {
			journal.setJournalDate(invoice.getInvoiceDate());
			journal.setTransactionDate(invoice.getInvoiceDate());
		}
		else {
			//journal.setJournalDate(LocalDate.now());
			journal.setTransactionDate(invoice.getInvoiceDate());
		}
		return journal;
	}
	private void reverseCustomerInvoice(boolean isCustomerInvoice, List<InvoiceLineItem> invoiceLineItemList,
								 Map<Integer, List<InvoiceLineItem>> tnxcatIdInvLnItemMap, Map<Integer, TransactionCategory> tnxcatMap,Integer
										 userId) {
		TransactionCategory category;
		for (InvoiceLineItem lineItem : invoiceLineItemList) {
			// sales for customer
			// purchase for vendor
			Product product=productService.findByPK(lineItem.getProduct().getProductID());
			if(product.getIsInventoryEnabled() != null && product.getIsInventoryEnabled() )
			{
				if(lineItem.getInvoice().getType() ==2){
					//handleCustomerInvoiceInventory(lineItem,product,userId);
				}
				else {
					//handleSupplierInvoiceInventory(lineItem,product,lineItem.getInvoice().getContact(),userId);
				}
			}
			if (isCustomerInvoice)
				category = lineItem.getProduct().getLineItemList().stream()
						.filter(p -> p.getPriceType().equals(ProductPriceType.SALES)).findAny().get()
						.getTransactioncategory();
			else if(lineItem.getProduct().getIsInventoryEnabled()!=null && lineItem.getProduct().getIsInventoryEnabled())
			{
				category = transactionCategoryService
						.findTransactionCategoryByTransactionCategoryCode(
								TransactionCategoryCodeEnum.INVENTORY_ASSET.getCode());
			}
			else {
				category =  lineItem.getProduct().getLineItemList().stream()
						.filter(p -> p.getPriceType().equals(ProductPriceType.PURCHASE)).findAny().get()
						.getTransactioncategory();
				if (!category.equals(lineItem.getTrnsactioncCategory())) {
					category = lineItem.getTrnsactioncCategory();
				}
				}
			tnxcatMap.put(category.getTransactionCategoryId(), category);
			if (tnxcatIdInvLnItemMap.containsKey(category.getTransactionCategoryId())) {
				tnxcatIdInvLnItemMap.get(category.getTransactionCategoryId()).add(lineItem);
			} else {
				List<InvoiceLineItem> dummyInvoiceLineItemList = new ArrayList<>();
				dummyInvoiceLineItemList.add(lineItem);
				tnxcatIdInvLnItemMap.put(category.getTransactionCategoryId(), dummyInvoiceLineItemList);
			}
		}
	}
}
