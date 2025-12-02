package com.simplevat.rest.rolecontroller;


import com.simplevat.entity.Role;
import com.simplevat.entity.RoleModuleRelation;
import com.simplevat.entity.SimplevatModules;
import com.simplevat.entity.bankaccount.TransactionCategory;
import com.simplevat.model.RoleRequestModel;
import com.simplevat.rest.SingleLevelDropDownModel;
import com.simplevat.rest.transactioncategorycontroller.TransactionCategoryModel;
import com.simplevat.security.JwtTokenUtil;
import com.simplevat.service.RoleService;
import com.simplevat.service.impl.RoleServiceImpl;
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
    public List<ModuleResponseModel> getModuleList(Object simplevatModules){
        List<ModuleResponseModel> moduleResponseModelList = new ArrayList<>();

        if (simplevatModules != null) {
            for (SimplevatModules modules : (List<SimplevatModules>) simplevatModules) {
               if(modules.getSimplevatModuleName().equalsIgnoreCase("EmployeeFinancialDetails")==false) {
                   ModuleResponseModel moduleResponseModel = new ModuleResponseModel();
                   if (modules.getSimplevatModuleId() != null) {
                       moduleResponseModel.setModuleId(modules.getSimplevatModuleId());
                   }
                   if (modules.getSimplevatModuleName() != null) {
                       moduleResponseModel.setModuleName(modules.getSimplevatModuleName());
                   }
                   if (modules.getParentModule() != null) {
                       moduleResponseModel.setParentModuleId(modules.getParentModule().getSimplevatModuleId());

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
                if (moduleRelation.getSimplevatModule().getSimplevatModuleId()!=null){

                    moduleResponseModel.setModuleId(moduleRelation.getSimplevatModule().getSimplevatModuleId());
                }
                if (moduleRelation.getSimplevatModule().getSimplevatModuleName()!=null){
                    moduleResponseModel.setModuleName(moduleRelation.getSimplevatModule().getSimplevatModuleName());
                }
                if (moduleRelation.getSimplevatModule().getModuleType()!=null){
                    moduleResponseModel.setModuleType(moduleRelation.getSimplevatModule().getModuleType());
                }
                moduleResponseModel.setIsActive(moduleRelation.getRole().getIsActive());
               moduleResponseModelList.add(moduleResponseModel);

            }

        }
        return moduleResponseModelList;
    }
}
