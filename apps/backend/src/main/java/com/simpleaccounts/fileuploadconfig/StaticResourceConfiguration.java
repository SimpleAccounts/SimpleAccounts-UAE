package com.simpleaccounts.fileuploadconfig;


import com.simpleaccounts.utils.OSValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * @author S@urabh
 */
@Configuration
@RequiredArgsConstructor
public class StaticResourceConfiguration implements WebMvcConfigurer {

	private final OSValidator osVaidator;

	/**
	 * {@link com.simpleaccounts.fileuploadconfig.FileUploadConfig#getFileBaseLocation}
	 */
	private final String basePath;

	/**
	 * @param basePath set base path for view file from server
	 */
	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		/**
		 * @author $@urabh map "/file/" to base folder to access file from server
		 */
		registry.addResourceHandler("/file/**").addResourceLocations("file:/" + basePath);
		registry.addResourceHandler("/swagger-ui.html**")
				.addResourceLocations("classpath:/META-INF/resources/swagger-ui.html");
		registry.addResourceHandler("/webjars/**").addResourceLocations("classpath:/META-INF/resources/webjars/");
	}

}
