package com.simpleaccounts.security;

import org.springframework.context.annotation.Configuration;

@Configuration
public class CorsConfig {

    // Commented out to prevent duplicate CORS headers
    // SimpleCorsFilter already handles CORS with @Order(Ordered.HIGHEST_PRECEDENCE)
    // Having both filters causes "Multiple CORS header 'Access-Control-Allow-Origin' not allowed" error
    /*
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*"); // Use pattern to allow all origins
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
    */
}

