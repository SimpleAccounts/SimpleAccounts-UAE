package com.simpleaccounts.rest.InvoiceScannerContoller;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.constant.CommonStatusEnum;
import com.simpleaccounts.constant.ContactTypeEnum;
import com.simpleaccounts.constant.FileTypeEnum;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.helper.ExpenseRestHelper;
import com.simpleaccounts.repository.JournalLineItemRepository;
import com.simpleaccounts.repository.QuotationInvoiceRepository;
import com.simpleaccounts.rest.expensescontroller.ExpenseModel;
import com.simpleaccounts.rest.invoicecontroller.InvoiceLineItemModel;
import com.simpleaccounts.rest.invoicecontroller.InvoiceRequestModel;
import com.simpleaccounts.rest.invoicecontroller.InvoiceRestHelper;
import com.simpleaccounts.rfq_po.PoQuatation;
import com.simpleaccounts.rfq_po.PoQuatationService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.*;
import com.simpleaccounts.utils.FileHelper;
import com.simpleaccounts.utils.MessageUtil;
import com.simpleaccounts.utils.SimpleAccountsMessage;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestController
@RequestMapping(value = "/rest/invoiceScanner")
@RequiredArgsConstructor
public class InvoiceScannerRestController {
    private final Logger logger = LoggerFactory.getLogger(InvoiceScannerRestController.class);

    private final JwtTokenUtil jwtTokenUtil;
    private final JSONExpenseParser jsonExpenseParser;
    private final InvoiceRestHelper invoiceRestHelper;

    private final FileAttachmentService fileAttachmentService;
    private final InvoiceService invoiceService;

    private final BankAccountService bankAccountService;


    private final ContactService contactService;


    private final ExpenseRestHelper expenseRestHelper;

    private final ExpenseService expenseService;

    private final CurrencyService currencyService;

    private final UserService userService;

    private final InvoiceLineItemService invoiceLineItemService;

    private final PlaceOfSupplyService placeOfSupplyService;

    private final CreditNoteInvoiceRelationService creditNoteInvoiceRelationService;

    private final PoQuatationService poQuatationService;

    private final QuotationInvoiceRepository quotationInvoiceRepository;

    private final JournalLineItemRepository journalLineItemRepository;

    private final InvoiceScannerService invoiceScannerService;


    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Add New Invoice")
    @PostMapping(value = "/invoiceScan/save")
    public ResponseEntity<Object> save(@RequestBody String jsonString , HttpServletRequest request) {
        try {
            InvoiceRequestModel requestModel = new InvoiceRequestModel();
            List<InvoiceLineItemModel> invoiceLineItemModelList = new ArrayList<>();

            jsonExpenseParser.parseInvoice(jsonString,requestModel,invoiceLineItemModelList);


            String rootPath = request.getServletContext().getRealPath("/");
            log.info("filePath {}",rootPath);
            FileHelper.setRootPath(rootPath);
            log.info("In Controller :{}",requestModel.getInvoiceDueDate());
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            Boolean checkInvoiceNumber = invoiceRestHelper.doesInvoiceNumberExist(requestModel.getReferenceNumber());
            if (checkInvoiceNumber){
                SimpleAccountsMessage errorMessage = new SimpleAccountsMessage("0023",
                        MessageUtil.getMessage("invoicenumber.alreadyexists.0023"), true);
                logger.info(errorMessage.getMessage());
                return new  ResponseEntity(errorMessage, HttpStatus.BAD_REQUEST);

            }
            Invoice invoice = invoiceScannerService.getEntity(requestModel, userId,invoiceLineItemModelList);
            invoice.setCreatedBy(userId);
            invoice.setCreatedDate(LocalDateTime.now());
            invoice.setDeleteFlag(Boolean.FALSE);
            //To save the uploaded file in
            if (requestModel.getAttachmentFile()!=null) {
                MultipartFile file = requestModel.getAttachmentFile();
                if (file != null) {
                    FileAttachment fileAttachment = fileAttachmentService.storeFile(file, requestModel.getType().equals(ContactTypeEnum.SUPPLIER.getValue().toString())
                            ? FileTypeEnum.SUPPLIER_INVOICE
                            : FileTypeEnum.CUSTOMER_INVOICE, requestModel);
                    invoice.setAttachmentFileName(fileAttachment);
                }
            }
            invoiceService.persist(invoice);
            if(requestModel.getQuotationId()!= null) {
                QuotationInvoiceRelation quotationInvoiceRelation = new QuotationInvoiceRelation();
                quotationInvoiceRelation.setInvoice(invoice);
                PoQuatation quatation = poQuatationService.findByPK(requestModel.getQuotationId());
                quotationInvoiceRelation.setPoQuatation(quatation);
                quotationInvoiceRelation.setDeleteFlag(Boolean.FALSE);
                quotationInvoiceRepository.save(quotationInvoiceRelation);
                quatation.setStatus(CommonStatusEnum.INVOICED.getValue());
                poQuatationService.update(quatation);

            }
            Company company = new Company();
            SimpleAccountsMessage message = null;
            message = new SimpleAccountsMessage("0045",
                    MessageUtil.getMessage("invoice.created.successful.msg.0045"), false);
            return new ResponseEntity<>(message,HttpStatus.OK);
        } catch (Exception e) {
            SimpleAccountsMessage message= null;
            message = new SimpleAccountsMessage("",
                    MessageUtil.getMessage("create.unsuccessful.msg"), true);
            return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Add New Expense")
    @PostMapping(value = "/expenseScan/save")
    public ResponseEntity<Object> saveExpense(HttpServletRequest request) {

        try {
            ExpenseModel expenseModel = new ExpenseModel();
            SimpleAccountsMessage message = null;
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            String rootPath = request.getServletContext().getRealPath("/");
            log.info("filePath {}",rootPath);
            FileHelper.setRootPath(rootPath);
            Boolean checkInvoiceNumber = expenseRestHelper.doesInvoiceNumberExist(expenseModel.getExpenseNumber());
            if (checkInvoiceNumber){
                SimpleAccountsMessage errorMessage = new SimpleAccountsMessage("0023",
                        MessageUtil.getMessage("invoicenumber.alreadyexists.0023"), true);
                logger.info(errorMessage.getMessage());
                return new  ResponseEntity(errorMessage, HttpStatus.BAD_REQUEST);

            }
            Expense expense = invoiceScannerService.getExpenseEntity(expenseModel);
            expense.setExclusiveVat(expenseModel.getExclusiveVat());
            expense.setCreatedBy(userId);
            expense.setCreatedDate(LocalDateTime.now());
            //To save the uploaded file in db.
            if (expenseModel.getAttachmentFile()!=null) {
                MultipartFile file = expenseModel.getAttachmentFile();
                if (file != null) {
                    FileAttachment fileAttachment = fileAttachmentService.storeExpenseFile(file, expenseModel);
                    expense.setFileAttachment(fileAttachment);
                }
            }
            expenseService.persist(expense);
            message = new SimpleAccountsMessage("0065",
                    MessageUtil.getMessage("expense.created.successful.msg.0065"), false);
            return new ResponseEntity<>(message,HttpStatus.OK);
        } catch (Exception e) {
            SimpleAccountsMessage message = null;
            message = new SimpleAccountsMessage("",
                    MessageUtil.getMessage("create.unsuccessful.msg"), true);
            return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
