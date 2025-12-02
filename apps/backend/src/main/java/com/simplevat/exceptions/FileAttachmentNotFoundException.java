package com.simplevat.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class FileAttachmentNotFoundException extends RuntimeException{

    public FileAttachmentNotFoundException(String message){

        super(message);

    }

    public FileAttachmentNotFoundException(String message, Throwable cause){

        super(message, cause);

    }
}
