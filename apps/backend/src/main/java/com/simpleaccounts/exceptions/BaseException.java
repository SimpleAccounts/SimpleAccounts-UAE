package com.simpleaccounts.exceptions;

public abstract class BaseException extends RuntimeException {

	private static final long serialVersionUID = 605231601334551397L;
	protected String errorMsg;
	public BaseException(String errorMsg) {
		super(errorMsg);
		this.errorMsg = errorMsg;
	}
	
	public abstract String getSource();
	
	public abstract String getErrorCode();
	
	public abstract String getErrorDescription();
	
	public abstract boolean  isBusinessException();

	@Override
	public String toString() {
		return "Error in : " + getSource() + ", Error Code : " + getErrorCode() + ", Error Code Description : " + getErrorDescription() + ", Error Message : " + this.errorMsg;
	}
}
