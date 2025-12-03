package com.simpleaccounts.rest.migrationcontroller;

import lombok.Builder;
import lombok.Data;


/**
 *
 * @author uday
 */
@Data
@Builder
public class DropDownModelForMigration {
    private int value;
    private String label;

    public DropDownModelForMigration(int value, String label){
        this.value = value;
        this.label = label;
    }
}
