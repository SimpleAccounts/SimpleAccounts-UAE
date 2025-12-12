package com.simpleaccounts.rest.migrationcontroller;

import lombok.Data;

import java.util.List;

@Data
public class TransactionCategoryListResponseModel {
	
    private List<TransactionCategoryModelForMigration> listOfExist;
    private List<String>  listOfNotExist;
    //private List<TransactionCategoryModelForMigration> transactionCategoryModelForMigrationList;

}
