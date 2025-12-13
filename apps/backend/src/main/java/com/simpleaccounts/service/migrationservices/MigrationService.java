package com.simpleaccounts.service.migrationservices;

import com.simpleaccounts.rest.migration.model.UploadedFilesDeletionReqModel;
import com.simpleaccounts.rest.migrationcontroller.DataMigrationRespModel;
import com.simpleaccounts.rest.migrationcontroller.TransactionCategoryListResponseModel;

import java.io.IOException;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

public interface MigrationService {

	List<DataMigrationRespModel> processTheMigratedData(String productName, String version, String fileLocation,
			Integer userId, String migFromDate, HttpServletRequest request) throws IOException;

	List<DataMigrationRespModel> getMigrationSummary(String fileLocation, Integer userId, String migFromDate)
			throws IOException;
	
	List<String> getUploadedFilesNames(String migrationPath) throws IOException;
	
	List<DataMigrationRespModel> deleteFiles(String migrationPath, UploadedFilesDeletionReqModel fileNames);
	
	//listOfTransactionCategory
	TransactionCategoryListResponseModel getTransactionCategory();
	
	
}
