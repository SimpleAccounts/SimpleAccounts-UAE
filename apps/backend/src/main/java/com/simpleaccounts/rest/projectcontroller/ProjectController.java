/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.rest.projectcontroller;

import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.bank.model.DeleteModel;
import com.simpleaccounts.constant.dbfilter.ProjectFilterEnum;
import com.simpleaccounts.entity.Project;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.ProjectService;

import io.swagger.annotations.ApiOperation;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;

/**
 *
 * @author Sonu
 *
 *         Modified by saurabh 26/12/19
 */
@RestController
@RequestMapping(value = "/rest/project")
@RequiredArgsConstructor
public class ProjectController{

	private  final Logger logger = LoggerFactory.getLogger(ProjectController.class);

	private final  ProjectService projectService;

	private final  ProjectRestHelper projectRestHelper;

	private final JwtTokenUtil jwtTokenUtil;

	@LogRequest
	@ApiOperation(value = "Get Project By ID")
	@GetMapping(value = "/getProjectById")
	public ResponseEntity<ProjectRequestModel> getProductById(@RequestParam(value = "id") Integer id) {
		Project project = projectService.findByPK(id);
		if (project == null) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		} else {
			return new ResponseEntity<>(projectRestHelper.getRequestModel(project), HttpStatus.OK);
		}

	}

	@LogRequest
	@ApiOperation(value = "Get Project List")
	@GetMapping(value = "/getList")
	public ResponseEntity<PaginationResponseModel> getProductList(ProjectRequestFilterModel filterModel) {
		Map<ProjectFilterEnum, Object> filterDataMap = new HashMap();
		filterDataMap.put(ProjectFilterEnum.USER_ID, filterModel.getUserId());
		filterDataMap.put(ProjectFilterEnum.PROJECT_ID, filterModel.getProjectId());
		filterDataMap.put(ProjectFilterEnum.PROJECT_NAME, filterModel.getProjectName());
		filterDataMap.put(ProjectFilterEnum.VAT_REGISTRATION_NUMBER, filterModel.getVatRegistrationNumber());
		filterDataMap.put(ProjectFilterEnum.REVENUE_BUDGET, filterModel.getRevenueBudget());
		filterDataMap.put(ProjectFilterEnum.EXPENSE_BUDGET, filterModel.getExpenseBudget());
		filterDataMap.put(ProjectFilterEnum.DELETE_FLAG, filterModel.isDeleteFlag());

		PaginationResponseModel response = projectService.getProjectList(filterDataMap, filterModel);
		if (response == null) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
		response.setData(projectRestHelper.getListModel(response.getData()));
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@LogRequest
	@GetMapping(value = "/getProjectsForDropdown")
	public ResponseEntity<List<DropdownModel>> getContactsForDropdown() {
		List<DropdownModel> dropdownModels = projectService.getProjectsForDropdown();
		return new ResponseEntity<>(dropdownModels, HttpStatus.OK);
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete Project By ID")
	@DeleteMapping(value = "/delete")
	public ResponseEntity<String> deleteProject(@RequestParam(value = "id") Integer id){
		try {
			Project project = projectService.findByPK(id);

			if (project == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			} else {
				project.setDeleteFlag(Boolean.TRUE);
				projectService.update(project);
				return new ResponseEntity<>("Deleted Successfully",HttpStatus.OK);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete Project in Bulk")
	@DeleteMapping(value = "/deletes")
	public ResponseEntity<String> deleteProjects(@RequestBody DeleteModel ids){
		try {
			projectService.deleteByIds(ids.getIds());
			return new ResponseEntity<>(HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@PostMapping(value = "/save")
	public ResponseEntity<String> saveProject(@RequestBody ProjectRequestModel projectRequestModel, HttpServletRequest request){
		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
		Project project = projectRestHelper.getEntity(projectRequestModel);
		project.setCreatedBy(userId);
		project.setCreatedDate(LocalDateTime.now());
		projectService.persist(project);
		return new ResponseEntity<>("Saved Successfully",HttpStatus.OK);
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Update Product")
	@PostMapping(value = "/update")
	public ResponseEntity<String> update(@RequestBody ProjectRequestModel projectRequestModel, HttpServletRequest request) {
		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
		Project project = projectRestHelper.getEntity(projectRequestModel);
		project.setLastUpdateDate(LocalDateTime.now());
		project.setLastUpdateBy(userId);
		projectService.update(project);
		return new ResponseEntity("Updated Successfully",HttpStatus.OK);
	}

}
