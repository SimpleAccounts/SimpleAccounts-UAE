package com.simplevat.invoice.model;

import com.simplevat.entity.Product;
import com.simplevat.entity.VatCategory;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

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
