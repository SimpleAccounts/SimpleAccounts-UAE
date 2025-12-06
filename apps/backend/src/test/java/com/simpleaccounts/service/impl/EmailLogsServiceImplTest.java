package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.EmailLogsDao;
import com.simpleaccounts.entity.EmailLogs;
import com.simpleaccounts.exceptions.ServiceException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class EmailLogsServiceImplTest {

    @Mock
    private EmailLogsDao emailLogsDao;

    @InjectMocks
    private EmailLogsServiceImpl emailLogsService;

    private EmailLogs testEmailLog;

    @BeforeEach
    void setUp() {
        testEmailLog = new EmailLogs();
        testEmailLog.setEmailLogId(1);
        testEmailLog.setEmailTo("test@example.com");
        testEmailLog.setEmailFrom("noreply@simpleaccounts.com");
        testEmailLog.setEmailSubject("Test Email");
        testEmailLog.setEmailBody("This is a test email body");
        testEmailLog.setEmailStatus("SENT");
        testEmailLog.setSentDate(LocalDateTime.now());
        testEmailLog.setCreatedBy(1);
        testEmailLog.setCreatedDate(LocalDateTime.now());
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnEmailLogsDaoWhenGetDaoCalled() {
        assertThat(emailLogsService.getDao()).isEqualTo(emailLogsDao);
    }

    // ========== findByPK Tests ==========

    @Test
    void shouldReturnEmailLogWhenFoundByPK() {
        when(emailLogsDao.findByPK(1)).thenReturn(testEmailLog);

        EmailLogs result = emailLogsService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getEmailLogId()).isEqualTo(1);
        assertThat(result.getEmailTo()).isEqualTo("test@example.com");
        assertThat(result.getEmailSubject()).isEqualTo("Test Email");
        assertThat(result.getEmailStatus()).isEqualTo("SENT");
        verify(emailLogsDao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenEmailLogNotFoundByPK() {
        when(emailLogsDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> emailLogsService.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(emailLogsDao, times(1)).findByPK(999);
    }

    @Test
    void shouldFindEmailLogByDifferentIds() {
        EmailLogs emailLog2 = new EmailLogs();
        emailLog2.setEmailLogId(2);
        emailLog2.setEmailTo("another@example.com");
        emailLog2.setEmailStatus("FAILED");

        when(emailLogsDao.findByPK(1)).thenReturn(testEmailLog);
        when(emailLogsDao.findByPK(2)).thenReturn(emailLog2);

        EmailLogs result1 = emailLogsService.findByPK(1);
        EmailLogs result2 = emailLogsService.findByPK(2);

        assertThat(result1.getEmailStatus()).isEqualTo("SENT");
        assertThat(result2.getEmailStatus()).isEqualTo("FAILED");
        verify(emailLogsDao, times(1)).findByPK(1);
        verify(emailLogsDao, times(1)).findByPK(2);
    }

    @Test
    void shouldHandleMultipleCallsForSameId() {
        when(emailLogsDao.findByPK(1)).thenReturn(testEmailLog);

        EmailLogs result1 = emailLogsService.findByPK(1);
        EmailLogs result2 = emailLogsService.findByPK(1);

        assertThat(result1).isEqualTo(testEmailLog);
        assertThat(result2).isEqualTo(testEmailLog);
        verify(emailLogsDao, times(2)).findByPK(1);
    }

    // ========== persist Tests ==========

    @Test
    void shouldPersistNewEmailLog() {
        emailLogsService.persist(testEmailLog);

        verify(emailLogsDao, times(1)).persist(testEmailLog);
    }

    @Test
    void shouldPersistEmailLogWithAllFields() {
        testEmailLog.setEmailCc("cc@example.com");
        testEmailLog.setEmailBcc("bcc@example.com");
        testEmailLog.setAttachmentPath("/path/to/attachment.pdf");

        emailLogsService.persist(testEmailLog);

        verify(emailLogsDao, times(1)).persist(testEmailLog);
    }

    @Test
    void shouldPersistMultipleEmailLogs() {
        EmailLogs emailLog2 = new EmailLogs();
        emailLog2.setEmailLogId(2);
        emailLog2.setEmailTo("second@example.com");

        emailLogsService.persist(testEmailLog);
        emailLogsService.persist(emailLog2);

        verify(emailLogsDao, times(1)).persist(testEmailLog);
        verify(emailLogsDao, times(1)).persist(emailLog2);
    }

    @Test
    void shouldPersistEmailLogWithFailedStatus() {
        testEmailLog.setEmailStatus("FAILED");
        testEmailLog.setErrorMessage("SMTP connection failed");

        emailLogsService.persist(testEmailLog);

        verify(emailLogsDao, times(1)).persist(testEmailLog);
    }

    // ========== update Tests ==========

    @Test
    void shouldUpdateExistingEmailLog() {
        when(emailLogsDao.update(testEmailLog)).thenReturn(testEmailLog);

        EmailLogs result = emailLogsService.update(testEmailLog);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testEmailLog);
        verify(emailLogsDao, times(1)).update(testEmailLog);
    }

    @Test
    void shouldUpdateEmailLogStatusToSent() {
        testEmailLog.setEmailStatus("PENDING");
        when(emailLogsDao.update(testEmailLog)).thenReturn(testEmailLog);

        testEmailLog.setEmailStatus("SENT");
        testEmailLog.setSentDate(LocalDateTime.now());
        EmailLogs result = emailLogsService.update(testEmailLog);

        assertThat(result).isNotNull();
        assertThat(result.getEmailStatus()).isEqualTo("SENT");
        assertThat(result.getSentDate()).isNotNull();
        verify(emailLogsDao, times(1)).update(testEmailLog);
    }

    @Test
    void shouldUpdateEmailLogWithErrorMessage() {
        testEmailLog.setEmailStatus("FAILED");
        testEmailLog.setErrorMessage("Invalid email address");
        when(emailLogsDao.update(testEmailLog)).thenReturn(testEmailLog);

        EmailLogs result = emailLogsService.update(testEmailLog);

        assertThat(result).isNotNull();
        assertThat(result.getEmailStatus()).isEqualTo("FAILED");
        assertThat(result.getErrorMessage()).isEqualTo("Invalid email address");
        verify(emailLogsDao, times(1)).update(testEmailLog);
    }

    @Test
    void shouldUpdateEmailLogMultipleTimes() {
        when(emailLogsDao.update(testEmailLog)).thenReturn(testEmailLog);

        testEmailLog.setEmailStatus("PENDING");
        emailLogsService.update(testEmailLog);

        testEmailLog.setEmailStatus("SENT");
        emailLogsService.update(testEmailLog);

        verify(emailLogsDao, times(2)).update(testEmailLog);
    }

    // ========== delete Tests ==========

    @Test
    void shouldDeleteEmailLog() {
        emailLogsService.delete(testEmailLog);

        verify(emailLogsDao, times(1)).delete(testEmailLog);
    }

    @Test
    void shouldDeleteMultipleEmailLogs() {
        EmailLogs emailLog2 = new EmailLogs();
        emailLog2.setEmailLogId(2);

        emailLogsService.delete(testEmailLog);
        emailLogsService.delete(emailLog2);

        verify(emailLogsDao, times(1)).delete(testEmailLog);
        verify(emailLogsDao, times(1)).delete(emailLog2);
    }

    // ========== findByAttributes Tests ==========

    @Test
    void shouldReturnEmailLogsWhenValidAttributesProvided() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("emailStatus", "SENT");
        attributes.put("emailTo", "test@example.com");

        List<EmailLogs> expectedList = Arrays.asList(testEmailLog);
        when(emailLogsDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<EmailLogs> result = emailLogsService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testEmailLog);
        verify(emailLogsDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("emailStatus", "BOUNCED");

        when(emailLogsDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<EmailLogs> result = emailLogsService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(emailLogsDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnMultipleEmailLogsWhenMultipleMatch() {
        EmailLogs emailLog2 = new EmailLogs();
        emailLog2.setEmailLogId(2);
        emailLog2.setEmailTo("second@example.com");
        emailLog2.setEmailStatus("SENT");

        EmailLogs emailLog3 = new EmailLogs();
        emailLog3.setEmailLogId(3);
        emailLog3.setEmailTo("third@example.com");
        emailLog3.setEmailStatus("SENT");

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("emailStatus", "SENT");

        List<EmailLogs> expectedList = Arrays.asList(testEmailLog, emailLog2, emailLog3);
        when(emailLogsDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<EmailLogs> result = emailLogsService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(testEmailLog, emailLog2, emailLog3);
        verify(emailLogsDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldFindEmailLogsByFailedStatus() {
        EmailLogs failedLog = new EmailLogs();
        failedLog.setEmailLogId(2);
        failedLog.setEmailStatus("FAILED");
        failedLog.setErrorMessage("Connection timeout");

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("emailStatus", "FAILED");

        List<EmailLogs> expectedList = Arrays.asList(failedLog);
        when(emailLogsDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<EmailLogs> result = emailLogsService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmailStatus()).isEqualTo("FAILED");
        verify(emailLogsDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<EmailLogs> result = emailLogsService.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(emailLogsDao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<EmailLogs> result = emailLogsService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(emailLogsDao, never()).findByAttributes(any());
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleEmailLogWithLongBody() {
        String longBody = new String(new char[5000]).replace('\0', 'x');
        testEmailLog.setEmailBody(longBody);
        when(emailLogsDao.findByPK(1)).thenReturn(testEmailLog);

        EmailLogs result = emailLogsService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getEmailBody()).hasSize(5000);
        verify(emailLogsDao, times(1)).findByPK(1);
    }

    @Test
    void shouldHandleEmailLogWithMultipleRecipients() {
        testEmailLog.setEmailTo("user1@example.com, user2@example.com, user3@example.com");
        testEmailLog.setEmailCc("cc1@example.com, cc2@example.com");
        when(emailLogsDao.findByPK(1)).thenReturn(testEmailLog);

        EmailLogs result = emailLogsService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getEmailTo()).contains(",");
        assertThat(result.getEmailCc()).contains(",");
        verify(emailLogsDao, times(1)).findByPK(1);
    }

    @Test
    void shouldHandleEmailLogWithSpecialCharacters() {
        testEmailLog.setEmailSubject("Invoice #12345 - Amount: $1,000.00");
        testEmailLog.setEmailBody("Dear customer,\nYour invoice is ready.\nTotal: $1,000.00\nThanks!");
        when(emailLogsDao.findByPK(1)).thenReturn(testEmailLog);

        EmailLogs result = emailLogsService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getEmailSubject()).contains("#", "$", ",");
        assertThat(result.getEmailBody()).contains("\n", "$");
        verify(emailLogsDao, times(1)).findByPK(1);
    }

    @Test
    void shouldHandleEmailLogWithNullOptionalFields() {
        EmailLogs minimalLog = new EmailLogs();
        minimalLog.setEmailLogId(2);
        minimalLog.setEmailTo("minimal@example.com");
        when(emailLogsDao.findByPK(2)).thenReturn(minimalLog);

        EmailLogs result = emailLogsService.findByPK(2);

        assertThat(result).isNotNull();
        assertThat(result.getEmailLogId()).isEqualTo(2);
        assertThat(result.getEmailSubject()).isNull();
        assertThat(result.getEmailBody()).isNull();
        verify(emailLogsDao, times(1)).findByPK(2);
    }

    @Test
    void shouldVerifyDaoInteractionForMultipleOperations() {
        when(emailLogsDao.findByPK(1)).thenReturn(testEmailLog);
        when(emailLogsDao.update(testEmailLog)).thenReturn(testEmailLog);

        emailLogsService.findByPK(1);
        emailLogsService.update(testEmailLog);
        emailLogsService.persist(testEmailLog);
        emailLogsService.delete(testEmailLog);

        verify(emailLogsDao, times(1)).findByPK(1);
        verify(emailLogsDao, times(1)).update(testEmailLog);
        verify(emailLogsDao, times(1)).persist(testEmailLog);
        verify(emailLogsDao, times(1)).delete(testEmailLog);
    }

    @Test
    void shouldHandleEmailLogWithHTMLBody() {
        testEmailLog.setEmailBody("<html><body><h1>Invoice</h1><p>Amount: $1000</p></body></html>");
        when(emailLogsDao.findByPK(1)).thenReturn(testEmailLog);

        EmailLogs result = emailLogsService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getEmailBody()).contains("<html>", "<body>", "<h1>");
        verify(emailLogsDao, times(1)).findByPK(1);
    }
}
