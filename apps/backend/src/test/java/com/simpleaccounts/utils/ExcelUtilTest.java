package com.simpleaccounts.utils;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.springframework.web.multipart.MultipartFile;

public class ExcelUtilTest {

    private ExcelUtil excelUtil;

    @Before
    public void setUp() {
        excelUtil = new ExcelUtil();
    }

    @Test
    @Ignore("Skipped due to Apache POI / Java 17 compatibility issue with ZipSecureFile")
    public void testGetDataFromExcel() throws IOException {
        // 1. Create a real temporary Excel file with known data
        File tempExcel = File.createTempFile("test-excel", ".xlsx");
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Test");
            
            // Header Row
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Name");
            header.createCell(1).setCellValue("Age");

            // Data Row
            Row data = sheet.createRow(1);
            data.createCell(0).setCellValue("John Doe");
            data.createCell(1).setCellValue("30");

            try (FileOutputStream fos = new FileOutputStream(tempExcel)) {
                workbook.write(fos);
            }
        }

        // 2. Mock MultipartFile to "transfer" our temp file content
        MultipartFile multipartFile = mock(MultipartFile.class);
        when(multipartFile.getName()).thenReturn("test-excel");
        
        // When transferTo is called, we copy our tempExcel to the destination
        doAnswer(invocation -> {
            File dest = (File) invocation.getArguments()[0];
            // Just copy the file simply
            java.nio.file.Files.copy(tempExcel.toPath(), dest.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            return null;
        }).when(multipartFile).transferTo(any(File.class));

        // 3. Execute
        Map<String, List<String>> result = excelUtil.getDataFromExcel(multipartFile);

        // 4. Verify
        assertNotNull(result);
        assertEquals("Should have 2 columns", 2, result.size());
        
        List<String> names = result.get("Name");
        assertNotNull(names);
        assertEquals("Should have 1 data row for Name", 1, names.size());
        assertEquals("John Doe", names.get(0));

        List<String> ages = result.get("Age");
        assertNotNull(ages);
        assertEquals("30", ages.get(0));
        
        // Cleanup
        tempExcel.delete();
    }
}
