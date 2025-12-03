package com.simpleaccounts.utils;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.io.ByteArrayOutputStream;

import org.junit.Test;

import com.itextpdf.html2pdf.HtmlConverter;

/**
 * Tests for PDF generation using iText html2pdf.
 * These tests verify that PDF generation works correctly before/after iText upgrades.
 *
 * Covers: iText 7.x / html2pdf library upgrade
 */
public class PdfGenerationTest {

    @Test
    public void testSimpleHtmlToPdfConversion() throws Exception {
        String html = "<html><body><h1>Test PDF</h1><p>This is a test paragraph.</p></body></html>";

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        HtmlConverter.convertToPdf(html, outputStream);

        byte[] pdfBytes = outputStream.toByteArray();

        assertNotNull("PDF bytes should not be null", pdfBytes);
        assertTrue("PDF should have content", pdfBytes.length > 0);
        // PDF files start with %PDF
        assertTrue("Should be valid PDF format",
            pdfBytes[0] == '%' && pdfBytes[1] == 'P' && pdfBytes[2] == 'D' && pdfBytes[3] == 'F');
    }

    @Test
    public void testComplexHtmlWithTableToPdf() throws Exception {
        String html = "<html><body>" +
            "<h1>Invoice</h1>" +
            "<table border='1'>" +
            "<tr><th>Item</th><th>Quantity</th><th>Price</th></tr>" +
            "<tr><td>Product A</td><td>10</td><td>$100.00</td></tr>" +
            "<tr><td>Product B</td><td>5</td><td>$50.00</td></tr>" +
            "</table>" +
            "<p><strong>Total: $150.00</strong></p>" +
            "</body></html>";

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        HtmlConverter.convertToPdf(html, outputStream);

        byte[] pdfBytes = outputStream.toByteArray();

        assertNotNull("PDF bytes should not be null", pdfBytes);
        assertTrue("PDF should have substantial content for table", pdfBytes.length > 500);
    }

    @Test
    public void testHtmlWithCssStyling() throws Exception {
        String html = "<html><head>" +
            "<style>" +
            "body { font-family: Arial, sans-serif; }" +
            ".header { color: #2064d8; font-size: 24px; }" +
            ".amount { font-weight: bold; color: green; }" +
            "</style>" +
            "</head><body>" +
            "<div class='header'>SimpleAccounts Report</div>" +
            "<p>Amount Due: <span class='amount'>AED 1,500.00</span></p>" +
            "</body></html>";

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        HtmlConverter.convertToPdf(html, outputStream);

        byte[] pdfBytes = outputStream.toByteArray();

        assertNotNull("PDF with CSS should generate", pdfBytes);
        assertTrue("PDF should have content", pdfBytes.length > 0);
    }

    @Test
    public void testArabicTextInPdf() throws Exception {
        // Test RTL and Arabic text handling (important for UAE)
        String html = "<html><body>" +
            "<p dir='rtl'>مرحبا بكم في SimpleAccounts</p>" +
            "<p>Welcome to SimpleAccounts</p>" +
            "</body></html>";

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        HtmlConverter.convertToPdf(html, outputStream);

        byte[] pdfBytes = outputStream.toByteArray();

        assertNotNull("PDF with Arabic text should generate", pdfBytes);
        assertTrue("PDF should have content", pdfBytes.length > 0);
    }

    @Test(expected = com.itextpdf.kernel.PdfException.class)
    public void testEmptyHtml() throws Exception {
        // iText throws PdfException for empty HTML body (no pages generated)
        String html = "<html><body></body></html>";

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        HtmlConverter.convertToPdf(html, outputStream);
        // This should throw PdfException: "Document has no pages"
    }
}
