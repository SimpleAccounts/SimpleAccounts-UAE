package com.simplevat.rest.invoicecontroller;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FileAttachmentUploadResponse {

    private String fileName;

    private String fileDownloadUri;

    private String fileType;

    private long size;

    public FileAttachmentUploadResponse(String fileName, String fileDownloadUri, String fileType, long size){

        this.fileName = fileName;

        this.fileDownloadUri = fileDownloadUri;

        this.fileType = fileType;

        this.size = size;
    }
}
