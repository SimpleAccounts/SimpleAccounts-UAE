package com.simpleaccounts.rest.CorporateTax.Model;

import lombok.Data;;
import java.math.BigDecimal;
@Data
public class CorporateTaxPaymentModel {
    private Integer id;
    private BigDecimal totalAmount;
    private BigDecimal balanceDue;
    private BigDecimal amountPaid;
    private String referenceNumber;
    private String paymentDate;
    private Integer transactionId;
    private Integer corporateTaxFilingId;
    private Integer depositToTransactionCategoryId;
}
