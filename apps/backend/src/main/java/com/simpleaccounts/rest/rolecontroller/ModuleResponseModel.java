package com.simpleaccounts.rest.rolecontroller;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ModuleResponseModel {
    private Integer roleCode;
    private String roleName;
    private String roleDescription;
    private Integer moduleId;
    private String moduleName;
    private String moduleDescription;
    private String moduleType;
    private Boolean editableFlag = Boolean.FALSE;
    private Boolean deleteFlag = Boolean.FALSE;
    private Integer parentModuleId;
    private Character defaultFlag;
    private Integer orderSequence;
    private Integer createdBy = 0;
    private Boolean isActive;

}
