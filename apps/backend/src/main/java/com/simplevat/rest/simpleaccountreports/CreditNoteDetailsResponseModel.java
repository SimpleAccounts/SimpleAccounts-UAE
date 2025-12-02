package com.simplevat.rest.simpleaccountreports;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class CreditNoteDetailsResponseModel {

    List<CreditNoteSummaryModel> creditNoteSummaryModelList;
    private BigDecimal totalAmount;
    private BigDecimal totalBalance;

}