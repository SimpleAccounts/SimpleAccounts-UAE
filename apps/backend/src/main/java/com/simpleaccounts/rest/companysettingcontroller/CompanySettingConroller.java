package com.simpleaccounts.rest.companysettingcontroller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.entity.Configuration;
import com.simpleaccounts.service.ConfigurationService;

@RestController
@RequestMapping("/rest/companySetting")
public class CompanySettingConroller {

	@Autowired
	private CompanySettingRestHelper companySettingRestHelper;

	@Autowired
	private ConfigurationService configurationService;

	@LogRequest
	@GetMapping(value = "/get")
	public ResponseEntity<CompanySettingModel> getSetting() {
		return new ResponseEntity<>(companySettingRestHelper.getModel(), HttpStatus.OK);
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@PostMapping(value = "/update")
	public ResponseEntity<String> update(@RequestBody CompanySettingRequestModel requestModel) {

		List<Configuration> companySetting = companySettingRestHelper.getEntity(requestModel);

		if (companySetting == null) {
			return new ResponseEntity<>("Update Failure ..",HttpStatus.INTERNAL_SERVER_ERROR);
		}
		configurationService.updateConfigurationList(companySetting);
		return new ResponseEntity<>("Update Successfull ..",HttpStatus.OK);
	}

}
