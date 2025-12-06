package com.simpleaccounts.utils;

import com.simpleaccounts.constant.FileTypeEnum;
import com.simpleaccounts.rest.migrationcontroller.DataMigrationRespModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMultipart;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;

@DisplayName("FileHelper Tests")
class FileHelperTest {

    private FileHelper fileHelper;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        fileHelper = new FileHelper();
        ReflectionTestUtils.setField(fileHelper, "basePath", "resources/migrationuploadedfiles/");
        FileHelper.setRootPath(tempDir.toString() + File.separator);
    }

    @Test
    @DisplayName("Should read file content successfully")
    void testReadFile_Success() throws IOException {
        // Given
        String content = "Hello World\nLine 2\nLine 3";
        Path testFile = tempDir.resolve("test.txt");
        Files.write(testFile, content.getBytes(StandardCharsets.UTF_8));

        // When
        String result = fileHelper.readFile(testFile.toString());

        // Then
        assertThat(result).isEqualTo("Hello World\nLine 2\nLine 3\n");
    }

    @Test
    @DisplayName("Should read empty file")
    void testReadFile_EmptyFile() throws IOException {
        // Given
        Path testFile = tempDir.resolve("empty.txt");
        Files.createFile(testFile);

        // When
        String result = fileHelper.readFile(testFile.toString());

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should throw IOException for non-existent file")
    void testReadFile_FileNotFound() {
        // Given
        String nonExistentFile = tempDir.resolve("nonexistent.txt").toString();

        // When & Then
        assertThatThrownBy(() -> fileHelper.readFile(nonExistentFile))
            .isInstanceOf(FileNotFoundException.class);
    }

    @Test
    @DisplayName("Should read file attachment as ByteArrayInputStream")
    void testReadFileAttachment_Success() throws IOException {
        // Given
        String content = "Attachment Content";
        Path testFile = tempDir.resolve("attachment.txt");
        Files.write(testFile, content.getBytes(StandardCharsets.UTF_8));

        // When
        ByteArrayInputStream result = fileHelper.readFileAttachment(testFile.toString());

        // Then
        assertThat(result).isNotNull();
        String readContent = new String(result.readAllBytes(), StandardCharsets.UTF_8);
        assertThat(readContent).isEqualTo("Attachment Content\n");
    }

    @Test
    @DisplayName("Should create folder if it does not exist")
    void testCreateFolderIfNotExist_CreatesFolder() {
        // Given
        String folderPath = tempDir.resolve("newfolder").toString();

        // When
        fileHelper.createFolderIfNotExist(folderPath);

        // Then
        assertThat(new File(folderPath)).exists();
        assertThat(new File(folderPath)).isDirectory();
    }

    @Test
    @DisplayName("Should not fail if folder already exists")
    void testCreateFolderIfNotExist_FolderExists() throws IOException {
        // Given
        Path existingFolder = tempDir.resolve("existingfolder");
        Files.createDirectory(existingFolder);

        // When
        fileHelper.createFolderIfNotExist(existingFolder.toString());

        // Then
        assertThat(existingFolder.toFile()).exists();
        assertThat(existingFolder.toFile()).isDirectory();
    }

    @Test
    @DisplayName("Should generate filename for EXPENSE file type")
    void testGetFileName_ExpenseType() {
        // Given
        MockMultipartFile file = new MockMultipartFile(
            "file", "test.pdf", "application/pdf", "content".getBytes()
        );

        // When
        Map<String, String> result = fileHelper.getFileName(file, FileTypeEnum.EXPENSE);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        Map.Entry<String, String> entry = result.entrySet().iterator().next();
        assertThat(entry.getValue()).contains("ex-").endsWith(".pdf");
    }

    @Test
    @DisplayName("Should generate filename for CUSTOMER_INVOICE file type")
    void testGetFileName_CustomerInvoiceType() {
        // Given
        MockMultipartFile file = new MockMultipartFile(
            "file", "invoice.jpg", "image/jpeg", "content".getBytes()
        );

        // When
        Map<String, String> result = fileHelper.getFileName(file, FileTypeEnum.CUSTOMER_INVOICE);

        // Then
        assertThat(result).isNotNull();
        Map.Entry<String, String> entry = result.entrySet().iterator().next();
        assertThat(entry.getValue()).contains("ci-").endsWith(".jpg");
    }

    @Test
    @DisplayName("Should generate filename for SUPPLIER_INVOICE file type")
    void testGetFileName_SupplierInvoiceType() {
        // Given
        MockMultipartFile file = new MockMultipartFile(
            "file", "supplier.png", "image/png", "content".getBytes()
        );

        // When
        Map<String, String> result = fileHelper.getFileName(file, FileTypeEnum.SUPPLIER_INVOICE);

        // Then
        assertThat(result).isNotNull();
        Map.Entry<String, String> entry = result.entrySet().iterator().next();
        assertThat(entry.getValue()).contains("si-").endsWith(".png");
    }

    @Test
    @DisplayName("Should generate filename for TRANSACTION file type")
    void testGetFileName_TransactionType() {
        // Given
        MockMultipartFile file = new MockMultipartFile(
            "file", "transaction.doc", "application/msword", "content".getBytes()
        );

        // When
        Map<String, String> result = fileHelper.getFileName(file, FileTypeEnum.TRANSATION);

        // Then
        assertThat(result).isNotNull();
        Map.Entry<String, String> entry = result.entrySet().iterator().next();
        assertThat(entry.getValue()).contains("tr-").endsWith(".doc");
    }

    @Test
    @DisplayName("Should generate filename for RECEIPT file type")
    void testGetFileName_ReceiptType() {
        // Given
        MockMultipartFile file = new MockMultipartFile(
            "file", "receipt.txt", "text/plain", "content".getBytes()
        );

        // When
        Map<String, String> result = fileHelper.getFileName(file, FileTypeEnum.RECEIPT);

        // Then
        assertThat(result).isNotNull();
        Map.Entry<String, String> entry = result.entrySet().iterator().next();
        assertThat(entry.getValue()).contains("re-").endsWith(".txt");
    }

    @Test
    @DisplayName("Should generate filename for PURCHASE_ORDER file type")
    void testGetFileName_PurchaseOrderType() {
        // Given
        MockMultipartFile file = new MockMultipartFile(
            "file", "po.xlsx", "application/vnd.ms-excel", "content".getBytes()
        );

        // When
        Map<String, String> result = fileHelper.getFileName(file, FileTypeEnum.PURCHASE_ORDER);

        // Then
        assertThat(result).isNotNull();
        Map.Entry<String, String> entry = result.entrySet().iterator().next();
        assertThat(entry.getValue()).contains("po-").endsWith(".xlsx");
    }

    @Test
    @DisplayName("Should return null when multipart file has no original filename")
    void testGetFileName_NullFilename() {
        // Given
        MockMultipartFile file = new MockMultipartFile(
            "file", null, "text/plain", "content".getBytes()
        );

        // When
        Map<String, String> result = fileHelper.getFileName(file, FileTypeEnum.EXPENSE);

        // Then
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should extract file extension correctly")
    void testGetFileExtension_ValidFileName() {
        // When
        String result = fileHelper.getFileExtension("document.pdf");

        // Then
        assertThat(result).isEqualTo("pdf");
    }

    @Test
    @DisplayName("Should extract extension from file with multiple dots")
    void testGetFileExtension_MultipleDotsInFileName() {
        // When
        String result = fileHelper.getFileExtension("my.document.test.txt");

        // Then
        assertThat(result).isEqualTo("txt");
    }

    @Test
    @DisplayName("Should return null for null filename")
    void testGetFileExtension_NullFileName() {
        // When
        String result = fileHelper.getFileExtension(null);

        // Then
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return null for empty filename")
    void testGetFileExtension_EmptyFileName() {
        // When
        String result = fileHelper.getFileExtension("");

        // Then
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should convert Windows file path to URL format")
    void testConvertFilePthToUrl_WindowsPath() {
        // Given
        String windowsPath = "C:\\Users\\test\\file.txt";

        // When
        String result = fileHelper.convertFilePthToUrl(windowsPath);

        // Then
        assertThat(result).isEqualTo("C:/Users/test/file.txt");
    }

    @Test
    @DisplayName("Should keep Unix file path unchanged")
    void testConvertFilePthToUrl_UnixPath() {
        // Given
        String unixPath = "/home/user/file.txt";

        // When
        String result = fileHelper.convertFilePthToUrl(unixPath);

        // Then
        assertThat(result).isEqualTo("/home/user/file.txt");
    }

    @Test
    @DisplayName("Should write file and return InputStream")
    void testWriteFile_Success() throws IOException {
        // Given
        String data = "Test data to write";
        String fileName = tempDir.resolve("output.txt").toString();

        // When
        InputStream result = fileHelper.writeFile(data, fileName);

        // Then
        assertThat(result).isNotNull();
        String writtenContent = new String(result.readAllBytes(), StandardCharsets.UTF_8);
        assertThat(writtenContent).isEqualTo(data);

        // Verify file was created
        assertThat(new File(fileName)).exists();
    }

    @Test
    @DisplayName("Should save empty list when no files provided")
    void testSaveMultiFile_NoFiles() {
        // Given
        String folderPath = tempDir.resolve("uploads").toString();
        MultipartFile[] files = null;

        // When
        List<DataMigrationRespModel> result = fileHelper.saveMultiFile(folderPath, files);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should save empty list when empty files array provided")
    void testSaveMultiFile_EmptyArray() {
        // Given
        String folderPath = tempDir.resolve("uploads").toString();
        MultipartFile[] files = new MultipartFile[0];

        // When
        List<DataMigrationRespModel> result = fileHelper.saveMultiFile(folderPath, files);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should save multiple files successfully")
    void testSaveMultiFile_Success() throws IOException {
        // Given
        String folderPath = tempDir.resolve("uploads").toString();
        MockMultipartFile file1 = new MockMultipartFile(
            "file1", "test1.csv", "text/csv", "line1\nline2\nline3".getBytes()
        );
        MockMultipartFile file2 = new MockMultipartFile(
            "file2", "test2.csv", "text/csv", "col1,col2\nval1,val2".getBytes()
        );
        MultipartFile[] files = {file1, file2};

        // When
        List<DataMigrationRespModel> result = fileHelper.saveMultiFile(folderPath, files);

        // Then
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getFileName()).isEqualTo("test1.csv");
        assertThat(result.get(0).getRecordCount()).isEqualTo(2); // 3 lines - 1 header
        assertThat(result.get(1).getFileName()).isEqualTo("test2.csv");
        assertThat(result.get(1).getRecordCount()).isEqualTo(1); // 2 lines - 1 header
    }

    @Test
    @DisplayName("Should remove trailing slash from folder path")
    void testSaveMultiFile_RemovesTrailingSlash() throws IOException {
        // Given
        String folderPath = tempDir.resolve("uploads").toString() + "/";
        MockMultipartFile file = new MockMultipartFile(
            "file", "test.csv", "text/csv", "header\ndata".getBytes()
        );
        MultipartFile[] files = {file};

        // When
        List<DataMigrationRespModel> result = fileHelper.saveMultiFile(folderPath, files);

        // Then
        assertThat(result).hasSize(1);
        assertThat(new File(folderPath.substring(0, folderPath.length() - 1))).exists();
    }

    @Test
    @DisplayName("Should handle file with only header line")
    void testSaveMultiFile_HeaderOnlyFile() throws IOException {
        // Given
        String folderPath = tempDir.resolve("uploads").toString();
        MockMultipartFile file = new MockMultipartFile(
            "file", "header-only.csv", "text/csv", "header1,header2,header3".getBytes()
        );
        MultipartFile[] files = {file};

        // When
        List<DataMigrationRespModel> result = fileHelper.saveMultiFile(folderPath, files);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getRecordCount()).isEqualTo(0); // 1 line - 1 header
    }

    @Test
    @DisplayName("Should set records migrated to zero initially")
    void testSaveMultiFile_InitializesRecordsMigrated() throws IOException {
        // Given
        String folderPath = tempDir.resolve("uploads").toString();
        MockMultipartFile file = new MockMultipartFile(
            "file", "test.csv", "text/csv", "header\ndata1\ndata2".getBytes()
        );
        MultipartFile[] files = {file};

        // When
        List<DataMigrationRespModel> result = fileHelper.saveMultiFile(folderPath, files);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getRecordsMigrated()).isEqualTo(0L);
    }

    @Test
    @DisplayName("Should preserve file extension when saving")
    void testSaveFile_PreservesExtension() throws IOException {
        // Given
        MockMultipartFile file = new MockMultipartFile(
            "file", "document.xlsx", "application/vnd.ms-excel",
            "Excel content".getBytes()
        );

        // When
        Map<String, String> fileNameMap = fileHelper.getFileName(file, FileTypeEnum.EXPENSE);

        // Then
        assertThat(fileNameMap).isNotNull();
        Map.Entry<String, String> entry = fileNameMap.entrySet().iterator().next();
        assertThat(entry.getValue()).endsWith(".xlsx");
    }

    @Test
    @DisplayName("Should include date folder in file path")
    void testGetFileName_IncludesDateFolder() {
        // Given
        MockMultipartFile file = new MockMultipartFile(
            "file", "test.pdf", "application/pdf", "content".getBytes()
        );

        // When
        Map<String, String> result = fileHelper.getFileName(file, FileTypeEnum.EXPENSE);

        // Then
        assertThat(result).isNotNull();
        Map.Entry<String, String> entry = result.entrySet().iterator().next();
        assertThat(entry.getKey()).matches("\\d{8}" + File.separator);
        assertThat(entry.getValue()).startsWith(entry.getKey());
    }
}
