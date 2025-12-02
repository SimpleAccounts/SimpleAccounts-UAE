/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.model;

import java.math.BigDecimal;

/**
 *
 * @author daynil
 */
public class InvoiceDataSourceModel {

    String quantity;
    String details;
    String productOrService;
    BigDecimal unitPrice;
    BigDecimal vat;
    BigDecimal netSubtotal;

    public InvoiceDataSourceModel(String quantity, String productOrService, String details, BigDecimal unitPrice, BigDecimal vat, BigDecimal netSubtotal) {
        this.quantity = quantity;
        this.productOrService = productOrService;
        this.details = details;
        this.unitPrice = unitPrice;
        this.vat = vat;
        this.netSubtotal = netSubtotal;
    }

    public String getQuantity() {
        return quantity;
    }

    public void setQuantity(String quantity) {
        this.quantity = quantity;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getVat() {
        return vat;
    }

    public void setVat(BigDecimal vat) {
        this.vat = vat;
    }

    public BigDecimal getNetSubtotal() {
        return netSubtotal;
    }

    public void setNetSubtotal(BigDecimal netSubtotal) {
        this.netSubtotal = netSubtotal;
    }

    public String getProductOrService() {
        return productOrService;
    }

    public void setProductOrService(String productOrService) {
        this.productOrService = productOrService;
    }
    
    
}
