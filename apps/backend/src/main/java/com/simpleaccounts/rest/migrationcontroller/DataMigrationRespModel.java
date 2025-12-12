package com.simpleaccounts.rest.migrationcontroller;

import lombok.Data;

@Data
public class DataMigrationRespModel {
    private String migrationBeginningDate;
    private String executionDate;
    private String fileName;
    private Long recordCount;
    private Long recordsMigrated;
    private Long recordsRemoved;

}
