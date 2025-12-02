package com.simplevat.rest.reports;

import lombok.Data;

@Data
public class ReportsConfigurationModel {
    private Integer id;
    private String columnNames;
    private String reportName;
}