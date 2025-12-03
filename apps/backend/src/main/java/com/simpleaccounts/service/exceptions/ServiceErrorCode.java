package com.simpleaccounts.service.exceptions;

public enum ServiceErrorCode {
	
	
	RecordAlreadyExists("Record Already Exists", true), 
	RecordDoesntExists("Record does not Exists", true),
	BadRequest("Bad Request", true);


	public String getErrorDescription() {
		return errorDescription;
	}

	void setErrorDescription(String errorDescription) {
		this.errorDescription = errorDescription;
	}

	public boolean isBusinessException() {
		return businessException;
	}

	void setBusinessException(boolean businessException) {
		this.businessException = businessException;
	}

	private String errorDescription;
	private boolean businessException;

	ServiceErrorCode(String errorDescription_, boolean businessException_) {
		this.errorDescription = errorDescription_;
		this.businessException = businessException_;
	}
}
