package com.simpleaccounts.security;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
public class CustomErrorController implements ErrorController {

	@RequestMapping("/error")
	public ResponseEntity<Object> handleError(HttpServletRequest request, HttpServletResponse response) {
		// Get error status code
		Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
		HttpStatus httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

		if (status != null) {
			try {
				int statusCode = Integer.parseInt(status.toString());
				httpStatus = HttpStatus.valueOf(statusCode);
			} catch (NumberFormatException e) {
				log.warn("Non-numeric status attribute: {}", status, e);
			} catch (Exception e) {
				log.warn("Invalid status code: {}", status);
			}
		}
		
		// Get error message
		Object errorMessage = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
		String message = errorMessage != null ? errorMessage.toString() : "Internal Server Error";
		
		// Get exception
		Exception exception = (Exception) request.getAttribute(RequestDispatcher.ERROR_EXCEPTION);
		Throwable throwable = (Throwable) request.getAttribute(RequestDispatcher.ERROR_EXCEPTION);
		if (exception != null || throwable != null) {
			Throwable ex = exception != null ? exception : throwable;
			log.error("Error in request: {}", ex.getMessage(), ex);
			log.error("Exception type: {}", ex.getClass().getName());
			if (ex.getCause() != null) {
				log.error("Caused by: {}", ex.getCause().getMessage());
			}
		}
		
		// Ensure CORS headers are set - use addHeader to ensure they're not overwritten
		response.addHeader("Access-Control-Allow-Origin", "*");
		response.addHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT");
		response.addHeader("Access-Control-Max-Age", "3600");
		response.addHeader("Access-Control-Allow-Headers", "x-requested-with, authorization, content-type");
		response.addHeader("Access-Control-Allow-Credentials", "true");
		
		// Build error response with exception details if available
		Map<String, Object> errorResponse = new HashMap<>();
		errorResponse.put("timestamp", new java.util.Date());
		errorResponse.put("status", httpStatus.value());
		errorResponse.put("error", httpStatus.getReasonPhrase());
		errorResponse.put("message", message);
		errorResponse.put("path", request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI));
		
		if (throwable != null) {
			errorResponse.put("exception", throwable.getClass().getName());
			errorResponse.put("exceptionMessage", throwable.getMessage());
		}
		
		// Return error response with CORS headers
		return ResponseEntity.status(httpStatus)
			.header("Access-Control-Allow-Origin", "*")
			.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT")
			.header("Access-Control-Allow-Headers", "x-requested-with, authorization, content-type")
			.header("Access-Control-Allow-Credentials", "true")
			.body(errorResponse);
	}
}

