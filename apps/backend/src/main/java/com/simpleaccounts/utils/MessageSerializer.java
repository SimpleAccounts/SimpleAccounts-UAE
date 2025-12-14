package com.simpleaccounts.utils;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import java.io.IOException;

public class MessageSerializer extends JsonSerializer<SimpleAccountsMessage>{

	@Override
	public void serialize(SimpleAccountsMessage value, JsonGenerator jgen, SerializerProvider serializers)
			throws IOException, JsonProcessingException {
		jgen.writeStartObject();
		if (value.isErrorMessage())
			jgen.writeStringField("codeNumber",value.getCodeNumber());
		jgen.writeBooleanField("isErrorMessage", value.isErrorMessage());
		jgen.writeStringField("message", value.getMessage());	
		jgen.writeStringField("info", value.getInfo() == null? "": value.getInfo() );
		jgen.writeEndObject();		
	}
}
