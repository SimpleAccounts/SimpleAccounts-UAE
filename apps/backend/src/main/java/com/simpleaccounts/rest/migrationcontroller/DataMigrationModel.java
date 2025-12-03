package com.simpleaccounts.rest.migrationcontroller;

import lombok.Data;

@Data
public class DataMigrationModel {
    private String name;
    private String version;
    private String fileLocation;
    private String migFromDate;
}
