package com.simpleaccounts.rest.MailController;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.constant.CommonStatusEnum;
import com.simpleaccounts.entity.CreditNote;
import com.simpleaccounts.entity.Invoice;
import com.simpleaccounts.entity.Journal;
import com.simpleaccounts.repository.InvoiceRepository;
import com.simpleaccounts.repository.QuotationInvoiceRepository;
import com.simpleaccounts.rest.PostingRequestModel;
import com.simpleaccounts.rest.creditnotecontroller.CreditNoteRepository;
import com.simpleaccounts.rest.creditnotecontroller.CreditNoteRestHelper;
import com.simpleaccounts.rest.invoicecontroller.InvoiceRestHelper;
import com.simpleaccounts.rfq_po.PoQuatation;
import com.simpleaccounts.rfq_po.PoQuatationRepository;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.JournalService;
import com.simpleaccounts.service.MailThemeTemplatesService;

import java.util.Optional;
import javax.servlet.http.HttpServletRequest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@WebMvcTest(MailRestController.class)
@AutoConfigureMockMvc(addFilters = false)
class MailRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean private PoQuatationRepository poQuatationRepository;
    @MockBean private QuotationInvoiceRepository quotationInvoiceRepository;
    @MockBean private JwtTokenUtil jwtTokenUtil;
    @MockBean private InvoiceRepository invoiceRepository;
    @MockBean private InvoiceRestHelper invoiceRestHelper;
    @MockBean private CreditNoteRepository creditNoteRepository;
    @MockBean private CreditNoteRestHelper creditNoteRestHelper;
    @MockBean private JournalService journalService;
    @MockBean private MailThemeTemplatesService mailThemeTemplatesService;
    @MockBean private EmailService emailService;
    @MockBean private CustomUserDetailsService customUserDetailsService;

    private MockHttpServletRequest mockRequest;

    @BeforeEach
    void setUp() {
        mockRequest = new MockHttpServletRequest();
    }

    @Test
    void getEmailContentByIdShouldReturnEmailContent() throws Exception {
        EmailContentRequestModel requestModel = new EmailContentRequestModel();
        requestModel.setId(1);
        requestModel.setType(1);

        EmailContentModel emailContent = new EmailContentModel();
        emailContent.setId(1);
        emailContent.setSubject("Test Email");

        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);
        when(emailService.getEmailContent(any(EmailContentRequestModel.class), eq(1))).thenReturn(emailContent);

        mockMvc.perform(post("/rest/mail/emailContent/getById")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.subject").value("Test Email"));

        verify(emailService).getEmailContent(any(EmailContentRequestModel.class), eq(1));
    }

    @Test
    void getEmailContentByIdShouldReturnInternalServerErrorOnException() throws Exception {
        EmailContentRequestModel requestModel = new EmailContentRequestModel();
        requestModel.setId(1);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);
        when(emailService.getEmailContent(any(EmailContentRequestModel.class), eq(1)))
                .thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(post("/rest/mail/emailContent/getById")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value(true));
    }

    @Test
    void getEmailContentByIdShouldExtractUserIdFromToken() throws Exception {
        EmailContentRequestModel requestModel = new EmailContentRequestModel();
        requestModel.setId(5);

        EmailContentModel emailContent = new EmailContentModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(99);
        when(emailService.getEmailContent(any(EmailContentRequestModel.class), eq(99))).thenReturn(emailContent);

        mockMvc.perform(post("/rest/mail/emailContent/getById")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isOk());

        verify(jwtTokenUtil).getUserIdFromHttpRequest(any(HttpServletRequest.class));
        verify(emailService).getEmailContent(any(EmailContentRequestModel.class), eq(99));
    }

    @Test
    void sendMailShouldSendEmailForInvoice() throws Exception {
        EmailContentModel emailModel = new EmailContentModel();
        emailModel.setId(1);
        emailModel.setType(1); // Invoice
        emailModel.setSendAgain(false);
        emailModel.setPostingRefId(1);
        emailModel.setPostingRefType("INVOICE");
        emailModel.setAmount(1000.0);
        emailModel.setMarkAsSent(true);

        Invoice invoice = new Invoice();
        invoice.setInvoiceId(1);

        Journal journal = new Journal();
        journal.setJournalId(1);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);
        when(invoiceRepository.findById(1)).thenReturn(Optional.of(invoice));
        when(invoiceRestHelper.invoicePosting(any(PostingRequestModel.class), eq(1))).thenReturn(journal);

        mockMvc.perform(post("/rest/mail/send/mail")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .param("id", "1")
                        .param("type", "1")
                        .param("sendAgain", "false")
                        .param("postingRefId", "1")
                        .param("postingRefType", "INVOICE")
                        .param("amount", "1000.0")
                        .param("markAsSent", "true"))
                .andExpect(status().isOk());

        verify(emailService).sendCustomizedEmail(any(EmailContentModel.class), eq(1), any(HttpServletRequest.class));
        verify(invoiceRestHelper).invoicePosting(any(PostingRequestModel.class), eq(1));
        verify(journalService).persist(journal);
        verify(invoiceRepository).save(any(Invoice.class));
    }

    @Test
    void sendMailShouldNotPostInvoiceWhenSendAgainIsTrue() throws Exception {
        EmailContentModel emailModel = new EmailContentModel();
        emailModel.setId(1);
        emailModel.setType(1); // Invoice
        emailModel.setSendAgain(true);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);

        mockMvc.perform(post("/rest/mail/send/mail")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .param("id", "1")
                        .param("type", "1")
                        .param("sendAgain", "true"))
                .andExpect(status().isOk());

        verify(emailService).sendCustomizedEmail(any(EmailContentModel.class), eq(1), any(HttpServletRequest.class));
        verify(invoiceRepository, never()).findById(any());
        verify(invoiceRestHelper, never()).invoicePosting(any(), any());
    }

    @Test
    void sendMailShouldSendEmailForCreditNote() throws Exception {
        CreditNote creditNote = new CreditNote();
        creditNote.setCreditNoteId(1);
        creditNote.setIsCNWithoutProduct(false);

        Journal journal = new Journal();
        journal.setJournalId(1);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);
        when(creditNoteRepository.findById(1)).thenReturn(Optional.of(creditNote));
        when(creditNoteRestHelper.creditNotePosting(any(PostingRequestModel.class), eq(1))).thenReturn(journal);

        mockMvc.perform(post("/rest/mail/send/mail")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .param("id", "1")
                        .param("type", "7")
                        .param("sendAgain", "false")
                        .param("postingRefId", "1"))
                .andExpect(status().isOk());

        verify(creditNoteRestHelper).creditNotePosting(any(PostingRequestModel.class), eq(1));
        verify(journalService).persist(journal);
    }

    @Test
    void sendMailShouldHandleCreditNoteWithoutProduct() throws Exception {
        CreditNote creditNote = new CreditNote();
        creditNote.setCreditNoteId(1);
        creditNote.setIsCNWithoutProduct(true);

        Journal journal = new Journal();
        journal.setJournalId(1);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);
        when(creditNoteRepository.findById(1)).thenReturn(Optional.of(creditNote));
        when(creditNoteRestHelper.cnPostingWithoutInvoiceWithoutProduct(any(PostingRequestModel.class), eq(1))).thenReturn(journal);

        mockMvc.perform(post("/rest/mail/send/mail")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .param("id", "1")
                        .param("type", "7")
                        .param("sendAgain", "false")
                        .param("postingRefId", "1"))
                .andExpect(status().isOk());

        verify(creditNoteRestHelper).cnPostingWithoutInvoiceWithoutProduct(any(PostingRequestModel.class), eq(1));
        verify(journalService).persist(journal);
    }

    @Test
    void sendMailShouldNotPostCreditNoteWhenSendAgainIsTrue() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);

        mockMvc.perform(post("/rest/mail/send/mail")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .param("id", "1")
                        .param("type", "7")
                        .param("sendAgain", "true"))
                .andExpect(status().isOk());

        verify(creditNoteRepository, never()).findById(any());
        verify(creditNoteRestHelper, never()).creditNotePosting(any(), any());
    }

    @Test
    void sendMailShouldSendEmailForQuotation() throws Exception {
        PoQuatation quotation = new PoQuatation();
        quotation.setId(1);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);
        when(poQuatationRepository.findById(1)).thenReturn(Optional.of(quotation));

        mockMvc.perform(post("/rest/mail/send/mail")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .param("id", "1")
                        .param("type", "6")
                        .param("sendAgain", "false"))
                .andExpect(status().isOk());

        verify(poQuatationRepository).findById(1);
        verify(poQuatationRepository).save(any(PoQuatation.class));
    }

    @Test
    void sendMailShouldUpdateQuotationStatusToPost() throws Exception {
        PoQuatation quotation = new PoQuatation();
        quotation.setId(1);
        quotation.setStatus(0);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);
        when(poQuatationRepository.findById(1)).thenReturn(Optional.of(quotation));

        mockMvc.perform(post("/rest/mail/send/mail")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .param("id", "1")
                        .param("type", "6")
                        .param("sendAgain", "false"))
                .andExpect(status().isOk());

        verify(poQuatationRepository).save(quotation);
        assert quotation.getStatus() == CommonStatusEnum.POST.getValue();
    }

    @Test
    void sendMailShouldNotPostQuotationWhenSendAgainIsTrue() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);

        mockMvc.perform(post("/rest/mail/send/mail")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .param("id", "1")
                        .param("type", "6")
                        .param("sendAgain", "true"))
                .andExpect(status().isOk());

        verify(poQuatationRepository, never()).findById(any());
        verify(poQuatationRepository, never()).save(any());
    }

    @Test
    void sendMailShouldSendEmailForPurchaseOrder() throws Exception {
        PoQuatation purchaseOrder = new PoQuatation();
        purchaseOrder.setId(1);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);
        when(poQuatationRepository.findById(1)).thenReturn(Optional.of(purchaseOrder));

        mockMvc.perform(post("/rest/mail/send/mail")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .param("id", "1")
                        .param("type", "4")
                        .param("sendAgain", "false"))
                .andExpect(status().isOk());

        verify(poQuatationRepository).findById(1);
        verify(poQuatationRepository).save(any(PoQuatation.class));
    }

    @Test
    void sendMailShouldUpdatePurchaseOrderStatusToPost() throws Exception {
        PoQuatation purchaseOrder = new PoQuatation();
        purchaseOrder.setId(1);
        purchaseOrder.setStatus(0);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);
        when(poQuatationRepository.findById(1)).thenReturn(Optional.of(purchaseOrder));

        mockMvc.perform(post("/rest/mail/send/mail")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .param("id", "1")
                        .param("type", "4")
                        .param("sendAgain", "false"))
                .andExpect(status().isOk());

        verify(poQuatationRepository).save(purchaseOrder);
        assert purchaseOrder.getStatus() == CommonStatusEnum.POST.getValue();
    }

    @Test
    void sendMailShouldNotPostPurchaseOrderWhenSendAgainIsTrue() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);

        mockMvc.perform(post("/rest/mail/send/mail")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .param("id", "1")
                        .param("type", "4")
                        .param("sendAgain", "true"))
                .andExpect(status().isOk());

        verify(poQuatationRepository, never()).findById(any());
        verify(poQuatationRepository, never()).save(any());
    }

    @Test
    void sendMailShouldHandleUnknownTypeGracefully() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);

        mockMvc.perform(post("/rest/mail/send/mail")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .param("id", "1")
                        .param("type", "999")
                        .param("sendAgain", "false"))
                .andExpect(status().isOk());

        verify(emailService).sendCustomizedEmail(any(EmailContentModel.class), eq(1), any(HttpServletRequest.class));
    }

    @Test
    void sendMailShouldNotPersistJournalWhenJournalIsNull() throws Exception {
        Invoice invoice = new Invoice();
        invoice.setInvoiceId(1);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);
        when(invoiceRepository.findById(1)).thenReturn(Optional.of(invoice));
        when(invoiceRestHelper.invoicePosting(any(PostingRequestModel.class), eq(1))).thenReturn(null);

        mockMvc.perform(post("/rest/mail/send/mail")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .param("id", "1")
                        .param("type", "1")
                        .param("sendAgain", "false")
                        .param("postingRefId", "1"))
                .andExpect(status().isOk());

        verify(journalService, never()).persist(any());
    }

    @Test
    void sendMailShouldUpdateInvoiceStatusToPost() throws Exception {
        Invoice invoice = new Invoice();
        invoice.setInvoiceId(1);
        invoice.setStatus(0);

        Journal journal = new Journal();

        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);
        when(invoiceRepository.findById(1)).thenReturn(Optional.of(invoice));
        when(invoiceRestHelper.invoicePosting(any(PostingRequestModel.class), eq(1))).thenReturn(journal);

        mockMvc.perform(post("/rest/mail/send/mail")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .param("id", "1")
                        .param("type", "1")
                        .param("sendAgain", "false")
                        .param("postingRefId", "1"))
                .andExpect(status().isOk());

        verify(invoiceRepository).save(invoice);
        assert invoice.getStatus() == CommonStatusEnum.POST.getValue();
    }

    @Test
    void sendMailShouldCatchExceptionAndReturnOk() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);
        when(emailService.sendCustomizedEmail(any(), any(), any())).thenThrow(new RuntimeException("Email error"));

        mockMvc.perform(post("/rest/mail/send/mail")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .param("id", "1")
                        .param("type", "1")
                        .param("sendAgain", "false"))
                .andExpect(status().isOk());
    }
}
