package com.simpleaccounts.rest.migrationcontroller;

import java.util.List;
import lombok.Data;

@Data
public class TransactionCategoryListResponseModel {
	
    private List<TransactionCategoryModelForMigration> listOfExist;
    private List<String>  listOfNotExist;

}
