package com.simplevat.rest.projectcontroller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.simplevat.entity.Project;
import com.simplevat.service.ContactService;
import com.simplevat.service.CurrencyService;
import com.simplevat.service.LanguageService;
import com.simplevat.service.ProjectService;

@Service
public class ProjectRestHelper {

	@Autowired
	private ContactService contactService;

	@Autowired
	private LanguageService languageService;

	@Autowired
	private CurrencyService currencyservice;

	@Autowired
	private ProjectService projectService;

	public List<ProjectListModel> getListModel(Object projectList) {
		List<ProjectListModel> projectListModels = new ArrayList();

		if (projectList != null) {
			for (Project project : (List<Project>) projectList) {
				ProjectListModel projectModel = new ProjectListModel();
				BeanUtils.copyProperties(project, projectModel);
				projectListModels.add(projectModel);
			}
		}
		return projectListModels;
	}

	public ProjectRequestModel getRequestModel(Project project) {

		ProjectRequestModel projectModel = new ProjectRequestModel();

		BeanUtils.copyProperties(project, projectModel);
		if (project.getContact() != null) {
			projectModel.setContactId(project.getContact().getContactId());
		}
		if (project.getInvoiceLanguageCode() != null) {
			projectModel.setInvoiceLanguageCode(project.getInvoiceLanguageCode().getLanguageCode());
		}
		if (project.getCurrency() != null) {
			projectModel.setCurrencyCode(project.getCurrency().getCurrencyCode());
		}

		return projectModel;
	}

	public Project getEntity(ProjectRequestModel projectRequestModel) {
		Project project = new Project();
		if (projectRequestModel.getProjectId() != null) {
			project = projectService.findByPK(projectRequestModel.getProjectId());
			project.setProjectId(projectRequestModel.getProjectId());
		}
		project.setProjectName(projectRequestModel.getProjectName());
		project.setExpenseBudget(projectRequestModel.getExpenseBudget());
		project.setRevenueBudget(projectRequestModel.getRevenueBudget());
		project.setContractPoNumber(projectRequestModel.getContractPoNumber());
		if (projectRequestModel.getContactId() != null) {
			project.setContact(contactService.findByPK(projectRequestModel.getContactId()));
		}
		project.setVatRegistrationNumber(projectRequestModel.getVatRegistrationNumber());
		if (projectRequestModel.getInvoiceLanguageCode() != null) {
			project.setInvoiceLanguageCode(languageService.findByPK(projectRequestModel.getInvoiceLanguageCode()));
		}
		if (projectRequestModel.getCurrencyCode() != null) {
			project.setCurrency(currencyservice.findByPK(projectRequestModel.getCurrencyCode()));
		}
		return project;
	}
}
