package com.simplevat.constant;

public enum WebLayerErrorCodeEnum {


	TEST1("Some Test 1", false), TEST2("Some Test2", true);

	private String errorDescription;
	private boolean businessException;

	WebLayerErrorCodeEnum(String errorDescription, boolean businessException) {
		this.errorDescription = errorDescription;
		this.businessException = businessException;
	}

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


}
