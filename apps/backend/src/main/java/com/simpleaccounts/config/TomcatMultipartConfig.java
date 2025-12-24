package com.simpleaccounts.config;

import org.springframework.boot.tomcat.servlet.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration to increase the default multipart parts limit.
 * In Tomcat 10.1+ (used by Spring Boot 3.x/4.x), the default limit is 10 parts
 * which is too low for forms with many fields like the registration form.
 */
@Configuration
public class TomcatMultipartConfig {

    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> tomcatMultipartCustomizer() {
        return factory -> factory.addConnectorCustomizers(connector -> {
            // Increase the max parameter count (default is 10000)
            connector.setMaxParameterCount(200);
            // Increase max parts for multipart requests (default is 10 in Tomcat 10.1.42+/11.0.8+)
            // Registration form has ~15 fields, each counts as a "part"
            connector.setMaxPartCount(100);
        });
    }
}
