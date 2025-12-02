package com.simplevat.rest.migration.model;

import com.simplevat.rest.transactioncategorybalancecontroller.TransactioncategoryBalancePersistModel;
import lombok.Data;

import java.util.List;

@Data
public class ListOfTCBPModel {
    List<TransactioncategoryBalancePersistModel> persistModelList;
}
