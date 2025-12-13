package com.simpleaccounts.rest.migrationcontroller;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.entity.Company;
import com.simpleaccounts.migration.ProductMigrationParser;
import com.simpleaccounts.migration.xml.bindings.product.Product;
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
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.CompanyService;
import com.simpleaccounts.service.CountryService;
import com.simpleaccounts.service.StateService;
import com.simpleaccounts.service.migrationservices.FileStorageService;
import com.simpleaccounts.service.migrationservices.MigrationService;
import com.simpleaccounts.service.migrationservices.SimpleAccountMigrationService;
import com.simpleaccounts.service.migrationservices.ZohoMigrationService;
import com.simpleaccounts.utils.FileHelper;
import io.swagger.annotations.ApiOperation;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import static com.simpleaccounts.constant.ErrorConstant.ERROR;

@Slf4j
@RestController
@RequestMapping(value = "/rest/migration")
@RequiredArgsConstructor
public class MigrationController {
    private static final String LOG_INFO_PATTERN = "info{}";
    private static final String MSG_NO_FILES_AVAILABLE = "No Files Available";
    private static final Pattern SAFE_SAMPLE_FILE_NAME = Pattern.compile("^[a-zA-Z0-9._-]+$");
    
    private  final Logger logger = LoggerFactory.getLogger(MigrationController.class);

    private final JwtTokenUtil jwtTokenUtil;

    private final FileHelper fileHelper;

    	@Value("${simpleaccounts.migration.pathlocation}")    private final String basePath;

    private final ResourceLoader resourceLoader;

    private final CountryService countryService;

    private final StateService stateService;

    private final MigrationService migrationService;
    
    private final ZohoMigrationService zohoMigrationService;
    
    private final SimpleAccountMigrationService simpleAccountMigrationService;

    private final CompanyService companyService;
    
    private final FileStorageService fileStorageService;

//    /**
//     * This Api Will return The List Of Products Which User Wants To Migrate
//     * @param request
//     * @return
//     */

