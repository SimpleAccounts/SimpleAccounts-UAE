/** *****************************************************************************
 * Copyright (c) Daynil Group Solutions Pvt. Ltd.
 * All Rights Reserved
 *
 * Company                   : Daynil Group Solutions Pvt. Ltd.
 * Date                      : Aug 1, 2018
 * Project                   : CloudEduSchoolERP
 * Name                      : SimpleCorsFilter
 * Author                    : Sagar Baranwal <sagar.baranwal@daynilgroup.com>
 *
 * Modification History: Date Version Modified by Brief Description of
 * Modification
 *
 ******************************************************************************
 */
package com.simpleaccounts.security;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 *
 * @author Sagar Baranwal <sagar.baranwal@daynilgroup.com>
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SimpleCorsFilter implements Filter {

	    @Value("${cors.allowed.origins:*}")
	    private String allowedOriginsConfig;

	    private Set<String> allowedOrigins;

    @Override
    public void init(FilterConfig filterConfig) {
        // Parse allowed origins from configuration
        if (allowedOriginsConfig != null && !allowedOriginsConfig.trim().isEmpty()) {
            allowedOrigins = new HashSet<>(Arrays.asList(allowedOriginsConfig.split(",")));
        } else {
            allowedOrigins = new HashSet<>();
            allowedOrigins.add("*");
        }
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
        HttpServletResponse response = (HttpServletResponse) res;
        HttpServletRequest request = (HttpServletRequest) req;

        String origin = request.getHeader("Origin");
        String allowedOrigin = determineAllowedOrigin(origin);

        response.setHeader("Access-Control-Allow-Origin", allowedOrigin);
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT");
        response.setHeader("Access-Control-Max-Age", "3600");
        response.setHeader("Access-Control-Allow-Headers", "x-requested-with, authorization, content-type");

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
        } else {
            chain.doFilter(req, res);
        }
    }

    private String determineAllowedOrigin(String origin) {
        // If wildcard is configured, allow all origins
        if (allowedOrigins == null || allowedOrigins.contains("*")) {
            return "*";
        }
        // If the request origin is in the allowed list, return it
        if (origin != null && allowedOrigins.contains(origin)) {
            return origin;
        }

        return allowedOrigins.isEmpty() ? "*" : "";
    }

	    // Empty method required by Filter interface - no cleanup needed
	    @Override
	    public void destroy() {
	        // No cleanup needed.
	    }

	}
