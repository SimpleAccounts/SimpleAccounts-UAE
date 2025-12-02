package com.simplevat.configcontroller;

import com.simplevat.aop.LogRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.simplevat.constant.ConfigurationConstants;

import io.swagger.annotations.ApiOperation;


@RestController
@RequestMapping("/rest/config")
public class ConfigController{

	@Autowired
	private Environment env;

	@LogRequest
	@ApiOperation(value = "Get Release Number")
	@GetMapping(value = "/getreleasenumber")
	public SimpleVatConfigModel getReleaseNumber()
	{
		SimpleVatConfigModel config = new SimpleVatConfigModel();
		if (env.getProperty(ConfigurationConstants.SIMPLEVAT_RELEASE) != null && !env.getProperty(ConfigurationConstants.SIMPLEVAT_RELEASE).isEmpty()) {
			config.setSimpleVatRelease(env.getProperty("SIMPLEVAT_RELEASE"));
		}
		else {
			config.setSimpleVatRelease("Unknown");
		}

		return config;
	}
}
