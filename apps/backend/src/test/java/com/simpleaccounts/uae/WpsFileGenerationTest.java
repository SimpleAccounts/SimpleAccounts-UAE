package com.simpleaccounts.uae;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.fail;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.Test;

public class WpsFileGenerationTest {

    private final WpsFileGenerator generator = new WpsFileGenerator();

    @Test
    public void shouldGenerateCsvMatchingFixture() throws IOException {
        List<WpsRecord> records = Arrays.asList(
            WpsRecord.builder()
                .employeeId("123456")
                .employeeName("Fatima Ali")
                .bankCode("NBD")
                .iban("AE070331234567890123456")
                .amount(BigDecimal.valueOf(7500.50))
                .build(),
            WpsRecord.builder()
                .employeeId("654321")
                .employeeName("Omar Bin Zayed")
                .bankCode("ADC")
                .iban("AE540331111111111111111")
                .amount(BigDecimal.valueOf(4200))
                .build()
        );

        String generated = generator.generate(records);
        String expected = new String(
            Files.readAllBytes(Paths.get("src/test/resources/data/uae/wps_expected.csv")),
            StandardCharsets.UTF_8).trim();

        assertEquals(expected, generated.trim());
    }

    @Test
    public void shouldRejectInvalidRecords() {
        assertThrows(() -> generator.generate(Collections.emptyList()));
        assertThrows(() -> generator.generate(Collections.singletonList(
            WpsRecord.builder()
                .employeeId("12AB")
                .employeeName("Invalid Id")
                .bankCode("NBD")
                .iban("AE070331234567890123456")
                .amount(BigDecimal.TEN)
                .build()
        )));

        assertThrows(() -> generator.generate(Collections.singletonList(
            WpsRecord.builder()
                .employeeId("123456")
                .employeeName("Bad IBAN")
                .bankCode("NB")
                .iban("DE123")
                .amount(BigDecimal.TEN.negate())
                .build()
        )));
    }

    private void assertThrows(Runnable runnable) {
        try {
            runnable.run();
            fail("Expected IllegalArgumentException");
        } catch (IllegalArgumentException expected) {
            String message = expected.getMessage();
            assertFalse(message.isEmpty());
        }
    }
}

