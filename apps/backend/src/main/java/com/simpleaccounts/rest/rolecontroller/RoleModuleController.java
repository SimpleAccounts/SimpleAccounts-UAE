package com.simpleaccounts.rest.rolecontroller;

import com.simpleaccounts.aop.LogRequest;
import static com.simpleaccounts.constant.ErrorConstant.ERROR;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.model.RoleRequestModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.RoleModuleRelationService;
import com.simpleaccounts.service.RoleModuleService;
import com.simpleaccounts.service.RoleService;
import com.simpleaccounts.service.UserService;
import io.swagger.annotations.ApiOperation;
import java.time.LocalDateTime;
import java.util.*;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("rest/roleModule")
@RequiredArgsConstructor
public class RoleModuleController {
    private final Logger logger = LoggerFactory.getLogger(RoleModuleController.class);
    private final JwtTokenUtil jwtTokenUtil;

    private final RoleModuleRelationService roleModuleRelationService;

    private final RoleModuleService roleModuleService;

    private final RoleService roleService;

    private final RoleModuleRestHelper roleModuleRestHelper;

    private final UserService userService;

    @LogRequest
    @ApiOperation(value = "Get Module List")
    @GetMapping(value = "/getListForAllRoles")
    public ResponseEntity<Object> getModuleList(){
//        Integer userId = jwtTokenUtil.getUserIdFromHttpRequest();
        List<ModuleResponseModel> response  = new ArrayList<>();
        List<RoleModuleRelation> modulesList=roleModuleRelationService.getListOfSimpleAccountsModulesForAllRoles();
        if (modulesList != null) {
            response = roleModuleRestHelper.getModuleListForAllRoles(modulesList);
        }
        return new ResponseEntity<> (response, HttpStatus.OK);

    }

	@LogRequest
	@ApiOperation(value = "Get Module List")
	@GetMapping(value = "/getList")
	public ResponseEntity<Object> getModuleList(HttpServletRequest request){
        Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
        List<ModuleResponseModel> response  = new ArrayList<>();
        List<SimpleAccountsModules> modulesList=roleModuleService.getListOfSimpleAccountsModules();
        if (modulesList != null) {
            response = roleModuleRestHelper.getModuleList(modulesList);
        }
        return new ResponseEntity<> (response, HttpStatus.OK);

      }

    @LogRequest
    @ApiOperation(value = "Get Module List By RoleCode")
    @GetMapping(value = "/getModuleListByRoleCode")
    public ResponseEntity<Object> getModuleListByRoleCode(@RequestParam int roleCode){
        List<ModuleResponseModel> response  = new ArrayList<>();
        List<RoleModuleRelation> modulesList=roleModuleService.getModuleListByRoleCode(roleCode);
        if (modulesList != null) {
            response = roleModuleRestHelper.getModuleListForAllRoles(modulesList);
        }
        return new ResponseEntity<> (response, HttpStatus.OK);

    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Add New User Role")
    @PostMapping(value = "/save")
    public ResponseEntity<String> save(@RequestBody RoleRequestModel roleRequestModel,
                                       HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);

            Role role = new Role();
            if (roleRequestModel.getIsActive()!=null){
                role.setIsActive(roleRequestModel.getIsActive());
            }
            role.setDefaultFlag('N');
            role.setDeleteFlag(false);
            role.setVersionNumber(1);
            role.setRoleName(roleRequestModel.getRoleName());
            role.setRoleDescription(roleRequestModel.getRoleDescription());
            role.setCreatedBy(userId);
            role.setCreatedDate(LocalDateTime.now());
            roleService.persist(role);
            List<Integer> roleModuleIdList = roleRequestModel.getModuleListIds();
            if (roleModuleIdList!=null){
                for (Integer moduleId:roleModuleIdList){
                    SimpleAccountsModules simpleAccountsModule =roleModuleService.findByPK(moduleId);
                    RoleModuleRelation roleModuleRelation = new RoleModuleRelation();
                    roleModuleRelation.setCreatedDate(LocalDateTime.now());
                    roleModuleRelation.setRole(role);
                    roleModuleRelation.setSimpleAccountsModule(simpleAccountsModule);
                    roleModuleRelationService.persist(roleModuleRelation);
                }

            }
            return new ResponseEntity<>("Saved successful",HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
        }
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Update Role")
    @PostMapping(value = "/update")
    public ResponseEntity<String> update(@RequestBody RoleRequestModel roleRequestModel,
                                         HttpServletRequest request) {
    Role role = null;
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            role = roleModuleRestHelper.getEntity(roleRequestModel,request);
            roleService.update(role);
            List<Integer> roleModuleIdList = roleRequestModel.getModuleListIds();
            List<RoleModuleRelation> roleModuleRelationList = roleModuleService.getModuleListByRoleCode(roleRequestModel.getRoleID());
            if (roleModuleRelationList!=null && !roleModuleRelationList.isEmpty()){
                for (RoleModuleRelation roleModuleRelation:roleModuleRelationList){
                    roleModuleRelationService.delete(roleModuleRelation);
                    }
                }
            if (roleModuleIdList!=null){
                for (Integer moduleId:roleModuleIdList){
                    SimpleAccountsModules simpleAccountsModule =roleModuleService.findByPK(moduleId);

                   roleModuleRelationList = roleModuleService.getModuleListByRoleCode(roleRequestModel.getRoleID(),simpleAccountsModule.getSimpleAccountsModuleId());
                    if (roleModuleRelationList!=null && !roleModuleRelationList.isEmpty()){
                        for (RoleModuleRelation roleModuleRelation:roleModuleRelationList){
                            roleModuleRelation.setSimpleAccountsModule(simpleAccountsModule);
                            roleModuleRelation.setRole(role);
                            roleModuleRelationService.update(roleModuleRelation);
                        }
                    }
                    else
                    {
                        RoleModuleRelation roleModuleRelation = new RoleModuleRelation();
                        roleModuleRelation.setSimpleAccountsModule(simpleAccountsModule);
                        roleModuleRelation.setRole(role);
                        roleModuleRelationService.persist(roleModuleRelation);
                    }
                }

            }

            return new ResponseEntity<>("Updated successful",HttpStatus.OK);
        } catch (Exception e) {
            logger.info("NO DATA FOUND = INTERNAL_SERVER_ERROR");
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Delete Role")
    @DeleteMapping(value = "/delete")
    public ResponseEntity<String> deleteUser(@RequestParam(value = "roleCode") Integer roleCode) {
        Role role = roleService.findByPK(roleCode);
        try {
            if (role == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            } else {
                role.setDeleteFlag(true);
                roleService.update(role);

            }
            return new ResponseEntity<>("Deleted Successful",HttpStatus.OK);

        } catch (Exception e) {
            logger.error("Error", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }
    @LogRequest
    @ApiOperation(value = "Get Users Count For Role")
    @GetMapping(value = "/getUsersCountForRole")
    public ResponseEntity<Integer> getUsersCountForRole(@RequestParam int roleId){

        Role role = roleService.findByPK(roleId);
        Map<String,Object> param=new HashMap<>();
        param.put("role", role);
        param.put("isActive", true);
        param.put("deleteFlag", false);
        List<User> userList = userService.findByAttributes(param);
//        if (!userList.isEmpty()) {
           Integer response = userList.size();
            return new ResponseEntity<>(response, HttpStatus.OK);

    }

}
