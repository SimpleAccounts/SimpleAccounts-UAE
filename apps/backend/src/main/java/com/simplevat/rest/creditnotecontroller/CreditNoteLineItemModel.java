package com.simplevat.rest.creditnotecontroller;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

/**
 * Created By Zain Khan
 */
@Getter
@Setter
public class CreditNoteLineItemModel {
    private Integer id;
    private Integer quantity;
    private String description;
    private BigDecimal unitPrice;
    private String vatCategoryId;
    private BigDecimal subTotal;
    private Integer vatPercentage;
    private Integer productId;
    private String productName;
    private Integer transactionCategoryId;
    private String transactionCategoryLabel;
    private Integer exciseTaxId;
    private BigDecimal exciseAmount;
    private BigDecimal vatAmount;
}
