package com.simpleaccounts.fileuploadconfig;

import com.simpleaccounts.utils.OSValidator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * @author S@urabh
 */
@Configuration
public class StaticResourceConfiguration implements WebMvcConfigurer {

	private final String fileLocation;
	private final String fileLocationLinux;

	public StaticResourceConfiguration(
			@Value("${simpleaccounts.filelocation:upload/}") String fileLocation,
			@Value("${simpleaccounts.filelocation.linux:}") String fileLocationLinux) {
		this.fileLocation = fileLocation;
		this.fileLocationLinux = fileLocationLinux;
	}

	private String resolveBasePath() {
		if (OSValidator.isWindows()) {
			return fileLocation;
		}

		if (fileLocationLinux != null && !fileLocationLinux.isBlank()) {
			return fileLocationLinux;
		}

		return fileLocation;
	}

	/**
	 * @param basePath set base path for view file from server
	 */
	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		String basePath = resolveBasePath();
		/**
		 * @author $@urabh map "/file/" to base folder to access file from server
		 */
		registry.addResourceHandler("/file/**").addResourceLocations("file:/" + basePath);
		// Note: swagger-ui resources are handled automatically by SpringDoc
		registry.addResourceHandler("/webjars/**").addResourceLocations("classpath:/META-INF/resources/webjars/");
	}

}
