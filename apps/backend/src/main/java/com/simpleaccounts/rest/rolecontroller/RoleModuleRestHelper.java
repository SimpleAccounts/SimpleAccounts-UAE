package com.simpleaccounts.rest.rolecontroller;


import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.RoleModuleRelation;
import com.simpleaccounts.entity.SimpleAccountsModules;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.model.RoleRequestModel;
import com.simpleaccounts.rest.SingleLevelDropDownModel;
import com.simpleaccounts.rest.transactioncategorycontroller.TransactionCategoryModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.RoleService;
import com.simpleaccounts.service.impl.RoleServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Component
public class RoleModuleRestHelper {

    private final Logger logger = LoggerFactory.getLogger(RoleModuleRestHelper.class);

    @Autowired
    RoleService roleService;

    @Autowired
    RoleRequestModel roleRequestModel;

    @Autowired
    RoleServiceImpl roleServiceImpl;

    @Autowired
    JwtTokenUtil jwtTokenUtil;

    public Role getEntity(RoleRequestModel roleRequestModel,  HttpServletRequest request) {

        if (roleRequestModel!= null) {

        Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            Role role = roleService.findByPK(roleRequestModel.getRoleID());
            if (roleRequestModel.getIsActive()!=null){
                role.setIsActive(roleRequestModel.getIsActive());
            }
           if(roleRequestModel.getRoleName()!=null)
               role.setRoleName(roleRequestModel.getRoleName());
           if(roleRequestModel.getRoleDescription()!=null)
               role.setRoleDescription(roleRequestModel.getRoleDescription());

            return role;
        }
        return null;
    }
    public List<ModuleResponseModel> getModuleList(Object simpleAccountsModules){
        List<ModuleResponseModel> moduleResponseModelList = new ArrayList<>();

        if (simpleAccountsModules != null) {
            for (SimpleAccountsModules modules : (List<SimpleAccountsModules>) simpleAccountsModules) {
               if(modules.getSimpleAccountsModuleName().equalsIgnoreCase("EmployeeFinancialDetails")==false) {
                   ModuleResponseModel moduleResponseModel = new ModuleResponseModel();
                   if (modules.getSimpleAccountsModuleId() != null) {
                       moduleResponseModel.setModuleId(modules.getSimpleAccountsModuleId());
                   }
                   if (modules.getSimpleAccountsModuleName() != null) {
                       moduleResponseModel.setModuleName(modules.getSimpleAccountsModuleName());
                   }
                   if (modules.getParentModule() != null) {
                       moduleResponseModel.setParentModuleId(modules.getParentModule().getSimpleAccountsModuleId());

                   }
                   moduleResponseModelList.add(moduleResponseModel);
               }
            }
            }
        return moduleResponseModelList;
    }
    public List<ModuleResponseModel> getModuleListForAllRoles(Object roleModuleRelation) {
        List<ModuleResponseModel> moduleResponseModelList = new ArrayList<>();
        if (roleModuleRelation!=null){
            for (RoleModuleRelation moduleRelation:(List<RoleModuleRelation>) roleModuleRelation){
                ModuleResponseModel moduleResponseModel = new ModuleResponseModel();
                if (moduleRelation.getRole().getRoleCode()!=null){
                    moduleResponseModel.setRoleCode(moduleRelation.getRole().getRoleCode());
                }
                if (moduleRelation.getRole().getRoleName()!=null){
                    moduleResponseModel.setRoleName(moduleRelation.getRole().getRoleName());
                }
                if (moduleRelation.getRole().getRoleDescription()!=null){
                    moduleResponseModel.setModuleDescription(moduleRelation.getRole().getRoleDescription());
                }
                if (moduleRelation.getSimpleAccountsModule().getSimpleAccountsModuleId()!=null){

                    moduleResponseModel.setModuleId(moduleRelation.getSimpleAccountsModule().getSimpleAccountsModuleId());
                }
                if (moduleRelation.getSimpleAccountsModule().getSimpleAccountsModuleName()!=null){
                    moduleResponseModel.setModuleName(moduleRelation.getSimpleAccountsModule().getSimpleAccountsModuleName());
                }
                if (moduleRelation.getSimpleAccountsModule().getModuleType()!=null){
                    moduleResponseModel.setModuleType(moduleRelation.getSimpleAccountsModule().getModuleType());
                }
                moduleResponseModel.setIsActive(moduleRelation.getRole().getIsActive());
               moduleResponseModelList.add(moduleResponseModel);

            }

        }
        return moduleResponseModelList;
    }
}
