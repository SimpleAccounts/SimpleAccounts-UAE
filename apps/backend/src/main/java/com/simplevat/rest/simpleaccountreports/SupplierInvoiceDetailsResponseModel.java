package com.simplevat.rest.simpleaccountreports;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;


@Data
public class SupplierInvoiceDetailsResponseModel {

    List<SupplierInvoiceDetailsModel> supplierInvoiceSummaryModelList;
    private BigDecimal totalAmount;
    private BigDecimal totalBalance;

}