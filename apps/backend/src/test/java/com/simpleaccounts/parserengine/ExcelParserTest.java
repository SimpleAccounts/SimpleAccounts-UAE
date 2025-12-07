package com.simpleaccounts.parserengine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.simpleaccounts.criteria.enums.TransactionEnum;
import com.simpleaccounts.dao.DateFormatDao;
import com.simpleaccounts.entity.DateFormat;
import com.simpleaccounts.rest.transactionparsingcontroller.TransactionParsingSettingDetailModel;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class ExcelParserTest {

    @Mock
    private DateFormatDao dateFormatDao;

    private ExcelParser excelParser;

    @BeforeEach
    void setUp() {
        excelParser = new ExcelParser();
        ReflectionTestUtils.setField(excelParser, "dateformatDao", dateFormatDao);
    }

    @SuppressWarnings("unchecked")
    @Test
    void parseImportDataShouldCoerceBlankAmountsToZeroAndReturnRows() throws IOException {
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

        Map<String, Object> result = excelParser.parseImportData(model, file);

        List<Map<String, String>> rows = (List<Map<String, String>>) result.get("data");
        assertThat(rows).hasSize(2);
        assertThat(rows.get(0))
                .containsEntry("Transaction Date", "01/12/2024")
                .containsEntry("Credit Amount", "0");

        List<String> errors = (List<String>) result.get("error");
        assertThat(errors).contains("2,0", "2,2");
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





