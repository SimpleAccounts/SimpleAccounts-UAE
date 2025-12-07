package com.simpleaccounts.service.migrationservices;

import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.ACCOUNT;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.COST_OF_GOODS_SOLD;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.DUE_ON_RECEIPT;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.EXPENSE_ACCOUNT;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.INVENTORY_ASSET;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.SALES;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.VAT_0;
import static com.simpleaccounts.service.migrationservices.ZohoMigrationConstants.VAT_5;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.simpleaccounts.constant.InvoiceDuePeriodEnum;
import com.simpleaccounts.constant.ProductPriceType;
import com.simpleaccounts.constant.ProductType;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.PlaceOfSupply;
import com.simpleaccounts.entity.TaxTreatment;
import com.simpleaccounts.entity.VatCategory;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.migration.xml.bindings.product.Product;
import com.simpleaccounts.repository.PlaceOfSupplyRepository;
import com.simpleaccounts.repository.TaxTreatmentRepository;
import com.simpleaccounts.rest.migrationcontroller.TransactionCategoryListResponseModel;
import com.simpleaccounts.rest.migrationcontroller.TransactionCategoryModelForMigration;
import com.simpleaccounts.service.ChartOfAccountCategoryService;
import com.simpleaccounts.service.ContactService;
import com.simpleaccounts.service.CountryService;
import com.simpleaccounts.service.CurrencyExchangeService;
import com.simpleaccounts.service.CurrencyService;
import com.simpleaccounts.service.ExpenseService;
import com.simpleaccounts.service.InventoryService;
import com.simpleaccounts.service.InvoiceLineItemService;
import com.simpleaccounts.service.PlaceOfSupplyService;
import com.simpleaccounts.service.ProductLineItemService;
import com.simpleaccounts.service.ProductService;
import com.simpleaccounts.service.StateService;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.VatCategoryService;
import com.simpleaccounts.utils.DateFormatUtil;
import com.simpleaccounts.utils.FileHelper;
import com.simpleaccounts.utils.TransactionCategoryCreationHelper;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class MigrationUtil {
	
	 private final Logger LOG = LoggerFactory.getLogger(MigrationUtil.class);
	 
	  private static SimpleDateFormat inSDF = new SimpleDateFormat("mm/dd/yyyy");
	  private static SimpleDateFormat outSDF = new SimpleDateFormat("yyyy-mm-dd");
	  
	  private String dateFormat = "mm/dd/yyyy";

		@Autowired
		private CurrencyService currencyService;
	
		@Autowired
		private DateFormatUtil dateFormtUtil;
	
		@Autowired
		private CountryService countryService;
	
		@Autowired
		private StateService stateService;
	
		@Autowired
		private PlaceOfSupplyService placeOfSupplyService;
	
		@Autowired
		private InvoiceLineItemService invoiceLineItemService;
	
		@Autowired
		private ContactService contactService;
	
		@Autowired
		private ProductService productService;
	
		@Autowired
		private VatCategoryService vatCategoryService;
	
		@Autowired
		private ProductLineItemService productLineItemService;
	
		@Autowired
		private ExpenseService expenseService;
	
		@Autowired
		private CurrencyExchangeService currencyExchangeService;
	
		@Autowired
		private InventoryService inventoryService;
	
		@Autowired
		private ChartOfAccountCategoryService chartOfAccountCategoryService;
	
		@Autowired
		private TransactionCategoryCreationHelper transactionCategoryCreationHelper;
	
		@Autowired
		private TransactionCategoryService transactionCategoryService;
		
		@Autowired
		private TaxTreatmentRepository taxTreatmentRepository;
	  
		@Autowired
		private PlaceOfSupplyRepository placeOfSupplyRepository;
		
	  /**
	     * This method returns tableName from file name
	     *
	     * @param tableList
	     * @param file
	     * @return
	     */
	    public List<Product.TableList.Table> getTableName(List<Product.TableList.Table> tableList, String file) {
	        List<Product.TableList.Table> tablesList = new ArrayList<>();
	        for (Product.TableList.Table table : tableList) {
	            if (table.getSrcFileName().equalsIgnoreCase(file)) {
	                tablesList.add(table);
	            }
	        }
	        return tablesList;
	    }
	  
	
	 /**
     * To Compare the date
     *
     * @param fileDate
     * @param inputDate
     * @return
     */
    public Integer compareDate(String fileDate, String inputDate) {
    
		String fileDateNew = fileDate;

		if (fileDate.contains("/")) {
			fileDateNew = formatDate(fileDate);
		}

		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		Integer result = null;
		try {

			Date date1 = sdf.parse(fileDateNew);
			Date date2 = sdf.parse(inputDate);

			result = date1.compareTo(date2);

		} catch (ParseException e) {

			LOG.error("Error =", e);
		}
		return result;
    }
    
    
    /**
     * 
     * @param inDate 
     * @return OutPut Date in yyyy-MM-dd format
     */
    public static String formatDate(String inDate) {
    	
        String outDate = "";
        if (inDate != null) {
            try {
                	Date date = inSDF.parse(inDate);
                	outDate = outSDF.format(date);
            } catch (ParseException ex) {
            }
        }
        return outDate;
    }
    
    
    /**
     * To remove the record from mapList
     *
     * @param mapList
     * @param mapRecord
     * @param result
     * @return
     */
    public List<Map<String, String>> filterMapRecord(List<Map<String, String>> mapList, Map<String, String> mapRecord, Integer result, List<Map<String, String>> itemsToRemove) {

        if (result < 0) {
            // remove from maplist
            LOG.info("Recode Remove from migrate");
            itemsToRemove.add(mapRecord);
        } else {
            // dont remove
            LOG.info("Recode for migrate");
        }

        return itemsToRemove;
    }
    
    /**
     * This method is used to getCurrency
     * @param val
     * @return
     */
    
    
    /**
     * This method sets record in to entity
     *
     * @param entity
     * @param setterMethod
     * @param val
     * @param dataType
     */
    protected void setRecordIntoEntity(Object entity, String setterMethod, Object val, String dataType) {
        try {
            switch (dataType) {
                case "LocalDateTime":
                    //2021-05-02 00:00:00
                    // DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                    //LocalDateTime dateTime = LocalDateTime.parse(val.toString(), formatter);
                    LocalDateTime dateTime = dateFormtUtil.getDateStrAsLocalDateTime(val.toString(), getDateFormat());
                    Class<?>[] paramTypes = {LocalDateTime.class};
                    Method method = entity.getClass().getMethod(setterMethod, paramTypes);
                    method.invoke(entity, dateTime);
                    break;

                case "Integer":

                    Integer integer = (int) Double.parseDouble((String) val);
                    Class<?>[] intParamTypes = {Integer.class};
                    method = entity.getClass().getMethod(setterMethod, intParamTypes);
                    method.invoke(entity, integer);
                    break;
                case "String":

                    String string = val.toString();
                    Class<?>[] stringParamTypes = {String.class};
                    method = entity.getClass().getMethod(setterMethod, stringParamTypes);
                    method.invoke(entity, string);
                    break;
                case "Object":

                    Class<?> className = val.getClass();
                    method = entity.getClass().getMethod(setterMethod, className);
                    method.invoke(entity, val);
                    break;

                case "BigDecimal":

                    BigDecimal bigDecimal = new BigDecimal((String) val);
                    Class<?>[] bigDecimalParamTypes = {BigDecimal.class};
                    method = entity.getClass().getMethod(setterMethod, bigDecimalParamTypes);
                    method.invoke(entity, bigDecimal);
                    break;

                case "Float":
                    Float floatValue = (float) Double.parseDouble((String) val);
                    Class<?>[] floatParamTypes = {Float.class};
                    method = entity.getClass().getMethod(setterMethod, floatParamTypes);
                    method.invoke(entity, floatValue);
                    break;

                default:
//                    stringParamTypes = {String.class, String.class};
//                    method = entity.getClass().getMethod(setterMethod, stringParamTypes);
//                    method.invoke(entity, val);
            }
        } catch (Exception e) {
            LOG.error("Error during migration", e);
        }
    }
    
    
    public String getDateFormat() {
        return dateFormat;
    }

    protected Currency getCurrencyIdByValue(String val) {
        Map<String, Object> param = new HashMap<>();
        param.put("currencyIsoCode", val);
        List<Currency> currencyList = currencyService.findByAttributes(param);
        for (Currency currency : currencyList) {
            return currency;
        }
        return null;
    }
    
    Integer getStateIdByInputColumnValue(String val) {
        return stateService.getStateIdByInputColumnValue(val);
    }

    Integer getCountryIdByValue(String val) {

        return countryService.getCountryIdByValue(val);
    }
    
    PlaceOfSupply getPlaceOfSupplyByValue(String val) {
        switch (val) {
            case ZohoMigrationConstants.DU:
                val = "Dubai";
                break;
            case ZohoMigrationConstants.AJ:
                val = "Ajman";
                break;
            case ZohoMigrationConstants.FU:
                val = "Fujairah";
            default:
        }
        Map<String, Object> param = new HashMap<>();
        param.put("placeOfSupply", val);
        List<PlaceOfSupply> placeOfSupplyList = placeOfSupplyService.findByAttributes(param);
        for (PlaceOfSupply placeOfSupply : placeOfSupplyList) {
            return placeOfSupply;
        }
        return null;
    }
    
    /**
     * 
     * @param contactType
     * @return
     */
    public  int getContactType(String contactType){
        switch (contactType.toLowerCase()){
            case "customer":
                return 2;
            case "supplier":
                return 1;

            default:
                return 3;
        }
    }
    
    
    /**
     * 
     * @param productType
     * @return
     */
    public ProductType getProductType(String productType){
        switch (productType){
            case "goods":
                return ProductType.GOODS;
            case "services":
                return ProductType.SERVICE;
            default:
                return  ProductType.GOODS;
        }
    }
    
    /**
     * This method will set the defaultSetterValues
     * @param entity
     * @param userId
     */
    protected void setDefaultSetterValues(Object entity, Integer userId) {

        Class<?>[] intParamTypes = {Integer.class};
        Class<?>[] dateParamTypes = {LocalDateTime.class};
        Method method = null;
        try {
            method = entity.getClass().getMethod("setCreatedBy", intParamTypes);
            method.invoke(entity, userId);

            method = entity.getClass().getMethod("setCreatedDate", dateParamTypes);
            method.invoke(entity, LocalDateTime.now());
        } catch (Exception e) {
            //LOG.error("Error during migration", e);
            LOG.error("Error =", e);
        }

    }
    
   /**
     * This method will create the Dependent Entities for Contact
     * @param entity
     * @param userId
     */
    protected void createDependentEntities(Object entity, Integer userId) {
        if (entity instanceof Contact) {
            transactionCategoryCreationHelper.createTransactionCategoryForContact((Contact) entity);
        }

    }

    
    
    /**
     * This method parse the csv file and returns list of records
     *
     * @param fileName
     * @return
     */
    public List<Map<String, String>> parseCSVFile(String fileName) {
        String line = "";
        String cvsSplitBy = ",";
        Map<Integer, String> indexHeaderMap = new HashMap<>();
        List<Map<String, String>> list = new ArrayList<>();
        BufferedReader br = null;

        try {

            FileInputStream inputStream = new FileInputStream(fileName);
            br = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8));
            int rowCount = 0;
            while ((line = br.readLine()) != null) {

                String[] splitList = line.split(cvsSplitBy);
                Map<String, String> dataMap = new LinkedHashMap<>();
                if (rowCount == 0) {
                    int j = 0;
                    for (String data : splitList) {
                        indexHeaderMap.put(j, data);
                        j++;
                    }
                } else {
                    int cellCount = 0;
                    for (String data : splitList) {
                        dataMap.put(indexHeaderMap.get(cellCount), data);
                        cellCount++;
                    }
                    int maxItr = indexHeaderMap.size() - splitList.length;
                    if (indexHeaderMap.size() != splitList.length) {
                        for (int loop = 1; loop <= maxItr; loop++) {
                            dataMap.put(indexHeaderMap.get(cellCount), "-");
                        }
                    }
                    list.add(dataMap);
                }
                rowCount++;

            }
            return list;
        } catch (IOException e) {
            LOG.error("Error =", e);
        } finally {
            if (br != null) {
                try {
                    br.close();
                } catch (IOException e) {
                    LOG.error("Error =", e);
                }
            }
        }
        return null;
    }
    
    /**
     * 
     * @param val
     * @param record
     * @return
     */
    public TransactionCategory getTransactionCategoryByName(String val,Map<String, String> record) {
        String transactionCategoryName = record.get("Paid Through");
        Map<String, Object> param = new HashMap<>();
        param.put("transactionCategoryName", transactionCategoryName);
        List<TransactionCategory> transactionCategoryList = transactionCategoryService.findByAttributes(param);
        for (TransactionCategory transactionCategory:transactionCategoryList){
            return transactionCategory;
        }
            return null;
    }
    
    /**
     * 
     * @param value
     * @return
     */
    public TransactionCategory getTransactionCategory(String value) {
        switch (value){
            case SALES:
                return  transactionCategoryService.findByPK(84);
            case COST_OF_GOODS_SOLD:
                return transactionCategoryService.findByPK(49);
            case INVENTORY_ASSET:
                return transactionCategoryService.findByPK(150);

        }
          return null;
  }
    
    
    /**
    *
    * @param val
    * @return
    */
   public ProductPriceType getProductPriceType(String val, Map<String, String> record) {
       String inputColoumnValue = record.get("Item Type");
       if (inputColoumnValue.equalsIgnoreCase("Sales")){
           return ProductPriceType.SALES;
       }else if (inputColoumnValue.equalsIgnoreCase("Purchases")){
           return ProductPriceType.PURCHASE;
       }
       else {
           return ProductPriceType.BOTH;
       }
   }
   
   /**
    * This method returns specified service name for migration
    *
    * @param serviceName
    * @return
    */
   protected Object getService(String serviceName) {
       switch (serviceName) {
           case "com.simpleaccounts.service.ContactService":
               return contactService;
           case "com.simpleaccounts.service.ProductService":
               return productService;
           case "com.simpleaccounts.service.ProductLineItemService":
               return productLineItemService;
           case "com.simpleaccounts.service.InventoryService":
               return inventoryService;
           case "com.simpleaccounts.service.InvoiceLineItemService":
               return invoiceLineItemService;
           case "com.simpleaccounts.service.ExpenseService":
               return expenseService;
           case "com.simpleaccounts.service.CurrencyExchangeService":
               return currencyExchangeService;
           case "com.simpleaccounts.service.ChartOfAccountCategoryService":
               return chartOfAccountCategoryService;
           default:
               return null;
       }
   }
   
   /**
    * this method returns entity object
    *
    * @param entityName
    * @return
    */
   protected Object getObject(String entityName) {
       try {
           Class aClass = Class.forName(entityName);
           return aClass.newInstance();
       } catch (Exception e) {
           LOG.error("Error during migration", e);
       }
       return null;
   }
   
   
   /**
    * Check whether the contact is all ready exist in contact table.
    * @param contact
    * @return flag
    */
	public boolean contactExist(Contact contact) {
		
		//check whether the email id is comming 
		if(contact.getEmail() == null)
		{
			//create emailId by firstName and LastName
			contact.setEmail(contact.getFirstName()+"."+contact.getLastName()+"@xyz.com");
		}
		
		List<Contact> cont =  contactService.getAllContacts();
       boolean isContactExist = false;
		for (Contact c : cont) {
			if(contact.getEmail()!= null)
			{
				if(c.getEmail()!= null)
				{
					if(c.getEmail().equalsIgnoreCase(contact.getEmail()))
					{
						isContactExist = true;
						break;
					}
				}
			}
			else if (c.getFirstName().equals(contact.getFirstName()) && c.getLastName().equals(contact.getLastName())) {
				
				isContactExist = true;
				break;
			} 
		}
		return isContactExist;
	}
	
	/**
	 * 
	 * @param val
	 * @return
	 */
	 public VatCategory getVatCategoryByValue(String val) {
	        if (!val.isEmpty()){
	            switch (val){
	                case VAT_5:
	                    //val  ="VAT(5%)";
	                	val = "TAX (5%)";
	                    break;
	                case VAT_0:
	                   // val ="Zero VAT";
	                    val ="TAX (0%)";
	                    break;
	                default:
	            }
	           // BigDecimal bigDecimal = new  BigDecimal ((String) val);
	            if (val!=null) {
	                Map<String, Object> param = new HashMap<>();
	                param.put("name", val);
	                //param.put("vat", val);
	                List<VatCategory> vatCategoryList = vatCategoryService.findByAttributes(param);
	                for (VatCategory vatCategory : vatCategoryList) {
	                    return vatCategory;
	                }
	            }
	        }
	            VatCategory vatCategory = vatCategoryService.findByPK(2);
	            return vatCategory;
	    }
	 
	 /**
	  * 
	  * @param val
	  * @return
	  */
	 public Contact getContactByValue(String val) {
	        Map<String, Object> param = new HashMap<>();
	        param.put("firstName", val);
	        List<Contact> contactList = contactService.findByAttributes(param);
	       for (Contact Contact:contactList){
	           return Contact;
	       }
	        return null;
	    }
	 
	 
	 /**
	  * 
	  * @param val
	  * @return
	  */
	 public InvoiceDuePeriodEnum getInvoiceDuePeriod(String val) {
	        switch (val){
	            case DUE_ON_RECEIPT:
	               return InvoiceDuePeriodEnum.DUE_ON_RECEIPT;
	        }
	        return null;
	    }

	 
	 
		/**
		 * To check the InventoryEnabled
		 * 
		 * @param record
		 * @return
		 */
		public Boolean checkInventoryEnabled(Map<String, String> record) {
			String inventoryType = record.get("Item Type");
			if (!StringUtils.isEmpty(inventoryType) && StringUtils.equalsIgnoreCase(inventoryType, "Inventory"))
				return true;
	
			return false;
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
				List<Map<String, String>> mapList = parseCSVFile((String) fileLocation + File.separator + file);
	
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
	        for (File files : f) {
	            String fileName = files.getName();
	            inputFiles.add(fileName);
	        }
	
	        for (String fo : fileOrder) {
	            // check inputfile in file order list.
	            if (inputFiles.contains(fo)) {
	                resultSet.add(fo);
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
	        List<String> fileOrder = Arrays.asList("Contacts.csv","Contact.csv","Vendors.csv", "Item.csv", "Exchange_Rate.csv", "Invoice.csv", "Bill.csv", "Expense.csv", "Credit_Note.csv", "Purchase_Order.csv", "Chart_of_Accounts.csv");
	        return fileOrder;
	    }


	    protected TaxTreatment getTaxTreatmentByValue(String val) {
	    	return taxTreatmentRepository.findByTaxTreatment(val);
		}
		
	/**
	 *     
	 * @param val
	 * @return
	 */
	PlaceOfSupply getPlaceOfSupply(String val) {
		switch (val) {
		case ZohoMigrationConstants.DU:
			val = "Dubai";
			break;
		case ZohoMigrationConstants.AJ:
			val = "Ajman";
			break;
		case ZohoMigrationConstants.FU:
			val = "Fujairah";
		default:
		}
		PlaceOfSupply result = new PlaceOfSupply();
		PlaceOfSupply placeOfSupply = placeOfSupplyRepository.findByPlaceOfSupply(val);
		
		result.setId(placeOfSupply.getId());
		result.setPlaceOfSupply(placeOfSupply.getPlaceOfSupply());
		return result;
	}
	
	/**
	 * 
	 * @param val
	 * @return
	 */
	 public VatCategory getVatCategory(String val) {
	        if (!val.isEmpty()){
	            switch (val){
	                case VAT_5:
	                    //val  ="VAT(5%)";
	                	val = "TAX (5%)";
	                    break;
	                case VAT_0:
	                   // val ="Zero VAT";
	                    val ="TAX (0%)";
	                    break;
	                default:
	            }
	            if (val!=null) {
	                Map<String, Object> param = new HashMap<>();
	                param.put("name", val);
	                List<VatCategory> vatCategoryList = vatCategoryService.findByAttributes(param);
	                VatCategory vatCategoryResult = new VatCategory();
	                for (VatCategory vatCategory : vatCategoryList) {
	                	
	                	vatCategoryResult.setId(vatCategory.getId());
	                	vatCategoryResult.setName(vatCategory.getName());
	                	vatCategoryResult.setVat(vatCategory.getVat());
	                	vatCategoryResult.setDefaultFlag(vatCategory.getDefaultFlag());
	                	vatCategoryResult.setOrderSequence(vatCategory.getOrderSequence());
	                	vatCategoryResult.setCreatedBy(vatCategory.getCreatedBy());
	                	vatCategoryResult.setCreatedDate(vatCategory.getCreatedDate());
	                	vatCategoryResult.setLastUpdateBy(vatCategory.getLastUpdateBy());
	                	vatCategoryResult.setLastUpdateDate(vatCategory.getLastUpdateDate());
	                	vatCategoryResult.setDeleteFlag(vatCategory.getDeleteFlag());
	                	vatCategoryResult.setVersionNumber(vatCategory.getVersionNumber());
	                	vatCategoryResult.setVatLabel(vatCategory.getVatLabel());
	                	
	                    return vatCategoryResult;
	                }
	            }
	        }
	            VatCategory vatCategory = vatCategoryService.findByPK(2);
	            return vatCategory;
	    }	
}
