package com.simpleaccounts.invoice.model;

import com.simpleaccounts.entity.Product;
import com.simpleaccounts.entity.VatCategory;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

/**
 * @author hiren
 */
@Getter
@Setter
public class InvoiceItemModel {

    private int id;
    private int quatity;
    private BigDecimal unitPrice;
    private VatCategory vatId;
    private String description;
    private BigDecimal subTotal=BigDecimal.ZERO;
    private Integer versionNumber = 1;
    private Product productService;

    public BigDecimal getSubTotal() {
        if (null != unitPrice) {
            subTotal = unitPrice.multiply(new BigDecimal(quatity));
        }
        return subTotal;
    }
}
