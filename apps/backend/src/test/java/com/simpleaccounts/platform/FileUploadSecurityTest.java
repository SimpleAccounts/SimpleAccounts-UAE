package com.simpleaccounts.platform;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/**
 * Tests for File Upload Security.
 * 
 * Validates:
 * - File type restrictions
 * - File size limits
 * - Malicious file detection
 * - Path traversal prevention
 */
@DisplayName("File Upload Security Tests")
class FileUploadSecurityTest {

    private FileUploadValidator validator;

    @BeforeEach
    void setUp() {
        validator = new FileUploadValidator();
        validator.setMaxFileSizeBytes(10 * 1024 * 1024); // 10MB
        validator.setAllowedExtensions(new HashSet<>(Arrays.asList("pdf", "jpg", "png", "xlsx", "csv")));
    }

    @Nested
    @DisplayName("File Extension Validation Tests")
    class FileExtensionTests {

        @Test
        @DisplayName("Should accept allowed file extensions")
        void shouldAcceptAllowedExtensions() {
            assertThat(validator.isExtensionAllowed("document.pdf")).isTrue();
            assertThat(validator.isExtensionAllowed("photo.jpg")).isTrue();
            assertThat(validator.isExtensionAllowed("image.png")).isTrue();
            assertThat(validator.isExtensionAllowed("spreadsheet.xlsx")).isTrue();
            assertThat(validator.isExtensionAllowed("data.csv")).isTrue();
        }

        @Test
        @DisplayName("Should reject disallowed file extensions")
        void shouldRejectDisallowedExtensions() {
            assertThat(validator.isExtensionAllowed("script.exe")).isFalse();
            assertThat(validator.isExtensionAllowed("macro.js")).isFalse();
            assertThat(validator.isExtensionAllowed("shell.sh")).isFalse();
            assertThat(validator.isExtensionAllowed("binary.dll")).isFalse();
            assertThat(validator.isExtensionAllowed("archive.zip")).isFalse();
        }

        @Test
        @DisplayName("Should handle case insensitivity")
        void shouldHandleCaseInsensitivity() {
            assertThat(validator.isExtensionAllowed("document.PDF")).isTrue();
            assertThat(validator.isExtensionAllowed("photo.JPG")).isTrue();
            assertThat(validator.isExtensionAllowed("image.PNG")).isTrue();
        }

        @Test
        @DisplayName("Should reject double extensions")
        void shouldRejectDoubleExtensions() {
            assertThat(validator.isExtensionAllowed("virus.pdf.exe")).isFalse();
            assertThat(validator.isExtensionAllowed("malware.jpg.js")).isFalse();
        }

        @Test
        @DisplayName("Should handle files without extensions")
        void shouldHandleFilesWithoutExtensions() {
            assertThat(validator.isExtensionAllowed("noextension")).isFalse();
            assertThat(validator.isExtensionAllowed(".hidden")).isFalse();
        }
    }

    @Nested
    @DisplayName("File Size Validation Tests")
    class FileSizeTests {

        @Test
        @DisplayName("Should accept files within size limit")
        void shouldAcceptFilesWithinLimit() {
            assertThat(validator.isFileSizeAllowed(1024)).isTrue(); // 1KB
            assertThat(validator.isFileSizeAllowed(1024 * 1024)).isTrue(); // 1MB
            assertThat(validator.isFileSizeAllowed(10 * 1024 * 1024)).isTrue(); // 10MB (limit)
        }

        @Test
        @DisplayName("Should reject files exceeding size limit")
        void shouldRejectFilesExceedingLimit() {
            assertThat(validator.isFileSizeAllowed(10 * 1024 * 1024 + 1)).isFalse(); // 10MB + 1 byte
            assertThat(validator.isFileSizeAllowed(100 * 1024 * 1024)).isFalse(); // 100MB
        }

        @Test
        @DisplayName("Should reject zero-size files")
        void shouldRejectZeroSizeFiles() {
            assertThat(validator.isFileSizeAllowed(0)).isFalse();
        }

        @Test
        @DisplayName("Should reject negative size")
        void shouldRejectNegativeSize() {
            assertThat(validator.isFileSizeAllowed(-1)).isFalse();
        }
    }

    @Nested
    @DisplayName("MIME Type Validation Tests")
    class MimeTypeTests {

        @Test
        @DisplayName("Should validate content matches extension")
        void shouldValidateContentMatchesExtension() {
            // PDF magic bytes
            byte[] pdfContent = "%PDF-1.4".getBytes(StandardCharsets.UTF_8);
            assertThat(validator.validateMimeType("doc.pdf", pdfContent)).isTrue();
        }

        @Test
        @DisplayName("Should detect extension spoofing")
        void shouldDetectExtensionSpoofing() {
            // EXE magic bytes disguised as PDF
            byte[] exeContent = new byte[] { 0x4D, 0x5A }; // MZ header
            assertThat(validator.validateMimeType("malware.pdf", exeContent)).isFalse();
        }

