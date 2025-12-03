package com.simpleaccounts.security;

import java.io.IOException;
import java.io.Serializable;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint, Serializable {

	private static final long serialVersionUID = -7858869558953243875L;

	@Override
	public void commence(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException authException) throws IOException {
		final String expiredMsg = (String) request.getAttribute("expired");
		final String msg = (expiredMsg != null) ? expiredMsg : "Unauthorized";
		response.sendError(HttpServletResponse.SC_UNAUTHORIZED, msg);
		//response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
	}
}
