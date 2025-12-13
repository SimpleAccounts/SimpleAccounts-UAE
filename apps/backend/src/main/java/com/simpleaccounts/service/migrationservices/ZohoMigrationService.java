package com.simpleaccounts.service.migrationservices;

import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.ACCOUNT;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.BILL;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.BILLE_STATUS;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.BILL_DATE;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.CHART_OF_ACCOUNTS;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.CONTACTS;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.CREDIT_NOTE;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.DATE;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.DRAFT;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.EXCHANGE_RATE;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.EXPENSE;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.EXPENSE_ACCOUNT;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.EXPENSE_DATE;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.INVOICE;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.INVOICE_DATE;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.INVOICE_STATUS;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.ITEM;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.PURCHASE_ACCOUNT;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.PURCHASE_ORDER_DATE;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.VENDORS;

import com.simpleaccounts.constant.CommonStatusEnum;
import com.simpleaccounts.constant.ContactTypeEnum;
import com.simpleaccounts.constant.DefaultTypeConstant;
import com.simpleaccounts.constant.DiscountType;
import com.simpleaccounts.constant.InvoiceDuePeriodEnum;
import com.simpleaccounts.constant.PayMode;
import com.simpleaccounts.constant.ProductPriceType;
import com.simpleaccounts.constant.ProductType;
import com.simpleaccounts.constant.TransactionCategoryCodeEnum;
import com.simpleaccounts.entity.ChartOfAccountCategory;
import com.simpleaccounts.entity.Company;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.ContactTransactionCategoryRelation;
import com.simpleaccounts.entity.Country;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.CurrencyConversion;
import com.simpleaccounts.entity.Expense;
import com.simpleaccounts.entity.Inventory;
import com.simpleaccounts.entity.Invoice;
import com.simpleaccounts.entity.InvoiceLineItem;
import com.simpleaccounts.entity.Journal;
import com.simpleaccounts.entity.PlaceOfSupply;
import com.simpleaccounts.entity.ProductLineItem;
import com.simpleaccounts.entity.State;
import com.simpleaccounts.entity.TaxTreatment;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.entity.VatCategory;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.migration.ProductMigrationParser;
import com.simpleaccounts.migration.xml.bindings.product.Product;
import com.simpleaccounts.migration.xml.bindings.product.Product.TableList.Table;
import com.simpleaccounts.migration.xml.bindings.product.Product.TableList.Table.ColumnList.Column;
import com.simpleaccounts.rest.PostingRequestModel;
import com.simpleaccounts.rest.invoicecontroller.InvoiceRestHelper;
import com.simpleaccounts.rest.migration.model.BillModel;
import com.simpleaccounts.rest.migration.model.ChartOfAccountsModel;
import com.simpleaccounts.rest.migration.model.ContactsModel;
import com.simpleaccounts.rest.migration.model.CreditNoteModel;
import com.simpleaccounts.rest.migration.model.ExchangeRateModel;
import com.simpleaccounts.rest.migration.model.ExpenseModel;
import com.simpleaccounts.rest.migration.model.InvoiceModel;
import com.simpleaccounts.rest.migration.model.ItemModel;
import com.simpleaccounts.rest.migration.model.PurchaseOrderModel;
import com.simpleaccounts.rest.migration.model.UploadedFilesDeletionReqModel;
import com.simpleaccounts.rest.migration.model.VendorsModel;
import com.simpleaccounts.rest.migrationcontroller.DataMigrationRespModel;
import com.simpleaccounts.rest.migrationcontroller.TransactionCategoryListResponseModel;
import com.simpleaccounts.rest.migrationcontroller.TransactionCategoryModelForMigration;
import com.simpleaccounts.rfq_po.PoQuatation;
import com.simpleaccounts.rfq_po.PoQuatationLineItem;
import com.simpleaccounts.service.CompanyService;
import com.simpleaccounts.service.ContactService;
import com.simpleaccounts.service.ContactTransactionCategoryService;
import com.simpleaccounts.service.CountryService;
import com.simpleaccounts.service.CurrencyExchangeService;
import com.simpleaccounts.service.CurrencyService;
import com.simpleaccounts.service.ExpenseService;
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
import com.simpleaccounts.utils.FileHelper;
import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import java.util.stream.Stream;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
	@Slf4j
	@SuppressWarnings("java:S3973")
	@RequiredArgsConstructor
public class ZohoMigrationService {
	
	private static final String SETTER_METHOD_SET_CURRENCY = "setCurrency";
	private static final String SETTER_METHOD_SET_CURRENCY_CODE = "setCurrencyCode";
	private static final String TYPE_OBJECT = "Object";
	
    private final Logger LOG = LoggerFactory.getLogger(ZohoMigrationService.class);
	
    private final TransactionCategoryService transactionCategoryService;

    private final InvoiceService invoiceService;
    
    private final InvoiceLineItemService invoiceLineItemService;

    private final ContactService contactService;

    private final ProductService productService;

    private final CurrencyService currencyService;

    private final VatCategoryService vatCategoryService;

    private final InvoiceRestHelper invoiceRestHelper;

    private final JournalService journalService;

    private final ProductLineItemService productLineItemService;

    private final ExpenseService expenseService;

    private final UserService userService;
    
    private final CurrencyExchangeService currencyExchangeService;
    
    private final  ContactTransactionCategoryService contactTransactionCategoryService;
    
    private final String basePath;
    
    private final MigrationUtil migrationUtil; 
    
    private final CompanyService companyService;
    
    private final CountryService countryService;

