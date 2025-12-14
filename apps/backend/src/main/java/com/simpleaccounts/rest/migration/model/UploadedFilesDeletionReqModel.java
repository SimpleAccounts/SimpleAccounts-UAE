package com.simpleaccounts.rest.migration.model;

import java.util.List;
import lombok.Data;

/**
 * Created By Zain Khan On 13-10-2021
 */
@Data
public class UploadedFilesDeletionReqModel {
    private List<String> fileNames;
}
