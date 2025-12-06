package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.FileAttachmentDao;
import com.simpleaccounts.entity.FileAttachment;
import com.simpleaccounts.exceptions.ServiceException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class FileAttachmentServiceImplTest {

    @Mock
    private FileAttachmentDao fileAttachmentDao;

    @InjectMocks
    private FileAttachmentServiceImpl fileAttachmentService;

    private FileAttachment testFileAttachment;

    @BeforeEach
    void setUp() {
        testFileAttachment = new FileAttachment();
        testFileAttachment.setFileAttachmentId(1);
        testFileAttachment.setFileName("test-invoice.pdf");
        testFileAttachment.setFileType("application/pdf");
        testFileAttachment.setFileData(new byte[]{1, 2, 3, 4, 5});
        testFileAttachment.setCreatedDate(LocalDateTime.now());
        testFileAttachment.setDeleteFlag(false);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnFileAttachmentDaoWhenGetDaoCalled() {
        assertThat(fileAttachmentService.getDao()).isEqualTo(fileAttachmentDao);
    }

    @Test
    void shouldReturnNonNullDaoInstance() {
        assertThat(fileAttachmentService.getDao()).isNotNull();
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldFindFileAttachmentByPrimaryKey() {
        when(fileAttachmentDao.findByPK(1)).thenReturn(testFileAttachment);

        FileAttachment result = fileAttachmentService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testFileAttachment);
        assertThat(result.getFileAttachmentId()).isEqualTo(1);
        assertThat(result.getFileName()).isEqualTo("test-invoice.pdf");
        verify(fileAttachmentDao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenFileAttachmentNotFoundByPK() {
        when(fileAttachmentDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> fileAttachmentService.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(fileAttachmentDao, times(1)).findByPK(999);
    }

    @Test
    void shouldFindFileAttachmentWithAllFieldsPopulated() {
        testFileAttachment.setFileSize(1024L);
        testFileAttachment.setCreatedBy(5);
        testFileAttachment.setLastUpdateDate(LocalDateTime.now());

        when(fileAttachmentDao.findByPK(1)).thenReturn(testFileAttachment);

        FileAttachment result = fileAttachmentService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getFileSize()).isEqualTo(1024L);
        assertThat(result.getCreatedBy()).isEqualTo(5);
        assertThat(result.getLastUpdateDate()).isNotNull();
        verify(fileAttachmentDao, times(1)).findByPK(1);
    }

    @Test
    void shouldPersistNewFileAttachment() {
        fileAttachmentService.persist(testFileAttachment);

        verify(fileAttachmentDao, times(1)).persist(testFileAttachment);
    }

    @Test
    void shouldPersistFileAttachmentWithPrimaryKey() {
        when(fileAttachmentDao.findByPK(1)).thenReturn(null);

        fileAttachmentService.persist(testFileAttachment, 1);

        verify(fileAttachmentDao, times(1)).findByPK(1);
        verify(fileAttachmentDao, times(1)).persist(testFileAttachment);
    }

    @Test
    void shouldThrowExceptionWhenPersistingDuplicateFileAttachment() {
        when(fileAttachmentDao.findByPK(1)).thenReturn(testFileAttachment);

        assertThatThrownBy(() -> fileAttachmentService.persist(testFileAttachment, 1))
                .isInstanceOf(ServiceException.class);

        verify(fileAttachmentDao, times(1)).findByPK(1);
        verify(fileAttachmentDao, never()).persist(any());
    }

    @Test
    void shouldUpdateExistingFileAttachment() {
        when(fileAttachmentDao.update(testFileAttachment)).thenReturn(testFileAttachment);

        FileAttachment result = fileAttachmentService.update(testFileAttachment);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testFileAttachment);
        verify(fileAttachmentDao, times(1)).update(testFileAttachment);
    }

    @Test
    void shouldUpdateFileAttachmentAndReturnUpdatedEntity() {
        testFileAttachment.setFileName("updated-invoice.pdf");
        testFileAttachment.setFileType("application/pdf");
        when(fileAttachmentDao.update(testFileAttachment)).thenReturn(testFileAttachment);

        FileAttachment result = fileAttachmentService.update(testFileAttachment);

        assertThat(result).isNotNull();
        assertThat(result.getFileName()).isEqualTo("updated-invoice.pdf");
        verify(fileAttachmentDao, times(1)).update(testFileAttachment);
    }

    @Test
    void shouldUpdateFileAttachmentWithPrimaryKey() {
        when(fileAttachmentDao.update(testFileAttachment)).thenReturn(testFileAttachment);

        FileAttachment result = fileAttachmentService.update(testFileAttachment, 1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testFileAttachment);
        verify(fileAttachmentDao, times(1)).update(testFileAttachment);
    }

    @Test
    void shouldDeleteFileAttachment() {
        fileAttachmentService.delete(testFileAttachment);

        verify(fileAttachmentDao, times(1)).delete(testFileAttachment);
    }

    @Test
    void shouldDeleteFileAttachmentWithPrimaryKey() {
        when(fileAttachmentDao.findByPK(1)).thenReturn(testFileAttachment);

        fileAttachmentService.delete(testFileAttachment, 1);

        verify(fileAttachmentDao, times(1)).findByPK(1);
        verify(fileAttachmentDao, times(1)).delete(testFileAttachment);
    }

    @Test
    void shouldThrowExceptionWhenDeletingNonExistentFileAttachment() {
        when(fileAttachmentDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> fileAttachmentService.delete(testFileAttachment, 999))
                .isInstanceOf(ServiceException.class);

        verify(fileAttachmentDao, times(1)).findByPK(999);
        verify(fileAttachmentDao, never()).delete(any());
    }

    // ========== findByAttributes Tests ==========

    @Test
    void shouldFindFileAttachmentsByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("fileType", "application/pdf");
        attributes.put("deleteFlag", false);

        List<FileAttachment> expectedList = Arrays.asList(testFileAttachment);
        when(fileAttachmentDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<FileAttachment> result = fileAttachmentService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testFileAttachment);
        verify(fileAttachmentDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("fileName", "non-existent.pdf");

        when(fileAttachmentDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<FileAttachment> result = fileAttachmentService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(fileAttachmentDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<FileAttachment> result = fileAttachmentService.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(fileAttachmentDao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<FileAttachment> result = fileAttachmentService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(fileAttachmentDao, never()).findByAttributes(any());
    }

    @Test
    void shouldFindMultipleFileAttachmentsByAttributes() {
        FileAttachment attachment2 = new FileAttachment();
        attachment2.setFileAttachmentId(2);
        attachment2.setFileName("invoice-2.pdf");
        attachment2.setFileType("application/pdf");

        FileAttachment attachment3 = new FileAttachment();
        attachment3.setFileAttachmentId(3);
        attachment3.setFileName("invoice-3.pdf");
        attachment3.setFileType("application/pdf");

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("fileType", "application/pdf");

        List<FileAttachment> expectedList = Arrays.asList(testFileAttachment, attachment2, attachment3);
        when(fileAttachmentDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<FileAttachment> result = fileAttachmentService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(testFileAttachment, attachment2, attachment3);
        verify(fileAttachmentDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldFindFileAttachmentsByFileName() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("fileName", "test-invoice.pdf");

        when(fileAttachmentDao.findByAttributes(attributes)).thenReturn(Arrays.asList(testFileAttachment));

        List<FileAttachment> result = fileAttachmentService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getFileName()).isEqualTo("test-invoice.pdf");
        verify(fileAttachmentDao, times(1)).findByAttributes(attributes);
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleFileAttachmentWithMinimalData() {
        FileAttachment minimalAttachment = new FileAttachment();
        minimalAttachment.setFileAttachmentId(99);

        when(fileAttachmentDao.findByPK(99)).thenReturn(minimalAttachment);

        FileAttachment result = fileAttachmentService.findByPK(99);

        assertThat(result).isNotNull();
        assertThat(result.getFileAttachmentId()).isEqualTo(99);
        assertThat(result.getFileName()).isNull();
        assertThat(result.getFileType()).isNull();
        verify(fileAttachmentDao, times(1)).findByPK(99);
    }

    @Test
    void shouldHandleMultiplePersistOperations() {
        FileAttachment attachment1 = new FileAttachment();
        FileAttachment attachment2 = new FileAttachment();
        FileAttachment attachment3 = new FileAttachment();

        fileAttachmentService.persist(attachment1);
        fileAttachmentService.persist(attachment2);
        fileAttachmentService.persist(attachment3);

        verify(fileAttachmentDao, times(3)).persist(any(FileAttachment.class));
    }

    @Test
    void shouldHandleMultipleUpdateOperations() {
        when(fileAttachmentDao.update(any(FileAttachment.class))).thenReturn(testFileAttachment);

        fileAttachmentService.update(testFileAttachment);
        fileAttachmentService.update(testFileAttachment);
        fileAttachmentService.update(testFileAttachment);

        verify(fileAttachmentDao, times(3)).update(testFileAttachment);
    }

    @Test
    void shouldVerifyDaoInteractionForFindByPK() {
        when(fileAttachmentDao.findByPK(1)).thenReturn(testFileAttachment);

        fileAttachmentService.findByPK(1);
        fileAttachmentService.findByPK(1);

        verify(fileAttachmentDao, times(2)).findByPK(1);
    }

    @Test
    void shouldHandleNullFileAttachmentInUpdate() {
        FileAttachment nullAttachment = new FileAttachment();
        when(fileAttachmentDao.update(any(FileAttachment.class))).thenReturn(nullAttachment);

        FileAttachment result = fileAttachmentService.update(nullAttachment);

        assertThat(result).isNotNull();
        verify(fileAttachmentDao, times(1)).update(nullAttachment);
    }

    @Test
    void shouldHandleComplexAttributeSearch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("fileName", "test-invoice.pdf");
        attributes.put("fileType", "application/pdf");
        attributes.put("deleteFlag", false);

        when(fileAttachmentDao.findByAttributes(attributes)).thenReturn(Arrays.asList(testFileAttachment));

        List<FileAttachment> result = fileAttachmentService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(fileAttachmentDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleFileAttachmentWithEmptyData() {
        FileAttachment emptyDataAttachment = new FileAttachment();
        emptyDataAttachment.setFileAttachmentId(2);
        emptyDataAttachment.setFileName("empty.txt");
        emptyDataAttachment.setFileData(new byte[0]);

        when(fileAttachmentDao.findByPK(2)).thenReturn(emptyDataAttachment);

        FileAttachment result = fileAttachmentService.findByPK(2);

        assertThat(result).isNotNull();
        assertThat(result.getFileData()).isEmpty();
        verify(fileAttachmentDao, times(1)).findByPK(2);
    }

    @Test
    void shouldHandleFileAttachmentWithLargeData() {
        byte[] largeData = new byte[1024 * 1024]; // 1 MB
        FileAttachment largeAttachment = new FileAttachment();
        largeAttachment.setFileAttachmentId(3);
        largeAttachment.setFileName("large-file.pdf");
        largeAttachment.setFileData(largeData);
        largeAttachment.setFileSize(1024L * 1024L);

        when(fileAttachmentDao.update(largeAttachment)).thenReturn(largeAttachment);

        FileAttachment result = fileAttachmentService.update(largeAttachment);

        assertThat(result).isNotNull();
        assertThat(result.getFileData()).hasSize(1024 * 1024);
        assertThat(result.getFileSize()).isEqualTo(1024L * 1024L);
        verify(fileAttachmentDao, times(1)).update(largeAttachment);
    }

    @Test
    void shouldHandleFileAttachmentWithDifferentFileTypes() {
        FileAttachment pdfAttachment = new FileAttachment();
        pdfAttachment.setFileType("application/pdf");

        FileAttachment imageAttachment = new FileAttachment();
        imageAttachment.setFileType("image/png");

        FileAttachment docAttachment = new FileAttachment();
        docAttachment.setFileType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");

        fileAttachmentService.persist(pdfAttachment);
        fileAttachmentService.persist(imageAttachment);
        fileAttachmentService.persist(docAttachment);

        verify(fileAttachmentDao, times(3)).persist(any(FileAttachment.class));
    }

    @Test
    void shouldHandleFileAttachmentWithSpecialCharactersInFileName() {
        testFileAttachment.setFileName("test-file-@#$%&().pdf");

        when(fileAttachmentDao.update(testFileAttachment)).thenReturn(testFileAttachment);

        FileAttachment result = fileAttachmentService.update(testFileAttachment);

        assertThat(result).isNotNull();
        assertThat(result.getFileName()).isEqualTo("test-file-@#$%&().pdf");
        verify(fileAttachmentDao, times(1)).update(testFileAttachment);
    }

    @Test
    void shouldHandleFileAttachmentWithLongFileName() {
        String longFileName = "a".repeat(255) + ".pdf";
        testFileAttachment.setFileName(longFileName);

        when(fileAttachmentDao.persist(testFileAttachment)).thenReturn(testFileAttachment);

        fileAttachmentService.persist(testFileAttachment);

        assertThat(testFileAttachment.getFileName()).hasSize(259);
        verify(fileAttachmentDao, times(1)).persist(testFileAttachment);
    }

    @Test
    void shouldHandleFileAttachmentWithDeleteFlag() {
        testFileAttachment.setDeleteFlag(true);

        when(fileAttachmentDao.update(testFileAttachment)).thenReturn(testFileAttachment);

        FileAttachment result = fileAttachmentService.update(testFileAttachment);

        assertThat(result).isNotNull();
        assertThat(result.getDeleteFlag()).isTrue();
        verify(fileAttachmentDao, times(1)).update(testFileAttachment);
    }

    @Test
    void shouldHandleMultipleFileAttachmentRecords() {
        List<FileAttachment> attachments = new ArrayList<>();
        for (int i = 1; i <= 20; i++) {
            FileAttachment attachment = new FileAttachment();
            attachment.setFileAttachmentId(i);
            attachment.setFileName("file-" + i + ".pdf");
            attachments.add(attachment);
        }

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("deleteFlag", false);

        when(fileAttachmentDao.findByAttributes(attributes)).thenReturn(attachments);

        List<FileAttachment> result = fileAttachmentService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(20);
        verify(fileAttachmentDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleSearchByFileSize() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("fileSize", 1024L);

        testFileAttachment.setFileSize(1024L);
        when(fileAttachmentDao.findByAttributes(attributes)).thenReturn(Arrays.asList(testFileAttachment));

        List<FileAttachment> result = fileAttachmentService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getFileSize()).isEqualTo(1024L);
        verify(fileAttachmentDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleFileAttachmentWithNullFileData() {
        FileAttachment nullDataAttachment = new FileAttachment();
        nullDataAttachment.setFileAttachmentId(4);
        nullDataAttachment.setFileName("null-data.txt");
        nullDataAttachment.setFileData(null);

        when(fileAttachmentDao.findByPK(4)).thenReturn(nullDataAttachment);

        FileAttachment result = fileAttachmentService.findByPK(4);

        assertThat(result).isNotNull();
        assertThat(result.getFileData()).isNull();
        verify(fileAttachmentDao, times(1)).findByPK(4);
    }

    @Test
    void shouldHandleFileAttachmentWithTimestamps() {
        LocalDateTime createdDate = LocalDateTime.of(2024, 1, 1, 10, 0, 0);
        LocalDateTime updatedDate = LocalDateTime.of(2024, 6, 15, 14, 30, 0);

        testFileAttachment.setCreatedDate(createdDate);
        testFileAttachment.setLastUpdateDate(updatedDate);

        when(fileAttachmentDao.findByPK(1)).thenReturn(testFileAttachment);

        FileAttachment result = fileAttachmentService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getCreatedDate()).isEqualTo(createdDate);
        assertThat(result.getLastUpdateDate()).isEqualTo(updatedDate);
        verify(fileAttachmentDao, times(1)).findByPK(1);
    }

    @Test
    void shouldHandleSearchByMultipleFileTypes() {
        FileAttachment pdfFile = new FileAttachment();
        pdfFile.setFileAttachmentId(1);
        pdfFile.setFileType("application/pdf");

        FileAttachment imageFile = new FileAttachment();
        imageFile.setFileAttachmentId(2);
        imageFile.setFileType("image/jpeg");

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("deleteFlag", false);

        when(fileAttachmentDao.findByAttributes(attributes)).thenReturn(Arrays.asList(pdfFile, imageFile));

        List<FileAttachment> result = fileAttachmentService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getFileType()).isEqualTo("application/pdf");
        assertThat(result.get(1).getFileType()).isEqualTo("image/jpeg");
        verify(fileAttachmentDao, times(1)).findByAttributes(attributes);
    }
}
