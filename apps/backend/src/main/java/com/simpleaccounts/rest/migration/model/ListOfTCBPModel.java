package com.simpleaccounts.rest.migration.model;

import com.simpleaccounts.rest.transactioncategorybalancecontroller.TransactioncategoryBalancePersistModel;
import lombok.Data;

import java.util.List;

@Data
public class ListOfTCBPModel {
    List<TransactioncategoryBalancePersistModel> persistModelList;
}
