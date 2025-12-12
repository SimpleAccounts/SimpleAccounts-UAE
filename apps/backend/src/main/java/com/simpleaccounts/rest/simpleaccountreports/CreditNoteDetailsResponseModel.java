package com.simpleaccounts.rest.simpleaccountreports;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CreditNoteDetailsResponseModel {

    List<CreditNoteSummaryModel> creditNoteSummaryModelList;
    private BigDecimal totalAmount;
    private BigDecimal totalBalance;

}