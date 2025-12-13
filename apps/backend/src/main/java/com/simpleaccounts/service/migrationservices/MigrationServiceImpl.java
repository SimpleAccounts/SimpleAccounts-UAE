package com.simpleaccounts.service.migrationservices;

import com.simpleaccounts.rest.migration.model.UploadedFilesDeletionReqModel;
import com.simpleaccounts.rest.migrationcontroller.DataMigrationRespModel;
import com.simpleaccounts.rest.migrationcontroller.MigrationController;
import com.simpleaccounts.rest.migrationcontroller.TransactionCategoryListResponseModel;
import com.simpleaccounts.service.CountryService;
import com.simpleaccounts.service.InvoiceLineItemService;
import com.simpleaccounts.service.StateService;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MigrationServiceImpl implements MigrationService {
    private final Logger logger = LoggerFactory.getLogger(MigrationController.class);

    private final CountryService countryService;

    private final StateService stateService;

    private final InvoiceLineItemService invoiceLineItemService;
    
    private final ZohoMigrationService zohoMigrationService;
    
    private final SimpleAccountMigrationService simpleAccountMigrationService;
    
    private final MigrationUtil migrationUtil;

	@Override
	public List<DataMigrationRespModel> processTheMigratedData(String productName, String version, String fileLocation,
			Integer userId, String migFromDate, HttpServletRequest request) throws IOException {
		   List<DataMigrationRespModel> migratedDataList = new ArrayList<>();
		
            if(productName.equalsIgnoreCase(ZohoMigrationConstants.ZOHO))
            {
            	migratedDataList =  zohoMigrationService.processTheMigratedData(productName, version, fileLocation, userId, migFromDate,request);
            }
            else  if(productName.equalsIgnoreCase(SimpleAccountMigrationConstants.SIMPLE_ACCOUNTS))
            {
            	migratedDataList = simpleAccountMigrationService.processTheMigratedData(productName, version, fileLocation, userId, migFromDate);
            }
            
            else {	
            
            	log.info("Product Name not Supported....");
            }
		
		return migratedDataList;
	}

	@Override
	public List<DataMigrationRespModel> getMigrationSummary(String fileLocation, Integer userId, String migFromDate)
			throws IOException {

		List<DataMigrationRespModel> migrationSummaryList =  new ArrayList<>();
		
		migrationSummaryList = zohoMigrationService.getMigrationSummary(fileLocation, userId, migFromDate);
				
		return migrationSummaryList;
	}

	@Override
	public List<String> getUploadedFilesNames(String migrationPath) throws IOException {
		List<String>  zohoFileNames = zohoMigrationService.getUploadedFilesNames(migrationPath);
		return zohoFileNames;
	}

	@Override
	public List<DataMigrationRespModel> deleteFiles(String migrationPath, UploadedFilesDeletionReqModel fileNames) {
		List<DataMigrationRespModel> zohoDeletedFileNames = zohoMigrationService.deleteFiles(migrationPath,fileNames);
		return zohoDeletedFileNames;
	}

	@Override
	public TransactionCategoryListResponseModel getTransactionCategory() {
		TransactionCategoryListResponseModel transactionCategory =   migrationUtil.getTransactionCategory();
		return transactionCategory;
	}
   
}
