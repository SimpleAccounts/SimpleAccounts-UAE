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
 * @author uday
 */
@Data
public class TransactionModel {

    private int id;
    private String transactionDate;
    private String description;
    private BigDecimal amount;
    private Boolean validData;
    private String format;
    private String date;
    private String credit;
    private String debit;
    private char type;
    
}
