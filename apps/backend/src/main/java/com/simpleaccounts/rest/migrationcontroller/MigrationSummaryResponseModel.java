package com.simpleaccounts.rest.migrationcontroller;

import java.util.List;
import lombok.Data;

@Data
public class MigrationSummaryResponseModel {
    private List<String> filename;
    private List<Integer> recordsCount;
    private List<Integer> recordsMigrated;
}
