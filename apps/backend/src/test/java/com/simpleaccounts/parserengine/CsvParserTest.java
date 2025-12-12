package com.simpleaccounts.parserengine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.simpleaccounts.criteria.enums.TransactionEnum;
import com.simpleaccounts.dao.DateFormatDao;
import com.simpleaccounts.entity.DateFormat;
import com.simpleaccounts.rest.transactionparsingcontroller.TransactionParsingSettingDetailModel;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class CsvParserTest {

    @Mock
    private DateFormatDao dateFormatDao;

    private CsvParser csvParser;

    @BeforeEach
    void setUp() {
        csvParser = new CsvParser(dateFormatDao);
    }

    @SuppressWarnings("unchecked")
    @Test
    void shouldNormalizeAmountsAndStripQuotesWhenParsingImportData() {
        TransactionParsingSettingDetailModel model = buildModelWithIndices();
        model.setDateFormatId(42);

        DateFormat dateFormat = new DateFormat();
        dateFormat.setFormat("dd/MM/yyyy");
        when(dateFormatDao.findByPK(42)).thenReturn(dateFormat);

        String csv = "Date,Description,Debit Amount,Credit Amount\n"
                + "01/12/2024,\"Payment, REF\",123.50,\"45,00\"";
        InputStream stream = new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8));

        Map<String, Object> result = csvParser.parseImportData(model, stream);
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
    void shouldFlagInvalidDatesInErrorList() {
        TransactionParsingSettingDetailModel model = buildModelWithIndices();
        model.setDateFormatId(99);

        DateFormat dateFormat = new DateFormat();
        dateFormat.setFormat("dd/MM/yyyy");
        when(dateFormatDao.findByPK(99)).thenReturn(dateFormat);

        String csv = "Date,Description,Debit Amount,Credit Amount\n"
                + "2024-12-01,Invalid date,10,0";
        InputStream stream = new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8));

        Map<String, Object> result = csvParser.parseImportData(model, stream);

        List<String> errors = (List<String>) result.get("error");
        assertThat(errors).isNotNull();
        assertThat(errors).contains("1,0");
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
