package com.simplevat.rest.creditnotecontroller;

import com.simplevat.aop.LogRequest;
import com.simplevat.constant.*;
import com.simplevat.entity.*;
import com.simplevat.entity.Currency;
import com.simplevat.model.AppliedInvoiceCreditNote;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.rest.PostingRequestModel;
import com.simplevat.rest.invoicecontroller.InvoiceRestHelper;
import com.simplevat.rest.usercontroller.UserModel;
import com.simplevat.security.JwtTokenUtil;
import com.simplevat.service.*;
import com.simplevat.utils.FileHelper;
import com.simplevat.utils.MessageUtil;
import com.simplevat.utils.SimpleVatMessage;

import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static com.simplevat.constant.ErrorConstant.ERROR;

/**
 * Created By Zain Khan
 */
@Slf4j
@RestController
@RequestMapping(value = "/rest/creditNote")
public class CreditNoteRestController {
    private final Logger logger = LoggerFactory.getLogger(CreditNoteRestController.class);
    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private CreditNoteRestHelper creditNoteRestHelper;

    @Autowired
    private JournalService journalService;

    @Autowired
    private UserService userService;

    @Autowired
    private CompanyService companyService;

    @Autowired
    private CreditNoteInvoiceRelationService creditNoteInvoiceRelationService;

    @Autowired
    private FileAttachmentService fileAttachmentService;

    @Autowired
    private CreditNoteRepository creditNoteRepository;

    @Autowired
    private InvoiceRestHelper invoiceRestHelper;

