package com.simplevat.service.migrationservices;

import static com.simplevat.service.migrationservices.ZohoMigrationConstants.ACCOUNT;
import static com.simplevat.service.migrationservices.ZohoMigrationConstants.BILL;
import static com.simplevat.service.migrationservices.ZohoMigrationConstants.BILLE_STATUS;
import static com.simplevat.service.migrationservices.ZohoMigrationConstants.BILL_DATE;
import static com.simplevat.service.migrationservices.ZohoMigrationConstants.CHART_OF_ACCOUNTS;
import static com.simplevat.service.migrationservices.ZohoMigrationConstants.CONTACTS;
import static com.simplevat.service.migrationservices.ZohoMigrationConstants.CREDIT_NOTE;
import static com.simplevat.service.migrationservices.ZohoMigrationConstants.DATE;
import static com.simplevat.service.migrationservices.ZohoMigrationConstants.DRAFT;
import static com.simplevat.service.migrationservices.ZohoMigrationConstants.EXCHANGE_RATE;
import static com.simplevat.service.migrationservices.ZohoMigrationConstants.EXPENSE;
import static com.simplevat.service.migrationservices.ZohoMigrationConstants.EXPENSE_ACCOUNT;
import static com.simplevat.service.migrationservices.ZohoMigrationConstants.EXPENSE_DATE;
import static com.simplevat.service.migrationservices.ZohoMigrationConstants.INVOICE;
import static com.simplevat.service.migrationservices.ZohoMigrationConstants.INVOICE_DATE;
import static com.simplevat.service.migrationservices.ZohoMigrationConstants.INVOICE_STATUS;
import static com.simplevat.service.migrationservices.ZohoMigrationConstants.ITEM;
import static com.simplevat.service.migrationservices.ZohoMigrationConstants.PURCHASE_ACCOUNT;
import static com.simplevat.service.migrationservices.ZohoMigrationConstants.PURCHASE_ORDER_DATE;
import static com.simplevat.service.migrationservices.ZohoMigrationConstants.VENDORS;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.simplevat.constant.ContactTypeEnum;
import com.simplevat.constant.DefaultTypeConstant;
import com.simplevat.constant.DiscountType;
import com.simplevat.constant.InvoiceDuePeriodEnum;
import com.simplevat.constant.CommonStatusEnum;
import com.simplevat.constant.PayMode;
import com.simplevat.constant.ProductPriceType;
import com.simplevat.constant.ProductType;
import com.simplevat.constant.TransactionCategoryCodeEnum;
import com.simplevat.entity.ChartOfAccountCategory;
import com.simplevat.entity.Company;
import com.simplevat.entity.Contact;
import com.simplevat.entity.ContactTransactionCategoryRelation;
import com.simplevat.entity.Country;
import com.simplevat.entity.Currency;
import com.simplevat.entity.CurrencyConversion;
import com.simplevat.entity.Expense;
import com.simplevat.entity.Inventory;
import com.simplevat.entity.Invoice;
import com.simplevat.entity.InvoiceLineItem;
import com.simplevat.entity.Journal;
import com.simplevat.entity.PlaceOfSupply;
import com.simplevat.entity.ProductLineItem;
import com.simplevat.entity.State;
import com.simplevat.entity.TaxTreatment;
import com.simplevat.entity.User;
import com.simplevat.entity.VatCategory;
import com.simplevat.entity.bankaccount.TransactionCategory;
import com.simplevat.migration.ProductMigrationParser;
import com.simplevat.migration.xml.bindings.product.Product;
import com.simplevat.migration.xml.bindings.product.Product.TableList.Table;
import com.simplevat.migration.xml.bindings.product.Product.TableList.Table.ColumnList.Column;
import com.simplevat.rest.PostingRequestModel;
import com.simplevat.rest.invoicecontroller.InvoiceRestHelper;
import com.simplevat.rest.migration.model.BillModel;
import com.simplevat.rest.migration.model.ChartOfAccountsModel;
import com.simplevat.rest.migration.model.ContactsModel;
import com.simplevat.rest.migration.model.CreditNoteModel;
import com.simplevat.rest.migration.model.ExchangeRateModel;
import com.simplevat.rest.migration.model.ExpenseModel;
import com.simplevat.rest.migration.model.InvoiceModel;
import com.simplevat.rest.migration.model.ItemModel;
import com.simplevat.rest.migration.model.PurchaseOrderModel;
import com.simplevat.rest.migration.model.UploadedFilesDeletionReqModel;
import com.simplevat.rest.migration.model.VendorsModel;
import com.simplevat.rest.migrationcontroller.DataMigrationRespModel;
import com.simplevat.rest.migrationcontroller.TransactionCategoryListResponseModel;
import com.simplevat.rest.migrationcontroller.TransactionCategoryModelForMigration;
import com.simplevat.rfq_po.PoQuatation;
import com.simplevat.rfq_po.PoQuatationLineItem;
import com.simplevat.service.CompanyService;
import com.simplevat.service.ContactService;
import com.simplevat.service.ContactTransactionCategoryService;
import com.simplevat.service.CountryService;
import com.simplevat.service.CurrencyExchangeService;
import com.simplevat.service.CurrencyService;
import com.simplevat.service.ExpenseService;
import com.simplevat.service.InvoiceLineItemService;
import com.simplevat.service.InvoiceService;
import com.simplevat.service.JournalService;
import com.simplevat.service.ProductLineItemService;
import com.simplevat.service.ProductService;
import com.simplevat.service.SimpleVatService;
import com.simplevat.service.StateService;
import com.simplevat.service.TransactionCategoryService;
import com.simplevat.service.UserService;
import com.simplevat.service.VatCategoryService;
import com.simplevat.utils.FileHelper;

import lombok.extern.slf4j.Slf4j;


@Component
@Slf4j
public class ZohoMigrationService {
	
    private final Logger LOG = LoggerFactory.getLogger(ZohoMigrationService.class);
	
