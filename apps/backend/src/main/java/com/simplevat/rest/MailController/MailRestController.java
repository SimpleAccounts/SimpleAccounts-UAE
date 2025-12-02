package com.simplevat.rest.MailController;

import com.simplevat.aop.LogRequest;
import com.simplevat.constant.CommonStatusEnum;
import com.simplevat.entity.CreditNote;
import com.simplevat.entity.Invoice;
import com.simplevat.entity.Journal;
import com.simplevat.repository.InvoiceRepository;
import com.simplevat.repository.QuotationInvoiceRepository;
import com.simplevat.rest.PostingRequestModel;
import com.simplevat.rest.creditnotecontroller.CreditNoteRepository;
import com.simplevat.rest.creditnotecontroller.CreditNoteRestHelper;
import com.simplevat.rest.invoicecontroller.InvoiceRestHelper;
import com.simplevat.rfq_po.PoQuatation;
import com.simplevat.rfq_po.PoQuatationRepository;
import com.simplevat.security.JwtTokenUtil;
import com.simplevat.service.JournalService;
import com.simplevat.service.MailThemeTemplatesService;
import com.simplevat.utils.MessageUtil;
import com.simplevat.utils.SimpleVatMessage;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;


@Slf4j
@RestController
@RequestMapping(value = "/rest/mail")
public class MailRestController {
    @Autowired
    private PoQuatationRepository poQuatationRepository;
    @Autowired
    private QuotationInvoiceRepository quotationInvoiceRepository;
    @Autowired
    private JwtTokenUtil jwtTokenUtil;
    @Autowired
    private InvoiceRepository invoiceRepository;
    @Autowired
    private InvoiceRestHelper invoiceRestHelper;

    @Autowired
    private CreditNoteRepository creditNoteRepository;

    @Autowired
    private CreditNoteRestHelper creditNoteRestHelper;

    @Autowired
    private JournalService journalService;

    @Autowired
    private MailThemeTemplatesService mailThemeTemplatesService;
    @Autowired
    private EmailService emailService;

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "New Request For Invoice")
    @PostMapping(value = "/emailContent/getById")
    public ResponseEntity<?> getEmailContentById(
            @RequestBody EmailContentRequestModel emailContentRequestModel, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            EmailContentModel emailContentModel =  emailService.getEmailContent(emailContentRequestModel,userId);
            return new ResponseEntity<>(emailContentModel, HttpStatus.OK);
        } catch (Exception e) {
            SimpleVatMessage message= null;
            message = new SimpleVatMessage("",
                    MessageUtil.getMessage("sent.unsuccessful.msg"), true);
            return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @LogRequest
    @ApiOperation("Send mail for otc modules")
        @PostMapping(value = "/send/mail")
    public ResponseEntity<?> sendMail(@ModelAttribute EmailContentModel emailContentModel, HttpServletRequest request) {
        try {
            //auth
            SimpleVatMessage message = null;
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            //service call
            emailService.sendCustomizedEmail(emailContentModel, userId,request);
            Integer type = emailContentModel.getType();
            Journal journal = null;
            switch (type)
            {
                case 1: // Invoice
                    if(emailContentModel.getSendAgain().equals(Boolean.FALSE)) {
                        Invoice invoice = invoiceRepository.findById(emailContentModel.getId()).get();
                        PostingRequestModel postingRequestModel = new PostingRequestModel();
                        postingRequestModel.setPostingRefId(emailContentModel.getPostingRefId());
                        postingRequestModel.setPostingRefType(emailContentModel.getPostingRefType());
                        postingRequestModel.setAmount(emailContentModel.getAmount());
                        postingRequestModel.setAmountInWords(emailContentModel.getAmountInWords());
                        postingRequestModel.setMarkAsSent(emailContentModel.getMarkAsSent());
                        postingRequestModel.setVatInWords(emailContentModel.getVatInWords());
                        journal = invoiceRestHelper.invoicePosting(postingRequestModel, userId);
                        if (journal != null) {
                            journalService.persist(journal);
                        }

                        invoice.setStatus(CommonStatusEnum.POST.getValue());
                        invoiceRepository.save(invoice);
                    }

                case 7://Credit Note
                    if(emailContentModel.getSendAgain().equals(Boolean.FALSE)) {
                        CreditNote creditNote = creditNoteRepository.findById(emailContentModel.getId()).get();
                        PostingRequestModel postingRequestModel1 = new PostingRequestModel();
                        postingRequestModel1.setPostingRefId(emailContentModel.getPostingRefId());
                        postingRequestModel1.setSendAgain(emailContentModel.getSendAgain());
                        if(creditNote.getIsCNWithoutProduct().equals(Boolean.TRUE)) {
                            journal = creditNoteRestHelper.cnPostingWithoutInvoiceWithoutProduct(postingRequestModel1, userId);
                        }
                        else{
                            journal = creditNoteRestHelper.creditNotePosting(postingRequestModel1, userId);
                        }
                        if (journal != null) {
                            journalService.persist(journal);
                        }
                    }

                case 6://Quotation
                    if(emailContentModel.getSendAgain().equals(Boolean.FALSE)) {
                        PoQuatation quatation = poQuatationRepository.findById(emailContentModel.getId()).get();
                        quatation.setStatus(CommonStatusEnum.POST.getValue());
                        poQuatationRepository.save(quatation);
                    }

                case 4:// Purchase Order
                    if(emailContentModel.getSendAgain().equals(Boolean.FALSE)) {
                        PoQuatation Poquatation = poQuatationRepository.findById(emailContentModel.getId()).get();
                        Poquatation.setStatus(CommonStatusEnum.POST.getValue());
                        poQuatationRepository.save(Poquatation);
                    }
                default:
                    break;
            }

            }
         catch (Exception e) {

        }//resp return
        return new ResponseEntity<>("Mail sent", HttpStatus.OK);
    }
}
