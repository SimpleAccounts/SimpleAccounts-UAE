/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.rest.paymentcontroller;

import com.simplevat.rest.PaginationModel;
import java.math.BigDecimal;
import lombok.Data;

/**
 *
 * @author ashish
 */
@Data
public class PaymentRequestFilterModel extends PaginationModel {

    private Integer supplierId;
    private String paymentDate;
    private BigDecimal invoiceAmount;
}
