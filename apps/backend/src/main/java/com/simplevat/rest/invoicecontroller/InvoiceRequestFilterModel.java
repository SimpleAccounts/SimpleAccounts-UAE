/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.rest.invoicecontroller;

import com.simplevat.rest.PaginationModel;
import java.math.BigDecimal;
import lombok.Data;

/**
 *
 * @author ashish
 */
@Data
public class InvoiceRequestFilterModel extends PaginationModel {

    private Integer contact;
    private String referenceNumber;
    private String invoiceDate;
    private String invoiceDueDate;
    private BigDecimal amount;
    private Integer status;
    private Integer type;
    private Integer currencyCode;
}
