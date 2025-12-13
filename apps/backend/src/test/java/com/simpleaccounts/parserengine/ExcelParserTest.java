package com.simpleaccounts.parserengine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.simpleaccounts.criteria.enums.TransactionEnum;
import com.simpleaccounts.dao.DateFormatDao;
import com.simpleaccounts.entity.DateFormat;
import com.simpleaccounts.rest.transactionparsingcontroller.TransactionParsingSettingDetailModel;
import com.simpleaccounts.rest.transactionparsingcontroller.TransactionParsingSettingPersistModel;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
@DisplayName("ExcelParser Tests")
class ExcelParserTest {

    @Mock
    private DateFormatDao dateFormatDao;

    private ExcelParser excelParser;

    @BeforeEach
    void setUp() {
        excelParser = new ExcelParser(dateFormatDao);
    }

    @Nested
    @DisplayName("parseImportData Tests")
    class ParseImportDataTests {

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("Should coerce blank amounts to zero and return rows")
        void parseImportDataShouldCoerceBlankAmountsToZeroAndReturnRows() throws IOException {
            // given
            TransactionParsingSettingDetailModel model = buildModel();
            model.setDateFormatId(1);
            DateFormat format = new DateFormat();
            format.setFormat("dd/MM/yyyy");
            when(dateFormatDao.findByPK(1)).thenReturn(format);

            MockMultipartFile file = workbookWithRows(new String[][]{
                    {"Transaction Date", "Description", "Debit Amount", "Credit Amount"},
                    {"01/12/2024", "Valid row", "150.00", ""},
                    {"bad-date", "Broken amounts", "abc", "12"}
            });

            // when
            Map<String, Object> result = excelParser.parseImportData(model, file);

            // then
            List<Map<String, String>> rows = (List<Map<String, String>>) result.get("data");
            assertThat(rows).hasSize(2);
            assertThat(rows.get(0))
                    .containsEntry("Transaction Date", "01/12/2024")
                    .containsEntry("Credit Amount", "0");

            List<String> errors = (List<String>) result.get("error");
            assertThat(errors).contains("2,0", "2,2");
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("Should handle valid dates correctly")
        void shouldHandleValidDatesCorrectly() throws IOException {
            // given
            TransactionParsingSettingDetailModel model = buildModel();
            model.setDateFormatId(1);
            DateFormat format = new DateFormat();
            format.setFormat("dd/MM/yyyy");
            when(dateFormatDao.findByPK(1)).thenReturn(format);

            MockMultipartFile file = workbookWithRows(new String[][]{
                    {"Transaction Date", "Description", "Debit Amount", "Credit Amount"},
                    {"15/06/2024", "June payment", "500", "0"}
            });

            // when
            Map<String, Object> result = excelParser.parseImportData(model, file);

            // then
            List<Map<String, String>> rows = (List<Map<String, String>>) result.get("data");
            assertThat(rows).hasSize(1);
            assertThat(rows.get(0).get("Transaction Date")).isEqualTo("15/06/2024");

            List<String> errors = (List<String>) result.get("error");
            assertThat(errors).isEmpty();
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("Should handle null file gracefully")
        void shouldHandleNullFileGracefully() {
            // given
            TransactionParsingSettingDetailModel model = buildModel();

            // when
            Map<String, Object> result = excelParser.parseImportData(model, null);

            // then
            assertThat(result).isEmpty();
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("Should handle custom header row number")
        void shouldHandleCustomHeaderRowNumber() throws IOException {
            // given
            TransactionParsingSettingDetailModel model = buildModel();
            model.setHeaderRowNo(2); // Header is on row 2 (1-indexed)
            model.setDateFormatId(1);
            DateFormat format = new DateFormat();
            format.setFormat("dd/MM/yyyy");
            when(dateFormatDao.findByPK(1)).thenReturn(format);

            MockMultipartFile file = workbookWithRows(new String[][]{
                    {"Title row - ignore"},
                    {"Transaction Date", "Description", "Debit Amount", "Credit Amount"},
                    {"01/01/2024", "Data row", "100", "0"}
            });

            // when
            Map<String, Object> result = excelParser.parseImportData(model, file);

            // then
            List<Map<String, String>> rows = (List<Map<String, String>>) result.get("data");
            assertThat(rows).hasSize(1);
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("Should default header row to 0 when null")
        void shouldDefaultHeaderRowToZeroWhenNull() throws IOException {
            // given
            TransactionParsingSettingDetailModel model = buildModel();
            model.setHeaderRowNo(null);
            model.setDateFormatId(1);
            DateFormat format = new DateFormat();
            format.setFormat("dd/MM/yyyy");
            when(dateFormatDao.findByPK(1)).thenReturn(format);

            MockMultipartFile file = workbookWithRows(new String[][]{
                    {"Transaction Date", "Description", "Debit Amount", "Credit Amount"},
                    {"01/01/2024", "Data row", "100", "0"}
            });

            // when
            Map<String, Object> result = excelParser.parseImportData(model, file);

            // then
            List<Map<String, String>> rows = (List<Map<String, String>>) result.get("data");
            assertThat(rows).hasSize(1);
        }
    }

    @Nested
    @DisplayName("parseSample Tests")
    class ParseSampleTests {

        @Test
        @DisplayName("Should return empty list for null file")
        void shouldReturnEmptyListForNullFile() {
            // given
            TransactionParsingSettingPersistModel model = new TransactionParsingSettingPersistModel();
            model.setFile(null);

            // when
            List<Map<String, String>> result = excelParser.parseSmaple(model);

            // then
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Should parse sample excel correctly")
        void shouldParseSampleExcelCorrectly() throws IOException {
            // given
            TransactionParsingSettingPersistModel model = new TransactionParsingSettingPersistModel();
            model.setHeaderRowNo(1);
            model.setFile(workbookWithRows(new String[][]{
                    {"Header1", "Header2", "Header3"},
                    {"Value1", "Value2", "Value3"},
                    {"A", "B", "C"}
            }));

            // when
            List<Map<String, String>> result = excelParser.parseSmaple(model);

            // then
            assertThat(result).hasSize(2);
            assertThat(result.get(0)).containsEntry("Header1", "Value1");
        }

        @Test
        @DisplayName("Should default header row number when null")
        void shouldDefaultHeaderRowNumberWhenNull() throws IOException {
            // given
            TransactionParsingSettingPersistModel model = new TransactionParsingSettingPersistModel();
            model.setHeaderRowNo(null);
            model.setFile(workbookWithRows(new String[][]{
                    {"Col1", "Col2"},
                    {"Data1", "Data2"}
            }));

            // when
            List<Map<String, String>> result = excelParser.parseSmaple(model);

            // then
            assertThat(result).hasSize(1);
            assertThat(result.get(0)).containsEntry("Col1", "Data1");
        }
    }

    @Nested
    @DisplayName("getModelListFromFile Tests")
    class GetModelListFromFileTests {

        @Test
        @DisplayName("Should return null for null file")
        void shouldReturnNullForNullFile() {
            // given
            TransactionParsingSettingDetailModel model = buildModel();

            // when
            var result = excelParser.getModelListFromFile(model, null, 1);

            // then
            assertThat(result).isNull();
        }

        @Test
        @DisplayName("Should return list from valid file")
        void shouldReturnListFromValidFile() throws IOException {
            // given
            TransactionParsingSettingDetailModel model = buildModel();
            MockMultipartFile file = workbookWithRows(new String[][]{
                    {"Transaction Date", "Description", "Debit Amount", "Credit Amount"},
                    {"01/01/2024", "Test", "100", "0"}
            });

            // when
            var result = excelParser.getModelListFromFile(model, file, 1);

            // then
            assertThat(result).isNotNull();
        }
    }

    @Nested
    @DisplayName("isEmptyRow Tests")
    class IsEmptyRowTests {

        @Test
        @DisplayName("Should return true for row with only blank cells")
        void shouldReturnTrueForRowWithOnlyBlankCells() throws IOException {
            // given
            try (XSSFWorkbook workbook = new XSSFWorkbook()) {
                Sheet sheet = workbook.createSheet();
                Row row = sheet.createRow(0);
                row.createCell(0); // blank cell
                row.createCell(1); // blank cell

                // when
                boolean result = excelParser.isEmptyRow(row);

                // then
                assertThat(result).isTrue();
            }
        }

        @Test
        @DisplayName("Should return false for row with data")
        void shouldReturnFalseForRowWithData() throws IOException {
            // given
            try (XSSFWorkbook workbook = new XSSFWorkbook()) {
                Sheet sheet = workbook.createSheet();
                Row row = sheet.createRow(0);
                row.createCell(0).setCellValue("data");

                // when
                boolean result = excelParser.isEmptyRow(row);

                // then
                assertThat(result).isFalse();
            }
        }
    }

    @Nested
    @DisplayName("addErrorCellInRow Tests")
    class AddErrorCellInRowTests {

        @Test
        @DisplayName("Should add error cell to new row")
        void shouldAddErrorCellToNewRow() {
            // given
            Map<Integer, Set<Integer>> errorMap = new HashMap<>();

            // when
            Map<Integer, Set<Integer>> result = excelParser.addErrorCellInRow(errorMap, 1, 2);

            // then
            assertThat(result).containsKey(1);
            assertThat(result.get(1)).contains(2);
        }

        @Test
        @DisplayName("Should add error cell to existing row")
        void shouldAddErrorCellToExistingRow() {
            // given
            Map<Integer, Set<Integer>> errorMap = new HashMap<>();
            Set<Integer> existingCells = new HashSet<>();
            existingCells.add(1);
            errorMap.put(1, existingCells);

            // when
            Map<Integer, Set<Integer>> result = excelParser.addErrorCellInRow(errorMap, 1, 3);

            // then
            assertThat(result.get(1)).containsExactlyInAnyOrder(1, 3);
        }

        @Test
        @DisplayName("Should handle multiple rows and cells")
        void shouldHandleMultipleRowsAndCells() {
            // given
            Map<Integer, Set<Integer>> errorMap = new HashMap<>();

            // when
            excelParser.addErrorCellInRow(errorMap, 1, 0);
            excelParser.addErrorCellInRow(errorMap, 1, 1);
            excelParser.addErrorCellInRow(errorMap, 2, 0);

            // then
            assertThat(errorMap).hasSize(2);
            assertThat(errorMap.get(1)).containsExactlyInAnyOrder(0, 1);
            assertThat(errorMap.get(2)).contains(0);
        }
    }

    @Nested
    @DisplayName("Edge Cases Tests")
    class EdgeCaseTests {

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("Should skip empty rows in data")
        void shouldSkipEmptyRowsInData() throws IOException {
            // given
            TransactionParsingSettingDetailModel model = buildModel();
            model.setDateFormatId(1);
            DateFormat format = new DateFormat();
            format.setFormat("dd/MM/yyyy");
            when(dateFormatDao.findByPK(1)).thenReturn(format);

            // Create workbook with empty row in between
            try (XSSFWorkbook workbook = new XSSFWorkbook()) {
                Sheet sheet = workbook.createSheet("Sheet1");

                // Header row
                Row headerRow = sheet.createRow(0);
                headerRow.createCell(0).setCellValue("Transaction Date");
                headerRow.createCell(1).setCellValue("Description");
                headerRow.createCell(2).setCellValue("Debit Amount");
                headerRow.createCell(3).setCellValue("Credit Amount");

                // Data row
                Row dataRow = sheet.createRow(1);
                dataRow.createCell(0).setCellValue("01/01/2024");
                dataRow.createCell(1).setCellValue("Test");
                dataRow.createCell(2).setCellValue("100");
                dataRow.createCell(3).setCellValue("0");

                // Empty row
                sheet.createRow(2);

                // Another data row
                Row dataRow2 = sheet.createRow(3);
                dataRow2.createCell(0).setCellValue("02/01/2024");
                dataRow2.createCell(1).setCellValue("Test 2");
                dataRow2.createCell(2).setCellValue("200");
                dataRow2.createCell(3).setCellValue("0");

                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                workbook.write(outputStream);
                MockMultipartFile file = new MockMultipartFile(
                        "file",
                        "sample.xlsx",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        new ByteArrayInputStream(outputStream.toByteArray()));

                // when
                Map<String, Object> result = excelParser.parseImportData(model, file);

                // then
                List<Map<String, String>> rows = (List<Map<String, String>>) result.get("data");
                // Should skip empty row
                assertThat(rows).hasSize(2);
            }
        }

        @Test
        @DisplayName("Should handle large amounts")
        void shouldHandleLargeAmounts() throws IOException {
            // given
            TransactionParsingSettingDetailModel model = buildModel();
            model.setDateFormatId(1);
            DateFormat format = new DateFormat();
            format.setFormat("dd/MM/yyyy");
            when(dateFormatDao.findByPK(1)).thenReturn(format);

            MockMultipartFile file = workbookWithRows(new String[][]{
                    {"Transaction Date", "Description", "Debit Amount", "Credit Amount"},
                    {"01/01/2024", "Large amount", "9999999999.99", "0"}
            });

            // when
            @SuppressWarnings("unchecked")
            Map<String, Object> result = excelParser.parseImportData(model, file);

            // then
            @SuppressWarnings("unchecked")
            List<Map<String, String>> rows = (List<Map<String, String>>) result.get("data");
            assertThat(rows).hasSize(1);
            assertThat(rows.get(0).get("Debit Amount")).isEqualTo("9999999999.99");
        }
    }

    private TransactionParsingSettingDetailModel buildModel() {
        TransactionParsingSettingDetailModel model = new TransactionParsingSettingDetailModel();
        model.setHeaderRowNo(1);
        Map<TransactionEnum, Integer> indexMap = new EnumMap<>(TransactionEnum.class);
        indexMap.put(TransactionEnum.TRANSACTION_DATE, 0);
        indexMap.put(TransactionEnum.DESCRIPTION, 1);
        indexMap.put(TransactionEnum.DR_AMOUNT, 2);
        indexMap.put(TransactionEnum.CR_AMOUNT, 3);
        model.setIndexMap(indexMap);
        return model;
    }

    private MockMultipartFile workbookWithRows(String[][] rows) throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Sheet1");
            for (int i = 0; i < rows.length; i++) {
                Row row = sheet.createRow(i);
                for (int j = 0; j < rows[i].length; j++) {
                    Cell cell = row.createCell(j);
                    cell.setCellValue(rows[i][j]);
                }
            }
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return new MockMultipartFile(
                    "file",
                    "sample.xlsx",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    new ByteArrayInputStream(outputStream.toByteArray()));
        }
    }
}
