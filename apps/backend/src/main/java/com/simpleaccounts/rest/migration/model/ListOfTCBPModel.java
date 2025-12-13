package com.simpleaccounts.rest.migration.model;

import com.simpleaccounts.rest.transactioncategorybalancecontroller.TransactioncategoryBalancePersistModel;
import java.util.List;
import lombok.Data;

@Data
public class ListOfTCBPModel {
    List<TransactioncategoryBalancePersistModel> persistModelList;
}
