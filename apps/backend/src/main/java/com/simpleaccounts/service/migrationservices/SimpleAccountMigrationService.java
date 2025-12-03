package com.simpleaccounts.service.migrationservices;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.DRAFT;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.INVOICE_STATUS;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.simpleaccounts.constant.ChartOfAccountCategoryCodeEnum;
import com.simpleaccounts.constant.DefaultTypeConstant;
import com.simpleaccounts.constant.DiscountType;
import com.simpleaccounts.constant.InvoiceDuePeriodEnum;
import com.simpleaccounts.constant.CommonStatusEnum;
import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import com.simpleaccounts.constant.ProductPriceType;
import com.simpleaccounts.constant.ProductType;
import com.simpleaccounts.constant.TransactionCategoryCodeEnum;
import com.simpleaccounts.entity.Company;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.Country;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.CurrencyConversion;
import com.simpleaccounts.entity.Invoice;
import com.simpleaccounts.entity.InvoiceLineItem;
import com.simpleaccounts.entity.Journal;
import com.simpleaccounts.entity.JournalLineItem;
import com.simpleaccounts.entity.PlaceOfSupply;
import com.simpleaccounts.entity.ProductLineItem;
import com.simpleaccounts.entity.State;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.entity.VatCategory;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.migration.ProductMigrationParser;
import com.simpleaccounts.migration.xml.bindings.product.Product;
import com.simpleaccounts.migration.xml.bindings.product.Product.TableList.Table;
import com.simpleaccounts.rest.PostingRequestModel;
import com.simpleaccounts.rest.invoicecontroller.InvoiceRestHelper;
import com.simpleaccounts.rest.migrationcontroller.DataMigrationRespModel;
import com.simpleaccounts.rest.transactioncategorycontroller.TransactionCategoryBean;
import com.simpleaccounts.service.CoacTransactionCategoryService;
import com.simpleaccounts.service.CompanyService;
import com.simpleaccounts.service.ContactService;
import com.simpleaccounts.service.CountryService;
import com.simpleaccounts.service.CurrencyExchangeService;
import com.simpleaccounts.service.InvoiceLineItemService;
import com.simpleaccounts.service.InvoiceService;
import com.simpleaccounts.service.JournalService;
import com.simpleaccounts.service.ProductLineItemService;
import com.simpleaccounts.service.ProductService;
import com.simpleaccounts.service.SimpleAccountsService;
import com.simpleaccounts.service.StateService;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.service.VatCategoryService;
import com.simpleaccounts.service.bankaccount.ChartOfAccountService;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class SimpleAccountMigrationService {
	
	private final Logger LOG = LoggerFactory.getLogger(SimpleAccountMigrationService.class);
	
	@Autowired
    private String basePath;
    
    @Autowired
    private MigrationUtil migrationUtil; 
    
    @Autowired
    private CompanyService companyService;
    
    @Autowired
    private InvoiceService invoiceService;
    
    @Autowired
    private InvoiceRestHelper invoiceRestHelper;
    
    @Autowired
    private JournalService journalService;
    
    @Autowired
    private CountryService countryService;

    @Autowired
    private StateService stateService;
    
    @Autowired
    private InvoiceLineItemService invoiceLineItemService;

    @Autowired
    private ContactService contactService;

    @Autowired
    private ProductService productService;
    
    @Autowired
    private ProductLineItemService productLineItemService;
    
    @Autowired
    private TransactionCategoryService transactionCategoryService;
    
    @Autowired
    private CurrencyExchangeService currencyExchangeService;
    
    @Autowired
	private  UserService userService;
    
	@Autowired
	private ChartOfAccountService transactionTypeService;
	
	@Autowired
	private VatCategoryService vatCategoryService;
	
	@Autowired
	private CoacTransactionCategoryService coacTransactionCategoryService;

    List<DataMigrationRespModel> processTheMigratedData(String productName, String version, String fileLocation,
			Integer userId, String migFromDate) throws IOException {
    	
    	LOG.info("SimpleAccountMigrationService :: processTheMigratedData start");
    	
		List<DataMigrationRespModel> list = new ArrayList<>();
		ProductMigrationParser parser = ProductMigrationParser.getInstance();
		Product product = parser.getAppVersionsToProductMap().get(productName + "_v" + version);
		List<String> files = getFilesPresent(fileLocation);
		
		if(files != null)
		{
			for (Object file : files) {
				List<Map<String, String>> mapList = migrationUtil
						.parseCSVFile((String) fileLocation + File.separator + file);
				List<Map<String, String>> itemsToRemove = new ArrayList<Map<String, String>>();
				
				if(mapList != null)
				{
					for (Map<String, String> mapRecord : mapList) {
						
						// for Invoice
						if (mapRecord.containsKey(SimpleAccountMigrationConstants.INVOICE_DATE)) {
							Integer result = migrationUtil.compareDate(mapRecord.get(SimpleAccountMigrationConstants.INVOICE_DATE), migFromDate);
							if (result != null) {
								itemsToRemove = migrationUtil.filterMapRecord(mapList, mapRecord, result, itemsToRemove);
							}
						}
						
						/*
				// for Bill
				if (mapRecord.containsKey(BILL_DATE)) {
					Integer result = migrationUtil.compareDate(mapRecord.get(BILL_DATE), migFromDate);
					if (result != null) {
						itemsToRemove = migrationUtil.filterMapRecord(mapList, mapRecord, result, itemsToRemove);
					}
				}

				// for Exchange Rate
				if (mapRecord.containsKey(DATE)) {
					Integer result = migrationUtil.compareDate(mapRecord.get(DATE), migFromDate);
					if (result != null) {
						itemsToRemove = migrationUtil.filterMapRecord(mapList, mapRecord, result, itemsToRemove);
					}
				}

				// for Expense Date
				if (mapRecord.containsKey(EXPENSE_DATE)) {
					Integer result = migrationUtil.compareDate(mapRecord.get(EXPENSE_DATE), migFromDate);
					if (result != null) {
						itemsToRemove = migrationUtil.filterMapRecord(mapList, mapRecord, result, itemsToRemove);
					}
				}

				// for Purchase Order Date
				if (mapRecord.containsKey(PURCHASE_ORDER_DATE)) {
					Integer result = migrationUtil.compareDate(mapRecord.get(PURCHASE_ORDER_DATE), migFromDate);
					if (result != null) {
						itemsToRemove = migrationUtil.filterMapRecord(mapList, mapRecord, result, itemsToRemove);
					}
				}
				
						 */
						
					}
				}
				mapList.removeAll(itemsToRemove);
				
				List<Product.TableList.Table> tableList = product.getTableList().getTable();
				List<Product.TableList.Table> tables = migrationUtil.getTableName(tableList, (String) file);
				DataMigrationRespModel dataMigrationRespModel = new DataMigrationRespModel();
				Company company = companyService.getCompany();
				dataMigrationRespModel.setMigrationBeginningDate(company.getAccountStartDate().toString());
				dataMigrationRespModel.setExecutionDate(LocalDateTime.now().toString());
				dataMigrationRespModel.setFileName((String) file);
				dataMigrationRespModel.setRecordCount(
						(Files.lines(Paths.get(fileLocation.toString() + "/" + file.toString())).count()) - 1);
				dataMigrationRespModel.setRecordsMigrated((long) mapList.size());
				dataMigrationRespModel.setRecordsRemoved((long) itemsToRemove.size());
				list.add(dataMigrationRespModel);
				if (isSpecialHandlingNeeded(productName, file.toString())) {
					handleProductSpecificTables(tables, mapList, userId);
					continue;
				}
				
				if(tables != null) 
				{
					LOG.info("processTheMigratedData tables ==>{} ", tables);
					for (Product.TableList.Table table : tables) {
						// get service Object
						SimpleAccountsService service = (SimpleAccountsService) migrationUtil.getService(table.getServiceName());
						List<Product.TableList.Table.ColumnList.Column> columnList = table.getColumnList().getColumn();
						// csv records
						for (Map<String, String> record : mapList) {
							Object entity = migrationUtil.getObject(table.getEntityName());
							// iterate over all the columns and crate record and persist object to database
							for (Product.TableList.Table.ColumnList.Column column : columnList) {
								String val = record.get(column.getInputColumn());
								LOG.info("processTheMigratedData tables ==>{} ", val);
								if (StringUtils.isEmpty(val))
									continue;
								String setterMethod = column.getSetterMethod();
								if (setterMethod.equalsIgnoreCase("setCurrency")) {
									Currency currency = migrationUtil.getCurrencyIdByValue(val);
									migrationUtil.setRecordIntoEntity(entity, setterMethod, currency, "Object");
								} else if (setterMethod.equalsIgnoreCase("setCountry")) {
									Integer value = migrationUtil.getCountryIdByValue(val);
									Country country = countryService.findByPK(value);
									migrationUtil.setRecordIntoEntity(entity, setterMethod, country, "Object");
								} else if (setterMethod.equalsIgnoreCase("setState")) {
									Integer value = migrationUtil.getStateIdByInputColumnValue(val);
									State state = stateService.findByPK(value);
									migrationUtil.setRecordIntoEntity(entity, setterMethod, state, "Object");
								} else if (setterMethod.equalsIgnoreCase("setContactType")) {
									Integer value = migrationUtil.getContactType(val);
									migrationUtil.setRecordIntoEntity(entity, setterMethod, value, "Object");
								} else if (setterMethod.equalsIgnoreCase("setPlaceOfSupplyId")) {
									if (StringUtils.isEmpty(val))
										continue;
									PlaceOfSupply placeOfSupply = migrationUtil.getPlaceOfSupplyByValue(val);
									migrationUtil.setRecordIntoEntity(entity, setterMethod, placeOfSupply, "Object");
								} else {
									// set into entity
									migrationUtil.setRecordIntoEntity(entity, setterMethod, val, column.getDataType());
								}
							}
							migrationUtil.setDefaultSetterValues(entity, userId);
							Optional<Product.TableList.Table> contactTable = tables.stream()
									.filter(t -> t.getName().equalsIgnoreCase(SimpleAccountMigrationConstants.CONTACTS)).findFirst();
							if (contactTable.isPresent()) {
								// Check existing entry in db
								boolean isContactExist = migrationUtil.contactExist((Contact) entity);
								if (isContactExist) {
									LOG.info("Contact Allready Present");
								} else {
									// Add New Contact for Contact
									service.persist(entity);
									migrationUtil.createDependentEntities(entity, userId);
								}
								
							} else {
								service.persist(entity);
								migrationUtil.createDependentEntities(entity, userId);
							}
							
						}
					}
				}
			}
		}
		return list;
	}
	
	
	  /**
     * This method returns list of files present under specified directory
    *
    * @param dir
    * @return
    */
   public List<String> getFilesPresent(String dir) {
       List<String> resultSet = new ArrayList<String>();
       List<String> inputFiles = new ArrayList<String>();

       // get the predefined file order
       List<String> fileOrder = getFileOrderList();

       File[] f = new File(dir).listFiles();
       if(f.length >0)
       {
    	   for (File files : f) {
    		   String fileName = files.getName();
    		   inputFiles.add(fileName);
    	   }
       }

       if(fileOrder != null) {
    	   for (String fo : fileOrder) {
    		   // check inputfile in file order list.
    		   if (inputFiles.contains(fo)) {
    			   resultSet.add(fo);
    		   }
    	   }
       }
       LOG.info("Input File in Order ==> {} ", resultSet);
       Set obj = Stream.of(new File(dir).listFiles())
               .filter(file -> !file.isDirectory())
               .map(File::getName)
               .collect(Collectors.toSet());

       return resultSet;
   }

   /**
    * This method gives the File Order 
    * @return
    */
   private List<String> getFileOrderList() {
       //List<String> fileOrder = Arrays.asList("Contacts.csv", "Vendors.csv", "Product.csv", "Exchange_Rate.csv", "Invoice.csv", "Bill.csv", "Expense.csv", "Credit_Note.csv", "Purchase_Order.csv", "Chart_of_Accounts.csv");
		List<String> fileOrder = Arrays.asList(SimpleAccountMigrationConstants.CONTACTS_CSV,
				SimpleAccountMigrationConstants.VENDORS_CSV, SimpleAccountMigrationConstants.VENDORS_CSV,
				SimpleAccountMigrationConstants.CURRENCY_EXCHANGE_RATE_CSV, SimpleAccountMigrationConstants.INVOICE_CSV,
				SimpleAccountMigrationConstants.EXPENSE_CSV, SimpleAccountMigrationConstants.CREDIT_NOTE_CSV,
				SimpleAccountMigrationConstants.CHART_OF_ACCOUNTS_CSV,
				SimpleAccountMigrationConstants.OPENING_BALANCES_CSV);
		return fileOrder;
   }
   
   
   /**
	 * To check that isSpecialHandling Needed
	 */
	protected boolean isSpecialHandlingNeeded(String productName, String file) {
       if (StringUtils.equalsIgnoreCase(SimpleAccountMigrationConstants.SIMPLE__ACCOUNTS, productName) && (StringUtils.equalsIgnoreCase(file, SimpleAccountMigrationConstants.PRODUCT_CSV)) ||
               (StringUtils.equalsIgnoreCase(file, SimpleAccountMigrationConstants.INVOICE_CSV)) || (StringUtils.equalsIgnoreCase(file, SimpleAccountMigrationConstants.OPENING_BALANCES_CSV)) ||
               (StringUtils.equalsIgnoreCase(file, SimpleAccountMigrationConstants.CHART_OF_ACCOUNTS_CSV)) || (StringUtils.equalsIgnoreCase(file, SimpleAccountMigrationConstants.CURRENCY_EXCHANGE_RATE_CSV)) ||
               (StringUtils.equalsIgnoreCase(file, SimpleAccountMigrationConstants.CREDIT_NOTE_CSV)) ) {
           return true;
       } else
           return false;
   }
	
	/**
     * This method will Handle the Product specific Tables
     */
	protected void handleProductSpecificTables(List<Product.TableList.Table> tables, List<Map<String, String>> mapList,
			Integer userId) {
		Optional<Product.TableList.Table> table = tables.stream().filter(t -> t.getName().equalsIgnoreCase(SimpleAccountMigrationConstants.PRODUCT))
				.findFirst();
		if (table.isPresent()) {
			createProduct(tables, mapList, userId);
		}
		table = tables.stream().filter(t -> t.getName().equalsIgnoreCase(SimpleAccountMigrationConstants.INVOICE)).findFirst();
		if (table.isPresent()) {
			createCustomerInvoice(tables, mapList, userId);
		}
		
		table = tables.stream().filter(t -> t.getName().equalsIgnoreCase(SimpleAccountMigrationConstants.OPENING_BALANCES)).findFirst();
		if (table.isPresent()) {
			createOpeningBalance(tables, mapList, userId);
		}
		
		table = tables.stream().filter(t -> t.getName().equalsIgnoreCase(SimpleAccountMigrationConstants.CHART_OF_ACCOUNTS)).findFirst();
		if (table.isPresent()) {
			createChartOfAccounts(tables, mapList, userId);
		}
		
		table = tables.stream().filter(t -> t.getName().equalsIgnoreCase(SimpleAccountMigrationConstants.CURRENCY_EXCHANGE_RATE)).findFirst();
		if (table.isPresent()) {
			createCurrencyExchangeRate(tables, mapList, userId);
		}
		
		table = tables.stream().filter(t -> t.getName().equalsIgnoreCase(SimpleAccountMigrationConstants.CREDIT_NOTE)).findFirst();
		if (table.isPresent()) {
			createCreditNote(tables, mapList, userId);
		}
		
		else {
			log.debug("Table ITEM Mismatch");
		}
	}


	/**
     * This method will handle Product / Item
     * @param tables
     * @param mapList
     * @param userId
     */
	private void createProduct(List<Product.TableList.Table> tables, List<Map<String, String>> mapList,
			Integer userId) {
		
		LOG.info("createProduct start");
		Product.TableList.Table productTable = tables.get(0);
		Product.TableList.Table productLineItemTable = tables.get(1);
		//Product.TableList.Table inventoryTable = tables.get(2);

		SimpleAccountsService productService = (SimpleAccountsService) migrationUtil.getService(productTable.getServiceName());
		SimpleAccountsService productLineItemService = (SimpleAccountsService) migrationUtil.getService(productLineItemTable.getServiceName());
		//SimpleAccountsService inventoryService = (SimpleAccountsService) migrationUtil.getService(inventoryTable.getServiceName());

		List<Product.TableList.Table.ColumnList.Column> productTableColumnList = productTable.getColumnList().getColumn();
		List<Product.TableList.Table.ColumnList.Column> productLineItemTableColumnList = productLineItemTable.getColumnList().getColumn();
		//List<Product.TableList.Table.ColumnList.Column> inventoryTableColumnList = inventoryTable.getColumnList().getColumn();
		
		// csv records
		if(mapList != null) {
			for (Map<String, String> record : mapList) {
				Object productEntity = migrationUtil.getObject(productTable.getEntityName());
				setColumnValue(productTableColumnList, record, productEntity);
				Boolean isInventoryEnabled = migrationUtil.checkInventoryEnabled(record);
				((com.simpleaccounts.entity.Product) productEntity).setIsInventoryEnabled(isInventoryEnabled);
				((com.simpleaccounts.entity.Product) productEntity).setIsMigratedRecord(true);
				((com.simpleaccounts.entity.Product) productEntity).setIsActive(true);
				migrationUtil.setDefaultSetterValues(productEntity, userId);
				productService.persist(productEntity);
				
				List<ProductLineItem> lineItem = new ArrayList<>();
				ProductLineItem productLineItemEntitySales = null;
				ProductLineItem productLineItemEntityPurchase = null;
				
				///String itemType = record.get("Item Type");
				/*if (itemType.equalsIgnoreCase("Inventory") || itemType.equalsIgnoreCase("Sales")|| itemType.equalsIgnoreCase("Sales and Purchases")) {
				productLineItemEntitySales = getExistingProductLineItemForSales(record,
				productLineItemTable.getEntityName(), productLineItemTableColumnList, userId, productEntity,lineItem);
				((ProductLineItem) productLineItemEntitySales).setProduct((com.simpleaccounts.entity.Product) productEntity);
				((ProductLineItem) productLineItemEntitySales).setIsMigratedRecord(true);
				productLineItemService.persist(productLineItemEntitySales);
				lineItem.add(productLineItemEntitySales);

			}
			if (itemType.equalsIgnoreCase("Inventory") || itemType.equalsIgnoreCase("Purchases")|| itemType.equalsIgnoreCase("Sales and Purchases")) {
				productLineItemEntityPurchase = getExistingProductLineItemForPurchase(record,productLineItemTable.getEntityName(), productLineItemTableColumnList, userId, productEntity,lineItem);
				((ProductLineItem) productLineItemEntityPurchase).setProduct((com.simpleaccounts.entity.Product) productEntity);
				((ProductLineItem) productLineItemEntityPurchase).setIsMigratedRecord(true);
				productLineItemService.persist(productLineItemEntityPurchase);
				lineItem.add(productLineItemEntityPurchase);
			}
			
				 */
				productLineItemEntityPurchase = getExistingProductLineItemForPurchase(record,productLineItemTable.getEntityName(), productLineItemTableColumnList, userId, productEntity,lineItem);
				((ProductLineItem) productLineItemEntityPurchase).setProduct((com.simpleaccounts.entity.Product) productEntity);
				((ProductLineItem) productLineItemEntityPurchase).setIsMigratedRecord(true);
				productLineItemService.persist(productLineItemEntityPurchase);
				lineItem.add(productLineItemEntityPurchase);
				productService.persist(productEntity);
				((com.simpleaccounts.entity.Product) productEntity).setLineItemList(lineItem);
				
				/*
			if (isInventoryEnabled) {
				
				Object inventoryEntity = migrationUtil.getObject(inventoryTable.getEntityName());
				setColumnValue(inventoryTableColumnList, record, inventoryEntity);
				((Inventory) inventoryEntity).setProductId((com.simpleaccounts.entity.Product) productEntity);
				Float unitCost = ((ProductLineItem) productLineItemEntityPurchase).getUnitPrice().floatValue();
				Float unitSellingPrice = ((ProductLineItem) productLineItemEntitySales).getUnitPrice().floatValue();
				((Inventory) inventoryEntity).setUnitCost(unitCost);
				((Inventory) inventoryEntity).setUnitSellingPrice(unitSellingPrice);
				migrationUtil.setDefaultSetterValues(inventoryEntity, userId);
				((Inventory) inventoryEntity).setIsMigratedRecord(true);
				if (((Inventory) inventoryEntity).getReorderLevel() == null) {
					((Inventory) inventoryEntity).setReorderLevel(0);
				}
				if (((Inventory) inventoryEntity).getQuantitySold() == null) {
					((Inventory) inventoryEntity).setQuantitySold(0);
				}
				if (((Inventory) inventoryEntity).getPurchaseQuantity() == null) {
					((Inventory) inventoryEntity).setPurchaseQuantity(0);
				}
				inventoryService.persist(inventoryEntity);

			}*/
			}
		}
	}


	private void createCustomerInvoice(List<Table> tables, List<Map<String, String>> mapList, Integer userId) {

		LOG.info("createCustomerInvoice start");
        Product.TableList.Table invoiceTable = tables.get(0);
        Product.TableList.Table invoiceLineItemTable = tables.get(1);

        SimpleAccountsService invoiceLineItemService = (SimpleAccountsService) migrationUtil.getService(invoiceLineItemTable.getServiceName());

        List<Product.TableList.Table.ColumnList.Column> invoiceTableColumnList = invoiceTable.getColumnList().getColumn();
        List<Product.TableList.Table.ColumnList.Column> invoiceLineItemTableColumnList = invoiceLineItemTable.getColumnList().getColumn();
        if(mapList != null) {
        	for (Map<String, String> record : mapList){
        		Invoice invoiceEntity = getExistingInvoice(record,invoiceTable.getEntityName(),invoiceTableColumnList,userId);
        		com.simpleaccounts.entity.Product productEntity = getExistingProduct(record);
        		InvoiceLineItem invoiceLineItemEntity = getExistingInvoiceLineItem(record,invoiceLineItemTable.getEntityName(),
        				invoiceLineItemTableColumnList,userId,invoiceEntity,productEntity);
        		((InvoiceLineItem) invoiceLineItemEntity).setInvoice((com.simpleaccounts.entity.Invoice) invoiceEntity);
        		((InvoiceLineItem) invoiceLineItemEntity).setIsMigratedRecord(true);
        		((InvoiceLineItem) invoiceLineItemEntity).setProduct(productEntity);
        		invoiceLineItemService.persist(invoiceLineItemEntity);
        		
        		if(record.get(INVOICE_STATUS).equalsIgnoreCase(DRAFT))
        		{
        			invoiceEntity.setStatus(CommonStatusEnum.PENDING.getValue());
        		}
        		else {
        			invoiceEntity.setStatus(CommonStatusEnum.POST.getValue());
        		}
        		invoiceService.persist(invoiceEntity);
        	}
        }
        Map<String,Object> map = new HashMap<>();
        map.put("status", CommonStatusEnum.POST.getValue());
        map.put("isMigratedRecord",1);
        List<Invoice> invoiceList = invoiceService.findByAttributes(map);
        if(invoiceList != null)
        {
        	for(Invoice invoiceEntity:invoiceList) {
        		// persist updated journal
        		Journal journal = invoiceRestHelper.invoicePosting(new PostingRequestModel(invoiceEntity.getId()), userId);
        		journalService.persist(journal);
        		
        		if (invoiceEntity.getContact() != null) {
        			if (invoiceEntity.getContact().getBillingEmail() != null && !invoiceEntity.getContact().getBillingEmail().isEmpty()
        					|| invoiceEntity.getContact().getEmail() != null && !invoiceEntity.getContact().getEmail().isEmpty()) {
        				invoiceRestHelper.send(invoiceEntity, userId,new PostingRequestModel(),null);
        				invoiceService.persist(invoiceEntity);
        			} else {
        				log.info("Email Address For the Particular contact through which the invoice is created is not present{}", invoiceEntity.getContact());
        			}
        		}
        	}
        }
		
	}
	
		/**
		 * This method is used to persist data into journalService Table
		 * @param tables
		 * @param mapList
		 * @param userId
		 */
		private void createOpeningBalance(List<Table> tables, List<Map<String, String>> mapList, Integer userId) {
			LOG.info("createOpeningBalance start");
			 for (Map<String, String> record : mapList) {
				 BigDecimal Amount = new BigDecimal(record.get(SimpleAccountMigrationConstants.ACCOUNT));
				 String transactionCategoryName =  record.get(SimpleAccountMigrationConstants.TRANSACTION_CATEGORY_NAME);
				 String openingDate = record.get(SimpleAccountMigrationConstants.OPENING_DATE);
				 Date effectiveDate = null;
				 try {
					 effectiveDate = new SimpleDateFormat("dd-MM-yyyy").parse(openingDate);
				} catch (ParseException e) {
					LOG.error(ERROR, e);
				}
				 LOG.info("effectiveDate {}", effectiveDate);
				 Map<String, Object> param = new HashMap<>();
				 param.put("transactionCategoryName", transactionCategoryName);
			     List<TransactionCategory> categorys =   transactionCategoryService.findByAttributes(param);
			    // TransactionCategory category = transactionCategoryService.findByPK(persistmodel.getTransactionCategoryId());
			     for(TransactionCategory category : categorys) {
			    	 boolean isDebit = getValidTransactionCategoryType(category);
			    	 TransactionCategory transactionCategory = transactionCategoryService.findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.OPENING_BALANCE_OFFSET_LIABILITIES.getCode());
			    	 List<JournalLineItem> journalLineItemList = new ArrayList<>();
			    	 Journal journal = new Journal();
			    	 JournalLineItem journalLineItem1 = new JournalLineItem();
			    	 journalLineItem1.setTransactionCategory(category);
			    	 boolean isNegative = Amount.longValue()<0;
			    	 if (isDebit ) {
			    		 if(!isNegative)
			    			 journalLineItem1.setDebitAmount(Amount);
			    		 else
			    			 journalLineItem1.setCreditAmount(Amount.negate());
			    	 } else {
			    		 if(!isNegative)
			    			 journalLineItem1.setCreditAmount(Amount);
			    		 else
			    			 journalLineItem1.setDebitAmount(Amount.negate());
			    	 }
			    	 journalLineItem1.setReferenceType(PostingReferenceTypeEnum.BALANCE_ADJUSTMENT);
			    	 journalLineItem1.setReferenceId(category.getTransactionCategoryId());
			    	 journalLineItem1.setCreatedBy(userId);
			    	 journalLineItem1.setJournal(journal);
			    	 journalLineItemList.add(journalLineItem1);
			    	 
			    	 JournalLineItem journalLineItem2 = new JournalLineItem();
			    	 journalLineItem2.setTransactionCategory(transactionCategory);
			    	 if (!isDebit) {
			    		 if(!isNegative)
			    			 journalLineItem2.setDebitAmount(Amount);
			    		 else
			    			 journalLineItem2.setCreditAmount(Amount.negate());
			    	 } else {
			    		 if(!isNegative)
			    			 journalLineItem2.setCreditAmount(Amount);
			    		 else
			    			 journalLineItem2.setDebitAmount(Amount.negate());
			    	 }
			    	 journalLineItem2.setReferenceType(PostingReferenceTypeEnum.BALANCE_ADJUSTMENT);
			    	 journalLineItem2.setReferenceId(transactionCategory.getTransactionCategoryId());
			    	 journalLineItem2.setCreatedBy(userId);
			    	 journalLineItem2.setJournal(journal);
			    	 journalLineItemList.add(journalLineItem2);
			    	 
			    	 journal.setJournalLineItems(journalLineItemList);
			    	 journal.setCreatedBy(userId);
			    	 journal.setPostingReferenceType(PostingReferenceTypeEnum.BALANCE_ADJUSTMENT);
			    	 
			    	 Instant instant = Instant.ofEpochMilli(effectiveDate.getTime());
			    	 LocalDateTime date = LocalDateTime.ofInstant(instant,ZoneId.systemDefault());
			    	 journal.setJournalDate(date.toLocalDate());
			    	 journal.setTransactionDate(date.toLocalDate());
			    	 journalService.persist(journal);
			     }
					
				
			  }
		}	
		
	
		/**
		 * This method is used to persist data into ChartOfAccountCategory Table
		 * @param tables
		 * @param mapList
		 * @param userId
		 */
		
		private void createChartOfAccounts(List<Table> tables, List<Map<String, String>> mapList, Integer userId) {
			LOG.info("createChartOfAccounts start");
	         User user = userService.findByPK(userId);
	         for (Map<String, String> record : mapList) {
	        	 String  ChartOfAccountName = record.get(SimpleAccountMigrationConstants.CHART_OF_ACCOUNT_NAME);
	        	 String Type = record.get(SimpleAccountMigrationConstants.TYPE);
	        	 Integer AccountCode  = Integer.parseInt(record.get(SimpleAccountMigrationConstants.ACCOUNT_CODE));
	        	 TransactionCategoryBean transactionCategoryBean = new TransactionCategoryBean();
	        	 
	        	 transactionCategoryBean.setParentTransactionCategory(null);
	        	 transactionCategoryBean.setTransactionCategoryId(null);
	        	 transactionCategoryBean.setTransactionCategoryDescription(null);
	        	 transactionCategoryBean.setTransactionCategoryName(null);
	        	 transactionCategoryBean.setTransactionCategoryName(ChartOfAccountName);
	        	 transactionCategoryBean.setVatCategory(null);
	        	 transactionCategoryBean.setVersionNumber(null);

	        	 TransactionCategory selectedTransactionCategory = getEntity(transactionCategoryBean);
	 			 selectedTransactionCategory.setCreatedBy(user.getUserId());
	 			 selectedTransactionCategory.setCreatedDate(LocalDateTime.now());
	 			 transactionCategoryService.persist(selectedTransactionCategory);
	 			 coacTransactionCategoryService.addCoacTransactionCategory(selectedTransactionCategory.getChartOfAccount(),selectedTransactionCategory);
	
	         }
		}
		
		
		public TransactionCategory getEntity(TransactionCategoryBean transactionCategoryBean) {
			TransactionCategory transactionCategory = new TransactionCategory();
			transactionCategory.setDefaltFlag(DefaultTypeConstant.NO);
		
			if (transactionCategoryBean.getParentTransactionCategory() != null) {
				transactionCategory.setParentTransactionCategory(transactionCategoryService.findByPK(transactionCategoryBean.getParentTransactionCategory()));
			}
			if (transactionCategoryBean.getTransactionCategoryId() != null
					&& transactionCategoryBean.getTransactionCategoryId() > 0) {
				transactionCategory.setTransactionCategoryId(transactionCategoryBean.getTransactionCategoryId());
			}
			
			transactionCategory.setTransactionCategoryDescription(transactionCategoryBean.getTransactionCategoryDescription());
			transactionCategory.setTransactionCategoryName(transactionCategoryBean.getTransactionCategoryName());
			transactionCategory.setEditableFlag(Boolean.TRUE);
			transactionCategory.setSelectableFlag(Boolean.TRUE);
			
			if (transactionCategoryBean.getTransactionCategoryName() != null) {
				 Map<String, Object> param = new HashMap<>();	
				 param.put("chartOfAccountName", transactionCategoryBean.getTransactionCategoryName());
				List<ChartOfAccount> chartOfAccounts = transactionTypeService.findByAttributes(param);
				for(ChartOfAccount chartOfAccount: chartOfAccounts)
				{
					transactionCategory.setChartOfAccount(chartOfAccount);
					transactionCategory.setTransactionCategoryCode(transactionCategoryService.getNxtTransactionCatCodeByChartOfAccount(chartOfAccount));
				}
			}
			
			if (transactionCategoryBean.getVatCategory() != null) {
				transactionCategory.setVatCategory(vatCategoryService.findByPK(transactionCategoryBean.getVatCategory()));
			}
			if (transactionCategoryBean.getVersionNumber() != null) {
				transactionCategory.setVersionNumber(transactionCategoryBean.getVersionNumber());
			} else {
				transactionCategory.setVersionNumber(0);
			}
			return transactionCategory;
		}
	
		
	
		/**
		 * This method will handle ExchangRate
		 * @param tables
		 * @param mapList
		 * @param userId
		 */
		private void createCurrencyExchangeRate(List<Product.TableList.Table> tables, List<Map<String, String>> mapList,
				Integer userId) {
			Product.TableList.Table currencyConversionTable = tables.get(0);
			List<Product.TableList.Table.ColumnList.Column> currencyConversionTableColumnList = currencyConversionTable.getColumnList().getColumn();
	
			SimpleAccountsService currencyConversionService = (SimpleAccountsService) migrationUtil.getService(currencyConversionTable.getServiceName());
			for (Map<String, String> record : mapList) {
				List<CurrencyConversion> currencyConversion = currencyExchangeService.getCurrencyConversionList();
				//Object currencyConversionEntity = migrationUtil.getObject(currencyConversionTable.getEntityName());
				CurrencyConversion currencyConversionEntity = (CurrencyConversion) migrationUtil.getObject(currencyConversionTable.getEntityName());
				setColumnValue(currencyConversionTableColumnList, record, currencyConversionEntity);
				((CurrencyConversion) currencyConversionEntity).setCurrencyCodeConvertedTo(currencyConversion.get(0).getCurrencyCodeConvertedTo());
				currencyConversionEntity.setCreatedDate(LocalDateTime.now());
				System.out.println("currencyConversionEntity => " + currencyConversionEntity);
				currencyConversionService.persist(currencyConversionEntity);
	
			}
		}
	
		 /**
	     * This method will handle Credit Note
	     * @param tables
	     * @param mapList
	     * @param userId
	     */
	    private void createCreditNote(List<Product.TableList.Table> tables, List<Map<String, String>> mapList,Integer userId) {
	        Product.TableList.Table invoiceTable = tables.get(0);
	        Product.TableList.Table invoiceLineItemTable = tables.get(1);
	        SimpleAccountsService invoiceService = (SimpleAccountsService) migrationUtil.getService(invoiceTable.getServiceName());
	        SimpleAccountsService invoiceLineItemService = (SimpleAccountsService) migrationUtil.getService(invoiceLineItemTable.getServiceName());
	
	        List<Product.TableList.Table.ColumnList.Column> invoiceTableColumnList = invoiceTable.getColumnList().getColumn();
	        List<Product.TableList.Table.ColumnList.Column> invoiceLineItemTableColumnList =
	                invoiceLineItemTable.getColumnList().getColumn();
	        for (Map<String, String> record : mapList){
	            Invoice creditNoteEntity = getExistingCreditNote(record,invoiceTable.getEntityName(),invoiceTableColumnList, userId);
	            Object invoiceLineItemEntity = migrationUtil.getObject(invoiceLineItemTable.getEntityName());
	            setColumnValue(invoiceLineItemTableColumnList, record, invoiceLineItemEntity);
	            migrationUtil.setDefaultSetterValues(invoiceLineItemEntity, userId);
	            ((InvoiceLineItem) invoiceLineItemEntity).setInvoice((com.simpleaccounts.entity.Invoice) creditNoteEntity);
	            com.simpleaccounts.entity.Product productEntity = getExistingProduct(record);
	            ((InvoiceLineItem) invoiceLineItemEntity).setProduct(productEntity);
	            invoiceLineItemService.persist(invoiceLineItemEntity);
	        }
	    }
    
	    /**
		 * This method is used for 
		 * @param record
		 * @param entityName
		 * @param invoiceTableColumnList
		 * @param userId
		 * @return
		 */
		private Invoice getExistingCreditNote(Map<String, String> record, String entityName,
				List<Product.TableList.Table.ColumnList.Column> invoiceTableColumnList, Integer userId) {
			Invoice invoice = null;
			String invoiceNumber = record.get("Invoice Number");
			Map<String, Object> param = new HashMap<>();
			param.put("referenceNumber", invoiceNumber);
			List<Invoice> invoiceList = invoiceService.findByAttributes(param);
			if (!invoiceList.isEmpty()) {
				return invoiceList.get(0);
			} else {
				invoice = (Invoice) migrationUtil.getObject(entityName);
			}
			invoice.setStatus(CommonStatusEnum.PENDING.getValue());
			invoice.setDiscountType(DiscountType.FIXED);
			setColumnValue(invoiceTableColumnList, record, invoice);
			migrationUtil.setDefaultSetterValues(invoice, userId);
			invoice.setType(7);
			invoiceService.persist(invoice);
			return invoice;
			
		}

	
	
	private void setColumnValue(List<Product.TableList.Table.ColumnList.Column> productTableColumnList, Map<String, String> record, Object productEntity) {
		if(productTableColumnList != null) {
			for (Product.TableList.Table.ColumnList.Column column : productTableColumnList) {
				String val = record.get(column.getInputColumn());
				LOG.info("setColumnValue val {}", val);
				String setterMethod = column.getSetterMethod();
				if (setterMethod.equalsIgnoreCase("setProductType")){
					if (StringUtils.isEmpty(val))
						continue;
					ProductType value = migrationUtil.getProductType(val);
					migrationUtil.setRecordIntoEntity(productEntity, setterMethod, value, "Object");
				}
				else if (setterMethod.equalsIgnoreCase("setVatCategory")){
					VatCategory vatCategory = migrationUtil.getVatCategoryByValue(val);
					migrationUtil.setRecordIntoEntity(productEntity,setterMethod,vatCategory,"Object");
				}
				
				else if(setterMethod.equalsIgnoreCase("setPriceType")){
					if (StringUtils.isEmpty(val))
						continue;
					ProductPriceType value = migrationUtil.getProductPriceType(val,record);
					migrationUtil.setRecordIntoEntity(productEntity, setterMethod, value, "Object");
					if (productEntity instanceof ProductLineItem){
						if (StringUtils.isEmpty(val))
							continue;
						TransactionCategory transactionCategory = migrationUtil.getTransactionCategory(val);
						migrationUtil.setRecordIntoEntity(productEntity, "setTransactioncategory", transactionCategory, "Object");
					}
				}
				else if (setterMethod.equalsIgnoreCase("setUnitPrice")){
					if (StringUtils.isEmpty(val))
						continue;
					if(val.trim().contains(" "))
					{
						String[] values = val.split(" ");
						migrationUtil.setRecordIntoEntity(productEntity,setterMethod,values[1],"BigDecimal");
					}else {
						migrationUtil.setRecordIntoEntity(productEntity,setterMethod,val,"BigDecimal");
					}
				}
				
				else if (setterMethod.equalsIgnoreCase("setContact")) {
					if (StringUtils.isEmpty(val))
						continue;
					Contact value = migrationUtil.getContactByValue(val);
					migrationUtil.setRecordIntoEntity(productEntity, setterMethod, value, "Object");
				}else if (setterMethod.equalsIgnoreCase("setSupplierId")) {
					if (StringUtils.isEmpty(val))
						continue;
					Contact value = migrationUtil.getContactByValue(val);
					migrationUtil.setRecordIntoEntity(productEntity, setterMethod, value, "Object");
				}
				else if (setterMethod.equalsIgnoreCase("setInvoiceDuePeriod")){
					if (StringUtils.isEmpty(val))
						continue;
					InvoiceDuePeriodEnum value = migrationUtil.getInvoiceDuePeriod(val);
					migrationUtil.setRecordIntoEntity(productEntity,setterMethod,value,"Object");
				}else if (setterMethod.equalsIgnoreCase("setTrnsactioncCategory")){
					if (StringUtils.isEmpty(val))
						continue;
					if (productEntity instanceof InvoiceLineItem){
						TransactionCategory transactionCategory = migrationUtil.getTransactionCategory(val);
						migrationUtil.setRecordIntoEntity(productEntity, "setTrnsactioncCategory", transactionCategory, "Object");
					}
				}
				else if (StringUtils.equalsIgnoreCase(setterMethod,"setInvoiceLineItemUnitPrice")){
					if (StringUtils.isEmpty(val))
						continue;
					migrationUtil.setRecordIntoEntity(productEntity,"setUnitPrice",val,"BigDecimal");
				}else if (setterMethod.equalsIgnoreCase("setCurrency") || setterMethod.equalsIgnoreCase("setCurrencyCode")) {
					if (StringUtils.isEmpty(val))
						continue;
					Currency currency = migrationUtil.getCurrencyIdByValue(val);
//                        Currency currency = currencyService.findByPK(value);
					migrationUtil.setRecordIntoEntity(productEntity, setterMethod, currency, "Object");
				}
				else {
					if (StringUtils.isEmpty(val))
						continue;
					// set into entity
					migrationUtil.setRecordIntoEntity(productEntity, setterMethod, val, column.getDataType());
				}
				
			}
		}
    }
	
	
	 /**
     * This method will use to get the ExistingProductLineItemForSales
     * @param record
     * @param entityName
     * @param productLineItemTableColumnList
     * @param userId
     * @param productEntity
     * @param lineItem
     * @return
     */
	private ProductLineItem getExistingProductLineItemForSales(Map<String, String> record, String entityName,
			List<Product.TableList.Table.ColumnList.Column> productLineItemTableColumnList, Integer userId,
			Object productEntity, List<ProductLineItem> lineItem) {
		
		LOG.info("getExistingProductLineItemForSales start ");
		ProductLineItem productLineItem = null;

		Map<String, Object> param = new HashMap<>();
		param.put("product", productEntity);
		param.put("priceType", ProductPriceType.SALES);
		List<ProductLineItem> productLineItemList = productLineItemService.findByAttributes(param);
		if (!productLineItemList.isEmpty()) {
			return productLineItemList.get(0);
		} else {
			productLineItem = (ProductLineItem) migrationUtil.getObject(entityName);
		}
		setColumnValueForProductLineItemSales(productLineItemTableColumnList, record, productLineItem);
		migrationUtil.setDefaultSetterValues(productLineItem, userId);
		return productLineItem;
	}
	
	private ProductLineItem getExistingProductLineItemForPurchase(Map<String, String> record, String entityName,
			List<Product.TableList.Table.ColumnList.Column> productLineItemTableColumnList, Integer userId,
			Object productEntity, List<ProductLineItem> lineItem) {
		ProductLineItem productLineItem = null;
		Map<String, Object> param = new HashMap<>();
		param.put("product", productEntity);
		param.put("priceType", ProductPriceType.PURCHASE);
		List<ProductLineItem> productLineItemList = productLineItemService.findByAttributes(param);
		if (!productLineItemList.isEmpty()) {
			return productLineItemList.get(0);
		} else {
			productLineItem = (ProductLineItem) migrationUtil.getObject(entityName);
		}
		setColumnValueForProductLineItemPurchase(productLineItemTableColumnList, record, productLineItem, lineItem);
		migrationUtil.setDefaultSetterValues(productLineItem, userId);
		LOG.info("getExistingProductLineItemForSales productLineItem {} ", productLineItem);
		return productLineItem;
	}
	
	private void setColumnValueForProductLineItemPurchase(
			List<Product.TableList.Table.ColumnList.Column> productLineItemTableColumnList, Map<String, String> record,
			ProductLineItem productLineItem, List<ProductLineItem> lineItem) {
		LOG.info("setColumnValueForProductLineItemPurchase start");
		if(productLineItemTableColumnList != null) {
			for (Product.TableList.Table.ColumnList.Column column : productLineItemTableColumnList) {
				String val = record.get(column.getInputColumn());
				if (StringUtils.isEmpty(val))
					continue;
				String setterMethod = column.getSetterMethod();
				if (setterMethod.equalsIgnoreCase("setPriceType")) {
					ProductPriceType productPriceType = ProductPriceType.PURCHASE;
					migrationUtil.setRecordIntoEntity(productLineItem, setterMethod, productPriceType, "Object");
				} else if (setterMethod.equalsIgnoreCase("setTransactioncategory")) {
					TransactionCategory transactionCategory = transactionCategoryService.findByPK(49);
					migrationUtil.setRecordIntoEntity(productLineItem, setterMethod, transactionCategory, "Object");
				} else if (setterMethod.equalsIgnoreCase("setUnitPrice")) {
					
					if(val.trim().contains(" "))
					{
						String[] values = val.split(" ");
						migrationUtil.setRecordIntoEntity(productLineItem, setterMethod, values[1], "BigDecimal");
					}else {
						migrationUtil.setRecordIntoEntity(productLineItem, setterMethod, val, "BigDecimal");
					}
					
					
				} else {
					// set into entity
					migrationUtil.setRecordIntoEntity(productLineItem, setterMethod, val, column.getDataType());
				}
			}
		}
	}
	
	/**
	 * 
	 * @param productLineItemTableColumnList
	 * @param record
	 * @param productLineItem
	 */
	private void setColumnValueForProductLineItemSales(
			List<Product.TableList.Table.ColumnList.Column> productLineItemTableColumnList, Map<String, String> record,
			ProductLineItem productLineItem) {
		LOG.info("setColumnValueForProductLineItemSales start");
		for (Product.TableList.Table.ColumnList.Column column : productLineItemTableColumnList) {
			String val = record.get(column.getInputColumn());
			LOG.info("setColumnValueForProductLineItemSales val {}", val);
			if (StringUtils.isEmpty(val))
				continue;
			String setterMethod = column.getSetterMethod();
			if (setterMethod.equalsIgnoreCase("setPriceType")) {
				ProductPriceType productPriceType = ProductPriceType.SALES;
				migrationUtil.setRecordIntoEntity(productLineItem, setterMethod, productPriceType, "Object");
			} else if (setterMethod.equalsIgnoreCase("setTransactioncategory")) {
				TransactionCategory transactionCategory = migrationUtil.getTransactionCategory(val);
				migrationUtil.setRecordIntoEntity(productLineItem, setterMethod, transactionCategory, "Object");
			} else if (setterMethod.equalsIgnoreCase("setUnitPrice")) {
				
				if(val.trim().contains(" "))
                {
                	String[] values = val.split(" ");
                	migrationUtil.setRecordIntoEntity(productLineItem, setterMethod, values[1], "BigDecimal");
                }else {
                	migrationUtil.setRecordIntoEntity(productLineItem, setterMethod, val, "BigDecimal");
                }
			} else {
				// set into entity
				migrationUtil.setRecordIntoEntity(productLineItem, setterMethod, val, column.getDataType());
			}
		}
	}
	
	private Invoice getExistingInvoice(Map<String, String> record, String entityName,
			List<Product.TableList.Table.ColumnList.Column> invoiceTableColumnList, Integer userId) {
		LOG.info("getExistingInvoice start");
		Invoice invoice = null;
		String invoiceNumber = record.get("Invoice Number");
		Map<String, Object> param = new HashMap<>();
		param.put("referenceNumber", invoiceNumber);
		List<Invoice> invoiceList = invoiceService.findByAttributes(param);
		if (!invoiceList.isEmpty()) {
			return invoiceList.get(0);
		} else {
			invoice = (Invoice) migrationUtil.getObject(entityName);
		}
		setColumnValue(invoiceTableColumnList, record, invoice);
		migrationUtil.setDefaultSetterValues(invoice, userId);
		invoice.setType(2);
		// invoice.setStatus(2);
		invoice.setIsMigratedRecord(true);
		invoiceService.persist(invoice);
		LOG.info("getExistingInvoice invoice {} ", invoice);
		return invoice;
	}
	 
	/**
	 * This method is use to get ExistingProduct
	 * @param record
	 * @return
	 */
	 private com.simpleaccounts.entity.Product getExistingProduct(Map<String, String> record) {
	        String productName =record.get("Item Name");
	        Map<String, Object> param = new HashMap<>();
	        param.put("productName", productName);
	       // param.put("priceType", ProductPriceType.BOTH) ;
	        List<com.simpleaccounts.entity.Product> productList = productService.findByAttributes(param);
	        for (com.simpleaccounts.entity.Product product:productList){
	        	LOG.info("getExistingInvoice product {} ", product);
	            return product;
	        }
	        return null;
	       // com.simpleaccounts.entity.Product product = productService.getProductByProductNameAndProductPriceType(productName);
	    }
	 
	 
	 /**
	  * This Method is use to get ExistingInvoiceLineItem
	  * @param record
	  * @param entityName
	  * @param invoiceLineItemTableColumnList
	  * @param userId
	  * @param invoiceEntity
	  * @param productEntity
	  * @return
	  */
	private InvoiceLineItem getExistingInvoiceLineItem(Map<String, String> record, String entityName,
			List<Product.TableList.Table.ColumnList.Column> invoiceLineItemTableColumnList, Integer userId,
			Invoice invoiceEntity, com.simpleaccounts.entity.Product productEntity) {
		LOG.info("getExistingInvoiceLineItem start");
		InvoiceLineItem invoiceLineItem = null;
		Map<String, Object> param = new HashMap<>();
		param.put("invoice", invoiceEntity);
		param.put("product", productEntity);
		List<InvoiceLineItem> invoiceLineItemLList = invoiceLineItemService.findByAttributes(param);
		if (!invoiceLineItemLList.isEmpty()) {
			return invoiceLineItemLList.get(0);
		} else {
			invoiceLineItem = (InvoiceLineItem) migrationUtil.getObject(entityName);
		}
		setColumnValue(invoiceLineItemTableColumnList, record, invoiceLineItem);
		migrationUtil.setDefaultSetterValues(invoiceLineItem, userId);
		
		LOG.info("getExistingInvoiceLineItem invoiceLineItem {} ", invoiceLineItem);
		return invoiceLineItem;
	}

	private boolean getValidTransactionCategoryType(TransactionCategory transactionCategory) {
		String transactionCategoryCode = transactionCategory.getChartOfAccount().getChartOfAccountCode();
		ChartOfAccountCategoryCodeEnum chartOfAccountCategoryCodeEnum = ChartOfAccountCategoryCodeEnum.getChartOfAccountCategoryCodeEnum(transactionCategoryCode);
		if (chartOfAccountCategoryCodeEnum == null)
			return false;
		switch (chartOfAccountCategoryCodeEnum) {
			case ACCOUNTS_RECEIVABLE:
			case BANK:
			case CASH:
			case CURRENT_ASSET:
			case FIXED_ASSET:
			case OTHER_CURRENT_ASSET:
			case STOCK:
				return true;
			case OTHER_LIABILITY:
			case OTHER_CURRENT_LIABILITIES:
			case EQUITY:
			case ADMIN_EXPENSE:
			case OTHER_EXPENSE:
			case COST_OF_GOODS_SOLD:
				return false;
		}
		return true;
	}
}
