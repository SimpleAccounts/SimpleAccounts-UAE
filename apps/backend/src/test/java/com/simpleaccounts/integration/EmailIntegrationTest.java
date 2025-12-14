package com.simpleaccounts.integration;

import static org.assertj.core.api.Assertions.*;

import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Integration tests for email functionality.
 * In production, this would use GreenMail for SMTP testing.
 * This implementation uses a mock email service for demonstration.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Email Integration Tests")
class EmailIntegrationTest {

    private MockEmailService emailService;
    private MockSmtpServer smtpServer;

    @BeforeEach
    void setUp() {
        smtpServer = new MockSmtpServer();
        smtpServer.start();
        emailService = new MockEmailService(smtpServer);
    }

    @AfterEach
    void tearDown() {
        smtpServer.stop();
    }

    @Nested
    @DisplayName("Invoice Email Tests")
    class InvoiceEmailTests {

        @Test
        @DisplayName("Should send invoice email with PDF attachment")
        void shouldSendInvoiceEmailWithPdfAttachment() {
            // Given
            String recipient = "customer@example.com";
            String invoiceNumber = "INV-2024-001";
            byte[] pdfContent = "Mock PDF content".getBytes();

            EmailRequest request = EmailRequest.builder()
                    .to(recipient)
                    .subject("Invoice " + invoiceNumber)
                    .body("Please find attached invoice " + invoiceNumber)
                    .attachment(new EmailAttachment("invoice.pdf", "application/pdf", pdfContent))
                    .build();

            // When
            EmailResult result = emailService.send(request);

            // Then
            assertThat(result.isSuccess()).isTrue();
            assertThat(smtpServer.getReceivedEmails()).hasSize(1);

            MockEmail receivedEmail = smtpServer.getReceivedEmails().get(0);
            assertThat(receivedEmail.getTo()).isEqualTo(recipient);
            assertThat(receivedEmail.getSubject()).contains(invoiceNumber);
            assertThat(receivedEmail.getAttachments()).hasSize(1);
            assertThat(receivedEmail.getAttachments().get(0).getFilename()).isEqualTo("invoice.pdf");
        }

        @Test
        @DisplayName("Should send invoice reminder email")
        void shouldSendInvoiceReminderEmail() {
            // Given
            String recipient = "customer@example.com";
            String invoiceNumber = "INV-2024-001";
            int daysOverdue = 7;

            EmailRequest request = EmailRequest.builder()
                    .to(recipient)
                    .subject("Payment Reminder: Invoice " + invoiceNumber)
                    .body("This is a reminder that invoice " + invoiceNumber +
                          " is " + daysOverdue + " days overdue.")
                    .build();

            // When
            EmailResult result = emailService.send(request);

            // Then
            assertThat(result.isSuccess()).isTrue();

            MockEmail receivedEmail = smtpServer.getReceivedEmails().get(0);
            assertThat(receivedEmail.getBody()).contains("7 days overdue");
        }

        @Test
        @DisplayName("Should send batch invoices to multiple recipients")
        void shouldSendBatchInvoicesToMultipleRecipients() {
            // Given
            List<String> recipients = Arrays.asList(
                    "customer1@example.com",
                    "customer2@example.com",
                    "customer3@example.com"
            );

            // When
            for (String recipient : recipients) {
                EmailRequest request = EmailRequest.builder()
                        .to(recipient)
                        .subject("Your Invoice")
                        .body("Invoice attached")
                        .build();
                emailService.send(request);
            }

            // Then
            assertThat(smtpServer.getReceivedEmails()).hasSize(3);
            Set<String> sentTo = new HashSet<>();
            for (MockEmail email : smtpServer.getReceivedEmails()) {
                sentTo.add(email.getTo());
            }
            assertThat(sentTo).containsExactlyInAnyOrderElementsOf(recipients);
        }
    }

    @Nested
    @DisplayName("Payroll Email Tests")
    class PayrollEmailTests {

        @Test
        @DisplayName("Should send payslip email to employee")
        void shouldSendPayslipEmailToEmployee() {
            // Given
            String employeeEmail = "employee@company.com";
            String payPeriod = "December 2024";
            byte[] payslipPdf = "Mock Payslip PDF".getBytes();

            EmailRequest request = EmailRequest.builder()
                    .to(employeeEmail)
                    .subject("Payslip for " + payPeriod)
                    .body("Your payslip for " + payPeriod + " is attached.")
                    .attachment(new EmailAttachment("payslip.pdf", "application/pdf", payslipPdf))
                    .build();

            // When
            EmailResult result = emailService.send(request);

            // Then
            assertThat(result.isSuccess()).isTrue();

            MockEmail receivedEmail = smtpServer.getReceivedEmails().get(0);
            assertThat(receivedEmail.getTo()).isEqualTo(employeeEmail);
            assertThat(receivedEmail.getSubject()).contains("December 2024");
        }

