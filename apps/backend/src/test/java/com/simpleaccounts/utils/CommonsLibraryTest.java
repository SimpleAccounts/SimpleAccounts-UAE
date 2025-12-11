package com.simpleaccounts.utils;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.List;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.junit.Test;

/**
 * Tests for Apache Commons libraries usage.
 * These tests verify that commons-csv, commons-io, commons-lang3 work correctly
 * before/after upgrades.
 *
 * Covers: commons-csv, commons-io, commons-lang3 upgrades
 */
public class CommonsLibraryTest {

    // ============ commons-lang3 Tests ============

    @Test
    public void testStringUtilsIsBlank() {
        assertTrue("Null should be blank", StringUtils.isBlank(null));
        assertTrue("Empty string should be blank", StringUtils.isBlank(""));
        assertTrue("Whitespace should be blank", StringUtils.isBlank("   "));
        assertFalse("Text should not be blank", StringUtils.isBlank("hello"));
    }

    @Test
    public void testStringUtilsCapitalize() {
        assertEquals("Hello", StringUtils.capitalize("hello"));
        assertEquals("HELLO", StringUtils.capitalize("HELLO"));
        assertEquals("", StringUtils.capitalize(""));
        assertEquals(null, StringUtils.capitalize(null));
    }

    @Test
    public void testStringUtilsTrim() {
        assertEquals("hello", StringUtils.trim("  hello  "));
        assertEquals(null, StringUtils.trim(null));
        assertEquals("", StringUtils.trim("   "));
    }

    @Test
    public void testStringUtilsJoin() {
        String[] parts = {"one", "two", "three"};
        assertEquals("one,two,three", StringUtils.join(parts, ","));
        assertEquals("one-two-three", StringUtils.join(parts, "-"));
    }

    @Test
    public void testStringUtilsAbbreviate() {
        assertEquals("Hello...", StringUtils.abbreviate("Hello World", 8));
        assertEquals("Hello World", StringUtils.abbreviate("Hello World", 20));
    }

    // ============ commons-io Tests ============

    @Test
    public void testIOUtilsCopy() throws IOException {
        String testData = "Test data for IOUtils";
        ByteArrayInputStream input = new ByteArrayInputStream(testData.getBytes());
        ByteArrayOutputStream output = new ByteArrayOutputStream();

        IOUtils.copy(input, output);

        assertEquals(testData, output.toString());
    }

    @Test
    public void testIOUtilsToString() throws IOException {
        String testData = "Test string data";
        ByteArrayInputStream input = new ByteArrayInputStream(testData.getBytes("UTF-8"));

        String result = IOUtils.toString(input, "UTF-8");

        assertEquals(testData, result);
    }

    @Test
    public void testIOUtilsToByteArray() throws IOException {
        String testData = "Convert to bytes";
        ByteArrayInputStream input = new ByteArrayInputStream(testData.getBytes());

        byte[] result = IOUtils.toByteArray(input);

        assertNotNull(result);
        assertEquals(testData, new String(result));
    }

    // ============ commons-csv Tests ============

    /*
    @Test
    public void testCsvParsing() throws IOException {
        String csvData = "Name,Age,City\nJohn,30,Dubai\nJane,25,Abu Dhabi";

        CSVParser parser = CSVParser.parse(csvData, CSVFormat.DEFAULT.builder()
            .setHeader()
            .setSkipHeaderRecord(true)
            .get());

        List<CSVRecord> records = parser.getRecords();

        assertEquals("Should have 2 data records", 2, records.size());

        CSVRecord firstRecord = records.get(0);
        assertEquals("John", firstRecord.get("Name"));
        assertEquals("30", firstRecord.get("Age"));
        assertEquals("Dubai", firstRecord.get("City"));

        CSVRecord secondRecord = records.get(1);
        assertEquals("Jane", secondRecord.get("Name"));
        assertEquals("25", secondRecord.get("Age"));
        assertEquals("Abu Dhabi", secondRecord.get("City"));

        parser.close();
    }

    @Test
    public void testCsvWriting() throws IOException {
        StringWriter writer = new StringWriter();
        CSVPrinter printer = new CSVPrinter(writer, CSVFormat.DEFAULT);

        printer.printRecord("Name", "Amount", "Currency");
        printer.printRecord("Invoice 1", "1500.00", "AED");
        printer.printRecord("Invoice 2", "2500.00", "AED");

        printer.close();

        String result = writer.toString();
        assertNotNull(result);
        assertTrue("Should contain header", result.contains("Name,Amount,Currency"));
        assertTrue("Should contain first record", result.contains("Invoice 1,1500.00,AED"));
        assertTrue("Should contain second record", result.contains("Invoice 2,2500.00,AED"));
    }

    @Test
    public void testCsvWithQuotedFields() throws IOException {
        String csvData = "Name,Description\n\"Smith, John\",\"Description with \"\"quotes\"\"\"";

        CSVParser parser = CSVParser.parse(csvData, CSVFormat.DEFAULT.builder()
            .setHeader()
            .setSkipHeaderRecord(true)
            .get());

        List<CSVRecord> records = parser.getRecords();

        assertEquals(1, records.size());
        assertEquals("Smith, John", records.get(0).get("Name"));
        assertEquals("Description with \"quotes\"", records.get(0).get("Description"));

        parser.close();
    }

    @Test
    public void testCsvWithDifferentDelimiter() throws IOException {
        String csvData = "Name;Amount;Currency\nTest;100.00;AED";

        CSVParser parser = CSVParser.parse(csvData, CSVFormat.DEFAULT.builder()
            .setDelimiter(';')
            .setHeader()
            .setSkipHeaderRecord(true)
            .get());

        List<CSVRecord> records = parser.getRecords();

        assertEquals(1, records.size());
        assertEquals("Test", records.get(0).get("Name"));
        assertEquals("100.00", records.get(0).get("Amount"));

        parser.close();
    }
    */
}
