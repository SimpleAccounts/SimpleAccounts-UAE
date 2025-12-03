/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.model;

import com.simpleaccounts.entity.Product;
import com.simpleaccounts.entity.VatCategory;
import java.math.BigDecimal;
import lombok.Data;

/**
 *
 * @author daynil
 */
@Data
public class ExpenseRestItemModel {

    private int id;
    private int quatity;
    private BigDecimal unitPrice;
    private VatCategory vatId;
    private String description;
    private BigDecimal subTotal;
    private Integer versionNumber = 1;
    private Product expenseLineItemProductService;
    private Boolean isProductSelected = Boolean.TRUE;
    private String productName;
}
