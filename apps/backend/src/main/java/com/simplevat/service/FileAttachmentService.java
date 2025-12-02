package com.simplevat.service;
import com.simplevat.constant.ContactTypeEnum;
import com.simplevat.constant.FileTypeEnum;
import com.simplevat.dao.FileAttachmentDao;
import com.simplevat.entity.FileAttachment;
import com.simplevat.exceptions.FileAttachmentNotFoundException;
import com.simplevat.exceptions.FileAttachmentStorageException;
import com.simplevat.rest.creditnotecontroller.CreditNoteRequestModel;
import com.simplevat.rest.expensescontroller.ExpenseModel;
import com.simplevat.rest.invoicecontroller.InvoiceRequestModel;
import com.simplevat.rest.transactioncontroller.TransactionPresistModel;
import com.simplevat.rfq_po.PoQuatationRequestModel;
import com.simplevat.utils.FileHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public abstract class  FileAttachmentService extends SimpleVatService <Integer, FileAttachment> {
    @Autowired
    private FileAttachmentDao fileAttachmentDao;
    @Autowired
    private FileHelper fileHelper;

    public FileAttachment storeFile(MultipartFile file, FileTypeEnum fileTypeEnum, InvoiceRequestModel requestModel) throws IOException {
        // Normalize file name
      //  String fileName = StringUtils.cleanPath(file.getOriginalFilename(),fileTypeEnum);
        String fileName = fileHelper.saveFile(requestModel.getAttachmentFile(),
						requestModel.getType().equals(ContactTypeEnum.SUPPLIER.getValue().toString())
								? FileTypeEnum.SUPPLIER_INVOICE
								: FileTypeEnum.CUSTOMER_INVOICE);
        try {
            // Check if the file's name contains invalid characters
            if(fileName.contains("..")) {
                throw new FileAttachmentStorageException("Sorry! Filename contains invalid path sequence " + fileName);
            }
            FileAttachment fileAttachment = new FileAttachment(fileName, file.getContentType(), file.getBytes());
            return fileAttachmentDao.persist(fileAttachment);
        } catch (IOException ex) {
            throw new FileAttachmentStorageException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }
    public FileAttachment getFile(Integer fileId) {
        return fileAttachmentDao.findByPK(fileId);
//                .orElseThrow(() -> new FileAttachmentNotFoundException("File not found with id " + fileId));
    }

    public FileAttachment storeExpenseFile(MultipartFile file, ExpenseModel expenseModel) throws IOException {
        String fileName = fileHelper.saveFile(expenseModel.getAttachmentFile(),FileTypeEnum.EXPENSE);
        try {
            // Check if the file's name contains invalid characters
            if(fileName.contains("..")) {
                throw new FileAttachmentStorageException("Sorry! Filename contains invalid path sequence " + fileName);
            }
            FileAttachment fileAttachment = new FileAttachment(fileName, file.getContentType(), file.getBytes());
            return fileAttachmentDao.persist(fileAttachment);
        } catch (IOException ex) {
            throw new FileAttachmentStorageException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }
    public FileAttachment storereditNotesFile(MultipartFile file, CreditNoteRequestModel creditNoteRequestModel) throws IOException {
        String fileName = fileHelper.saveFile(creditNoteRequestModel.getAttachmentFile(),FileTypeEnum.CREDIT_NOTES);
        try {
            // Check if the file's name contains invalid characters
            if(fileName.contains("..")) {
                throw new FileAttachmentStorageException("Sorry! Filename contains invalid path sequence " + fileName);
            }
            FileAttachment fileAttachment = new FileAttachment(fileName, file.getContentType(), file.getBytes());
            return fileAttachmentDao.persist(fileAttachment);
        } catch (IOException ex) {
            throw new FileAttachmentStorageException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }


    public FileAttachment storeTransactionFile(MultipartFile file, TransactionPresistModel transactionPresistModel) throws IOException {
        String fileName = fileHelper.saveFile(transactionPresistModel.getAttachmentFile(),FileTypeEnum.TRANSATION);
        try {
            // Check if the file's name contains invalid characters
            if(fileName.contains("..")) {
                throw new FileAttachmentStorageException("Sorry! Filename contains invalid path sequence " + fileName);
            }
            FileAttachment fileAttachment = new FileAttachment(fileName, file.getContentType(), file.getBytes());
            return fileAttachmentDao.persist(fileAttachment);
        } catch (IOException ex) {
            throw new FileAttachmentStorageException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    public FileAttachment storeRfqPoGrnFile(MultipartFile file, PoQuatationRequestModel requestModel) throws IOException {
        // Normalize file name
        //  String fileName = StringUtils.cleanPath(file.getOriginalFilename(),fileTypeEnum);
        String fileName = "";
            switch(requestModel.getType()){
                case "3":
                    fileName = fileHelper.saveFile(requestModel.getAttachmentFile(),FileTypeEnum.REQUEST_FOR_QUOTATION);
                    break;
                case "4":
                    fileName = fileHelper.saveFile(requestModel.getAttachmentFile(),FileTypeEnum.PURCHASE_ORDER);
                    break;
                case "5":
                    fileName = fileHelper.saveFile(requestModel.getAttachmentFile(),FileTypeEnum.GOODS_RECEIVE_NOTES);
                    break;
                case "6":
                    fileName = fileHelper.saveFile(requestModel.getAttachmentFile(),FileTypeEnum.QUOTATION);
                    break;
                default:
            }

        try {
            // Check if the file's name contains invalid characters
            if(fileName.contains("..")) {
                throw new FileAttachmentStorageException("Sorry! Filename contains invalid path sequence " + fileName);
            }
            FileAttachment fileAttachment = new FileAttachment(fileName, file.getContentType(), file.getBytes());
            return fileAttachmentDao.persist(fileAttachment);
        } catch (IOException ex) {
            throw new FileAttachmentStorageException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }
}
