package com.simplevat.rest.migrationcontroller;

import lombok.Data;

import java.util.List;

@Data
public class MigrationSummaryResponseModel {
    private List<String> filename;
    private List<Integer> recordsCount;
    private List<Integer> recordsMigrated;
}
