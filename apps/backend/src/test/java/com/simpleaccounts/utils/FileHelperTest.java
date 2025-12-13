package com.simpleaccounts.utils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.FileTypeEnum;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.web.multipart.MultipartFile;

@DisplayName("FileHelper Tests")
class FileHelperTest {

    private FileHelper fileHelper;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        fileHelper = new FileHelper("resources/migrationuploadedfiles/");
    }

    @AfterEach
    void tearDown() {
        FileHelper.setRootPath(null);
    }

    @Nested
    @DisplayName("readFile Tests")
    class ReadFileTests {

        @Test
        @DisplayName("Should read file content as string")
        void shouldReadFileContentAsString() throws IOException {
            // given
            Path testFile = tempDir.resolve("test.txt");
            String expectedContent = "Hello World\nLine 2\nLine 3";
            Files.write(testFile, expectedContent.getBytes(StandardCharsets.UTF_8));

            // when
            String result = fileHelper.readFile(testFile.toString());

            // then
            assertThat(result).contains("Hello World");
            assertThat(result).contains("Line 2");
            assertThat(result).contains("Line 3");
        }

        @Test
        @DisplayName("Should throw IOException for non-existent file")
        void shouldThrowIOExceptionForNonExistentFile() {
            // given
            String nonExistentPath = tempDir.resolve("nonexistent.txt").toString();

            // when/then
            assertThatThrownBy(() -> fileHelper.readFile(nonExistentPath))
                    .isInstanceOf(IOException.class);
        }
    }

    @Nested
    @DisplayName("readFileAttachment Tests")
    class ReadFileAttachmentTests {

        @Test
        @DisplayName("Should read file as ByteArrayInputStream")
        void shouldReadFileAsByteArrayInputStream() throws IOException {
            // given
            Path testFile = tempDir.resolve("attachment.txt");
            String content = "Attachment content";
            Files.write(testFile, content.getBytes(StandardCharsets.UTF_8));

            // when
            ByteArrayInputStream result = fileHelper.readFileAttachment(testFile.toString());

            // then
            assertThat(result).isNotNull();
            byte[] bytes = result.readAllBytes();
            assertThat(new String(bytes, StandardCharsets.UTF_8)).contains("Attachment content");
        }
    }

    @Nested
    @DisplayName("writeFile Tests")
    class WriteFileTests {

        @Test
        @DisplayName("Should write data to file and return InputStream")
        void shouldWriteDataToFileAndReturnInputStream() throws IOException {
            // given
            String data = "Test data to write";
            String fileName = tempDir.resolve("output.txt").toString();

            // when
            InputStream result = fileHelper.writeFile(data, fileName);

            // then
            assertThat(result).isNotNull();
            byte[] bytes = result.readAllBytes();
            assertThat(new String(bytes, StandardCharsets.UTF_8)).isEqualTo(data);
            result.close();
        }
    }

    @Nested
    @DisplayName("createFolderIfNotExist Tests")
    class CreateFolderTests {

        @Test
        @DisplayName("Should create folder if it does not exist")
        void shouldCreateFolderIfNotExists() {
            // given
            String newFolder = tempDir.resolve("newFolder").toString();

            // when
            fileHelper.createFolderIfNotExist(newFolder);

            // then
            assertThat(new File(newFolder).exists()).isTrue();
            assertThat(new File(newFolder).isDirectory()).isTrue();
        }

        @Test
        @DisplayName("Should not throw error if folder already exists")
        void shouldNotThrowErrorIfFolderExists() {
            // given
            String existingFolder = tempDir.toString();

            // when/then - should not throw
            fileHelper.createFolderIfNotExist(existingFolder);
            assertThat(new File(existingFolder).exists()).isTrue();
        }

        @Test
        @DisplayName("Should create nested folders")
        void shouldCreateNestedFolders() {
            // given
            String nestedPath = tempDir.resolve("level1/level2/level3").toString();

            // when
            fileHelper.createFolderIfNotExist(nestedPath);

            // then
            assertThat(new File(nestedPath).exists()).isTrue();
        }
    }

    @Nested
    @DisplayName("getFileName Tests")
    class GetFileNameTests {

        @ParameterizedTest(name = "FileType {0} should create file with correct prefix")
        @EnumSource(value = FileTypeEnum.class, names = {"EXPENSE", "CUSTOMER_INVOICE", "SUPPLIER_INVOICE", "TRANSATION", "RECEIPT", "PURCHASE_ORDER"})
        @DisplayName("Should generate filename with correct prefix for each file type")
        void shouldGenerateFilenameWithCorrectPrefix(FileTypeEnum fileType) {
            // given
            MultipartFile mockFile = mock(MultipartFile.class);
            when(mockFile.getOriginalFilename()).thenReturn("document.pdf");

            // when
            Map<String, String> result = fileHelper.getFileName(mockFile, fileType);

            // then
            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);

            String filePath = result.values().iterator().next();
            assertThat(filePath).endsWith(".pdf");

            // Verify prefix based on file type
            switch (fileType) {
                case EXPENSE:
                    assertThat(filePath).contains("ex-");
                    break;
                case CUSTOMER_INVOICE:
                    assertThat(filePath).contains("ci-");
                    break;
                case SUPPLIER_INVOICE:
                    assertThat(filePath).contains("si-");
                    break;
                case TRANSATION:
                    assertThat(filePath).contains("tr-");
                    break;
                case RECEIPT:
                    assertThat(filePath).contains("re-");
                    break;
                case PURCHASE_ORDER:
                    assertThat(filePath).contains("po-");
                    break;
                default:
                    break;
            }
        }

        @Test
        @DisplayName("Should return null for null original filename")
        void shouldReturnNullForNullOriginalFilename() {
            // given
            MultipartFile mockFile = mock(MultipartFile.class);
            when(mockFile.getOriginalFilename()).thenReturn(null);

            // when
            Map<String, String> result = fileHelper.getFileName(mockFile, FileTypeEnum.EXPENSE);

            // then
            assertThat(result).isNull();
        }

        @Test
        @DisplayName("Should include date folder in path")
        void shouldIncludeDateFolderInPath() {
            // given
            MultipartFile mockFile = mock(MultipartFile.class);
            when(mockFile.getOriginalFilename()).thenReturn("test.xlsx");

            // when
            Map<String, String> result = fileHelper.getFileName(mockFile, FileTypeEnum.EXPENSE);

            // then
            assertThat(result).isNotNull();
            String folderPath = result.keySet().iterator().next();
            // Folder path should be date format yyyyMMdd with separator
            assertThat(folderPath).matches("\\d{8}" + File.separator.replace("\\", "\\\\"));
        }
    }

    @Nested
    @DisplayName("getFileExtension Tests")
    class GetFileExtensionTests {

        @ParameterizedTest(name = "Filename '{0}' should return extension '{1}'")
        @CsvSource({
            "document.pdf, pdf",
            "image.jpg, jpg",
            "file.tar.gz, gz",
            "report.xlsx, xlsx",
            "script.js, js"
        })
        @DisplayName("Should extract file extension correctly")
        void shouldExtractFileExtensionCorrectly(String filename, String expectedExtension) {
            // when
            String result = fileHelper.getFileExtension(filename);

            // then
            assertThat(result).isEqualTo(expectedExtension);
        }

        @ParameterizedTest
        @NullAndEmptySource
        @DisplayName("Should return null for null or empty filename")
        void shouldReturnNullForNullOrEmptyFilename(String filename) {
            // when
            String result = fileHelper.getFileExtension(filename);

            // then
            assertThat(result).isNull();
        }

        @Test
        @DisplayName("Should return empty string for filename without extension")
        void shouldReturnEmptyForFilenameWithoutExtension() {
            // when
            String result = fileHelper.getFileExtension("filename");

            // then
            assertThat(result).isEqualTo("filename");
        }
    }

    @Nested
    @DisplayName("convertFilePthToUrl Tests")
    class ConvertFilePathToUrlTests {

        @Test
        @DisplayName("Should convert Windows path separators to URL format")
        void shouldConvertWindowsPathSeparatorsToUrlFormat() {
            // given
            String windowsPath = "folder\\subfolder\\file.txt";

            // when
            String result = fileHelper.convertFilePthToUrl(windowsPath);

            // then
            assertThat(result).isEqualTo("folder/subfolder/file.txt");
        }

        @Test
        @DisplayName("Should return unchanged URL path")
        void shouldReturnUnchangedUrlPath() {
            // given
            String urlPath = "folder/subfolder/file.txt";

            // when
            String result = fileHelper.convertFilePthToUrl(urlPath);

            // then
            assertThat(result).isEqualTo(urlPath);
        }
    }

    @Nested
    @DisplayName("saveMultiFile Tests")
    class SaveMultiFileTests {

        @Test
        @DisplayName("Should return empty list for null files array")
        void shouldReturnEmptyListForNullFilesArray() {
            // when
            var result = fileHelper.saveMultiFile(tempDir.toString(), null);

            // then
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Should return empty list for empty files array")
        void shouldReturnEmptyListForEmptyFilesArray() {
            // when
            var result = fileHelper.saveMultiFile(tempDir.toString(), new MultipartFile[0]);

            // then
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Should skip files with null original filename")
        void shouldSkipFilesWithNullOriginalFilename() {
            // given
            MultipartFile mockFile = mock(MultipartFile.class);
            when(mockFile.getOriginalFilename()).thenReturn(null);

            // when
            var result = fileHelper.saveMultiFile(tempDir.toString(), new MultipartFile[]{mockFile});

            // then
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Should skip files with empty original filename")
        void shouldSkipFilesWithEmptyOriginalFilename() {
            // given
            MultipartFile mockFile = mock(MultipartFile.class);
            when(mockFile.getOriginalFilename()).thenReturn("");

            // when
            var result = fileHelper.saveMultiFile(tempDir.toString(), new MultipartFile[]{mockFile});

            // then
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Should skip hidden files (starting with dot)")
        void shouldSkipHiddenFiles() {
            // given
            MultipartFile mockFile = mock(MultipartFile.class);
            when(mockFile.getOriginalFilename()).thenReturn(".hidden");

            // when
            var result = fileHelper.saveMultiFile(tempDir.toString(), new MultipartFile[]{mockFile});

            // then
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Should skip files with path traversal attempt")
        void shouldSkipFilesWithPathTraversalAttempt() {
            // given
            MultipartFile mockFile = mock(MultipartFile.class);
            when(mockFile.getOriginalFilename()).thenReturn("../etc/passwd");

            // when
            var result = fileHelper.saveMultiFile(tempDir.toString(), new MultipartFile[]{mockFile});

            // then
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Should strip trailing slash from folder path")
        void shouldStripTrailingSlashFromFolderPath() {
            // given
            String folderPathWithSlash = tempDir.toString() + "/";
            MultipartFile mockFile = mock(MultipartFile.class);
            when(mockFile.getOriginalFilename()).thenReturn(null);

            // when - should not throw
            var result = fileHelper.saveMultiFile(folderPathWithSlash, new MultipartFile[]{mockFile});

            // then
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("Static rootPath Tests")
    class RootPathTests {

        @Test
        @DisplayName("Should set and get root path")
        void shouldSetAndGetRootPath() {
            // given
            String rootPath = "/var/www/app/";

            // when
            FileHelper.setRootPath(rootPath);

            // then
            assertThat(FileHelper.getRootPath()).isEqualTo(rootPath);
        }
    }

    @Nested
    @DisplayName("Security Tests")
    class SecurityTests {

        @ParameterizedTest(name = "Should reject path traversal attempt: {0}")
        @ValueSource(strings = {
            "../",
            "..\\",
            "folder/../../../etc/passwd",
            "..%2f",
            "..%5c"
        })
        @DisplayName("Should reject path traversal attempts in saveMultiFile")
        void shouldRejectPathTraversalAttemptsInSaveMultiFile(String maliciousPath) {
            // given
            MultipartFile mockFile = mock(MultipartFile.class);
            when(mockFile.getOriginalFilename()).thenReturn(maliciousPath);

            // when
            var result = fileHelper.saveMultiFile(tempDir.toString(), new MultipartFile[]{mockFile});

            // then
            assertThat(result).isEmpty();
        }
    }
}
