package com.simpleaccounts.exceptions;

import com.simpleaccounts.constant.WebLayerErrorCodeEnum;

public class WebLayerException extends BaseException {

	private static final long serialVersionUID = 1L;

	private final WebLayerErrorCodeEnum errorCode;
	public static final String WEB = "WEB";

	public WebLayerException(String errorMsg, WebLayerErrorCodeEnum errorCode) {
		super(errorMsg);
		this.errorMsg = errorMsg;
		this.errorCode = errorCode;
	}

	@Override
	public String getSource() {
		return WEB;
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
