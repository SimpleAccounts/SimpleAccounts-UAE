package com.simplevat.rest.customizeinvoiceprefixsuffixccontroller;


import lombok.Data;

@Data
public class CustomizeInvoiceTemplateRequestModel {
    private Integer id;
    private Integer type;
    private String prefix;
    private Integer suffix;
}