    @LogRequest
    @ApiOperation(value = "Persist Account Start Date")
    @PostMapping(value = "/saveAccountStartDate")
    public ResponseEntity<Void> saveAccountStartDate(Date accountStartDate, HttpServletRequest request){
        Company company = companyService.getCompany();
        accountStartDate(accountStartDate,company);
        companyService.update(company);
        return ResponseEntity.ok().build();
    }
    @LogRequest
    @ApiOperation(value = "Get All Products Names And Version")
    @GetMapping(value = "/list")
    public ResponseEntity<List<DropDownModelForMigration>> getMigratingProductsList(HttpServletRequest request) {
        try{
            List<DropDownModelForMigration> responseModel = new ArrayList<>();
            String rootPath = request.getServletContext().getRealPath("/");
            FileHelper.setRootPath(rootPath);
            ProductMigrationParser parser = ProductMigrationParser.getInstance();
            Map<String,Product> productMap = parser.getAppVersionsToProductMap();
            int i=0;
            for(String key : productMap.keySet())
            {
                String[] versions = key.split("_v");
                responseModel.add(new DropDownModelForMigration(i,versions[0]));
                i++;

            }
            return new ResponseEntity<>(responseModel, HttpStatus.OK);
        }catch (Exception e){
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    /**
     * This Api Will Return The Version Of Product Which Is To Be Migrated
     * @param productName
     * @param request
     * @return
     */
    @LogRequest
    @ApiOperation(value = "Get All Products Names And Version")
    @GetMapping(value = "/getVersionListByPrioductName")
    public ResponseEntity<List<DropDownModelForMigration>> getVersionListByPrioductName(@RequestParam String productName, HttpServletRequest request) {
        try{
            List<DropDownModelForMigration> responseModel = new ArrayList<>();

            ProductMigrationParser parser = ProductMigrationParser.getInstance();
            Map<String,Product> productMap = parser.getAppVersionsToProductMap();
            int i=0;
            for(String key : productMap.keySet())
            {
                String[] versions = key.split("_v");
                if(versions[0].contains(productName)) {
                    responseModel.add(new DropDownModelForMigration(i, versions[1]));
                    i++;
                }
            }
            return new ResponseEntity<>(responseModel, HttpStatus.OK);
        }catch (Exception e){
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * This Api Will Save the Migrated Data Into Matched Columns
     * @param request
     * @return
     */
    @ApiOperation(value = "Migrate The Data To SimpleAccounts")
	    @PostMapping(value = "/migrate")
	    @LogRequest
	    public ResponseEntity<Object> saveMigratedData(DataMigrationModel dataMigrationModel,HttpServletRequest request){
	        try {
	            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
	            String productName = dataMigrationModel.getName();
	           String path = request.getServletContext().getRealPath("/");
	           log.info(LOG_INFO_PATTERN,path);
	            String version = dataMigrationModel.getVersion();
	            String migrationPath = Paths.get(path, basePath).toString();

	            Company company = companyService.getCompany();
	            String migFromDate = company.getAccountStartDate().toString();
	            String[] migrationDate = migFromDate.split("T");
	            String date = migrationDate[0];
	            if (StringUtils.isEmpty(version) || StringUtils.isEmpty(productName)){
	                return new ResponseEntity<>("Invalid Request",HttpStatus.OK);
	            }
	         List<DataMigrationRespModel> dataMigrationRespModel =   migrationService.processTheMigratedData(productName,
	                 version,migrationPath,userId,date,request);
	            log.info("Response{}",dataMigrationRespModel);
	            //this will delete the uploaded files after completion of migration records
	            log.info(LOG_INFO_PATTERN,migrationPath);
	            log.info("rollBackMigratedData: {}", zohoMigrationService.rollBackMigratedData(migrationPath));
	            return new  ResponseEntity<> (dataMigrationRespModel,HttpStatus.OK);

	        }catch (Exception e){
	            logger.error(ERROR, e);
            return (new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     *This APi Will Persist The Files To SimpleAccounts At The Given Location
     * @param files
     * @return
     */
    @LogRequest
    @ApiOperation(value = "Upload Files To SimpleAccounts")
    @RequestMapping(value = "/uploadFolder", method = RequestMethod.POST, consumes = {"multipart/form-data"})
    public ResponseEntity<List<DataMigrationRespModel>> uploadFolder(@RequestBody MultipartFile[] files,HttpServletRequest request) {
        try {
            String path = request.getServletContext().getRealPath("/");
            String migrationPath = Paths.get(path, basePath).toString();
            log.info(LOG_INFO_PATTERN,migrationPath);
            log.debug("MigrationController::uploadFolder: Total File Length {}", files.length);
            
            log.info("deleteMigratedFiles: {}", zohoMigrationService.deleteMigratedFiles(migrationPath));
            List<DataMigrationRespModel> dataMigrationRespModelList = fileHelper.saveMultiFile(migrationPath, files);
            return new ResponseEntity<>(dataMigrationRespModelList,HttpStatus.OK);
            
            
        }catch (Exception e){
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    private void accountStartDate(Date  accountStartDate, Company company) {
        log.info("accountStartDate before {}", accountStartDate);
        if (accountStartDate != null) {
            Instant instant = Instant.ofEpochMilli(accountStartDate.getTime());
            LocalDateTime date = LocalDateTime.ofInstant(instant,
                    ZoneId.systemDefault());
            company.setAccountStartDate(date);
            log.info("date setValue {}",date );
        }
    }
    
    /**
     * This Api Will Return Existing Transaction Category And Not Existing T.C
     * @param request
     * @return
     */
    @ApiOperation(value = "List of Transaction Category")
    @GetMapping(value = "/listOfTransactionCategory")
    @LogRequest
    public ResponseEntity<Object> listOfTransactionCategory(HttpServletRequest request){
        try {
            String path = request.getServletContext().getRealPath("/");
            String migrationPath = Paths.get(path, basePath).toString();
            log.info(LOG_INFO_PATTERN,migrationPath);
            FileHelper.setRootPath(migrationPath);
            TransactionCategoryListResponseModel transactionCategory = migrationService.getTransactionCategory();
            log.info("Response{}",transactionCategory);
            return new  ResponseEntity<> (transactionCategory,HttpStatus.OK);

        }catch (Exception e){
            logger.error(ERROR, e);
            return (new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * This Api Will Return The File Content
     * @param fileName,request
     * @return
     */
    @ApiOperation(value = "Get CSV File Data ")
    @GetMapping(value = "/getFileData")
    @LogRequest
    public ResponseEntity<Object> getCsvFileData(String fileName,HttpServletRequest request){
        try {
            String path = request.getServletContext().getRealPath("/");
            String migrationPath = Paths.get(path, basePath).toString();
            log.info(LOG_INFO_PATTERN,migrationPath);
			if (fileName.equals("Contacts.csv")) {
				List<ContactsModel> contactsModel = zohoMigrationService.getCsvFileDataForIContacts(migrationPath,fileName);
				return new ResponseEntity<>(contactsModel, HttpStatus.OK);
			}
			if (fileName.equals("Vendors.csv")) {
				List<VendorsModel> vendorsModel = zohoMigrationService.getCsvFileDataForIVendors(migrationPath,fileName);
				return new ResponseEntity<>(vendorsModel, HttpStatus.OK);
			}
			if (fileName.equals("Item.csv")) {
				List<ItemModel> itemModel = zohoMigrationService.getCsvFileDataForItem(migrationPath,fileName);
				return new ResponseEntity<>(itemModel, HttpStatus.OK);
			}
			if (fileName.equals("Invoice.csv")) {
				List<InvoiceModel> invoiceModel = zohoMigrationService.getCsvFileDataForInvoice(migrationPath,fileName);
				return new ResponseEntity<>(invoiceModel, HttpStatus.OK);
			}
			if (fileName.equals("Bill.csv")) {
				List<BillModel> billModel = zohoMigrationService.getCsvFileDataForBill(migrationPath,fileName);
				return new ResponseEntity<>(billModel, HttpStatus.OK);
			}
			if (fileName.equals("Credit_Note.csv")) {
				List<CreditNoteModel> creditNoteModel = zohoMigrationService.getCsvFileDataForCreditNote(migrationPath,fileName);
				return new ResponseEntity<>(creditNoteModel, HttpStatus.OK);
			}
			if (fileName.equals("Expense.csv")) {
				List<ExpenseModel> expenseModel = zohoMigrationService.getCsvFileDataForExpense(migrationPath,fileName);
				return new ResponseEntity<>(expenseModel, HttpStatus.OK);
			}
			if (fileName.equals("Purchase_Order.csv")) {
				List<PurchaseOrderModel> purchaseOrderModel = zohoMigrationService.getCsvFileDataForPurchaseOrder(migrationPath,fileName);
				return new ResponseEntity<>(purchaseOrderModel, HttpStatus.OK);
			}
			if (fileName.equals("Chart_of_Accounts.csv")) {
				List<ChartOfAccountsModel> chartOfAccountsModel = zohoMigrationService.ChartOfAccounts(migrationPath,fileName);
				return new ResponseEntity<>(chartOfAccountsModel, HttpStatus.OK);
			}
			if (fileName.equals("Exchange_Rate.csv")) {
				List<ExchangeRateModel> exchangeRateModel = zohoMigrationService.getCsvFileDataForExchangeRate(migrationPath,fileName);
				return new ResponseEntity<>(exchangeRateModel, HttpStatus.OK);
			}
        else {
        	 return new  ResponseEntity<>("There is No Data To Display In File",HttpStatus.OK);
        }
        }catch (Exception e){
            logger.error(ERROR, e);
            return (new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * This Api Will Return All Files Names Which Are Uploaded
     * @param request
     * @return
     */
    @LogRequest
    @ApiOperation("List Of All Uploaded Files ")
    @GetMapping(value = "/getListOfAllFiles")
    public ResponseEntity<Object> getListOfAllFilesNames(HttpServletRequest request){
        String path = request.getServletContext().getRealPath("/");
        String migrationPath = Paths.get(path, basePath).toString();
        log.info("info{}",migrationPath);
        List<String> zohoFileNames;
		try {
			zohoFileNames = migrationService.getUploadedFilesNames(migrationPath);
        if (!zohoFileNames.isEmpty()){
            return new ResponseEntity<>(zohoFileNames,HttpStatus.OK);
        }
        else
        	{
        		return new  ResponseEntity<>( MSG_NO_FILES_AVAILABLE,HttpStatus.OK);
        	}
		} catch (IOException e) {
			 return (new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
		}
    }
    
    /**
     * This Api Will Return All Files Names Which Are Deleted
     * @param request
     * @return
     */
    @LogRequest
    @ApiOperation("Delete Uploaded Files ")
    @DeleteMapping(value = "/deleteFiles")
    public ResponseEntity<Object> deleteFilesByFilesNames(@RequestBody UploadedFilesDeletionReqModel fileNames ,HttpServletRequest request){
        String path = request.getServletContext().getRealPath("/");
        String migrationPath = Paths.get(path, basePath).toString();
        log.info("info{}",migrationPath);
        List<DataMigrationRespModel> zohoDeletedFileNames = migrationService.deleteFiles(migrationPath,fileNames);
        if (!zohoDeletedFileNames.isEmpty()){
            return new ResponseEntity<>(zohoDeletedFileNames,HttpStatus.OK);
        }
        else return new  ResponseEntity<>( MSG_NO_FILES_AVAILABLE,HttpStatus.OK);
    }

    /**
     * This Api Will Return The Migration Summary
     * @param request
     * @return
     */
    @LogRequest
    @ApiOperation("Migration Summary ")
    @GetMapping(value = "/getMigrationSummary")
    public ResponseEntity<List<DataMigrationRespModel>> getMigrationSummary(HttpServletRequest request) throws IOException {
        Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
        String path = request.getServletContext().getRealPath("/");
        String migrationPath = Paths.get(path, basePath).toString();
        log.info("info{}",migrationPath);
        Company company = companyService.getCompany();
        String migFromDate = company.getAccountStartDate().toString();
        String[] migrationDate = migFromDate.split("T");
        String date = migrationDate[0];
        List<DataMigrationRespModel> migrationRespModelList = migrationService.getMigrationSummary(migrationPath,userId,date);

        return new ResponseEntity<>(migrationRespModelList,HttpStatus.OK);
    }
    @LogRequest
    @ApiOperation("Delete Uploaded Files ")
    @DeleteMapping(value = "/rollbackMigratedData")
    public ResponseEntity<Object> rollbackMigratedData(HttpServletRequest request){
        try {
            String path = request.getServletContext().getRealPath("/");
            String migrationPath = Paths.get(path, basePath).toString();
            log.info(LOG_INFO_PATTERN,migrationPath);
            String rollBackMigratedData = zohoMigrationService.rollBackMigratedData(migrationPath);
            return new ResponseEntity<>(rollBackMigratedData,HttpStatus.OK);
        }catch (Exception e){
            return new  ResponseEntity<>( "No Files Available",HttpStatus.OK);
        }
    }
    
	@LogRequest
		@ApiOperation(value = "Download Sample csv of Migration")
		@GetMapping(value = "/downloadcsv/{fileName:.+}")
		public ResponseEntity<Object> downloadSimpleFile(@PathVariable String fileName) {
			if (StringUtils.isBlank(fileName) || !SAFE_SAMPLE_FILE_NAME.matcher(fileName).matches()) {
				return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
			}
			ClassLoader classLoader = getClass().getClassLoader();
			String resourcePath;
			switch (fileName) {
				case "Chart_Of_Accounts.csv":
					resourcePath = "sample-file/Chart_Of_Accounts.csv";
					break;
				case "Contacts.csv":
					resourcePath = "sample-file/Contacts.csv";
					break;
				case "Credit_Note.csv":
					resourcePath = "sample-file/Credit_Note.csv";
					break;
				case "Invoice.csv":
					resourcePath = "sample-file/Invoice.csv";
					break;
				case "Opening_Balances.csv":
					resourcePath = "sample-file/Opening_Balances.csv";
					break;
				case "Product.csv":
					resourcePath = "sample-file/Product.csv";
					break;
				default:
					return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
			}
			java.net.URL resourceUrl = classLoader.getResource(resourcePath);
			if (resourceUrl == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
		File file = new File(resourceUrl.getFile());
		String content = null;
		try {
			content = FileUtils.readFileToString(file, StandardCharsets.UTF_8);

		} catch (IOException e ) {
			logger.error("Error during migration", e);
		}
		return ResponseEntity.ok()
				.contentType(MediaType.parseMediaType("application/octet-stream"))
				.header(HttpHeaders.CONTENT_DISPOSITION)
				.body(content);
	}
    
    
    @GetMapping("/downloadFile/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName, HttpServletRequest request) {
    	Resource resource = null;
        String contentType = null;
        try {
        	// Load file as Resource
        	resource = fileStorageService.loadFileAsResource(fileName);
        	log.info("resource ==> {}",resource);
        	
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            logger.info("Could not determine file type.");
        }

        // Fallback to the default content type if type could not be determined
        if(contentType == null) {
            contentType = "application/octet-stream";
        }
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + resource.getFilename())
                .body(resource);
                
    }
    
}
