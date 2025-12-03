package com.simpleaccounts.rest.migrationcontroller;

import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.transactioncategorycontroller.TransactionCategoryModel;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class TransactionCategoryListResponseModel {
	
    private List<TransactionCategoryModelForMigration> listOfExist;
    private List<String>  listOfNotExist;
    //private List<TransactionCategoryModelForMigration> transactionCategoryModelForMigrationList;

}