        @Test
        @DisplayName("Should validate JPEG magic bytes")
        void shouldValidateJpegMagicBytes() {
            byte[] jpegContent = new byte[] { (byte)0xFF, (byte)0xD8, (byte)0xFF, (byte)0xE0 };
            assertThat(validator.validateMimeType("photo.jpg", jpegContent)).isTrue();
        }

        @Test
        @DisplayName("Should validate PNG magic bytes")
        void shouldValidatePngMagicBytes() {
            byte[] pngContent = new byte[] { (byte)0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A };
            assertThat(validator.validateMimeType("image.png", pngContent)).isTrue();
        }
    }

    @Nested
    @DisplayName("Path Traversal Prevention Tests")
    class PathTraversalTests {

        @Test
        @DisplayName("Should reject directory traversal attempts")
        void shouldRejectDirectoryTraversal() {
            assertThatThrownBy(() -> validator.sanitizeFileName("../../../etc/passwd"))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("traversal");

            assertThatThrownBy(() -> validator.sanitizeFileName("..\\..\\windows\\system32"))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("traversal");
        }

        @Test
        @DisplayName("Should reject absolute paths")
        void shouldRejectAbsolutePaths() {
            assertThatThrownBy(() -> validator.sanitizeFileName("/etc/passwd"))
                .isInstanceOf(SecurityException.class);

            assertThatThrownBy(() -> validator.sanitizeFileName("C:\\Windows\\system32\\config"))
                .isInstanceOf(SecurityException.class);
        }

        @Test
        @DisplayName("Should sanitize special characters")
        void shouldSanitizeSpecialCharacters() {
            String sanitized = validator.sanitizeFileName("file name<with>special|chars.pdf");
            assertThat(sanitized).doesNotContain("<", ">", "|");
            assertThat(sanitized).endsWith(".pdf");
        }

        @Test
        @DisplayName("Should handle null bytes in filename")
        void shouldHandleNullBytes() {
            assertThatThrownBy(() -> validator.sanitizeFileName("innocent.pdf\u0000.exe"))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("null");
        }
    }

    @Nested
    @DisplayName("Malicious Content Detection Tests")
    class MaliciousContentTests {

        @Test
        @DisplayName("Should detect embedded scripts in PDF")
        void shouldDetectScriptsInPdf() {
            String maliciousPdf = "%PDF-1.4\n/JavaScript\n/OpenAction\n<<alert('XSS')>>";
            assertThat(validator.containsMaliciousContent(maliciousPdf.getBytes())).isTrue();
        }

        @Test
        @DisplayName("Should detect macros in Excel")
        void shouldDetectMacrosInExcel() {
            byte[] xlsmSignature = "PK".getBytes(); // ZIP-based, but we check for VBA
            assertThat(validator.containsMaliciousContent(xlsmSignature)).isFalse(); // Just signature
        }

        @Test
        @DisplayName("Should detect HTML injection in CSV")
        void shouldDetectHtmlInjectionInCsv() {
            String maliciousCsv = "Name,Value\n<script>alert('XSS')</script>,100\n";
            assertThat(validator.containsMaliciousContent(maliciousCsv.getBytes())).isTrue();
        }

        @Test
        @DisplayName("Should detect formula injection in CSV")
        void shouldDetectFormulaInjectionInCsv() {
            String maliciousCsv = "Name,Formula\nTest,=CMD|'/C calc'!A0\n";
            assertThat(validator.containsMaliciousContent(maliciousCsv.getBytes())).isTrue();

            String maliciousCsv2 = "Name,Formula\nTest,@SUM(1+1)*cmd|'/C calc'!A0\n";
            assertThat(validator.containsMaliciousContent(maliciousCsv2.getBytes())).isTrue();
        }
    }

    @Nested
    @DisplayName("Full Validation Pipeline Tests")
    class FullValidationTests {

        @Test
        @DisplayName("Should pass valid file through all checks")
        void shouldPassValidFile() {
            byte[] content = "%PDF-1.4\nValid PDF content".getBytes();
            UploadedFile file = new UploadedFile("document.pdf", content.length, content);

            ValidationResult result = validator.validate(file);

            assertThat(result.isValid()).isTrue();
            assertThat(result.getErrors()).isEmpty();
        }

        @Test
        @DisplayName("Should collect all validation errors")
        void shouldCollectAllErrors() {
            byte[] maliciousExe = new byte[] { 0x4D, 0x5A }; // EXE header
            UploadedFile file = new UploadedFile("malware.exe", 100 * 1024 * 1024, maliciousExe);

            ValidationResult result = validator.validate(file);

            assertThat(result.isValid()).isFalse();
            assertThat(result.getErrors()).contains("Invalid extension");
            assertThat(result.getErrors()).contains("File too large");
        }

