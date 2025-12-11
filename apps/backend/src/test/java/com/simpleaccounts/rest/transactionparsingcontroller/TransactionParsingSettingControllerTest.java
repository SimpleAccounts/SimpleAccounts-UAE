package com.simpleaccounts.rest.transactionparsingcontroller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.parserengine.CsvParser;
import com.simpleaccounts.parserengine.ExcelParser;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.TransactionParsingSettingService;
import com.simpleaccounts.utils.FileHelper;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

@ExtendWith(MockitoExtension.class)
class TransactionParsingSettingControllerTest {

    @Mock
    private JwtTokenUtil jwtTokenUtil;
    @Mock
    private TransactionParsingSettingRestHelper transactionParsingRestHelper;
    @Mock
    private TransactionParsingSettingService transactionParsingSettingService;
    @Mock
    private CsvParser csvParser;
    @Mock
    private ExcelParser excelParser;
    @Mock
    private FileHelper fileHelper;

    @InjectMocks
    private TransactionParsingSettingController controller;

    @Test
    void parseShouldDelegateToCsvParserWhenExtensionIsCsv() {
        TransactionParsingSettingPersistModel model = buildModel("sample.csv");
        List<Map<String, String>> rows =
                Collections.singletonList(Collections.singletonMap("col", "value"));
        when(fileHelper.getFileExtension("sample.csv")).thenReturn("csv");
        when(csvParser.parseSmaple(model)).thenReturn(rows);

        ResponseEntity<List<Map<String, String>>> response = controller.getDateFormat(model);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactlyElementsOf(rows);
        verify(csvParser).parseSmaple(model);
        verify(excelParser, never()).parseSmaple(model);
    }

    @Test
    void parseShouldUseExcelParserForXlsxFiles() {
        TransactionParsingSettingPersistModel model = buildModel("upload.xlsx");
        Map<String, String> row = new HashMap<>();
        row.put("amount", "100.00");
        List<Map<String, String>> rows = Collections.singletonList(row);
        when(fileHelper.getFileExtension("upload.xlsx")).thenReturn("xlsx");
        when(excelParser.parseSmaple(model)).thenReturn(rows);

        ResponseEntity<List<Map<String, String>>> response = controller.getDateFormat(model);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(rows);
        verify(excelParser).parseSmaple(model);
        verify(csvParser, never()).parseSmaple(model);
    }

    @Test
    void parseShouldReturnInternalServerErrorWhenParserReturnsNull() {
        TransactionParsingSettingPersistModel model = buildModel("bad_file.csv");
        when(fileHelper.getFileExtension("bad_file.csv")).thenReturn("csv");
        when(csvParser.parseSmaple(model)).thenReturn(null);

        ResponseEntity<List<Map<String, String>>> response = controller.getDateFormat(model);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Test
    void parseShouldReturnInternalServerErrorForUnsupportedExtension() {
        TransactionParsingSettingPersistModel model = buildModel("unknown.txt");
        when(fileHelper.getFileExtension("unknown.txt")).thenReturn("txt");

        ResponseEntity<List<Map<String, String>>> response = controller.getDateFormat(model);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        verify(csvParser, never()).parseSmaple(model);
        verify(excelParser, never()).parseSmaple(model);
    }

    private TransactionParsingSettingPersistModel buildModel(String filename) {
        MockMultipartFile multipartFile =
                new MockMultipartFile("file", filename, "text/plain", "col_a,col_b".getBytes());
        TransactionParsingSettingPersistModel model = new TransactionParsingSettingPersistModel();
        model.setFile(multipartFile);
        return model;
    }
}