        @Test
        @DisplayName("Should send WPS file notification to bank")
        void shouldSendWpsFileNotificationToBank() {
            // Given
            String bankEmail = "wps@bank.ae";
            String wpsReference = "WPS-2024-12-001";
            byte[] wpsFile = "Mock WPS CSV content".getBytes();

            EmailRequest request = EmailRequest.builder()
                    .to(bankEmail)
                    .subject("WPS File Submission: " + wpsReference)
                    .body("Please process the attached WPS file.")
                    .attachment(new EmailAttachment("wps_salaries.csv", "text/csv", wpsFile))
                    .build();

            // When
            EmailResult result = emailService.send(request);

            // Then
            assertThat(result.isSuccess()).isTrue();

            MockEmail receivedEmail = smtpServer.getReceivedEmails().get(0);
            assertThat(receivedEmail.getAttachments().get(0).getContentType()).isEqualTo("text/csv");
        }
    }

    @Nested
    @DisplayName("Report Email Tests")
    class ReportEmailTests {

        @Test
        @DisplayName("Should send scheduled report via email")
        void shouldSendScheduledReportViaEmail() {
            // Given
            String recipient = "manager@company.com";
            String reportName = "Monthly P&L Report";
            byte[] reportPdf = "Mock Report PDF".getBytes();

            EmailRequest request = EmailRequest.builder()
                    .to(recipient)
                    .subject("Scheduled Report: " + reportName)
                    .body("Your scheduled report is attached.")
                    .attachment(new EmailAttachment("pnl_report.pdf", "application/pdf", reportPdf))
                    .build();

            // When
            EmailResult result = emailService.send(request);

            // Then
            assertThat(result.isSuccess()).isTrue();
        }

        @Test
        @DisplayName("Should send report to multiple recipients with CC")
        void shouldSendReportToMultipleRecipientsWithCc() {
            // Given
            String primaryRecipient = "cfo@company.com";
            List<String> ccRecipients = Arrays.asList("controller@company.com", "accountant@company.com");

            EmailRequest request = EmailRequest.builder()
                    .to(primaryRecipient)
                    .cc(ccRecipients)
                    .subject("Quarterly Financial Summary")
                    .body("Please review the attached financial summary.")
                    .build();

            // When
            EmailResult result = emailService.send(request);

            // Then
            assertThat(result.isSuccess()).isTrue();

            MockEmail receivedEmail = smtpServer.getReceivedEmails().get(0);
            assertThat(receivedEmail.getCc()).containsExactlyInAnyOrderElementsOf(ccRecipients);
        }
    }

    @Nested
    @DisplayName("Email Error Handling Tests")
    class EmailErrorHandlingTests {

        @Test
        @DisplayName("Should handle SMTP connection failure gracefully")
        void shouldHandleSmtpConnectionFailureGracefully() {
            // Given
            smtpServer.stop(); // Simulate server down

            EmailRequest request = EmailRequest.builder()
                    .to("test@example.com")
                    .subject("Test")
                    .body("Test body")
                    .build();

            // When
            EmailResult result = emailService.send(request);

            // Then
            assertThat(result.isSuccess()).isFalse();
            assertThat(result.getErrorMessage()).contains("connection");
        }

