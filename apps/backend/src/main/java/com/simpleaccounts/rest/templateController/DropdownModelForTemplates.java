package com.simpleaccounts.rest.templateController;

import lombok.Builder;
import lombok.Data;

/**
 *
 * @author Suraj Rahade
 */
@Data
@Builder
public class DropdownModelForTemplates {
    private Integer templateId;
    private Boolean enable;

    public DropdownModelForTemplates(Integer templateId, Boolean enable){
        this.enable = enable;
        this.templateId = templateId;
    }
}