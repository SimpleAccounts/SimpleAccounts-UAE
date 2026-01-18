package com.simpleaccounts.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(HttpMessageNotWritableException.class)
	public ResponseEntity<Object> handleHttpMessageNotWritableException(HttpMessageNotWritableException e) {
		log.error("HttpMessageNotWritableException caught: {}", e.getMessage(), e);
		return new ResponseEntity<>(
			java.util.Map.of("error", "Serialization error", "message", e.getMessage()),
			HttpStatus.INTERNAL_SERVER_ERROR
		);
	}

	/**
	 * Authentication failures should not be returned as 500.
	 * Spring Security commonly throws AuthenticationException (e.g., BadCredentialsException).
	 */
	@ExceptionHandler(AuthenticationException.class)
	public ResponseEntity<Object> handleAuthenticationException(AuthenticationException e) {
		log.warn("Authentication exception: {}", e.getMessage());
		return new ResponseEntity<>(
			java.util.Map.of("error", "Unauthorized", "message", e.getMessage()),
			HttpStatus.UNAUTHORIZED
		);
	}

	/**
	 * Authorization failures should not be returned as 500.
	 */
	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<Object> handleAccessDeniedException(AccessDeniedException e) {
		log.warn("Access denied: {}", e.getMessage());
		return new ResponseEntity<>(
			java.util.Map.of("error", "Forbidden", "message", e.getMessage()),
			HttpStatus.FORBIDDEN
		);
	}

	/**
	 * Preserve proper 404s (don’t convert missing routes/static resources into 500).
	 */
	@ExceptionHandler({NoHandlerFoundException.class, NoResourceFoundException.class})
	public ResponseEntity<Object> handleNotFound(Exception e) {
		return new ResponseEntity<>(
			java.util.Map.of("error", "Not found", "message", e.getMessage()),
			HttpStatus.NOT_FOUND
		);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<Object> handleException(Exception e) {
		log.error("Unhandled exception: {}", e.getMessage(), e);
		return new ResponseEntity<>(
			java.util.Map.of("error", "Internal server error", "message", e.getMessage()),
			HttpStatus.INTERNAL_SERVER_ERROR
		);
	}
}

