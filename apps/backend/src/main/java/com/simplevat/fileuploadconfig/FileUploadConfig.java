package com.simplevat.fileuploadconfig;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.simplevat.utils.OSValidator;

/**
 * @author S@urabh
 */
@Configuration
public class FileUploadConfig {

	private final Logger LOGGER = LoggerFactory.getLogger(FileUploadConfig.class);

	@Value("${simplevat.filelocation}")
	private String fileLocationWindows;

	@Value("${simplevat.filelocation.linux}")
	private String fileLocationLinux;

	/**
	 * set basePath for uploading file based upon system specify path in application.properties
	 * file 
	 */
	@Bean(name = { "basePath" })
	public String getFileBaseLocation() {

		String fileLocation = fileLocationLinux;
		if (OSValidator.isWindows()) {
			fileLocation = fileLocationWindows;
			LOGGER.info("WINDOW SYSTEM");
		} else {
			LOGGER.info("LINUX SYSTEM");
		}
		LOGGER.info("FILE UPLOAD BASE PATH", fileLocation);
		return fileLocation;
	}
}
