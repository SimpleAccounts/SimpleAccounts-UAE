/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.model;

import java.math.BigDecimal;
import lombok.Data;

/**
 *
 * @author daynil
 */
@Data
public class ExpenseItemModel {

    private int id;
    private int quantity;
    private BigDecimal unitPrice;
    private Integer vatCategoryId;
    private Integer transactionCategoryId;
    private BigDecimal subTotal;
    private Integer versionNumber = 1;
}