    @Autowired
    private TransactionCategoryService transactionCategoryService;

    @Autowired
    private InvoiceService invoiceService;
    
    @Autowired
    private InvoiceLineItemService invoiceLineItemService;

    @Autowired
    private ContactService contactService;

    @Autowired
    private ProductService productService;

    @Autowired
    private CurrencyService currencyService;

    @Autowired
    private VatCategoryService vatCategoryService;

    @Autowired
    private InvoiceRestHelper invoiceRestHelper;

    @Autowired
    private JournalService journalService;

    @Autowired
    private ProductLineItemService productLineItemService;

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private UserService userService;
    
    @Autowired
    private CurrencyExchangeService currencyExchangeService;
    
    @Autowired
	private  ContactTransactionCategoryService contactTransactionCategoryService;
    
    @Autowired
    private String basePath;
    
    @Autowired
    private MigrationUtil migrationUtil; 
    
    @Autowired
    private CompanyService companyService;
    
    @Autowired
    private CountryService countryService;

    @Autowired
    private StateService stateService;

    
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
        	for (Object file : files) {
        		List<Map<String, String>> mapList = migrationUtil.parseCSVFile((String) fileLocation + File.separator + file);
        		List<Map<String, String>> itemsToRemove = new ArrayList<Map<String, String>>();
        		for (Map<String, String> mapRecord : mapList) {
        			
        			// for Invoice
        			if (mapRecord.containsKey(INVOICE_DATE)) {
        				Integer result = migrationUtil.compareDate(mapRecord.get(INVOICE_DATE), migFromDate);
        				if (result!=null) {
        					itemsToRemove = migrationUtil.filterMapRecord(mapList, mapRecord, result, itemsToRemove);
        				}
        			}
        			
        			// for Bill
        			if (mapRecord.containsKey(BILL_DATE)) {
        				Integer result = migrationUtil.compareDate(mapRecord.get(BILL_DATE), migFromDate);
        				if (result!=null) {
        					itemsToRemove = migrationUtil.filterMapRecord(mapList, mapRecord, result, itemsToRemove);
        				}
        			}
        			
        			// for Exchange Rate
        			if (mapRecord.containsKey(DATE)) {
        				Integer result = migrationUtil.compareDate(mapRecord.get(DATE), migFromDate);
        				if (result!=null) {
        					itemsToRemove = migrationUtil.filterMapRecord(mapList, mapRecord, result, itemsToRemove);
        				}
        			}
        			
        			// for Expense Date
        			if (mapRecord.containsKey(EXPENSE_DATE)) {
        				Integer result = migrationUtil.compareDate(mapRecord.get(EXPENSE_DATE), migFromDate);
        				if (result!=null) {
        					itemsToRemove = migrationUtil.filterMapRecord(mapList, mapRecord, result, itemsToRemove);
        				}
        			}
        			
        			// for Purchase Order Date
        			if (mapRecord.containsKey(PURCHASE_ORDER_DATE)) {
        				Integer result = migrationUtil.compareDate(mapRecord.get(PURCHASE_ORDER_DATE), migFromDate);
        				if (result!=null) {
        					itemsToRemove = migrationUtil.filterMapRecord(mapList, mapRecord, result, itemsToRemove);
        				}
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
        		dataMigrationRespModel.setRecordCount((Files.lines(Paths.get(fileLocation.toString() + "/" + file.toString())).count()) - 1);
        		dataMigrationRespModel.setRecordsMigrated((long) mapList.size());
        		dataMigrationRespModel.setRecordsRemoved((long) itemsToRemove.size());
        		list.add(dataMigrationRespModel);
        		if (isSpecialHandlingNeeded(productName, file.toString())) {
        			handleProductSpecificTables(tables, mapList, userId, request);
        			continue;
        		}
        		if(tables != null) 
				{
					LOG.info("processTheMigratedData tables ==>{} ", tables);
					for (Product.TableList.Table table : tables) {
						// get service Object
						SimpleVatService service = (SimpleVatService) migrationUtil.getService(table.getServiceName());
						List<Product.TableList.Table.ColumnList.Column> columnList = table.getColumnList().getColumn();
						// csv records
						for (Map<String, String> record : mapList) {
							Object entity = migrationUtil.getObject(table.getEntityName());
							// iterate over all the columns and crate record and persist object to database
							for (Product.TableList.Table.ColumnList.Column column : columnList) {
								String val = record.get(column.getInputColumn());
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
								} else if (setterMethod.equalsIgnoreCase("setTaxTreatment")) {
										if (StringUtils.isEmpty(val))
											continue;
										val = setTaxTreatmentValues(val);
										TaxTreatment taxTreatment = migrationUtil.getTaxTreatmentByValue(val);
										migrationUtil.setRecordIntoEntity(entity, setterMethod, taxTreatment, "Object");
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
	    	
	    	/*if(entity.getVatRegistrationNumber() == null)
	    	{
	    		entity.setVatRegistrationNumber("00");
	    	}*/
		
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

	        SimpleVatService productService = (SimpleVatService) migrationUtil.getService(productTable.getServiceName());
	        SimpleVatService productLineItemService = (SimpleVatService) migrationUtil.getService(productLineItemTable.getServiceName());
	        SimpleVatService inventoryService = (SimpleVatService) migrationUtil.getService(inventoryTable.getServiceName());

	        List<Product.TableList.Table.ColumnList.Column> productTableColumnList = productTable.getColumnList().getColumn();
	        List<Product.TableList.Table.ColumnList.Column> productLineItemTableColumnList = productLineItemTable.getColumnList().getColumn();
	        List<Product.TableList.Table.ColumnList.Column> inventoryTableColumnList = inventoryTable.getColumnList().getColumn();
	        // csv records
	        if(mapList != null) {
	        	for (Map<String, String> record : mapList){
	        		
	        		Boolean isProductExist = checkExistingProduct(record);
	        		if(!isProductExist)
	        		{
	        			Object productEntity = migrationUtil.getObject(productTable.getEntityName());
	        			setColumnValue(productTableColumnList, record, productEntity);
	        			Boolean isInventoryEnabled = migrationUtil.checkInventoryEnabled(record);
	        			((com.simplevat.entity.Product) productEntity).setIsInventoryEnabled(isInventoryEnabled);
	        			((com.simplevat.entity.Product) productEntity).setIsMigratedRecord(true);
	        			((com.simplevat.entity.Product) productEntity).setIsActive(true);
	        			((com.simplevat.entity.Product) productEntity).setExciseType(Boolean.FALSE);
	        			((com.simplevat.entity.Product) productEntity).setExciseAmount(BigDecimal.ZERO);
	        			
	        			migrationUtil.setDefaultSetterValues(productEntity, userId);
	        			productService.persist(productEntity);
	        			
	        			List<ProductLineItem> lineItem = new ArrayList<>();
	        			ProductLineItem productLineItemEntitySales = null;
	        			ProductLineItem productLineItemEntityPurchase = null;
	        			// Object productLineItemEntitySales = getObject(productLineItemTable.getEntityName());
	        			// Object productLineItemEntityPurchase = getObject(productLineItemTable.getEntityName());
	        			String itemType = record.get("Item Type");
	        			if (itemType.equalsIgnoreCase("Inventory")||itemType.equalsIgnoreCase("Sales")||
	        					itemType.equalsIgnoreCase("Sales and Purchases")){
	        				productLineItemEntitySales = getExistingProductLineItemForSales(record,productLineItemTable.
	        						getEntityName(),productLineItemTableColumnList,userId,productEntity,lineItem);
	        				// setColumnValue(productLineItemTableColumnList, record, productLineItemEntitySales);
	        				//setColumnValue(productLineItemTableColumnList, record, productLineItemEntityPurchase);
	        				((ProductLineItem) productLineItemEntitySales).setProduct((com.simplevat.entity.Product) productEntity);
	        				((ProductLineItem) productLineItemEntitySales).setIsMigratedRecord(true);
	        				productLineItemService.persist(productLineItemEntitySales);
	        				lineItem.add(productLineItemEntitySales);
	        				
	        			}
	        			if (itemType.equalsIgnoreCase("Inventory")||itemType.equalsIgnoreCase("Purchases")||
	        					itemType.equalsIgnoreCase("Sales and Purchases")) {
	        				productLineItemEntityPurchase = getExistingProductLineItemForPurchase(record, productLineItemTable.
	        						getEntityName(), productLineItemTableColumnList, userId, productEntity,lineItem);
	        				((ProductLineItem) productLineItemEntityPurchase).setProduct((com.simplevat.entity.Product) productEntity);
	        				((ProductLineItem) productLineItemEntityPurchase).setIsMigratedRecord(true);
	        				productLineItemService.persist(productLineItemEntityPurchase);
	        				// setDefaultSetterValues(productLineItemEntitySales, userId);
	        				// setDefaultSetterValues(productLineItemEntityPurchase, userId);
	        				lineItem.add(productLineItemEntityPurchase);
	        			}
	        			productService.persist(productEntity);
	        			((com.simplevat.entity.Product) productEntity).setLineItemList(lineItem);
	        			if (isInventoryEnabled){
	        				Object inventoryEntity = migrationUtil.getObject(inventoryTable.getEntityName());
	        				setColumnValue(inventoryTableColumnList , record ,inventoryEntity);
	        				((Inventory) inventoryEntity).setProductId((com.simplevat.entity.Product) productEntity);
	        				Float unitCost =   ((ProductLineItem) productLineItemEntityPurchase).getUnitPrice().floatValue();
	        				Float unitSellingPrice = ((ProductLineItem) productLineItemEntitySales).getUnitPrice().floatValue();
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
	        				inventoryService.persist(inventoryEntity);
	        				
	        			}
	        		}
	        		else {
	        			LOG.info("Product Allready Present");
	        			LOG.info("Product Exist ==> {} ",record.get("Item Name"));
	        		}
	        		
	        	}
	        	
	        }
	        }

	    /**
	     * 
	     * @param record
	     * @return flag
	     */
		private Boolean checkExistingProduct(Map<String, String> record) {
			Boolean flag;
			com.simplevat.entity.Product productList = getExistingProduct(record);
			com.simplevat.entity.Product productListCode = getExistingProductCode(record);
			
			LOG.info("productList ==> {} ",productList);
     
			 if(productList != null || productListCode != null) {
				// LOG.info("Product Name Exist ==> {} ",productList.getProductName());
				 LOG.info("Product Name Exist ==> {} ",productList.getProductName()+" "+productList.getProductCode());
				 flag = true;
				 
			 }else {
				 LOG.info("Product Not Exist ==> {} ",record.get("Item Name")); 
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

	     //  SimpleVatService invoiceService = (SimpleVatService) getService(invoiceTable.getServiceName());
	        SimpleVatService invoiceLineItemService = (SimpleVatService) migrationUtil.getService(invoiceLineItemTable.getServiceName());

	        List<Product.TableList.Table.ColumnList.Column> invoiceTableColumnList = invoiceTable.getColumnList().getColumn();
	        List<Product.TableList.Table.ColumnList.Column> invoiceLineItemTableColumnList = invoiceLineItemTable.getColumnList().getColumn();
	        if(mapList != null) {
	        	for (Map<String, String> record : mapList){
	        		Invoice invoiceEntity = getExistingInvoice(record,invoiceTable.getEntityName(),invoiceTableColumnList,userId);
	        		com.simplevat.entity.Product productEntity = getExistingProduct(record);
	        		InvoiceLineItem invoiceLineItemEntity = getExistingInvoiceLineItem(record,invoiceLineItemTable.getEntityName(),
	        				invoiceLineItemTableColumnList,userId,invoiceEntity,productEntity);
	        		((InvoiceLineItem) invoiceLineItemEntity).setInvoice((com.simplevat.entity.Invoice) invoiceEntity);
	        		((InvoiceLineItem) invoiceLineItemEntity).setIsMigratedRecord(true);
	        		((InvoiceLineItem) invoiceLineItemEntity).setProduct(productEntity);
	        		((InvoiceLineItem) invoiceLineItemEntity).setDiscountType(DiscountType.FIXED);
	        		invoiceLineItemService.persist(invoiceLineItemEntity);
//	            Journal journal = invoiceRestHelper.invoicePosting(new PostingRequestModel(invoiceEntity.getId()), userId);
//	            journalService.persist(journal);
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

	       // SimpleVatService invoiceService = (SimpleVatService) getService(invoiceTable.getServiceName());
	        SimpleVatService invoiceLineItemService = (SimpleVatService) migrationUtil.getService(invoiceLineItemTable.getServiceName());

	        List<Product.TableList.Table.ColumnList.Column> invoiceTableColumnList = invoiceTable.getColumnList().getColumn();
	        List<Product.TableList.Table.ColumnList.Column> invoiceLineItemTableColumnList =
	                invoiceLineItemTable.getColumnList().getColumn();
	        for (Map<String, String> record : mapList){
	            Invoice SupplierInvoiceEntity = getExistingSupplierInvoice(record,invoiceTable.getEntityName(),
	                    invoiceTableColumnList,userId);
	            com.simplevat.entity.Product productEntity = getExistingProduct(record);
	            ProductLineItem productLineItemEntity = addMissingFieldsForProductTypePurchase(productEntity,record);
	            InvoiceLineItem supplierInvoiceLineItemEntity = getExistingInvoiceLineItem(record,
	                    invoiceLineItemTable.getEntityName(),
	                    invoiceLineItemTableColumnList,userId,SupplierInvoiceEntity,productEntity);
	            ((InvoiceLineItem) supplierInvoiceLineItemEntity).setInvoice((com.simplevat.entity.Invoice)
	                    SupplierInvoiceEntity);
	            ((InvoiceLineItem) supplierInvoiceLineItemEntity).setProduct(productEntity);
	            ((InvoiceLineItem) supplierInvoiceLineItemEntity).setIsMigratedRecord(true);
	            ((InvoiceLineItem) supplierInvoiceLineItemEntity).setDiscountType(DiscountType.FIXED);
	            invoiceLineItemService.persist(supplierInvoiceLineItemEntity);
	            if(record.get(BILLE_STATUS).equalsIgnoreCase(DRAFT))
	            {
	            	SupplierInvoiceEntity.setStatus(CommonStatusEnum.PENDING.getValue());
	            }
	            else {
	            	SupplierInvoiceEntity.setStatus(CommonStatusEnum.POST.getValue());
	            }
	            invoiceService.persist(SupplierInvoiceEntity);
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

	        SimpleVatService invoiceService = (SimpleVatService) migrationUtil.getService(invoiceTable.getServiceName());
	        SimpleVatService invoiceLineItemService = (SimpleVatService) migrationUtil.getService(invoiceLineItemTable.getServiceName());

	        List<Product.TableList.Table.ColumnList.Column> invoiceTableColumnList = invoiceTable.getColumnList().getColumn();
	        List<Product.TableList.Table.ColumnList.Column> invoiceLineItemTableColumnList =
	                invoiceLineItemTable.getColumnList().getColumn();
	        for (Map<String, String> record : mapList){
	            Invoice creditNoteEntity = getExistingCreditNote(record,invoiceTable.getEntityName(),invoiceTableColumnList,
	                    userId);

	            Object invoiceLineItemEntity = migrationUtil.getObject(invoiceLineItemTable.getEntityName());
	            setColumnValue(invoiceLineItemTableColumnList, record, invoiceLineItemEntity);
	            migrationUtil.setDefaultSetterValues(invoiceLineItemEntity, userId);
	            ((InvoiceLineItem) invoiceLineItemEntity).setInvoice((com.simplevat.entity.Invoice) creditNoteEntity);
	            com.simplevat.entity.Product productEntity = getExistingProduct(record);
	            ((InvoiceLineItem) invoiceLineItemEntity).setProduct(productEntity);
	            invoiceLineItemService.persist(invoiceLineItemEntity);
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
	
			SimpleVatService invoiceService = (SimpleVatService) migrationUtil.getService(poQuotationTable.getServiceName());
			SimpleVatService poQuotationLineItemService = (SimpleVatService) migrationUtil.getService(
					poQuotationLineItemTable.getServiceName());
	
			List<Product.TableList.Table.ColumnList.Column> invoiceTableColumnList = poQuotationTable.getColumnList()
					.getColumn();
			List<Product.TableList.Table.ColumnList.Column> invoiceLineItemTableColumnList = poQuotationLineItemTable
					.getColumnList().getColumn();
			for (Map<String, String> record : mapList) {
				PoQuatation poQuotationEntity = getExistingPoQuotation(record, poQuotationTable.getEntityName(),
						invoiceTableColumnList, userId);
	
				Object poQuotationLineItemEntity = migrationUtil.getObject(poQuotationLineItemTable.getEntityName());
				setColumnValue(invoiceLineItemTableColumnList, record, poQuotationLineItemEntity);
				migrationUtil.setDefaultSetterValues(poQuotationLineItemEntity, userId);
				((PoQuatationLineItem) poQuotationLineItemEntity).setPoQuatation((PoQuatation) poQuotationEntity);
				com.simplevat.entity.Product productEntity = getExistingProduct(record);
				((PoQuatationLineItem) poQuotationLineItemEntity).setProduct(productEntity);
				poQuotationLineItemService.persist(poQuotationLineItemEntity);
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
		public PoQuatation getExistingPoQuotation(Map<String, String> record, String entityName,
				List<Product.TableList.Table.ColumnList.Column> invoiceTableColumnList, Integer userId) {

			return null;
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
	        for (Map<String, String> record : mapList) {
	            getExistingExpense(record, expenseTable.getEntityName(), expenseTableColumnList, userId);

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
			for (Map<String, String> record : mapList) {
				getExistingContact(record, contactTable.getEntityName(), expenseTableColumnList, userId);
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
	
			SimpleVatService currencyConversionService = (SimpleVatService) migrationUtil.getService(
					currencyConversionTable.getServiceName());
			for (Map<String, String> record : mapList) {
	
				// CurrencyConversion currencyConversion = getExchangeRate(record,
				// currencyConversionTable.getEntityName(), currencyConversionTableColumnList,
				// userId);
				List<CurrencyConversion> currencyConversion = currencyExchangeService.getCurrencyConversionList();
				Object currencyConversionEntity = migrationUtil.getObject(currencyConversionTable.getEntityName());
	
				setColumnValue(currencyConversionTableColumnList, record, currencyConversionEntity);
				((CurrencyConversion) currencyConversionEntity)
						.setCurrencyCodeConvertedTo(currencyConversion.get(0).getCurrencyCodeConvertedTo());
	
				System.out.println("currencyConversionEntity => " + currencyConversionEntity);
	
				currencyConversionService.persist(currencyConversionEntity);
	
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
	         
	         SimpleVatService chartOfAccountCategoryService = (SimpleVatService) migrationUtil.getService(chartOfAccountCategoryTable.getServiceName());
	         for (Map<String, String> record : mapList) {	
	         	
	            // Object  chartOfAccountCategoryEntity = getObject(chartOfAccountCategoryTable.getEntityName());
	             
	             ChartOfAccountCategory  chartOfAccountCategoryEntity = (ChartOfAccountCategory) migrationUtil.getObject(chartOfAccountCategoryTable.getEntityName());
	             setColumnValue(chartOfAccountCategoryTableColumnList, record, chartOfAccountCategoryEntity);
	             
	              log.info("chartOfAccountCategoryEntity => "+chartOfAccountCategoryEntity);
	              
	              chartOfAccountCategoryEntity.setChartOfAccountCategoryCode("-");
	              chartOfAccountCategoryEntity.setSelectFlag('N');
	              chartOfAccountCategoryEntity.setDefaltFlag('N');
	              chartOfAccountCategoryEntity.setDeleteFlag(false);
	             		
	             chartOfAccountCategoryService.persist(chartOfAccountCategoryEntity);

	         }
			
		}
		
	    private ProductLineItem addMissingFieldsForProductTypePurchase(com.simplevat.entity.Product productEntity,
	                                                                   Map<String, String> record) {
	             String getColumnValue = record.get("Account");
	             TransactionCategory transactionCategory = migrationUtil.getTransactionCategory(getColumnValue);
	             String unitPrice = record.get("Rate");
	           //  String[] value = unitPrice.split(" ");
	        BigDecimal bigDecimal = new  BigDecimal ((String) unitPrice);

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
		private ProductLineItem getExistingProductLineItemForSales(Map<String, String> record, String entityName,
				List<Product.TableList.Table.ColumnList.Column> productLineItemTableColumnList, Integer userId,
				Object productEntity, List<ProductLineItem> lineItem) {
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
		
		/**
		 * This method is use to get ExistingProduct
		 * @param record
		 * @return
		 */
		 private com.simplevat.entity.Product getExistingProduct(Map<String, String> record) {
		        String productName =record.get("Item Name");
		       // String productCode = record.get("Item ID");
		        Map<String, Object> param = new HashMap<>();
		        param.put("productName", productName);
		      //  param.put("productCode", productCode);
		       // param.put("priceType", ProductPriceType.BOTH) ;
		        List<com.simplevat.entity.Product> productList = productService.findByAttributes(param);
		        for (com.simplevat.entity.Product product:productList){
		            return product;
		        }
		        return null;
		       // com.simplevat.entity.Product product = productService.getProductByProductNameAndProductPriceType(productName);
		    }
		 
		 /**
			 * This method is use to get ExistingProductCode
			 * @param record
			 * @return
			 */
			 private com.simplevat.entity.Product getExistingProductCode(Map<String, String> record) {
			        String productCode = record.get("Item ID");
			        Map<String, Object> param = new HashMap<>();
			        param.put("productCode", productCode);
			        List<com.simplevat.entity.Product> productList = productService.findByAttributes(param);
			        for (com.simplevat.entity.Product product:productList){
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
		private InvoiceLineItem getExistingInvoiceLineItem(Map<String, String> record, String entityName,
				List<Product.TableList.Table.ColumnList.Column> invoiceLineItemTableColumnList, Integer userId,
				Invoice invoiceEntity, com.simplevat.entity.Product productEntity) {
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
			setColumnValueForInvoiceLineItem(invoiceLineItemTableColumnList, record, invoiceLineItem);
			migrationUtil.setDefaultSetterValues(invoiceLineItem, userId);
			return invoiceLineItem;
		}
		
		/*
		 * 
		 * 
		 */
		private Contact getExistingContact(Map<String, String> record, String entityName,
				List<Product.TableList.Table.ColumnList.Column> expenseTableColumnList, Integer userId) {
			Contact contact = null;
			contact = (Contact) migrationUtil.getObject(entityName);
			User user = userService.findByPK(userId);
			setColoumnValueForSupplierContact(expenseTableColumnList, record, contact, user);
			migrationUtil.setDefaultSetterValues(contact, userId);
			contact.setContactType(1);
			contact.setIsMigratedRecord(true);
			contact.setIsActive(true);
			
			//check whether the email id is coming 
			checkEmaiID((Contact) contact);
	
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
		private Expense getExistingExpense(Map<String, String> record, String entityName,
				List<Product.TableList.Table.ColumnList.Column> expenseTableColumnList, Integer userId) {
			Expense expense = null;
			expense = (Expense) migrationUtil.getObject(entityName);
			User user = userService.findByPK(userId);
			setColumnValueForExpense(expenseTableColumnList, record, expense, user);
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
				Map<String, String> record, Expense expense, User user) {
			for (Product.TableList.Table.ColumnList.Column column : expenseTableColumnList) {
				String val = record.get(column.getInputColumn());
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
					TransactionCategory transactionCategory = migrationUtil.getTransactionCategoryByName(val, record);
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
				List<Product.TableList.Table.ColumnList.Column> expenseTableColumnList, Map<String, String> record,
				Contact contact, User user) {
			
			for (Product.TableList.Table.ColumnList.Column column : expenseTableColumnList) {
				String val = record.get(column.getInputColumn());
				if (StringUtils.isEmpty(val))
					continue;
				String setterMethod = column.getSetterMethod();
				if (setterMethod.equalsIgnoreCase("setCurrency")) {
					Currency currency = migrationUtil.getCurrencyIdByValue(val);
					migrationUtil.setRecordIntoEntity(contact, setterMethod, currency, "Object");
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
		
		/**
		 * 
		 * @param record
		 * @param entityName
		 * @param invoiceTableColumnList
		 * @param userId
		 * @return
		 */
		private Invoice getExistingSupplierInvoice(Map<String, String> record, String entityName,
				List<Product.TableList.Table.ColumnList.Column> invoiceTableColumnList, Integer userId) {
			Invoice invoice = null;
			String invoiceNumber = record.get("Bill Number");
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
			invoice.setType(1);
			invoice.setStatus(2);
			invoice.setIsMigratedRecord(true);
			invoiceService.persist(invoice);
			return invoice;
			
		}
		
		private Invoice getExistingInvoice(Map<String, String> record, String entityName,
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
 			setColumnValue(invoiceTableColumnList, record, invoice);
			//setColoumnValueForInvoice(invoiceTableColumnList, record, invoice);
			migrationUtil.setDefaultSetterValues(invoice, userId);
			invoice.setType(2);
			// invoice.setStatus(2);
			invoice.setIsMigratedRecord(true);
			invoiceService.persist(invoice);
			return invoice;
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
			return productLineItem;
		}
		
		private void setColumnValueForProductLineItemPurchase(
				List<Product.TableList.Table.ColumnList.Column> productLineItemTableColumnList, Map<String, String> record,
				ProductLineItem productLineItem, List<ProductLineItem> lineItem) {
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
				List<Product.TableList.Table.ColumnList.Column>invoiceLineItemTableColumnList, Map<String, String> record,
				InvoiceLineItem invoiceLineItem) {
			
		for (Product.TableList.Table.ColumnList.Column column : invoiceLineItemTableColumnList) {
			String val = record.get(column.getInputColumn());
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
			/*
			else if (setterMethod.equalsIgnoreCase("setDiscount")){
                if (StringUtils.isEmpty(val))
                    continue;
                DiscountType value = migrationUtil.getDiscountType(val);
                migrationUtil.setRecordIntoEntity(invoiceLineItem, setterMethod, value, "Object");
            }
            */
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
				List<Product.TableList.Table.ColumnList.Column> productLineItemTableColumnList, Map<String, String> record,
				ProductLineItem productLineItem) {
			for (Product.TableList.Table.ColumnList.Column column : productLineItemTableColumnList) {
				String val = record.get(column.getInputColumn());
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
   
    public void setColumnValue(List<Product.TableList.Table.ColumnList.Column> productTableColumnList, Map<String, String> record, Object productEntity) {
        for (Product.TableList.Table.ColumnList.Column column : productTableColumnList) {
            String val = record.get(column.getInputColumn());
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
            }else if (setterMethod.equalsIgnoreCase("setCurrency") || setterMethod.equalsIgnoreCase("setCurrencyCode")) {
                if (StringUtils.isEmpty(val))
                    continue;
                Currency currency = migrationUtil.getCurrencyIdByValue(val);
//                        Currency currency = currencyService.findByPK(value);
                migrationUtil.setRecordIntoEntity(productEntity, setterMethod, currency, "Object");
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
    	
        String status = "Deleted Successfully";
    	List<TransactionCategory> transactionCategoryList = new ArrayList<>();
    	Contact contact = contactService.findByPK(id);
    	contact.setLastUpdatedBy(userId);
    	if (contact == null) {
    	}
    	
	    Map<String,Object> tmap = new HashMap<>();
		
		if(contact.getOrganization() != null && !contact.getOrganization().isEmpty()){
			tmap.put("transactionCategoryName",contact.getOrganization());
			//tmap.put("transactionCategoryId",contact.getTransactionCategory().getTransactionCategoryId());
		 transactionCategoryList =transactionCategoryService.findByAttributes(tmap);
		}else {
			tmap.put("transactionCategoryName", contact.getFirstName()+" "+contact.getLastName());
		transactionCategoryList =transactionCategoryService.findByAttributes(tmap);
		}
		Map<String,Object> filterMap = new HashMap<>();
		filterMap.put("contact",contact.getContactId());
		//delete Contact Transaction Category Relation
		List<ContactTransactionCategoryRelation> contactTransactionCategoryRelations = contactTransactionCategoryService.findByAttributes(filterMap);
		for(ContactTransactionCategoryRelation categoryRelation : contactTransactionCategoryRelations)
		{
			contactTransactionCategoryService.delete(categoryRelation);
		}
		contactService.delete(contact);
		for(TransactionCategory transactionCategory : transactionCategoryList)
		{
			transactionCategoryService.delete(transactionCategory);
		}
		
		//return  status;
	}
       
		private CurrencyConversion getExchangeRate(Map<String, String> record, String entityName,
				List<Column> currencyConversionTableColumnList, Integer userId) {
			
			return null;
			
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
			List files = getFilesPresent(fileLocation);
			for (Object file : files) {
				log.info("fileName== {}", file);
				List<String> tCategoryList = new ArrayList<>();
				List<Map<String, String>> mapList = migrationUtil
						.parseCSVFile((String) fileLocation + File.separator + file);
	
				Map<String, Object> attribute = new HashMap<String, Object>();
				attribute.put("deleteFlag", false);
	
				// get the list of transactionCategory record
				List<TransactionCategory> transactionCategoryList = transactionCategoryService.findByAttributes(attribute);
	
				// add the transactionCategoryName into List
				for (TransactionCategory transactionCategory : transactionCategoryList) {
					tCategoryList.add(transactionCategory.getTransactionCategoryName().toString());
				}
				for (Map<String, String> mapRecord : mapList) {
					List<TransactionCategoryModelForMigration> transactionCategoryModelForMigrationList = new ArrayList<>();
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
							if (tCategoryList.contains((mapRecord.get(ACCOUNT).toString()))) {
								log.info("tCategory is exist == {}", mapRecord.get(ACCOUNT).toString());
								if (existList.contains(transactionCategoryModelForMigration)) {
									continue;
								} else {
									transactionCategoryModelForMigrationList.add(transactionCategoryModelForMigration);
									existList.add(transactionCategoryModelForMigration);
								}
							} else {
								log.info("tCategory is not exist == {}", mapRecord.get(ACCOUNT).toString());
								if (notExistList.contains(mapRecord.get(ACCOUNT))) {
									continue;
								} else {
									notExistList.add(mapRecord.get(ACCOUNT));
								}
							}
						}
					}
					// for Expense.csv file
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
								if (tCategoryList.contains((mapRecord.get(EXPENSE_ACCOUNT).toString()))) {
									log.info("tCategory is exist == {}", mapRecord.get(EXPENSE_ACCOUNT).toString());
									if (existList.contains(transactionCategoryModelForMigration)) {
										continue;
									} else {
										transactionCategoryModelForMigrationList.add(transactionCategoryModelForMigration);
										existList.add(transactionCategoryModelForMigration);
									}
								} else {
									log.info("tCategory is not exist == {}", mapRecord.get(EXPENSE_ACCOUNT).toString());
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
	    	//String fileLocation = basePath;
			List files = getFilesPresent(fileLocation);
			List<ItemModel> itemModelList = new ArrayList<>();
			for (Object file : files) {
				List<Map<String, String>> mapList = migrationUtil.parseCSVFile((String) fileLocation + File.separator + file);
				
				for (Map<String, String> mapRecord : mapList) {
					if (file.equals("Item.csv")) {
					
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
			//String fileLocation = basePath;
			List files = getFilesPresent(fileLocation);
			List<ContactsModel> contactsModelList = new ArrayList<>();
			for (Object file : files) {
				List<Map<String, String>> mapList = migrationUtil.parseCSVFile((String) fileLocation + File.separator + file);
				
				for (Map<String, String> mapRecord : mapList) {
					if (file.equals("Contacts.csv")) {
					
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
			//String fileLocation = basePath;
			List files = getFilesPresent(fileLocation);
			List<VendorsModel> vendorsModelList = new ArrayList<>();
			for (Object file : files) {
				List<Map<String, String>> mapList = migrationUtil.parseCSVFile((String) fileLocation + File.separator + file);
				
				for (Map<String, String> mapRecord : mapList) {
					if (file.equals("Vendors.csv")) {
					
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
			//String fileLocation = basePath;
			List files = getFilesPresent(fileLocation);
			List<InvoiceModel> invoiceModelList = new ArrayList<>();
			for (Object file : files) {
				List<Map<String, String>> mapList = migrationUtil.parseCSVFile((String) fileLocation + File.separator + file);
				
				for (Map<String, String> mapRecord : mapList) {
					if (file.equals("Invoice.csv")) {
					
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
			//String fileLocation = basePath;
			List files = getFilesPresent(fileLocation);
			List<BillModel> billModelList = new ArrayList<>();
			for (Object file : files) {
				List<Map<String, String>> mapList = migrationUtil.parseCSVFile((String) fileLocation + File.separator + file);
				
				for (Map<String, String> mapRecord : mapList) {
					if (file.equals("Bill.csv")) {
					
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
			
			//String fileLocation = basePath;
			List files = getFilesPresent(fileLocation);
			List<CreditNoteModel> creditNoteModelList = new ArrayList<>();
			for (Object file : files) {
				List<Map<String, String>> mapList = migrationUtil.parseCSVFile((String) fileLocation + File.separator + file);
				
				for (Map<String, String> mapRecord : mapList) {
					if (file.equals("Credit_Note.csv")) {
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
			//String fileLocation = basePath;
			List files = getFilesPresent(fileLocation);
			List<ExpenseModel> ExpenseModelList = new ArrayList<>();
			for (Object file : files) {
				List<Map<String, String>> mapList = migrationUtil.parseCSVFile((String) fileLocation + File.separator + file);
				
				for (Map<String, String> mapRecord : mapList) {
					if (file.equals("Expense.csv")) {
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
			//String fileLocation = basePath;
			List files = getFilesPresent(fileLocation);
			List<PurchaseOrderModel> purchaseOrderModellList = new ArrayList<>();
			for (Object file : files) {
				List<Map<String, String>> mapList = migrationUtil.parseCSVFile((String) fileLocation + File.separator + file);
				
				for (Map<String, String> mapRecord : mapList) {
					if (file.equals("Purchase_Order.csv")) {
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
		//	String fileLocation = basePath;
			List files = getFilesPresent(fileLocation);
			List<ChartOfAccountsModel> chartOfAccountsModelList = new ArrayList<>();
			for (Object file : files) {
				List<Map<String, String>> mapList = migrationUtil.parseCSVFile((String) fileLocation + File.separator + file);
				
				for (Map<String, String> mapRecord : mapList) {
					if (file.equals("Chart_of_Accounts.csv")) {
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
			//String fileLocation = basePath;
			List files = getFilesPresent(fileLocation);
			List<ExchangeRateModel> exchangeRateModelList = new ArrayList<>();
			for (Object file : files) {
				List<Map<String, String>> mapList = migrationUtil.parseCSVFile((String) fileLocation + File.separator + file);
				
				for (Map<String, String> mapRecord : mapList) {
					if (file.equals("Exchange_Rate.csv")) {
						
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

		public List<String>  getUploadedFilesNames(String migrationPath){
            String fileLocation = basePath;
            List<String> fileNames = new ArrayList<>();
            //  List files = getFilesPresent(fileLocation);
            File[] f = new File (migrationPath).listFiles();
            for (File files : f) {
                String fileName = files.getName();
                fileNames.add(fileName);
        }
        return fileNames;

    }
		/**
		 * @param listOfFileNames
		 * @return
		 */
    public List<DataMigrationRespModel> deleteFiles(String migrationPath,UploadedFilesDeletionReqModel listOfFileNames){
        String fileLocation = basePath;
        List<String> deleteFiles = new ArrayList<>();
        List<String> remainingFiles = new ArrayList<>();
        List<String> fileNames = new ArrayList<>();
        List<DataMigrationRespModel> resultList = new ArrayList<>();
        File f = new File (fileLocation);
        File[]  files = f.listFiles();
		for (File file : files) {	
			remainingFiles.add(file.getName());
			for (String fileName : listOfFileNames.getFileNames()) {

				if (file.getName().equals(fileName)) {
					file.delete();
					deleteFiles.add(file.getName());
				}
			}
		}
		remainingFiles.removeAll(deleteFiles);
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
					dataMigrationRespModel.setRecordCount((Files.lines(Paths.get(fileLocation.toString() + "/" + remFileData.toString())).count()) - 1);
					dataMigrationRespModel.setFileName(remFileData);
				} catch (IOException e) {	
					e.printStackTrace();
				}
				
				resultList.add(dataMigrationRespModel);
			}
		}
		public String rollBackMigratedData(String migrationPath){
            String fileLocation = basePath;
            File f = new File (migrationPath);
            File[]  files = f.listFiles();
            for (File file:files){
                file.delete();
            }
		    return "Migrated Data Deleted Successfully";
        }
		
		
		
 /************************************************************************* MIGRATION SUMMARY ***************************************************************************/
		
	public List<DataMigrationRespModel> getMigrationSummary(String fileLocation, Integer userId, String migFromDate)
			throws IOException {
		List<DataMigrationRespModel> list = new ArrayList<>();
		log.info("getSummaryFileLocation{}", fileLocation);
		List files = getFilesPresent(fileLocation);
		for (Object file : files) {
			List<Map<String, String>> mapList = migrationUtil.parseCSVFile((String) fileLocation + File.separator + file);

			List<Map<String, String>> itemsToRemove = new ArrayList<Map<String, String>>();

			for (Map<String, String> mapRecord : mapList) {

				// for Invoice
				if (mapRecord.containsKey(INVOICE_DATE)) {
					Integer result = migrationUtil.compareDate(mapRecord.get(INVOICE_DATE), migFromDate);
					if (result != null) {
						itemsToRemove = migrationUtil.filterMapRecord(mapList, mapRecord, result, itemsToRemove);
					}

				}

				// for Bill
				if (mapRecord.containsKey(BILL_DATE)) {
					Integer result = migrationUtil.compareDate(mapRecord.get(BILL_DATE), migFromDate);
					itemsToRemove = migrationUtil.filterMapRecord(mapList, mapRecord, result, itemsToRemove);
				}

				// for Exchange Rate
				if (mapRecord.containsKey(DATE)) {
					Integer result = migrationUtil.compareDate(mapRecord.get(DATE), migFromDate);
					itemsToRemove = migrationUtil.filterMapRecord(mapList, mapRecord, result, itemsToRemove);
				}

				// for Expense Date
				if (mapRecord.containsKey(EXPENSE_DATE)) {
					Integer result = migrationUtil.compareDate(mapRecord.get(EXPENSE_DATE), migFromDate);
					itemsToRemove = migrationUtil.filterMapRecord(mapList, mapRecord, result, itemsToRemove);
				}

				// for Purchase Order Date
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
			dataMigrationRespModel.setFileName((String) file);
			dataMigrationRespModel.setRecordCount(
					(Files.lines(Paths.get(fileLocation.toString() + "/" + file.toString())).count()) - 1);
			dataMigrationRespModel.setRecordsMigrated((long) mapList.size());
			dataMigrationRespModel.setRecordsRemoved((long) itemsToRemove.size());
			list.add(dataMigrationRespModel);

		}
		return list;
	}		
	
	// Delete Files from uploaded folder.
	public String deleteMigratedFiles(String migrationPath){
        String fileLocation = basePath;
        File f = new File (migrationPath);
        File[]  files = f.listFiles();
        for (File file:files){
            file.delete();
        }
	    return "Migrated Data Deleted Successfully";
    }
	
	public void setColoumnValueForInvoice(
			List<Product.TableList.Table.ColumnList.Column> invoiceTableColumnList, Map<String, String> record,Invoice invoice) {
		
		for (Product.TableList.Table.ColumnList.Column column : invoiceTableColumnList) {
			String val = record.get(column.getInputColumn());
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
	              //  if (invoice instanceof InvoiceLineItem){
	                    TransactionCategory transactionCategory = migrationUtil.getTransactionCategory(val);
	                    migrationUtil.setRecordIntoEntity(invoice, "setTrnsactioncCategory", transactionCategory, "Object");
	              //  }
	            }
	           
	            else if (StringUtils.equalsIgnoreCase(setterMethod,"setInvoiceLineItemUnitPrice")){
	                if (StringUtils.isEmpty(val))
	                    continue;
	                migrationUtil.setRecordIntoEntity(invoice,"setUnitPrice",val,"BigDecimal");
	            }
	            else if (setterMethod.equalsIgnoreCase("setCurrency") || setterMethod.equalsIgnoreCase("setCurrencyCode")) {
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