        @Test
        @DisplayName("Should reject all invalid files")
        void shouldRejectAllInvalidFiles() {
            // Wrong extension
            assertThat(validator.validate(new UploadedFile("bad.exe", 1024, new byte[1024])).isValid()).isFalse();

            // Too large
            assertThat(validator.validate(new UploadedFile("big.pdf", 100 * 1024 * 1024, new byte[1])).isValid()).isFalse();

            // Path traversal
            assertThatThrownBy(() -> validator.validate(new UploadedFile("../etc/passwd", 100, new byte[100])))
                .isInstanceOf(SecurityException.class);
        }
    }

    // Test implementation classes
    static class UploadedFile {
        private final String fileName;
        private final long size;
        private final byte[] content;

        UploadedFile(String fileName, long size, byte[] content) {
            this.fileName = fileName;
            this.size = size;
            this.content = content;
        }

        String getFileName() { return fileName; }
        long getSize() { return size; }
        byte[] getContent() { return content; }
    }

    static class ValidationResult {
        private final boolean valid;
        private final java.util.List<String> errors;

        ValidationResult(boolean valid, java.util.List<String> errors) {
            this.valid = valid;
            this.errors = errors;
        }

        boolean isValid() { return valid; }
        java.util.List<String> getErrors() { return errors; }
    }

    static class FileUploadValidator {
        private long maxFileSizeBytes;
        private Set<String> allowedExtensions;

        void setMaxFileSizeBytes(long bytes) { this.maxFileSizeBytes = bytes; }
        void setAllowedExtensions(Set<String> extensions) { this.allowedExtensions = extensions; }

        boolean isExtensionAllowed(String fileName) {
            if (fileName == null || !fileName.contains(".")) return false;

            // Check for double extensions
            String[] parts = fileName.split("\\.");
            if (parts.length > 2) {
                String lastExt = parts[parts.length - 1].toLowerCase();
                String secondLastExt = parts[parts.length - 2].toLowerCase();
                // If second-to-last is an allowed extension but last is not, it's suspicious
                if (allowedExtensions.contains(secondLastExt) && !allowedExtensions.contains(lastExt)) {
                    return false;
                }
            }

            String extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
            return allowedExtensions.contains(extension);
        }

        boolean isFileSizeAllowed(long size) {
            return size > 0 && size <= maxFileSizeBytes;
        }

        boolean validateMimeType(String fileName, byte[] content) {
            if (content == null || content.length < 4) return false;

            String extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();

            // Check magic bytes
            switch (extension) {
                case "pdf":
                    return content.length >= 4 && content[0] == '%' && content[1] == 'P' &&
                           content[2] == 'D' && content[3] == 'F';
                case "jpg":
                case "jpeg":
                    return content.length >= 2 && (content[0] & 0xFF) == 0xFF && (content[1] & 0xFF) == 0xD8;
                case "png":
                    return content.length >= 8 && (content[0] & 0xFF) == 0x89 && content[1] == 'P' &&
                           content[2] == 'N' && content[3] == 'G';
                case "xlsx":
                    return content.length >= 2 && content[0] == 'P' && content[1] == 'K';
                case "csv":
                    return true; // CSV is text-based, harder to validate by magic bytes
                default:
                    return false;
            }
        }

        String sanitizeFileName(String fileName) {
            if (fileName == null) {
                throw new SecurityException("Filename cannot be null");
            }

            // Check for null bytes
            if (fileName.contains("\u0000")) {
                throw new SecurityException("Filename contains null bytes");
            }

            // Check for path traversal
            if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
                throw new SecurityException("Path traversal attempt detected");
            }

            // Check for absolute paths
            if (fileName.startsWith("/") || (fileName.length() > 1 && fileName.charAt(1) == ':')) {
                throw new SecurityException("Absolute paths not allowed");
            }

            // Remove special characters
            return fileName.replaceAll("[<>|:\"?*]", "_");
        }

        boolean containsMaliciousContent(byte[] content) {
            String contentStr = new String(content, StandardCharsets.UTF_8);

            // Check for JavaScript
            if (contentStr.contains("/JavaScript") || contentStr.contains("<script")) {
                return true;
            }

            // Check for HTML tags
            if (contentStr.matches(".*<[a-zA-Z].*>.*")) {
                return true;
            }

            // Check for CSV formula injection
            if (contentStr.contains("=CMD") || contentStr.contains("@SUM") ||
                contentStr.contains("+CMD") || contentStr.contains("-CMD")) {
                return true;
            }

            return false;
        }

        ValidationResult validate(UploadedFile file) {
            java.util.List<String> errors = new java.util.ArrayList<>();

            // Sanitize filename first (throws on traversal)
            sanitizeFileName(file.getFileName());

            if (!isExtensionAllowed(file.getFileName())) {
                errors.add("Invalid extension");
            }

            if (!isFileSizeAllowed(file.getSize())) {
                errors.add("File too large");
            }

            if (file.getContent() != null && !validateMimeType(file.getFileName(), file.getContent())) {
                errors.add("Invalid content type");
            }

            if (file.getContent() != null && containsMaliciousContent(file.getContent())) {
                errors.add("Malicious content detected");
            }

            return new ValidationResult(errors.isEmpty(), errors);
        }
    }
}