        @Test
        @DisplayName("Should validate email address format")
        void shouldValidateEmailAddressFormat() {
            // Given
            EmailRequest request = EmailRequest.builder()
                    .to("invalid-email")
                    .subject("Test")
                    .body("Test body")
                    .build();

            // When/Then
            assertThatThrownBy(() -> emailService.send(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Invalid email address");
        }

        @Test
        @DisplayName("Should handle attachment size limit")
        void shouldHandleAttachmentSizeLimit() {
            // Given
            byte[] largeAttachment = new byte[25 * 1024 * 1024]; // 25MB
            Arrays.fill(largeAttachment, (byte) 'x');

            EmailRequest request = EmailRequest.builder()
                    .to("test@example.com")
                    .subject("Large Attachment Test")
                    .body("Test body")
                    .attachment(new EmailAttachment("large.pdf", "application/pdf", largeAttachment))
                    .build();

            // When
            EmailResult result = emailService.send(request);

            // Then
            assertThat(result.isSuccess()).isFalse();
            assertThat(result.getErrorMessage()).contains("size limit");
        }

        @Test
        @DisplayName("Should retry failed email delivery")
        void shouldRetryFailedEmailDelivery() {
            // Given
            smtpServer.setFailNextNAttempts(2); // Fail first 2 attempts

            EmailRequest request = EmailRequest.builder()
                    .to("test@example.com")
                    .subject("Retry Test")
                    .body("Test body")
                    .build();

            // When
            EmailResult result = emailService.sendWithRetry(request, 3);

            // Then
            assertThat(result.isSuccess()).isTrue();
            assertThat(result.getAttempts()).isEqualTo(3);
        }
    }

    // Mock classes for testing

    static class MockSmtpServer {
        private boolean running = false;
        private final List<MockEmail> receivedEmails = new CopyOnWriteArrayList<>();
        private int failNextNAttempts = 0;

        void start() {
            running = true;
        }

        void stop() {
            running = false;
        }

        boolean isRunning() {
            return running;
        }

        void receiveEmail(MockEmail email) {
            receivedEmails.add(email);
        }

        List<MockEmail> getReceivedEmails() {
            return new ArrayList<>(receivedEmails);
        }

        void setFailNextNAttempts(int n) {
            this.failNextNAttempts = n;
        }

        boolean shouldFail() {
            if (failNextNAttempts > 0) {
                failNextNAttempts--;
                return true;
            }
            return false;
        }
    }

    static class MockEmail {
        private String to;
        private List<String> cc;
        private String subject;
        private String body;
        private List<EmailAttachment> attachments;

        public String getTo() { return to; }
        public void setTo(String to) { this.to = to; }
        public List<String> getCc() { return cc; }
        public void setCc(List<String> cc) { this.cc = cc; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getBody() { return body; }
        public void setBody(String body) { this.body = body; }
        public List<EmailAttachment> getAttachments() { return attachments; }
        public void setAttachments(List<EmailAttachment> attachments) { this.attachments = attachments; }
    }

    static class MockEmailService {
        private final MockSmtpServer smtpServer;
        private static final int MAX_ATTACHMENT_SIZE = 20 * 1024 * 1024; // 20MB

        MockEmailService(MockSmtpServer smtpServer) {
            this.smtpServer = smtpServer;
        }

        EmailResult send(EmailRequest request) {
            // Validate email address
            if (!isValidEmail(request.getTo())) {
                throw new IllegalArgumentException("Invalid email address: " + request.getTo());
            }

            // Check attachment size
            if (request.getAttachment() != null &&
                request.getAttachment().getContent().length > MAX_ATTACHMENT_SIZE) {
                return EmailResult.failure("Attachment exceeds size limit of 20MB");
            }

            // Check server connection
            if (!smtpServer.isRunning()) {
                return EmailResult.failure("Failed to establish connection to SMTP server");
            }

            // Check if should fail (for retry testing)
            if (smtpServer.shouldFail()) {
                return EmailResult.failure("Temporary SMTP error");
            }

            // Send email
            MockEmail email = new MockEmail();
            email.setTo(request.getTo());
            email.setCc(request.getCc());
            email.setSubject(request.getSubject());
            email.setBody(request.getBody());
            if (request.getAttachment() != null) {
                email.setAttachments(Collections.singletonList(request.getAttachment()));
            } else {
                email.setAttachments(Collections.emptyList());
            }

            smtpServer.receiveEmail(email);
            return EmailResult.success();
        }

        EmailResult sendWithRetry(EmailRequest request, int maxRetries) {
            int attempts = 0;
            EmailResult result = null;

            while (attempts < maxRetries) {
                attempts++;
                result = send(request);
                if (result.isSuccess()) {
                    result.setAttempts(attempts);
                    return result;
                }
            }

            return result != null ? result : EmailResult.failure("Max retries exceeded");
        }

        private boolean isValidEmail(String email) {
            return email != null && email.contains("@") && email.contains(".");
        }
    }

    static class EmailRequest {
        private String to;
        private List<String> cc;
        private String subject;
        private String body;
        private EmailAttachment attachment;

        public String getTo() { return to; }
        public List<String> getCc() { return cc; }
        public String getSubject() { return subject; }
        public String getBody() { return body; }
        public EmailAttachment getAttachment() { return attachment; }

        static Builder builder() {
            return new Builder();
        }

        static class Builder {
            private final EmailRequest request = new EmailRequest();

            Builder to(String to) { request.to = to; return this; }
            Builder cc(List<String> cc) { request.cc = cc; return this; }
            Builder subject(String subject) { request.subject = subject; return this; }
            Builder body(String body) { request.body = body; return this; }
            Builder attachment(EmailAttachment attachment) { request.attachment = attachment; return this; }

            EmailRequest build() { return request; }
        }
    }

    static class EmailAttachment {
        private final String filename;
        private final String contentType;
        private final byte[] content;

        EmailAttachment(String filename, String contentType, byte[] content) {
            this.filename = filename;
            this.contentType = contentType;
            this.content = content;
        }

        public String getFilename() { return filename; }
        public String getContentType() { return contentType; }
        public byte[] getContent() { return content; }
    }

    static class EmailResult {
        private final boolean success;
        private final String errorMessage;
        private int attempts = 1;

        private EmailResult(boolean success, String errorMessage) {
            this.success = success;
            this.errorMessage = errorMessage;
        }

        static EmailResult success() {
            return new EmailResult(true, null);
        }

        static EmailResult failure(String errorMessage) {
            return new EmailResult(false, errorMessage);
        }

        public boolean isSuccess() { return success; }
        public String getErrorMessage() { return errorMessage; }
        public int getAttempts() { return attempts; }
        public void setAttempts(int attempts) { this.attempts = attempts; }
    }
}
