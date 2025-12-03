package com.simpleaccounts.rest.migration.model;

import lombok.Data;

import java.util.List;

/**
 * Created By Zain Khan On 13-10-2021
 */
@Data
public class UploadedFilesDeletionReqModel {
    private List<String> fileNames;
}
