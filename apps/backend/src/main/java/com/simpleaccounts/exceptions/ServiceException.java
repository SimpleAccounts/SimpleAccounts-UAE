package com.simpleaccounts.exceptions;

import com.simpleaccounts.service.exceptions.ServiceErrorCode;

public class ServiceException extends BaseException {
	private static final long serialVersionUID = 1L;

	private final ServiceErrorCode errorCode;
	public static final String SERVICE = "SERVICE";

	public ServiceException(String errorMsg, ServiceErrorCode errorCode) {
		super(errorMsg);
		this.errorMsg = errorMsg;
		this.errorCode = errorCode;
	}

	@Override
	public String getSource() {
		return SERVICE;
	}

	@Override
	public String getErrorCode() {
		return this.errorCode.name();
	}

	@Override
	public String getErrorDescription() {
		return this.errorMsg + ", " + this.errorCode.getErrorDescription();
	}

	@Override
	public boolean isBusinessException() {
		return this.errorCode.isBusinessException();
	}

}
