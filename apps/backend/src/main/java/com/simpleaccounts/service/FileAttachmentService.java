package com.simpleaccounts.service;
import com.simpleaccounts.constant.ContactTypeEnum;
import com.simpleaccounts.constant.FileTypeEnum;
import com.simpleaccounts.dao.FileAttachmentDao;
import com.simpleaccounts.entity.FileAttachment;
import com.simpleaccounts.exceptions.FileAttachmentStorageException;
import com.simpleaccounts.rest.creditnotecontroller.CreditNoteRequestModel;
import com.simpleaccounts.rest.expensescontroller.ExpenseModel;
import com.simpleaccounts.rest.invoicecontroller.InvoiceRequestModel;
import com.simpleaccounts.rest.transactioncontroller.TransactionPresistModel;
import com.simpleaccounts.rfq_po.PoQuatationRequestModel;
import com.simpleaccounts.utils.FileHelper;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;

public abstract class  FileAttachmentService extends SimpleAccountsService <Integer, FileAttachment> {
    private FileAttachmentDao fileAttachmentDao;
    private FileHelper fileHelper;

    @Autowired
    void setDependencies(FileAttachmentDao fileAttachmentDao, FileHelper fileHelper) {
        this.fileAttachmentDao = fileAttachmentDao;
        this.fileHelper = fileHelper;
    }

    public FileAttachment storeFile(MultipartFile file, FileTypeEnum fileTypeEnum, InvoiceRequestModel requestModel) throws IOException {

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
