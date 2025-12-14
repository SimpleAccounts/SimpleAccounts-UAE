package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import com.simpleaccounts.dao.FileAttachmentDao;
import com.simpleaccounts.entity.FileAttachment;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Unit tests for FileAttachmentServiceImpl.
 */
@ExtendWith(MockitoExtension.class)
class FileAttachmentServiceImplTest {

    @Mock
    private FileAttachmentDao fileAttachmentDao;

    @InjectMocks
    private FileAttachmentServiceImpl fileAttachmentService;

    private FileAttachment testAttachment;

    @BeforeEach
    void setUp() {
        testAttachment = new FileAttachment();
        testAttachment.setId(1);
        testAttachment.setFileName("test-document.pdf");
        testAttachment.setFileType("application/pdf");
        testAttachment.setFileData("Test file content".getBytes());
        testAttachment.setCreatedBy(1);
        testAttachment.setCreatedDate(LocalDateTime.now());
        testAttachment.setDeleteFlag(false);
    }

    // ========== Basic DAO Operations Tests ==========

    @Test
    void shouldReturnDaoInstance() {
        assertThat(fileAttachmentDao).isNotNull();
    }

    @Test
    void shouldCreateFileAttachmentWithBasicConstructor() {
        FileAttachment attachment = new FileAttachment("report.xlsx", "application/vnd.ms-excel", "data".getBytes());

        assertThat(attachment.getFileName()).isEqualTo("report.xlsx");
        assertThat(attachment.getFileType()).isEqualTo("application/vnd.ms-excel");
        assertThat(attachment.getFileData()).isEqualTo("data".getBytes());
    }

    @Test
    void shouldHaveCorrectFileNameSet() {
        assertThat(testAttachment.getFileName()).isEqualTo("test-document.pdf");
    }

    @Test
    void shouldHaveCorrectFileTypeSet() {
        assertThat(testAttachment.getFileType()).isEqualTo("application/pdf");
    }

    @Test
    void shouldHaveCorrectFileDataSet() {
        assertThat(testAttachment.getFileData()).isEqualTo("Test file content".getBytes());
    }

    // ========== File Type Tests ==========

    @Test
    void shouldHandlePdfFileType() {
        testAttachment.setFileType("application/pdf");
        assertThat(testAttachment.getFileType()).isEqualTo("application/pdf");
    }

    @Test
    void shouldHandleImageFileType() {
        testAttachment.setFileType("image/png");
        assertThat(testAttachment.getFileType()).isEqualTo("image/png");
    }

    @Test
    void shouldHandleExcelFileType() {
        testAttachment.setFileType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        assertThat(testAttachment.getFileType()).contains("spreadsheet");
    }

    @Test
    void shouldHandleWordFileType() {
        testAttachment.setFileType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        assertThat(testAttachment.getFileType()).contains("wordprocessing");
    }

    // ========== File Data Tests ==========

    @Test
    void shouldHandleEmptyFileData() {
        testAttachment.setFileData(new byte[0]);
        assertThat(testAttachment.getFileData()).isEmpty();
    }

    @Test
    void shouldHandleNullFileData() {
        testAttachment.setFileData(null);
        assertThat(testAttachment.getFileData()).isNull();
    }

    @Test
    void shouldHandleLargeFileData() {
        byte[] largeData = new byte[1024 * 1024]; // 1MB
        testAttachment.setFileData(largeData);
        assertThat(testAttachment.getFileData()).hasSize(1024 * 1024);
    }

    @Test
    void shouldHandleBinaryFileData() {
        byte[] binaryData = new byte[]{0x00, 0x01, 0x02, (byte) 0xFF, (byte) 0xFE};
        testAttachment.setFileData(binaryData);
        assertThat(testAttachment.getFileData()).containsExactly(0x00, 0x01, 0x02, (byte) 0xFF, (byte) 0xFE);
    }

    // ========== File Name Tests ==========

    @Test
    void shouldHandleFileNameWithSpaces() {
        testAttachment.setFileName("my document file.pdf");
        assertThat(testAttachment.getFileName()).isEqualTo("my document file.pdf");
    }

    @Test
    void shouldHandleFileNameWithSpecialCharacters() {
        testAttachment.setFileName("report_2024-01#1.pdf");
        assertThat(testAttachment.getFileName()).isEqualTo("report_2024-01#1.pdf");
    }

    @Test
    void shouldHandleFileNameWithUnicode() {
        testAttachment.setFileName("تقرير.pdf");
        assertThat(testAttachment.getFileName()).isEqualTo("تقرير.pdf");
    }

    @Test
    void shouldHandleLongFileName() {
        String longName = "a".repeat(200) + ".pdf";
        testAttachment.setFileName(longName);
        assertThat(testAttachment.getFileName()).hasSize(204);
    }

    @Test
    void shouldHandleNullFileName() {
        testAttachment.setFileName(null);
        assertThat(testAttachment.getFileName()).isNull();
    }

    // ========== Entity Metadata Tests ==========

    @Test
    void shouldHaveDefaultDeleteFlag() {
        FileAttachment newAttachment = new FileAttachment();
        assertThat(newAttachment.getDeleteFlag()).isFalse();
    }

    @Test
    void shouldHaveDefaultVersionNumber() {
        FileAttachment newAttachment = new FileAttachment();
        assertThat(newAttachment.getVersionNumber()).isEqualTo(1);
    }

    @Test
    void shouldHaveDefaultCreatedBy() {
        FileAttachment newAttachment = new FileAttachment();
        assertThat(newAttachment.getCreatedBy()).isEqualTo(0);
    }

    @Test
    void shouldSetCreatedDate() {
        LocalDateTime now = LocalDateTime.now();
        testAttachment.setCreatedDate(now);
        assertThat(testAttachment.getCreatedDate()).isEqualTo(now);
    }

    @Test
    void shouldSetLastUpdateDate() {
        LocalDateTime now = LocalDateTime.now();
        testAttachment.setLastUpdateDate(now);
        assertThat(testAttachment.getLastUpdateDate()).isEqualTo(now);
    }

    @Test
    void shouldSetOrderSequence() {
        testAttachment.setOrderSequence(5);
        assertThat(testAttachment.getOrderSequence()).isEqualTo(5);
    }

    // ========== ID Tests ==========

    @Test
    void shouldSetId() {
        testAttachment.setId(999);
        assertThat(testAttachment.getId()).isEqualTo(999);
    }

    @Test
    void shouldHandleNullId() {
        testAttachment.setId(null);
        assertThat(testAttachment.getId()).isNull();
    }

    // ========== Edge Cases ==========

    @Test
    void shouldHandleZeroLengthFileName() {
        testAttachment.setFileName("");
        assertThat(testAttachment.getFileName()).isEmpty();
    }

    @Test
    void shouldHandleZeroLengthFileType() {
        testAttachment.setFileType("");
        assertThat(testAttachment.getFileType()).isEmpty();
    }

    @Test
    void shouldHandleFileWithNoExtension() {
        testAttachment.setFileName("README");
        assertThat(testAttachment.getFileName()).isEqualTo("README");
    }

    @Test
    void shouldHandleHiddenFile() {
        testAttachment.setFileName(".gitignore");
        assertThat(testAttachment.getFileName()).startsWith(".");
    }
}
