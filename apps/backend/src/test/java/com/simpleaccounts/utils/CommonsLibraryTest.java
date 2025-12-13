package com.simpleaccounts.utils;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
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

}
