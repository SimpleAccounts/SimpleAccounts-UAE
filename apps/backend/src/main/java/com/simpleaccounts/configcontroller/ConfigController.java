package com.simpleaccounts.configcontroller;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.constant.ConfigurationConstants;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;

import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.simpleaccounts.constant.ConfigurationConstants;

import io.swagger.annotations.ApiOperation;

@RestController
@RequestMapping("/rest/config")
@RequiredArgsConstructor
public class ConfigController{

	private final Environment env;

	@LogRequest
	@ApiOperation(value = "Get Release Number")
	@GetMapping(value = "/getreleasenumber")
	public SimpleAccountsConfigModel getReleaseNumber()
	{
		SimpleAccountsConfigModel config = new SimpleAccountsConfigModel();
		String release = env.getProperty(ConfigurationConstants.SIMPLEACCOUNTS_RELEASE);
		if (release != null && !release.isEmpty()) {
			config.setSimpleAccountsRelease(release);
		} else {
			config.setSimpleAccountsRelease("Unknown");
		}

		return config;
	}
}