    @LogRequest
    @ApiOperation(value = "Get Credit Note List")
    @GetMapping(value = "/getList")
    public ResponseEntity<PaginationResponseModel> getList(CreditNoteRequestFilterModel creditNoteRequestFilterModel,
                                                           @RequestParam(required = false) Integer contact,
                                                           @RequestParam(required = false) BigDecimal amount,
                                                           @RequestParam(defaultValue = "0") int pageNo,
                                                           @RequestParam(defaultValue = "10") int pageSize,
                                                           @RequestParam(required = false, defaultValue = "true")
                                                               boolean paginationDisable,
                                                           @RequestParam(required = false) String order,
                                                           @RequestParam(required = false) String sortingCol,
                                                           @RequestParam(required = false) Integer type,
                                                           HttpServletRequest httpServletRequest) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(httpServletRequest);
            PaginationResponseModel responseModel = new PaginationResponseModel();
           User user = userService.findByPK(userId);
            creditNoteRestHelper.getListModel(responseModel,contact,amount,pageNo,pageSize,paginationDisable,
                    order,sortingCol,userId,type);
            return new ResponseEntity<>(responseModel, HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @PostMapping(value = "/save")
    @ApiOperation(value = "Add New Credit Note")
    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> save(@ModelAttribute CreditNoteRequestModel creditNoteRequestModel,
                                  HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            String rootPath = request.getServletContext().getRealPath("/");
            log.info("filePath {}", rootPath);
            FileHelper.setRootPath(rootPath);

            CreditNote creditNote = creditNoteRestHelper.createOrUpdateCreditNote(creditNoteRequestModel, userId);

            if (creditNoteRequestModel.getInvoiceId() != null) {
                creditNoteRestHelper.processInvoiceRelation(creditNoteRequestModel, creditNote, userId);
            }

            MultipartFile file = creditNoteRequestModel.getAttachmentFile();
            if (file != null) {
                fileAttachmentService.storereditNotesFile(file, creditNoteRequestModel);
            }

            return new ResponseEntity<>(
                    new SimpleVatMessage("0027",
                            MessageUtil.getMessage("creditnote.created.successful.msg.0027"), false),
                    HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(new SimpleVatMessage("",
                    MessageUtil.getMessage("create.unsuccessful.msg"), true),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Update Credit Note")
    @PostMapping(value = "/update")
    public ResponseEntity<?> update(@ModelAttribute CreditNoteRequestModel requestModel,
                                    HttpServletRequest request) {
        try {
            SimpleVatMessage message = null;
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            if (requestModel.getIsCreatedWithoutInvoice() == Boolean.TRUE) {
                CreditNote creditNote = creditNoteRestHelper.createCNWithoutInvoice(requestModel, userId);
                if (creditNote != null) {
                    creditNoteRepository.save(creditNote);
                    if (requestModel.getInvoiceId() != null) {
                        Invoice invoice = invoiceService.findByPK(requestModel.getInvoiceId());
                        invoice.setCnCreatedOnPaidInvoice(requestModel.getCnCreatedOnPaidInvoice());
                        CreditNoteInvoiceRelation creditNoteInvoiceRelation = new CreditNoteInvoiceRelation();
                        creditNoteInvoiceRelation.setCreditNote(creditNote);
                        creditNoteInvoiceRelation.setInvoice(invoice);
                        creditNoteInvoiceRelationService.persist(creditNoteInvoiceRelation);
                    }
                }
            } else {
                CreditNote creditNote = creditNoteRestHelper.getEntity(requestModel, userId);
                creditNote.setLastUpdateBy(userId);
                creditNote.setCreatedBy(userId);
                creditNote.setLastUpdateDate(LocalDateTime.now());
                creditNoteRepository.save(creditNote);
                if (requestModel.getInvoiceId() != null) {
                    Invoice invoice = invoiceService.findByPK(requestModel.getInvoiceId());
                    CreditNoteInvoiceRelation creditNoteInvoiceRelation = new CreditNoteInvoiceRelation();
                    creditNoteInvoiceRelation.setCreditNote(creditNote);
                    creditNoteInvoiceRelation.setInvoice(invoice);
                    creditNoteInvoiceRelationService.update(creditNoteInvoiceRelation);
                }
            }
            message = new SimpleVatMessage("0028",
                    MessageUtil.getMessage("creditnote.updated.successful.msg.0028"), false);
            return new ResponseEntity<>(message, HttpStatus.OK);
        } catch (Exception e) {
            SimpleVatMessage message = null;
            message = new SimpleVatMessage("",
                    MessageUtil.getMessage("update.unsuccessful.msg"), true);
            return new ResponseEntity<>(message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @ApiOperation(value = "Get Credit Note By ID")
    @GetMapping(value = "/getCreditNoteById")
    public ResponseEntity<CreditNoteRequestModel> getInvoiceById(@RequestParam(value = "id") Integer id,
                                             @RequestParam(value = "isCNWithoutProduct") Boolean isCNWithoutProduct) {
        try {
            CreditNoteRequestModel creditNoteRequestModel = null;
            if (Boolean.TRUE.equals(isCNWithoutProduct)) {
                Optional<CreditNote> optionalCreditNote = creditNoteRepository.findById(id);
                if(optionalCreditNote.isPresent()) {
                    CreditNote creditNote = optionalCreditNote.get();
                    creditNoteRequestModel = creditNoteRestHelper.getRequestModelforCNWithoutProduct(creditNote);
                }
            } else {
                Optional<CreditNote> optionalCreditNote = creditNoteRepository.findById(id);
                if(optionalCreditNote.isPresent()) {
                    CreditNote creditNote = optionalCreditNote.get();
                 creditNoteRequestModel = creditNoteRestHelper.getRequestModel(creditNote);
                }
            }
            return new ResponseEntity<>(creditNoteRequestModel, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @ApiOperation(value = "Post Journal Entry For Credit Note")
    @PostMapping(value = "/creditNotePosting")
    public ResponseEntity<?> posting(@RequestBody PostingRequestModel postingRequestModel,
                                                    HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            if (Boolean.TRUE.equals(postingRequestModel.getIsCNWithoutProduct())) {
                creditNoteRestHelper.handleCreditNoteWithoutProduct(postingRequestModel, userId, request);
            } else{
                Journal journal = creditNoteRestHelper.handlePostingAndUpdateStatus(postingRequestModel, userId, request);
                if (journal != null) {
                journalService.persist(journal);
                }
            }
            SimpleVatMessage message = new SimpleVatMessage("0029",
                    MessageUtil.getMessage("creditnote.posted.successful.msg.0029"), false);
            return new ResponseEntity<>(message, HttpStatus.OK);
        } catch (Exception e) {
            SimpleVatMessage message = new SimpleVatMessage("",
                    MessageUtil.getMessage("post.unsuccessful.msg"), true);
            return new ResponseEntity<>(message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @param requestModel
     * @param request
     * @return
     */
    @LogRequest
    @ApiOperation(value = "Add New Refund")
    @PostMapping(value = "/recordPaymentCNWithoutInvoice")
    public ResponseEntity<?> recordPaymentCNWithoutInvoice(@ModelAttribute RecordPaymentAgainstCNWithoutInvoice requestModel,
                                                           HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            creditNoteRestHelper.recordPaymentCNWithoutInvoice(requestModel, userId,request);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @ApiOperation(value = "Add New Refund")
    @PostMapping(value = "/refund")
    public ResponseEntity<?> save(@ModelAttribute RecordPaymentForCN requestModel,
                                  HttpServletRequest request) {
        try {
            SimpleVatMessage message = null;
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            SimpleVatMessage msg = creditNoteRestHelper.recordPaymentForCN(requestModel, userId, message,request);
            return new ResponseEntity<>(msg, HttpStatus.OK);
        } catch (Exception e) {
            SimpleVatMessage message = null;
        message = new SimpleVatMessage("",
                MessageUtil.getMessage("create.unsuccessful.msg"), true);
        return new ResponseEntity<>(message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @ApiOperation(value = "Apply To Invoice")
    @PostMapping(value = "/applyToInvoice")
    public ResponseEntity<?> save(
            @ModelAttribute RefundAgainstInvoicesRequestModel refundAgainstInvoicesRequestModel,
            HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            String refundMsg = creditNoteRestHelper.applyToInvoice(refundAgainstInvoicesRequestModel, userId,request);
            SimpleVatMessage message = null;
            if (!refundMsg.isEmpty()) {
                message = new SimpleVatMessage("0092",
                        MessageUtil.getMessage("applyToInvoice.created.successful.msg.0092"), false);
            }
            return new ResponseEntity<>(message, HttpStatus.OK);
        } catch (Exception e) {
            SimpleVatMessage message = null;
            message = new SimpleVatMessage("",
                    MessageUtil.getMessage("refund.created.successful.msg.0082"), true);
            return new ResponseEntity<>(message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    /**
     * @param id
     * @return
     */
    @LogRequest
    @ApiOperation(value = "Get List Of Invoice By Credit Note")
    @GetMapping(value = "/getInvoiceByCreditNoteId")
    public ResponseEntity<List<CreditNoteRequestModel>> getInvoiceByCreditNoteId(
            @RequestParam(value = "id") Integer id) {
        try {
            List<CreditNoteRequestModel> creditNoteRequestModelList = creditNoteRestHelper.getInvoicesByCreditNoteId(id);
            return new ResponseEntity<>(creditNoteRequestModelList, HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Delete Credit Note By ID")
    @PostMapping(value = "/delete")
    public ResponseEntity<?> delete(@RequestParam(value = "id") Integer id) {

            try {
                Optional<CreditNote> optionalCreditNote = creditNoteRepository.findById(id);
                if(optionalCreditNote.isPresent()) {
                    CreditNote creditNote = optionalCreditNote.get();
                    SimpleVatMessage message = null;
                    Map<String, Object> map = new HashMap<>();
                    map.put("creditNote", creditNote);
                    List<CreditNoteInvoiceRelation> creditNoteInvoiceRelationList = creditNoteInvoiceRelationService.
                            findByAttributes(map);
                    if (!creditNoteInvoiceRelationList.isEmpty()) {
                        for (CreditNoteInvoiceRelation creditNoteInvoiceRelation : creditNoteInvoiceRelationList) {
                            Invoice revertInvoiceStatus = invoiceService.findByPK(creditNoteInvoiceRelation
                                    .getInvoice().getId());
                            revertInvoiceStatus.setCnCreatedOnPaidInvoice(false);
                            invoiceService.update(revertInvoiceStatus);
                            creditNoteInvoiceRelationService.delete(creditNoteInvoiceRelation);
                        }
                    }
                    if (creditNote != null) {
                        creditNote.setDeleteFlag(Boolean.TRUE);
                        creditNoteRepository.saveAndFlush(creditNote);

                    }

                    message = new SimpleVatMessage("0044",
                            MessageUtil.getMessage("invoice.deleted.successful.msg.0044"), false);
                    return new ResponseEntity<>(message, HttpStatus.OK);
                }
        } catch (Exception e) {
            SimpleVatMessage message = null;
            message = new SimpleVatMessage("",
                    MessageUtil.getMessage("delete.unsuccessful.msg"), true);
            return new ResponseEntity<>(message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
            return null;
    }
    @LogRequest
    @ApiOperation(value = "Get Credit Note By Invoice Id")
    @GetMapping(value = "/getCreditNoteByInvoiceId")
    public ResponseEntity<CreditNoteRequestModel> getInvoiceById(@RequestParam(value = "id") Integer id) {
        try {
            CreditNoteRequestModel creditNoteRequestModel = null;
                creditNoteRequestModel = creditNoteRestHelper.getCreditNoteByInvoiceId(id);
            return new ResponseEntity<>(creditNoteRequestModel, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @LogRequest
    @ApiOperation(value = "Get List Of Invoice By Credit Note")
    @GetMapping(value = "/getAppliedInvoicesByCreditNoteId")
    public ResponseEntity<List<AppliedInvoiceCreditNote>> getAppliedInvoicesByCreditNoteId(
            @RequestParam(value = "id") Integer id) {
        try {
            List<AppliedInvoiceCreditNote> appliedInvoiceCreditNoteList = creditNoteRestHelper.getAppliedInvoicesByCreditNoteId(id);
            return new ResponseEntity<>(appliedInvoiceCreditNoteList, HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
