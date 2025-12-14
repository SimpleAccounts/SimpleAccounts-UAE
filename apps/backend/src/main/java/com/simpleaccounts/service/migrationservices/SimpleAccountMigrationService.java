package com.simpleaccounts.service.migrationservices;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.DRAFT;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.INVOICE_STATUS;

import com.simpleaccounts.constant.ChartOfAccountCategoryCodeEnum;
import com.simpleaccounts.constant.CommonStatusEnum;
import com.simpleaccounts.constant.DefaultTypeConstant;
import com.simpleaccounts.constant.DiscountType;
import com.simpleaccounts.constant.InvoiceDuePeriodEnum;
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
import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
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
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class SimpleAccountMigrationService {
	
	private static final String TYPE_OBJECT = "Object";
	
	private final Logger LOG = LoggerFactory.getLogger(SimpleAccountMigrationService.class);
	
	private final String basePath;
    
    private final MigrationUtil migrationUtil; 
    
    private final CompanyService companyService;
    
    private final InvoiceService invoiceService;
    
    private final InvoiceRestHelper invoiceRestHelper;
    
    private final JournalService journalService;
    
    private final CountryService countryService;

    private final StateService stateService;
    
    private final InvoiceLineItemService invoiceLineItemService;

    private final ContactService contactService;

    private final ProductService productService;
    
    private final ProductLineItemService productLineItemService;
    
    private final TransactionCategoryService transactionCategoryService;
    
    private final CurrencyExchangeService currencyExchangeService;
    
    private final  UserService userService;
    
	private final ChartOfAccountService transactionTypeService;
	
	private final VatCategoryService vatCategoryService;
	
	private final CoacTransactionCategoryService coacTransactionCategoryService;

    List<DataMigrationRespModel> processTheMigratedData(String productName, String version, String fileLocation,
			Integer userId, String migFromDate) throws IOException {
    	
    	LOG.info("SimpleAccountMigrationService :: processTheMigratedData start");
    	
		List<DataMigrationRespModel> list = new ArrayList<>();
		ProductMigrationParser parser = ProductMigrationParser.getInstance();
		Product product = parser.getAppVersionsToProductMap().get(productName + "_v" + version);
		List<String> files = getFilesPresent(fileLocation);
		
			if (files != null) {
				for (String file : files) {
					List<Map<String, String>> mapList = migrationUtil.parseCSVFile(fileLocation + File.separator + file);
					List<Map<String, String>> itemsToRemove = new ArrayList<>();
					
					if(mapList != null)
					{
						for (Map<String, String> mapRecord : mapList) {
						
						if (mapRecord.containsKey(SimpleAccountMigrationConstants.INVOICE_DATE)) {
							Integer result = migrationUtil.compareDate(mapRecord.get(SimpleAccountMigrationConstants.INVOICE_DATE), migFromDate);
							if (result != null) {
								itemsToRemove = migrationUtil.filterMapRecord(mapList, mapRecord, result, itemsToRemove);
							}
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
					long recordCount;
					Path path = Paths.get(fileLocation, file);
					try (Stream<String> lines = Files.lines(path)) {
						recordCount = lines.count() - 1;
					}
					dataMigrationRespModel.setRecordCount(recordCount);
					dataMigrationRespModel.setRecordsMigrated((long) mapList.size());
					dataMigrationRespModel.setRecordsRemoved((long) itemsToRemove.size());
					list.add(dataMigrationRespModel);
					if (isSpecialHandlingNeeded(productName, file)) {
						handleProductSpecificTables(tables, mapList, userId);
						continue;
					}
				
				if(tables != null) 
				{
						LOG.info("processTheMigratedData tables ==>{} ", tables);
						for (Product.TableList.Table table : tables) {
							// get service Object
							SimpleAccountsService<Object, Object> service =
									(SimpleAccountsService<Object, Object>) migrationUtil.getService(table.getServiceName());
							List<Product.TableList.Table.ColumnList.Column> columnList = table.getColumnList().getColumn();
							// csv records
							for (Map<String, String> recordData : mapList) {
								Object entity = migrationUtil.getObject(table.getEntityName());
								// iterate over all the columns and crate record and persist object to database
								for (Product.TableList.Table.ColumnList.Column column : columnList) {
									String val = recordData.get(column.getInputColumn());
									LOG.info("processTheMigratedData tables ==>{} ", val);
									if (StringUtils.isEmpty(val))
										continue;
								String setterMethod = column.getSetterMethod();
								if (setterMethod.equalsIgnoreCase("setCurrency")) {
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
									Contact contact = (Contact) entity;
									boolean isContactExist = migrationUtil.contactExist(contact);
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
       if (StringUtils.equalsIgnoreCase(SimpleAccountMigrationConstants.SIMPLE_ACCOUNTS, productName) && (StringUtils.equalsIgnoreCase(file, SimpleAccountMigrationConstants.PRODUCT_CSV)) ||
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
				createOpeningBalance(mapList, userId);
			}
		
			table = tables.stream().filter(t -> t.getName().equalsIgnoreCase(SimpleAccountMigrationConstants.CHART_OF_ACCOUNTS)).findFirst();
			if (table.isPresent()) {
				createChartOfAccounts(mapList, userId);
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

		SimpleAccountsService<Object, Object> productMigrationService =
				(SimpleAccountsService<Object, Object>) migrationUtil.getService(productTable.getServiceName());
		SimpleAccountsService<Object, Object> productLineItemMigrationService =
				(SimpleAccountsService<Object, Object>) migrationUtil.getService(productLineItemTable.getServiceName());

		List<Product.TableList.Table.ColumnList.Column> productTableColumnList = productTable.getColumnList().getColumn();
		List<Product.TableList.Table.ColumnList.Column> productLineItemTableColumnList = productLineItemTable.getColumnList().getColumn();

		if (mapList != null) {
			for (Map<String, String> recordData : mapList) {
				com.simpleaccounts.entity.Product productEntity =
						(com.simpleaccounts.entity.Product) migrationUtil.getObject(productTable.getEntityName());
				setColumnValue(productTableColumnList, recordData, productEntity);
				Boolean isInventoryEnabled = migrationUtil.checkInventoryEnabled(recordData);
				productEntity.setIsInventoryEnabled(isInventoryEnabled);
				productEntity.setIsMigratedRecord(true);
				productEntity.setIsActive(true);
				migrationUtil.setDefaultSetterValues(productEntity, userId);
				productMigrationService.persist(productEntity);
				
				List<ProductLineItem> lineItem = new ArrayList<>();
				ProductLineItem productLineItemEntityPurchase = null;
				
					productLineItemEntityPurchase = getExistingProductLineItemForPurchase(recordData,
							productLineItemTable.getEntityName(), productLineItemTableColumnList, userId, productEntity);
					productLineItemEntityPurchase.setProduct(productEntity);
					productLineItemEntityPurchase.setIsMigratedRecord(true);
					productLineItemMigrationService.persist(productLineItemEntityPurchase);
					lineItem.add(productLineItemEntityPurchase);
					productMigrationService.persist(productEntity);
					productEntity.setLineItemList(lineItem);
				}
			}
		}

	private void createCustomerInvoice(List<Table> tables, List<Map<String, String>> mapList, Integer userId) {

		LOG.info("createCustomerInvoice start");
        Product.TableList.Table invoiceTable = tables.get(0);
        Product.TableList.Table invoiceLineItemTable = tables.get(1);

        SimpleAccountsService<Object, Object> invoiceLineItemMigrationService =
        		(SimpleAccountsService<Object, Object>) migrationUtil.getService(invoiceLineItemTable.getServiceName());

        List<Product.TableList.Table.ColumnList.Column> invoiceTableColumnList = invoiceTable.getColumnList().getColumn();
        List<Product.TableList.Table.ColumnList.Column> invoiceLineItemTableColumnList = invoiceLineItemTable.getColumnList().getColumn();
        if (mapList != null) {
        	for (Map<String, String> recordData : mapList){
        		Invoice invoiceEntity = getExistingInvoice(recordData,invoiceTable.getEntityName(),invoiceTableColumnList,userId);
        		com.simpleaccounts.entity.Product productEntity = getExistingProduct(recordData);
        		InvoiceLineItem invoiceLineItemEntity = getExistingInvoiceLineItem(recordData,invoiceLineItemTable.getEntityName(),
        				invoiceLineItemTableColumnList,userId,invoiceEntity,productEntity);
        		invoiceLineItemEntity.setInvoice(invoiceEntity);
        		invoiceLineItemEntity.setIsMigratedRecord(true);
        		invoiceLineItemEntity.setProduct(productEntity);
        		invoiceLineItemMigrationService.persist(invoiceLineItemEntity);
        		
        		if (DRAFT.equalsIgnoreCase(recordData.get(INVOICE_STATUS)))
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
		private void createOpeningBalance(List<Map<String, String>> mapList, Integer userId) {
			LOG.info("createOpeningBalance start");
			if (mapList == null) {
				return;
			}
			 for (Map<String, String> recordData : mapList) {
				 BigDecimal amount = new BigDecimal(recordData.get(SimpleAccountMigrationConstants.ACCOUNT));
				 String transactionCategoryName =  recordData.get(SimpleAccountMigrationConstants.TRANSACTION_CATEGORY_NAME);
				 String openingDate = recordData.get(SimpleAccountMigrationConstants.OPENING_DATE);
				 Date effectiveDate = null;
				 try {
					 effectiveDate = new SimpleDateFormat("dd-MM-yyyy").parse(openingDate);
				} catch (ParseException e) {
					LOG.error(ERROR, e);
				}
				 if (effectiveDate == null) {
					 continue;
				 }
				 LOG.info("effectiveDate {}", effectiveDate);
				 Map<String, Object> param = new HashMap<>();
				 param.put("transactionCategoryName", transactionCategoryName);
			     List<TransactionCategory> categories = transactionCategoryService.findByAttributes(param);

			     for(TransactionCategory category : categories) {
			    	 boolean isDebit = getValidTransactionCategoryType(category);
			    	 TransactionCategory transactionCategory = transactionCategoryService.findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.OPENING_BALANCE_OFFSET_LIABILITIES.getCode());
			    	 List<JournalLineItem> journalLineItemList = new ArrayList<>();
			    	 Journal journal = new Journal();
			    	 JournalLineItem journalLineItem1 = new JournalLineItem();
			    	 journalLineItem1.setTransactionCategory(category);
			    	 boolean isNegative = amount.signum() < 0;
			    	 if (isDebit ) {
			    		 if(!isNegative)
			    			 journalLineItem1.setDebitAmount(amount);
			    		 else
			    			 journalLineItem1.setCreditAmount(amount.negate());
			    	 } else {
			    		 if(!isNegative)
			    			 journalLineItem1.setCreditAmount(amount);
			    		 else
			    			 journalLineItem1.setDebitAmount(amount.negate());
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
			    			 journalLineItem2.setDebitAmount(amount);
			    		 else
			    			 journalLineItem2.setCreditAmount(amount.negate());
			    	 } else {
			    		 if(!isNegative)
			    			 journalLineItem2.setCreditAmount(amount);
			    		 else
			    			 journalLineItem2.setDebitAmount(amount.negate());
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
		
		private void createChartOfAccounts(List<Map<String, String>> mapList, Integer userId) {
			LOG.info("createChartOfAccounts start");
			if (mapList == null) {
				return;
			}
	         User user = userService.findByPK(userId);
	         for (Map<String, String> recordData : mapList) {
	        	 String chartOfAccountName = recordData.get(SimpleAccountMigrationConstants.CHART_OF_ACCOUNT_NAME);
	        	 TransactionCategoryBean transactionCategoryBean = new TransactionCategoryBean();
	        	 
	        	 transactionCategoryBean.setParentTransactionCategory(null);
	        	 transactionCategoryBean.setTransactionCategoryId(null);
	        	 transactionCategoryBean.setTransactionCategoryDescription(null);
	        	 transactionCategoryBean.setTransactionCategoryName(chartOfAccountName);
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
				SimpleAccountsService<Object, Object> currencyConversionMigrationService =
						(SimpleAccountsService<Object, Object>) migrationUtil.getService(
								currencyConversionTable.getServiceName());
				if (mapList == null) {
					return;
				}

				List<CurrencyConversion> currencyConversions = currencyExchangeService.getCurrencyConversionList();
				for (Map<String, String> recordData : mapList) {
					CurrencyConversion currencyConversionEntity =
							(CurrencyConversion) migrationUtil.getObject(currencyConversionTable.getEntityName());
					setColumnValue(currencyConversionTableColumnList, recordData, currencyConversionEntity);
					if (!currencyConversions.isEmpty()) {
						currencyConversionEntity.setCurrencyCodeConvertedTo(
								currencyConversions.get(0).getCurrencyCodeConvertedTo());
					}
					migrationUtil.setDefaultSetterValues(currencyConversionEntity, userId);
					currencyConversionMigrationService.persist(currencyConversionEntity);
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
		        SimpleAccountsService<Object, Object> invoiceLineItemMigrationService =
		        		(SimpleAccountsService<Object, Object>) migrationUtil.getService(
		        				invoiceLineItemTable.getServiceName());
		
		        List<Product.TableList.Table.ColumnList.Column> invoiceTableColumnList = invoiceTable.getColumnList().getColumn();
		        List<Product.TableList.Table.ColumnList.Column> invoiceLineItemTableColumnList =
		                invoiceLineItemTable.getColumnList().getColumn();
		        if (mapList == null) {
		        	return;
		        }
		        for (Map<String, String> recordData : mapList){
		            Invoice creditNoteEntity = getExistingCreditNote(recordData,invoiceTable.getEntityName(),invoiceTableColumnList, userId);
		            InvoiceLineItem invoiceLineItemEntity =
		            		(InvoiceLineItem) migrationUtil.getObject(invoiceLineItemTable.getEntityName());
		            setColumnValue(invoiceLineItemTableColumnList, recordData, invoiceLineItemEntity);
		            migrationUtil.setDefaultSetterValues(invoiceLineItemEntity, userId);
		            invoiceLineItemEntity.setInvoice(creditNoteEntity);
		            com.simpleaccounts.entity.Product productEntity = getExistingProduct(recordData);
		            invoiceLineItemEntity.setProduct(productEntity);
		            invoiceLineItemMigrationService.persist(invoiceLineItemEntity);
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

	
	
	private void setColumnValue(List<Product.TableList.Table.ColumnList.Column> productTableColumnList, Map<String, String> recordData, Object productEntity) {
		if(productTableColumnList != null) {
			for (Product.TableList.Table.ColumnList.Column column : productTableColumnList) {
				String val = recordData.get(column.getInputColumn());
				LOG.info("setColumnValue val {}", val);
				String setterMethod = column.getSetterMethod();
				if (setterMethod.equalsIgnoreCase("setProductType")){
					if (StringUtils.isEmpty(val))
						continue;
					ProductType value = migrationUtil.getProductType(val);
					migrationUtil.setRecordIntoEntity(productEntity, setterMethod, value, TYPE_OBJECT);
				}
				else if (setterMethod.equalsIgnoreCase("setVatCategory")){
					VatCategory vatCategory = migrationUtil.getVatCategoryByValue(val);
					migrationUtil.setRecordIntoEntity(productEntity,setterMethod,vatCategory,"Object");
				}
				
				else if(setterMethod.equalsIgnoreCase("setPriceType")){
					if (StringUtils.isEmpty(val))
						continue;
					                                    ProductPriceType value = migrationUtil.getProductPriceType(recordData);					migrationUtil.setRecordIntoEntity(productEntity, setterMethod, value, TYPE_OBJECT);
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
				
				else if (setterMethod.equalsIgnoreCase("setContact")) {
					if (StringUtils.isEmpty(val))
						continue;
					Contact value = migrationUtil.getContactByValue(val);
					migrationUtil.setRecordIntoEntity(productEntity, setterMethod, value, TYPE_OBJECT);
				}else if (setterMethod.equalsIgnoreCase("setSupplierId")) {
					if (StringUtils.isEmpty(val))
						continue;
					Contact value = migrationUtil.getContactByValue(val);
					migrationUtil.setRecordIntoEntity(productEntity, setterMethod, value, TYPE_OBJECT);
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
						migrationUtil.setRecordIntoEntity(productEntity, "setTrnsactioncCategory", transactionCategory, TYPE_OBJECT);
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

					migrationUtil.setRecordIntoEntity(productEntity, setterMethod, currency, TYPE_OBJECT);
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
			private ProductLineItem getExistingProductLineItemForPurchase(Map<String, String> recordData,
					String entityName,
					List<Product.TableList.Table.ColumnList.Column> productLineItemTableColumnList,
					Integer userId,
					Object productEntity) {
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
			setColumnValueForProductLineItemPurchase(productLineItemTableColumnList, recordData, productLineItem);
			migrationUtil.setDefaultSetterValues(productLineItem, userId);
			LOG.info("getExistingProductLineItemForPurchase productLineItem {} ", productLineItem);
			return productLineItem;
		}
		
		private void setColumnValueForProductLineItemPurchase(
				List<Product.TableList.Table.ColumnList.Column> productLineItemTableColumnList,
				Map<String, String> recordData,
				ProductLineItem productLineItem) {
			LOG.info("setColumnValueForProductLineItemPurchase start");
			if(productLineItemTableColumnList != null) {
				for (Product.TableList.Table.ColumnList.Column column : productLineItemTableColumnList) {
					String val = recordData.get(column.getInputColumn());
					if (StringUtils.isEmpty(val))
						continue;
					String setterMethod = column.getSetterMethod();
				if (setterMethod.equalsIgnoreCase("setPriceType")) {
					ProductPriceType productPriceType = ProductPriceType.PURCHASE;
					migrationUtil.setRecordIntoEntity(productLineItem, setterMethod, productPriceType, TYPE_OBJECT);
				} else if (setterMethod.equalsIgnoreCase("setTransactioncategory")) {
					TransactionCategory transactionCategory = transactionCategoryService.findByPK(49);
					migrationUtil.setRecordIntoEntity(productLineItem, setterMethod, transactionCategory, TYPE_OBJECT);
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
	private Invoice getExistingInvoice(Map<String, String> recordData, String entityName,
			List<Product.TableList.Table.ColumnList.Column> invoiceTableColumnList, Integer userId) {
		LOG.info("getExistingInvoice start");
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
		LOG.info("getExistingInvoice invoice {} ", invoice);
		return invoice;
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
		        if (productList == null || productList.isEmpty()) {
		        	return null;
		        }
		        com.simpleaccounts.entity.Product product = productList.get(0);
		        LOG.info("getExistingInvoice product {} ", product);
		        return product;

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
		setColumnValue(invoiceLineItemTableColumnList, recordData, invoiceLineItem);
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
			case ACCOUNTS_PAYABLE:
			case INCOME:
			default:
				return true;
		}
	}
}
