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
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
@DisplayName("CsvParser Tests")
class CsvParserTest {

    @Mock
    private DateFormatDao dateFormatDao;

    private CsvParser csvParser;

    @BeforeEach
    void setUp() {
        csvParser = new CsvParser(dateFormatDao);
    }

    @Nested
    @DisplayName("parseImportData Tests")
    class ParseImportDataTests {

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("Should normalize amounts and strip quotes when parsing import data")
        void shouldNormalizeAmountsAndStripQuotesWhenParsingImportData() {
            // given
            TransactionParsingSettingDetailModel model = buildModelWithIndices();
            model.setDateFormatId(42);

            DateFormat dateFormat = new DateFormat();
            dateFormat.setFormat("dd/MM/yyyy");
            when(dateFormatDao.findByPK(42)).thenReturn(dateFormat);

            String csv = "Date,Description,Debit Amount,Credit Amount\n"
                    + "01/12/2024,\"Payment, REF\",123.50,\"45,00\"";
            InputStream stream = new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8));

            // when
            Map<String, Object> result = csvParser.parseImportData(model, stream);

            // then
            List<Map<String, String>> rows = (List<Map<String, String>>) result.get("data");
            assertThat(rows).hasSize(1);
            Map<String, String> firstRow = rows.get(0);
            assertThat(firstRow).containsEntry("Transaction Date", "01/12/2024");
            assertThat(firstRow).containsEntry("Description", "\"Payment, REF\"");
            assertThat(firstRow).containsEntry("Debit Amount", "123.50");
            assertThat(firstRow).containsEntry("Credit Amount", "4500");
            assertThat(result.get("error")).isNull();
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("Should flag invalid dates in error list")
        void shouldFlagInvalidDatesInErrorList() {
            // given
            TransactionParsingSettingDetailModel model = buildModelWithIndices();
            model.setDateFormatId(99);

            DateFormat dateFormat = new DateFormat();
            dateFormat.setFormat("dd/MM/yyyy");
            when(dateFormatDao.findByPK(99)).thenReturn(dateFormat);

            String csv = "Date,Description,Debit Amount,Credit Amount\n"
                    + "2024-12-01,Invalid date,10,0";
            InputStream stream = new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8));

            // when
            Map<String, Object> result = csvParser.parseImportData(model, stream);

            // then
            List<String> errors = (List<String>) result.get("error");
            assertThat(errors).isNotNull();
            assertThat(errors).contains("1,0");
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("Should handle empty amounts by setting to zero")
        void shouldHandleEmptyAmountsBySettingToZero() {
            // given
            TransactionParsingSettingDetailModel model = buildModelWithIndices();
            model.setDateFormatId(1);

            DateFormat dateFormat = new DateFormat();
            dateFormat.setFormat("dd/MM/yyyy");
            when(dateFormatDao.findByPK(1)).thenReturn(dateFormat);

            String csv = "Date,Description,Debit Amount,Credit Amount\n"
                    + "01/01/2024,Test,   ,";
            InputStream stream = new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8));

            // when
            Map<String, Object> result = csvParser.parseImportData(model, stream);

            // then
            List<Map<String, String>> rows = (List<Map<String, String>>) result.get("data");
            assertThat(rows).hasSize(1);
            assertThat(rows.get(0).get("Debit Amount")).isEqualTo("0");
            assertThat(rows.get(0).get("Credit Amount")).isEqualTo("0");
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("Should handle multiple rows")
        void shouldHandleMultipleRows() {
            // given
            TransactionParsingSettingDetailModel model = buildModelWithIndices();
            model.setDateFormatId(1);

            DateFormat dateFormat = new DateFormat();
            dateFormat.setFormat("dd/MM/yyyy");
            when(dateFormatDao.findByPK(1)).thenReturn(dateFormat);

            String csv = "Date,Description,Debit Amount,Credit Amount\n"
                    + "01/01/2024,Row1,100,0\n"
                    + "02/01/2024,Row2,0,200\n"
                    + "03/01/2024,Row3,50,50";
            InputStream stream = new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8));

            // when
            Map<String, Object> result = csvParser.parseImportData(model, stream);

            // then
            List<Map<String, String>> rows = (List<Map<String, String>>) result.get("data");
            assertThat(rows).hasSize(3);
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("Should handle amounts with thousand separator")
        void shouldHandleAmountsWithThousandSeparator() {
            // given
            TransactionParsingSettingDetailModel model = buildModelWithIndices();
            model.setDateFormatId(1);

            DateFormat dateFormat = new DateFormat();
            dateFormat.setFormat("dd/MM/yyyy");
            when(dateFormatDao.findByPK(1)).thenReturn(dateFormat);

            String csv = "Date,Description,Debit Amount,Credit Amount\n"
                    + "01/01/2024,Test,\"1,234.56\",\"2,000\"";
            InputStream stream = new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8));

            // when
            Map<String, Object> result = csvParser.parseImportData(model, stream);

            // then
            List<Map<String, String>> rows = (List<Map<String, String>>) result.get("data");
            assertThat(rows).hasSize(1);
            // Commas are removed from quoted amounts
            assertThat(rows.get(0).get("Debit Amount")).isEqualTo("1234.56");
        }

        @Test
        @DisplayName("Should return empty map when IOException occurs")
        void shouldReturnEmptyMapWhenIOExceptionOccurs() {
            // given
            TransactionParsingSettingDetailModel model = buildModelWithIndices();
            model.setDateFormatId(null);

            // Providing a null stream would cause issues internally
            InputStream badStream = new InputStream() {
                @Override
                public int read() throws java.io.IOException {
                    throw new java.io.IOException("Test exception");
                }
            };

            // when
            Map<String, Object> result = csvParser.parseImportData(model, badStream);

            // then
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("parseSample Tests")
    class ParseSampleTests {

        @Test
        @DisplayName("Should parse sample CSV correctly")
        void shouldParseSampleCsvCorrectly() throws Exception {
            // given
            String csvContent = "Header1,Header2,Header3\nValue1,Value2,Value3\nA,B,C";
            MultipartFile mockFile = mock(MultipartFile.class);
            when(mockFile.getInputStream()).thenReturn(
                    new ByteArrayInputStream(csvContent.getBytes(StandardCharsets.UTF_8)));

            TransactionParsingSettingPersistModel model = new TransactionParsingSettingPersistModel();
            model.setFile(mockFile);

            // when
            List<Map<String, String>> result = csvParser.parseSmaple(model);

            // then
            assertThat(result).hasSize(2);
            assertThat(result.get(0)).containsEntry("Header1", "Value1");
            assertThat(result.get(0)).containsEntry("Header2", "Value2");
            assertThat(result.get(0)).containsEntry("Header3", "Value3");
        }

        @Test
        @DisplayName("Should handle mismatched column counts in rows")
        void shouldHandleMismatchedColumnCountsInRows() throws Exception {
            // given
            String csvContent = "Col1,Col2,Col3\nVal1,Val2";
            MultipartFile mockFile = mock(MultipartFile.class);
            when(mockFile.getInputStream()).thenReturn(
                    new ByteArrayInputStream(csvContent.getBytes(StandardCharsets.UTF_8)));

            TransactionParsingSettingPersistModel model = new TransactionParsingSettingPersistModel();
            model.setFile(mockFile);

            // when
            List<Map<String, String>> result = csvParser.parseSmaple(model);

            // then
            assertThat(result).hasSize(1);
            // Missing columns should be filled with "-"
            assertThat(result.get(0)).containsEntry("Col1", "Val1");
            assertThat(result.get(0)).containsEntry("Col2", "Val2");
        }
    }

    @Nested
    @DisplayName("getModelListFromFile Tests")
    class GetModelListFromFileTests {

        @Test
        @DisplayName("Should return empty list (stub implementation)")
        void shouldReturnEmptyList() {
            // given
            TransactionParsingSettingDetailModel model = new TransactionParsingSettingDetailModel();
            MultipartFile file = mock(MultipartFile.class);

            // when
            var result = csvParser.getModelListFromFile(model, file, 1);

            // then
            assertThat(result).isEmpty();
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
            Map<Integer, Set<Integer>> result = csvParser.addErrorCellInRow(errorMap, 1, 2);

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
            Map<Integer, Set<Integer>> result = csvParser.addErrorCellInRow(errorMap, 1, 3);

            // then
            assertThat(result.get(1)).containsExactlyInAnyOrder(1, 3);
        }

        @Test
        @DisplayName("Should not duplicate cells in same row")
        void shouldNotDuplicateCellsInSameRow() {
            // given
            Map<Integer, Set<Integer>> errorMap = new HashMap<>();
            errorMap.put(1, new HashSet<>());
            errorMap.get(1).add(2);

            // when
            Map<Integer, Set<Integer>> result = csvParser.addErrorCellInRow(errorMap, 1, 2);

            // then
            assertThat(result.get(1)).hasSize(1);
            assertThat(result.get(1)).contains(2);
        }

        @Test
        @DisplayName("Should handle multiple rows with multiple cells")
        void shouldHandleMultipleRowsWithMultipleCells() {
            // given
            Map<Integer, Set<Integer>> errorMap = new HashMap<>();

            // when
            csvParser.addErrorCellInRow(errorMap, 1, 0);
            csvParser.addErrorCellInRow(errorMap, 1, 1);
            csvParser.addErrorCellInRow(errorMap, 2, 0);

            // then
            assertThat(errorMap).hasSize(2);
            assertThat(errorMap.get(1)).containsExactlyInAnyOrder(0, 1);
            assertThat(errorMap.get(2)).containsExactly(0);
        }
    }

    @Nested
    @DisplayName("Quote Handling Tests")
    class QuoteHandlingTests {

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("Should preserve quoted fields with commas")
        void shouldPreserveQuotedFieldsWithCommas() {
            // given
            TransactionParsingSettingDetailModel model = buildModelWithIndices();
            model.setDateFormatId(1);

            DateFormat dateFormat = new DateFormat();
            dateFormat.setFormat("dd/MM/yyyy");
            when(dateFormatDao.findByPK(1)).thenReturn(dateFormat);

            String csv = "Date,Description,Debit Amount,Credit Amount\n"
                    + "01/01/2024,\"Description, with, commas\",100,50";
            InputStream stream = new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8));

            // when
            Map<String, Object> result = csvParser.parseImportData(model, stream);

            // then
            List<Map<String, String>> rows = (List<Map<String, String>>) result.get("data");
            assertThat(rows).hasSize(1);
            assertThat(rows.get(0).get("Description")).contains("Description, with, commas");
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("Should handle escaped quotes within quoted fields")
        void shouldHandleEscapedQuotesWithinQuotedFields() {
            // given
            TransactionParsingSettingDetailModel model = buildModelWithIndices();
            model.setDateFormatId(1);

            DateFormat dateFormat = new DateFormat();
            dateFormat.setFormat("dd/MM/yyyy");
            when(dateFormatDao.findByPK(1)).thenReturn(dateFormat);

            String csv = "Date,Description,Debit Amount,Credit Amount\n"
                    + "01/01/2024,\"He said \"\"Hello\"\"\",100,50";
            InputStream stream = new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8));

            // when
            Map<String, Object> result = csvParser.parseImportData(model, stream);

            // then
            List<Map<String, String>> rows = (List<Map<String, String>>) result.get("data");
            assertThat(rows).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Edge Cases Tests")
    class EdgeCaseTests {

        @Test
        @DisplayName("Should handle empty CSV")
        void shouldHandleEmptyCsv() {
            // given
            TransactionParsingSettingDetailModel model = buildModelWithIndices();
            String csv = "";
            InputStream stream = new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8));

            // when
            Map<String, Object> result = csvParser.parseImportData(model, stream);

            // then
            assertThat(result).containsKey("data");
        }

        @Test
        @DisplayName("Should handle header-only CSV")
        void shouldHandleHeaderOnlyCsv() {
            // given
            TransactionParsingSettingDetailModel model = buildModelWithIndices();
            String csv = "Date,Description,Debit Amount,Credit Amount";
            InputStream stream = new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8));

            // when
            Map<String, Object> result = csvParser.parseImportData(model, stream);

            // then
            @SuppressWarnings("unchecked")
            List<Map<String, String>> rows = (List<Map<String, String>>) result.get("data");
            assertThat(rows).isEmpty();
        }
    }

    private TransactionParsingSettingDetailModel buildModelWithIndices() {
        TransactionParsingSettingDetailModel model = new TransactionParsingSettingDetailModel();
        Map<TransactionEnum, Integer> indexMap = new EnumMap<>(TransactionEnum.class);
        indexMap.put(TransactionEnum.TRANSACTION_DATE, 0);
        indexMap.put(TransactionEnum.DESCRIPTION, 1);
        indexMap.put(TransactionEnum.DR_AMOUNT, 2);
        indexMap.put(TransactionEnum.CR_AMOUNT, 3);
        model.setIndexMap(indexMap);
        return model;
    }
}
