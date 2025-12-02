package com.simplevat.exceptions;

public class FileAttachmentStorageException extends RuntimeException{
    public FileAttachmentStorageException(String message){
        super(message);
    }
    public FileAttachmentStorageException(String message, Throwable cause){
        super(message, cause);
    }
}
