package com.simplevat.rest.migrationcontroller;

import lombok.Data;

import java.util.List;

@Data
public class DataMigrationRespModel {
    private String migrationBeginningDate;
    private String executionDate;
    private String fileName;
    private Long recordCount;
    private Long recordsMigrated;
    private Long recordsRemoved;

}
