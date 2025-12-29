package com.simpleaccounts.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

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

	@ExceptionHandler(Exception.class)
	public ResponseEntity<Object> handleException(Exception e) {
		log.error("Unhandled exception: {}", e.getMessage(), e);
		return new ResponseEntity<>(
			java.util.Map.of("error", "Internal server error", "message", e.getMessage()),
			HttpStatus.INTERNAL_SERVER_ERROR
		);
	}
}