    private final StateService stateService;

    
    /*************************************************************** start  
     * @param request *************************************************************************/
    public List<DataMigrationRespModel> processTheMigratedData(String productName, String version, String fileLocation, Integer userId, String migFromDate, HttpServletRequest request)
            throws IOException {
    	
    	LOG.info("ZohoMigrationService :: processTheMigratedData start");
        List<DataMigrationRespModel> list = new ArrayList<>();
        ProductMigrationParser parser = ProductMigrationParser.getInstance();
        Product product = parser.getAppVersionsToProductMap().get(productName + "_v" + version);
	        List<String> files = getFilesPresent(fileLocation);
	        
	        if(files != null)
			{
	        	for (String file : files) {
	        		List<Map<String, String>> mapList = migrationUtil.parseCSVFile(fileLocation + File.separator + file);
		        		List<Map<String, String>> itemsToRemove = new ArrayList<>();
	        		for (Map<String, String> mapRecord : mapList) {
        			
        			if (mapRecord.containsKey(INVOICE_DATE)) {
        				Integer result = migrationUtil.compareDate(mapRecord.get(INVOICE_DATE), migFromDate);
        				if (result!=null) {
        					itemsToRemove = migrationUtil.filterMapRecord(mapList, mapRecord, result, itemsToRemove);
        				}
        			}
        			
        			if (mapRecord.containsKey(BILL_DATE)) {
        				Integer result = migrationUtil.compareDate(mapRecord.get(BILL_DATE), migFromDate);
        				if (result!=null) {
        					itemsToRemove = migrationUtil.filterMapRecord(mapList, mapRecord, result, itemsToRemove);
        				}
        			}
        			
        			if (mapRecord.containsKey(DATE)) {
        				Integer result = migrationUtil.compareDate(mapRecord.get(DATE), migFromDate);
        				if (result!=null) {
        					itemsToRemove = migrationUtil.filterMapRecord(mapList, mapRecord, result, itemsToRemove);
        				}
        			}
        			
        			if (mapRecord.containsKey(EXPENSE_DATE)) {
        				Integer result = migrationUtil.compareDate(mapRecord.get(EXPENSE_DATE), migFromDate);
        				if (result!=null) {
        					itemsToRemove = migrationUtil.filterMapRecord(mapList, mapRecord, result, itemsToRemove);
        				}
        			}
        			
        			if (mapRecord.containsKey(PURCHASE_ORDER_DATE)) {
        				Integer result = migrationUtil.compareDate(mapRecord.get(PURCHASE_ORDER_DATE), migFromDate);
        				if (result!=null) {
        					itemsToRemove = migrationUtil.filterMapRecord(mapList, mapRecord, result, itemsToRemove);
        				}
        			}
        			
        		}
        		mapList.removeAll(itemsToRemove);
        		
	        		List<Product.TableList.Table> tableList = product.getTableList().getTable();
	        		List<Product.TableList.Table> tables = migrationUtil.getTableName(tableList, file);
	        		DataMigrationRespModel dataMigrationRespModel = new DataMigrationRespModel();
	        		Company company = companyService.getCompany();
		        		dataMigrationRespModel.setMigrationBeginningDate(company.getAccountStartDate().toString());
		        		dataMigrationRespModel.setExecutionDate(LocalDateTime.now().toString());
		        		dataMigrationRespModel.setFileName(file);
		        		long recordCount = 0;
		        		Path recordCountPath = Paths.get(fileLocation, file);
		        		try (Stream<String> lines = Files.lines(recordCountPath)) {
		        			recordCount = lines.count() - 1;
		        		} catch (IOException e) {
	        			LOG.error("Failed to count records for file {}", file, e);
	        		}
	        		dataMigrationRespModel.setRecordCount(recordCount);
        		dataMigrationRespModel.setRecordsMigrated((long) mapList.size());
        		dataMigrationRespModel.setRecordsRemoved((long) itemsToRemove.size());
	        		list.add(dataMigrationRespModel);
	        		if (isSpecialHandlingNeeded(productName, file)) {
	        			handleProductSpecificTables(tables, mapList, userId, request);
	        			continue;
	        		}
        		if(tables != null) 
				{
						LOG.info("processTheMigratedData tables ==>{} ", tables);
						for (Product.TableList.Table table : tables) {
							// get service Object
							SimpleAccountsService<Object, Object> service = (SimpleAccountsService<Object, Object>) migrationUtil.getService(
									table.getServiceName());
							List<Product.TableList.Table.ColumnList.Column> columnList = table.getColumnList().getColumn();
							// csv records
							for (Map<String, String> recordData : mapList) {
								Object entity = migrationUtil.getObject(table.getEntityName());
								// iterate over all the columns and crate record and persist object to database
								for (Product.TableList.Table.ColumnList.Column column : columnList) {
									String val = recordData.get(column.getInputColumn());
									if (StringUtils.isEmpty(val))
										continue;
								String setterMethod = column.getSetterMethod();
								if (setterMethod.equalsIgnoreCase(SETTER_METHOD_SET_CURRENCY)) {
									Currency currency = migrationUtil.getCurrencyIdByValue(val);
									migrationUtil.setRecordIntoEntity(entity, setterMethod, currency, TYPE_OBJECT);
								} else if (setterMethod.equalsIgnoreCase("setCountry")) {
									Integer value = migrationUtil.getCountryIdByValue(val);
									Country country = countryService.findByPK(value);
									migrationUtil.setRecordIntoEntity(entity, setterMethod, country, TYPE_OBJECT);
								} else if (setterMethod.equalsIgnoreCase("setState")) {
									Integer value = migrationUtil.getStateIdByInputColumnValue(val);
									State state = stateService.findByPK(value);
									migrationUtil.setRecordIntoEntity(entity, setterMethod, state, TYPE_OBJECT);
								} else if (setterMethod.equalsIgnoreCase("setContactType")) {
									Integer value = migrationUtil.getContactType(val);
									migrationUtil.setRecordIntoEntity(entity, setterMethod, value, TYPE_OBJECT);
								} else if (setterMethod.equalsIgnoreCase("setPlaceOfSupplyId")) {
									if (StringUtils.isEmpty(val))
										continue;
									PlaceOfSupply placeOfSupply = migrationUtil.getPlaceOfSupplyByValue(val);
									migrationUtil.setRecordIntoEntity(entity, setterMethod, placeOfSupply, TYPE_OBJECT);
								} else if (setterMethod.equalsIgnoreCase("setTaxTreatment")) {
										if (StringUtils.isEmpty(val))
											continue;
										val = setTaxTreatmentValues(val);
										TaxTreatment taxTreatment = migrationUtil.getTaxTreatmentByValue(val);
										migrationUtil.setRecordIntoEntity(entity, setterMethod, taxTreatment, TYPE_OBJECT);
									} 
								else {
									// set into entity
									migrationUtil.setRecordIntoEntity(entity, setterMethod, val, column.getDataType());
								}
							}
							migrationUtil.setDefaultSetterValues(entity, userId);
							Optional<Product.TableList.Table> contactTable = tables.stream().filter(t -> t.getName().equalsIgnoreCase(CONTACTS)).findFirst();
							
							
							if (contactTable.isPresent()) {
								
								//check whether the email id is coming 
								checkEmaiID((Contact) entity);
								
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

	private String setTaxTreatmentValues(String val) {
		if(val.equalsIgnoreCase("vat_registered")) {
			val = "VAT REGISTERED";
		}else if(val.equalsIgnoreCase("dz_vat_registered")) {
			val = "VAT REGISTERED DESIGNATED ZONE";
		}else if(val.equalsIgnoreCase("vat_not_registered")) {
			val = "NON-VAT REGISTERED";
		}
		else if(val.equalsIgnoreCase("dz_vat_not_registered")) {
			val = "NON-VAT REGISTERED DESIGNATED ZONE";
		}
		return val;		

	}
    
	    private void checkEmaiID(Contact entity) {

	    	entity.setIsMigratedRecord(Boolean.TRUE);
	    	
	    	if(entity.getEmail() == null)
			{
				//create emailId by firstName and LastName
				entity.setEmail(entity.getFirstName()+"."+entity.getLastName()+"@xyz.com");
			}
	    	
	    	if(entity.getBillingEmail() == null)
			{
				//create emailId by firstName and LastName
				entity.setBillingEmail(entity.getFirstName()+"."+entity.getLastName()+"@xyz.com");
			}	
	    	
	    	if(entity.getContractPoNumber() == null )
	    	{
	    		entity.setContractPoNumber("971000000000");
	    	}
	    	
	    	if(entity.getCountry() == null)
	    	{
				Integer value = migrationUtil.getCountryIdByValue(ZohoMigrationConstants.UAE);
				Country country = countryService.findByPK(value);
				entity.setCountry(country);
				entity.setShippingCountry(country);
	    	}
	    	
	    	if(entity.getState() == null)
	    	{
				Integer value = migrationUtil.getStateIdByInputColumnValue(ZohoMigrationConstants.DUBAI);
				State state = stateService.findByPK(value);
				entity.setState(state);
				entity.setShippingState(state);
	    	}
	    	
	    	if(entity.getAddressLine1() == null)
	    	{
	    		entity.setAddressLine1("NA");
	    	}
	    	
	    	if(entity.getAddressLine2() == null)
	    	{
	    		entity.setAddressLine2("NA");
	    	}
	    	
	    	if(entity.getAddressLine3() == null)
	    	{
	    		entity.setAddressLine3("NA");
	    	}
	    	
	    	if(entity.getCity() == null)
	    	{
	    		entity.setCity("NA");
	    		entity.setShippingCity("NA");
	    	}
	    	
	    	if(entity.getPostZipCode() == null)
	    	{
	    		entity.setPostZipCode("12345");
	    		entity.setShippingPostZipCode("12345");
	    	}
	    	
	    	if(entity.getIsBillingandShippingAddressSame() == null)
	    	{
	    		entity.setIsBillingandShippingAddressSame(Boolean.TRUE);
	    	}
	    	
	    	if(entity.getMobileNumber() == null)
	    	{
	    		entity.setMobileNumber("971000000000");
	    	}
	    	
		}

		/**
	      * This method returns list of files present under specified directory
	     *
	     * @param dir
	     * @return
	     */
		    public List<String> getFilesPresent(String dir) {
				List<String> resultSet = new ArrayList<>();
				List<String> inputFiles = new ArrayList<>();

				// get the predefined file order
				List<String> fileOrder = getFileOrderList();

				File[] files = new File(dir).listFiles();
				if (files == null || files.length == 0) {
					return resultSet;
				}

				for (File file : files) {
					inputFiles.add(file.getName());
				}

				for (String fileName : fileOrder) {
					// check inputFile in file order list.
					if (inputFiles.contains(fileName)) {
						resultSet.add(fileName);
					}
				}

				LOG.info("Input File in Order ==> {} ", resultSet);
				return resultSet;
			    }

	    /**
	     * This method gives the File Order 
	     * @return
	     */
	    private List<String> getFileOrderList() {
	        List<String> fileOrder = Arrays.asList("Contacts.csv", "Vendors.csv", "Item.csv", "Exchange_Rate.csv", "Invoice.csv", "Bill.csv", "Expense.csv", "Credit_Note.csv", "Purchase_Order.csv", "Chart_of_Accounts.csv");
	        return fileOrder;
	    }
	    
	    /**
	     * This method will Handle the Product specific Tables
	     * @param request 
	     */
		protected void handleProductSpecificTables(List<Product.TableList.Table> tables, List<Map<String, String>> mapList,
				Integer userId, HttpServletRequest request) {
			Optional<Product.TableList.Table> table = tables.stream().filter(t -> t.getName().equalsIgnoreCase(ITEM))
					.findFirst();
			if (table.isPresent()) {
				createProduct(tables, mapList, userId);
			}
			table = tables.stream().filter(t -> t.getName().equalsIgnoreCase(INVOICE)).findFirst();
			if (table.isPresent()) {
				createInvoice(tables, mapList, userId, request);
			}
			table = tables.stream().filter(t -> t.getName().equalsIgnoreCase(BILL)).findFirst();
			if (table.isPresent()) {
				createBill(tables, mapList, userId, request);
			}
			table = tables.stream().filter(t -> t.getName().equalsIgnoreCase(CREDIT_NOTE)).findFirst();
			if (table.isPresent()) {
				createCreditNote(tables, mapList, userId);
			}
			table = tables.stream().filter(t -> t.getName().equalsIgnoreCase(PURCHASE_ACCOUNT)).findFirst();
			if (table.isPresent()) {
				createPurchaseOrder(tables, mapList, userId);
			}
			table = tables.stream().filter(t -> t.getName().equalsIgnoreCase(EXPENSE)).findFirst();
			if (table.isPresent()) {
				createExpense(tables, mapList, userId);
			}
			table = tables.stream().filter(t -> t.getName().equalsIgnoreCase(VENDORS)).findFirst();
			if (table.isPresent()) {
				CreateVendorsContact(tables, mapList, userId);
			}
			table = tables.stream().filter(t -> t.getName().equalsIgnoreCase(EXCHANGE_RATE)).findFirst();
			if (table.isPresent()) {
				createExchangeRate(tables, mapList, userId);
			}
			table = tables.stream().filter(t -> t.getName().equalsIgnoreCase(CHART_OF_ACCOUNTS)).findFirst();
			if (table.isPresent()) {
				createChartOfAccounts(tables, mapList, userId);
			} else {
				log.debug("Table ITEM Mismatch");
			}
		}
	
		/**
		 * To check that isSpecialHandling Needed
		 */
		protected boolean isSpecialHandlingNeeded(String productName, String file) {
	        if (StringUtils.equalsIgnoreCase("zoho", productName) && (StringUtils.equalsIgnoreCase(file, "Item.csv")) ||
	                StringUtils.equalsIgnoreCase(file, "Invoice.csv") ||
	                StringUtils.equalsIgnoreCase(file, "Bill.csv") || StringUtils.equalsIgnoreCase(file, "Credit_Note.csv") ||
	                StringUtils.equalsIgnoreCase(file, "Purchase_Order.csv") || StringUtils.equalsIgnoreCase(file, "Expense.csv")
	                || StringUtils.equalsIgnoreCase(file, "Vendors.csv") || StringUtils.equalsIgnoreCase(file, "Exchange_Rate.csv")
	                || StringUtils.equalsIgnoreCase(file, "Chart_of_Accounts.csv")) {
	            return true;
	        } else
	            return false;
	    }
    
	    /**
	     * This method will handle Product / Item
	     * @param tables
	     * @param mapList
	     * @param userId
	     */
	    private void createProduct(List<Product.TableList.Table> tables,List<Map<String, String>> mapList, Integer userId) {
	        Product.TableList.Table productTable = tables.get(0);
	        Product.TableList.Table productLineItemTable = tables.get(1);
	        Product.TableList.Table inventoryTable = tables.get(2);

	        SimpleAccountsService<Object, Object> productMigrationService =
	                (SimpleAccountsService<Object, Object>) migrationUtil.getService(productTable.getServiceName());
	        SimpleAccountsService<Object, Object> productLineItemMigrationService =
	                (SimpleAccountsService<Object, Object>) migrationUtil.getService(productLineItemTable.getServiceName());
	        SimpleAccountsService<Object, Object> inventoryMigrationService =
	                (SimpleAccountsService<Object, Object>) migrationUtil.getService(inventoryTable.getServiceName());

	        List<Product.TableList.Table.ColumnList.Column> productTableColumnList = productTable.getColumnList().getColumn();
	        List<Product.TableList.Table.ColumnList.Column> productLineItemTableColumnList = productLineItemTable.getColumnList().getColumn();
	        List<Product.TableList.Table.ColumnList.Column> inventoryTableColumnList = inventoryTable.getColumnList().getColumn();
	        // csv records
	        if(mapList != null) {
	        	for (Map<String, String> recordData : mapList){
	        		
	        		Boolean isProductExist = checkExistingProduct(recordData);
	       		if(!Boolean.TRUE.equals(isProductExist))
	        		{
	        			Object productEntity = migrationUtil.getObject(productTable.getEntityName());
	        			setColumnValue(productTableColumnList, recordData, productEntity);
	        			Boolean isInventoryEnabled = migrationUtil.checkInventoryEnabled(recordData);
	        			((com.simpleaccounts.entity.Product) productEntity).setIsInventoryEnabled(isInventoryEnabled);
	        			((com.simpleaccounts.entity.Product) productEntity).setIsMigratedRecord(true);
	        			((com.simpleaccounts.entity.Product) productEntity).setIsActive(true);
	        			((com.simpleaccounts.entity.Product) productEntity).setExciseType(Boolean.FALSE);
	        			((com.simpleaccounts.entity.Product) productEntity).setExciseAmount(BigDecimal.ZERO);
	        			
	        			migrationUtil.setDefaultSetterValues(productEntity, userId);
	        			productMigrationService.persist(productEntity);
	        			
	        			List<ProductLineItem> lineItem = new ArrayList<>();
	        			ProductLineItem productLineItemEntitySales = null;
	        			ProductLineItem productLineItemEntityPurchase = null;

	        			String itemType = recordData.get("Item Type");
	        			if (itemType.equalsIgnoreCase("Inventory")||itemType.equalsIgnoreCase("Sales")||
	        					itemType.equalsIgnoreCase("Sales and Purchases")){
	        				productLineItemEntitySales = getExistingProductLineItemForSales(recordData,productLineItemTable.
	        						getEntityName(),productLineItemTableColumnList,userId,productEntity);

	        				productLineItemEntitySales.setProduct((com.simpleaccounts.entity.Product) productEntity);
	        				productLineItemEntitySales.setIsMigratedRecord(true);
	        				productLineItemMigrationService.persist(productLineItemEntitySales);
	        				lineItem.add(productLineItemEntitySales);
	        				
	        			}
	        			if (itemType.equalsIgnoreCase("Inventory")||itemType.equalsIgnoreCase("Purchases")||
	        					itemType.equalsIgnoreCase("Sales and Purchases")) {
	        				productLineItemEntityPurchase = getExistingProductLineItemForPurchase(recordData, productLineItemTable.
	        						getEntityName(), productLineItemTableColumnList, userId, productEntity,lineItem);
	        				productLineItemEntityPurchase.setProduct((com.simpleaccounts.entity.Product) productEntity);
	        				productLineItemEntityPurchase.setIsMigratedRecord(true);
	        				productLineItemMigrationService.persist(productLineItemEntityPurchase);

	        				lineItem.add(productLineItemEntityPurchase);
	        			}
	        			productMigrationService.persist(productEntity);
	        			((com.simpleaccounts.entity.Product) productEntity).setLineItemList(lineItem);
	        		if (Boolean.TRUE.equals(isInventoryEnabled)){
	        				Object inventoryEntity = migrationUtil.getObject(inventoryTable.getEntityName());
	        				setColumnValue(inventoryTableColumnList , recordData ,inventoryEntity);
	        				((Inventory) inventoryEntity).setProductId((com.simpleaccounts.entity.Product) productEntity);
	        				Float unitCost = productLineItemEntityPurchase.getUnitPrice().floatValue();
	        				Float unitSellingPrice = productLineItemEntitySales.getUnitPrice().floatValue();
	        				((Inventory) inventoryEntity).setUnitCost(unitCost);
	        				((Inventory) inventoryEntity).setUnitSellingPrice(unitSellingPrice);
	        				migrationUtil.setDefaultSetterValues(inventoryEntity,userId);
	        				((Inventory) inventoryEntity).setIsMigratedRecord(true);
	        				if (((Inventory) inventoryEntity).getReorderLevel()==null){
	        					((Inventory) inventoryEntity).setReorderLevel(0);
	        				}
	        				if (((Inventory) inventoryEntity).getQuantitySold()==null){
	        					((Inventory) inventoryEntity).setQuantitySold(0);
	        				}
	        				if (((Inventory) inventoryEntity).getPurchaseQuantity()==null){
	        					((Inventory) inventoryEntity).setPurchaseQuantity(0);
	        				}
	        				inventoryMigrationService.persist(inventoryEntity);
	        				
	        			}
	        		}
	        		else {
	        			LOG.info("Product Allready Present");
	        			LOG.info("Product Exist ==> {} ",recordData.get("Item Name"));
	        		}
	        		
	        	}
	        	
	        }
	        }

	    /**
	     * 
	     * @param record
	     * @return flag
	     */
		private Boolean checkExistingProduct(Map<String, String> recordData) {
			Boolean flag;
			com.simpleaccounts.entity.Product productList = getExistingProduct(recordData);
			com.simpleaccounts.entity.Product productListCode = getExistingProductCode(recordData);
			
			LOG.info("productList ==> {} ",productList);
     
			 if(productList != null || productListCode != null) {

				 LOG.info("Product Name Exist ==> {} ",productList.getProductName()+" "+productList.getProductCode());
				 flag = true;
				 
			 }else {
				 LOG.info("Product Not Exist ==> {} ",recordData.get("Item Name")); 
				 flag = false;
			 }
			 
			 return flag;
		}
    
	 /**
	     * This Method Will Handle the input csv of Invoice which is  treated as customer invoice in S 
	     * @param mapList
	     * @param userId
	 * @param request 
	     */
		    private void createInvoice(List<Product.TableList.Table> tables, List<Map<String, String>> mapList, Integer userId, HttpServletRequest request) {
		    	
		    	LOG.info("createInvoice start");
		        Product.TableList.Table invoiceTable = tables.get(0);
		        Product.TableList.Table invoiceLineItemTable = tables.get(1);

		        SimpleAccountsService<Object, Object> invoiceLineItemMigrationService =
		                (SimpleAccountsService<Object, Object>) migrationUtil.getService(invoiceLineItemTable.getServiceName());

		        List<Product.TableList.Table.ColumnList.Column> invoiceTableColumnList = invoiceTable.getColumnList().getColumn();
		        List<Product.TableList.Table.ColumnList.Column> invoiceLineItemTableColumnList = invoiceLineItemTable.getColumnList().getColumn();
		        if(mapList != null) {
		        	for (Map<String, String> recordData : mapList){
		        		Invoice invoiceEntity = getExistingInvoice(recordData,invoiceTable.getEntityName(),invoiceTableColumnList,userId);
		        		com.simpleaccounts.entity.Product productEntity = getExistingProduct(recordData);
		        		InvoiceLineItem invoiceLineItemEntity = getExistingInvoiceLineItem(recordData,invoiceLineItemTable.getEntityName(),
		        				invoiceLineItemTableColumnList,userId,invoiceEntity,productEntity);
		        		invoiceLineItemEntity.setInvoice(invoiceEntity);
		        		invoiceLineItemEntity.setIsMigratedRecord(true);
		        		invoiceLineItemEntity.setProduct(productEntity);
		        		invoiceLineItemEntity.setDiscountType(DiscountType.FIXED);
		        		invoiceLineItemMigrationService.persist(invoiceLineItemEntity);

		        		if(recordData.get(INVOICE_STATUS).equalsIgnoreCase(DRAFT))
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
	        map.put("type",2);
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
	        				invoiceRestHelper.send(invoiceEntity, userId,new PostingRequestModel(),request);
	        				invoiceService.persist(invoiceEntity);
	        			} else {
	        				log.info("Email Address For the Particular contact through which the invoice is created is not present{}", invoiceEntity.getContact());
	        			}
	        		}
	        	}
	        }
	    }
	    
	    /**
	     * This Method Will Handle the input csv of Bill which is Treated as supplier invoice in SimpleAccounts
	     * @param tables
	     * @param mapList
	     * @param userId
	     * @param request 
	     */
	    private void createBill(List<Product.TableList.Table> tables, List<Map<String, String>> mapList, Integer userId, HttpServletRequest request) {
	        Product.TableList.Table invoiceTable = tables.get(0);
	        Product.TableList.Table invoiceLineItemTable = tables.get(1);

	        SimpleAccountsService<Object, Object> invoiceLineItemMigrationService =
	                (SimpleAccountsService<Object, Object>) migrationUtil.getService(invoiceLineItemTable.getServiceName());

	        List<Product.TableList.Table.ColumnList.Column> invoiceTableColumnList = invoiceTable.getColumnList().getColumn();
	        List<Product.TableList.Table.ColumnList.Column> invoiceLineItemTableColumnList =
	                invoiceLineItemTable.getColumnList().getColumn();
	        for (Map<String, String> recordData : mapList){
	            Invoice supplierInvoiceEntity = getExistingSupplierInvoice(recordData,invoiceTable.getEntityName(),
	                    invoiceTableColumnList,userId);
	            com.simpleaccounts.entity.Product productEntity = getExistingProduct(recordData);
	            addMissingFieldsForProductTypePurchase(productEntity, recordData);
	            InvoiceLineItem supplierInvoiceLineItemEntity = getExistingInvoiceLineItem(recordData,
	                    invoiceLineItemTable.getEntityName(),
	                    invoiceLineItemTableColumnList,userId,supplierInvoiceEntity,productEntity);
	            supplierInvoiceLineItemEntity.setInvoice(supplierInvoiceEntity);
	            supplierInvoiceLineItemEntity.setProduct(productEntity);
	            supplierInvoiceLineItemEntity.setIsMigratedRecord(true);
	            supplierInvoiceLineItemEntity.setDiscountType(DiscountType.FIXED);
	            invoiceLineItemMigrationService.persist(supplierInvoiceLineItemEntity);
	            if(recordData.get(BILLE_STATUS).equalsIgnoreCase(DRAFT))
	            {
	            	supplierInvoiceEntity.setStatus(CommonStatusEnum.PENDING.getValue());
	            }
	            else {
	            	supplierInvoiceEntity.setStatus(CommonStatusEnum.POST.getValue());
	            }
	            invoiceService.persist(supplierInvoiceEntity);
	        }
			Map<String,Object> map = new HashMap<>();
			map.put("status", CommonStatusEnum.POST.getValue());
			map.put("isMigratedRecord",1);
			map.put("type",1);
			List<Invoice> supplierInvoiceList = invoiceService.findByAttributes(map);
			if (!supplierInvoiceList.isEmpty()){
				for (Invoice supplierInvoice:supplierInvoiceList){
					Journal journal = invoiceRestHelper.invoicePosting(new PostingRequestModel(supplierInvoice.getId()),
							userId);
					journalService.persist(journal);
					if (supplierInvoice.getContact() != null) {
						if (supplierInvoice.getContact().getBillingEmail() != null && !supplierInvoice.getContact().getBillingEmail().isEmpty()
								|| supplierInvoice.getContact().getEmail() != null && !supplierInvoice.getContact().getEmail().isEmpty()) {
							invoiceRestHelper.send(supplierInvoice, userId,new PostingRequestModel(),request);
							invoiceService.persist(supplierInvoice);
						} else {
							log.info("Email Address For the Particular contact through which the invoice is created is not present{}", supplierInvoice.getContact());
						}
					}
				}
			}
	    }
	    
	    /**
	     * This method will handle Credit Note
	     * @param tables
	     * @param mapList
	     * @param userId
	     */
	    private void createCreditNote(List<Product.TableList.Table> tables, List<Map<String, String>> mapList,
	                                  Integer userId) {
	        Product.TableList.Table invoiceTable = tables.get(0);
	        Product.TableList.Table invoiceLineItemTable = tables.get(1);

	        SimpleAccountsService<Object, Object> invoiceLineItemMigrationService =
	                (SimpleAccountsService<Object, Object>) migrationUtil.getService(invoiceLineItemTable.getServiceName());

	        List<Product.TableList.Table.ColumnList.Column> invoiceTableColumnList = invoiceTable.getColumnList().getColumn();
	        List<Product.TableList.Table.ColumnList.Column> invoiceLineItemTableColumnList =
	                invoiceLineItemTable.getColumnList().getColumn();
	        for (Map<String, String> recordData : mapList){
	            Invoice creditNoteEntity = getExistingCreditNote(recordData,invoiceTable.getEntityName(),invoiceTableColumnList,
	                    userId);

	            InvoiceLineItem invoiceLineItemEntity = (InvoiceLineItem) migrationUtil.getObject(invoiceLineItemTable.getEntityName());
	            setColumnValue(invoiceLineItemTableColumnList, recordData, invoiceLineItemEntity);
	            migrationUtil.setDefaultSetterValues(invoiceLineItemEntity, userId);
	            invoiceLineItemEntity.setInvoice(creditNoteEntity);
	            com.simpleaccounts.entity.Product productEntity = getExistingProduct(recordData);
	            invoiceLineItemEntity.setProduct(productEntity);
	            invoiceLineItemMigrationService.persist(invoiceLineItemEntity);
	        }
	    }
	    
	    /**
	     * This method will handle the Purchase Order
	     * @param tables
	     * @param mapList
	     * @param userId
	     */
		private void createPurchaseOrder(List<Product.TableList.Table> tables, List<Map<String, String>> mapList,
				Integer userId) {
			Product.TableList.Table poQuotationTable = tables.get(0);
			Product.TableList.Table poQuotationLineItemTable = tables.get(1);
	
			SimpleAccountsService<Object, Object> poQuotationMigrationService =
			        (SimpleAccountsService<Object, Object>) migrationUtil.getService(poQuotationTable.getServiceName());
			SimpleAccountsService<Object, Object> poQuotationLineItemMigrationService = (SimpleAccountsService<Object, Object>) migrationUtil.getService(
					poQuotationLineItemTable.getServiceName());
	
			List<Product.TableList.Table.ColumnList.Column> invoiceTableColumnList = poQuotationTable.getColumnList()
					.getColumn();
			List<Product.TableList.Table.ColumnList.Column> invoiceLineItemTableColumnList = poQuotationLineItemTable
					.getColumnList().getColumn();
			for (Map<String, String> recordData : mapList) {
				PoQuatation poQuotationEntity = getExistingPoQuotation(recordData, poQuotationTable.getEntityName(),
						invoiceTableColumnList, userId);
				poQuotationMigrationService.persist(poQuotationEntity);
	
				Object poQuotationLineItemEntity = migrationUtil.getObject(poQuotationLineItemTable.getEntityName());
				setColumnValue(invoiceLineItemTableColumnList, recordData, poQuotationLineItemEntity);
				migrationUtil.setDefaultSetterValues(poQuotationLineItemEntity, userId);
				((PoQuatationLineItem) poQuotationLineItemEntity).setPoQuatation(poQuotationEntity);
				com.simpleaccounts.entity.Product productEntity = getExistingProduct(recordData);
				((PoQuatationLineItem) poQuotationLineItemEntity).setProduct(productEntity);
				poQuotationLineItemMigrationService.persist(poQuotationLineItemEntity);
			}
		}
		
	   	/**
	   	 * 
	   	 * @param record
	   	 * @param entityName
	   	 * @param invoiceTableColumnList
	   	 * @param userId
	   	 * @return
	   	 */
		public PoQuatation getExistingPoQuotation(Map<String, String> recordData, String entityName,
				List<Product.TableList.Table.ColumnList.Column> invoiceTableColumnList, Integer userId) {
			PoQuatation poQuotationEntity = (PoQuatation) migrationUtil.getObject(entityName);
			setColumnValue(invoiceTableColumnList, recordData, poQuotationEntity);
			migrationUtil.setDefaultSetterValues(poQuotationEntity, userId);
			poQuotationEntity.setIsMigratedRecord(Boolean.TRUE);
			return poQuotationEntity;
	}
	    
		/**
		 * This method will handle Expense
		 * @param tables
		 * @param mapList
		 * @param userId
		 */
		private void createExpense(List<Product.TableList.Table> tables, List<Map<String, String>> mapList, Integer userId) {
	        Product.TableList.Table expenseTable = tables.get(0);

	        List<Product.TableList.Table.ColumnList.Column> expenseTableColumnList = expenseTable.getColumnList().getColumn();
	        for (Map<String, String> recordData : mapList) {
	            getExistingExpense(recordData, expenseTable.getEntityName(), expenseTableColumnList, userId);

	        }

	    }
		
		/**
		 * This method will handle Vendors Contact
		 * @param tables
		 * @param mapList
		 * @param userId
		 */
		private void CreateVendorsContact(List<Product.TableList.Table> tables, List<Map<String, String>> mapList,
				Integer userId) {
			Product.TableList.Table contactTable = tables.get(0);
	
			List<Product.TableList.Table.ColumnList.Column> expenseTableColumnList = contactTable.getColumnList()
					.getColumn();
			for (Map<String, String> recordData : mapList) {
				getExistingContact(recordData, contactTable.getEntityName(), expenseTableColumnList, userId);
			}
		}
		
		/**
		 * This method will handle ExchangRate
		 * @param tables
		 * @param mapList
		 * @param userId
		 */
		private void createExchangeRate(List<Product.TableList.Table> tables, List<Map<String, String>> mapList,
				Integer userId) {
			Product.TableList.Table currencyConversionTable = tables.get(0);
	
			List<Product.TableList.Table.ColumnList.Column> currencyConversionTableColumnList = currencyConversionTable
					.getColumnList().getColumn();
	
			SimpleAccountsService<Object, Object> currencyConversionMigrationService =
			        (SimpleAccountsService<Object, Object>) migrationUtil.getService(currencyConversionTable.getServiceName());
			for (Map<String, String> recordData : mapList) {

				List<CurrencyConversion> currencyConversion = currencyExchangeService.getCurrencyConversionList();
				Object currencyConversionEntity = migrationUtil.getObject(currencyConversionTable.getEntityName());
	
				setColumnValue(currencyConversionTableColumnList, recordData, currencyConversionEntity);
				((CurrencyConversion) currencyConversionEntity)
						.setCurrencyCodeConvertedTo(currencyConversion.get(0).getCurrencyCodeConvertedTo());
				migrationUtil.setDefaultSetterValues(currencyConversionEntity, userId);
	
				System.out.println("currencyConversionEntity => " + currencyConversionEntity);
	
				currencyConversionMigrationService.persist(currencyConversionEntity);
	
			}
		}
		
		/**
		 * This method is used to persist data into ChartOfAccountCategory Table
		 * @param tables
		 * @param mapList
		 * @param userId
		 */
		private void createChartOfAccounts(List<Table> tables, List<Map<String, String>> mapList, Integer userId) {
	    	 Product.TableList.Table chartOfAccountCategoryTable = tables.get(0);
	         
	         List<Product.TableList.Table.ColumnList.Column> chartOfAccountCategoryTableColumnList = chartOfAccountCategoryTable.getColumnList().getColumn();
	         
	         SimpleAccountsService<Object, Object> chartOfAccountCategoryMigrationService =
	                 (SimpleAccountsService<Object, Object>) migrationUtil.getService(chartOfAccountCategoryTable.getServiceName());
	         for (Map<String, String> recordData : mapList) {	
	         	
	             
	             ChartOfAccountCategory  chartOfAccountCategoryEntity = (ChartOfAccountCategory) migrationUtil.getObject(chartOfAccountCategoryTable.getEntityName());
	             setColumnValue(chartOfAccountCategoryTableColumnList, recordData, chartOfAccountCategoryEntity);
	             migrationUtil.setDefaultSetterValues(chartOfAccountCategoryEntity, userId);
	             
	              log.info("chartOfAccountCategoryEntity => "+chartOfAccountCategoryEntity);
	              
	              chartOfAccountCategoryEntity.setChartOfAccountCategoryCode("-");
	              chartOfAccountCategoryEntity.setSelectFlag('N');
	              chartOfAccountCategoryEntity.setDefaltFlag('N');
	              chartOfAccountCategoryEntity.setDeleteFlag(false);
	             		
	             chartOfAccountCategoryMigrationService.persist(chartOfAccountCategoryEntity);

	         }
			
		}
		
	    private ProductLineItem addMissingFieldsForProductTypePurchase(com.simpleaccounts.entity.Product productEntity,
	                                                                   Map<String, String> recordData) {
	             String getColumnValue = recordData.get("Account");
	             TransactionCategory transactionCategory = migrationUtil.getTransactionCategory(getColumnValue);
	             String unitPrice = recordData.get("Rate");

	        BigDecimal bigDecimal = new BigDecimal(unitPrice);

	        Map<String, Object> param = new HashMap<>();
	        param.put("product", productEntity);
	        param.put("priceType", ProductPriceType.PURCHASE);
	        List<ProductLineItem> productLineItemList = productLineItemService.findByAttributes(param);
	        for (ProductLineItem productLineItem:productLineItemList){
	            productLineItem.setTransactioncategory(transactionCategory);
	            productLineItem.setUnitPrice(bigDecimal);
	            productLineItemService.persist(productLineItem);
	            return productLineItem;
	        }
	        return null;
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
		private ProductLineItem getExistingProductLineItemForSales(Map<String, String> recordData, String entityName,
				List<Product.TableList.Table.ColumnList.Column> productLineItemTableColumnList, Integer userId,
				Object productEntity) {
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
			setColumnValueForProductLineItemSales(productLineItemTableColumnList, recordData, productLineItem);
			migrationUtil.setDefaultSetterValues(productLineItem, userId);
			return productLineItem;
		}
		
		/**
		 * This method is use to get ExistingProduct
		 * @param record
		 * @return
		 */
		 private com.simpleaccounts.entity.Product getExistingProduct(Map<String, String> recordData) {
			        String productName =recordData.get("Item Name");

		        Map<String, Object> param = new HashMap<>();
		        param.put("productName", productName);

		        List<com.simpleaccounts.entity.Product> productList = productService.findByAttributes(param);
		        for (com.simpleaccounts.entity.Product product:productList){
		            return product;
		        }
		        return null;

		    }
		 
		 /**
			 * This method is use to get ExistingProductCode
			 * @param record
			 * @return
			 */
				 private com.simpleaccounts.entity.Product getExistingProductCode(Map<String, String> recordData) {
				        String productCode = recordData.get("Item ID");
				        Map<String, Object> param = new HashMap<>();
				        param.put("productCode", productCode);
				        List<com.simpleaccounts.entity.Product> productList = productService.findByAttributes(param);
				        for (com.simpleaccounts.entity.Product product:productList){
				            return product;
			        }
			        return null;
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
			private InvoiceLineItem getExistingInvoiceLineItem(Map<String, String> recordData, String entityName,
					List<Product.TableList.Table.ColumnList.Column> invoiceLineItemTableColumnList, Integer userId,
					Invoice invoiceEntity, com.simpleaccounts.entity.Product productEntity) {
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
				setColumnValueForInvoiceLineItem(invoiceLineItemTableColumnList, recordData, invoiceLineItem);
				migrationUtil.setDefaultSetterValues(invoiceLineItem, userId);
				return invoiceLineItem;
			}
		
		/*
		 * 
		 * 
		 */
			private Contact getExistingContact(Map<String, String> recordData, String entityName,
					List<Product.TableList.Table.ColumnList.Column> expenseTableColumnList, Integer userId) {
				Contact contact = null;
				contact = (Contact) migrationUtil.getObject(entityName);
				User user = userService.findByPK(userId);
				setColoumnValueForSupplierContact(expenseTableColumnList, recordData, contact, user);
				migrationUtil.setDefaultSetterValues(contact, userId);
				contact.setContactType(1);
				contact.setIsMigratedRecord(true);
				contact.setIsActive(true);
			
				//check whether the email id is coming 
				checkEmaiID(contact);
	
	        // Check existing entry in db
			boolean isContactExist = migrationUtil.contactExist(contact);
			if (isContactExist) {
				List<Contact> existContact = contactService.getAllContacts();
				for (Contact eContact : existContact) {
					if (eContact.getFirstName().equals(contact.getFirstName())
							&& eContact.getLastName().equals(contact.getLastName())) {
	
						eContact.setLastUpdatedBy(userId);
						eContact.setLastUpdateDate(LocalDateTime.now());
						eContact.setContactType(ContactTypeEnum.BOTH.getValue());
	
						Map<String, Object> bothMap = new HashMap<>();
						bothMap.put("contact", eContact.getContactId());
						List<ContactTransactionCategoryRelation> contactTransactionCategoryRelations = contactTransactionCategoryService
								.findByAttributes(bothMap);
						TransactionCategory contactCategoryReceivable = transactionCategoryService
								.findTransactionCategoryByTransactionCategoryCode(
										TransactionCategoryCodeEnum.ACCOUNT_RECEIVABLE.getCode());
						TransactionCategory contactCategoryPayable = transactionCategoryService
								.findTransactionCategoryByTransactionCategoryCode(
										TransactionCategoryCodeEnum.ACCOUNT_PAYABLE.getCode());
						boolean receivable = false;
						boolean payable = false;
	
						for (ContactTransactionCategoryRelation categoryRelation : contactTransactionCategoryRelations) {
							if (categoryRelation.getTransactionCategory() != null && categoryRelation
									.getTransactionCategory().getParentTransactionCategory().getTransactionCategoryCode()
									.equals(TransactionCategoryCodeEnum.ACCOUNT_RECEIVABLE.getCode())) {
								receivable = true;
							}
							if (categoryRelation.getTransactionCategory() != null && categoryRelation
									.getTransactionCategory().getParentTransactionCategory().getTransactionCategoryCode()
									.equals(TransactionCategoryCodeEnum.ACCOUNT_PAYABLE.getCode())) {
								payable = true;
							}
							if (categoryRelation.getTransactionCategory() != null) {
								updateTransactionCategory(categoryRelation.getTransactionCategory(), eContact);
							}
						}
						if (!receivable) {
							createTransactionCategory(contactCategoryReceivable, eContact);
						}
						if (!payable) {
							createTransactionCategory(contactCategoryPayable, eContact);
						}
						contactService.update(eContact);
					}
				}
			} else {
	            // Add New Contact for Vendor
				contactService.persist(contact);
				migrationUtil.createDependentEntities(contact, userId);
			}
			return contact;
		}
		
		
		
		/**
		 * This Method is used to get ExistingExpense
		 * @param record
		 * @param entityName
		 * @param expenseTableColumnList
		 * @param userId
		 * @return
		 */
			private Expense getExistingExpense(Map<String, String> recordData, String entityName,
					List<Product.TableList.Table.ColumnList.Column> expenseTableColumnList, Integer userId) {
				Expense expense = null;
				expense = (Expense) migrationUtil.getObject(entityName);
				User user = userService.findByPK(userId);
				setColumnValueForExpense(expenseTableColumnList, recordData, expense, user);
				migrationUtil.setDefaultSetterValues(expense, userId);
				expense.setUserId(user);
				expense.setPayee(user.getFirstName() + "" + user.getLastName());
				expense.setStatus(1);
			expenseService.persist(expense);
			return expense;
		}
	
		/**
		 * 
		 * @param expenseTableColumnList
		 * @param record
		 * @param expense
		 * @param user
		 */
			private void setColumnValueForExpense(List<Product.TableList.Table.ColumnList.Column> expenseTableColumnList,
					Map<String, String> recordData, Expense expense, User user) {
				for (Product.TableList.Table.ColumnList.Column column : expenseTableColumnList) {
					String val = recordData.get(column.getInputColumn());
					if (StringUtils.isEmpty(val))
						continue;
					String setterMethod = column.getSetterMethod();
					if (setterMethod.equalsIgnoreCase("setPayMode")) {
					PayMode payMode = PayMode.CASH;
					migrationUtil.setRecordIntoEntity(expense, setterMethod, payMode, "Object");
				} else if (setterMethod.equalsIgnoreCase("setPayee")) {
					migrationUtil.setRecordIntoEntity(expense, setterMethod, user.getFirstName() + "" + user.getLastName(), "String");
					} else if (setterMethod.equalsIgnoreCase("setCurrency")) {
						Currency currency = migrationUtil.getCurrencyIdByValue(val);
						migrationUtil.setRecordIntoEntity(expense, setterMethod, currency, "Object");
					} else if (setterMethod.equalsIgnoreCase("setTransactionCategory")) {
						TransactionCategory transactionCategory =
								migrationUtil.getTransactionCategoryByName(val, recordData);
						migrationUtil.setRecordIntoEntity(expense, setterMethod, transactionCategory, "Object");
					} else if (setterMethod.equalsIgnoreCase("setVatCategory")) {
						VatCategory vatCategory = migrationUtil.getVatCategoryByValue(val);
						migrationUtil.setRecordIntoEntity(expense, setterMethod, vatCategory, "Object");
				} else {
					migrationUtil.setRecordIntoEntity(expense, setterMethod, val, column.getDataType());
				}
			}
		}

			private void setColoumnValueForSupplierContact(
					List<Product.TableList.Table.ColumnList.Column> expenseTableColumnList,
					Map<String, String> recordData,
					Contact contact, User user) {
				
				for (Product.TableList.Table.ColumnList.Column column : expenseTableColumnList) {
					String val = recordData.get(column.getInputColumn());
					if (StringUtils.isEmpty(val))
						continue;
					String setterMethod = column.getSetterMethod();
					if (setterMethod.equalsIgnoreCase(SETTER_METHOD_SET_CURRENCY)) {
					Currency currency = migrationUtil.getCurrencyIdByValue(val);
					migrationUtil.setRecordIntoEntity(contact, setterMethod, currency, TYPE_OBJECT);
				} else if (setterMethod.equalsIgnoreCase("setCountry")) {
					Integer value = migrationUtil.getCountryIdByValue(val);
					Country country = countryService.findByPK(value);
					migrationUtil.setRecordIntoEntity(contact, setterMethod, country, "Object");
				} else if (setterMethod.equalsIgnoreCase("setState")) {
					Integer value = migrationUtil.getStateIdByInputColumnValue(val);
					State state = stateService.findByPK(value);
					migrationUtil.setRecordIntoEntity(contact, setterMethod, state, "Object");
				} else if (setterMethod.equalsIgnoreCase("setPlaceOfSupplyId")) {
					if (StringUtils.isEmpty(val))
						continue;
					PlaceOfSupply placeOfSupply = migrationUtil.getPlaceOfSupplyByValue(val);
					migrationUtil.setRecordIntoEntity(contact, setterMethod, placeOfSupply, "Object");
				}else if (setterMethod.equalsIgnoreCase("setTaxTreatment")) {
					if (StringUtils.isEmpty(val))
						continue;
					
					val = setTaxTreatmentValues(val);
					TaxTreatment taxTreatment = migrationUtil.getTaxTreatmentByValue(val);
					migrationUtil.setRecordIntoEntity(contact, setterMethod, taxTreatment, "Object");
				}else {
					// set into entity
					migrationUtil.setRecordIntoEntity(contact, setterMethod, val, column.getDataType());
				}
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
			private Invoice getExistingCreditNote(Map<String, String> recordData, String entityName,
					List<Product.TableList.Table.ColumnList.Column> invoiceTableColumnList, Integer userId) {
				Invoice invoice = null;
				String invoiceNumber = recordData.get("Invoice Number");
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
				setColumnValue(invoiceTableColumnList, recordData, invoice);
				migrationUtil.setDefaultSetterValues(invoice, userId);
				invoice.setType(7);
				invoiceService.persist(invoice);
				return invoice;
			
		}
		
		/**
		 * 
		 * @param record
		 * @param entityName
		 * @param invoiceTableColumnList
		 * @param userId
		 * @return
		 */
			private Invoice getExistingSupplierInvoice(Map<String, String> recordData, String entityName,
					List<Product.TableList.Table.ColumnList.Column> invoiceTableColumnList, Integer userId) {
				Invoice invoice = null;
				String invoiceNumber = recordData.get("Bill Number");
				Map<String, Object> param = new HashMap<>();
				param.put("referenceNumber", invoiceNumber);
				List<Invoice> invoiceList = invoiceService.findByAttributes(param);
			if (!invoiceList.isEmpty()) {
				return invoiceList.get(0);
				} else {
					invoice = (Invoice) migrationUtil.getObject(entityName);
				}
				setColumnValue(invoiceTableColumnList, recordData, invoice);
				migrationUtil.setDefaultSetterValues(invoice, userId);
				invoice.setType(1);
				invoice.setStatus(2);
			invoice.setIsMigratedRecord(true);
			invoiceService.persist(invoice);
			return invoice;
			
		}
		
			private Invoice getExistingInvoice(Map<String, String> recordData, String entityName,
					List<Product.TableList.Table.ColumnList.Column> invoiceTableColumnList, Integer userId) {
				Invoice invoice = null;
				String invoiceNumber = recordData.get("Invoice Number");
				Map<String, Object> param = new HashMap<>();
				param.put("referenceNumber", invoiceNumber);
				List<Invoice> invoiceList = invoiceService.findByAttributes(param);
			if (!invoiceList.isEmpty()) {
				return invoiceList.get(0);
				} else {
					invoice = (Invoice) migrationUtil.getObject(entityName);
				}
	 			setColumnValue(invoiceTableColumnList, recordData, invoice);

				migrationUtil.setDefaultSetterValues(invoice, userId);
				invoice.setType(2);

			invoice.setIsMigratedRecord(true);
			invoiceService.persist(invoice);
			return invoice;
		}
		
			private ProductLineItem getExistingProductLineItemForPurchase(Map<String, String> recordData, String entityName,
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
				setColumnValueForProductLineItemPurchase(
						productLineItemTableColumnList, recordData, productLineItem, lineItem);
				migrationUtil.setDefaultSetterValues(productLineItem, userId);
				return productLineItem;
			}
		
			private void setColumnValueForProductLineItemPurchase(
					List<Product.TableList.Table.ColumnList.Column> productLineItemTableColumnList,
					Map<String, String> recordData,
					ProductLineItem productLineItem, List<ProductLineItem> lineItem) {
				for (Product.TableList.Table.ColumnList.Column column : productLineItemTableColumnList) {
					String val = recordData.get(column.getInputColumn());
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
					String[] values = val.split(" ");
					migrationUtil.setRecordIntoEntity(productLineItem, setterMethod, values[1], "BigDecimal");
				} else {
					// set into entity
					migrationUtil.setRecordIntoEntity(productLineItem, setterMethod, val, column.getDataType());
				}
			}
		}
		
		/**
		 * 
		 * @param productLineItemTableColumnList
		 * @param record
		 * @param productLineItem
		 */
			private void setColumnValueForInvoiceLineItem(
					List<Product.TableList.Table.ColumnList.Column>invoiceLineItemTableColumnList,
					Map<String, String> recordData,
					InvoiceLineItem invoiceLineItem) {
				
			for (Product.TableList.Table.ColumnList.Column column : invoiceLineItemTableColumnList) {
				String val = recordData.get(column.getInputColumn());
				if (StringUtils.isEmpty(val))
					continue;
				String setterMethod = column.getSetterMethod();

			if (setterMethod.equalsIgnoreCase("setPlaceOfSupplyId")) {
				if (StringUtils.isEmpty(val))
					continue;
				PlaceOfSupply placeOfSupply = migrationUtil.getPlaceOfSupplyByValue(val);
				migrationUtil.setRecordIntoEntity(invoiceLineItem, setterMethod, placeOfSupply, "Object");
			} else if (setterMethod.equalsIgnoreCase("setVatCategory")) {
				VatCategory vatCategory = migrationUtil.getVatCategory(val);
				migrationUtil.setRecordIntoEntity(invoiceLineItem, setterMethod, vatCategory, "Object");
			} else if (setterMethod.equalsIgnoreCase("setTrnsactioncCategory")) {
				if (StringUtils.isEmpty(val))
					continue;
				if (invoiceLineItem instanceof InvoiceLineItem) {
					TransactionCategory transactionCategory = migrationUtil.getTransactionCategory(val);
					migrationUtil.setRecordIntoEntity(invoiceLineItem, "setTrnsactioncCategory", transactionCategory,
							"Object");
				}
				} else if (StringUtils.equalsIgnoreCase(setterMethod, "setUnitPrice")) {
					if (StringUtils.isEmpty(val))
						continue;
					migrationUtil.setRecordIntoEntity(invoiceLineItem, setterMethod, val, "BigDecimal");
				}
				else {
					// set into entity
					migrationUtil.setRecordIntoEntity(invoiceLineItem, setterMethod, val, column.getDataType());
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
					List<Product.TableList.Table.ColumnList.Column> productLineItemTableColumnList,
					Map<String, String> recordData,
					ProductLineItem productLineItem) {
				for (Product.TableList.Table.ColumnList.Column column : productLineItemTableColumnList) {
					String val = recordData.get(column.getInputColumn());
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
					String[] values = val.split(" ");
					migrationUtil.setRecordIntoEntity(productLineItem, setterMethod, values[1], "BigDecimal");
				} else {
					// set into entity
					migrationUtil.setRecordIntoEntity(productLineItem, setterMethod, val, column.getDataType());
				}
			}
		}
   
	    public void setColumnValue(List<Product.TableList.Table.ColumnList.Column> productTableColumnList, Map<String, String> recordData, Object productEntity) {
	        for (Product.TableList.Table.ColumnList.Column column : productTableColumnList) {
	            String val = recordData.get(column.getInputColumn());
	            String setterMethod = column.getSetterMethod();
            if (setterMethod.equalsIgnoreCase("setProductType")){
                if (StringUtils.isEmpty(val))
                    continue;
                ProductType value = migrationUtil.getProductType(val);
                migrationUtil.setRecordIntoEntity(productEntity, setterMethod, value, TYPE_OBJECT);
            }
            else if (setterMethod.equalsIgnoreCase("setVatCategory")){
                VatCategory vatCategory = migrationUtil.getVatCategoryByValue(val);
                migrationUtil.setRecordIntoEntity(productEntity,setterMethod,vatCategory,TYPE_OBJECT);
            }

	            else if(setterMethod.equalsIgnoreCase("setPriceType")){
	                if (StringUtils.isEmpty(val))
	                    continue;
	                ProductPriceType value = migrationUtil.getProductPriceType(val, recordData);
	                migrationUtil.setRecordIntoEntity(productEntity, setterMethod, value, TYPE_OBJECT);
	                if (productEntity instanceof ProductLineItem){
	                    if (StringUtils.isEmpty(val))
	                        continue;
                    TransactionCategory transactionCategory = migrationUtil.getTransactionCategory(val);
                    migrationUtil.setRecordIntoEntity(productEntity, "setTransactioncategory", transactionCategory, TYPE_OBJECT);
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
            else if (setterMethod.equalsIgnoreCase("setAvgPurchaseCost")){
                if (StringUtils.isEmpty(val))
					continue;
					if(val.trim().contains(" ")){
					String[] values = val.split(" ");
					migrationUtil.setRecordIntoEntity(productEntity, setterMethod, values[1], "BigDecimal");
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
            else if (StringUtils.equalsIgnoreCase(setterMethod,"setUnitPrice")){
                if (StringUtils.isEmpty(val))
                    continue;
                migrationUtil.setRecordIntoEntity(productEntity, setterMethod, val,"BigDecimal");
            }else if (setterMethod.equalsIgnoreCase(SETTER_METHOD_SET_CURRENCY) || setterMethod.equalsIgnoreCase(SETTER_METHOD_SET_CURRENCY_CODE)) {
                if (StringUtils.isEmpty(val))
                    continue;
                Currency currency = migrationUtil.getCurrencyIdByValue(val);

                                    migrationUtil.setRecordIntoEntity(productEntity, setterMethod, currency, TYPE_OBJECT);
            }
            else if (setterMethod.equalsIgnoreCase("setPlaceOfSupplyId")) {
				if (StringUtils.isEmpty(val))
					continue;
				PlaceOfSupply placeOfSupply = migrationUtil.getPlaceOfSupply(val);
				migrationUtil.setRecordIntoEntity(productEntity, setterMethod, placeOfSupply, "Object");
			}
            else {
                if (StringUtils.isEmpty(val))
                    continue;
                // set into entity
                migrationUtil.setRecordIntoEntity(productEntity, setterMethod, val, column.getDataType());
            }

        }
    }
    
    public String getDateFormat() {
        return "yyyy-MM-dd";
    }

    /**
     * Delete contact
     * @param id
     * @param userId
     */
	        private void deleteExistingContact(Integer id, Integer userId) {
	        	Contact contact = contactService.findByPK(id);
	        	if (contact == null) {
	        		return;
	        	}
	        	contact.setLastUpdatedBy(userId);

	        	Map<String, Object> transactionCategoryFilter = new HashMap<>();
	        	if (StringUtils.isNotBlank(contact.getOrganization())) {
	        		transactionCategoryFilter.put("transactionCategoryName", contact.getOrganization());
	        	} else {
	        		transactionCategoryFilter.put(
	        				"transactionCategoryName", contact.getFirstName() + " " + contact.getLastName());
	        	}
	        	List<TransactionCategory> transactionCategoryList =
	        			transactionCategoryService.findByAttributes(transactionCategoryFilter);

	        	Map<String, Object> filterMap = new HashMap<>();
	        	filterMap.put("contact", contact.getContactId());
	        	// delete Contact Transaction Category Relation
	        	List<ContactTransactionCategoryRelation> contactTransactionCategoryRelations =
	        			contactTransactionCategoryService.findByAttributes(filterMap);
	        	for (ContactTransactionCategoryRelation categoryRelation : contactTransactionCategoryRelations) {
	        		contactTransactionCategoryService.delete(categoryRelation);
	        	}

	        	contactService.delete(contact);
	        	for (TransactionCategory transactionCategory : transactionCategoryList) {
	        		transactionCategoryService.delete(transactionCategory);
	        	}
	        }
			
			private void updateTransactionCategory(TransactionCategory contactCategory,Contact contact) {
			if(contact.getOrganization() != null && !contact.getOrganization().isEmpty()){
				contactCategory.setTransactionCategoryName(contact.getOrganization());
			}else {
				contactCategory.setTransactionCategoryName(contact.getFirstName() + " " + contact.getLastName());
			}
			if(contact.getOrganization() != null && !contact.getOrganization().isEmpty()){
				contactCategory.setTransactionCategoryDescription(contact.getOrganization());
			}else {
				contactCategory.setTransactionCategoryDescription(contact.getFirstName() + " " + contact.getLastName());
			}
			contactCategory.setCreatedDate(LocalDateTime.now());
			contactCategory.setCreatedBy(contact.getCreatedBy());
			transactionCategoryService.update(contactCategory);
		}
		
		private void createTransactionCategory(TransactionCategory contactCategoryReceivable,Contact contact) {
			String transactionCategoryName = null;
			if(contact.getOrganization() != null && !contact.getOrganization().isEmpty()){
				transactionCategoryName = contact.getOrganization();
			}else {
				transactionCategoryName = contact.getFirstName() + " " + contact.getLastName();
			}
			contactService.persist(contact);
			TransactionCategory transactionCategory = getTransactionCategory(transactionCategoryName,transactionCategoryName,
					contact.getCreatedBy(),contactCategoryReceivable);
			ContactTransactionCategoryRelation contactTransactionCategoryRelation = new ContactTransactionCategoryRelation();
			contactTransactionCategoryRelation.setContact(contact);
			contactTransactionCategoryRelation.setTransactionCategory(transactionCategory);
			contactTransactionCategoryService.persist(contactTransactionCategoryRelation);
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
		
		
		/**
		 * This method is use to get the List TransactionCategory
		 * @return
		 */
			public TransactionCategoryListResponseModel getTransactionCategory() {
		
				TransactionCategoryListResponseModel transactionCategoryListResponseModel = new TransactionCategoryListResponseModel();
				String fileLocation = FileHelper.getRootPath();
				log.info("insideZohoMigration{}", fileLocation);
				List<String> notExistList = new ArrayList<>();
				List<TransactionCategoryModelForMigration> existList = new ArrayList<>();
				List<String> files = getFilesPresent(fileLocation);
				for (String file : files) {
					log.info("fileName== {}", file);
					List<String> tCategoryList = new ArrayList<>();
					List<Map<String, String>> mapList = migrationUtil
							.parseCSVFile(fileLocation + File.separator + file);
		
						Map<String, Object> attribute = new HashMap<>();
					attribute.put("deleteFlag", false);
	
				// get the list of transactionCategory record
				List<TransactionCategory> transactionCategoryList = transactionCategoryService.findByAttributes(attribute);
	
					// add the transactionCategoryName into List
					for (TransactionCategory transactionCategory : transactionCategoryList) {
						tCategoryList.add(transactionCategory.getTransactionCategoryName());
					}
				for (Map<String, String> mapRecord : mapList) {
					if (file.equals("Invoice.csv") || file.equals("Bill.csv") || file.equals("Item.csv")) {
						if (mapRecord.containsKey(ACCOUNT)) {
							Map<String, Object> map = new HashMap<>();
							map.put("transactionCategoryName", mapRecord.get(ACCOUNT));
							List<TransactionCategory> transactionCategorylist = transactionCategoryService
									.findByAttributes(map);
							TransactionCategoryModelForMigration transactionCategoryModelForMigration = new TransactionCategoryModelForMigration();
							if (!transactionCategorylist.isEmpty()) {
								for (TransactionCategory transactionCategory : transactionCategorylist) {
									if (transactionCategory != null) {
										transactionCategoryModelForMigration
												.setTransactionId(transactionCategory.getTransactionCategoryId());
										transactionCategoryModelForMigration
												.setAccountCode(transactionCategory.getTransactionCategoryCode());
										transactionCategoryModelForMigration
												.setTransactionName(transactionCategory.getTransactionCategoryName());
										transactionCategoryModelForMigration.setChartOfAccountName(
												transactionCategory.getChartOfAccount().getChartOfAccountName());
										transactionCategoryModelForMigration
												.setEditableFlag(transactionCategory.getEditableFlag());
									}
								}
							}
								if (tCategoryList.contains(mapRecord.get(ACCOUNT))) {
									log.info("tCategory is exist == {}", mapRecord.get(ACCOUNT));
									if (existList.contains(transactionCategoryModelForMigration)) {
										continue;
									} else {
										existList.add(transactionCategoryModelForMigration);
									}
								} else {
									log.info("tCategory is not exist == {}", mapRecord.get(ACCOUNT));
									if (notExistList.contains(mapRecord.get(ACCOUNT))) {
										continue;
									} else {
										notExistList.add(mapRecord.get(ACCOUNT));
								}
							}
						}
					}

					if (file.equals("Expense.csv")) {
						if (mapRecord.containsKey(EXPENSE_ACCOUNT)) {
							Map<String, Object> map = new HashMap<>();
							map.put("transactionCategoryName", mapRecord.get(EXPENSE_ACCOUNT));
							List<TransactionCategory> transactionCategories = transactionCategoryService
									.findByAttributes(map);
							TransactionCategoryModelForMigration transactionCategoryModelForMigration = new TransactionCategoryModelForMigration();
							if (!transactionCategories.isEmpty()) {
								for (TransactionCategory transactionCategory : transactionCategories) {
									if (transactionCategory != null) {
										transactionCategoryModelForMigration
												.setTransactionId(transactionCategory.getTransactionCategoryId());
										transactionCategoryModelForMigration
												.setTransactionName(transactionCategory.getTransactionCategoryName());
										transactionCategoryModelForMigration.setChartOfAccountName(
												transactionCategory.getChartOfAccount().getChartOfAccountName());
										transactionCategoryModelForMigration
												.setEditableFlag(transactionCategory.getEditableFlag());
									}
								}
							}
							if (mapRecord.containsKey(EXPENSE_ACCOUNT)) {
									if (tCategoryList.contains(mapRecord.get(EXPENSE_ACCOUNT))) {
										log.info("tCategory is exist == {}", mapRecord.get(EXPENSE_ACCOUNT));
										if (existList.contains(transactionCategoryModelForMigration)) {
											continue;
										} else {
											existList.add(transactionCategoryModelForMigration);
										}
									} else {
										log.info("tCategory is not exist == {}", mapRecord.get(EXPENSE_ACCOUNT));
										if (notExistList.contains(mapRecord.get(EXPENSE_ACCOUNT))) {
											continue;
										} else {
											notExistList.add(mapRecord.get(EXPENSE_ACCOUNT));
									}
								}
							}
						}
					}
				}
				transactionCategoryListResponseModel.setListOfExist(existList);
				transactionCategoryListResponseModel.setListOfNotExist(notExistList);
			}
			return transactionCategoryListResponseModel;
		}

		
		/**
		 * 
		 * @param fileName
		 * @return The List of Item data taht comes in Item.csv
		 */
		    public List<ItemModel> getCsvFileDataForItem(String fileLocation,String fileName)
		    {

				List<String> files = getFilesPresent(fileLocation);
				List<ItemModel> itemModelList = new ArrayList<>();
				for (String file : files) {
					List<Map<String, String>> mapList = migrationUtil.parseCSVFile(fileLocation + File.separator + file);
					
					for (Map<String, String> mapRecord : mapList) {
						if (file.equals(fileName)) {
						
							ItemModel itemModel = new ItemModel();
						
						itemModel.setItemID(mapRecord.get("Item ID"));
						itemModel.setItemName(mapRecord.get("Item Name"));
						itemModel.setDescription(mapRecord.get("Description"));
						itemModel.setRate(mapRecord.get("Rate"));
						itemModel.setProductType(mapRecord.get("Product Type"));
						itemModel.setAccount(mapRecord.get("Account"));
						itemModel.setTaxPercentage(mapRecord.get("Tax Percentage"));
						itemModel.setItemType(mapRecord.get("Item Type"));
						itemModel.setPurchaseAccount(mapRecord.get("Purchase Account"));
						itemModel.setStockOnHand(mapRecord.get("Stock On Hand"));
						itemModel.setPurchaseRate(mapRecord.get("Purchase Rate"));
						itemModel.setVendor(mapRecord.get("Vendor"));
						itemModel.setInventoryAccountCode(mapRecord.get("Inventory Account Code"));
						itemModel.setInitialStock(mapRecord.get("Initial Stock"));
						itemModel.setReorderPoint(mapRecord.get("Reorder Point"));
						
						itemModelList.add(itemModel);
						
					}
				}		
			}
			return itemModelList;
	    }
	    
	    /**
	     * 
	     * @param fileName
	     * @return
	     */
			public List<ContactsModel> getCsvFileDataForIContacts(String fileLocation,String fileName) {

				List<String> files = getFilesPresent(fileLocation);
				List<ContactsModel> contactsModelList = new ArrayList<>();
				for (String file : files) {
					List<Map<String, String>> mapList = migrationUtil.parseCSVFile(fileLocation + File.separator + file);
					
					for (Map<String, String> mapRecord : mapList) {
						if (file.equals(fileName)) {
					
						ContactsModel contactsModel = new ContactsModel();
						
						contactsModel.setLastModifiedTime(mapRecord.get("Last Modified Time"));
						contactsModel.setDisplayName(mapRecord.get("Display Name"));
						contactsModel.setCompanyName(mapRecord.get("Company Name"));
						contactsModel.setLastName(mapRecord.get("Last Name"));
						contactsModel.setEmailID(mapRecord.get("EmailID"));
						contactsModel.setMobilePhone(mapRecord.get("MobilePhone"));
						contactsModel.setPhone(mapRecord.get("Phone"));
						contactsModel.setBillingAddress(mapRecord.get("Billing Address"));
						contactsModel.setBillingStreet2(mapRecord.get("Billing Address"));
						contactsModel.setBillingCity(mapRecord.get("Billing City"));
						contactsModel.setBillingState(mapRecord.get("Billing State"));
						contactsModel.setBillingCountry(mapRecord.get("Billing Country"));
						contactsModel.setContactType(mapRecord.get("Contact Type"));
						contactsModel.setContactType(mapRecord.get("Currency Code"));
						contactsModel.setPlaceOfSupply(mapRecord.get("Place Of Supply"));
						
						contactsModelList.add(contactsModel);
						
						
					}
				}		
			}
			return contactsModelList;
		}
		
		
		
		 /**
	     * 
	     * @param fileName
	     * @return
	     */
			public List<VendorsModel> getCsvFileDataForIVendors(String fileLocation,String fileName) {

				List<String> files = getFilesPresent(fileLocation);
				List<VendorsModel> vendorsModelList = new ArrayList<>();
				for (String file : files) {
					List<Map<String, String>> mapList = migrationUtil.parseCSVFile(fileLocation + File.separator + file);
					
					for (Map<String, String> mapRecord : mapList) {
						if (file.equals(fileName)) {
					
						VendorsModel vendorsModel = new VendorsModel();
							
						vendorsModel.setLastModifiedTime(mapRecord.get("Last Modified Time"));
						vendorsModel.setDisplayName(mapRecord.get("Display Name"));
						vendorsModel.setCompanyName(mapRecord.get("Company Name"));
						vendorsModel.setLastName(mapRecord.get("Last Name"));
						vendorsModel.setEmailID(mapRecord.get("EmailID"));
						vendorsModel.setMobilePhone(mapRecord.get("MobilePhone"));
						vendorsModel.setPhone(mapRecord.get("Phone"));
						vendorsModel.setBillingAddress(mapRecord.get("Billing Address"));
						vendorsModel.setBillingStreet2(mapRecord.get("Billing Address"));
						vendorsModel.setBillingCity(mapRecord.get("Billing City"));
						vendorsModel.setBillingState(mapRecord.get("Billing State"));
						vendorsModel.setBillingCountry(mapRecord.get("Billing Country"));
						vendorsModel.setContactType(mapRecord.get("Contact Type"));
						vendorsModel.setContactType(mapRecord.get("Currency Code"));
						vendorsModel.setPlaceOfSupply(mapRecord.get("Place Of Supply"));
						
						vendorsModelList.add(vendorsModel);
						
						
					}
				}		
			}
			return vendorsModelList;
		}
		/**
		 * 
		 * @param fileName
		 * @return
		 */
			public List<InvoiceModel> getCsvFileDataForInvoice(String fileLocation,String fileName) {

				List<String> files = getFilesPresent(fileLocation);
				List<InvoiceModel> invoiceModelList = new ArrayList<>();
				for (String file : files) {
					List<Map<String, String>> mapList = migrationUtil.parseCSVFile(fileLocation + File.separator + file);
					
					for (Map<String, String> mapRecord : mapList) {
						if (file.equals(fileName)) {
					
						InvoiceModel invoiceModel = new InvoiceModel();
							
						invoiceModel.setInvoiceDate(mapRecord.get("Invoice Date"));
						invoiceModel.setInvoiceID(mapRecord.get("Invoice ID"));
						invoiceModel.setInvoiceNumber(mapRecord.get("Invoice Number"));
						invoiceModel.setDueDate(mapRecord.get("Due Date"));
						invoiceModel.setDiscount(mapRecord.get("Discount"));
						invoiceModel.setTotal(mapRecord.get("Total"));
						invoiceModel.setNotes(mapRecord.get("Notes"));
						invoiceModel.setCustomerName(mapRecord.get("Customer Name"));
						invoiceModel.setDiscountAmount(mapRecord.get("Discount Amount"));
						invoiceModel.setItemTaxAmount(mapRecord.get("Item Tax Amount"));
						invoiceModel.setBalance(mapRecord.get("Balance"));
						invoiceModel.setPaymentTermsLabel(mapRecord.get("Payment Terms Label"));
						invoiceModel.setInvoiceStatus(mapRecord.get("Invoice Status"));
						invoiceModel.setExchangeRate(mapRecord.get("Exchange Rate"));
						invoiceModel.setCurrencyCode(mapRecord.get("Currency Code"));
						invoiceModel.setItemDesc(mapRecord.get("Item Desc"));
						invoiceModel.setQuantity(mapRecord.get("Quantity"));
						invoiceModel.setSubTotal(mapRecord.get("SubTotal"));
						invoiceModel.setItemPrice(mapRecord.get("Item Price"));
						invoiceModel.setAccount(mapRecord.get("Account"));
						invoiceModel.setItemTax(mapRecord.get("Item Tax %"));
						invoiceModel.setItemName(mapRecord.get("Item Name"));
						
						invoiceModelList.add(invoiceModel);
						
						
					}
				}		
			}
			return invoiceModelList;
		}
		/**
		 * 
		 * @param fileName
		 * @return
		 */
			public List<BillModel> getCsvFileDataForBill(String fileLocation,String fileName) {

				List<String> files = getFilesPresent(fileLocation);
				List<BillModel> billModelList = new ArrayList<>();
				for (String file : files) {
					List<Map<String, String>> mapList = migrationUtil.parseCSVFile(fileLocation + File.separator + file);
					
					for (Map<String, String> mapRecord : mapList) {
						if (file.equals(fileName)) {
					
						BillModel billModel = new BillModel();
						billModel.setDate(mapRecord.get("Bill Date"));
						billModel.setId(mapRecord.get("Bill ID"));
						billModel.setBillNumber(mapRecord.get("Bill Number"));
						billModel.setStatus(mapRecord.get("Bill Status"));
						billModel.setDiscount(mapRecord.get("Discount"));
						billModel.setDiscountAmount(mapRecord.get("Discount Amount"));
						billModel.setTaxAmount(mapRecord.get("Tax Amount"));
						billModel.setBalance(mapRecord.get("Balance"));
						billModel.setVendorNotes(mapRecord.get("Vendor Notes"));
						billModel.setDueDate(mapRecord.get("Due Date"));
						billModel.setCurrencyCode(mapRecord.get("Currency Code"));
						billModel.setExchangeRate(mapRecord.get("Exchange Rate"));
						billModel.setDiscountType(mapRecord.get("Discount"));
						billModel.setPaymentTermsLabel(mapRecord.get("Payment Terms Label"));
						billModel.setDescription(mapRecord.get("Description"));
						billModel.setVendorName(mapRecord.get("Vendor Name"));
						billModel.setQuantity(mapRecord.get("Quantity"));
						billModel.setRate(mapRecord.get("Rate"));
						billModel.setSubTotal(mapRecord.get("SubTotal"));
						billModel.setTaxPercentage(mapRecord.get("Tax Percentage"));
						billModel.setAccount(mapRecord.get("Account"));
						
						billModelList.add(billModel);
					}
				}		
			}
			return billModelList;
		}
		/**
		 * 
		 * @param fileName
		 * @return
		 */
			public List<CreditNoteModel> getCsvFileDataForCreditNote(String fileLocation,String fileName) {

				List<String> files = getFilesPresent(fileLocation);
				List<CreditNoteModel> creditNoteModelList = new ArrayList<>();
				for (String file : files) {
					List<Map<String, String>> mapList = migrationUtil.parseCSVFile(fileLocation + File.separator + file);
					
					for (Map<String, String> mapRecord : mapList) {
						if (file.equals(fileName)) {
						CreditNoteModel creditNoteModel = new CreditNoteModel();
						
						creditNoteModel.setCreditNotesID(mapRecord.get("CreditNotes ID"));
						creditNoteModel.setCreditNoteDate(mapRecord.get("Credit Note Date"));
						creditNoteModel.setTax1ID(mapRecord.get("Tax1 ID"));
						creditNoteModel.setCreditNoteStatus(mapRecord.get("Credit Note Status"));
						creditNoteModel.setAppliedInvoiceNumber(mapRecord.get("Applied Invoice Number"));
						creditNoteModel.setDiscount(mapRecord.get("Discount"));
						creditNoteModel.setTotal(mapRecord.get("Total"));
						creditNoteModel.setExchangeRate(mapRecord.get("Exchange Rate"));
						creditNoteModel.setNotes(mapRecord.get("NOTES"));
						creditNoteModel.setDiscountAmount(mapRecord.get("Discount Amount"));
						creditNoteModel.setCreditNoteNumber(mapRecord.get("Credit Note Number"));
						creditNoteModel.setCurrencyCode(mapRecord.get("Currency Code"));
						creditNoteModel.setDiscountType(mapRecord.get("Discount Type"));
						creditNoteModel.setEntityDiscountPercent(mapRecord.get("Entity Discount Percent"));
						creditNoteModel.setBalance(mapRecord.get("Balance"));
						creditNoteModel.setCustomerName(mapRecord.get("Customer Name"));
						creditNoteModel.setItemDesc(mapRecord.get("Item Desc"));
						creditNoteModel.setQuantity(mapRecord.get("Quantity"));
						creditNoteModel.setItemPrice(mapRecord.get("Item Price"));
						creditNoteModel.setSubTotal(mapRecord.get("SubTotal"));
						creditNoteModel.setInvoiceNumber(mapRecord.get("Invoice Number"));
						creditNoteModel.setProductID(mapRecord.get("Product ID"));
						
						creditNoteModelList.add(creditNoteModel);
					}
				}		
			}
			return creditNoteModelList;
		}
		
		
		/**
		 * 
		 * @param fileName
		 * @return
		 */
			public List<ExpenseModel> getCsvFileDataForExpense(String fileLocation,String fileName) {

				List<String> files = getFilesPresent(fileLocation);
				List<ExpenseModel> ExpenseModelList = new ArrayList<>();
				for (String file : files) {
					List<Map<String, String>> mapList = migrationUtil.parseCSVFile(fileLocation + File.separator + file);
					
					for (Map<String, String> mapRecord : mapList) {
						if (file.equals(fileName)) {
						ExpenseModel expenseModel = new ExpenseModel();
						
						expenseModel.setExpenseDate(mapRecord.get("Expense Date"));
						expenseModel.setExpenseDescription(mapRecord.get("Expense Description"));
						expenseModel.setCurrencyCode(mapRecord.get("Currency Code"));
						expenseModel.setTaxAmount(mapRecord.get("Tax Amount"));
						expenseModel.setExpenseReferenceID(mapRecord.get("Expense Reference ID"));
						expenseModel.setExchangeRate(mapRecord.get("Exchange Rate"));
						expenseModel.setPaidThrough(mapRecord.get("Paid Through"));
						expenseModel.setTotal(mapRecord.get("Total"));
						
						ExpenseModelList.add(expenseModel);
					}
				}		
			}
			return ExpenseModelList;
		}
		
		/**
		 * 
		 * @param fileName
		 * @return
		 */
			public List<PurchaseOrderModel> getCsvFileDataForPurchaseOrder(String fileLocation,String fileName) {

				List<String> files = getFilesPresent(fileLocation);
				List<PurchaseOrderModel> purchaseOrderModellList = new ArrayList<>();
				for (String file : files) {
					List<Map<String, String>> mapList = migrationUtil.parseCSVFile(fileLocation + File.separator + file);
					
					for (Map<String, String> mapRecord : mapList) {
						if (file.equals(fileName)) {
						PurchaseOrderModel purchaseOrderModel = new PurchaseOrderModel();
						
						purchaseOrderModel.setReferenceNo(mapRecord.get("Reference No"));
						purchaseOrderModel.setItemTaxAmount(mapRecord.get("Item Tax Amount"));
						purchaseOrderModel.setTotal(mapRecord.get("Total"));
						purchaseOrderModel.setPurchaseOrderNumber(mapRecord.get("Purchase Order Number"));
						purchaseOrderModel.setPurchaseOrderStatus(mapRecord.get("Purchase Order Status"));
						purchaseOrderModel.setVendorName(mapRecord.get("Vendor Name"));
						purchaseOrderModel.setCurrencyCode(mapRecord.get("Currency Code"));
						purchaseOrderModel.setProductID(mapRecord.get("Product ID"));
						purchaseOrderModel.setItemDesc(mapRecord.get("Item Desc"));
						purchaseOrderModel.setQuantityOrdered(mapRecord.get("QuantityOrdered"));
						
						purchaseOrderModellList.add(purchaseOrderModel);
					}
				}		
			}
			return purchaseOrderModellList;
			
		}
		/**
		 * 
		 * @param fileName
		 * @return
		 */
			public List<ChartOfAccountsModel> ChartOfAccounts(String fileLocation,String fileName) {

				List<String> files = getFilesPresent(fileLocation);
				List<ChartOfAccountsModel> chartOfAccountsModelList = new ArrayList<>();
				for (String file : files) {
					List<Map<String, String>> mapList = migrationUtil.parseCSVFile(fileLocation + File.separator + file);
					
					for (Map<String, String> mapRecord : mapList) {
						if (file.equals(fileName)) {
						ChartOfAccountsModel chartOfAccountsModel = new ChartOfAccountsModel();
						
						chartOfAccountsModel.setAccountName(mapRecord.get("Account Name"));
						chartOfAccountsModel.setAccountCode(mapRecord.get("Account Code"));
						chartOfAccountsModel.setDescription(mapRecord.get("Description"));
						chartOfAccountsModel.setAccount(mapRecord.get("Account #"));
						
						chartOfAccountsModelList.add(chartOfAccountsModel);
					}
				}		
			}
			return chartOfAccountsModelList;
		}
		
		/**
		 * 
		 * @param fileName
		 * @return
		 */
			public List<ExchangeRateModel> getCsvFileDataForExchangeRate(String fileLocation,String fileName) {

				List<String> files = getFilesPresent(fileLocation);
				List<ExchangeRateModel> exchangeRateModelList = new ArrayList<>();
				for (String file : files) {
					List<Map<String, String>> mapList = migrationUtil.parseCSVFile(fileLocation + File.separator + file);
					
					for (Map<String, String> mapRecord : mapList) {
						if (file.equals(fileName)) {
						
						ExchangeRateModel exchangeRateModel = new ExchangeRateModel();
						
						exchangeRateModel.setCurrencyCode(mapRecord.get("Currency Code"));
						exchangeRateModel.setExchangeRate(mapRecord.get("Exchange Rate"));
						exchangeRateModel.setDate(mapRecord.get("date"));
						
						exchangeRateModelList.add(exchangeRateModel);
					}
				}		
			}
			return exchangeRateModelList;
		}

			public List<String> getUploadedFilesNames(String migrationPath) {
				List<String> fileNames = new ArrayList<>();

				File[] files = new File(migrationPath).listFiles();
				if (files == null) {
					return fileNames;
				}

				for (File file : files) {
					fileNames.add(file.getName());
				}
				return fileNames;
			}
		/**
		 * @param listOfFileNames
		 * @return
		 */
	    public List<DataMigrationRespModel> deleteFiles(String migrationPath,UploadedFilesDeletionReqModel listOfFileNames){
	        String fileLocation = migrationPath;
	        List<String> deletedFiles = new ArrayList<>();
	        List<String> remainingFiles = new ArrayList<>();
	        List<DataMigrationRespModel> resultList = new ArrayList<>();
	        File f = new File (fileLocation);
	        File[]  files = f.listFiles();
	        if (files == null) {
	        	return resultList;
	        }
			for (File file : files) {	
				remainingFiles.add(file.getName());
				for (String fileName : listOfFileNames.getFileNames()) {

					if (file.getName().equals(fileName)) {
						file.delete();
						deletedFiles.add(file.getName());
					}
				}
			}
			remainingFiles.removeAll(deletedFiles);
			// get the count of remaining files.
			getCountOfRemsiningFiles(fileLocation, remainingFiles, resultList);
			
        return resultList;
    }
    
        /**
         * 
         * @param fileLocation
         * @param remainingFiles
         * @param resultList
         */
		private void getCountOfRemsiningFiles(String fileLocation, List<String> remainingFiles,
				List<DataMigrationRespModel> resultList) {
			for(String  remFileData :remainingFiles)
			{
				DataMigrationRespModel dataMigrationRespModel = new DataMigrationRespModel();
				
				try {
					long recordCount;
					Path path = Paths.get(fileLocation, remFileData);
					try (java.util.stream.Stream<String> lines = Files.lines(path)) {
						recordCount = lines.count() - 1;
					}
					dataMigrationRespModel.setRecordCount(recordCount);
					dataMigrationRespModel.setFileName(remFileData);
				} catch (IOException e) {	
					LOG.error("Error during Zoho migration", e);
				}
				
				resultList.add(dataMigrationRespModel);
			}
		}
			public String rollBackMigratedData(String migrationPath){
	            File f = new File (migrationPath);
	            File[]  files = f.listFiles();
	            if (files == null) {
	            	return "Migrated Data Deleted Successfully";
	            }
	            for (File file:files){
	                file.delete();
	            }
			    return "Migrated Data Deleted Successfully";
	        }
		
		
		
 /************************************************************************* MIGRATION SUMMARY ***************************************************************************/
		
		public List<DataMigrationRespModel> getMigrationSummary(String fileLocation, Integer userId, String migFromDate)
				throws IOException {
			List<DataMigrationRespModel> list = new ArrayList<>();
			log.info("getSummaryFileLocation {} userId {}", fileLocation, userId);
		List<String> files = getFilesPresent(fileLocation);
		for (String file : files) {
			List<Map<String, String>> mapList = migrationUtil.parseCSVFile(fileLocation + File.separator + file);

				List<Map<String, String>> itemsToRemove = new ArrayList<>();

			for (Map<String, String> mapRecord : mapList) {

				if (mapRecord.containsKey(INVOICE_DATE)) {
					Integer result = migrationUtil.compareDate(mapRecord.get(INVOICE_DATE), migFromDate);
					if (result != null) {
						itemsToRemove = migrationUtil.filterMapRecord(mapList, mapRecord, result, itemsToRemove);
					}

				}

				if (mapRecord.containsKey(BILL_DATE)) {
					Integer result = migrationUtil.compareDate(mapRecord.get(BILL_DATE), migFromDate);
					itemsToRemove = migrationUtil.filterMapRecord(mapList, mapRecord, result, itemsToRemove);
				}

				if (mapRecord.containsKey(DATE)) {
					Integer result = migrationUtil.compareDate(mapRecord.get(DATE), migFromDate);
					itemsToRemove = migrationUtil.filterMapRecord(mapList, mapRecord, result, itemsToRemove);
				}

				if (mapRecord.containsKey(EXPENSE_DATE)) {
					Integer result = migrationUtil.compareDate(mapRecord.get(EXPENSE_DATE), migFromDate);
					itemsToRemove = migrationUtil.filterMapRecord(mapList, mapRecord, result, itemsToRemove);
				}

				if (mapRecord.containsKey(PURCHASE_ORDER_DATE)) {
					Integer result = migrationUtil.compareDate(mapRecord.get(PURCHASE_ORDER_DATE), migFromDate);
					itemsToRemove = migrationUtil.filterMapRecord(mapList, mapRecord, result, itemsToRemove);
				}
			}
			mapList.removeAll(itemsToRemove);

			DataMigrationRespModel dataMigrationRespModel = new DataMigrationRespModel();
			Company company = companyService.getCompany();
				dataMigrationRespModel.setMigrationBeginningDate(company.getAccountStartDate().toString());
				dataMigrationRespModel.setExecutionDate(LocalDateTime.now().toString());
				dataMigrationRespModel.setFileName(file);
				long recordCount = 0;
				Path recordCountPath = Paths.get(fileLocation, file);
				try (Stream<String> lines = Files.lines(recordCountPath)) {
					recordCount = lines.count() - 1;
				} catch (IOException e) {
					LOG.error("Failed to count records for file {}", file, e);
				}
				dataMigrationRespModel.setRecordCount(recordCount);
			dataMigrationRespModel.setRecordsMigrated((long) mapList.size());
			dataMigrationRespModel.setRecordsRemoved((long) itemsToRemove.size());
			list.add(dataMigrationRespModel);

		}
		return list;
	}		
	
	// Delete Files from uploaded folder.
		public String deleteMigratedFiles(String migrationPath){
	        File f = new File (migrationPath);
	        File[]  files = f.listFiles();
	        if (files == null) {
	        	return "Migrated Data Deleted Successfully";
	        }
	        for (File file:files){
	            file.delete();
	        }
		    return "Migrated Data Deleted Successfully";
	    }
	
		public void setColoumnValueForInvoice(
				List<Product.TableList.Table.ColumnList.Column> invoiceTableColumnList,
				Map<String, String> recordData,
				Invoice invoice) {
			
			for (Product.TableList.Table.ColumnList.Column column : invoiceTableColumnList) {
				String val = recordData.get(column.getInputColumn());
				String setterMethod = column.getSetterMethod();
				if (StringUtils.isEmpty(val))
					continue;
	           if (setterMethod.equalsIgnoreCase("setVatCategory")){
	                VatCategory vatCategory = migrationUtil.getVatCategory(val);
	                migrationUtil.setRecordIntoEntity(invoice,setterMethod,vatCategory,"Object");
	            }
	            else if (setterMethod.equalsIgnoreCase("setContact")) {
	                if (StringUtils.isEmpty(val))
	                    continue;
	            Contact value = migrationUtil.getContactByValue(val);
	            migrationUtil.setRecordIntoEntity(invoice, setterMethod, value, "Object");
	           }
	            else if (setterMethod.equalsIgnoreCase("setInvoiceDuePeriod")){
	                if (StringUtils.isEmpty(val))
	                    continue;
	                InvoiceDuePeriodEnum value = migrationUtil.getInvoiceDuePeriod(val);
	                migrationUtil.setRecordIntoEntity(invoice,setterMethod,value,"Object");
	            }
	            else if (setterMethod.equalsIgnoreCase("setTrnsactioncCategory")){
	                if (StringUtils.isEmpty(val))
	                    continue;

	                    TransactionCategory transactionCategory = migrationUtil.getTransactionCategory(val);
	                    migrationUtil.setRecordIntoEntity(invoice, "setTrnsactioncCategory", transactionCategory, "Object");

	            }
	           
	            else if (StringUtils.equalsIgnoreCase(setterMethod,"setInvoiceLineItemUnitPrice")){
	                if (StringUtils.isEmpty(val))
	                    continue;
	                migrationUtil.setRecordIntoEntity(invoice,"setUnitPrice",val,"BigDecimal");
	            }
	            else if (setterMethod.equalsIgnoreCase(SETTER_METHOD_SET_CURRENCY) || setterMethod.equalsIgnoreCase(SETTER_METHOD_SET_CURRENCY_CODE)) {
	                if (StringUtils.isEmpty(val))
	                    continue;
	                Currency currency = migrationUtil.getCurrencyIdByValue(val);
	                migrationUtil.setRecordIntoEntity(invoice, setterMethod, currency, "Object");
	            }
	            else if (setterMethod.equalsIgnoreCase("setPlaceOfSupplyId")) {
					if (StringUtils.isEmpty(val))
						continue;
					PlaceOfSupply placeOfSupply = migrationUtil.getPlaceOfSupply(val);
					migrationUtil.setRecordIntoEntity(invoice, setterMethod, placeOfSupply, "Object");
				}
	            else {
	                if (StringUtils.isEmpty(val))
	                    continue;
	                // set into entity
	                migrationUtil.setRecordIntoEntity(invoice, setterMethod, val, column.getDataType());
	            }
		}
	}
}
