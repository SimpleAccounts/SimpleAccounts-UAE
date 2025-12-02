package com.simplevat.utils;


import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import lombok.Getter;
import lombok.Setter;

@JsonSerialize(using = MessageSerializer.class)
public class SimpleVatMessage {
	
	@Getter @Setter
	private boolean isErrorMessage;
	@Getter @Setter
	private String  codeNumber;
	@Getter @Setter
	private String  message;
	@Getter @Setter
	private String  info;
	
	public SimpleVatMessage(){
		
	}
	
	public SimpleVatMessage(String codeNumber, String message, boolean isErrorMessage) {
		this.codeNumber = codeNumber;
		this.message = message;
		this.isErrorMessage = isErrorMessage;
	}
	
	public SimpleVatMessage(String codeNumber, String message, String info, boolean isErrorMessage){
		this.codeNumber = codeNumber;
		this.message = message;
		this.info = info;
		this.isErrorMessage = isErrorMessage;
	}
}
